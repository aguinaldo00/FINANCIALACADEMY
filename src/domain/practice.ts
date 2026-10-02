/**
 * Práctica persistente de un tema: preguntas falladas (para repasarlas), estado de las flashcards
 * (repetición espaciada tipo Leitner) y notas de los simulacros. No afecta al dominio.
 */

export interface EstadoFallo {
  /** Veces que se ha fallado. */
  veces: number;
  /** Aciertos seguidos desde el último fallo. */
  racha: number;
  /** Fecha (AAAA-MM-DD) del último fallo. */
  ultima: string;
}

export interface EstadoTarjeta {
  /** Caja de Leitner: 0 (nueva o fallada) … 4 (bien sabida). */
  caja: number;
  /** Fecha (AAAA-MM-DD) a partir de la que vuelve a tocar. */
  proxima: string;
  /** Fecha (AAAA-MM-DD) en que se vio por primera vez (cuenta para el cupo de nuevas del día). */
  inicio: string;
}

export interface ResultadoSimulacroGuardado {
  fecha: string;
  aciertos: number;
  total: number;
}

export interface Practica {
  fallos: Record<string, EstadoFallo>;
  tarjetas: Record<string, EstadoTarjeta>;
  simulacros: ResultadoSimulacroGuardado[];
}

export const practicaVacia = (): Practica => ({ fallos: {}, tarjetas: {}, simulacros: [] });

/** Aciertos seguidos que hacen falta para que una pregunta salga del repaso. */
export const ACIERTOS_PARA_SALIR = 2;
/** Días hasta la siguiente vez, según la caja (0 = hoy mismo). */
export const INTERVALOS = [0, 1, 3, 7, 14];
/** Tarjetas nuevas que entran cada día (las demás esperan). */
export const NUEVAS_POR_DIA = 10;
export const SIMULACROS_GUARDADOS = 10;

/** Id estable de una pregunta: la oficial del concepto o la de práctica. */
export const idPregunta = (conceptoId: string, idExtra?: string): string => idExtra ?? `oficial:${conceptoId}`;
/** Id de la tarjeta de DATA de un concepto (nombre → frase de examen). */
export const idTarjetaFrase = (conceptoId: string): string => `frase:${conceptoId}`;

/** Fecha local AAAA-MM-DD. */
export function fechaDe(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function sumarDias(fecha: string, dias: number): string {
  const [a, m, d] = fecha.split('-').map(Number);
  return fechaDe(new Date(a!, m! - 1, d! + dias));
}

export function registrarFallo(p: Practica, id: string, hoy: string): Practica {
  const previo = p.fallos[id];
  return { ...p, fallos: { ...p.fallos, [id]: { veces: (previo?.veces ?? 0) + 1, racha: 0, ultima: hoy } } };
}

/** Un acierto solo cuenta si la pregunta estaba en el repaso; con 2 seguidos, sale de él. */
export function registrarAcierto(p: Practica, id: string): Practica {
  const previo = p.fallos[id];
  if (!previo) return p;
  const fallos = { ...p.fallos };
  if (previo.racha + 1 >= ACIERTOS_PARA_SALIR) delete fallos[id];
  else fallos[id] = { ...previo, racha: previo.racha + 1 };
  return { ...p, fallos };
}

export function calificarTarjeta(p: Practica, id: string, sabia: boolean, hoy: string): Practica {
  const previa = p.tarjetas[id];
  const caja = sabia ? Math.min(INTERVALOS.length - 1, (previa?.caja ?? 0) + 1) : 0;
  return { ...p, tarjetas: { ...p.tarjetas, [id]: { caja, proxima: sumarDias(hoy, INTERVALOS[caja]!), inicio: previa?.inicio ?? hoy } } };
}

/**
 * Tarjetas que tocan hoy: las ya vistas cuya fecha ha llegado y, además, nuevas (en el orden dado)
 * hasta completar el cupo del día (`nuevas` menos las que ya se empezaron hoy).
 */
export function tarjetasPendientes(ids: string[], p: Practica, hoy: string, nuevas = NUEVAS_POR_DIA): string[] {
  const vencidas = ids.filter((id) => p.tarjetas[id] && p.tarjetas[id]!.proxima <= hoy);
  const empezadasHoy = Object.values(p.tarjetas).filter((t) => t.inicio === hoy).length;
  const sinVer = ids.filter((id) => !p.tarjetas[id]).slice(0, Math.max(0, nuevas - empezadasHoy));
  return [...vencidas, ...sinVer];
}

export function registrarSimulacro(p: Practica, r: ResultadoSimulacroGuardado): Practica {
  return { ...p, simulacros: [...p.simulacros, r].slice(-SIMULACROS_GUARDADOS) };
}

/** Normaliza lo leído del almacenamiento: descarta lo que no tiene la forma esperada. */
export function sanearPractica(crudo: unknown): Practica {
  const p = practicaVacia();
  if (!crudo || typeof crudo !== 'object') return p;
  const c = crudo as Partial<Practica>;
  const esFecha = (f: unknown): f is string => typeof f === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(f);
  for (const [id, f] of Object.entries(c.fallos ?? {})) {
    if (f && Number.isFinite(f.veces) && Number.isFinite(f.racha) && esFecha(f.ultima)) p.fallos[id] = { veces: f.veces, racha: f.racha, ultima: f.ultima };
  }
  for (const [id, t] of Object.entries(c.tarjetas ?? {})) {
    if (t && Number.isInteger(t.caja) && t.caja >= 0 && t.caja < INTERVALOS.length && esFecha(t.proxima)) {
      p.tarjetas[id] = { caja: t.caja, proxima: t.proxima, inicio: esFecha(t.inicio) ? t.inicio : t.proxima };
    }
  }
  if (Array.isArray(c.simulacros)) {
    p.simulacros = c.simulacros
      .filter((s) => s && esFecha(s.fecha) && Number.isFinite(s.aciertos) && Number.isFinite(s.total))
      .slice(-SIMULACROS_GUARDADOS);
  }
  return p;
}
