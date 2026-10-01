/** Progreso de estudio de un tema. */
export interface Progreso {
  /** Dominio por concepto, de 0 a 1. */
  dominio: Record<string, number>;
  /** Intentos fallidos acumulados en la pregunta actual de cada concepto. */
  intentos: Record<string, number>;
}

export const progresoVacio = (): Progreso => ({ dominio: {}, intentos: {} });
