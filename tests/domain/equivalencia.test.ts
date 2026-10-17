import { describe, expect, it } from 'vitest';
import { FOCAL_EJEMPLO, generarFocal, trasladar, valorEnFocal } from '../../src/domain/tema2/equivalencia.ts';
import { diasEntre } from '../../src/domain/tema2/remesa.ts';

describe('equivalencia de capitales en una fecha focal', () => {
  it('lleva hacia delante lo que vence antes y hacia atrás lo que vence después', () => {
    const { capitales, focal, metodo, tipo, base } = FOCAL_EJEMPLO;
    const r = valorEnFocal(capitales, focal, metodo, tipo, base);
    expect(r.lineas.map((l) => [l.sentido, l.dias])).toEqual([['delante', 40], ['atras', 300], ['atras', 50]]);
    expect(r.lineas.map((l) => l.valor)).toEqual([2011.11, 4791.67, 2979.17]);
    expect(r.total).toBe(9781.95);
    // Comprobación a mano, sin pasar por trasladar: 2.000 · (1 + 40/360 · 0,05) + 5.000 · (1 − 300/360 · 0,05) + 3.000 · (1 − 50/360 · 0,05).
    expect(2000 * (1 + (40 / 360) * 0.05) + 5000 * (1 - (300 / 360) * 0.05) + 3000 * (1 - (50 / 360) * 0.05)).toBeCloseTo(9781.94, 2);
    // Con descuento racional hacia atrás, el mismo ejemplo da otra cifra.
    expect(valorEnFocal(capitales, focal, 'simple-racional', tipo, base).total).toBe(9790.42);
  });

  it('usa las leyes de las fórmulas del tema', () => {
    expect(trasladar(6000, 45 / 360, 'atras', 'simple-comercial', 0.05)).toBe(5962.5);
    expect(trasladar(6000, 45 / 360, 'atras', 'simple-racional', 0.05)).toBe(5962.73);
    expect(trasladar(12500, 565 / 365, 'atras', 'compuesta-racional', 0.04)).toBe(11763.68);
    expect(trasladar(6000, 2, 'atras', 'compuesta-comercial', 0.05)).toBe(5415);
    expect(trasladar(10000, 3, 'delante', 'simple-racional', 0.07)).toBe(12100);
  });

  it('en compuesta, ir y volver deja el capital igual', () => {
    const ida = trasladar(5000, 0.8, 'delante', 'compuesta-racional', 0.06);
    expect(trasladar(ida, 0.8, 'atras', 'compuesta-racional', 0.06)).toBeCloseTo(5000, 1);
  });

  it('genera ejercicios con letras a los dos lados de la fecha focal', () => {
    for (let s = 1; s <= 300; s++) {
      const e = generarFocal(s);
      const r = valorEnFocal(e.capitales, e.diasFocal, e.metodo, e.tipo, e.base);
      expect(r.lineas.some((l) => l.sentido === 'delante')).toBe(true);
      expect(r.lineas.some((l) => l.sentido === 'atras')).toBe(true);
      expect(r.lineas.every((l) => l.sentido !== 'igual')).toBe(true);
      e.capitales.forEach((c, k) => expect(diasEntre(e.hoy, e.vencimientos[k]!)).toBe(c.vence));
      expect(diasEntre(e.hoy, e.focal)).toBe(e.diasFocal);
      expect(generarFocal(s)).toEqual(e);
    }
  });
});
