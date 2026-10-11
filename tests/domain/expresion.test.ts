import { describe, expect, it } from 'vitest';
import { analizar, calcular, explicar, formatear } from '../../src/domain/tema2/expresion.ts';

const valor = (texto: string, ans = 0) => {
  const r = calcular(texto, ans);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
};

describe('analizador de expresiones de la calculadora', () => {
  it('primera prueba del plan: C₀ = Cₙ / (1 + n · i) con 3.000 €, 3 años y 7 %', () => {
    expect(valor('3000 ÷ (1 + 3 × 0,07)')).toBeCloseTo(2479.338843, 6);
    expect(formatear(valor('3000 ÷ (1 + 3 × 0,07)'))).toBe('2.479,34');
    expect(valor('3.000 / (1 + 3 * 0,07)')).toBeCloseTo(2479.338843, 6);
  });

  it('precedencia, potencias por la derecha y signo menos como en la calculadora', () => {
    expect(valor('1 + 3 × 0,07')).toBeCloseTo(1.21, 12);
    expect(valor('2 ^ 3 ^ 2')).toBe(512);
    expect(valor('−2 ^ 2')).toBe(-4);
    expect(valor('(−2) ^ 2')).toBe(4);
    expect(valor('10000 × (1 + 0,07) ^ 3')).toBeCloseTo(12250.43, 2);
    expect(valor('1,1 ^ (1 / 12) − 1')).toBeCloseTo(0.007974, 6);
  });

  it('funciones, %, Ans y raíz de índice n con potencias', () => {
    expect(valor('log(35000 ÷ 30000) ÷ log(1,1)')).toBeCloseTo(1.6174, 4);
    expect(valor('ln(1)')).toBe(0);
    expect(valor('√9 + √(16)')).toBe(7);
    expect(valor('7%')).toBeCloseTo(0.07, 12);
    expect(valor('Ans × 2', 21)).toBe(42);
    expect(valor('8 ^ (1 ÷ 3)')).toBeCloseTo(2, 12);
  });

  it('no corrige en silencio: avisa de lo ambiguo y de lo que falta, con la posición', () => {
    const ambiguo = analizar('1.5 + 2');
    expect(ambiguo.ok).toBe(false);
    if (!ambiguo.ok) expect(ambiguo.error).toContain('coma');
    for (const [texto, pos] of [['2(3)', 1], ['3√4', 1], ['(1 + 2', 0], ['1 + ', 4], ['log 2', 3], ['2 × × 3', 4]] as const) {
      const r = analizar(texto);
      expect(r.ok, texto).toBe(false);
      if (!r.ok) expect(r.posicion, texto).toBe(pos);
    }
    expect(calcular('1 ÷ 0')).toMatchObject({ ok: false });
    expect(calcular('log(0)')).toMatchObject({ ok: false });
  });

  it('explica los pasos en el orden en que se calculan y nombra los datos', () => {
    const pasos = explicar('3000 ÷ (1 + 3 × 0,07)', { C_n: 3000, n: 3, i: 0.07 });
    expect(pasos[0]).toBe('3000 es C_n.');
    expect(pasos).toContain('Multiplicas: 3 × 0,07 = 0,21.');
    expect(pasos).toContain('Sumas: 1 + 0,21 = 1,21 (las multiplicaciones, divisiones y potencias van antes que las sumas y restas).');
    expect(pasos).toContain('Divides: 3.000 ÷ 1,21 = 2.479,338843 (lo de dentro del paréntesis va antes).');
    expect(pasos.at(-1)).toBe('Resultado: 2.479,338843 (con 2 decimales, 2.479,34).');
    // Si un valor puede ser dos datos, lo dice y no elige.
    expect(explicar('3 × 3', { n: 3, m: 3 })[0]).toContain('puede ser n o m');
    // Sin datos, solo la matemática.
    expect(explicar('2 + 2').some((p) => p.includes(' es '))).toBe(false);
  });
});
