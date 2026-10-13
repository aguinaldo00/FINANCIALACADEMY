import { describe, expect, it } from 'vitest';
import { enunciadoExamen } from '../../src/content/temas/tema-02/enunciados.ts';
import { generarEjercicio } from '../../src/domain/tema2/generador.ts';
import { LABORATORIOS } from '../../src/domain/tema2/laboratorio.ts';

describe('modo examen: enunciados redactados', () => {
  it('cada fórmula con cálculo tiene su enunciado, con todos los datos y sin símbolos', () => {
    for (const id of Object.keys(LABORATORIOS)) {
      for (const semilla of [1, 7, 42, 999]) {
        const ej = generarEjercicio(id, semilla)!;
        const texto = enunciadoExamen(id, ej.datos);
        expect(texto, id).toBeTruthy();
        expect(texto, id).not.toMatch(/undefined|C_|J_|\$/);
        expect(texto!.trim().endsWith('?'), id).toBe(true);
        for (const [s, v] of Object.entries(ej.datos)) {
          // m se escribe como «mensual», «trimestral»…; los días, sin «/360».
          if (s === 'm') continue;
          expect(texto, `${id} · ${s}`).toContain(v.split('/')[0]);
        }
      }
    }
  });

  it('redacta la periodicidad generada y usa la misma unidad para el tipo y el tiempo', () => {
    for (const id of Object.keys(LABORATORIOS)) {
      for (let semilla = 1; semilla <= 100; semilla++) {
        const ej = generarEjercicio(id, semilla, { todosLosPeriodos: true })!;
        const texto = enunciadoExamen(id, ej.datos, ej.periodicidad)!;
        expect(texto, `${id} ${semilla}`).not.toMatch(/undefined|NaN/);
        for (const [simbolo, valor] of Object.entries(ej.datos)) {
          if (simbolo === 'm') continue;
          expect(texto, `${id} ${semilla} ${simbolo}`).toContain(valor.split('/')[0]);
        }
        if (ej.periodicidad) {
          if (id.startsWith('simple-') && id !== 'simple-fraccionado' || id.startsWith('compuesta-') && !['compuesta-equivalentes', 'compuesta-tae'].includes(id)) {
            expect(texto, `${id} ${semilla}`).toContain(ej.periodicidad.unidad === 'dia' ? 'diario' : ({ año: 'anual', semestre: 'semestral', cuatrimestre: 'cuatrimestral', trimestre: 'trimestral', mes: 'mensual' } as const)[ej.periodicidad.unidad]);
          }
        }
      }
    }
  });
});
