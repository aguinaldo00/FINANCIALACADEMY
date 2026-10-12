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
