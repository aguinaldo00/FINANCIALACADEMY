/*
 * Enunciados redactados para el laboratorio. El generador y la pregunta comparten los mismos datos:
 * la comprobación trabaja con lo que se ve, incluida la unidad de la tasa cuando se activa esa opción.
 */
import type { PeriodicidadEjercicio } from '../../../domain/tema2/generador.ts';

type Datos = Readonly<Record<string, string>>;

const UNIDAD: Record<PeriodicidadEjercicio['unidad'], { adj: string; singular: string; plural: string }> = {
  año: { adj: 'anual', singular: 'año', plural: 'años' },
  semestre: { adj: 'semestral', singular: 'semestre', plural: 'semestres' },
  cuatrimestre: { adj: 'cuatrimestral', singular: 'cuatrimestre', plural: 'cuatrimestres' },
  trimestre: { adj: 'trimestral', singular: 'trimestre', plural: 'trimestres' },
  mes: { adj: 'mensual', singular: 'mes', plural: 'meses' },
  dia: { adj: 'diario', singular: 'día', plural: 'días' },
};

/** La unidad del tipo y la del tiempo deben coincidir en las fórmulas de capitalización. */
const tiempo = (n: string, p?: PeriodicidadEjercicio) => {
  if (n.includes('/')) return `${n.split('/')[0]} días`;
  if (!p) return `${n} ${Number(n) === 1 ? 'año' : 'años'}`;
  const cantidad = Number(n.replace(',', '.'));
  const nombre = UNIDAD[p.unidad];
  return `${n} ${cantidad === 1 ? nombre.singular : nombre.plural}`;
};

const tipo = (ley: 'simple' | 'compuesto', tasa: string, p?: PeriodicidadEjercicio) => {
  const baseDia = p?.unidad === 'dia' ? ` (${p.convenio === 360 ? 'año comercial de 360 días' : 'año civil de 365 días'})` : '';
  return `interés ${ley} ${UNIDAD[p?.unidad ?? 'año'].adj}${baseDia} del ${tasa}`;
};

const UNIDAD_POR_M: Record<number, PeriodicidadEjercicio['unidad']> = {
  1: 'año', 2: 'semestre', 3: 'cuatrimestre', 4: 'trimestre', 12: 'mes', 360: 'dia', 365: 'dia',
};

const unidadDeM = (m: number, p?: PeriodicidadEjercicio) => p?.unidad ?? UNIDAD_POR_M[m] ?? 'mes';
const baseDias = (convenio: PeriodicidadEjercicio['convenio']) => convenio === 360 ? 'año comercial de 360 días' : 'año civil de 365 días';

const etiquetaCapitalizacion = (m: number, p?: PeriodicidadEjercicio) => {
  const frecuencia = unidadDeM(m, p);
  if (frecuencia === 'dia') return `diaria (${m} periodos al año; ${baseDias(p?.convenio ?? (m === 365 ? 365 : 360))})`;
  if (frecuencia === 'año') return 'anual';
  return `${UNIDAD[frecuencia].adj} (${m} periodos al año)`;
};

const ENUNCIADOS: Record<string, (d: Datos, p?: PeriodicidadEjercicio) => string> = {
  'simple-intereses': (d, p) => `Inviertes ${d.C_0} durante ${tiempo(d.n!, p)} a un tipo de ${tipo('simple', d.i!, p)}. ¿Cuántos intereses te producirá la inversión?`,
  'simple-montante': (d, p) => `Un ahorrador deposita ${d.C_0} en una cuenta que paga ${tipo('simple', d.i!, p)}. ¿Qué capital tendrá al cabo de ${tiempo(d.n!, p)}?`,
  'simple-capital-inicial': (d, p) => `¿Qué capital inicial debemos invertir hoy para obtener un capital final de ${d.C_n} al cabo de ${tiempo(d.n!, p)}, si la entidad financiera nos ofrece un tipo de ${tipo('simple', d.i!, p)}?`,
  'simple-tipo': (d, p) => `Un capital de ${d.C_0} se ha convertido en ${d.C_n} al cabo de ${tiempo(d.n!, p)} en régimen de capitalización simple. ¿A qué tipo ${UNIDAD[p?.unidad ?? 'año'].adj} se ha invertido?`,
  'simple-tiempo': (d, p) => `¿Cuánto tiempo debe estar invertido un capital de ${d.C_0} a un tipo de ${tipo('simple', d.i!, p)} para convertirse en ${d.C_n}?`,
  'simple-fraccionado': (d) => `Una entidad ofrece un ${d.i} de interés simple anual y liquida los intereses ${periodoCapitalizacion(Number(d.m))}. ¿Qué tipo de interés aplica en cada periodo?`,
  'compuesta-montante': (d, p) => `Se invierten ${d.C_0} durante ${tiempo(d.n!, p)} a un tipo de ${tipo('compuesto', d.i!, p)}. ¿Qué capital final se obtendrá?`,
  'compuesta-intereses': (d, p) => `¿Qué intereses producirá un capital de ${d.C_0} invertido durante ${tiempo(d.n!, p)} a un tipo de ${tipo('compuesto', d.i!, p)}?`,
  'compuesta-capital-inicial': (d, p) => `¿Qué capital hay que invertir hoy a un tipo de ${tipo('compuesto', d.i!, p)} para disponer de ${d.C_n} dentro de ${tiempo(d.n!, p)}?`,
  'compuesta-tiempo': (d, p) => `¿Cuánto tiempo tiene que estar invertido un capital de ${d.C_0} a un tipo de ${tipo('compuesto', d.i!, p)} para llegar a ${d.C_n}?`,
  'compuesta-tipo': (d, p) => `Un capital de ${d.C_0} se ha convertido en ${d.C_n} al cabo de ${tiempo(d.n!, p)} en capitalización compuesta. ¿Cuál es el tipo ${UNIDAD[p?.unidad ?? 'año'].adj} de la operación?`,
  'compuesta-equivalentes': (d, p) => {
    const unidadObjetivo = unidadDeM(Number(d.m), p);
    const baseDia = unidadObjetivo === 'dia' ? ` (${baseDias(p?.convenio ?? (Number(d.m) === 365 ? 365 : 360))})` : '';
    return `Una inversión ofrece un tipo efectivo anual de interés compuesto del ${d.i}. ¿Qué tipo ${UNIDAD[unidadObjetivo].adj}${baseDia} equivalente debe aplicarse para obtener el mismo rendimiento anual?`;
  },
  'compuesta-tae': (d, p) => `Un depósito ofrece un tipo nominal anual (TIN) del ${d.J_m} con capitalización ${etiquetaCapitalizacion(Number(d.m), p)}. ¿Cuál es su tasa anual equivalente (TAE)?`,
  'descuento-comercial': (d, p) => `Una empresa descuenta en su banco un efecto de ${d.N} de nominal que vence dentro de ${tiempo(d.n!, p)}. El banco aplica un ${tipo('simple', d.d!, p).replace('interés simple', 'descuento comercial simple')}. ¿A cuánto asciende el descuento?`,
  'descuento-racional': (d, p) => `Se quiere adelantar el cobro de ${d.C_n} que vencen dentro de ${tiempo(d.n!, p)}, con descuento racional simple a un tipo de ${tipo('simple', d.i!, p)}. ¿Cuál es el importe del descuento?`,
  'descuento-compuesto-racional': (d, p) => `Una deuda de ${d.C_n} vence dentro de ${tiempo(d.n!, p)}. Si se paga hoy aplicando un descuento compuesto racional a un tipo de ${tipo('compuesto', d.i!, p)}, ¿cuánto se descuenta?`,
  'descuento-compuesto-comercial': (d, p) => `Un efecto de ${d.N} de nominal vence dentro de ${tiempo(d.n!, p)} y se descuenta hoy con descuento compuesto comercial a un tipo de ${tipo('compuesto', d.d!, p)}. ¿Cuál es el importe del descuento?`,
};

function periodoCapitalizacion(m: number): string {
  const periodos: Record<number, string> = {
    1: 'una vez al año', 2: 'cada semestre', 3: 'cada cuatrimestre', 4: 'cada trimestre',
    12: 'cada mes', 360: 'cada día (año comercial de 360 días)', 365: 'cada día (año civil de 365 días)',
  };
  return periodos[m] ?? `${m} veces al año`;
}

/** Enunciado de una fórmula con sus datos y, si se activó, la periodicidad del tipo. */
export function enunciadoExamen(idFormula: string, datos: Datos, periodicidad?: PeriodicidadEjercicio): string | null {
  return ENUNCIADOS[idFormula]?.(datos, periodicidad) ?? null;
}
