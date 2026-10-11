/*
 * Notación del Tema 2 (Unidad 2 · Gestión financiera), tal como la usa el libro y el análisis de
 * docs/fuentes/tema-02-matematica-financiera.md. Un símbolo tiene siempre el mismo papel y, por
 * tanto, el mismo color en el índice, en las animaciones y en los ejercicios.
 *
 * Los colores se agrupan por papel, no por letra, para que se puedan deducir:
 *  - presente (C₀, E): lo que vale hoy           - futuro (Cₙ, N): lo que vale al final
 *  - interés (I): lo que crece                   - descuento (D): lo que se resta al anticipar
 *  - tipo (i, iₘ, d, Jₘ, TAE): tasas             - tiempo (n) y fraccionamiento (m)
 */

export type PapelSimbolo = 'presente' | 'futuro' | 'interes' | 'descuento' | 'tipo' | 'tiempo' | 'fraccion';

export interface Simbolo {
  /** Clave en la notación de las fórmulas (p. ej. `C_0`). */
  clave: string;
  nombre: string;
  /** Qué representa, en una línea. */
  significado: string;
  papel: PapelSimbolo;
}

export const SIMBOLOS: readonly Simbolo[] = [
  { clave: 'C_0', nombre: 'Capital inicial', significado: 'Lo que se invierte o se presta hoy (en el origen).', papel: 'presente' },
  { clave: 'C_n', nombre: 'Capital final o montante', significado: 'Lo que hay al final: capital inicial más intereses.', papel: 'futuro' },
  { clave: 'I', nombre: 'Intereses totales', significado: 'Todo lo que ha producido el capital durante la operación.', papel: 'interes' },
  { clave: 'i', nombre: 'Tipo de interés', significado: 'Lo que rinde cada unidad de capital en un periodo, en tanto por uno (7 % → 0,07).', papel: 'tipo' },
  { clave: 'n', nombre: 'Tiempo', significado: 'Número de periodos, en la misma unidad que el tipo.', papel: 'tiempo' },
  { clave: 'm', nombre: 'Fraccionamiento', significado: 'Partes en que se divide el año: 2 semestres, 3 cuatrimestres, 4 trimestres, 12 meses, 360 o 365 días.', papel: 'fraccion' },
  { clave: 'i_m', nombre: 'Tipo fraccionado', significado: 'Tipo de cada una de las m partes del año.', papel: 'tipo' },
  { clave: 'J_m', nombre: 'Tipo nominal (TIN)', significado: 'Tipo anual que se reparte entre las m capitalizaciones: Jₘ = iₘ · m.', papel: 'tipo' },
  { clave: 'TAE', nombre: 'Tasa anual equivalente', significado: 'Coste o rendimiento real en un año, con la capitalización (y las comisiones) incluidas.', papel: 'tipo' },
  { clave: 'N', nombre: 'Valor nominal', significado: 'Importe del efecto o del pagaré a su vencimiento.', papel: 'futuro' },
  { clave: 'E', nombre: 'Valor efectivo', significado: 'Lo que vale hoy el efecto una vez descontado.', papel: 'presente' },
  { clave: 'D', nombre: 'Descuento', significado: 'Lo que se resta al nominal por cobrar antes: D = N − E.', papel: 'descuento' },
  { clave: 'D_r', nombre: 'Descuento racional', significado: 'Descuento calculado sobre el valor efectivo (C₀).', papel: 'descuento' },
  { clave: 'D_c', nombre: 'Descuento comercial', significado: 'Descuento calculado sobre el valor nominal (N).', papel: 'descuento' },
  { clave: 'd', nombre: 'Tipo de descuento', significado: 'Tasa que se aplica al nominal en el descuento comercial.', papel: 'tipo' },
];

const POR_CLAVE = new Map(SIMBOLOS.map((s) => [s.clave, s]));

/** Busca un símbolo; los capitales intermedios (C_1, C_2…) cuentan como capital final. */
export function simbolo(clave: string): Simbolo | undefined {
  if (/^C_[1-9]\d*$/.test(clave)) return { clave, nombre: `Capital al final del periodo ${clave.slice(2)}`, significado: 'Capital acumulado al cerrar ese periodo.', papel: 'futuro' };
  return POR_CLAVE.get(clave);
}
