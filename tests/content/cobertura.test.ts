import { describe, expect, it } from 'vitest';
import { tema01 } from '../../src/content/temas/tema-01/index.ts';

const amp = tema01.ampliacion!;

describe('cobertura de práctica del Tema 1', () => {
  it('todo concepto tiene al menos 2 preguntas de práctica', () => {
    const cortos = tema01.conceptos.filter((c) => amp.preguntas.filter((p) => p.conceptoId === c.id).length < 2).map((c) => c.id);
    expect(cortos).toEqual([]);
  });

  it('todo concepto del apartado 3 tiene al menos una flashcard propia', () => {
    const sin = tema01.conceptos
      .filter((c) => c.seccionId.startsWith('3'))
      .filter((c) => !amp.flashcards.some((f) => f.conceptoId === c.id))
      .map((c) => c.id);
    expect(sin).toEqual([]);
  });

  it('la respuesta correcta no está casi siempre en la misma posición', () => {
    const posiciones = [0, 1, 2].map((k) => amp.preguntas.filter((p) => p.indiceCorrecta === k).length);
    for (const n of posiciones) expect(n / amp.preguntas.length).toBeLessThan(0.6);
  });
});
