import { describe, expect, it } from 'vitest';
import { tema01 } from '../../src/content/temas/tema-01/index.ts';
import type { Tema } from '../../src/content/schema.ts';
import { dominioConcepto, dominioGlobal, dominioSeccion, nivelDominio } from '../../src/domain/mastery.ts';
import { progresoVacio, type Progreso } from '../../src/domain/progress.ts';
import { motorLegacy } from '../helpers/legacy.ts';

/** Progreso variado y determinista sobre los conceptos reales del tema. */
function progresoDePrueba(): Progreso {
  const valores = [0, 0.5, 1];
  const dominio: Record<string, number> = {};
  tema01.conceptos.forEach((c, i) => {
    if (i % 4 !== 3) dominio[c.id] = valores[i % 3]!;
  });
  return { dominio, intentos: {} };
}

describe('dominio', () => {
  it('un concepto sin estudiar vale 0', () => {
    expect(dominioConcepto(progresoVacio(), 'sf')).toBe(0);
  });

  it('la sección es la media de sus conceptos', () => {
    const p: Progreso = { dominio: { directa: 1, indirecta: 0.5 }, intentos: {} };
    // Sección 2: funciones, directa, indirecta, pagos.
    expect(dominioSeccion(tema01, p, '2')).toBeCloseTo(1.5 / 4);
  });

  it('una sección sin conceptos vale 0', () => {
    const tema: Tema = { ...tema01, secciones: [...tema01.secciones, { id: 'x', grupoId: '1', titulo: '', pesoExamen: 1, descripcion: '' }] };
    expect(dominioSeccion(tema, progresoVacio(), 'x')).toBe(0);
  });

  it('el global pondera cada sección por su peso de examen', () => {
    const p: Progreso = { dominio: { cajas: 1 }, intentos: {} };
    const pesoTotal = tema01.secciones.reduce((a, s) => a + s.pesoExamen, 0);
    const conceptos42A = tema01.conceptos.filter((c) => c.seccionId === '4.2A').length;
    expect(dominioGlobal(tema01, p)).toBeCloseTo(((1 / conceptos42A) * 25) / pesoTotal);
  });

  it('coincide con el motor legacy', () => {
    const p = progresoDePrueba();
    const legacy = motorLegacy({ dom: p.dominio, tries: {} });
    for (const s of tema01.secciones) expect(dominioSeccion(tema01, p, s.id)).toBe(legacy.domS(s.id));
    expect(dominioGlobal(tema01, p)).toBe(legacy.domG());
  });

  it('clasifica el nivel con los umbrales del prototipo', () => {
    expect(nivelDominio(0)).toBe('sin-estudiar');
    expect(nivelDominio(0.01)).toBe('flojo');
    expect(nivelDominio(0.49)).toBe('flojo');
    expect(nivelDominio(0.5)).toBe('regular');
    expect(nivelDominio(0.79)).toBe('regular');
    expect(nivelDominio(0.8)).toBe('dominado');
    expect(nivelDominio(1)).toBe('dominado');
  });
});
