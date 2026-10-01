import { describe, expect, it } from 'vitest';
import { tema01 } from '../../src/content/temas/tema-01/index.ts';
import { seccionesPrioritarias } from '../../src/domain/priority.ts';
import { progresoVacio } from '../../src/domain/progress.ts';

describe('Estudia ya', () => {
  it('sin progreso devuelve las tres secciones de más peso', () => {
    expect(seccionesPrioritarias(tema01, progresoVacio()).map((s) => s.id)).toEqual(['4.2A', '4.2B', '3.2B']);
  });

  it('una sección dominada deja de ser prioritaria', () => {
    const dominio = Object.fromEntries(tema01.conceptos.filter((c) => c.seccionId === '4.2A').map((c) => [c.id, 1]));
    const ids = seccionesPrioritarias(tema01, { dominio, intentos: {} }).map((s) => s.id);
    expect(ids).not.toContain('4.2A');
    expect(ids).toEqual(['4.2B', '3.2B', '2']);
  });

  it('respeta la cantidad pedida', () => {
    expect(seccionesPrioritarias(tema01, progresoVacio(), 5)).toHaveLength(5);
  });
});
