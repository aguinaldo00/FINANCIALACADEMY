/*
 * Modo examen del laboratorio: el ejercicio aleatorio redactado como en un examen, sin decir qué
 * letra es cada dato ni qué fórmula usar. Los datos son los del generador (src/domain/tema2/
 * generador.ts), así que el resultado se comprueba igual que en el ejercicio aleatorio.
 * Pedido por el usuario el 12/10: «¿Qué capital inicial debemos invertir hoy…?».
 */

/** Adjetivo y periodo de cada fraccionamiento del año que da el generador. */
const PERIODO: Record<string, { adj: string; cada: string }> = {
  '2': { adj: 'semestral', cada: 'cada semestre' },
  '3': { adj: 'cuatrimestral', cada: 'cada cuatrimestre' },
  '4': { adj: 'trimestral', cada: 'cada trimestre' },
  '12': { adj: 'mensual', cada: 'cada mes' },
};

/** «90/360» → «90 días»; el resto, tal cual. */
const dias = (n: string) => `${n.split('/')[0]} días`;
const anos = (n: string) => `${n} ${n === '1' ? 'año' : 'años'}`;

type Datos = Readonly<Record<string, string>>;

const ENUNCIADOS: Record<string, (d: Datos) => string> = {
  'simple-intereses': (d) => `Inviertes ${d.C_0} durante ${anos(d.n!)} a un tipo de interés simple del ${d.i} anual. ¿Cuántos intereses te producirá la inversión?`,
  'simple-montante': (d) => `Un ahorrador deposita ${d.C_0} en una cuenta que paga un ${d.i} de interés simple anual. ¿Qué capital tendrá al cabo de ${anos(d.n!)}?`,
  'simple-capital-inicial': (d) => `¿Qué capital inicial debemos invertir hoy para obtener un capital final de ${d.C_n} al cabo de ${anos(d.n!)}, si la entidad financiera nos ofrece una tasa de interés simple anual del ${d.i}?`,
  'simple-tipo': (d) => `Un capital de ${d.C_0} se ha convertido en ${d.C_n} al cabo de ${anos(d.n!)} en régimen de capitalización simple. ¿A qué tipo de interés anual se ha invertido?`,
  'simple-tiempo': (d) => `¿Cuánto tiempo debe estar invertido un capital de ${d.C_0} al ${d.i} de interés simple anual para convertirse en ${d.C_n}?`,
  'simple-fraccionado': (d) => `Una entidad ofrece un ${d.i} de interés simple anual y liquida los intereses ${PERIODO[d.m!]?.cada ?? `${d.m} veces al año`}. ¿Qué tipo de interés ${PERIODO[d.m!]?.adj ?? 'de cada periodo'} aplica?`,
  'compuesta-montante': (d) => `Se invierten ${d.C_0} durante ${anos(d.n!)} al ${d.i} de interés compuesto anual. ¿Qué capital final se obtendrá?`,
  'compuesta-intereses': (d) => `¿Qué intereses producirá un capital de ${d.C_0} invertido durante ${anos(d.n!)} al ${d.i} de interés compuesto anual?`,
  'compuesta-capital-inicial': (d) => `¿Qué capital hay que invertir hoy al ${d.i} de interés compuesto anual para disponer de ${d.C_n} dentro de ${anos(d.n!)}?`,
  'compuesta-tiempo': (d) => `¿Cuánto tiempo tiene que estar invertido un capital de ${d.C_0} al ${d.i} de interés compuesto anual para llegar a ${d.C_n}?`,
  'compuesta-tipo': (d) => `Un capital de ${d.C_0} se ha convertido en ${d.C_n} al cabo de ${anos(d.n!)} en capitalización compuesta. ¿Cuál es el tipo de interés anual de la operación?`,
  'compuesta-equivalentes': (d) => `Un banco ofrece un ${d.i} de interés compuesto anual. ¿Qué tipo de interés ${PERIODO[d.m!]?.adj ?? 'de cada periodo'} equivalente debería ofrecer para que la inversión rinda lo mismo?`,
  'compuesta-tae': (d) => `Un depósito ofrece un tipo nominal (TIN) del ${d.J_m} anual con capitalización ${PERIODO[d.m!]?.adj ?? `en ${d.m} periodos al año`}. ¿Cuál es su tasa anual equivalente (TAE)?`,
  'descuento-comercial': (d) => `Una empresa descuenta en su banco un efecto de ${d.N} de nominal que vence dentro de ${dias(d.n!)}. El banco aplica un descuento comercial simple del ${d.d} anual (año comercial de 360 días). ¿A cuánto asciende el descuento?`,
  'descuento-racional': (d) => `Se quiere adelantar el cobro de ${d.C_n} que vencen dentro de ${dias(d.n!)}, con descuento racional simple al ${d.i} anual (año comercial de 360 días). ¿Cuál es el importe del descuento?`,
  'descuento-compuesto-racional': (d) => `Una deuda de ${d.C_n} vence dentro de ${anos(d.n!)}. Si se paga hoy aplicando un descuento compuesto racional al ${d.i} anual, ¿cuánto se descuenta?`,
  'descuento-compuesto-comercial': (d) => `Un efecto de ${d.N} de nominal vence dentro de ${anos(d.n!)} y se descuenta hoy con descuento compuesto comercial al ${d.d} anual. ¿Cuál es el importe del descuento?`,
};

/** Enunciado de examen de una fórmula con unos datos (null si la fórmula no tiene modo examen). */
export function enunciadoExamen(idFormula: string, datos: Datos): string | null {
  return ENUNCIADOS[idFormula]?.(datos) ?? null;
}
