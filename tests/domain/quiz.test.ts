import { describe, expect, it } from 'vitest';
import { tema01 } from '../../src/content/temas/tema-01/index.ts';
import { progresoVacio } from '../../src/domain/progress.ts';
import { responderPregunta } from '../../src/domain/quiz.ts';

const concepto = tema01.conceptos.find((c) => c.id === 'fgd')!;
const correcta = concepto.pregunta.indiceCorrecta;
const incorrecta = (correcta + 1) % concepto.pregunta.opciones.length;

describe('responder pregunta', () => {
  it('acertar a la primera da dominio 1 y se guarda', () => {
    const r = responderPregunta(progresoVacio(), concepto, correcta);
    expect(r.correcta).toBe(true);
    expect(r.debeGuardarse).toBe(true);
    expect(r.progreso.dominio.fgd).toBe(1);
    expect(r.progreso.intentos.fgd).toBe(0);
  });

  it('fallar suma un intento y no se guarda', () => {
    const r = responderPregunta(progresoVacio(), concepto, incorrecta);
    expect(r.correcta).toBe(false);
    expect(r.debeGuardarse).toBe(false);
    expect(r.progreso.intentos.fgd).toBe(1);
    expect(r.progreso.dominio.fgd).toBeUndefined();
  });

  it('acertar tras fallar da 0,5 y reinicia los intentos', () => {
    const tras = responderPregunta(responderPregunta(progresoVacio(), concepto, incorrecta).progreso, concepto, correcta);
    expect(tras.progreso.dominio.fgd).toBe(0.5);
    expect(tras.progreso.intentos.fgd).toBe(0);
  });

  it('el dominio nunca baja', () => {
    const p = { dominio: { fgd: 1 }, intentos: { fgd: 2 } };
    expect(responderPregunta(p, concepto, correcta).progreso.dominio.fgd).toBe(1);
  });

  it('no muta el progreso recibido', () => {
    const p = progresoVacio();
    responderPregunta(p, concepto, incorrecta);
    responderPregunta(p, concepto, correcta);
    expect(p).toEqual(progresoVacio());
  });
});
