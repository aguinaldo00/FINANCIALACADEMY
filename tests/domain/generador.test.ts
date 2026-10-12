import { describe, expect, it } from 'vitest';
import { generarEjercicio, generarPreguntaTiempo, nuevaSemilla } from '../../src/domain/tema2/generador.ts';
import { convertirDuracion, convertirTipo } from '../../src/domain/tema2/periodos.ts';
import { sePuedeDibujar } from '../../src/ui/escenas/conversionPeriodos.ts';
import { sePuedeDibujarTipo } from '../../src/ui/escenas/conversionTipos.ts';
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

  it('los ejercicios de unidades de tiempo: dos unidades distintas, convenio solo con días, respuesta exacta y animación dibujable', () => {
    for (const modo of ['duracion', 'tipo'] as const) {
      for (let s = 1; s <= 300; s++) {
        const q = generarPreguntaTiempo(s, modo);
        expect(q.de, `${modo} ${s}`).not.toBe(q.a);
        if (q.de !== 'dia' && q.a !== 'dia') expect(q.convenio).toBe(360);
        expect(q.valor > 0 && q.resultado > 0 && Number.isFinite(q.resultado), `${modo} ${s}`).toBe(true);
        if (modo === 'duracion') {
          expect(q.resultado).toBeCloseTo(convertirDuracion(q.valor, q.de, q.a, q.convenio).resultado, 12);
          expect(sePuedeDibujar({ cantidad: q.valor, de: q.de, a: q.a, convenio: q.convenio })).toBe(true);
        } else {
          // Un tipo se da por año o por fracción del año, nunca por día.
          expect(q.de).not.toBe('dia');
          expect(q.resultado).toBeCloseTo(convertirTipo(q.valor, q.de, q.a, q.regimen, q.convenio).resultado, 14);
          expect(sePuedeDibujarTipo({ tipo: q.valor, de: q.de, a: q.a, regimen: q.regimen, convenio: q.convenio })).toBe(true);
        }
      }
    }
    // Reproducible y, en tipos, en el régimen pedido.
    expect(generarPreguntaTiempo(7, 'tipo', 'compuesta')).toEqual(generarPreguntaTiempo(7, 'tipo', 'compuesta'));
    for (let s = 1; s <= 50; s++) expect(generarPreguntaTiempo(s, 'tipo', 'simple').regimen).toBe('simple');
  });
});
