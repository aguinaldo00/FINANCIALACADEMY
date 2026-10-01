import type { Seccion, Tema } from '../content/schema.ts';
import { dominioSeccion } from './mastery.ts';
import type { Progreso } from './progress.ts';

/** "Estudia ya": las secciones que más pesan y menos dominas (peso × (1 − dominio)). */
export function seccionesPrioritarias(tema: Tema, progreso: Progreso, cantidad = 3): Seccion[] {
  return tema.secciones
    .map((seccion) => ({ seccion, puntuacion: seccion.pesoExamen * (1 - dominioSeccion(tema, progreso, seccion.id)) }))
    .sort((a, b) => b.puntuacion - a.puntuacion)
    .slice(0, cantidad)
    .map((x) => x.seccion);
}
