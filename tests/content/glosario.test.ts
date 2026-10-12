import { describe, expect, it } from 'vitest';
import { GLOSARIO } from '../../src/content/glosario.ts';
import { bancoDePreguntas } from '../../src/domain/exam.ts';
import { tema01 } from '../../src/content/temas/tema-01/index.ts';

describe('glosario de la asignatura', () => {
  it('no repite entradas y cada una tiene explicación', () => {
    const terminos = GLOSARIO.map((e) => e.termino.toLowerCase());
    expect(new Set(terminos).size).toBe(terminos.length);
    for (const e of GLOSARIO) expect(e.explica.length, e.termino).toBeGreaterThan(20);
  });

  it('cada enlace a ficha apunta a un concepto que existe', () => {
    const ids = new Set(tema01.conceptos.map((c) => c.id));
    for (const e of GLOSARIO) if (e.conceptoId) expect(ids.has(e.conceptoId), `${e.termino} → ${e.conceptoId}`).toBe(true);
  });

  it('las siglas de las infografías del Tema 1 están en el glosario', () => {
    const declaradas = new Set(GLOSARIO.map((e) => e.termino));
    // Palabras en mayúsculas que no son siglas (énfasis del texto) o que no se glosan.
    const noSiglas = new Set(['NO', 'SÍ', 'TODOS']);
    const textos = (tema01.ampliacion?.infografias ?? []).flatMap((i) => [i.titulo, ...i.pasos.map((p) => p.texto), ...i.actores.map((a) => a.etiqueta), ...i.flujos.map((f) => f.etiqueta)]);
    const siglas = new Set(textos.flatMap((t) => t.match(/(?<![\p{L}])[A-ZÁÉÍÓÚÑ]{2,}(?![\p{L}])/gu) ?? []));
    const faltan = [...siglas].filter((s) => !declaradas.has(s) && !noSiglas.has(s));
    expect(faltan).toEqual([]);
  });

  it('las siglas de las preguntas tipo test del Tema 1 (simulacro, fichas, práctica) están en el glosario', () => {
    const declaradas = new Set(GLOSARIO.flatMap((e) => [e.termino, ...(e.formas ?? [])]));
    // Mayúsculas de énfasis o nombres propios, no siglas: INST es el nombre de la empresa del caso práctico.
    const noSiglas = new Set(['NO', 'SÍ', 'TODOS', 'ESENCIAL', 'EMITE', 'NACIONAL', 'INST']);
    const textos = bancoDePreguntas(tema01).flatMap((p) => [p.enunciado, ...p.opciones]);
    const siglas = new Set(textos.flatMap((t) => t.match(/(?<![\p{L}\p{N}])[A-ZÁÉÍÓÚÑ]{2,}(?![\p{L}\p{N}])/gu) ?? []));
    expect([...siglas].filter((s) => !declaradas.has(s) && !noSiglas.has(s))).toEqual([]);
  });
});
