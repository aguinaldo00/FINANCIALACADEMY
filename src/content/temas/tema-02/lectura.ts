/*
 * «Cómo leer un enunciado» (Tema 2): el método de cuatro preguntas, el diccionario de expresiones y
 * las palabras que cambian el ejercicio. Todas las expresiones salen de los enunciados que ya usa la
 * web (ejercicios.ts y enunciados.ts) y su símbolo es el de simbolos.ts: no hay casos nuevos.
 */

export interface PasoLectura {
  pregunta: string;
  hacer: string;
  ejemplo: string;
}

export const PASOS_LECTURA: readonly PasoLectura[] = [
  {
    pregunta: '¿Qué me piden?',
    hacer: 'Busca la pregunta (suele ir al final, entre ¿ ?) y escribe el símbolo de lo que te piden antes de mirar los números.',
    ejemplo: '«¿Qué capital inicial debemos invertir hoy…?» → te piden $C_0$.',
  },
  {
    pregunta: '¿Qué me dan?',
    hacer: 'Cada cifra del enunciado, con su unidad, a su símbolo. Si una cifra no tiene símbolo, probablemente sobra o es una comisión.',
    ejemplo: '«… un capital final de 9.659,25 € al cabo de 7 años …» → $C_n$ = 9.659,25 €, $n$ = 7 años.',
  },
  {
    pregunta: '¿Cuadran las unidades?',
    hacer: 'El tipo y el tiempo tienen que ir en la misma unidad (tipo anual con años, mensual con meses). Con días, mira si el año es comercial (360) o civil (365). Y mira si dice simple o compuesto.',
    ejemplo: '«al 3 % de interés simple anual durante 195 días (año civil)» → $n$ = 195/365 años, en simple.',
  },
  {
    pregunta: '¿Qué fórmula une lo que me dan con lo que me piden?',
    hacer: 'La que tiene todos tus datos y la incógnita. Si la incógnita no está sola, despéjala antes de poner números.',
    ejemplo: 'Te dan $C_n$, $n$ e $i$ en simple y te piden $C_0$ → fórmula 3: $C_0 = \\frac{C_n}{1 + n · i}$.',
  },
];

export interface Expresion {
  /** Cómo aparece en los enunciados. */
  texto: string;
  /** Símbolo al que corresponde. */
  simbolo: string;
  nota?: string;
}

/** Expresiones de los enunciados del tema, agrupadas por lo que indican. */
export const DICCIONARIO: readonly { grupo: string; expresiones: readonly Expresion[] }[] = [
  {
    grupo: 'Lo que hay hoy',
    expresiones: [
      { texto: 'se constituye un capital de… / invierte… / deposita…', simbolo: 'C_0' },
      { texto: '¿qué capital hay que invertir hoy…?', simbolo: 'C_0', nota: 'Te lo piden: es la incógnita.' },
      { texto: 'efecto / pagaré / letra de… de nominal', simbolo: 'N', nota: 'En descuento, lo que vale al vencimiento.' },
    ],
  },
  {
    grupo: 'Lo que hay al final',
    expresiones: [
      { texto: 'se convierte en… / da como resultado… / para obtener… / para disponer de…', simbolo: 'C_n' },
      { texto: 'una deuda de… que vence dentro de…', simbolo: 'C_n', nota: 'En descuento racional, lo que se paga al vencimiento.' },
      { texto: '¿cuál será el capital final?', simbolo: 'C_n', nota: 'Te lo piden.' },
    ],
  },
  {
    grupo: 'Lo que crece o se descuenta',
    expresiones: [
      { texto: '¿qué intereses produce? / ha producido… de intereses', simbolo: 'I' },
      { texto: '¿qué descuento te cobra? / ¿cuánto se descuenta?', simbolo: 'D', nota: 'Comercial (Dc) o racional (Dr), según lo diga el enunciado.' },
    ],
  },
  {
    grupo: 'Tipos',
    expresiones: [
      { texto: 'al 7 % de interés simple anual / a un tipo del…', simbolo: 'i' },
      { texto: 'descuento comercial del 5 %', simbolo: 'd' },
      { texto: 'TIN del… / tipo nominal anual', simbolo: 'J_m' },
      { texto: '¿cuál es su TAE? / tasa anual equivalente', simbolo: 'TAE' },
      { texto: '¿qué tipo mensual (trimestral…) equivalente…?', simbolo: 'i_m' },
    ],
  },
  {
    grupo: 'Tiempo y partes del año',
    expresiones: [
      { texto: 'durante 3 años / al cabo de / dentro de / vence dentro de…', simbolo: 'n' },
      { texto: '¿cuánto tiempo…? / ¿cuántos años, meses y días…?', simbolo: 'n', nota: 'Te lo piden.' },
      { texto: 'capitalización trimestral / liquida cada mes / periodos mensuales', simbolo: 'm', nota: 'semestral 2 · cuatrimestral 3 · trimestral 4 · mensual 12 · diaria 360 o 365.' },
    ],
  },
];

export interface Trampa {
  frase: string;
  ojo: string;
}

/** Palabras que cambian el ejercicio aunque los números sean los mismos. */
export const TRAMPAS: readonly Trampa[] = [
  { frase: '«simple» frente a «compuesto»', ojo: 'Cambia la familia de fórmulas entera: en simple los intereses no se suman al capital; en compuesta, sí.' },
  { frase: '«anual» frente a «semestral», «mensual»…', ojo: 'Si el tipo es anual y el tiempo va en meses (o al revés), hay que pasar uno de los dos a la unidad del otro.' },
  { frase: '«a 45 días», «durante 195 días»', ojo: 'El tiempo es una fracción del año: 45/360 si el año es comercial, 195/365 si es civil. Lo dice el enunciado.' },
  { frase: '«TIN» frente a «TAE»', ojo: 'El TIN se divide entre las capitalizaciones del año ($i_m = \\frac{J_m}{m}$); la TAE es lo que rinde de verdad en un año.' },
  { frase: '«descuento comercial» frente a «racional»', ojo: 'El comercial se calcula sobre el nominal (N); el racional, sobre el efectivo. Con los mismos datos, el racional sale menor.' },
  { frase: '«equivalente» en compuesta', ojo: 'En compuesta el tipo no se divide entre m: se usa $i_m = (1 + i)^{1/m} - 1$.' },
  { frase: '«con una comisión del 1 % (mínimo 10 €)»', ojo: 'No es un tipo de la fórmula: se resta aparte, y se cobra el mayor de los dos importes.' },
];
