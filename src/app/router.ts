import { buscarAsignatura, ID_GESTION_FINANCIERA } from '../content/academia.ts';
import type { Tema } from '../content/schema.ts';
import { LECCIONES_TEMA2, PARTES_LECCION, type LeccionTema2, type ParteLeccion } from '../content/temas/tema-02/index.ts';

export type Ruta =
  | { vista: 'inicio'; scrollArriba: boolean }
  | { vista: 'examen' | 'simulacro' | 'repaso' | 'sesion' | 'progreso' | 'visual'; scrollArriba: boolean }
  /** Repaso de un solo concepto (desde el modo noche del mapa). */
  | { vista: 'repaso'; conceptoId: string; scrollArriba: boolean }
  | { vista: 'seccion'; seccionId: string; conceptoFoco: string | null; scrollArriba: boolean }
  /** Selector de asignaturas (Financial Academy): es la entrada de la web (sin hash). */
  | { vista: 'academia'; scrollArriba: boolean }
  /** Una asignatura: sus temas y su temario. `#temas` lleva a la de Gestión Financiera. */
  | { vista: 'asignatura'; asignaturaId: string; scrollArriba: boolean }
  /** Tema 2: portada (`leccion: null`), una lección y, opcionalmente, una parte de ella. */
  | { vista: 'tema2'; leccion: LeccionTema2 | null; parte: ParteLeccion | null; scrollArriba: boolean };

/**
 * Rutas: `#academia` (entrada, también sin hash), `#a/<asignatura>` (y `#temas`, la de Gestión
 * Financiera), `#tema/2[/<lección>[/<parte>]]`; del tema 1: `#inicio`, `#s/<sección>`, `#c/<concepto>`; y `#examen` (predicción),
 * `#simulacro`, `#repaso` (o `#repaso/<concepto>`), `#sesion` (estudiar hoy) y `#progreso`, solo si el tema tiene ampliación
 * con bloques.
 * Un id desconocido lleva al inicio. Con `#c/…` no se vuelve arriba porque se hace scroll al concepto.
 */
export function resolverRuta(hash: string, tema: Tema): Ruta {
  const h = (hash || '#academia').slice(1);
  const scrollArriba = !h.startsWith('c/');

  if (h === 'academia' || h === '') return { vista: 'academia', scrollArriba: true };
  if (h === 'temas') return { vista: 'asignatura', asignaturaId: ID_GESTION_FINANCIERA, scrollArriba: true };
  if (h.startsWith('a/')) {
    const a = buscarAsignatura(h.slice(2));
    return a ? { vista: 'asignatura', asignaturaId: a.id, scrollArriba: true } : { vista: 'academia', scrollArriba: true };
  }
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
export const hrefTemas = () => `#a/${ID_GESTION_FINANCIERA}`;
export const hrefAcademia = () => '#academia';
export const hrefAsignatura = (id: string) => `#a/${id}`;
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
