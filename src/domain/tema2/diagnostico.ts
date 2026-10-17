/*
 * Diagnóstico de los fallos del Tema 2 y lo que se guarda de la práctica con reloj (en este
 * navegador, aparte del progreso del Tema 1):
 *  - el tipo de cada fallo: lectura (dato o incógnita mal leídos), elección (otra fórmula),
 *    unidades (tiempo y tipo en unidades distintas) o cálculo (todo bien menos el resultado);
 *  - el tiempo que se tarda en cada fórmula en el examen real (mejor y último);
 *  - los simulacros entregados (nota, tiempo y fallos por tipo).
 */
import type { PeriodicidadEjercicio } from './generador.ts';
import { comprobar, esperado, type Laboratorio, leerDato } from './laboratorio.ts';

export type TipoFallo = 'lectura' | 'eleccion' | 'unidades' | 'calculo';

export const NOMBRE_FALLO: Readonly<Record<TipoFallo, string>> = {
  lectura: 'Lectura del enunciado',
  eleccion: 'Elección de la fórmula',
  unidades: 'Unidades (tiempo y tipo)',
  calculo: 'Cálculo',
};

export const CONSEJO_FALLO: Readonly<Record<TipoFallo, string>> = {
  lectura: 'Vuelve a «Cómo leer un enunciado»: primero qué te piden, después cada dato a su símbolo.',
  eleccion: 'Busca la fórmula que tiene todos tus datos y la incógnita (fase B · Elegir).',
  unidades: 'El tipo y el tiempo tienen que ir en la misma unidad: con un tipo anual, n en años.',
  calculo: 'Planteamiento bien: repasa la sustitución y los paréntesis en la calculadora.',
};

export interface Planteamiento {
  /** ¿Leyó bien la incógnita y los datos? (null si no se preguntó). */
  lecturaBien: boolean | null;
  /** ¿Eligió una fórmula válida? (null si no se preguntó). */
  formulaBien: boolean | null;
  resultado: string;
}

/**
 * Tipo del fallo, o null si el resultado es correcto. Si el planteamiento está bien y el resultado
 * coincide con el de usar n en otra unidad (años en vez de periodos, días en vez de fracción de año),
 * el fallo es de unidades.
 */
export function diagnosticar(p: Planteamiento, lab: Laboratorio, datos: Readonly<Record<string, string>>, periodicidad?: PeriodicidadEjercicio): TipoFallo | null {
  const valores: Record<string, number> = {};
  for (const d of lab.datos) {
    const l = leerDato(datos[d.simbolo] ?? '', d.magnitud);
    if (l.ok === true) valores[d.simbolo] = l.valor;
  }
  const x = esperado(lab, valores);
  if (x !== null && comprobar(p.resultado, lab, x).bien) return null;
  if (p.lecturaBien === false) return 'lectura';
  if (p.formulaBien === false) return 'eleccion';
  const n = valores.n;
  if (n !== undefined && lab.datos.some((d) => d.simbolo === 'n')) {
    const alternativas = new Set<number>();
    const texto = datos.n ?? '';
    if (texto.includes('/')) alternativas.add(Number(texto.split('/')[0]));
    if (periodicidad) {
      alternativas.add(periodicidad.duracionAnios);
      alternativas.add(n * periodicidad.m);
      alternativas.add(n / periodicidad.m);
    }
    for (const a of alternativas) {
      if (!Number.isFinite(a) || Math.abs(a - n) < 1e-9) continue;
      const y = esperado(lab, { ...valores, n: a });
      if (y !== null && comprobar(p.resultado, lab, y).bien) return 'unidades';
    }
  }
  return 'calculo';
}

/* ---------------------------------------------------------------------- lo que se guarda */

const CLAVE_FALLOS = 'fa-t2-fallos';
const CLAVE_TIEMPOS = 'fa-t2-tiempos';
const CLAVE_SIMULACROS = 'fa-t2-simulacros';

function leer<T>(clave: string, vacio: T): T {
  try {
    const v = JSON.parse(localStorage.getItem(clave) ?? 'null') as T | null;
    return v ?? vacio;
  } catch {
    return vacio;
  }
}
function escribir(clave: string, valor: unknown): void {
  try { localStorage.setItem(clave, JSON.stringify(valor)); } catch { /* sin almacenamiento: se trabaja igual */ }
}

export type CuentaFallos = Record<TipoFallo, number>;
export const fallosGuardados = (): CuentaFallos => ({ lectura: 0, eleccion: 0, unidades: 0, calculo: 0, ...leer<Partial<CuentaFallos>>(CLAVE_FALLOS, {}) });
export function anotarFallo(tipo: TipoFallo): void {
  const c = fallosGuardados();
  c[tipo]++;
  escribir(CLAVE_FALLOS, c);
}

export interface TiempoFormula { mejor: number; ultimo: number; veces: number }
export const tiemposGuardados = (): Record<string, TiempoFormula> => leer(CLAVE_TIEMPOS, {});
/** Anota cuánto se tardó en resolver bien una fórmula; devuelve el registro anterior (para comparar). */
export function anotarTiempo(formula: string, segundos: number): TiempoFormula | null {
  const todos = tiemposGuardados();
  const antes = todos[formula] ?? null;
  todos[formula] = { mejor: antes ? Math.min(antes.mejor, segundos) : segundos, ultimo: segundos, veces: (antes?.veces ?? 0) + 1 };
  escribir(CLAVE_TIEMPOS, todos);
  return antes;
}

export interface SimulacroGuardado { fecha: string; nota: number; aciertos: number; total: number; segundos: number; minutos: number; fallos: CuentaFallos }
export const simulacrosGuardados = (): SimulacroGuardado[] => leer(CLAVE_SIMULACROS, []);
export function anotarSimulacro(s: SimulacroGuardado): void {
  escribir(CLAVE_SIMULACROS, [...simulacrosGuardados(), s].slice(-20));
}
