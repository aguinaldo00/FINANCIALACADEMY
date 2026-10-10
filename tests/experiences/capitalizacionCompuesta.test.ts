import { describe, expect, it } from 'vitest';
import { calcularCapitalizacionCompuesta } from '../../src/domain/capitalizacionCompuesta.ts';
import { crearEtapasCapitalizacion } from '../../src/experiences/capitalizacionCompuesta.ts';

describe('secuencia didáctica de capitalización', () => {
  it('presenta la regla, desarrolla los periodos y deriva las expresiones generales', () => {
    const modelo = calcularCapitalizacionCompuesta({
      capitalInicialCentimos: 100_000,
      tasaAnualPuntosBase: 500,
      numeroPeriodos: 3,
    });
    const etapas = crearEtapasCapitalizacion(modelo);
    expect(etapas).toHaveLength(9);
    expect(etapas[0]).toEqual({ tipo: 'regla' });
    expect(etapas[1]).toEqual({ tipo: 'interes-del-periodo', indicePeriodo: 0 });
    expect(etapas[2]).toEqual({ tipo: 'capital-al-cierre', indicePeriodo: 0 });
    expect(etapas[3]).toEqual({ tipo: 'interes-del-periodo', indicePeriodo: 1 });
    expect(etapas[4]).toEqual({ tipo: 'capital-al-cierre', indicePeriodo: 1 });
    expect(etapas[6]).toEqual({ tipo: 'capital-al-cierre', indicePeriodo: 2 });
    expect(etapas[7]).toEqual({ tipo: 'formula-general' });
    expect(etapas[8]).toEqual({ tipo: 'intereses-totales' });
  });
});
