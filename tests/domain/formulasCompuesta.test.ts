import { describe, expect, it } from 'vitest';
import {
  capitalFinalCompuesta,
  capitalFinalSimple,
  capitalInicialCompuesta,
  desglosarAnos,
  interesesSimple,
  redondearCentimos,
  tiempoCompuesta,
  tipoCompuesta,
} from '../../src/domain/formulasCompuesta.ts';

/*
 * Cada caso es un "caso práctico" resuelto del libro (Unidad 2, Gestión financiera). Si un test
 * falla, el error está en el código, no en el libro: no se cambian estos valores para que pase.
 */
describe('fórmulas contra los casos resueltos del libro', () => {
  it('capital final en compuesta: 4500 € al 3 % durante 7 años → 5534,43 €', () => {
    expect(redondearCentimos(capitalFinalCompuesta(4500, 0.03, 7))).toBe(5534.43);
  });

  it('capital inicial en compuesta: 9000 € a 8 años al 7 % → 5238,08 € e I = 3761,92 €', () => {
    const c0 = redondearCentimos(capitalInicialCompuesta(9000, 0.07, 8));
    expect(c0).toBe(5238.08);
    expect(redondearCentimos(9000 - c0)).toBe(3761.92);
  });

  it('tiempo en compuesta: 30 000 € → 35 000 € al 10 % → 1,62 años = 1 año, 7 meses y 13 días', () => {
    const n = tiempoCompuesta(30000, 35000, 0.1);
    expect(n).toBeCloseTo(1.6174, 3);
    expect(desglosarAnos(n)).toMatchObject({ anos: 1, meses: 7, dias: 13, anosDecimal: 1.62, mesesDecimal: 7.44 });
  });

  it('tipo en compuesta: 50 000 € → 52 000 € en 6 años → i = 0,006558', () => {
    expect(tipoCompuesta(50000, 52000, 6)).toBeCloseTo(0.006558, 6);
  });

  it('capitalización simple: Juana 18 500 € al 4 % 5 años → 22 200 €', () => {
    expect(redondearCentimos(capitalFinalSimple(18500, 0.04, 5))).toBe(22200);
  });

  it('capitalización simple: María 15 000 € al 3 % 3 años → 1350 € (el libro imprime 1450 €, errata)', () => {
    expect(redondearCentimos(interesesSimple(15000, 0.03, 3))).toBe(1350);
  });

  it('desglose de años de capitalización simple: 2,78 años → 2 años, 9 meses y 11 días', () => {
    expect(desglosarAnos(500 / (6000 * 0.03))).toMatchObject({ anos: 2, meses: 9, dias: 11 });
  });

  it('rechaza datos imposibles', () => {
    expect(() => capitalFinalCompuesta(0, 0.03, 2)).toThrow(RangeError);
    expect(() => tiempoCompuesta(100, 200, 0)).toThrow(RangeError);
    expect(() => tipoCompuesta(100, 200, 0)).toThrow(RangeError);
  });
});
