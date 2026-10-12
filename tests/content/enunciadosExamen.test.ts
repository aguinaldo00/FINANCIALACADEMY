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
});
