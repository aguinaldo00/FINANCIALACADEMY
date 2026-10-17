/*
 * Enunciados del Tema 2 para las fases de práctica:
 *  B · identificar los datos (cada fragmento del enunciado con su símbolo y su significado),
 *  C · elegir la fórmula (y entender por qué las otras no),
 *  D · resolver en papel con ayudas que se retiran (nivel 1 → 4).
 *
 * Procedencia en `fuente`: «Caso resuelto» es un caso resuelto del libro; «Ejercicio de práctica»
 * es un enunciado cuya solución se calcula aquí (del libro sin solución o propuesto por nosotros).
 * La web no cita números de caso, actividad ni página: el alumno no tiene por qué tener el libro.
 * Las respuestas se comprueban en
 * tests/content/ejerciciosTema2.test.ts con src/domain/calculoFinanciero.ts.
 */
import type { BloqueId } from './formulas.ts';

export interface DatoEnunciado {
  /** Fragmento literal del enunciado (tiene que aparecer tal cual). */
  texto: string;
  /** Símbolo que le corresponde. */
  clave: string;
  /** Cómo entra en la fórmula. */
  valor: string;
}

export type TipoRespuesta = 'euros' | 'tanto' | 'anos';

export interface EjercicioTema2 {
  id: string;
  bloque: BloqueId;
  fuente: string;
  enunciado: string;
  datos: DatoEnunciado[];
  /** Lo que se pide (fragmento de la pregunta y su símbolo); null si no es un símbolo del tema. */
  incognita: DatoEnunciado | null;
  /** Fórmula correcta y alternativas (ids del índice). */
  formula: string;
  opciones: string[];
  porQue: string;
  /** Razones propias para descartar alguna alternativa (si no, se explica a partir del índice). */
  porQueNo?: Record<string, string>;
  /** 1: datos y fórmula a la vista · 2: con pistas · 3: pistas solo tras intentarlo · 4: como en el examen. */
  nivel: 1 | 2 | 3 | 4;
  respuesta: { valor: number; tipo: TipoRespuesta; tolerancia?: number; texto: string };
  /** Primera línea de la solución: la fórmula con los datos sustituidos ($…$ son fórmulas). */
  sustitucion: string;
  pasos: string[];
}

export const EJERCICIOS_TEMA2: readonly EjercicioTema2[] = [
  /* ------------------------------------------------------------------------- simple */
  {
    id: 's-10000',
    bloque: 'simple',
    fuente: 'Ejercicio de práctica',
    enunciado: 'Se constituye un capital de 10.000 € al 7 % de interés simple anual durante tres años. ¿Qué intereses produce?',
    datos: [
      { texto: '10.000 €', clave: 'C_0', valor: '10.000 €' },
      { texto: '7 % de interés simple anual', clave: 'i', valor: '0,07 anual' },
      { texto: 'tres años', clave: 'n', valor: '3 (años, como el tipo)' },
    ],
    incognita: { texto: '¿Qué intereses produce?', clave: 'I', valor: 'intereses totales' },
    formula: 'simple-intereses',
    opciones: ['simple-intereses', 'simple-montante', 'compuesta-intereses', 'simple-tipo'],
    porQue: 'Te dan C₀, i y n en simple y te piden solo lo que produce el capital: I = C₀ · n · i.',
    nivel: 1,
    respuesta: { valor: 2100, tipo: 'euros', texto: 'I = 2.100 €' },
    sustitucion: '$I = 10.000 · 3 · 0,07$',
    pasos: ['$I = C_0 · n · i$', '$I = 10.000 · 3 · 0,07 = "2.100 €"$'],
  },
  {
    id: 's-maria',
    bloque: 'simple',
    fuente: 'Caso resuelto',
    enunciado: 'María invierte 15.000 € al 3 % de interés simple anual durante 3 años. ¿Cuál será el importe de los intereses totales?',
    datos: [
      { texto: '15.000 €', clave: 'C_0', valor: '15.000 €' },
      { texto: '3 % de interés simple anual', clave: 'i', valor: '0,03 anual' },
      { texto: '3 años', clave: 'n', valor: '3 años' },
    ],
    incognita: { texto: '¿Cuál será el importe de los intereses totales?', clave: 'I', valor: 'intereses totales' },
    formula: 'simple-intereses',
    opciones: ['simple-montante', 'simple-intereses', 'compuesta-montante', 'simple-capital-inicial'],
    porQue: 'Piden los intereses totales en simple con C₀, i y n conocidos.',
    nivel: 1,
    respuesta: { valor: 1350, tipo: 'euros', texto: 'I = 1.350 €' },
    sustitucion: '$I = 15.000 · 3 · 0,03$',
    pasos: ['$I = C_0 · n · i$', '$I = 15.000 · 3 · 0,03 = "1.350 €"$', 'El libro imprime 1.450 €, pero 15.000 · 3 · 0,03 = 1.350 €.'],
  },
  {
    id: 's-juana',
    bloque: 'simple',
    fuente: 'Caso resuelto',
    enunciado: 'Juana invierte 18.500 € al 4 % de interés simple anual durante 5 años. ¿Cuál será el capital final?',
    datos: [
      { texto: '18.500 €', clave: 'C_0', valor: '18.500 €' },
      { texto: '4 % de interés simple anual', clave: 'i', valor: '0,04 anual' },
      { texto: '5 años', clave: 'n', valor: '5 años' },
    ],
    incognita: { texto: '¿Cuál será el capital final?', clave: 'C_n', valor: 'capital final' },
    formula: 'simple-montante',
    opciones: ['compuesta-montante', 'simple-montante', 'simple-intereses', 'simple-capital-inicial'],
    porQue: 'Piden el capital final (Cₙ) y el régimen es simple: Cₙ = C₀ · (1 + n · i).',
    porQueNo: { 'compuesta-montante': 'También da un capital final, pero con potencia: es de compuesta y el enunciado dice «interés simple».' },
    nivel: 2,
    respuesta: { valor: 22200, tipo: 'euros', texto: 'Cₙ = 22.200 €' },
    sustitucion: '$C_n = 18.500 · (1 + 5 · 0,04)$',
    pasos: ['$C_n = C_0 · (1 + n · i)$', '$C_n = 18.500 · (1 + 5 · 0,04) = 18.500 · 1,2 = "22.200 €"$'],
  },
  {
    id: 's-5400',
    bloque: 'simple',
    fuente: 'Ejercicio de práctica',
    enunciado: '¿Qué capital hay que invertir hoy al 4 % de interés simple anual para disponer de 5.400 € dentro de 2 años?',
    datos: [
      { texto: '4 % de interés simple anual', clave: 'i', valor: '0,04 anual' },
      { texto: '5.400 €', clave: 'C_n', valor: '5.400 € (lo que habrá al final)' },
      { texto: '2 años', clave: 'n', valor: '2 años' },
    ],
    incognita: { texto: '¿Qué capital hay que invertir hoy', clave: 'C_0', valor: 'capital inicial' },
    formula: 'simple-capital-inicial',
    opciones: ['simple-montante', 'simple-capital-inicial', 'compuesta-capital-inicial', 'simple-intereses'],
    porQue: 'Los 5.400 € son el final (Cₙ); piden lo que se pone hoy: C₀ = Cₙ / (1 + n · i).',
    porQueNo: { 'simple-montante': 'Sirve para ir de C₀ a Cₙ. Aquí ya tienes Cₙ y buscas C₀: hay que despejarla (fórmula 3).' },
    nivel: 2,
    respuesta: { valor: 5000, tipo: 'euros', texto: 'C₀ = 5.000 €' },
    sustitucion: '$C_0 = \\frac{5.400}{1 + 2 · 0,04}$',
    pasos: ['$C_0 = \\frac{C_n}{1 + n · i}$', '$C_0 = \\frac{5.400}{1 + 2 · 0,04} = \\frac{5.400}{1,08} = "5.000 €"$'],
  },
  {
    id: 's-3000',
    bloque: 'simple',
    fuente: 'Ejercicio de práctica',
    enunciado: 'Un capital de 3.000 € se coloca al 0,5 % de interés simple mensual durante 10 meses. ¿Qué intereses produce?',
    datos: [
      { texto: '3.000 €', clave: 'C_0', valor: '3.000 €' },
      { texto: '0,5 % de interés simple mensual', clave: 'i', valor: '0,005 mensual' },
      { texto: '10 meses', clave: 'n', valor: '10 (meses, como el tipo)' },
    ],
    incognita: { texto: '¿Qué intereses produce?', clave: 'I', valor: 'intereses totales' },
    formula: 'simple-intereses',
    opciones: ['simple-intereses', 'simple-fraccionado', 'simple-montante', 'compuesta-intereses'],
    porQue: 'El tipo ya es mensual y el tiempo va en meses: están en la misma unidad, así que basta con I = C₀ · n · i.',
    porQueNo: { 'simple-fraccionado': 'Haría falta si el tipo fuera anual y el tiempo en meses. Aquí los dos ya son mensuales.' },
    nivel: 3,
    respuesta: { valor: 150, tipo: 'euros', texto: 'I = 150 €' },
    sustitucion: '$I = 3.000 · 10 · 0,005$',
    pasos: ['Tipo y tiempo en meses: ya son homogéneos.', '$I = 3.000 · 10 · 0,005 = "150 €"$'],
  },
  {
    id: 's-8000',
    bloque: 'simple',
    fuente: 'Ejercicio de práctica',
    enunciado: 'Un capital de 8.000 € ha producido 720 € de intereses en 18 meses en capitalización simple. ¿A qué tipo de interés anual se invirtió?',
    datos: [
      { texto: '8.000 €', clave: 'C_0', valor: '8.000 €' },
      { texto: '720 € de intereses', clave: 'I', valor: '720 €' },
      { texto: '18 meses', clave: 'n', valor: '1,5 años (piden un tipo anual)' },
    ],
    incognita: { texto: '¿A qué tipo de interés anual', clave: 'i', valor: 'tipo anual' },
    formula: 'simple-tipo',
    opciones: ['simple-tiempo', 'simple-tipo', 'compuesta-tipo', 'simple-intereses'],
    porQue: 'Conoces C₀, los intereses y el tiempo; falta el tipo: i = I / (C₀ · n), con n en años porque lo piden anual.',
    nivel: 3,
    respuesta: { valor: 0.06, tipo: 'tanto', texto: 'i = 0,06 → 6 % anual' },
    sustitucion: '$i = \\frac{720}{8.000 · 1,5}$',
    pasos: ['18 meses = 1,5 años.', '$i = \\frac{I}{C_0 · n} = \\frac{720}{8.000 · 1,5} = 0,06$', '0,06 → 6 % anual.'],
  },
  {
    id: 's-6000',
    bloque: 'simple',
    fuente: 'Caso resuelto',
    enunciado: 'Un capital de 6.000 € se invierte al 3 % de interés simple anual. ¿Cuánto tiempo tiene que estar invertido para obtener 6.500 €? Exprésalo en años, meses y días.',
    datos: [
      { texto: '6.000 €', clave: 'C_0', valor: '6.000 €' },
      { texto: '3 % de interés simple anual', clave: 'i', valor: '0,03 anual' },
      { texto: '6.500 €', clave: 'C_n', valor: '6.500 €' },
    ],
    incognita: { texto: '¿Cuánto tiempo', clave: 'n', valor: 'tiempo' },
    formula: 'simple-tiempo',
    opciones: ['simple-tipo', 'compuesta-tiempo', 'simple-tiempo', 'simple-montante'],
    porQue: 'Conoces C₀, Cₙ e i en simple y falta el tiempo: n = (Cₙ − C₀) / (i · C₀).',
    porQueNo: { 'compuesta-tiempo': 'Despeja el tiempo con logaritmos, pero es de compuesta. En simple no hay exponente.' },
    nivel: 3,
    respuesta: { valor: 2.78, tipo: 'anos', tolerancia: 0.01, texto: 'n = 2,78 años = 2 años, 9 meses y 11 días' },
    sustitucion: '$n = \\frac{6.500 - 6.000}{0,03 · 6.000}$',
    pasos: ['$n = \\frac{6.500 - 6.000}{0,03 · 6.000} = \\frac{500}{180} = "2,78 años"$', '0,78 · 12 = 9,36 meses', '0,36 · 30 = 10,8 → 11 días', '2 años, 9 meses y 11 días.'],
  },
  {
    id: 's-195',
    bloque: 'simple',
    fuente: 'Caso resuelto',
    enunciado: 'Se invierten 5.000 € al 3 % de interés simple anual durante 195 días (año civil). ¿Qué capital final se obtiene?',
    datos: [
      { texto: '5.000 €', clave: 'C_0', valor: '5.000 €' },
      { texto: '3 % de interés simple anual', clave: 'i', valor: '0,03 anual' },
      { texto: '195 días', clave: 'n', valor: '195 días (n · m con m = 365)' },
      { texto: 'año civil', clave: 'm', valor: '365' },
    ],
    incognita: { texto: '¿Qué capital final', clave: 'C_n', valor: 'capital final' },
    formula: 'simple-fraccionado',
    opciones: ['compuesta-montante', 'simple-fraccionado', 'simple-tiempo', 'simple-capital-inicial'],
    porQue: 'El tipo es anual y el tiempo va en días: pasas el tipo a días (i₃₆₅ = 0,03 / 365) y aplicas el montante con 195 periodos.',
    nivel: 4,
    respuesta: { valor: 5080.14, tipo: 'euros', texto: 'Cₙ = 5.080,14 €' },
    sustitucion: '$C_n = 5.000 · (1 + \\frac{0,03}{365} · 195)$',
    pasos: ['$i_m = \\frac{0,03}{365}$ (año civil)', '$I = 5.000 · \\frac{0,03}{365} · 195 = "80,14 €"$', '$C_n = 5.000 + 80,14 = "5.080,14 €"$'],
  },
  {
    id: 's-semestral',
    bloque: 'simple',
    fuente: 'Ejercicio de práctica',
    enunciado: 'Se invierten 20.000 € al 6 % de interés simple anual durante 2 años, con liquidación semestral de intereses. ¿Qué intereses se obtienen en total?',
    datos: [
      { texto: '20.000 €', clave: 'C_0', valor: '20.000 €' },
      { texto: '6 % de interés simple anual', clave: 'i', valor: '0,06 anual' },
      { texto: '2 años', clave: 'n', valor: '2 años' },
      { texto: 'liquidación semestral', clave: 'm', valor: '2 semestres por año' },
    ],
    incognita: { texto: '¿Qué intereses se obtienen en total?', clave: 'I', valor: 'intereses totales' },
    formula: 'simple-fraccionado',
    opciones: ['simple-fraccionado', 'compuesta-equivalentes', 'simple-montante', 'compuesta-intereses'],
    porQue: 'Los intereses se liquidan por semestres: i₂ = 0,06 / 2 y n · m = 4 semestres. En simple da lo mismo que con años.',
    porQueNo: { 'compuesta-equivalentes': 'Los tantos equivalentes son de compuesta. En simple el tipo se reparte en proporción: iₘ = i / m.' },
    nivel: 4,
    respuesta: { valor: 2400, tipo: 'euros', texto: 'I = 2.400 €' },
    sustitucion: '$I = 20.000 · 0,03 · 2 · 2$',
    pasos: ['$i_2 = \\frac{0,06}{2} = 0,03$ semestral', '$I = C_0 · i_m · n · m = 20.000 · 0,03 · 4 = "2.400 €"$', 'Comprobación: 20.000 · 2 · 0,06 = 2.400 €.'],
  },
  {
    id: 's-act18',
    bloque: 'simple',
    fuente: 'Ejercicio de práctica',
    enunciado: 'Determina cuántos años, meses y días debe mantenerse una inversión de 12.000 € al 6 % de interés simple anual para obtener 14.850 €.',
    datos: [
      { texto: '12.000 €', clave: 'C_0', valor: '12.000 €' },
      { texto: '6 % de interés simple anual', clave: 'i', valor: '0,06 anual' },
      { texto: '14.850 €', clave: 'C_n', valor: '14.850 €' },
    ],
    incognita: { texto: 'cuántos años, meses y días', clave: 'n', valor: 'tiempo' },
    formula: 'simple-tiempo',
    opciones: ['simple-tiempo', 'simple-tipo', 'compuesta-tiempo', 'simple-capital-inicial'],
    porQue: 'Conoces C₀, Cₙ e i en simple: n = (Cₙ − C₀) / (i · C₀), y luego los decimales a meses y días.',
    nivel: 4,
    respuesta: { valor: 3.96, tipo: 'anos', tolerancia: 0.01, texto: 'n = 3,96 años = 3 años, 11 meses y 16 días' },
    sustitucion: '$n = \\frac{14.850 - 12.000}{0,06 · 12.000}$',
    pasos: ['$n = \\frac{2.850}{720} = "3,96 años"$', '0,96 · 12 = 11,52 meses', '0,52 · 30 = 15,6 → 16 días', '3 años, 11 meses y 16 días.'],
  },
  /* ---------------------------------------------------------------------- compuesta */
  {
    id: 'c-4500',
    bloque: 'compuesta',
    fuente: 'Caso resuelto',
    enunciado: 'Calcula el capital final de invertir 4.500 € al 3 % de interés compuesto anual durante 7 años.',
    datos: [
      { texto: '4.500 €', clave: 'C_0', valor: '4.500 €' },
      { texto: '3 % de interés compuesto anual', clave: 'i', valor: '0,03 anual' },
      { texto: '7 años', clave: 'n', valor: '7 años' },
    ],
    incognita: { texto: 'el capital final', clave: 'C_n', valor: 'capital final' },
    formula: 'compuesta-montante',
    opciones: ['simple-montante', 'compuesta-capital-inicial', 'compuesta-montante', 'compuesta-intereses'],
    porQue: 'Te dan C₀, i y n en compuesta y piden el final: la fórmula general, sin despejar.',
    nivel: 1,
    respuesta: { valor: 5534.43, tipo: 'euros', texto: 'Cₙ = 5.534,43 €' },
    sustitucion: '$C_n = 4.500 · 1,03^7$',
    pasos: ['$C_n = C_0 · (1 + i)^n$', '$1,03^7 = 1,229874$', '$C_n = 4.500 · 1,229874 = "5.534,43 €"$'],
  },
  {
    id: 'c-9000',
    bloque: 'compuesta',
    fuente: 'Caso resuelto',
    enunciado: 'Calcula el capital que se invirtió en una operación que duró 8 años y dio como resultado 9.000 € al 7 % de interés compuesto anual.',
    datos: [
      { texto: '8 años', clave: 'n', valor: '8 años' },
      { texto: '9.000 €', clave: 'C_n', valor: '9.000 € (el resultado final)' },
      { texto: '7 % de interés compuesto anual', clave: 'i', valor: '0,07 anual' },
    ],
    incognita: { texto: 'el capital que se invirtió', clave: 'C_0', valor: 'capital inicial' },
    formula: 'compuesta-capital-inicial',
    opciones: ['compuesta-montante', 'compuesta-capital-inicial', 'simple-capital-inicial', 'compuesta-tiempo'],
    porQue: 'Los 9.000 € son el resultado (Cₙ); piden lo invertido: C₀ = Cₙ · (1 + i)⁻ⁿ.',
    nivel: 2,
    respuesta: { valor: 5238.08, tipo: 'euros', texto: 'C₀ = 5.238,08 €' },
    sustitucion: '$C_0 = 9.000 · 1,07^{-8}$',
    pasos: ['$1,07^8 = 1,718186$', '$C_0 = \\frac{9.000}{1,718186} = "5.238,08 €"$'],
  },
  {
    id: 'c-30000',
    bloque: 'compuesta',
    fuente: 'Caso resuelto',
    enunciado: 'Calcula el tiempo que ha estado invertido un capital de 30.000 € al 10 % de interés compuesto anual si ha dado como resultado 35.000 €.',
    datos: [
      { texto: '30.000 €', clave: 'C_0', valor: '30.000 €' },
      { texto: '10 % de interés compuesto anual', clave: 'i', valor: '0,10 anual' },
      { texto: '35.000 €', clave: 'C_n', valor: '35.000 €' },
    ],
    incognita: { texto: 'el tiempo', clave: 'n', valor: 'tiempo' },
    formula: 'compuesta-tiempo',
    opciones: ['compuesta-tipo', 'compuesta-tiempo', 'simple-tiempo', 'compuesta-montante'],
    porQue: 'La incógnita está en el exponente: se despeja con logaritmos.',
    nivel: 3,
    respuesta: { valor: 1.62, tipo: 'anos', tolerancia: 0.01, texto: 'n = 1,62 años = 1 año, 7 meses y 13 días' },
    sustitucion: '$n = \\frac{log(35.000 / 30.000)}{log 1,1}$',
    pasos: ['$n = \\frac{log 1,1667}{log 1,1} = \\frac{0,066947}{0,041393} = "1,62 años"$', '0,62 · 12 = 7,44 meses; 0,44 · 30 = 13 días', '1 año, 7 meses y 13 días.'],
  },
  {
    id: 'c-50000',
    bloque: 'compuesta',
    fuente: 'Caso resuelto',
    enunciado: 'Calcula el tipo de interés compuesto anual al que ha estado invertido un capital de 50.000 € durante 6 años si ha dado como resultado 52.000 €.',
    datos: [
      { texto: '50.000 €', clave: 'C_0', valor: '50.000 €' },
      { texto: '6 años', clave: 'n', valor: '6 años' },
      { texto: '52.000 €', clave: 'C_n', valor: '52.000 €' },
    ],
    incognita: { texto: 'el tipo de interés compuesto anual', clave: 'i', valor: 'tipo anual' },
    formula: 'compuesta-tipo',
    opciones: ['compuesta-tiempo', 'simple-tipo', 'compuesta-tipo', 'compuesta-equivalentes'],
    porQue: 'Conoces C₀, Cₙ y n en compuesta: el tipo sale con la raíz de índice n.',
    nivel: 3,
    respuesta: { valor: 0.006558, tipo: 'tanto', tolerancia: 0.00005, texto: 'i = 0,006558 (≈ 0,66 % anual)' },
    sustitucion: '$i = (\\frac{52.000}{50.000})^{1/6} - 1$',
    pasos: ['$\\frac{52.000}{50.000} = 1,04$', '$i = 1,04^{1/6} - 1 = 0,006558$', '≈ 0,66 % anual.'],
  },
  {
    id: 'c-mensual',
    bloque: 'compuesta',
    fuente: 'Caso resuelto',
    enunciado: 'Si el tipo de interés compuesto anual es el 10 %, ¿cuál es el tipo equivalente para periodos mensuales?',
    datos: [
      { texto: '10 %', clave: 'i', valor: '0,10 anual' },
      { texto: 'periodos mensuales', clave: 'm', valor: '12 meses por año' },
    ],
    incognita: { texto: '¿cuál es el tipo equivalente', clave: 'i_m', valor: 'tipo mensual' },
    formula: 'compuesta-equivalentes',
    opciones: ['simple-fraccionado', 'compuesta-equivalentes', 'compuesta-tipo', 'compuesta-tae'],
    porQue: 'En compuesta un tipo equivalente no se divide: $i_m = (1 + i)^{1/m} - 1$.',
    porQueNo: { 'simple-fraccionado': 'Dividir 10 % / 12 solo vale en simple; en compuesta se pasaría de largo (1,1047 en vez de 1,10).' },
    nivel: 3,
    respuesta: { valor: 0.007974, tipo: 'tanto', tolerancia: 0.00001, texto: 'i₁₂ = 0,007974 → 0,7974 % mensual' },
    sustitucion: '$i_{12} = (1 + 0,10)^{1/12} - 1$',
    pasos: ['$i_{12} = 1,10^{1/12} - 1 = 0,007974$', '0,7974 % mensual.'],
  },
  {
    id: 'c-tae',
    bloque: 'compuesta',
    fuente: 'Ejercicio de práctica',
    enunciado: 'Un depósito ofrece un 4 % TIN con capitalización trimestral y sin comisiones. ¿Cuál es su TAE?',
    datos: [
      { texto: '4 % TIN', clave: 'J_m', valor: '0,04' },
      { texto: 'capitalización trimestral', clave: 'm', valor: '4 trimestres por año' },
    ],
    incognita: { texto: '¿Cuál es su TAE?', clave: 'TAE', valor: 'tasa anual equivalente' },
    formula: 'compuesta-tae',
    opciones: ['compuesta-tae', 'simple-fraccionado', 'compuesta-tipo', 'compuesta-montante'],
    porQue: 'Del TIN al tipo trimestral (0,04 / 4) y de ahí al anual equivalente: TAE = (1 + Jₘ / m)ᵐ − 1.',
    nivel: 3,
    respuesta: { valor: 0.040604, tipo: 'tanto', tolerancia: 0.00005, texto: 'TAE = 0,040604 → 4,06 %' },
    sustitucion: '$TAE = (1 + \\frac{0,04}{4})^4 - 1$',
    pasos: ['$i_4 = \\frac{0,04}{4} = 0,01$', '$TAE = 1,01^4 - 1 = 0,040604$', '4,06 %.'],
  },
  /* ----------------------------------------------------------------------- descuento */
  {
    id: 'd-pagare',
    bloque: 'descuento',
    fuente: 'Ejercicio de práctica',
    enunciado: 'Descuentas hoy un pagaré de 6.000 € que vence dentro de 45 días. El banco aplica un descuento comercial del 5 % anual (año comercial). ¿Qué descuento te cobra?',
    datos: [
      { texto: '6.000 €', clave: 'N', valor: '6.000 € (nominal)' },
      { texto: '45 días', clave: 'n', valor: '45 / 360 años' },
      { texto: 'descuento comercial del 5 % anual', clave: 'd', valor: '0,05 anual' },
      { texto: 'año comercial', clave: 'm', valor: '360' },
    ],
    incognita: { texto: '¿Qué descuento te cobra?', clave: 'D_c', valor: 'descuento comercial' },
    formula: 'descuento-comercial',
    opciones: ['descuento-racional', 'descuento-comercial', 'simple-intereses', 'descuento-compuesto-comercial'],
    porQue: 'Descuento comercial simple: se calcula sobre el nominal, Dc = N · n · d.',
    porQueNo: { 'simple-intereses': 'Tiene la misma forma, pero calcula intereses de un capital que se invierte; aquí se descuenta un nominal.' },
    nivel: 1,
    respuesta: { valor: 37.5, tipo: 'euros', texto: 'Dc = 37,50 €' },
    sustitucion: '$D_c = 6.000 · \\frac{45}{360} · 0,05$',
    pasos: ['$D_c = N · n · d$', '$D_c = 6.000 · \\frac{45}{360} · 0,05 = "37,50 €"$', 'Efectivo: 6.000 − 37,50 = 5.962,50 €.'],
  },
  {
    id: 'd-racional',
    bloque: 'descuento',
    fuente: 'Ejercicio de práctica',
    enunciado: 'Un capital de 6.000 € vence dentro de 45 días. Calcula su descuento racional simple al 5 % anual (año comercial).',
    datos: [
      { texto: '6.000 €', clave: 'C_n', valor: '6.000 € (al vencimiento)' },
      { texto: '45 días', clave: 'n', valor: '45 / 360 años' },
      { texto: '5 % anual', clave: 'i', valor: '0,05 anual' },
      { texto: 'año comercial', clave: 'm', valor: '360' },
    ],
    incognita: { texto: 'su descuento racional simple', clave: 'D_r', valor: 'descuento racional' },
    formula: 'descuento-racional',
    opciones: ['descuento-comercial', 'descuento-racional', 'descuento-compuesto-racional', 'simple-capital-inicial'],
    porQue: 'Racional simple: el descuento se calcula sobre el efectivo, Dr = Cₙ · n · i / (1 + n · i).',
    porQueNo: { 'simple-capital-inicial': 'Da el efectivo C₀, no el descuento. Te faltaría restar: Dr = Cₙ − C₀.' },
    nivel: 2,
    respuesta: { valor: 37.27, tipo: 'euros', texto: 'Dr = 37,27 €' },
    sustitucion: '$D_r = \\frac{6.000 · 0,125 · 0,05}{1 + 0,125 · 0,05}$',
    pasos: ['n = 45 / 360 = 0,125', '$D_r = \\frac{37,5}{1,00625} = "37,27 €"$', 'Menor que el comercial (37,50 €): la base es el efectivo.'],
  },
  {
    id: 'd-remesa',
    bloque: 'descuento',
    fuente: 'Ejercicio de práctica',
    enunciado: 'Liquida el descuento de un pagaré de 6.000 € a 45 días al 5 % de descuento comercial anual (año comercial), con una comisión del 1 % (mínimo 10 €) y 3 € de gastos de correo. ¿Qué valor líquido recibes?',
    datos: [
      { texto: '6.000 €', clave: 'N', valor: '6.000 €' },
      { texto: '45 días', clave: 'n', valor: '45 / 360 años' },
      { texto: '5 % de descuento comercial anual', clave: 'd', valor: '0,05 anual' },
    ],
    incognita: null,
    formula: 'descuento-remesa',
    opciones: ['descuento-comercial', 'descuento-remesa', 'descuento-racional', 'simple-capital-inicial'],
    porQue: 'Piden lo que se cobra después de restar el descuento, la comisión y los gastos: el valor líquido.',
    porQueNo: { 'descuento-comercial': 'Solo da el descuento (37,50 €). Faltan la comisión y los gastos.' },
    nivel: 4,
    respuesta: { valor: 5899.5, tipo: 'euros', texto: 'Líquido = 5.899,50 €' },
    sustitucion: '$"Líquido" = 6.000 - 37,50 - 60 - 3$',
    pasos: ['Descuento: 6.000 · 45/360 · 0,05 = 37,50 €', 'Comisión: 1 % de 6.000 = 60 € (más que el mínimo de 10 €)', 'Gastos: 3 €', '$"Líquido" = 6.000 - 37,50 - 60 - 3 = "5.899,50 €"$'],
  },
  {
    id: 'd-cp28',
    bloque: 'descuento',
    fuente: 'Caso resuelto',
    enunciado: 'Calcula el descuento compuesto racional de un capital de 12.500 € que vence dentro de 565 días al 4 % anual (año civil).',
    datos: [
      { texto: '12.500 €', clave: 'C_n', valor: '12.500 €' },
      { texto: '565 días', clave: 'n', valor: '565 / 365 = 1,548 años' },
      { texto: '4 % anual', clave: 'i', valor: '0,04 anual' },
      { texto: 'año civil', clave: 'm', valor: '365' },
    ],
    incognita: { texto: 'el descuento compuesto racional', clave: 'D_r', valor: 'descuento racional' },
    formula: 'descuento-compuesto-racional',
    opciones: ['descuento-racional', 'descuento-compuesto-comercial', 'descuento-compuesto-racional', 'compuesta-capital-inicial'],
    porQue: 'Compuesto y racional: se actualiza con (1 + i)⁻ⁿ y el descuento es lo que falta hasta Cₙ.',
    nivel: 3,
    respuesta: { valor: 736.32, tipo: 'euros', texto: 'Dr = 736,32 €' },
    sustitucion: '$D_r = 12.500 · [1 - 1,04^{-565/365}]$',
    pasos: ['n = 565 / 365 = 1,548 años', '$C_0 = 12.500 · 1,04^{-565/365} = "11.763,68 €"$', '$D_r = 12.500 - 11.763,68 = "736,32 €"$'],
  },
  {
    id: 'd-cp29',
    bloque: 'descuento',
    fuente: 'Caso resuelto',
    enunciado: 'Un efecto de 2.000 € vence dentro de 6 años. Calcula el descuento compuesto comercial al 5 %.',
    datos: [
      { texto: '2.000 €', clave: 'N', valor: '2.000 €' },
      { texto: '6 años', clave: 'n', valor: '6 años' },
      { texto: 'descuento compuesto comercial del 5 %', clave: 'd', valor: '0,05' },
    ],
    incognita: { texto: 'el descuento compuesto comercial', clave: 'D_c', valor: 'descuento comercial' },
    formula: 'descuento-compuesto-comercial',
    opciones: ['descuento-compuesto-racional', 'descuento-comercial', 'descuento-compuesto-comercial', 'compuesta-capital-inicial'],
    porQue: 'Compuesto y comercial: cada año se quita d de lo que queda; el efectivo es N · (1 − d)ⁿ y el descuento, lo que falta hasta N.',
    porQueNo: { 'descuento-compuesto-racional': 'Usa (1 + i)⁻ⁿ: es el racional. El enunciado dice comercial: (1 − d)ⁿ.' },
    nivel: 4,
    respuesta: { valor: 529.82, tipo: 'euros', texto: 'Dc = 529,82 €' },
    sustitucion: '$D_c = 2.000 · [1 - (1 - 0,05)^6]$',
    pasos: ['$0,95^6 = 0,735092$', '$E = 2.000 · 0,735092 = 1.470,18 €$', '$D_c = 2.000 - 1.470,18 = "529,82 €"$'],
  },
];

export const ejerciciosDe = (bloque: BloqueId): EjercicioTema2[] => EJERCICIOS_TEMA2.filter((e) => e.bloque === bloque);
