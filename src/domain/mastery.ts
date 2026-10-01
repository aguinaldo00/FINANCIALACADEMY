import type { Tema } from '../content/schema.ts';
import type { Progreso } from './progress.ts';

export type NivelDominio = 'dominado' | 'regular' | 'flojo' | 'sin-estudiar';

export const dominioConcepto = (progreso: Progreso, conceptoId: string): number =>
  progreso.dominio[conceptoId] || 0;

/** Media del dominio de los conceptos de la sección (0 si no tiene conceptos). */
export function dominioSeccion(tema: Tema, progreso: Progreso, seccionId: string): number {
  const conceptos = tema.conceptos.filter((c) => c.seccionId === seccionId);
  if (!conceptos.length) return 0;
  return conceptos.reduce((suma, c) => suma + dominioConcepto(progreso, c.id), 0) / conceptos.length;
}

/** Media de las secciones ponderada por su peso en el examen. */
export function dominioGlobal(tema: Tema, progreso: Progreso): number {
  const ponderado = tema.secciones.reduce((suma, s) => suma + dominioSeccion(tema, progreso, s.id) * s.pesoExamen, 0);
  const pesoTotal = tema.secciones.reduce((suma, s) => suma + s.pesoExamen, 0);
  return ponderado / pesoTotal;
}

export function nivelDominio(valor: number): NivelDominio {
  if (valor >= 0.8) return 'dominado';
  if (valor >= 0.5) return 'regular';
  if (valor > 0) return 'flojo';
  return 'sin-estudiar';
}
