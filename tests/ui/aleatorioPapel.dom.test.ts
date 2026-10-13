// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { BLOQUES } from '../../src/content/temas/tema-02/formulas.ts';
import { mostrar, LABORATORIOS } from '../../src/domain/tema2/laboratorio.ts';
import { formaDespejada, sustitucion } from '../../src/ui/views/tema2/laboratorio.ts';
import { ejercicioAleatorio, formulasAleatorias, htmlAleatorioPapel, montarAleatorioPapel } from '../../src/ui/views/tema2/aleatorioPapel.ts';

describe('fase D · ejercicio aleatorio', () => {
  it('cada bloque genera ejercicios válidos de todas sus fórmulas, reproducibles por su número', () => {
    for (const b of BLOQUES) {
      const vistas = new Set<string>();
      for (let s = 1; s <= 200; s++) {
        const ej = ejercicioAleatorio(b.id, s)!;
        expect(ej, `${b.id} · ${s}`).not.toBeNull();
        expect(Number.isFinite(ej.resultado)).toBe(true);
        expect(ejercicioAleatorio(b.id, s)).toEqual(ej);
        vistas.add(ej.formula);
      }
      expect([...vistas].sort()).toEqual(formulasAleatorias(b.id).sort());
    }
  });

  it('se comprueba, desbloquea las ayudas tras el primer intento y genera otro', () => {
    const raiz = document.createElement('div');
    raiz.innerHTML = htmlAleatorioPapel('simple');
    document.body.append(raiz);
    montarAleatorioPapel(raiz);
    const art = raiz.querySelector<HTMLElement>('[data-aleatorio]')!;
    const ej = ejercicioAleatorio('simple', Number(art.dataset.semilla))!;
    expect(raiz.querySelector('[data-al-enunciado]')!.textContent).toBe(ej.enunciado);
    const campo = raiz.querySelector<HTMLInputElement>('[data-al-campo]')!;
    const enviar = () => raiz.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    const solucion = raiz.querySelector<HTMLButtonElement>('[data-al-pista="solucion"]')!;
    expect(solucion.disabled).toBe(true);
    campo.value = '1';
    enviar();
    expect(raiz.querySelector('[data-al-feedback]')!.textContent).toContain('Todavía no');
    expect(solucion.disabled).toBe(false);
    solucion.click();
    expect(raiz.querySelector<HTMLElement>('[data-al-solucion]')!.hidden).toBe(false);
    campo.value = mostrar(ej.resultado, LABORATORIOS[ej.formula]!.incognita.magnitud);
    enviar();
    expect(raiz.querySelector('[data-al-feedback]')!.textContent).toContain('Correcto');
    raiz.querySelector<HTMLButtonElement>('[data-al-otro]')!.click();
    expect(art.dataset.semilla).not.toBe(String(ej.semilla));
    expect(campo.value).toBe('');
    const togglePeriodos = raiz.querySelector<HTMLInputElement>('[data-al-todos-periodos]')!;
    expect(togglePeriodos.checked).toBe(false);
    togglePeriodos.checked = true;
    togglePeriodos.dispatchEvent(new Event('change', { bubbles: true }));
    expect(localStorage.getItem('fa-lab-todos-periodos')).toBe('true');
    const nuevaSemilla = Number(art.dataset.semilla);
    expect(raiz.querySelector('[data-al-enunciado]')!.textContent).toBe(ejercicioAleatorio('simple', nuevaSemilla, { todosLosPeriodos: true })!.enunciado);
  });

  it('se resuelve en digital (hoja guiada o Pro) o en analógico (papel), con calculadora', () => {
    localStorage.clear();
    const raiz = document.createElement('div');
    raiz.innerHTML = htmlAleatorioPapel('simple');
    document.body.append(raiz);
    montarAleatorioPapel(raiz);
    const art = raiz.querySelector<HTMLElement>('[data-aleatorio]')!;
    const zona = (m: string) => raiz.querySelector<HTMLElement>(`[data-al-zona="${m}"]`)!;
    expect(art.dataset.modo).toBe('digital');
    expect(zona('digital').hidden).toBe(false);
    expect(zona('analogico').hidden).toBe(true);
    // La hoja: las 19 fórmulas; al elegir la del ejercicio, pide sus datos y «Calcular» rellena la respuesta.
    const ej = ejercicioAleatorio('simple', Number(art.dataset.semilla))!;
    const sel = raiz.querySelector<HTMLSelectElement>('[data-hoja] select[data-campo="formula"]')!;
    expect(sel.options.length).toBe(20);
    sel.value = ej.formula;
    sel.dispatchEvent(new Event('change', { bubbles: true }));
    for (const [s, v] of Object.entries(ej.datos)) {
      const c = raiz.querySelector<HTMLInputElement>(`[data-hoja] [data-campo="dato:${s}"]`)!;
      c.value = v;
      c.dispatchEvent(new Event('input', { bubbles: true }));
    }
    raiz.querySelector<HTMLButtonElement>('[data-lab-calcular]')!.click();
    const campo = raiz.querySelector<HTMLInputElement>('[data-al-campo]')!;
    expect(campo.value).toBe(mostrar(ej.resultado, LABORATORIOS[ej.formula]!.incognita.magnitud));
    raiz.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(raiz.querySelector('[data-al-feedback]')!.textContent).toContain('Correcto');
    // Analógico: el papel, y la calculadora lleva allí sus operaciones.
    raiz.querySelector<HTMLButtonElement>('[data-al-modo="analogico"]')!.click();
    expect(zona('analogico').hidden).toBe(false);
    expect(zona('digital').hidden).toBe(true);
    const entrada = raiz.querySelector<HTMLInputElement>('[data-cal-entrada]')!;
    entrada.value = '2 + 3';
    entrada.dispatchEvent(new Event('input', { bubbles: true }));
    raiz.querySelector<HTMLButtonElement>('[data-cal-accion="igual"]')!.click();
    raiz.querySelector<HTMLButtonElement>('[data-cal-enviar]')!.click();
    expect(raiz.querySelector<HTMLTextAreaElement>('[data-al-papel="operaciones"]')!.value).toBe('2 + 3 = 5,00');
    // Otro ejercicio: hoja y papel en blanco.
    raiz.querySelector<HTMLButtonElement>('[data-al-otro]')!.click();
    expect(raiz.querySelector<HTMLTextAreaElement>('[data-al-papel="operaciones"]')!.value).toBe('');
    expect(raiz.querySelector<HTMLSelectElement>('[data-hoja] select[data-campo="formula"]')!.value).toBe('');
  });

  it('la solución sustituye los números en la forma despejada de cada fórmula', () => {
    for (const [id, lab] of Object.entries(LABORATORIOS)) {
      const forma = formaDespejada(id, lab.incognita.simbolo);
      expect(forma.startsWith(`${lab.incognita.simbolo} = `), id).toBe(true);
      const valores = Object.fromEntries(lab.datos.map((d, k) => [d.simbolo, `${k + 7}7`]));
      const con = sustitucion(forma, valores);
      for (const v of Object.values(valores)) expect(con, id).toContain(`"${v}"`);
    }
  });
});
