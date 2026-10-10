import { describe, expect, it } from 'vitest';
import {
  calcularCapitalizacionCompuesta,
  formatearEuros,
  formatearPorcentaje,
} from '../../src/domain/capitalizacionCompuesta.ts';

describe('capitalización compuesta', () => {
  const escenario = { capitalInicialCentimos: 100_000, tasaAnualPuntosBase: 500, numeroPeriodos: 3 };

  it('calcula los tres cierres anuales a partir del capital vigente', () => {
    const resultado = calcularCapitalizacionCompuesta(escenario);
    expect(resultado.periodos.map((periodo) => periodo.capitalFinalCentimos))
      .toEqual([105_000, 110_250, 115_763]);
    expect(resultado.periodos.map((periodo) => periodo.interesGeneradoCentimos))
      .toEqual([5_000, 5_250, 5_513]);
    expect(resultado.capitalFinalCentimos).toBe(115_763);
  });

  it('redondea los medios céntimos hacia arriba y conserva una tasa cero', () => {
    expect(calcularCapitalizacionCompuesta({
      capitalInicialCentimos: 10,
      tasaAnualPuntosBase: 500,
      numeroPeriodos: 1,
    }).capitalFinalCentimos).toBe(11);
    expect(calcularCapitalizacionCompuesta({
      capitalInicialCentimos: 10_000,
      tasaAnualPuntosBase: 0,
      numeroPeriodos: 2,
    }).periodos.map((periodo) => periodo.capitalFinalCentimos)).toEqual([10_000, 10_000]);
  });

  it('formatea los importes y porcentajes para la interfaz española', () => {
    expect(formatearEuros(115_763)).toContain('1.157,63');
    expect(formatearPorcentaje(500)).toBe('5 %');
  });

  it('rechaza parámetros fuera del dominio monetario admitido', () => {
    expect(() => calcularCapitalizacionCompuesta({
      capitalInicialCentimos: 0,
      tasaAnualPuntosBase: 500,
      numeroPeriodos: 3,
    })).toThrow(RangeError);
    expect(() => calcularCapitalizacionCompuesta({
      capitalInicialCentimos: 100_000,
      tasaAnualPuntosBase: 500,
      numeroPeriodos: 1_001,
    })).toThrow(RangeError);
  });
});
