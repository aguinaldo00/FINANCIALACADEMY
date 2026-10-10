/*
 * Material de estudio de la lección de capitalización compuesta, diseñado según la investigación
 * sobre aprendizaje (ver docs/experiencia-capitalizacion-compuesta.md):
 *  - errores típicos explicados (aprender del error),
 *  - práctica en papel con ayudas que se retiran (ejemplo resuelto → completar → solo),
 *  - reconocer qué fórmula toca, con tipos de ejercicio mezclados (práctica intercalada).
 *
 * Los enunciados y resultados son casos prácticos resueltos del libro (Unidad 2). Las cifras de las
 * soluciones no se escriben a mano: salen de src/domain/formulasCompuesta.ts.
 */
import {
  capitalFinalCompuesta,
  capitalInicialCompuesta,
  desglosarAnos,
  factorCompuesto,
  redondearCentimos,
  tiempoCompuesta,
  tipoCompuesta,
} from '../../../domain/formulasCompuesta.ts';

const FORMATO = (decimales: number) =>
  new Intl.NumberFormat('de-DE', { minimumFractionDigits: decimales, maximumFractionDigits: decimales });

/** Número con coma decimal y punto de miles (como en el resto de la web). */
export const num = (valor: number, decimales = 2): string => FORMATO(decimales).format(valor);
const eur = (valor: number): string => `${num(redondearCentimos(valor))} €`;

export type FormulaId = 'cn-comp' | 'c0-comp' | 'n-comp' | 'i-comp' | 'cn-simp' | 'i-simp';

export const FORMULAS: Record<FormulaId, { nombre: string; expresion: string }> = {
  'cn-comp': { nombre: 'Capital final · compuesta', expresion: 'Cₙ = C₀ × (1 + i)ⁿ' },
  'c0-comp': { nombre: 'Capital inicial · compuesta', expresion: 'C₀ = Cₙ ÷ (1 + i)ⁿ' },
  'n-comp': { nombre: 'Tiempo · compuesta', expresion: 'n = log(Cₙ ÷ C₀) ÷ log(1 + i)' },
  'i-comp': { nombre: 'Tipo de interés · compuesta', expresion: 'i = (Cₙ ÷ C₀)^(1/n) − 1' },
  'cn-simp': { nombre: 'Capital final · simple', expresion: 'Cₙ = C₀ × (1 + n × i)' },
  'i-simp': { nombre: 'Intereses · simple', expresion: 'I = C₀ × n × i' },
};

/* ----------------------------------------------------------------------------- errores típicos */

export interface ErrorTipico {
  titulo: string;
  /** Lo que se hace mal. */
  mal: string;
  /** Cómo hacerlo bien. */
  bien: string;
}

export const ERRORES_TIPICOS: ErrorTipico[] = [
  {
    titulo: 'Usar el porcentaje tal cual',
    mal: 'Cₙ = 1.000 × (1 + 5)³',
    bien: 'El tipo va en tanto por uno: 5 % → i = 0,05. Cₙ = 1.000 × (1 + 0,05)³.',
  },
  {
    titulo: 'Tiempo y tipo en unidades distintas',
    mal: '3 % mensual con n = 2 años → (1 + 0,03)²',
    bien: 'Antes de sustituir, comprueba que i y n están en la misma unidad. 2 años son 24 meses: (1 + 0,03)²⁴.',
  },
  {
    titulo: 'Fraccionar el tipo como en simple',
    mal: 'Tipo mensual en compuesta: iₘ = i ÷ 12',
    bien: 'Eso es de simple. En compuesta: iₘ = (1 + i)^(1/m) − 1.',
  },
  {
    titulo: 'Leer los decimales de n como meses',
    mal: 'n = 1,62 años → "1 año y 62 meses"',
    bien: '0,62 × 12 = 7,44 meses; 0,44 × 30 = 13 días → 1 año, 7 meses y 13 días.',
  },
  {
    titulo: 'Confundir I con el interés de un año',
    mal: 'I = C₀ × i (solo el primer año)',
    bien: 'I son los intereses totales de toda la operación: I = Cₙ − C₀.',
  },
  {
    titulo: 'Despejar i con raíz cuadrada',
    mal: 'i = √(Cₙ ÷ C₀) − 1 (el libro dice "raíces cuadradas")',
    bien: 'Es la raíz de índice n: i = (Cₙ ÷ C₀)^(1/n) − 1. Solo es cuadrada si n = 2.',
  },
  {
    titulo: 'Redondear por el camino',
    mal: 'Redondear (1 + i)ⁿ a dos decimales y después multiplicar',
    bien: 'Deja el factor completo en la calculadora (o con 6 decimales) y redondea solo el resultado en euros.',
  },
];

/* ------------------------------------------------------- práctica en papel con ayudas que se retiran */

export type NivelAyuda = 'completar' | 'guiado' | 'solo';

export interface EjercicioPapel {
  id: string;
  nivel: NivelAyuda;
  enunciado: string;
  fuente: string;
  /** Ayudas que se dan antes de intentarlo (menos cuanto más avanzado el nivel). */
  ayuda: { datos?: [string, string][]; formula?: string; pista?: string };
  solucion: { pasos: string[]; calculadora: string; resultado: string };
}

function ejercicioCapitalFinal(): EjercicioPapel {
  const factor = factorCompuesto(0.03, 7);
  const cn = capitalFinalCompuesta(4500, 0.03, 7);
  return {
    id: 'papel-cn',
    nivel: 'completar',
    enunciado: 'Calcula el capital final de invertir 4.500 € al 3 % de interés compuesto anual durante 7 años.',
    fuente: 'Caso práctico del libro · Cálculo del capital final',
    ayuda: {
      datos: [['C₀', '4.500 €'], ['i', '0,03 anual'], ['n', '7 años'], ['Incógnita', 'Cₙ']],
      formula: FORMULAS['cn-comp'].expresion,
      pista: 'Ya tienes los datos y la fórmula: sustituye y calcula.',
    },
    solucion: {
      pasos: [
        'Cₙ = 4.500 × (1 + 0,03)⁷',
        `(1,03)⁷ = ${num(factor, 6)}`,
        `Cₙ = 4.500 × ${num(factor, 6)} = ${eur(cn)}`,
      ],
      calculadora: '1,03 [xʸ] 7 [=]   [×] 4500 [=]',
      resultado: `Cₙ = ${eur(cn)}`,
    },
  };
}

function ejercicioCapitalInicial(): EjercicioPapel {
  const factor = factorCompuesto(0.07, 8);
  const c0 = redondearCentimos(capitalInicialCompuesta(9000, 0.07, 8));
  return {
    id: 'papel-c0',
    nivel: 'guiado',
    enunciado: 'Calcula el capital que se invirtió en una operación que duró 8 años y dio como resultado 9.000 € al 7 % de interés anual. Determina los intereses totales.',
    fuente: 'Caso práctico del libro · Cálculo del capital inicial',
    ayuda: { pista: 'Te dan el capital final: la incógnita es C₀. Escribe primero los datos con su símbolo.' },
    solucion: {
      pasos: [
        'Datos: Cₙ = 9.000 €; i = 0,07; n = 8 años. Incógnita: C₀',
        'C₀ = Cₙ ÷ (1 + i)ⁿ = 9.000 ÷ (1,07)⁸',
        `(1,07)⁸ = ${num(factor, 6)} → C₀ = ${eur(c0)}`,
        `I = Cₙ − C₀ = 9.000 − ${num(c0)} = ${eur(9000 - c0)}`,
      ],
      calculadora: '1,07 [xʸ] 8 [=]   9000 [÷] [Ans] [=]',
      resultado: `C₀ = ${eur(c0)} · I = ${eur(9000 - c0)}`,
    },
  };
}

function ejercicioTiempo(): EjercicioPapel {
  const cociente = 35000 / 30000;
  const n = tiempoCompuesta(30000, 35000, 0.1);
  const d = desglosarAnos(n);
  return {
    id: 'papel-n',
    nivel: 'solo',
    enunciado: 'Calcula el tiempo que ha estado invertido un capital de 30.000 € al 10 % de interés anual si ha dado como resultado 35.000 €. Exprésalo en años, meses y días.',
    fuente: 'Caso práctico del libro · Cálculo del tiempo',
    ayuda: {},
    solucion: {
      pasos: [
        'Datos: C₀ = 30.000 €; Cₙ = 35.000 €; i = 0,10. Incógnita: n',
        'n = log(Cₙ ÷ C₀) ÷ log(1 + i)',
        `n = log(${num(cociente, 6)}) ÷ log(1,10) = ${num(Math.log10(cociente), 6)} ÷ ${num(Math.log10(1.1), 6)} = ${num(d.anosDecimal)} años`,
        `${num(d.anosDecimal - d.anos)} × 12 = ${num(d.mesesDecimal)} meses → ${num(d.mesesDecimal - d.meses)} × 30 = ${num(d.diasDecimal, 1)} días`,
      ],
      calculadora: '[log] 35000 [÷] 30000 [)] [÷] [log] 1,1 [=]',
      resultado: `${d.anos} año, ${d.meses} meses y ${d.dias} días`,
    },
  };
}

function ejercicioTipo(): EjercicioPapel {
  const i = tipoCompuesta(50000, 52000, 6);
  return {
    id: 'papel-i',
    nivel: 'solo',
    enunciado: 'Calcula el tipo de interés al que ha estado invertido un capital de 50.000 € durante 6 años si ha dado como resultado 52.000 €.',
    fuente: 'Caso práctico del libro · Cálculo del tipo de interés',
    ayuda: {},
    solucion: {
      pasos: [
        'Datos: C₀ = 50.000 €; Cₙ = 52.000 €; n = 6 años. Incógnita: i',
        'i = (Cₙ ÷ C₀)^(1/n) − 1 = (1,04)^(1/6) − 1',
        `i = ${num(i, 6)} anual → ${num(i * 100)} %`,
      ],
      calculadora: '52000 [÷] 50000 [=]   [xʸ] [(] 1 [÷] 6 [)] [=]   [−] 1 [=]',
      resultado: `i = ${num(i, 6)} (≈ ${num(i * 100)} % anual)`,
    },
  };
}

export const EJERCICIOS_PAPEL: EjercicioPapel[] = [
  ejercicioCapitalFinal(),
  ejercicioCapitalInicial(),
  ejercicioTiempo(),
  ejercicioTipo(),
];

/* ----------------------------------------------------------- reconocer qué fórmula toca (mezclado) */

export interface EjercicioReconocer {
  id: string;
  enunciado: string;
  opciones: FormulaId[];
  correcta: FormulaId;
  /** Por qué es esa: qué te dan y qué te piden. */
  porQue: string;
}

/** Orden intercalado a propósito: nunca dos del mismo tipo seguidos. */
export const EJERCICIOS_RECONOCER: EjercicioReconocer[] = [
  {
    id: 'rec-n',
    enunciado: 'Un capital de 30.000 € al 10 % anual compuesto se ha convertido en 35.000 €. ¿Cuánto tiempo ha estado invertido?',
    opciones: ['cn-comp', 'n-comp', 'i-comp', 'cn-simp'],
    correcta: 'n-comp',
    porQue: 'Te dan C₀, Cₙ e i y te piden el tiempo: la incógnita está en el exponente, así que se despeja con logaritmos.',
  },
  {
    id: 'rec-i-simp',
    enunciado: 'María invierte 15.000 € al 3 % de interés simple anual durante 3 años. ¿Cuál será el importe de los intereses totales?',
    opciones: ['i-simp', 'cn-comp', 'cn-simp', 'c0-comp'],
    correcta: 'i-simp',
    porQue: 'Es capitalización simple y piden los intereses: I = C₀ × n × i, sin potencias.',
  },
  {
    id: 'rec-c0',
    enunciado: 'Calcula el capital que se invirtió en una operación compuesta de 8 años que dio como resultado 9.000 € al 7 % anual.',
    opciones: ['cn-comp', 'c0-comp', 'n-comp', 'cn-simp'],
    correcta: 'c0-comp',
    porQue: 'Los 9.000 € son el resultado final (Cₙ). Piden lo que se invirtió: C₀ = Cₙ ÷ (1 + i)ⁿ.',
  },
  {
    id: 'rec-cn-simp',
    enunciado: 'Juana invierte 18.500 € al 4 % de interés simple anual durante 5 años. ¿Cuál será el capital final?',
    opciones: ['cn-comp', 'cn-simp', 'i-simp', 'c0-comp'],
    correcta: 'cn-simp',
    porQue: 'Piden Cₙ, pero el régimen es simple: Cₙ = C₀ × (1 + n × i). La potencia es solo de compuesta.',
  },
  {
    id: 'rec-i',
    enunciado: 'Un capital de 50.000 € ha estado invertido 6 años en capitalización compuesta y se ha convertido en 52.000 €. ¿A qué tipo de interés?',
    opciones: ['n-comp', 'i-comp', 'cn-comp', 'i-simp'],
    correcta: 'i-comp',
    porQue: 'Te dan C₀, Cₙ y n y falta el tipo: se despeja con la raíz de índice n.',
  },
  {
    id: 'rec-cn',
    enunciado: 'Calcula el capital final de invertir 4.500 € al 3 % de interés compuesto anual durante 7 años.',
    opciones: ['cn-simp', 'c0-comp', 'cn-comp', 'n-comp'],
    correcta: 'cn-comp',
    porQue: 'Te dan C₀, i y n y piden el capital final en compuesta: la fórmula general, sin despejar.',
  },
];
