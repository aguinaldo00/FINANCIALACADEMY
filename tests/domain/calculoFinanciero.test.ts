import { describe, expect, it } from 'vitest';
import {
  capitalFinalCompuesta,
  capitalFinalSimple,
  capitalInicialSimple,
  comisionConMinimo,
  descuentoComercialCompuesto,
  descuentoComercialSimple,
  descuentoRacionalCompuesto,
  descuentoRacionalSimple,
  desglosarAnos,
  efectivoComercialSimple,
  interesesCompuesta,
  interesesFraccionadoSimple,
  interesesSimple,
  redondearCentimos,
  taeDesdeTin,
  tiempoSimple,
  tipoAnualEquivalente,
  tipoFraccionadoEquivalente,
  tipoFraccionadoSimple,
  tipoSimple,
  valorLiquido,
} from '../../src/domain/calculoFinanciero.ts';

/*
 * Casos prácticos resueltos del libro (Unidad 2) tal como los recoge docs/fuentes/tema-02-…md.
 * Si un test falla, el error está en el código: no se cambian estos valores para que pase.
 */
describe('capitalización simple', () => {
  it('las seis familias son despejes coherentes de la misma relación', () => {
    const c0 = 10000, i = 0.07, n = 3;
    const cn = capitalFinalSimple(c0, i, n);
    expect(cn).toBeCloseTo(12100, 8);
    expect(interesesSimple(c0, i, n)).toBeCloseTo(cn - c0, 8);
    expect(capitalInicialSimple(cn, i, n)).toBeCloseTo(c0, 8);
    expect(tipoSimple(c0, cn, n)).toBeCloseTo(i, 10);
    expect(tiempoSimple(c0, cn, i)).toBeCloseTo(n, 10);
    expect(interesesFraccionadoSimple(c0, tipoFraccionadoSimple(i, 12), n, 12)).toBeCloseTo(2100, 8);
  });

  it('caso práctico 13: 6.000 € al 3 % hasta 6.500 € → 2,78 años = 2 años, 9 meses y 11 días', () => {
    const n = tiempoSimple(6000, 6500, 0.03);
    expect(n).toBeCloseTo(2.7778, 4);
    expect(desglosarAnos(n)).toMatchObject({ anos: 2, meses: 9, dias: 11, anosDecimal: 2.78, mesesDecimal: 9.36 });
  });

  it('caso práctico 14: 5.000 € al 3 % durante 195 días, año civil → 5.080,14 €', () => {
    const im = tipoFraccionadoSimple(0.03, 365);
    expect(redondearCentimos(5000 + interesesFraccionadoSimple(5000, im, 195 / 365, 365))).toBe(5080.14);
    expect(redondearCentimos(capitalFinalSimple(5000, 0.03, 195 / 365))).toBe(5080.14);
  });

  it('propuesta del análisis: 8.000 € que en 18 meses dan 720 € → i = 6 % anual', () => {
    expect(tipoSimple(8000, 8720, 18 / 12)).toBeCloseTo(0.06, 10);
  });
});

describe('capitalización compuesta', () => {
  it('intereses totales con el factor: 4.500 € al 3 % durante 7 años → 1.034,43 €', () => {
    expect(redondearCentimos(interesesCompuesta(4500, 0.03, 7))).toBe(1034.43);
  });

  it('caso práctico 19: 10 % anual → 0,7974 % mensual equivalente', () => {
    expect(tipoFraccionadoEquivalente(0.1, 12)).toBeCloseTo(0.007974, 6);
    expect(tipoAnualEquivalente(tipoFraccionadoEquivalente(0.1, 12), 12)).toBeCloseTo(0.1, 12);
  });

  it('caso práctico 20: 5.000 € al 3 % durante 195 días → simple 5.080,14 € y compuesta 5.079,59 €', () => {
    expect(redondearCentimos(capitalFinalSimple(5000, 0.03, 195 / 365))).toBe(5080.14);
    expect(redondearCentimos(capitalFinalCompuesta(5000, 0.03, 195 / 365))).toBe(5079.59);
  });

  it('1 % mensual compuesto equivale a 12,68 % anual (no a 12 %)', () => {
    expect(tipoAnualEquivalente(0.01, 12)).toBeCloseTo(0.126825, 6);
  });

  it('caso práctico 24: 10.000 € al 12 % TIN mensual con comisión de reembolso del 1,5 % → TAE real 10,99 %', () => {
    const tae = taeDesdeTin(0.12, 12);
    expect(tae).toBeCloseTo(0.126825, 6);
    const recibido = redondearCentimos(10000 * (1 + tae) * (1 - 0.015));
    expect(recibido).toBe(11099.23);
    expect(Math.round((recibido / 10000 - 1) * 10000) / 100).toBe(10.99);
  });

  it('propuesta del análisis: 4 % TIN con capitalización trimestral → TAE 4,06 %', () => {
    expect(taeDesdeTin(0.04, 4)).toBeCloseTo(0.040604, 6);
  });
});

describe('descuento', () => {
  it('el comercial (sobre N) es mayor que el racional (sobre el efectivo)', () => {
    const dc = descuentoComercialSimple(6000, 45 / 360, 0.05);
    const dr = descuentoRacionalSimple(6000, 45 / 360, 0.05);
    expect(dc).toBeCloseTo(37.5, 10);
    expect(redondearCentimos(dr)).toBe(37.27);
    expect(dc).toBeGreaterThan(dr);
    expect(efectivoComercialSimple(6000, 45 / 360, 0.05)).toBeCloseTo(5962.5, 10);
  });

  it('propuesta del análisis: pagaré de 6.000 € a 45 días al 5 %, comisión 1 % (mín. 10 €) y 3 € de correo → 5.899,50 €', () => {
    const dc = descuentoComercialSimple(6000, 45 / 360, 0.05);
    const comision = comisionConMinimo(6000, 0.01, 10);
    expect(comision).toBe(60);
    expect(comisionConMinimo(500, 0.01, 10)).toBe(10);
    expect(redondearCentimos(valorLiquido(6000, dc, comision, 3))).toBe(5899.5);
  });

  it('caso práctico 28: 12.500 € a 565 días al 4 % (descuento compuesto racional) → 736,316 €', () => {
    expect(descuentoRacionalCompuesto(12500, 565 / 365, 0.04)).toBeCloseTo(736.316, 2);
  });

  it('caso práctico 29: 2.000 € a 6 años al 5 % (descuento compuesto comercial) → 529,816 €', () => {
    expect(descuentoComercialCompuesto(2000, 6, 0.05)).toBeCloseTo(529.816, 3);
  });

  it('rechaza datos imposibles', () => {
    expect(() => tiempoSimple(100, 200, 0)).toThrow(RangeError);
    expect(() => capitalInicialSimple(0, 0.03, 2)).toThrow(RangeError);
    expect(() => descuentoComercialCompuesto(100, 2, 1)).toThrow(RangeError);
  });
});
