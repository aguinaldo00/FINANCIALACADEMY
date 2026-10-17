/*
 * «Cómo leer un enunciado» (Tema 2). Va de la comprensión a la fórmula: primero qué está pasando
 * (quién tiene el dinero, quién cobra y cuándo), después qué cantidad es cada cifra, qué te piden y,
 * al final, qué fórmula. Cada parte del tema (simple, compuesta, descuento) tiene su propio ejemplo,
 * sacado de su temario; en descuento, además, qué cambia entre comercial y racional. Notación y
 * definiciones del libro (simbolos.ts): N nominal, E efectivo, D = N − E descuento; Dc y d en el
 * comercial; Dr, Cₙ, C₀ e i en el racional.
 */

export interface PasoLectura {
  pregunta: string;
  hacer: string;
  ejemplo: string;
}

export interface Cantidad {
  simbolo: string;
  nombre: string;
  /** Qué es, en lenguaje sencillo. */
  que: string;
  /** Su valor en el ejemplo. */
  valor: string;
}

/** El ejemplo de cada parte en una línea de tiempo: qué hay hoy, qué pasa entre medias y qué hay al final. */
export interface Historia {
  titulo: string;
  hoy: { simbolo: string; texto: string };
  tramo: { texto: string; simbolo: string; detalle: string };
  final: { simbolo: string; texto: string };
  cantidades: readonly Cantidad[];
}

export interface Lectura {
  pasos: readonly PasoLectura[];
  historia: Historia;
}

/*
 * Cada parte con su propio ejemplo, sacado de su temario (formulas.ts):
 *  - simple: 10.000 € al 7 % de interés simple anual durante 3 años (fórmulas 1 y 2);
 *  - compuesta: 4.500 € al 3 % de interés compuesto anual durante 7 años (fórmulas 7 y 8);
 *  - descuento: pagaré de 6.000 € a 45 días al 5 % anual, año comercial, comisión del 1 % (mínimo
 *    10 €) y 3 € de correo (fórmulas 15, 16 y 17).
 */
export const LECTURAS: Readonly<Record<'simple' | 'compuesta' | 'descuento', Lectura>> = {
  simple: {
    pasos: [
      {
        pregunta: '¿Qué está pasando?',
        hacer: 'Antes de mirar los números, cuéntate la historia con tus palabras: ¿quién pone el dinero y cuándo? ¿Cuánto tiempo lo deja? ¿Qué gana por dejarlo?',
        ejemplo: 'Alguien deja 10.000 € en una cuenta durante 3 años. Cada año el banco le paga un 7 % de esos 10.000 €. En simple, lo ganado no se suma al dinero para el año siguiente: cada año se gana lo mismo.',
      },
      {
        pregunta: '¿Qué cantidad es cada cifra?',
        hacer: 'Pon cada número en su sitio de la historia: ¿es lo que se pone el primer día, lo que hay al final o lo que se gana? Fíjate en el tiempo: si el tipo es por año, el tiempo va en años.',
        ejemplo: '10.000 € es lo que se pone hoy: el capital inicial, $C_0$. El 7 % anual es lo que se gana cada año por cada euro: $i$ = 0,07. 3 años es el tiempo: $n$ = 3, en años porque el tipo es anual.',
      },
      {
        pregunta: '¿Qué me piden?',
        hacer: 'Lee la pregunta entera: ¿quieren saber solo lo ganado o todo lo que hay al final? ¿O falta algo del principio (cuánto se puso, a qué tipo, cuánto tiempo)?',
        ejemplo: '«¿Qué intereses produce?» → solo lo ganado, $I$. «¿Cuál será el capital final?» → lo puesto más lo ganado, $C_n$. «¿Qué capital hay que invertir hoy?» → lo del principio, $C_0$.',
      },
      {
        pregunta: '¿Qué fórmula?',
        hacer: 'Comprueba que es simple (lo dice el enunciado) y busca la fórmula que tiene todos tus datos y lo que te piden.',
        ejemplo: 'Te dan $C_0$, $i$ y $n$ y te piden los intereses: $I = C_0 · n · i$ = 10.000 · 3 · 0,07 = 2.100 €.',
      },
    ],
    historia: {
      titulo: 'El ejemplo, en el tiempo',
      hoy: { simbolo: 'C_0', texto: 'se ponen' },
      tramo: { texto: '3 años al 7 % anual', simbolo: 'I', detalle: 'cada año se gana lo mismo' },
      final: { simbolo: 'C_n', texto: 'hay en total' },
      cantidades: [
        { simbolo: 'C_0', nombre: 'Capital inicial', que: 'Lo que se pone el primer día.', valor: '10.000 €' },
        { simbolo: 'I', nombre: 'Intereses', que: 'Lo que se gana en todo el tiempo. En simple, cada año lo mismo: 700 € + 700 € + 700 €.', valor: '2.100 €' },
        { simbolo: 'C_n', nombre: 'Capital final', que: 'Todo lo que hay al final: lo puesto más lo ganado, $C_n = C_0 + I$.', valor: '12.100 €' },
      ],
    },
  },
  compuesta: {
    pasos: [
      {
        pregunta: '¿Qué está pasando?',
        hacer: 'Antes de mirar los números, cuéntate la historia: ¿quién pone el dinero y cuánto tiempo? ¿Lo ganado se queda en la cuenta y vuelve a ganar?',
        ejemplo: 'Alguien deja 4.500 € durante 7 años al 3 % anual. En compuesta, lo que gana cada año se suma al dinero y el año siguiente también gana: el primer año gana 135 €; el segundo ya gana sobre 4.635 €.',
      },
      {
        pregunta: '¿Qué cantidad es cada cifra?',
        hacer: 'Pon cada número en su sitio: ¿es lo del principio, lo del final o lo ganado? Y el tiempo, en la misma unidad que el tipo.',
        ejemplo: '4.500 € es lo que se pone hoy: $C_0$. El 3 % anual: $i$ = 0,03. 7 años: $n$ = 7, en años porque el tipo es anual.',
      },
      {
        pregunta: '¿Qué me piden?',
        hacer: 'Lee la pregunta entera: ¿todo lo que hay al final, solo lo ganado, lo del principio, el tiempo o el tipo?',
        ejemplo: '«Calcula el capital final» → todo lo que hay al final, $C_n$. «¿Qué intereses produce?» → solo lo ganado, $I = C_n - C_0$.',
      },
      {
        pregunta: '¿Qué fórmula?',
        hacer: 'Comprueba que es compuesta (lo dice el enunciado) y busca la fórmula que tiene tus datos y lo que te piden. En compuesta, el tiempo va en el exponente.',
        ejemplo: 'Te dan $C_0$, $i$ y $n$ y te piden el capital final: $C_n = C_0 · (1 + i)^n$ = 4.500 · 1,03⁷ = 5.534,43 €.',
      },
    ],
    historia: {
      titulo: 'El ejemplo, en el tiempo',
      hoy: { simbolo: 'C_0', texto: 'se ponen' },
      tramo: { texto: '7 años al 3 % anual', simbolo: 'I', detalle: 'lo ganado vuelve a ganar' },
      final: { simbolo: 'C_n', texto: 'hay en total' },
      cantidades: [
        { simbolo: 'C_0', nombre: 'Capital inicial', que: 'Lo que se pone el primer día.', valor: '4.500 €' },
        { simbolo: 'I', nombre: 'Intereses', que: 'Lo ganado en los 7 años. Cada año algo más que el anterior, porque se gana también sobre lo ya ganado.', valor: '1.034,43 €' },
        { simbolo: 'C_n', nombre: 'Capital final', que: 'Todo lo que hay al final: $C_n = C_0 + I$.', valor: '5.534,43 €' },
      ],
    },
  },
  descuento: {
    pasos: [
      {
        pregunta: '¿Qué está pasando?',
        hacer: 'Antes de mirar los números, cuéntate la historia con tus palabras: ¿quién tiene un derecho de cobro (alguien le debe dinero)? ¿Quién pagará y qué día? ¿Qué quiere hacer alguien antes de ese día?',
        ejemplo: 'Un cliente le debe a una empresa 6.000 € y se lo ha firmado en un pagaré: pagará dentro de 45 días. La empresa necesita el dinero ya, así que lleva el papel al banco. El banco le adelanta el dinero hoy, pero no entero: se queda una parte por esperar él los 45 días.',
      },
      {
        pregunta: '¿Qué cantidad es cada cifra?',
        hacer: 'Pon cada número en su sitio de la historia: ¿es lo que pone el papel y se cobra el último día, lo que llega hoy o lo que se queda el banco? Fíjate también en el tiempo: si el tipo es por año y el plazo va en días, pasa los días a años.',
        ejemplo: '6.000 € es lo que pone el papel y se cobraría el día 45: es el nominal, $N$. Los 45 días, con año comercial (360 días), son 45/360 de año: $n$ = 45/360. El 5 % anual es lo que cobra el banco por cada año de adelanto.',
      },
      {
        pregunta: '¿Qué me piden?',
        hacer: 'Lee la pregunta entera y pregúntate: ¿quieren saber lo que se queda el banco, lo que le llega hoy a la empresa o lo que ponía el papel? No te fíes de una sola palabra: «descuento» sale tanto si te piden lo que se queda el banco como si te piden lo que te llega después.',
        ejemplo: '«¿Qué descuento te cobra?» → lo que se queda el banco, $D$. «¿Qué efectivo recibe?» → lo que le llega hoy, $E$. «¿Qué valor líquido recibes?» → lo que llega al final, cuando además se han restado las comisiones y los gastos.',
      },
      {
        pregunta: '¿Qué fórmula?',
        hacer: 'Primero mira cómo calcula el banco: comercial o racional (lo dice el enunciado) y simple si es menos de un año, compuesto si es más. Después busca la fórmula que tiene todos tus datos y lo que te piden.',
        ejemplo: 'Descuento comercial, 45 días (simple), te piden el descuento: $D_c = N · n · d$ = 6.000 · 45/360 · 0,05 = 37,50 €.',
      },
    ],
    historia: {
      titulo: 'El pagaré del ejemplo, en el tiempo',
      hoy: { simbolo: 'E', texto: 'la empresa recibe' },
      tramo: { texto: '45 días antes del vencimiento', simbolo: 'D', detalle: 'el banco se queda' },
      final: { simbolo: 'N', texto: 'el cliente paga' },
      cantidades: [
        { simbolo: 'N', nombre: 'Nominal', que: 'Lo que figura en el pagaré o la letra: se cobra el día del vencimiento.', valor: '6.000 €' },
        { simbolo: 'D', nombre: 'Descuento', que: 'Lo que se resta por cobrar antes de tiempo: lo que se queda el banco por adelantar el dinero.', valor: '37,50 €' },
        { simbolo: 'E', nombre: 'Efectivo', que: 'Lo que se recibe hoy al descontar: el nominal menos el descuento, $E = N - D$.', valor: '5.962,50 €' },
        { simbolo: '', nombre: 'Comisiones y gastos', que: 'Cobros aparte del descuento (comisión de cobro, correo…). No entran en la fórmula del descuento: se restan después y dan el valor líquido.', valor: '60 € + 3 € → líquido 5.899,50 €' },
      ],
    },
  },
};

export interface Procedimiento {
  nombre: string;
  sobre: string;
  tipo: string;
  formula: string;
  calculo: string;
}

/** Comercial frente a racional, con el mismo pagaré (6.000 € a 45 días al 5 %, año comercial). */
export const COMERCIAL_RACIONAL = {
  cambia: 'En los dos el banco se queda una parte por adelantarte el dinero. Lo que cambia es sobre qué cantidad saca su porcentaje: sobre lo que pone el papel o sobre lo que te da hoy.',
  procedimientos: [
    {
      nombre: 'Comercial',
      sobre: 'El porcentaje se saca de lo que pone el papel (el nominal). Es el que usan los bancos al descontar efectos.',
      tipo: 'tipo de descuento, $d$',
      formula: 'D_c = N · n · d',
      calculo: '6.000 · 45/360 · 0,05 = 37,50 €',
    },
    {
      nombre: 'Racional',
      sobre: 'El porcentaje se saca de lo que te dan hoy (el efectivo): es como preguntarse qué cantidad, invertida hoy, se convertiría en lo que pone el papel. Por eso aquí el papel se escribe $C_n$ y lo de hoy $C_0$, con $C_n = C_0 · (1 + n · i)$.',
      tipo: 'tipo de interés, $i$',
      formula: 'D_r = \\frac{C_n · n · i}{1 + n · i}',
      calculo: '6.000 · 0,125 · 0,05 / 1,00625 = 37,27 €',
    },
  ] as readonly Procedimiento[],
  conclusion: 'Lo de hoy es menos que lo del papel, así que el mismo porcentaje sobre una cantidad más pequeña da menos: el racional sale 37,27 € y el comercial 37,50 €.',
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
