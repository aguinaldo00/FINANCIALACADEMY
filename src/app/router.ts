import type { Tema } from '../content/schema.ts';
import { LECCIONES_TEMA2, PARTES_LECCION, type LeccionTema2, type ParteLeccion } from '../content/temas/tema-02/index.ts';

export type Ruta =
  | { vista: 'inicio'; scrollArriba: boolean }
  | { vista: 'examen' | 'simulacro' | 'repaso' | 'sesion' | 'progreso' | 'visual'; scrollArriba: boolean }
  /** Repaso de un solo concepto (desde el modo noche del mapa). */
  | { vista: 'repaso'; conceptoId: string; scrollArriba: boolean }
  | { vista: 'seccion'; seccionId: string; conceptoFoco: string | null; scrollArriba: boolean }
  /** Índice de todos los temas: es la entrada de la web (sin hash). */
  | { vista: 'temas'; scrollArriba: boolean }
  /** Tema 2: portada (`leccion: null`), una lección y, opcionalmente, una parte de ella. */
  | { vista: 'tema2'; leccion: LeccionTema2 | null; parte: ParteLeccion | null; scrollArriba: boolean };

/**
 * Rutas: `#temas` (entrada, también sin hash), `#tema/2[/<lección>[/<parte>]]`; del tema 1: `#inicio`, `#s/<sección>`, `#c/<concepto>`; y `#examen` (predicción),
 * `#simulacro`, `#repaso` (o `#repaso/<concepto>`), `#sesion` (estudiar hoy) y `#progreso`, solo si el tema tiene ampliación
 * con bloques.
 * Un id desconocido lleva al inicio. Con `#c/…` no se vuelve arriba porque se hace scroll al concepto.
 */
export function resolverRuta(hash: string, tema: Tema): Ruta {
  const h = (hash || '#temas').slice(1);
  const scrollArriba = !h.startsWith('c/');

  if (h === 'temas') return { vista: 'temas', scrollArriba: true };
  if (h === 'tema/2' || h.startsWith('tema/2/')) {
    const [, , leccionId, parteId] = h.split('/');
    const leccion = LECCIONES_TEMA2.find((l) => l.id === leccionId)?.id ?? null;
    const parte = leccion ? PARTES_LECCION.find((p) => p.id === parteId)?.id ?? null : null;
    // Una parte concreta hace scroll hasta ella; la lección o el tema sin parte, arriba.
    return { vista: 'tema2', leccion, parte, scrollArriba: parte === null };
  }

  if ((h === 'examen' || h === 'simulacro' || h === 'repaso' || h === 'sesion' || h === 'progreso') && tema.ampliacion?.bloques.length) return { vista: h, scrollArriba };
  if (h === 'visual' && tema.ampliacion?.infografias?.length) return { vista: 'visual', scrollArriba };
  if (h.startsWith('repaso/') && tema.ampliacion?.bloques.length) {
    const id = h.slice(7);
    if (tema.conceptos.some((c) => c.id === id)) return { vista: 'repaso', conceptoId: id, scrollArriba };
  }
  if (h.startsWith('s/')) {
    const id = h.slice(2);
    if (tema.secciones.some((s) => s.id === id)) return { vista: 'seccion', seccionId: id, conceptoFoco: null, scrollArriba };
  } else if (h.startsWith('c/')) {
    const concepto = tema.conceptos.find((c) => c.id === h.slice(2));
    if (concepto) return { vista: 'seccion', seccionId: concepto.seccionId, conceptoFoco: concepto.id, scrollArriba };
  }
  return { vista: 'inicio', scrollArriba };
}

export const hrefInicio = () => '#inicio';
export const hrefTemas = () => '#temas';
export const hrefTema2 = (leccion?: LeccionTema2, parte?: ParteLeccion) =>
  leccion ? `#tema/2/${leccion}${parte ? `/${parte}` : ''}` : '#tema/2';
export const hrefSeccion = (seccionId: string) => `#s/${seccionId}`;
export const hrefConcepto = (conceptoId: string) => `#c/${conceptoId}`;
export const hrefExamen = () => '#examen';
export const hrefSimulacro = () => '#simulacro';
export const hrefRepaso = (conceptoId?: string) => (conceptoId ? `#repaso/${conceptoId}` : '#repaso');
export const hrefSesion = () => '#sesion';
export const hrefProgreso = () => '#progreso';
export const hrefVisual = () => '#visual';
