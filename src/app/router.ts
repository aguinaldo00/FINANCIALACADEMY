import { PROYECTO_BLOQUEADO } from '../config/bloqueos.ts';
import { buscarAsignatura, ID_GESTION_FINANCIERA } from '../content/academia.ts';
import type { Tema } from '../content/schema.ts';
import { FASES_TEMA2, LECCIONES_TEMA2, type FaseTema2 } from '../content/temas/tema-02/index.ts';
import { BLOQUES, formulaPorId, type BloqueId } from '../content/temas/tema-02/formulas.ts';

/** Pantallas del Tema 2: el índice de fórmulas (todo o un bloque), la ficha de una fórmula y las fases B–D de un bloque. */
export type PantallaTema2 =
  | { tipo: 'indice'; bloque: BloqueId | null }
  | { tipo: 'formula'; id: string }
  | { tipo: 'fase'; bloque: BloqueId; fase: Exclude<FaseTema2, 'formulas'> };

export type Ruta =
  | { vista: 'inicio'; scrollArriba: boolean }
  | { vista: 'examen' | 'simulacro' | 'repaso' | 'sesion' | 'progreso' | 'visual' | 'glosario' | 'normativa'; scrollArriba: boolean }
  /** Repaso de un solo concepto (desde el modo noche del mapa). */
  | { vista: 'repaso'; conceptoId: string; scrollArriba: boolean }
  | { vista: 'seccion'; seccionId: string; conceptoFoco: string | null; scrollArriba: boolean }
  /** Selector de asignaturas (Financial Academy): es la entrada de la web (sin hash). */
  | { vista: 'academia'; scrollArriba: boolean }
  /** Una asignatura: sus temas y su temario. `#temas` lleva a la de Gestión Financiera. */
  | { vista: 'asignatura'; asignaturaId: string; scrollArriba: boolean }
  /** Información y guía global del proyecto; el segundo hash es un ancla dentro de esa página. */
  | { vista: 'proyecto'; ancla: string | null; scrollArriba: boolean }
  /** Tema 2: índice de fórmulas, ficha de una fórmula o una fase de práctica de un bloque. */
  | { vista: 'tema2'; pantalla: PantallaTema2; scrollArriba: boolean };

/**
 * Rutas: `#academia` (entrada, también sin hash), `#a/<asignatura>` (y `#temas`, la de Gestión
 * Financiera), `#tema/2`, `#tema/2/f/<fórmula>`, `#tema/2/<bloque>[/<fase>]`; del tema 1: `#inicio`, `#s/<sección>`, `#c/<concepto>`; y `#examen` (pesos orientativos),
 * `#simulacro`, `#repaso` (o `#repaso/<concepto>`), `#sesion` (estudiar hoy) y `#progreso`, solo si el tema tiene ampliación
 * con bloques.
 * Un id desconocido lleva al inicio. Con `#c/…` no se vuelve arriba porque se hace scroll al concepto.
 */
export function resolverRuta(hash: string, tema: Tema): Ruta {
  const h = (hash || '#academia').slice(1);
  const scrollArriba = !h.startsWith('c/');

  if (!PROYECTO_BLOQUEADO && (h === 'proyecto' || h.startsWith('proyecto/'))) {
    const anclaProyecto = h.slice('proyecto/'.length);
    return { vista: 'proyecto', ancla: h === 'proyecto' ? null : anclaProyecto || null, scrollArriba: h === 'proyecto' };
  }
  if (h === 'academia' || h === '') return { vista: 'academia', scrollArriba: true };
  if (h === 'temas') return { vista: 'asignatura', asignaturaId: ID_GESTION_FINANCIERA, scrollArriba: true };
  if (h.startsWith('a/')) {
    const a = buscarAsignatura(h.slice(2));
    return a ? { vista: 'asignatura', asignaturaId: a.id, scrollArriba: true } : { vista: 'academia', scrollArriba: true };
  }
  if (h === 'tema/2' || h.startsWith('tema/2/') || h.startsWith('tema/2#')) {
    // Un segundo «#» es un ancla dentro de la pantalla (un ejercicio concreto): no se vuelve arriba.
    const [conConsulta, ancla] = h.split('#');
    // «?ejercicio=…&n=…» (enlace a un ejercicio concreto) lo lee el laboratorio; aquí no cuenta.
    const camino = conConsulta!.split('?')[0]!;
    const r = pantallaTema2(camino.split('/').slice(2));
    return { vista: 'tema2', pantalla: r.pantalla, scrollArriba: r.scrollArriba && !ancla };
  }

  if ((h === 'examen' || h === 'simulacro' || h === 'repaso' || h === 'sesion' || h === 'progreso') && tema.ampliacion?.bloques.length) return { vista: h, scrollArriba };
  if (h === 'visual' && tema.ampliacion?.infografias?.length) return { vista: 'visual', scrollArriba };
  if (h === 'glosario') return { vista: 'glosario', scrollArriba };
  if (h === 'normativa') return { vista: 'normativa', scrollArriba };
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

/** Partes de la lección anterior → su sitio en el tema rehecho (los enlaces guardados siguen valiendo). */
const PARTE_ANTERIOR: Record<string, PantallaTema2> = {
  simbolos: { tipo: 'indice', bloque: 'compuesta' },
  leccion: { tipo: 'fase', bloque: 'compuesta', fase: 'practica' },
  errores: { tipo: 'fase', bloque: 'compuesta', fase: 'practica' },
  papel: { tipo: 'fase', bloque: 'compuesta', fase: 'practica' },
  reconocer: { tipo: 'fase', bloque: 'compuesta', fase: 'elegir' },
};

function pantallaTema2(partes: string[]): { pantalla: PantallaTema2; scrollArriba: boolean } {
  const [a, b] = partes;
  const indice = (bloque: BloqueId | null) => ({ pantalla: { tipo: 'indice', bloque } as PantallaTema2, scrollArriba: bloque === null });
  if (a === 'f' && b && formulaPorId(b)) return { pantalla: { tipo: 'formula', id: b }, scrollArriba: true };
  if (a && LECCIONES_TEMA2.some((l) => l.id === a)) {
    const destino = (b && PARTE_ANTERIOR[b]) || { tipo: 'indice', bloque: 'compuesta' };
    return { pantalla: destino, scrollArriba: destino.tipo !== 'indice' };
  }
  const bloque = BLOQUES.find((x) => x.id === a)?.id;
  if (!bloque) return indice(null);
  const fase = FASES_TEMA2.find((f) => f.id === b)?.id;
  if (!fase || fase === 'formulas') return indice(bloque);
  return { pantalla: { tipo: 'fase', bloque, fase }, scrollArriba: true };
}

export const hrefInicio = () => '#inicio';
export const hrefTemas = () => `#a/${ID_GESTION_FINANCIERA}`;
export const hrefAcademia = () => '#academia';
export const hrefProyecto = (ancla?: string) => ancla ? `#proyecto/${ancla}` : '#proyecto';
export const hrefAsignatura = (id: string) => `#a/${id}`;
export const hrefTema2 = () => '#tema/2';
export const hrefBloqueTema2 = (bloque: BloqueId) => `#tema/2/${bloque}`;
export const hrefFormula = (id: string) => `#tema/2/f/${id}`;
export const hrefFase = (bloque: BloqueId, fase: FaseTema2) => (fase === 'formulas' ? hrefBloqueTema2(bloque) : `#tema/2/${bloque}/${fase}`);
export const hrefSeccion = (seccionId: string) => `#s/${seccionId}`;
export const hrefConcepto = (conceptoId: string) => `#c/${conceptoId}`;
export const hrefExamen = () => '#examen';
export const hrefSimulacro = () => '#simulacro';
export const hrefRepaso = (conceptoId?: string) => (conceptoId ? `#repaso/${conceptoId}` : '#repaso');
export const hrefSesion = () => '#sesion';
export const hrefProgreso = () => '#progreso';
export const hrefVisual = () => '#visual';
export const hrefGlosario = () => '#glosario';
export const hrefNormativa = () => '#normativa';
