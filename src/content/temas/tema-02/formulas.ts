/*
 * Índice de fórmulas del Tema 2 (Unidad 2 · Gestión financiera), en el orden del temario:
 * 3.1.A capitalización simple, 3.1.B capitalización compuesta y 3.2 descuento.
 * Fuente: docs/fuentes/tema-02-matematica-financiera.md (análisis del libro) y los casos prácticos
 * que ya estaban verificados en el proyecto. Las cifras de los ejemplos se comprueban en
 * tests/content/formulasTema2.test.ts con src/domain/calculoFinanciero.ts.
 *
 * Etiquetas de procedencia de los ejemplos:
 *  - «Caso resuelto»: caso resuelto del libro (sin citar su número: el alumno no tiene el libro).
 *  - «Ejercicio de práctica»: la solución se calcula aquí.
 */

export type BloqueId = 'simple' | 'compuesta' | 'descuento';

export interface Bloque {
  id: BloqueId;
  titulo: string;
  apartado: string;
  idea: string;
  /** Para no memorizar todas las variantes: lo mínimo que hay que saber y cómo salen las demás. */
  memoriza: string[];
}

export const BLOQUES: readonly Bloque[] = [
  {
    id: 'simple',
    titulo: 'Capitalización simple',
    apartado: 'Apartado 3.1.A',
    idea: 'Los intereses de cada periodo se calculan siempre sobre el capital inicial: no se acumulan.',
    memoriza: [
      'Apréndete solo dos: $I = C_0 · n · i$ y $C_n = C_0 + I$.',
      'Juntándolas sale $C_n = C_0 · (1 + n · i)$; despejando salen $C_0$, $i$ y $n$.',
      'Con periodos más cortos que el año, la misma fórmula con $i_m$ y $n · m$.',
    ],
  },
  {
    id: 'compuesta',
    titulo: 'Capitalización compuesta',
    apartado: 'Apartado 3.1.B',
    idea: 'Los intereses de cada periodo se suman al capital y producen intereses en los periodos siguientes.',
    memoriza: [
      'La madre es $C_n = C_0 · (1 + i)^n$: un periodo, una multiplicación por $(1 + i)$.',
      'Para $C_0$ se divide; para $n$, logaritmos; para $i$, raíz de índice $n$.',
      'En compuesta el tipo no se divide entre $m$: se usan tantos equivalentes.',
    ],
  },
  {
    id: 'descuento',
    titulo: 'Descuento',
    apartado: 'Apartado 3.2',
    idea: 'Cobrar hoy un capital que vence más adelante: se resta un descuento al nominal.',
    memoriza: [
      'Siempre: efectivo = nominal − descuento ($E = N - D$).',
      'Comercial: el descuento se calcula sobre $N$. Racional: sobre el efectivo (es capitalizar al revés).',
      'Compuesto racional: la capitalización compuesta al revés, $(1 + i)^{-n}$. Compuesto comercial: $(1 - d)^n$.',
    ],
  },
];

export interface ErrorFormula {
  mal: string;
  bien: string;
}

export interface Relacion {
  id: string;
  texto: string;
}

export interface EntradaFormula {
  /** Segmento de la ruta `#tema/2/f/<id>`; es también el id de su animación. */
  id: string;
  bloque: BloqueId;
  /** Número en el índice (1–19), estable para citarlo en los ejercicios. */
  numero: number;
  nombre: string;
  /** Notación de src/ui/matematica/formula.ts. */
  expresion: string;
  variantes?: { expresion: string; nota: string }[];
  /** Símbolo que se calcula (o null si la entrada compara, no calcula). */
  calcula: string | null;
  /** Lo que significa cada símbolo en esta fórmula, si hay algo que añadir a su definición general. */
  notas?: Record<string, string>;
  /** Cómo suelen aparecer los datos en el enunciado. */
  datos: string[];
  /** Cuándo se usa. */
  cuando: string[];
  /** Cómo reconocer que es la adecuada: lo que te dan → lo que te piden. */
  reconocer: string;
  relaciones: Relacion[];
  consejos: string[];
  errores: ErrorFormula[];
  ejemplo: { fuente: string; texto: string };
}

export const FORMULAS_TEMA2: readonly EntradaFormula[] = [
  /* ------------------------------------------------------------------------------- simple */
  {
    id: 'simple-intereses',
    bloque: 'simple',
    numero: 1,
    nombre: 'Intereses totales',
    expresion: 'I = C_0 · n · i',
    calcula: 'I',
    notas: { n: 'En la misma unidad que el tipo: con tipo anual, en años.', i: 'En tanto por uno: 3 % → 0,03.' },
    datos: ['«invierte / presta 15.000 €» → C₀', '«al 3 % anual» → i = 0,03', '«durante 3 años» → n = 3', '«¿qué intereses obtendrá?» → I'],
    cuando: ['Te preguntan lo que produce el capital, no lo que habrá en total.', 'Capitalización simple (operaciones a corto plazo).'],
    reconocer: 'Te dan C₀, i y n → te piden los intereses.',
    relaciones: [
      { id: 'simple-montante', texto: 'Sumando C₀ sale el montante.' },
      { id: 'simple-tipo', texto: 'Con I = Cₙ − C₀, se despeja i.' },
      { id: 'simple-tiempo', texto: 'Con I = Cₙ − C₀, se despeja n.' },
      { id: 'simple-fraccionado', texto: 'La misma fórmula con iₘ y n · m.' },
    ],
    consejos: ['Se lee «capital por tiempo por tipo». Todas las fórmulas de simple salen de esta y de Cₙ = C₀ + I.', 'Cada periodo produce lo mismo, C₀ · i: los intereses totales son esa cantidad sumada n veces.'],
    errores: [
      { mal: 'I = 15.000 · 3 · 3', bien: 'El tipo va en tanto por uno: 3 % → 0,03. I = 15.000 · 3 · 0,03 = 1.350 €.' },
      { mal: 'Tipo anual con n = 18 (meses)', bien: 'n en la unidad del tipo: 18 meses = 1,5 años.' },
      { mal: 'Dar I como resultado cuando piden el capital final', bien: 'I son solo los intereses. Lo que habrá al final es Cₙ = C₀ + I.' },
    ],
    ejemplo: { fuente: 'Caso resuelto', texto: 'María invierte 15.000 € al 3 % de interés simple anual durante 3 años: I = 15.000 · 3 · 0,03 = 1.350 €. El libro imprime 1.450 €, una errata: el cálculo da 1.350 €.' },
  },
  {
    id: 'simple-montante',
    bloque: 'simple',
    numero: 2,
    nombre: 'Capital final o montante',
    expresion: 'C_n = C_0 · (1 + n · i)',
    variantes: [{ expresion: 'C_n = C_0 + I', nota: 'De donde sale: lo que había más lo que ha crecido.' }],
    calcula: 'C_n',
    datos: ['«capital de 18.500 €» → C₀', '«al 4 % de interés simple anual» → i = 0,04', '«durante 5 años» → n = 5', '«¿cuál será el capital final / el montante?» → Cₙ'],
    cuando: ['Te piden lo que habrá al final de la operación: capital más intereses.'],
    reconocer: 'Te dan C₀, i y n → te piden el capital final.',
    relaciones: [
      { id: 'simple-intereses', texto: 'Es C₀ + I, con I = C₀ · n · i.' },
      { id: 'simple-capital-inicial', texto: 'Despejando C₀ sale la fórmula 3.' },
      { id: 'compuesta-montante', texto: 'En compuesta, (1 + n · i) se convierte en (1 + i)ⁿ.' },
    ],
    consejos: ['Si recuerdas I = C₀ · n · i, el montante es sumar C₀ y sacar C₀ factor común.', 'El paréntesis (1 + n · i) es lo que vale al final cada euro invertido.'],
    errores: [
      { mal: 'Cₙ = C₀ · n · i', bien: 'Eso son solo los intereses. Falta el 1: Cₙ = C₀ · (1 + n · i).' },
      { mal: 'Cₙ = C₀ · (1 + i)ⁿ en un ejercicio de simple', bien: 'La potencia es de compuesta. En simple, n multiplica a i.' },
    ],
    ejemplo: { fuente: 'Caso resuelto', texto: 'Juana invierte 18.500 € al 4 % de interés simple anual durante 5 años: Cₙ = 18.500 · (1 + 5 · 0,04) = 22.200 €.' },
  },
  {
    id: 'simple-capital-inicial',
    bloque: 'simple',
    numero: 3,
    nombre: 'Capital inicial',
    expresion: 'C_0 = \\frac{C_n}{1 + n · i}',
    calcula: 'C_0',
    datos: ['«para disponer de 5.400 € dentro de 2 años» → Cₙ y n', '«al 4 % anual» → i = 0,04', '«¿qué capital hay que invertir hoy?» → C₀'],
    cuando: ['Conoces lo que quieres tener al final y te preguntan lo que hay que poner hoy.'],
    reconocer: 'Te dan Cₙ, i y n → te piden lo que se invierte hoy.',
    relaciones: [
      { id: 'simple-montante', texto: 'Es la fórmula 2 despejada: el factor pasa dividiendo.' },
      { id: 'descuento-racional', texto: 'El descuento racional simple parte de este C₀.' },
    ],
    consejos: ['No la memorices: escribe Cₙ = C₀ · (1 + n · i) y divide los dos lados entre (1 + n · i).'],
    errores: [
      { mal: 'C₀ = Cₙ · (1 + n · i)', bien: 'Para ir hacia atrás se divide, no se multiplica.' },
      { mal: 'C₀ = Cₙ / (n · i)', bien: 'No olvides el 1 del paréntesis: C₀ = Cₙ / (1 + n · i).' },
    ],
    ejemplo: { fuente: 'Ejercicio de práctica', texto: 'Para tener 5.400 € dentro de 2 años al 4 % simple: C₀ = 5.400 / (1 + 2 · 0,04) = 5.000 €.' },
  },
  {
    id: 'simple-tipo',
    bloque: 'simple',
    numero: 4,
    nombre: 'Tipo de interés',
    expresion: 'i = \\frac{C_n - C_0}{n · C_0}',
    variantes: [{ expresion: 'i = \\frac{I}{C_0 · n}', nota: 'Si el enunciado da directamente los intereses.' }],
    calcula: 'i',
    notas: { i: 'Sale en tanto por uno y en la unidad de n: con n en años, tipo anual.' },
    datos: ['«un capital de 8.000 €» → C₀', '«en 18 meses» → n = 1,5 años', '«ha producido 720 € de intereses» → I (o Cₙ = 8.720 €)', '«¿a qué tipo anual?» → i'],
    cuando: ['Conoces lo que se invirtió, lo que se obtuvo y el tiempo; falta el tipo.'],
    reconocer: 'Te dan C₀, Cₙ (o I) y n → te piden el tipo.',
    relaciones: [{ id: 'simple-intereses', texto: 'Es la fórmula 1 despejando i, con I = Cₙ − C₀.' }],
    consejos: ['Arriba, lo que ha crecido; abajo, capital por tiempo.', 'Pasa el resultado a porcentaje al final: 0,06 → 6 %.'],
    errores: [
      { mal: 'i = Cₙ / (n · C₀)', bien: 'Arriba van solo los intereses: Cₙ − C₀.' },
      { mal: 'Contestar «0,06 %»', bien: '0,06 en tanto por uno es 6 %.' },
      { mal: 'Dejar n = 18 y llamar «anual» al resultado', bien: 'Con n en meses el tipo sale mensual. Para anual, n = 1,5 años.' },
    ],
    ejemplo: { fuente: 'Ejercicio de práctica', texto: '8.000 € que en 18 meses producen 720 €: i = 720 / (8.000 · 1,5) = 0,06 → 6 % anual.' },
  },
  {
    id: 'simple-tiempo',
    bloque: 'simple',
    numero: 5,
    nombre: 'Tiempo',
    expresion: 'n = \\frac{C_n - C_0}{i · C_0}',
    calcula: 'n',
    notas: { n: 'Sale en la unidad del tipo. Los decimales se pasan a meses (× 12) y a días (× 30).' },
    datos: ['«un capital de 6.000 €» → C₀', '«al 3 % anual» → i = 0,03', '«para obtener 6.500 €» → Cₙ', '«¿cuánto tiempo? (años, meses y días)» → n'],
    cuando: ['Conoces el capital, el tipo y el objetivo; falta cuánto dura la operación.'],
    reconocer: 'Te dan C₀, Cₙ e i → te piden el tiempo.',
    relaciones: [{ id: 'simple-intereses', texto: 'Es la fórmula 1 despejando n, con I = Cₙ − C₀.' }],
    consejos: ['Es la misma idea que el tipo: lo que ha crecido entre lo que crece cada periodo (C₀ · i).', 'Parte decimal de los años × 12 = meses; parte decimal de los meses × 30 = días.'],
    errores: [
      { mal: '2,78 años = «2 años y 78 días»', bien: '0,78 · 12 = 9,36 meses; 0,36 · 30 = 10,8 → 2 años, 9 meses y 11 días.' },
      { mal: 'n = Cₙ / (i · C₀)', bien: 'Arriba van los intereses: Cₙ − C₀.' },
    ],
    ejemplo: { fuente: 'Caso resuelto', texto: '6.000 € al 3 % para llegar a 6.500 €: n = 500 / (0,03 · 6.000) = 2,78 años = 2 años, 9 meses y 11 días.' },
  },
  {
    id: 'simple-fraccionado',
    bloque: 'simple',
    numero: 6,
    nombre: 'Fraccionamiento del año e interés fraccionado',
    expresion: 'i_m = \\frac{i}{m}',
    variantes: [{ expresion: 'I = C_0 · i_m · n · m', nota: 'n en años y m partes por año: n · m es el número de periodos.' }],
    calcula: 'i_m',
    notas: { m: 'Semestres 2, cuatrimestres 3, trimestres 4, meses 12, días 360 (año comercial) o 365 (año civil).' },
    datos: ['«intereses semestrales / trimestrales / mensuales» → m', '«durante 195 días» → n · m = 195 con m = 365 o 360', '«año civil» → 365 · «año comercial» → 360'],
    cuando: ['El tipo es anual pero el tiempo va en meses o días, o los intereses se liquidan cada periodo.', 'Solo en capitalización simple: el tipo fraccionado es proporcional.'],
    reconocer: 'El tipo y el tiempo vienen en unidades distintas → pasa el tipo a la unidad del tiempo.',
    relaciones: [
      { id: 'simple-intereses', texto: 'Es la fórmula 1 con iₘ en lugar de i y n · m en lugar de n.' },
      { id: 'compuesta-equivalentes', texto: 'En compuesta no se divide: tantos equivalentes.' },
    ],
    consejos: ['Regla de homogeneidad: n e i siempre en la misma unidad de tiempo.', 'Contar los periodos (n · m) en la unidad de iₘ da el mismo resultado que trabajar en años.'],
    errores: [
      { mal: 'Usar 360 cuando el enunciado dice año civil', bien: 'Año civil → 365 días; año comercial → 360.' },
      { mal: 'iₘ = i / m en compuesta', bien: 'Solo en simple. En compuesta, $i_m = (1 + i)^{1/m} - 1$.' },
    ],
    ejemplo: { fuente: 'Caso resuelto', texto: '5.000 € al 3 % anual durante 195 días, año civil: i₃₆₅ = 0,03 / 365 → Cₙ = 5.000 · (1 + 0,03 / 365 · 195) = 5.080,14 €.' },
  },
  /* ---------------------------------------------------------------------------- compuesta */
  {
    id: 'compuesta-montante',
    bloque: 'compuesta',
    numero: 7,
    nombre: 'Capital final o montante',
    expresion: 'C_n = C_0 · (1 + i)^n',
    variantes: [{ expresion: '(1 + i)^n', nota: 'Factor de capitalización compuesta: lo que vale al final cada euro.' }],
    calcula: 'C_n',
    datos: ['«interés compuesto / capitalización compuesta»', '«4.500 €» → C₀ · «al 3 %» → i · «durante 7 años» → n', '«¿capital final?» → Cₙ'],
    cuando: ['Los intereses se acumulan al capital (largo plazo, más de un año).'],
    reconocer: 'Te dan C₀, i y n en compuesta → te piden el capital final.',
    relaciones: [
      { id: 'compuesta-intereses', texto: 'Restando C₀ salen los intereses.' },
      { id: 'compuesta-capital-inicial', texto: 'Dividiendo entre (1 + i)ⁿ sale C₀.' },
      { id: 'compuesta-tiempo', texto: 'Con logaritmos se despeja n.' },
      { id: 'compuesta-tipo', texto: 'Con la raíz de índice n se despeja i.' },
    ],
    consejos: ['El exponente cuenta las veces que se multiplica por (1 + i): un periodo, una multiplicación.'],
    errores: [
      { mal: 'Cₙ = 1.000 · (1 + 5)³', bien: 'El tipo en tanto por uno: (1 + 0,05)³.' },
      { mal: 'Redondear (1 + i)ⁿ a dos decimales', bien: 'Deja el factor completo (o con 6 decimales) y redondea solo el resultado.' },
    ],
    ejemplo: { fuente: 'Caso resuelto', texto: '4.500 € al 3 % durante 7 años: Cₙ = 4.500 · 1,03⁷ = 5.534,43 €.' },
  },
  {
    id: 'compuesta-intereses',
    bloque: 'compuesta',
    numero: 8,
    nombre: 'Intereses totales',
    expresion: 'I = C_0 · [(1 + i)^n - 1]',
    variantes: [{ expresion: 'I = C_n - C_0', nota: 'Si ya tienes el capital final.' }],
    calcula: 'I',
    datos: ['Los mismos que el capital final, pero la pregunta es «¿qué intereses?»'],
    cuando: ['Te piden lo que produce el capital en compuesta.'],
    reconocer: 'Te dan C₀, i y n en compuesta → te piden los intereses.',
    relaciones: [{ id: 'compuesta-montante', texto: 'Es Cₙ − C₀ con C₀ factor común.' }],
    consejos: ['El corchete es el factor menos 1 (el euro invertido): lo que se gana por cada euro.'],
    errores: [{ mal: 'I = C₀ · i · n en compuesta', bien: 'Eso es de simple. En compuesta, I = Cₙ − C₀.' }],
    ejemplo: { fuente: 'Caso resuelto', texto: 'I = 4.500 · (1,03⁷ − 1) = 1.034,43 €.' },
  },
  {
    id: 'compuesta-capital-inicial',
    bloque: 'compuesta',
    numero: 9,
    nombre: 'Capital inicial',
    expresion: 'C_0 = C_n · (1 + i)^{-n}',
    variantes: [{ expresion: 'C_0 = \\frac{C_n}{(1 + i)^n}', nota: 'La misma, escrita como división.' }],
    calcula: 'C_0',
    datos: ['«dio como resultado 9.000 €» → Cₙ', '«una operación que duró 8 años» → n', '«al 7 %» → i', '«¿qué capital se invirtió?» → C₀'],
    cuando: ['Conoces el final en compuesta y te piden lo que se invirtió.'],
    reconocer: 'Te dan Cₙ, i y n en compuesta → te piden C₀.',
    relaciones: [
      { id: 'compuesta-montante', texto: 'Es la fórmula 7 despejada.' },
      { id: 'descuento-compuesto-racional', texto: 'Es la base del descuento compuesto racional.' },
    ],
    consejos: ['Un año hacia atrás es dividir una vez entre (1 + i); n años, n veces: exponente −n.'],
    errores: [{ mal: 'C₀ = Cₙ · (1 + i)ⁿ', bien: 'Hacia atrás se divide: exponente negativo.' }],
    ejemplo: { fuente: 'Caso resuelto', texto: '9.000 € a 8 años al 7 %: C₀ = 9.000 · 1,07⁻⁸ = 5.238,08 €; I = 3.761,92 €.' },
  },
  {
    id: 'compuesta-tiempo',
    bloque: 'compuesta',
    numero: 10,
    nombre: 'Tiempo',
    expresion: 'n = \\frac{log(C_n / C_0)}{log(1 + i)}',
    calcula: 'n',
    datos: ['«capital de 30.000 €» → C₀', '«al 10 %» → i', '«ha dado como resultado 35.000 €» → Cₙ', '«¿cuánto tiempo?» → n'],
    cuando: ['La incógnita está en el exponente: hace falta el logaritmo.'],
    reconocer: 'Te dan C₀, Cₙ e i en compuesta → te piden el tiempo.',
    relaciones: [{ id: 'compuesta-montante', texto: 'Es la fórmula 7 despejando el exponente.' }],
    consejos: ['El logaritmo convierte multiplicar en sumar: cuántos escalones de log(1 + i) caben en log(Cₙ / C₀).', 'Los decimales se pasan a meses y días igual que en simple.'],
    errores: [{ mal: 'n = (Cₙ − C₀) / (i · C₀) en compuesta', bien: 'Eso es de simple. En compuesta hay que usar logaritmos.' }],
    ejemplo: { fuente: 'Caso resuelto', texto: '30.000 € al 10 % hasta 35.000 €: n = log 1,1667 / log 1,1 = 1,62 años = 1 año, 7 meses y 13 días.' },
  },
  {
    id: 'compuesta-tipo',
    bloque: 'compuesta',
    numero: 11,
    nombre: 'Tipo de interés',
    expresion: 'i = (\\frac{C_n}{C_0})^{1/n} - 1',
    calcula: 'i',
    datos: ['«50.000 €» → C₀ · «52.000 €» → Cₙ · «6 años» → n', '«¿a qué tipo?» → i'],
    cuando: ['Conoces C₀, Cₙ y n en compuesta; falta el tipo.'],
    reconocer: 'Te dan C₀, Cₙ y n en compuesta → te piden el tipo.',
    relaciones: [{ id: 'compuesta-montante', texto: 'Es la fórmula 7 despejando i con una raíz.' }],
    consejos: ['El crecimiento total se reparte en n factores iguales: eso es la raíz de índice n.'],
    errores: [{ mal: 'i = √(Cₙ / C₀) − 1 siempre', bien: 'Es la raíz de índice n; solo es cuadrada si n = 2 (el libro dice «raíces cuadradas»: errata).' }],
    ejemplo: { fuente: 'Caso resuelto', texto: '50.000 € → 52.000 € en 6 años: $i = 1,04^{1/6} - 1$ = 0,006558 (0,66 % anual).' },
  },
  {
    id: 'compuesta-equivalentes',
    bloque: 'compuesta',
    numero: 12,
    nombre: 'Tantos equivalentes',
    expresion: '1 + i = (1 + i_m)^m',
    variantes: [
      { expresion: 'i_m = (1 + i)^{1/m} - 1', nota: 'Del anual al de cada periodo.' },
      { expresion: 'i = (1 + i_m)^m - 1', nota: 'Del de cada periodo al anual.' },
    ],
    calcula: 'i_m',
    datos: ['«tipo anual del 10 %… ¿mensual equivalente?»', '«1 % mensual compuesto… ¿anual?»'],
    cuando: ['En compuesta, cuando el tipo y el tiempo van en unidades distintas.'],
    reconocer: 'Te piden pasar un tipo compuesto de una unidad de tiempo a otra.',
    relaciones: [
      { id: 'simple-fraccionado', texto: 'En simple sí se divide: iₘ = i / m.' },
      { id: 'compuesta-tae', texto: 'La TAE es el tanto anual equivalente al TIN.' },
    ],
    consejos: ['Dos tipos son equivalentes si llevan el mismo capital al mismo sitio en el mismo tiempo.', '1 % mensual compuesto no es 12 % anual: es 12,68 %.'],
    errores: [{ mal: 'i₁₂ = 0,10 / 12', bien: 'En compuesta: $i_{12} = 1,10^{1/12} - 1$ = 0,7974 %.' }],
    ejemplo: { fuente: 'Caso resuelto', texto: '10 % anual: $i_{12} = (1 + 0,10)^{1/12} - 1$ = 0,7974 % mensual.' },
  },
  {
    id: 'compuesta-comparacion',
    bloque: 'compuesta',
    numero: 13,
    nombre: 'Simple frente a compuesta según el plazo',
    expresion: '1 + n · i < (1 + i)^n',
    variantes: [
      { expresion: '1 + n · i = (1 + i)^n', nota: 'Con n = 1 año exacto (y en n = 0).' },
      { expresion: '1 + n · i > (1 + i)^n', nota: 'Con 0 < n < 1: plazos de menos de un año.' },
    ],
    calcula: null,
    notas: { n: 'La fórmula principal vale para i > 0 y n > 1 (más de un año).' },
    datos: ['Mismo capital y mismo tipo; lo que cambia es el plazo.'],
    cuando: ['Para elegir la ley que da más (o comprobar un resultado) según la duración.'],
    reconocer: 'Te preguntan qué régimen da más con un plazo dado.',
    relaciones: [
      { id: 'simple-montante', texto: 'Recta: 1 + n · i.' },
      { id: 'compuesta-montante', texto: 'Curva: (1 + i)ⁿ.' },
    ],
    consejos: ['Antes del año, la recta va por encima; en el año, empatan; después, gana la curva.'],
    errores: [{ mal: '«La compuesta siempre da más»', bien: 'Con menos de un año da más la simple.' }],
    ejemplo: { fuente: 'Caso resuelto', texto: '5.000 € al 3 % durante 195 días: simple 5.080,14 € y compuesta 5.079,59 €.' },
  },
  {
    id: 'compuesta-tae',
    bloque: 'compuesta',
    numero: 14,
    nombre: 'TIN y TAE',
    expresion: 'TAE = (1 + \\frac{J_m}{m})^m - 1',
    variantes: [{ expresion: 'J_m = i_m · m', nota: 'El TIN es el tipo de cada periodo por los periodos del año.' }],
    calcula: 'TAE',
    datos: ['«TIN del 12 %» → Jₘ', '«con capitalización mensual» → m = 12', '«comisión de reembolso del 1,5 %» → se resta de lo que se cobra'],
    cuando: ['Para comparar productos bancarios: la TAE incluye la capitalización (y las comisiones).'],
    reconocer: 'Te dan un TIN y la frecuencia de capitalización → te piden la TAE.',
    relaciones: [{ id: 'compuesta-equivalentes', texto: 'La TAE es el tanto anual equivalente a iₘ = Jₘ / m.' }],
    consejos: ['Pasos: TIN ÷ m → iₘ; (1 + iₘ)ᵐ − 1 → TAE.', 'Con comisiones, calcula lo que de verdad recibes y compáralo con lo invertido.'],
    errores: [{ mal: 'TAE = TIN', bien: 'Solo coinciden si se capitaliza una vez al año (m = 1).' }],
    ejemplo: { fuente: 'Caso resuelto', texto: '10.000 € al 12 % TIN mensual: TAE = 1,01¹² − 1 = 12,68 %. Con comisión de reembolso del 1,5 % se reciben 11.099,23 €: TAE real 10,99 %.' },
  },
  /* ---------------------------------------------------------------------------- descuento */
  {
    id: 'descuento-comercial',
    bloque: 'descuento',
    numero: 15,
    nombre: 'Descuento comercial simple',
    expresion: 'D_c = N · n · d',
    variantes: [{ expresion: 'E = N · (1 - n · d)', nota: 'Lo que se recibe hoy.' }],
    calcula: 'D_c',
    notas: { n: 'Días hasta el vencimiento / 360 (año comercial) si d es anual.' },
    datos: ['«pagaré / letra de 6.000 €» → N', '«vence dentro de 45 días» → n = 45 / 360', '«descuento comercial del 5 %» → d'],
    cuando: ['Descontar un efecto en el banco: se calcula sobre el nominal.'],
    reconocer: 'Te dan N, n y d → te piden el descuento o el efectivo.',
    relaciones: [
      { id: 'descuento-racional', texto: 'El racional se calcula sobre el efectivo: sale menor.' },
      { id: 'descuento-remesa', texto: 'Es el primer descuento de la liquidación.' },
    ],
    consejos: ['Tiene la misma forma que I = C₀ · n · i, pero sobre N y con d.'],
    errores: [{ mal: 'Calcularlo sobre el efectivo', bien: 'El comercial va sobre el nominal N.' }],
    ejemplo: { fuente: 'Ejercicio de práctica', texto: 'Pagaré de 6.000 € a 45 días al 5 %: Dc = 6.000 · 45/360 · 0,05 = 37,50 €; E = 5.962,50 €.' },
  },
  {
    id: 'descuento-racional',
    bloque: 'descuento',
    numero: 16,
    nombre: 'Descuento racional simple',
    expresion: 'D_r = \\frac{C_n · n · i}{1 + n · i}',
    variantes: [{ expresion: 'D_r = C_n - C_0', nota: 'Con C₀ = Cₙ / (1 + n · i).' }],
    calcula: 'D_r',
    datos: ['«capital de 6.000 € que vence en 45 días» → Cₙ, n', '«descuento racional al 5 %» → i'],
    cuando: ['El descuento se calcula sobre el efectivo: es capitalizar al revés.'],
    reconocer: 'Te piden un descuento «racional» en simple.',
    relaciones: [
      { id: 'simple-capital-inicial', texto: 'Primero C₀ = Cₙ / (1 + n · i).' },
      { id: 'descuento-comercial', texto: 'El comercial (sobre N) siempre es mayor.' },
    ],
    consejos: ['Racional = el que «tiene sentido»: el descuento son los intereses del efectivo, C₀ · n · i.'],
    errores: [{ mal: 'Dr = Cₙ · n · i', bien: 'Eso es el comercial. El racional divide entre (1 + n · i).' }],
    ejemplo: { fuente: 'Ejercicio de práctica', texto: 'El mismo pagaré: Dr = 6.000 · 0,125 · 0,05 / 1,00625 = 37,27 €, menor que el comercial (37,50 €).' },
  },
  {
    id: 'descuento-remesa',
    bloque: 'descuento',
    numero: 17,
    nombre: 'Valor líquido de una remesa',
    expresion: '"Líquido" = N - D_c - "comisiones" - "gastos"',
    calcula: null,
    datos: ['«comisión del 1 % con un mínimo de 10 €» → la mayor de las dos', '«gastos de correo 3 €», «timbre» → gastos'],
    cuando: ['Liquidar el descuento de uno o varios efectos (remesa).'],
    reconocer: 'Te dan efectos con comisiones y gastos → te piden lo que se cobra.',
    relaciones: [{ id: 'descuento-comercial', texto: 'El descuento de cada efecto es comercial.' }],
    consejos: ['Haz una tabla: nominal, días, descuento, comisión (aplica el mínimo), gastos; suma columnas y resta.'],
    errores: [{ mal: 'Olvidar el mínimo de la comisión', bien: 'Si el % da menos que el mínimo, se cobra el mínimo.' }],
    ejemplo: { fuente: 'Ejercicio de práctica', texto: '6.000 € a 45 días al 5 %, comisión 1 % (mín. 10 €) y 3 € de correo: 6.000 − 37,50 − 60 − 3 = 5.899,50 €.' },
  },
  {
    id: 'descuento-compuesto-racional',
    bloque: 'descuento',
    numero: 18,
    nombre: 'Descuento compuesto racional',
    expresion: 'D_r = C_n · [1 - (1 + i)^{-n}]',
    variantes: [{ expresion: 'C_0 = C_n · (1 + i)^{-n}', nota: 'El efectivo.' }],
    calcula: 'D_r',
    notas: { n: 'En años, aunque tenga decimales (565 días → 565 / 365).' },
    datos: ['«12.500 € que vencen dentro de 565 días» → Cₙ, n', '«al 4 %» → i'],
    cuando: ['Descontar a más de un año con la ley compuesta.'],
    reconocer: 'Te piden un descuento compuesto racional.',
    relaciones: [{ id: 'compuesta-capital-inicial', texto: 'Es la fórmula 9: actualizar y restar.' }],
    consejos: ['Actualiza con (1 + i)⁻ⁿ y resta: lo que falta hasta Cₙ es el descuento.'],
    errores: [{ mal: 'Usar n en días con un tipo anual', bien: 'n = días / 365 (o 360 si lo dice el enunciado).' }],
    ejemplo: { fuente: 'Caso resuelto', texto: '12.500 € a 565 días al 4 %: $D_r = 12.500 · [1 - 1,04^{-565/365}]$ = 736,32 €.' },
  },
  {
    id: 'descuento-compuesto-comercial',
    bloque: 'descuento',
    numero: 19,
    nombre: 'Descuento compuesto comercial',
    expresion: 'D_c = N · [1 - (1 - d)^n]',
    variantes: [{ expresion: 'E = N · (1 - d)^n', nota: 'El efectivo.' }],
    calcula: 'D_c',
    datos: ['«efecto de 2.000 € a 6 años» → N, n', '«descuento compuesto comercial al 5 %» → d'],
    cuando: ['Descuento comercial a largo plazo: cada año se quita d de lo que queda.'],
    reconocer: 'Te piden un descuento compuesto comercial.',
    relaciones: [{ id: 'descuento-comercial', texto: 'En simple se quita d · N cada año; aquí, d de lo que queda.' }],
    consejos: ['Racional: (1 + i)⁻ⁿ. Comercial: (1 − d)ⁿ. No los mezcles.'],
    errores: [{ mal: 'E = N · (1 + d)⁻ⁿ', bien: 'Eso es el racional con i. El comercial es (1 − d)ⁿ.' }],
    ejemplo: { fuente: 'Caso resuelto', texto: '2.000 € a 6 años al 5 %: Dc = 2.000 · (1 − 0,95⁶) = 529,82 €; E = 1.470,18 €.' },
  },
];

export const formulaPorId = (id: string): EntradaFormula | undefined => FORMULAS_TEMA2.find((f) => f.id === id);
export const formulasDe = (bloque: BloqueId): EntradaFormula[] => FORMULAS_TEMA2.filter((f) => f.bloque === bloque);
