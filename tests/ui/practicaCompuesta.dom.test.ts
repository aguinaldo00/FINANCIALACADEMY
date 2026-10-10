// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest';
import { EJERCICIOS_PAPEL, EJERCICIOS_RECONOCER, FORMULAS } from '../../src/content/temas/tema-02/practica.ts';
import {
  montarPracticaCompuesta,
  seccionErrores,
  seccionPapel,
  seccionReconocer,
} from '../../src/ui/components/practicaCompuesta.ts';
import { colorearSimbolos } from '../../src/ui/components/simbolos.ts';

function montar(): HTMLElement {
  const raiz = document.createElement('div');
  raiz.innerHTML = seccionErrores() + seccionPapel() + seccionReconocer();
  document.body.append(raiz);
  montarPracticaCompuesta(raiz);
  return raiz;
}

describe('práctica de capitalización compuesta', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('las ayudas se retiran de un ejercicio al siguiente', () => {
    expect(EJERCICIOS_PAPEL.map((e) => e.nivel)).toEqual(['completar', 'guiado', 'solo', 'solo']);
    expect(EJERCICIOS_PAPEL[0]!.ayuda.formula).toBeDefined();
    expect(EJERCICIOS_PAPEL.at(-1)!.ayuda).toEqual({});
  });

  it('las soluciones coinciden con los casos resueltos del libro', () => {
    const resultados = EJERCICIOS_PAPEL.map((e) => e.solucion.resultado);
    expect(resultados[0]).toContain('5.534,43');
    expect(resultados[1]).toContain('5.238,08');
    expect(resultados[1]).toContain('3.761,92');
    expect(resultados[2]).toBe('1 año, 7 meses y 13 días');
    expect(resultados[3]).toContain('0,006558');
  });

  it('el error se ve primero y la corrección solo al pedirla', () => {
    const raiz = montar();
    const tarjeta = raiz.querySelector<HTMLElement>('[data-mat-error]')!;
    expect(tarjeta.querySelector<HTMLElement>('.mat-error-bien')!.hidden).toBe(true);
    tarjeta.querySelector<HTMLButtonElement>('[data-mat-revelar-error]')!.click();
    expect(tarjeta.querySelector<HTMLElement>('.mat-error-bien')!.hidden).toBe(false);
  });

  it('la solución en papel va oculta y después pide autoevaluarse', () => {
    const raiz = montar();
    const ejercicio = raiz.querySelector<HTMLElement>('[data-mat-ejercicio]')!;
    expect(ejercicio.querySelector<HTMLElement>('.mat-papel-solucion')!.hidden).toBe(true);
    ejercicio.querySelector<HTMLButtonElement>('[data-mat-solucion]')!.click();
    expect(ejercicio.querySelector<HTMLElement>('.mat-papel-solucion')!.hidden).toBe(false);
    ejercicio.querySelector<HTMLButtonElement>('[data-mat-auto="mal"]')!.click();
    expect(ejercicio.querySelector('.mat-auto-respuesta')!.textContent).toContain('errores típicos');
  });

  it('reconocer: cada pregunta tiene su respuesta entre las opciones y los tipos van mezclados', () => {
    for (const ej of EJERCICIOS_RECONOCER) {
      expect(ej.opciones).toContain(ej.correcta);
      expect(new Set(ej.opciones).size).toBe(ej.opciones.length);
      for (const id of ej.opciones) expect(FORMULAS[id]).toBeDefined();
    }
    const correctas = EJERCICIOS_RECONOCER.map((e) => e.correcta);
    correctas.slice(1).forEach((c, i) => expect(c).not.toBe(correctas[i]));
    expect(new Set(correctas).size).toBe(EJERCICIOS_RECONOCER.length);
  });

  it('reconocer: marca la correcta, explica por qué y lleva la cuenta', () => {
    const raiz = montar();
    const [primera, segunda] = EJERCICIOS_RECONOCER;
    const p1 = raiz.querySelector<HTMLElement>(`[data-mat-pregunta="${primera!.id}"]`)!;
    p1.querySelector<HTMLButtonElement>(`[data-mat-opcion="${primera!.correcta}"]`)!.click();
    expect(p1.querySelector('.mat-porque')!.textContent).toContain('Correcto');
    const p2 = raiz.querySelector<HTMLElement>(`[data-mat-pregunta="${segunda!.id}"]`)!;
    const fallo = segunda!.opciones.find((o) => o !== segunda!.correcta)!;
    p2.querySelector<HTMLButtonElement>(`[data-mat-opcion="${fallo}"]`)!.click();
    expect(p2.querySelector('.incorrecta')).not.toBeNull();
    expect(p2.querySelector('.correcta')!.getAttribute('data-mat-opcion')).toBe(segunda!.correcta);
    expect(raiz.querySelector('[data-mat-marcador]')!.textContent).toContain('1 de 2');
  });
});

describe('colores de los símbolos', () => {
  it('colorea cada variable sin tocar palabras ni romper el HTML', () => {
    const html = colorearSimbolos('Cₙ = C₀ × (1 + i)ⁿ; I = Cₙ − C₀ <b>');
    expect(html).toContain('<span class="s s-cn">Cₙ</span>');
    expect(html).toContain('<span class="s s-c0">C₀</span>');
    expect(html).toContain('<span class="s s-i">i</span>');
    expect(html).toContain('<span class="s s-n">ⁿ</span>');
    expect(html).toContain('<span class="s s-I">I</span>');
    expect(html).toContain('&lt;b&gt;');
    expect(colorearSimbolos('interés anual')).toBe('interés anual');
  });
});
