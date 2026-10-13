/*
 * Ejercicios de práctica del laboratorio: datos aleatorios pero reproducibles (la misma semilla da el
 * mismo ejercicio), dentro de rangos «de libro» y coherentes entre sí: los datos que dependen de
 * otros (Cₙ a partir de C₀, i y n) se calculan con la ley de la fórmula y se redondean al céntimo,
 * como en un enunciado. Se marcan siempre como «Ejercicio de práctica»: no son del libro.
 * El comprobador resuelve con los datos tal como se presentan, así que la respuesta es exacta.
 */
import { aleatorio } from '../exam.ts';
import { formatear } from './expresion.ts';
import { LABORATORIOS } from './laboratorio.ts';
import { convertirDuracion, convertirTipo, unidad, type Convenio, type Regimen, type Unidad } from './periodos.ts';

export interface PeriodicidadEjercicio {
  /** Unidad del tipo aplicado en el ejercicio. */
  unidad: Unidad;
  /** Periodos de esa unidad que caben en un año (360/365 si son días). */
  m: number;
  convenio: Convenio;
  /** Duración de referencia en años; n ya se guarda como número de periodos en los datos. */
  duracionAnios: number;
}

export interface EjercicioGenerado {
  semilla: number;
  /** Datos como los escribiría un enunciado: «12.110,47 €», «6,25 %», «3», «90/360». */
  datos: Record<string, string>;
  /** Solo aparece cuando se activa la generación con todos los periodos. */
  periodicidad?: PeriodicidadEjercicio;
}

const redondear = (v: number) => Math.round(v * 100) / 100;
const euros = (v: number) => `${formatear(v, Number.isInteger(v) ? 0 : 2)} €`;
const porcentaje = (v: number) => {
  const r = Number((v * 100).toFixed(2));
  return `${formatear(r, (String(r).split('.')[1] ?? '').length)} %`;
};

/** Conserva los decimales necesarios en tipos diarios y en equivalencias fraccionadas. */
function tipoVisible(v: number): { texto: string; valor: number } {
  const porcentajeExacto = v * 100;
  let decimales = 2;
  while (decimales < 8 && Math.abs(Number(porcentajeExacto.toFixed(decimales)) - porcentajeExacto) > 1e-9) decimales++;
  const mostrado = Number(porcentajeExacto.toFixed(decimales));
  return { texto: `${formatear(mostrado, decimales)} %`, valor: mostrado / 100 };
}

const UNIDADES_INTERES: readonly Unidad[] = ['año', 'semestre', 'cuatrimestre', 'trimestre', 'mes', 'dia'];

/** Genera un ejercicio de práctica para una fórmula (null si la fórmula no calcula una incógnita). */
export function generarEjercicio(idFormula: string, semilla: number, opciones: { todosLosPeriodos?: boolean } = {}): EjercicioGenerado | null {
  const lab = LABORATORIOS[idFormula];
  if (!lab) return null;
  const azar = aleatorio(semilla * 2654435761);
  const entre = (min: number, max: number, paso: number) => min + Math.floor(azar() * (Math.round((max - min) / paso) + 1)) * paso;
  const elegir = <T>(lista: readonly T[]) => lista[Math.floor(azar() * lista.length)]!;

  const c0 = entre(1000, 50000, 50);
  const tasaAnual = Number(entre(0.01, 0.12, 0.0025).toFixed(4));
  const todosLosPeriodos = opciones.todosLosPeriodos === true;
  const unidadTasa = todosLosPeriodos ? elegir(UNIDADES_INTERES) : 'año';
  const convenioTasa: Convenio = unidadTasa === 'dia' ? elegir([360, 365] as const) : 360;
  const mTasa = unidad(unidadTasa).porAño(convenioTasa);
  const duracionAnios = entre(2, 10, 1);
  const n = duracionAnios * mTasa;
  const periodo: PeriodicidadEjercicio | undefined = todosLosPeriodos
    ? { unidad: unidadTasa, m: mTasa, convenio: convenioTasa, duracionAnios }
    : undefined;
  // En cada ejercicio el tipo se expresa por el periodo indicado. La conversión conserva el
  // rendimiento anual: proporcional en simple y equivalente en compuesta.
  const tasaSimple = tipoVisible(convertirTipo(tasaAnual, 'año', unidadTasa, 'simple', convenioTasa).resultado);
  const tasaCompuesta = tipoVisible(convertirTipo(tasaAnual, 'año', unidadTasa, 'compuesta', convenioTasa).resultado);
  const iSimple = tasaSimple.valor;
  const iCompuesta = tasaCompuesta.valor;
  const cnSimple = redondear(c0 * (1 + n * iSimple));
  const cnCompuesta = redondear(c0 * (1 + iCompuesta) ** n);
  const nominal = entre(1000, 30000, 50);
  const dias = entre(15, 180, 5);
  const d = Number(entre(0.02, 0.1, 0.0025).toFixed(4));
  const mFraccionado = todosLosPeriodos ? mTasa : elegir([2, 3, 4, 12] as const);
  const tasaDescuentoSimple = tipoVisible(convertirTipo(d, 'año', unidadTasa, 'simple', convenioTasa).resultado);
  const tasaDescuentoCompuesto = tipoVisible(convertirTipo(d, 'año', unidadTasa, 'compuesta', convenioTasa).resultado);
  const nDescuento = todosLosPeriodos ? duracionAnios * mTasa : 0;
  const cnCompDescuento = redondear(nominal);
  const nCompDescuento = entre(2, 6, 1) * (todosLosPeriodos ? mTasa : 1);

  const textos: Record<string, Record<string, string>> = {
    'simple-intereses': { C_0: euros(c0), n: String(n), i: tasaSimple.texto },
    'simple-montante': { C_0: euros(c0), n: String(n), i: tasaSimple.texto },
    'simple-capital-inicial': { C_n: euros(cnSimple), n: String(n), i: tasaSimple.texto },
    'simple-tipo': { C_0: euros(c0), C_n: euros(cnSimple), n: String(n) },
    'simple-tiempo': { C_0: euros(c0), C_n: euros(cnSimple), i: tasaSimple.texto },
    'simple-fraccionado': { i: porcentaje(tasaAnual), m: String(mFraccionado) },
    'compuesta-montante': { C_0: euros(c0), i: tasaCompuesta.texto, n: String(n) },
    'compuesta-intereses': { C_0: euros(c0), i: tasaCompuesta.texto, n: String(n) },
    'compuesta-capital-inicial': { C_n: euros(cnCompuesta), i: tasaCompuesta.texto, n: String(n) },
    'compuesta-tiempo': { C_0: euros(c0), C_n: euros(cnCompuesta), i: tasaCompuesta.texto },
    'compuesta-tipo': { C_0: euros(c0), C_n: euros(cnCompuesta), n: String(n) },
    'compuesta-equivalentes': { i: porcentaje(tasaAnual), m: String(todosLosPeriodos ? mTasa : mFraccionado) },
    'compuesta-tae': { J_m: porcentaje(tasaAnual), m: String(todosLosPeriodos ? mTasa : mFraccionado) },
    'descuento-comercial': { N: euros(nominal), n: todosLosPeriodos ? String(nDescuento) : `${dias}/360`, d: todosLosPeriodos ? tasaDescuentoSimple.texto : porcentaje(d) },
    'descuento-racional': { C_n: euros(nominal), n: todosLosPeriodos ? String(nDescuento) : `${dias}/360`, i: todosLosPeriodos ? tasaDescuentoSimple.texto : porcentaje(d) },
    'descuento-compuesto-racional': { C_n: euros(cnCompDescuento), n: String(nCompDescuento), i: tasaDescuentoCompuesto.texto },
    'descuento-compuesto-comercial': { N: euros(nominal), n: String(nCompDescuento), d: tasaDescuentoCompuesto.texto },
  };
  const datos = textos[idFormula];
  const esVariablePeriodo = /^(simple|compuesta)-(intereses|montante|capital-inicial|tipo|tiempo|fraccionado|equivalentes|tae)$/.test(idFormula)
    || /^descuento-(comercial|racional|compuesto-racional|compuesto-comercial)$/.test(idFormula);
  const periodicidad = todosLosPeriodos && esVariablePeriodo ? periodo : undefined;
  return datos ? { semilla, datos, ...(periodicidad ? { periodicidad } : {}) } : null;
}

/** Semilla nueva para «Otro ejercicio» (visible y reproducible: 1–99999). */
export const nuevaSemilla = (anterior = 0): number => ((anterior * 7919 + 104729) % 99991) + 1;

/* ------------------------------------------------------------------------ unidades de tiempo */

export interface PreguntaTiempo {
  semilla: number;
  modo: 'duracion' | 'tipo';
  /** Cantidad (duración) o tipo en tanto por uno. */
  valor: number;
  de: Unidad;
  a: Unidad;
  convenio: Convenio;
  regimen: Regimen;
  /** La respuesta exacta (sin redondear). */
  resultado: number;
  /** Lo que daría repartir en proporción: en compuesta, el error típico. */
  proporcional: number;
}

const TODAS: readonly Unidad[] = ['año', 'semestre', 'cuatrimestre', 'trimestre', 'mes', 'dia'];
/** Rangos «de libro» de cada unidad: cantidad (duración) y tipo (tanto por uno), con su paso. */
const CANTIDAD: Record<Unidad, [number, number, number]> = { año: [0.5, 5, 0.5], semestre: [1, 8, 1], cuatrimestre: [1, 9, 1], trimestre: [1, 10, 1], mes: [1, 30, 1], dia: [15, 400, 5] };
const TIPO: Record<Unidad, [number, number, number]> = { año: [0.02, 0.12, 0.005], semestre: [0.01, 0.06, 0.005], cuatrimestre: [0.01, 0.04, 0.0025], trimestre: [0.005, 0.03, 0.0025], mes: [0.0025, 0.015, 0.0025], dia: [0.0001, 0.0005, 0.0001] };

/**
 * Ejercicio aleatorio de unidades de tiempo: pasar una duración, o un tipo de interés (en simple o en
 * compuesta), de una unidad a otra. Reproducible con la semilla. Con días, el convenio (360 o 365)
 * también sale al azar, como en los enunciados.
 */
export function generarPreguntaTiempo(semilla: number, modo: 'duracion' | 'tipo', regimen?: Regimen): PreguntaTiempo {
  const azar = aleatorio(semilla * 2654435761 + (modo === 'tipo' ? 17 : 5));
  const elegir = <T>(lista: readonly T[]) => lista[Math.floor(azar() * lista.length)]!;
  const entre = ([min, max, paso]: [number, number, number]) => Number((min + Math.floor(azar() * (Math.round((max - min) / paso) + 1)) * paso).toFixed(4));
  // Un tipo se da por año o por una fracción del año (no por día); la duración, en cualquier unidad.
  const de = elegir(modo === 'tipo' ? TODAS.filter((u) => u !== 'dia') : TODAS);
  const a = elegir(TODAS.filter((u) => u !== de));
  const convenio: Convenio = de === 'dia' || a === 'dia' ? elegir([360, 365] as const) : 360;
  const reg: Regimen = regimen ?? elegir(['simple', 'compuesta'] as const);
  if (modo === 'duracion') {
    const valor = entre(CANTIDAD[de]);
    const r = convertirDuracion(valor, de, a, convenio).resultado;
    return { semilla, modo, valor, de, a, convenio, regimen: reg, resultado: r, proporcional: r };
  }
  const valor = entre(TIPO[de]);
  const c = convertirTipo(valor, de, a, reg, convenio);
  return { semilla, modo, valor, de, a, convenio, regimen: reg, resultado: c.resultado, proporcional: c.proporcional };
}
