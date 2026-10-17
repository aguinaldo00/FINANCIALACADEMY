/*
 * «Cómo leer un enunciado» (Tema 2). Va de la comprensión a la fórmula: primero qué está pasando
 * (quién tiene el dinero, quién cobra y cuándo), después qué cantidad es cada cifra, qué te piden y,
 * al final, qué fórmula. Los ejemplos son de descuento, que es donde más cuesta leer, y usan siempre
 * el mismo pagaré, que ya está en el temario (formulas.ts, fórmulas 15, 16 y 17): 6.000 € a 45 días
 * al 5 % anual, año comercial, comisión del 1 % (mínimo 10 €) y 3 € de correo. Notación y
 * definiciones del libro (simbolos.ts): N nominal, E efectivo, D = N − E descuento; Dc y d en el
 * comercial; Dr, Cₙ, C₀ e i en el racional.
 */

export interface PasoLectura {
  pregunta: string;
  hacer: string;
  ejemplo: string;
}

/** El método, siempre en este orden. Cada paso con su ejemplo sobre el pagaré. */
export const PASOS_LECTURA: readonly PasoLectura[] = [
  {
    pregunta: '¿Qué está pasando?',
    hacer: 'Antes de mirar los números, cuenta la historia: quién tiene un derecho de cobro, quién pagará, cuándo vence y qué quiere hacer alguien antes de esa fecha.',
    ejemplo: 'Una empresa tiene un pagaré de un cliente que le pagará 6.000 € dentro de 45 días. No quiere esperar: lo lleva al banco, el banco le adelanta el dinero hoy y, a cambio, se queda una parte.',
  },
  {
    pregunta: '¿Qué cantidad es cada cifra?',
    hacer: 'Coloca cada cifra en la historia: ¿se cobra al vencimiento, se recibe hoy o es lo que se queda el banco? Anota también su unidad: el tipo y el tiempo tienen que ir en la misma (con días, mira si el año es comercial, 360, o civil, 365).',
    ejemplo: '6.000 € es lo que pone el pagaré y se cobraría dentro de 45 días: el nominal, $N$. 45 días con año comercial: $n$ = 45/360 años. El 5 % anual es el tipo que aplica el banco.',
  },
  {
    pregunta: '¿Qué me piden?',
    hacer: 'Lee la pregunta entera y sitúala en la historia: ¿es lo que se queda el banco, lo que llega hoy a la empresa o lo que pone el pagaré? Una palabra suelta no basta: «descuento» aparece tanto si te piden el descuento como si te piden lo que se recibe después de él.',
    ejemplo: '«¿Qué descuento te cobra?» → lo que se queda el banco, $D$. «¿Qué efectivo recibe?» → lo que llega hoy, $E$. «¿Qué valor líquido recibes?» → lo que llega hoy después de quitar también comisiones y gastos.',
  },
  {
    pregunta: '¿Qué fórmula?',
    hacer: 'Decide primero el procedimiento (comercial o racional; simple hasta un año, compuesto si es más) y después busca la fórmula que tiene todos tus datos y la incógnita.',
    ejemplo: 'Descuento comercial, 45 días (simple), te piden el descuento: $D_c = N · n · d$ = 6.000 · 45/360 · 0,05 = 37,50 €.',
  },
];

export interface Cantidad {
  simbolo: string;
  nombre: string;
  /** Qué es, en lenguaje sencillo. */
  que: string;
  /** Su valor en el pagaré del ejemplo. */
  valor: string;
}

/** Las cantidades del descuento, con el pagaré de 6.000 € (descuento comercial). */
export const CANTIDADES_DESCUENTO: readonly Cantidad[] = [
  { simbolo: 'N', nombre: 'Nominal', que: 'Lo que figura en el pagaré o la letra: se cobra el día del vencimiento.', valor: '6.000 €' },
  { simbolo: 'D', nombre: 'Descuento', que: 'Lo que se resta por cobrar antes de tiempo: lo que se queda el banco por adelantar el dinero.', valor: '37,50 €' },
  { simbolo: 'E', nombre: 'Efectivo', que: 'Lo que se recibe hoy al descontar: el nominal menos el descuento, $E = N - D$.', valor: '5.962,50 €' },
  { simbolo: '', nombre: 'Comisiones y gastos', que: 'Cobros aparte del descuento (comisión de cobro, correo…). No entran en la fórmula del descuento: se restan después y dan el valor líquido.', valor: '60 € + 3 € → líquido 5.899,50 €' },
];

export interface Procedimiento {
  nombre: string;
  sobre: string;
  tipo: string;
  formula: string;
  calculo: string;
}

/** Comercial frente a racional, con el mismo pagaré (6.000 € a 45 días al 5 %, año comercial). */
export const COMERCIAL_RACIONAL = {
  cambia: 'Los dos restan algo por cobrar antes. Lo que cambia es sobre qué cantidad se calcula ese descuento.',
  procedimientos: [
    {
      nombre: 'Comercial',
      sobre: 'Se calcula sobre el nominal, la cantidad del vencimiento: un porcentaje de lo que pone el pagaré.',
      tipo: 'tipo de descuento, $d$',
      formula: 'D_c = N · n · d',
      calculo: '6.000 · 45/360 · 0,05 = 37,50 €',
    },
    {
      nombre: 'Racional',
      sobre: 'Se calcula sobre el efectivo, la cantidad de hoy: es la capitalización al revés. El nominal se escribe $C_n$ y el efectivo $C_0$, con $C_n = C_0 · (1 + n · i)$.',
      tipo: 'tipo de interés, $i$',
      formula: 'D_r = \\frac{C_n · n · i}{1 + n · i}',
      calculo: '6.000 · 0,125 · 0,05 / 1,00625 = 37,27 €',
    },
  ] as readonly Procedimiento[],
  conclusion: 'Como el efectivo es menor que el nominal, con los mismos datos el racional sale menor: 37,27 € frente a 37,50 €.',
  reconocer: [
    'Normalmente el enunciado lo dice: «descuento comercial» o «descuento racional».',
    'El tipo también da una pista: «tipo de descuento» va con el comercial ($d$); «tipo de interés», con el racional ($i$).',
    'Descontar un efecto en el banco y liquidar una remesa (con comisiones y gastos) se hace con el comercial.',
    'Hasta un año, simple; si vence en más de un año, compuesto: $E = N · (1 - d)^n$ o $C_0 = C_n · (1 + i)^{-n}$.',
  ],
};

export interface Expresion {
  /** Cómo aparece en los enunciados. */
  texto: string;
  /** Símbolo al que corresponde. */
  simbolo: string;
  /** Por qué es ese símbolo (qué papel tiene en la historia). */
  porque: string;
}

/** Ayuda para interpretar: expresiones de los enunciados del tema y por qué son ese símbolo. */
export const DICCIONARIO: readonly { grupo: string; expresiones: readonly Expresion[] }[] = [
  {
    grupo: 'Descuento',
    expresiones: [
      { texto: 'pagaré / letra / efecto de 6.000 € de nominal', simbolo: 'N', porque: 'Es lo que figura en el documento y se cobra al vencimiento.' },
      { texto: 'un capital de 6.000 € vence dentro de 45 días (descuento racional)', simbolo: 'C_n', porque: 'En el racional el libro llama Cₙ a lo que se cobra al vencimiento.' },
      { texto: '¿qué descuento te cobra? / ¿cuánto se descuenta?', simbolo: 'D', porque: 'Te piden lo que se queda quien adelanta el dinero: Dc si es comercial, Dr si es racional.' },
      { texto: '¿qué efectivo recibe? / ¿cuánto cobra hoy?', simbolo: 'E', porque: 'Te piden lo que llega hoy. Si además hay comisiones y gastos, lo que llega es el valor líquido.' },
      { texto: 'descuento comercial del 5 % anual', simbolo: 'd', porque: 'Es un tipo de descuento: se aplica sobre el nominal.' },
      { texto: 'descuento racional al 5 % anual', simbolo: 'i', porque: 'En el racional el tipo es de interés: se aplica sobre el efectivo.' },
    ],
  },
  {
    grupo: 'Capitalización',
    expresiones: [
      { texto: 'invierte 10.000 € / se constituye un capital de…', simbolo: 'C_0', porque: 'Es el dinero que se pone hoy, al principio de la operación.' },
      { texto: 'se convierte en… / para obtener… / para disponer de…', simbolo: 'C_n', porque: 'Es lo que habrá al final: el capital inicial más los intereses.' },
      { texto: '¿qué intereses produce?', simbolo: 'I', porque: 'Te piden solo lo ganado, sin el capital: I = Cₙ − C₀.' },
    ],
  },
  {
    grupo: 'Tipos y tiempo',
    expresiones: [
      { texto: 'al 7 % de interés simple anual', simbolo: 'i', porque: 'Es lo que rinde cada euro en un periodo; «anual» dice que n va en años.' },
      { texto: 'TIN del 12 % con capitalización mensual', simbolo: 'J_m', porque: 'Es un tipo nominal: se reparte entre las m capitalizaciones del año.' },
      { texto: 'durante 3 años / vence dentro de 45 días', simbolo: 'n', porque: 'Es la duración, en la misma unidad que el tipo: 45 días con tipo anual son 45/360 años (año comercial).' },
      { texto: 'capitalización trimestral / liquida cada mes', simbolo: 'm', porque: 'Es el número de partes del año: trimestral 4, mensual 12.' },
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
  { frase: '«a 45 días», «durante 195 días»', ojo: 'El tiempo es una fracción del año: 45/360 si el año es comercial, 195/365 si es civil. Lo dice el enunciado.' },
  { frase: '«descuento» en la pregunta', ojo: 'No decide la fórmula por sí sola: mira si te piden lo que se queda el banco (D), lo que se recibe (E) o el líquido.' },
  { frase: '«con una comisión del 1 % (mínimo 10 €)»', ojo: 'No es un tipo de la fórmula: se calcula aparte sobre el nominal, se cobra el mayor de los dos importes y se resta después del descuento.' },
  { frase: '«TIN» frente a «TAE»', ojo: 'El TIN se divide entre las capitalizaciones del año ($i_m = \\frac{J_m}{m}$); la TAE es lo que rinde de verdad en un año.' },
  { frase: '«equivalente» en compuesta', ojo: 'En compuesta el tipo no se divide entre m: se usa $i_m = (1 + i)^{1/m} - 1$.' },
];
