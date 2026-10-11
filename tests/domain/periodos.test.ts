import { describe, expect, it } from 'vitest';
import { añosDeDuracionMixta, convertirDuracion, convertirTipo, nombreUnidad, UNIDADES, type Unidad } from '../../src/domain/tema2/periodos.ts';

const r = (cantidad: number, de: Unidad, a: Unidad, convenio: 360 | 365 = 360) => convertirDuracion(cantidad, de, a, convenio).resultado;

describe('paso de cualquier unidad de tiempo a cualquier otra', () => {
  it('las preguntas del calendario: 6 meses = 1 semestre = 2 trimestres = 1,5 cuatrimestres', () => {
    expect(r(6, 'mes', 'semestre')).toBe(1);
    expect(r(1, 'semestre', 'trimestre')).toBe(2);
    expect(r(1, 'semestre', 'cuatrimestre')).toBe(1.5);
    expect(r(1, 'cuatrimestre', 'trimestre')).toBeCloseTo(4 / 3, 12);
    expect(r(1, 'trimestre', 'cuatrimestre')).toBe(0.75);
    expect(r(2.5, 'año', 'mes')).toBe(30);
    expect(convertirDuracion(1, 'semestre', 'cuatrimestre').camino).toBe('meses');
  });

  it('con días: el convenio del enunciado (comercial por los días del mes, civil por el año)', () => {
    expect(r(195, 'dia', 'año', 365)).toBeCloseTo(195 / 365, 12);
    expect(r(45, 'dia', 'año', 360)).toBe(0.125);
    expect(r(1, 'trimestre', 'dia', 360)).toBe(90);
    expect(r(1, 'mes', 'dia', 360)).toBe(30);
    expect(r(195, 'dia', 'trimestre', 365)).toBeCloseTo((195 / 365) * 4, 12);
    expect(convertirDuracion(195, 'dia', 'año', 365).camino).toBe('año');
    expect(convertirDuracion(45, 'dia', 'mes', 360).camino).toBe('dias');
  });

  it('ida y vuelta: cualquier pareja vuelve a la cantidad de partida', () => {
    for (const c of [360, 365] as const) for (const de of UNIDADES) for (const a of UNIDADES) {
      const ida = r(7, de.id, a.id, c);
      expect(r(ida, a.id, de.id, c), `${de.id} → ${a.id} (${c})`).toBeCloseTo(7, 9);
    }
  });

  it('nombres y duraciones mixtas', () => {
    expect(nombreUnidad('cuatrimestre', 1.5)).toBe('cuatrimestres');
    expect(nombreUnidad('mes', 1)).toBe('mes');
    expect(añosDeDuracionMixta(2, 3, 10, 360)).toBeCloseTo(2 + 0.25 + 10 / 360, 12);
  });
});

describe('paso de un tipo de interés de una unidad de tiempo a otra', () => {
  it('compuesta: tantos equivalentes en los dos sentidos (casos del libro)', () => {
    expect(convertirTipo(0.1, 'año', 'mes', 'compuesta').resultado).toBeCloseTo(0.007974, 6);
    expect(convertirTipo(0.01, 'mes', 'año', 'compuesta').resultado).toBeCloseTo(0.126825, 6);
  });
  it('simple: proporcional (caso del libro: 3 % anual → diario civil)', () => {
    expect(convertirTipo(0.03, 'año', 'dia', 'simple', 365).resultado).toBeCloseTo(0.03 / 365, 12);
    expect(convertirTipo(0.1, 'año', 'mes', 'simple').resultado).toBeCloseTo(0.1 / 12, 12);
  });
  it('entre dos fracciones del año: trimestral → cuatrimestral, distinto en simple y en compuesta', () => {
    const s = convertirTipo(0.02, 'trimestre', 'cuatrimestre', 'simple');
    const c = convertirTipo(0.02, 'trimestre', 'cuatrimestre', 'compuesta');
    expect(s.resultado).toBeCloseTo(0.026667, 6);
    expect(c.resultado).toBeCloseTo(0.026755, 6);
    // En compuesta, el tipo proporcional no llega al mismo sitio en un año.
    expect((1 + c.proporcional) ** 3).toBeLessThan(c.factorAño);
    expect((1 + c.resultado) ** 3).toBeCloseTo(c.factorAño, 12);
  });
  it('cualquier pareja: ida y vuelta, y el mismo final en un año', () => {
    for (const regimen of ['simple', 'compuesta'] as const) for (const c of [360, 365] as const) for (const de of UNIDADES) for (const a of UNIDADES) {
      const ida = convertirTipo(0.05, de.id, a.id, regimen, c);
      expect(convertirTipo(ida.resultado, a.id, de.id, regimen, c).resultado, `${regimen} ${de.id}→${a.id}`).toBeCloseTo(0.05, 9);
      const final = regimen === 'simple' ? 1 + ida.resultado * ida.mA : (1 + ida.resultado) ** ida.mA;
      expect(Math.abs(final / ida.factorAño - 1), `${regimen} ${de.id}→${a.id}`).toBeLessThan(1e-9);
    }
  });
});
