import type { Progreso } from '../domain/progress.ts';

/** Clave del prototipo legacy: `cdd-t<tema>` con forma `{ dom, tries }`. */
export const claveLegacy = (numeroTema: number) => `cdd-t${numeroTema}`;

const esObjeto = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

function mapaNumerico(v: unknown, valido: (n: number) => boolean): Record<string, number> {
  const salida: Record<string, number> = {};
  if (!esObjeto(v)) return salida;
  for (const [clave, n] of Object.entries(v)) {
    if (typeof n === 'number' && Number.isFinite(n) && valido(n)) salida[clave] = n;
  }
  return salida;
}

const dominioValido = (n: number) => n >= 0 && n <= 1;
const intentosValidos = (n: number) => Number.isInteger(n) && n >= 0;

/** Normaliza un progreso ya en formato v2 descartando valores corruptos. */
export function sanearProgreso(v: unknown): Progreso {
  const o = esObjeto(v) ? v : {};
  return { dominio: mapaNumerico(o.dominio, dominioValido), intentos: mapaNumerico(o.intentos, intentosValidos) };
}

/** Convierte `{ dom, tries }` del prototipo al formato actual. */
export function desdeLegacy(v: unknown): Progreso | null {
  if (!esObjeto(v)) return null;
  return { dominio: mapaNumerico(v.dom, dominioValido), intentos: mapaNumerico(v.tries, intentosValidos) };
}

/**
 * Fusiona el progreso legacy en el actual sin perder nada: el dominio se queda con el máximo
 * (en el prototipo nunca baja) y los intentos actuales tienen prioridad. Es idempotente.
 */
export function fusionarProgreso(actual: Progreso, legacy: Progreso): Progreso {
  const dominio = { ...actual.dominio };
  for (const [id, v] of Object.entries(legacy.dominio)) dominio[id] = Math.max(dominio[id] || 0, v);
  return { dominio, intentos: { ...legacy.intentos, ...actual.intentos } };
}
