import { describe, expect, it } from 'vitest';
import { generarEjercicio, nuevaSemilla } from '../../src/domain/tema2/generador.ts';
import { esperado, LABORATORIOS, leerDato } from '../../src/domain/tema2/laboratorio.ts';

describe('generador de ejercicios de práctica', () => {
  it('cada fórmula que calcula tiene ejercicios válidos: sus datos, legibles, y una respuesta con sentido', () => {
    for (const [id, lab] of Object.entries(LABORATORIOS)) {
      for (let s = 1; s <= 200; s++) {
        const e = generarEjercicio(id, s)!;
        expect(Object.keys(e.datos).sort(), id).toEqual(lab.datos.map((d) => d.simbolo).sort());
        const v: Record<string, number> = {};
        for (const d of lab.datos) {
          const l = leerDato(e.datos[d.simbolo]!, d.magnitud);
          expect(l.ok === true && !l.aviso, `${id} ${s} ${d.simbolo}: ${e.datos[d.simbolo]}`).toBe(true);
          if (l.ok === true) v[d.simbolo] = l.valor;
        }
        const x = esperado(lab, v);
        expect(x !== null && x > 0 && Number.isFinite(x), `${id} ${s}`).toBe(true);
      }
    }
  });

  it('es reproducible por semilla y cambia con otra', () => {
    expect(generarEjercicio('simple-capital-inicial', 42)).toEqual(generarEjercicio('simple-capital-inicial', 42));
    expect(generarEjercicio('simple-capital-inicial', 42)).not.toEqual(generarEjercicio('simple-capital-inicial', nuevaSemilla(42)));
    expect(generarEjercicio('compuesta-comparacion', 1)).toBeNull();
  });
});
