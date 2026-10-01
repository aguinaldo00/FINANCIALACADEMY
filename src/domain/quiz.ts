import type { Concepto } from '../content/schema.ts';
import { dominioConcepto } from './mastery.ts';
import type { Progreso } from './progress.ts';

export interface ResultadoRespuesta {
  correcta: boolean;
  progreso: Progreso;
  /** El prototipo solo guarda en disco al acertar; los fallos viven en memoria. */
  debeGuardarse: boolean;
}

export const DOMINIO_PRIMER_INTENTO = 1;
export const DOMINIO_CON_FALLOS = 0.5;

/**
 * Acertar a la primera da dominio 1; acertar tras fallar, 0,5.
 * El dominio nunca baja y al acertar se reinician los intentos.
 */
export function responderPregunta(progreso: Progreso, concepto: Concepto, indiceElegido: number): ResultadoRespuesta {
  const intentos = (progreso.intentos[concepto.id] || 0) + 1;
  const correcta = indiceElegido === concepto.pregunta.indiceCorrecta;

  if (!correcta) {
    return {
      correcta,
      progreso: { ...progreso, intentos: { ...progreso.intentos, [concepto.id]: intentos } },
      debeGuardarse: false,
    };
  }

  const ganado = intentos === 1 ? DOMINIO_PRIMER_INTENTO : DOMINIO_CON_FALLOS;
  return {
    correcta,
    progreso: {
      dominio: { ...progreso.dominio, [concepto.id]: Math.max(dominioConcepto(progreso, concepto.id), ganado) },
      intentos: { ...progreso.intentos, [concepto.id]: 0 },
    },
    debeGuardarse: true,
  };
}
