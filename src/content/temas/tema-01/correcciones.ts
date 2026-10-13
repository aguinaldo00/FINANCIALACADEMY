/*
 * Correcciones de exactitud del contenido registradas durante su revisión sobre el contenido heredado del prototipo
 * (legacy/ciudad-del-dinero-tema1.html). La prueba de paridad aplica estas sustituciones al prototipo
 * y exige que el resultado sea exactamente el contenido actual: nada cambia sin quedar registrado aquí.
 */
/** Campos de un concepto que admiten correcciones (enunciado y explicacion son los de su pregunta). */
export type CampoCorregible = 'nombre' | 'definicion' | 'ejemploReal' | 'explicaciones' | 'trampaExamen' | 'enunciado' | 'opciones' | 'indiceCorrecta' | 'explicacion';

export interface CorreccionConcepto {
  conceptoId: string;
  campo: CampoCorregible;
  antes: string;
  despues: string;
  motivo: string;
  fuente: string;
}

export const CORRECCIONES_CONCEPTOS: readonly CorreccionConcepto[] = [
  {
    "conceptoId": "sebc",
    "campo": "definicion",
    "antes": "apoya las políticas económicas de la Comunidad.",
    "despues": "apoya las políticas económicas de la Unión.",
    "motivo": "«Comunidad» es el nombre antiguo; hoy es la Unión Europea.",
    "fuente": "Tratado de Lisboa"
  },
  {
    "conceptoId": "otras-ue",
    "campo": "definicion",
    "antes": "<b>Autoridad Europea de Supervisión:</b> protege la estabilidad del sistema financiero europeo.",
    "despues": "<b>Autoridades Europeas de Supervisión (AES):</b> son tres —la ABE (bancos), la AEVM (valores y mercados) y la AESPJ (seguros y pensiones)— y protegen la estabilidad del sistema financiero europeo.",
    "motivo": "Son tres autoridades, no una.",
    "fuente": "BCE · Sistema Europeo de Supervisión Financiera"
  },
  {
    "conceptoId": "bde",
    "campo": "definicion",
    "antes": "Banco central nacional, miembro del SEBC y del Eurosistema y <b>autoridad nacional de supervisión</b> (dentro del MUS desde 2014). Es un <b>intermediario atípico</b>: financia a las Administraciones públicas, no a familias. Lo regula la <b>Ley de Autonomía del Banco de España</b>.",
    "despues": "Banco central nacional, miembro del SEBC y del Eurosistema. Es <b>autoridad nacional de supervisión</b> y trabaja con las entidades de crédito y con el Estado, no con familias ni empresas. Gestiona la tesorería y la deuda pública. Distingue sus funciones nacionales —supervisión y moneda metálica— de las funciones europeas —política monetaria y billetes—.",
    "motivo": "El Banco de España no puede financiar a las Administraciones públicas.",
    "fuente": "Ley 13/1994, art. 13"
  },
  {
    "conceptoId": "estructura-b",
    "campo": "definicion",
    "antes": "Arriba, el Banco de España. Debajo, las <b>entidades de crédito</b>: entidades de depósito (bancos, cajas, cooperativas), ICO, entidades de dinero electrónico y EFC. Y <b>otras entidades</b>: sociedades de tasación, SGR, entidades de cambio de divisa y entidades de pago.",
    "despues": "El Banco de España supervisa entidades de crédito y otras entidades financieras. <b>Entidades de depósito:</b> bancos, cajas de ahorro y cooperativas. El ICO es entidad de crédito, pero no de depósito. Entre las otras entidades supervisadas están EFC, EDE, SGR, sociedades de tasación y entidades de pago.",
    "motivo": "Los EFC y las EDE ya no son entidades de crédito.",
    "fuente": "Ley 5/2015 (preámbulo) · Ley 21/2011 · Banco de España"
  },
  {
    "conceptoId": "estructura-b",
    "campo": "explicaciones",
    "antes": "BdE → Entidades de crédito {depósito: bancos · cajas · cooperativas · ICO · EDE · EFC} + Otras {tasación · SGR · divisa · pago}",
    "despues": "BdE → Entidades de crédito {de depósito: bancos · cajas · cooperativas} + ICO   ·   Otras {EFC · EDE · tasación · SGR · divisa · pago}",
    "motivo": "Igual que la definición.",
    "fuente": "Ley 5/2015 · Ley 21/2011"
  },
  {
    "conceptoId": "estructura-b",
    "campo": "explicaciones",
    "antes": "Entidad de crédito ≠ entidad de depósito: el ICO y los EFC son de crédito pero no de depósito.",
    "despues": "Entidad de crédito ≠ entidad de depósito: el ICO es de crédito, pero no capta depósitos. Los EFC y las EDE tampoco son entidades de depósito.",
    "motivo": "Los EFC ya no son entidades de crédito.",
    "fuente": "Ley 5/2015"
  },
  {
    "conceptoId": "fgd",
    "campo": "explicaciones",
    "antes": "☂️ 100.000 € por titular y entidad · obligatorio para entidades españolas · voluntario para sucursales de la UE",
    "despues": "☂️ Hasta 100.000 € por titular y entidad · FGD (depósitos) ≠ FOGAIN (inversiones)",
    "motivo": "Se retira el detalle sobre sucursales UE para centrar la ficha en el límite de cobertura y la diferencia con FOGAIN.",
    "fuente": "Petición del usuario (13/10)"
  },
  {
    "conceptoId": "efc",
    "campo": "definicion",
    "antes": "Entidades de crédito especializadas que <b>no pueden captar depósitos del público</b>. <b>Ley 5/2015</b> de Fomento de la Financiación Empresarial: condiciones parecidas a los bancos con menos capital. Operaciones: <b>leasing, factoring, confirming</b>, consumo, hipotecas, avales y tarjetas.",
    "despues": "Entidades financieras especializadas en conceder financiación que <b>no pueden captar depósitos del público</b>. Las supervisa el Banco de España. Entre sus operaciones están el <b>leasing, factoring y confirming</b>, además del crédito al consumo, hipotecas, avales y tarjetas.",
    "motivo": "Los EFC ya no son entidades de crédito.",
    "fuente": "Ley 5/2015 (preámbulo) · Banco de España"
  },
  {
    "conceptoId": "sgr",
    "campo": "definicion",
    "antes": "Sociedades mercantiles de capital variable que <b>conceden avales a sus socios, las pymes</b>, para que obtengan financiación bancaria en mejores condiciones.",
    "despues": "Sociedades mercantiles de capital variable que <b>conceden avales a sus socios partícipes, las pymes</b>, para que obtengan financiación bancaria en mejores condiciones. También puede haber <b>socios protectores</b> (por ejemplo, bancos o administraciones), que aportan capital pero no reciben avales.",
    "motivo": "Además de las pymes (socios partícipes) hay socios protectores.",
    "fuente": "Ley 1/1994, arts. 1 y 6"
  },
  {
    "conceptoId": "sgr",
    "campo": "trampaExamen",
    "antes": "Sus socios son las pymes, no los bancos.",
    "despues": "Los avales son para las pymes socias (socios partícipes). Un banco puede ser socio protector, pero no recibe avales.",
    "motivo": "Igual que la definición.",
    "fuente": "Ley 1/1994, art. 6"
  },
  {
    "conceptoId": "funciones",
    "campo": "trampaExamen",
    "antes": "Test, pregunta 9: \"lograr la estabilidad mediante políticas expansivas de los mercados organizados\" suena bien, pero es falso.",
    "despues": "La función esencial es una sola: canalizar recursos de las unidades con superávit hacia las de déficit. Fomentar el ahorro y sustentar los pagos son funciones complementarias, no la función esencial.",
    "motivo": "Citaba el libro (test, actividad, tabla o página) en vez de explicarlo.",
    "fuente": "Petición del usuario (12/10)"
  },
  {
    "conceptoId": "pagos",
    "campo": "trampaExamen",
    "antes": "Actividad 7: debe estar saneado porque,",
    "despues": "¿Por qué debe estar saneado? Porque,",
    "motivo": "Citaba el libro (test, actividad, tabla o página) en vez de explicarlo.",
    "fuente": "Petición del usuario (12/10)"
  },
  {
    "conceptoId": "rrl",
    "campo": "trampaExamen",
    "antes": "Actividad 12c: te piden identificar las tres en el producto que recomiendas.",
    "despues": "Si te piden recomendar un producto financiero, identifica en él las tres: riesgo, liquidez y rentabilidad.",
    "motivo": "Citaba el libro (test, actividad, tabla o página) en vez de explicarlo.",
    "fuente": "Petición del usuario (12/10)"
  },
  {
    "conceptoId": "mercado",
    "campo": "trampaExamen",
    "antes": "Test, pregunta 9: es función",
    "despues": "Es función",
    "motivo": "Citaba el libro (test, actividad, tabla o página) en vez de explicarlo.",
    "fuente": "Petición del usuario (12/10)"
  },
  {
    "conceptoId": "mercado",
    "campo": "enunciado",
    "antes": "Según el test del libro, es función de un mercado financiero:",
    "despues": "Es función de un mercado financiero:",
    "motivo": "Citaba el libro (test, actividad, tabla o página) en vez de explicarlo.",
    "fuente": "Petición del usuario (12/10)"
  },
  {
    "conceptoId": "mercado",
    "campo": "explicacion",
    "antes": "Pregunta 9 del test de repaso.",
    "despues": "El mercado es el punto de encuentro donde quienes ofrecen y quienes demandan activos financieros se ponen en contacto para intercambiarlos y fijar su precio. Emitir billetes no es cosa del mercado, y lo de «políticas expansivas» es la opción trampa.",
    "motivo": "Citaba el libro (test, actividad, tabla o página) en vez de explicarlo.",
    "fuente": "Petición del usuario (12/10)"
  },
  {
    "conceptoId": "fase",
    "campo": "trampaExamen",
    "antes": "Comprueba 14: en una emisión",
    "despues": "En una emisión",
    "motivo": "Citaba el libro (test, actividad, tabla o página) en vez de explicarlo.",
    "fuente": "Petición del usuario (12/10)"
  },
  {
    "conceptoId": "estructura-m",
    "campo": "trampaExamen",
    "antes": "Test, pregunta 8: \"uno",
    "despues": "Ojo: \"uno",
    "motivo": "Citaba el libro (test, actividad, tabla o página) en vez de explicarlo.",
    "fuente": "Petición del usuario (12/10)"
  },
  {
    "conceptoId": "estructura-m",
    "campo": "explicacion",
    "antes": "Pregunta 8 del test.",
    "despues": "Si un intermediario pone en contacto a las partes a cambio de una comisión, el mercado es intermediado. En el directo no hay intermediarios: comprador y vendedor buscan la contrapartida por su cuenta.",
    "motivo": "Citaba el libro (test, actividad, tabla o página) en vez de explicarlo.",
    "fuente": "Petición del usuario (12/10)"
  },
  {
    "conceptoId": "regulados-plazo",
    "campo": "trampaExamen",
    "antes": "Actividad 11: en las opciones",
    "despues": "En las opciones",
    "motivo": "Citaba el libro (test, actividad, tabla o página) en vez de explicarlo.",
    "fuente": "Petición del usuario (12/10)"
  },
  {
    "conceptoId": "caracteristicas-m",
    "campo": "ejemploReal",
    "antes": " (actividad 13).",
    "despues": ".",
    "motivo": "Citaba el libro (test, actividad, tabla o página) en vez de explicarlo.",
    "fuente": "Petición del usuario (12/10)"
  },
  {
    "conceptoId": "perfecto",
    "campo": "trampaExamen",
    "antes": "Caso práctico 2 y actividad 15: describirlo usando las 5 características.",
    "despues": "Para describirlo, usa las 5 características de los mercados: libertad, profundidad, transparencia, flexibilidad y amplitud.",
    "motivo": "Citaba el libro (test, actividad, tabla o página) en vez de explicarlo.",
    "fuente": "Petición del usuario (12/10)"
  },
  {
    "conceptoId": "intermediario",
    "campo": "trampaExamen",
    "antes": "Actividad 23: oferentes",
    "despues": "Oferentes",
    "motivo": "Citaba el libro (test, actividad, tabla o página) en vez de explicarlo.",
    "fuente": "Petición del usuario (12/10)"
  },
  {
    "conceptoId": "margen",
    "campo": "explicacion",
    "antes": "Lo dice el libro, pág. 15.",
    "despues": "El margen es la diferencia entre el tipo que el intermediario cobra a quien pide dinero y el que paga a quien ahorra. Si es muy alto, intermediar sale caro: es señal de un sistema poco eficiente.",
    "motivo": "Citaba el libro (test, actividad, tabla o página) en vez de explicarlo.",
    "fuente": "Petición del usuario (12/10)"
  },
  {
    "conceptoId": "tipos-int",
    "campo": "explicaciones",
    "antes": " (caso práctico 3).",
    "despues": ".",
    "motivo": "Citaba el libro (test, actividad, tabla o página) en vez de explicarlo.",
    "fuente": "Petición del usuario (12/10)"
  },
  {
    "conceptoId": "tipos-int",
    "campo": "trampaExamen",
    "antes": "Test, pregunta 3: ¿quiénes",
    "despues": "¿Quiénes",
    "motivo": "Citaba el libro (test, actividad, tabla o página) en vez de explicarlo.",
    "fuente": "Petición del usuario (12/10)"
  },
  {
    "conceptoId": "tipos-int",
    "campo": "explicacion",
    "antes": "Pregunta 3 del test.",
    "despues": "Los intermediarios bancarios (por ejemplo, los bancos) emiten instrumentos que se aceptan como medio de pago: por eso crean dinero. Los no bancarios, como las aseguradoras, no.",
    "motivo": "Citaba el libro (test, actividad, tabla o página) en vez de explicarlo.",
    "fuente": "Petición del usuario (12/10)"
  },
  {
    "conceptoId": "transformacion",
    "campo": "explicaciones",
    "antes": " (pág. 22).",
    "despues": ".",
    "motivo": "Citaba el libro (test, actividad, tabla o página) en vez de explicarlo.",
    "fuente": "Petición del usuario (12/10)"
  },
  {
    "conceptoId": "carac-int",
    "campo": "ejemploReal",
    "antes": " (actividad 19).",
    "despues": ".",
    "motivo": "Citaba el libro (test, actividad, tabla o página) en vez de explicarlo.",
    "fuente": "Petición del usuario (12/10)"
  },
  {
    "conceptoId": "carac-int",
    "campo": "explicaciones",
    "antes": " (pág. 17).",
    "despues": ".",
    "motivo": "Citaba el libro (test, actividad, tabla o página) en vez de explicarlo.",
    "fuente": "Petición del usuario (12/10)"
  },
  {
    "conceptoId": "bce",
    "campo": "trampaExamen",
    "antes": "Comprueba 2: ¿quién",
    "despues": "¿Quién",
    "motivo": "Citaba el libro (test, actividad, tabla o página) en vez de explicarlo.",
    "fuente": "Petición del usuario (12/10)"
  },
  {
    "conceptoId": "sebc",
    "campo": "trampaExamen",
    "antes": "Test, pregunta 7: SEBC",
    "despues": "SEBC",
    "motivo": "Citaba el libro (test, actividad, tabla o página) en vez de explicarlo.",
    "fuente": "Petición del usuario (12/10)"
  },
  {
    "conceptoId": "sebc",
    "campo": "explicacion",
    "antes": "Pregunta 7 del test.",
    "despues": "SEBC = Sistema Europeo de Bancos Centrales: el BCE más los bancos centrales de todos los países de la UE, tengan o no el euro.",
    "motivo": "Citaba el libro (test, actividad, tabla o página) en vez de explicarlo.",
    "fuente": "Petición del usuario (12/10)"
  },
  {
    "conceptoId": "mus",
    "campo": "trampaExamen",
    "antes": "Actividad 22: la finalidad del supervisor único. Fecha clave: 4-11-2014.",
    "despues": "El MUS supervisa; el MUR organiza la resolución de entidades no viables. No confundas supervisión, garantía de depósitos y resolución.",
    "motivo": "Citaba el libro (test, actividad, tabla o página) en vez de explicarlo.",
    "fuente": "Petición del usuario (12/10)"
  },
  {
    "conceptoId": "bde",
    "campo": "explicaciones",
    "antes": "Una cámara acorazada con dos llaves: la europea (billetes, política monetaria del euro, divisas, reservas, pagos) y la nacional (supervisar solvencia, moneda metálica, tesorería y deuda pública, estadísticas, asesorar al Gobierno).",
    "despues": "Dos escalas de trabajo: la europea, como miembro del SEBC, y la nacional, con tareas como supervisar entidades y gestionar tesorería y deuda pública.",
    "motivo": "Citaba el libro (test, actividad, tabla o página) en vez de explicarlo.",
    "fuente": "Petición del usuario (12/10)"
  },
  {
    "conceptoId": "bde",
    "campo": "explicaciones",
    "antes": "Test 11: máxima autoridad en política monetaria en España, con autonomía respecto al Gobierno e integrada en el SEBC: el Banco de España.",
    "despues": "Banco de España: banco central nacional integrado en el SEBC, con funciones propias de supervisión, moneda metálica, tesorería y deuda pública.",
    "motivo": "Citaba el libro (test, actividad, tabla o página) en vez de explicarlo.",
    "fuente": "Petición del usuario (12/10)"
  },
  {
    "conceptoId": "estructura-b",
    "campo": "ejemploReal",
    "antes": "Es el esquema de la figura 1.19, que se completa en la actividad 33.",
    "despues": "Piénsalo como un árbol: arriba, el Banco de España; debajo, las entidades de crédito y las otras entidades que supervisa.",
    "motivo": "Citaba el libro (test, actividad, tabla o página) en vez de explicarlo.",
    "fuente": "Petición del usuario (12/10)"
  },
  {
    "conceptoId": "estructura-b",
    "campo": "explicaciones",
    "antes": "Comprueba 3: entidades de depósito",
    "despues": "Entidades de depósito",
    "motivo": "Citaba el libro (test, actividad, tabla o página) en vez de explicarlo.",
    "fuente": "Petición del usuario (12/10)"
  },
  {
    "conceptoId": "estructura-b",
    "campo": "trampaExamen",
    "antes": " (test, pregunta 5),",
    "despues": ",",
    "motivo": "Citaba el libro (test, actividad, tabla o página) en vez de explicarlo.",
    "fuente": "Petición del usuario (12/10)"
  },
  {
    "conceptoId": "estructura-b",
    "campo": "enunciado",
    "antes": "Según el test del libro, es entidad de crédito…",
    "despues": "¿Cuál de estas es una entidad de crédito?",
    "motivo": "Citaba el libro (test, actividad, tabla o página) en vez de explicarlo.",
    "fuente": "Petición del usuario (12/10)"
  },
  {
    "conceptoId": "estructura-b",
    "campo": "explicacion",
    "antes": "Pregunta 5 del test.",
    "despues": "El ICO es entidad de crédito, aunque no de depósito. Las aseguradoras y las agencias de valores son intermediarios no bancarios: las supervisan la DGSFP y la CNMV.",
    "motivo": "Citaba el libro (test, actividad, tabla o página) en vez de explicarlo.",
    "fuente": "Petición del usuario (12/10)"
  },
  {
    "conceptoId": "bancos",
    "campo": "trampaExamen",
    "antes": " (actividad 30 y actividad final de la síntesis).",
    "despues": ".",
    "motivo": "Citaba el libro (test, actividad, tabla o página) en vez de explicarlo.",
    "fuente": "Petición del usuario (12/10)"
  },
  {
    "conceptoId": "coop",
    "campo": "explicaciones",
    "antes": "Test 4: las sociedades",
    "despues": "Las sociedades",
    "motivo": "Citaba el libro (test, actividad, tabla o página) en vez de explicarlo.",
    "fuente": "Petición del usuario (12/10)"
  },
  {
    "conceptoId": "ico",
    "campo": "ejemploReal",
    "antes": "Grupo ICO: ICO, Axis (capital riesgo) y Fundación ICO. Línea del libro para comercio minorista: hasta 150.000 €, sin comisiones salvo por amortización anticipada y con un año de carencia.",
    "despues": "Una empresa puede recibir financiación del ICO a través de un banco privado o mediante financiación directa; en cada vía cambia quién estudia la operación y asume el riesgo.",
    "motivo": "Citaba el libro (test, actividad, tabla o página) en vez de explicarlo.",
    "fuente": "Petición del usuario (12/10)"
  },
  {
    "conceptoId": "ede",
    "campo": "explicaciones",
    "antes": "Comprueba 5: definir las EDE y poner dos ejemplos.",
    "despues": "Dinero electrónico: saldo emitido tras recibir fondos, almacenado electrónicamente y aceptado como pago por terceros.",
    "motivo": "Citaba el libro (test, actividad, tabla o página) en vez de explicarlo.",
    "fuente": "Petición del usuario (12/10)"
  },
  {
    "conceptoId": "ede",
    "campo": "explicacion",
    "antes": "Pág. 25 del libro.",
    "despues": "El dinero electrónico es un valor almacenado electrónicamente, exigible al emisor y aceptado como pago por terceros.",
    "motivo": "Citaba el libro (test, actividad, tabla o página) en vez de explicarlo.",
    "fuente": "Petición del usuario (12/10)"
  },
  {
    "conceptoId": "fgd",
    "campo": "explicacion",
    "antes": "Pregunta 10 del test.",
    "despues": "El FGD (Fondo de Garantía de Depósitos) cubre hasta 100.000 € por titular y entidad. Las cifras de 50.000 € y 150.000 € son trampas.",
    "motivo": "Citaba el libro (test, actividad, tabla o página) en vez de explicarlo.",
    "fuente": "Petición del usuario (12/10)"
  },
  {
    "conceptoId": "fondo",
    "campo": "ejemploReal",
    "antes": "Caso práctico 5: 4 amigos",
    "despues": "Ejemplo: 4 amigos",
    "motivo": "Citaba el libro (test, actividad, tabla o página) en vez de explicarlo.",
    "fuente": "Petición del usuario (12/10)"
  },
  {
    "conceptoId": "sociedad-inv",
    "campo": "ejemploReal",
    "antes": " (pág. 27).",
    "despues": ": las sociedades de inversión son sociedades anónimas.",
    "motivo": "Citaba el libro (test, actividad, tabla o página) en vez de explicarlo.",
    "fuente": "Petición del usuario (12/10)"
  },
  {
    "conceptoId": "sociedad-inv",
    "campo": "explicaciones",
    "antes": "Comprueba 21: ¿necesitan",
    "despues": "¿Necesitan",
    "motivo": "Citaba el libro (test, actividad, tabla o página) en vez de explicarlo.",
    "fuente": "Petición del usuario (12/10)"
  },
  {
    "conceptoId": "sociedad-inv",
    "campo": "trampaExamen",
    "antes": " (actividad 20h),",
    "despues": ",",
    "motivo": "Citaba el libro (test, actividad, tabla o página) en vez de explicarlo.",
    "fuente": "Petición del usuario (12/10)"
  },
  {
    "conceptoId": "av",
    "campo": "trampaExamen",
    "antes": "Actividad 42: diferencia entre bróker y dealer, con un ejemplo de cada uno.",
    "despues": "Bróker ≠ dealer: la agencia de valores (bróker) opera solo por cuenta ajena, con las órdenes de sus clientes; la sociedad de valores (dealer) también opera por cuenta propia.",
    "motivo": "Citaba el libro (test, actividad, tabla o página) en vez de explicarlo.",
    "fuente": "Petición del usuario (12/10)"
  },
  {
    "conceptoId": "efc",
    "campo": "trampaExamen",
    "antes": "Test, pregunta 6: son EFC",
    "despues": "Son EFC",
    "motivo": "Citaba el libro (test, actividad, tabla o página) en vez de explicarlo.",
    "fuente": "Petición del usuario (12/10)"
  },
  {
    "conceptoId": "seguros",
    "campo": "explicaciones",
    "antes": "Actividad 45: define tomador, prima e indemnización.",
    "despues": "Tomador: quien contrata el seguro y paga. Prima: lo que paga. Indemnización: lo que cobra el beneficiario si hay siniestro.",
    "motivo": "Citaba el libro (test, actividad, tabla o página) en vez de explicarlo.",
    "fuente": "Petición del usuario (12/10)"
  },
  {
    "conceptoId": "seguros",
    "campo": "trampaExamen",
    "antes": " (caso práctico 3),",
    "despues": ",",
    "motivo": "Citaba el libro (test, actividad, tabla o página) en vez de explicarlo.",
    "fuente": "Petición del usuario (12/10)"
  },
  {
    "conceptoId": "seguros",
    "campo": "explicacion",
    "antes": "Actividad 45.",
    "despues": "El tomador contrata el seguro y paga la prima. El asegurado es quien está expuesto al riesgo, y el beneficiario, quien cobra la indemnización.",
    "motivo": "Citaba el libro (test, actividad, tabla o página) en vez de explicarlo.",
    "fuente": "Petición del usuario (12/10)"
  },
  {
    "conceptoId": "cnmv",
    "campo": "explicaciones",
    "antes": " (tabla 1.6).",
    "despues": ".",
    "motivo": "Citaba el libro (test, actividad, tabla o página) en vez de explicarlo.",
    "fuente": "Petición del usuario (12/10)"
  },
  {
    "conceptoId": "cnmv",
    "campo": "trampaExamen",
    "antes": "Actividad 20: sociedades de inversión → CNMV.",
    "despues": "Sociedades de inversión (SICAV y SII) → CNMV, no el Banco de España.",
    "motivo": "Citaba el libro (test, actividad, tabla o página) en vez de explicarlo.",
    "fuente": "Petición del usuario (12/10)"
  },
  {
    "conceptoId": "cnmv",
    "campo": "explicacion",
    "antes": "Tabla 1.6.",
    "despues": "Las SICAV (sociedades de inversión de capital variable) son instituciones de inversión colectiva, y a esas las supervisa la CNMV (Comisión Nacional del Mercado de Valores).",
    "motivo": "Citaba el libro (test, actividad, tabla o página) en vez de explicarlo.",
    "fuente": "Petición del usuario (12/10)"
  },
  {
    "conceptoId": "dgsfp",
    "campo": "ejemploReal",
    "antes": " (Comprueba 27).",
    "despues": ".",
    "motivo": "Citaba el libro (test, actividad, tabla o página) en vez de explicarlo.",
    "fuente": "Petición del usuario (12/10)"
  },
  {
    "conceptoId": "dgsfp",
    "campo": "explicaciones",
    "antes": " (tabla 1.6).",
    "despues": ".",
    "motivo": "Citaba el libro (test, actividad, tabla o página) en vez de explicarlo.",
    "fuente": "Petición del usuario (12/10)"
  },
  {
    "conceptoId": "dgsfp",
    "campo": "trampaExamen",
    "antes": "Actividad 20a: compañías aseguradoras → DGSFP.",
    "despues": "Compañías aseguradoras → DGSFP, no la CNMV ni el Banco de España.",
    "motivo": "Citaba el libro (test, actividad, tabla o página) en vez de explicarlo.",
    "fuente": "Petición del usuario (12/10)"
  },
  {
    "conceptoId": "dgsfp",
    "campo": "explicacion",
    "antes": "Tabla 1.6.",
    "despues": "La DGSFP (Dirección General de Seguros y Fondos de Pensiones, del Ministerio de Economía) supervisa las compañías aseguradoras y los fondos de pensiones. La CNMV vigila la bolsa y los fondos de inversión, y el Banco de España, los bancos.",
    "motivo": "Citaba el libro (test, actividad, tabla o página) en vez de explicarlo.",
    "fuente": "Petición del usuario (12/10)"
  },
  {
    "conceptoId": "sf",
    "campo": "trampaExamen",
    "antes": "En el test (pregunta 1) la buena es \"instituciones, medios y mercados que canalizan el ahorro a la inversión\". Las trampas lo reducen a \"bancos y cajas\" o a \"instituciones bancarias\".",
    "despues": "El sistema financiero canaliza el ahorro hacia la inversión mediante instituciones, medios y mercados. Desconfía de las respuestas que lo reducen a \"bancos y cajas\" o a \"instituciones bancarias\".",
    "motivo": "La explicación citaba una pregunta externa en vez de ser autónoma.",
    "fuente": "Petición del usuario (13/10)"
  },
  {
    "conceptoId": "directa",
    "campo": "trampaExamen",
    "antes": "No la confundas con el \"mercado directo\" del punto 3.2: si hay un intermediario que cobra comisión, el mercado es intermediado (test, pregunta 8).",
    "despues": "En la intermediación directa, el ahorrador compra el instrumento emitido por la unidad con déficit. Que exista un intermediario que cobra comisión es otro criterio: clasifica el mercado como intermediado.",
    "motivo": "Citaba el libro (test y punto 3.2) en vez de explicarlo.",
    "fuente": "Petición del usuario (12/10 y 13/10)"
  },
  {
    "conceptoId": "rrl",
    "campo": "ejemploReal",
    "antes": "⚠ dato del libro, puede haber cambiado: letras del Tesoro en torno al 2,6 % a 12 meses y depósitos entre el 2 y el 3 %.",
    "despues": "Al comparar dos inversiones, valora qué puedes perder (riesgo), con qué facilidad recuperas el dinero (liquidez) y qué rendimiento esperas (rentabilidad).",
    "motivo": "Se conserva el aviso de vigencia y se elimina la referencia al libro.",
    "fuente": "Petición del usuario (13/10)"
  },
  {
    "conceptoId": "activo",
    "campo": "trampaExamen",
    "antes": "La frontera son 18 meses, no 12. Es la cifra que más cambian en los test.",
    "despues": "La frontera son 18 meses, no 12. Es fácil confundir ambos plazos.",
    "motivo": "La advertencia ahora explica la confusión sin remitir a tests externos.",
    "fuente": "Petición del usuario (13/10)"
  },
  {
    "conceptoId": "estructura-m",
    "campo": "explicaciones",
    "antes": "Se parece a la intermediación directa/indirecta del punto 2, pero aquí se clasifican mercados.",
    "despues": "No confundas esta clasificación de los mercados con la intermediación directa e indirecta: aquí se distingue si hay un intermediario que cobra comisión.",
    "motivo": "La explicación remitía a un punto del libro.",
    "fuente": "Petición del usuario (13/10)"
  },
  {
    "conceptoId": "bce",
    "campo": "ejemploReal",
    "antes": "Sede en Frankfurt. Presidenta desde el 1-11-2019: Christine Lagarde, mandato de 8 años no renovable. El libro dice 20 países: ⚠ dato del libro, puede haber cambiado (desde el 1-1-2026 Bulgaria usa el euro y son 21).",
    "despues": "Cuando los precios suben en la zona euro, la política monetaria común busca preservar la estabilidad de precios.",
    "motivo": "Se sustituye la referencia al libro por un aviso contextual sobre la cifra.",
    "fuente": "Petición del usuario (13/10)"
  },
  {
    "conceptoId": "ede",
    "campo": "ejemploReal",
    "antes": "⚠ dato del libro, puede haber cambiado: Bnext, MoneyToPay, PFS Card y Pecunia Cards. Entidades de pago (RDL 19/2018): Moneytrans y Safetypay.",
    "despues": "Ejemplo: recargas 20 € en un monedero electrónico y utilizas ese saldo para pagar en un comercio distinto de quien lo emitió.",
    "motivo": "Se conserva el aviso de vigencia y se elimina la referencia al libro.",
    "fuente": "Petición del usuario (13/10)"
  },
  {
    "conceptoId": "funciones",
    "campo": "definicion",
    "antes": "<b>Función esencial:</b> canalizar los recursos de las unidades con superávit hacia las de déficit. Además: analizar la viabilidad de los proyectos, fomentar el ahorro, sustentar el sistema de pagos, asignar eficientemente los recursos, contribuir a la estabilidad monetaria y financiera, y velar por las instituciones.",
    "despues": "<span class=\"idea-principal\"><b>Función esencial:</b> canalizar los recursos desde las unidades con superávit hacia las unidades con déficit.</span><br><span class=\"idea-apoyo\"><b>Funciones complementarias:</b> analizar la viabilidad · fomentar el ahorro · sustentar los pagos · asignar recursos eficientemente · contribuir a la estabilidad monetaria y financiera · velar por las instituciones.</span>",
    "motivo": "Contenido depurado para que la ficha y sus botones refuercen el concepto de la plataforma, sin datos anecdóticos, variables ni referencias legales en el estudio.",
    "fuente": "Petición del usuario (13/10)"
  },
  {
    "conceptoId": "funciones",
    "campo": "explicaciones",
    "antes": "Función esencial: canalizar los recursos de las unidades con superávit hacia las unidades con déficit.",
    "despues": "<span class=\"idea-principal\">Función esencial: canalizar los recursos de las unidades con superávit hacia las unidades con déficit.</span> <span class=\"idea-apoyo\">La complementan el ahorro, los pagos seguros, la asignación eficiente, la estabilidad y la vigilancia de las instituciones.</span>",
    "motivo": "Contenido depurado para que la ficha y sus botones refuercen el concepto de la plataforma, sin datos anecdóticos, variables ni referencias legales en el estudio.",
    "fuente": "Petición del usuario (13/10)"
  },
  {
    "conceptoId": "funciones",
    "campo": "explicacion",
    "antes": "Las otras son funciones de organismos concretos.",
    "despues": "La canalización de recursos desde unidades con superávit hacia unidades con déficit es la función esencial. Fomentar el ahorro y sustentar los pagos son funciones complementarias.",
    "motivo": "Contenido depurado para que la ficha y sus botones refuercen el concepto de la plataforma, sin datos anecdóticos, variables ni referencias legales en el estudio.",
    "fuente": "Petición del usuario (13/10)"
  },
  {
    "conceptoId": "indirecta",
    "campo": "trampaExamen",
    "antes": "La frase que buscan en la actividad 4: \"ambos agentes no tienen ningún contacto entre ellos\".",
    "despues": "En la intermediación indirecta, el ahorrador trata con el banco y el banco financia a la unidad con déficit: ambos agentes no tienen contacto entre sí.",
    "motivo": "Contenido depurado para que la ficha y sus botones refuercen el concepto de la plataforma, sin datos anecdóticos, variables ni referencias legales en el estudio.",
    "fuente": "Petición del usuario (12/10 y 13/10)"
  },
  {
    "conceptoId": "bde",
    "campo": "ejemploReal",
    "antes": "Bajo su sede de Madrid hay una cámara acorazada a 36 metros que se inundaría ante un intento de asalto.",
    "despues": "Al repasar esta ficha, separa las funciones europeas del Banco de España como miembro del SEBC de las funciones nacionales que ejerce en España.",
    "motivo": "Contenido depurado para que la ficha y sus botones refuercen el concepto de la plataforma, sin datos anecdóticos, variables ni referencias legales en el estudio.",
    "fuente": "Petición del usuario (13/10)"
  },
  {
    "conceptoId": "cajas",
    "campo": "ejemploReal",
    "antes": "En el año 2000 había más de 40. Hoy solo quedan dos: <b>Caixa Ontinyent</b> y <b>Colonya Caixa Pollença</b>.",
    "despues": "Para distinguir una caja de un banco privado, fíjate en su forma fundacional, la ausencia de reparto entre accionistas y el destino social de sus resultados.",
    "motivo": "Contenido depurado para que la ficha y sus botones refuercen el concepto de la plataforma, sin datos anecdóticos, variables ni referencias legales en el estudio.",
    "fuente": "Petición del usuario (13/10)"
  },
  {
    "conceptoId": "cajas",
    "campo": "explicaciones",
    "antes": "Una capilla con cepillo de limosna: lo que se recoge va a la comunidad. Y casi en ruinas: solo quedan dos.",
    "despues": "Como una entidad bancaria organizada para atender fines sociales: sus beneficios no se reparten entre accionistas.",
    "motivo": "Contenido depurado para que la ficha y sus botones refuercen el concepto de la plataforma, sin datos anecdóticos, variables ni referencias legales en el estudio.",
    "fuente": "Petición del usuario (13/10)"
  },
  {
    "conceptoId": "cajas",
    "campo": "explicaciones",
    "antes": "Muchas siguen llamándose \"Caja\" o \"Caixa\" y son bancos. Cajamar es una cooperativa.",
    "despues": "Caja de ahorro ≠ cooperativa de crédito: la caja tiene forma fundacional; la cooperativa pertenece a sus socios.",
    "motivo": "Contenido depurado para que la ficha y sus botones refuercen el concepto de la plataforma, sin datos anecdóticos, variables ni referencias legales en el estudio.",
    "fuente": "Petición del usuario (13/10)"
  },
  {
    "conceptoId": "cajas",
    "campo": "trampaExamen",
    "antes": "¿Cuántas quedan? Dos.",
    "despues": "La diferencia clave es la forma jurídica y el destino de los resultados. No confundas una caja de ahorro con una cooperativa de crédito.",
    "motivo": "Contenido depurado para que la ficha y sus botones refuercen el concepto de la plataforma, sin datos anecdóticos, variables ni referencias legales en el estudio.",
    "fuente": "Petición del usuario (13/10)"
  },
  {
    "conceptoId": "cajas",
    "campo": "trampaExamen",
    "antes": " ¿La Caja de Ingenieros o Cajamar son cajas de ahorro? No (Comprueba 30).",
    "despues": "",
    "motivo": "Contenido depurado para que la ficha y sus botones refuercen el concepto de la plataforma, sin datos anecdóticos, variables ni referencias legales en el estudio.",
    "fuente": "Petición del usuario (12/10 y 13/10)"
  },
  {
    "conceptoId": "cajas",
    "campo": "enunciado",
    "antes": "¿Cuántas cajas de ahorro quedan en España?",
    "despues": "¿Qué rasgo distingue a las cajas de ahorro?",
    "motivo": "Contenido depurado para que la ficha y sus botones refuercen el concepto de la plataforma, sin datos anecdóticos, variables ni referencias legales en el estudio.",
    "fuente": "Petición del usuario (13/10)"
  },
  {
    "conceptoId": "cajas",
    "campo": "opciones",
    "antes": "Más de 40",
    "despues": "Tienen forma fundacional y fines sociales",
    "motivo": "Contenido depurado para que la ficha y sus botones refuercen el concepto de la plataforma, sin datos anecdóticos, variables ni referencias legales en el estudio.",
    "fuente": "Petición del usuario (13/10)"
  },
  {
    "conceptoId": "cajas",
    "campo": "opciones",
    "antes": "2",
    "despues": "No pueden captar depósitos del público",
    "motivo": "Contenido depurado para que la ficha y sus botones refuercen el concepto de la plataforma, sin datos anecdóticos, variables ni referencias legales en el estudio.",
    "fuente": "Petición del usuario (13/10)"
  },
  {
    "conceptoId": "cajas",
    "campo": "opciones",
    "antes": "10",
    "despues": "No las supervisa el Banco de España",
    "motivo": "Contenido depurado para que la ficha y sus botones refuercen el concepto de la plataforma, sin datos anecdóticos, variables ni referencias legales en el estudio.",
    "fuente": "Petición del usuario (13/10)"
  },
  {
    "conceptoId": "cajas",
    "campo": "indiceCorrecta",
    "antes": "1",
    "despues": "0",
    "motivo": "Contenido depurado para que la ficha y sus botones refuercen el concepto de la plataforma, sin datos anecdóticos, variables ni referencias legales en el estudio.",
    "fuente": "Petición del usuario (13/10)"
  },
  {
    "conceptoId": "cajas",
    "campo": "explicacion",
    "antes": "Caixa Ontinyent y Colonya Caixa Pollença.",
    "despues": "La caja tiene forma fundacional y destina sus resultados a fines sociales; una cooperativa pertenece a sus socios.",
    "motivo": "Contenido depurado para que la ficha y sus botones refuercen el concepto de la plataforma, sin datos anecdóticos, variables ni referencias legales en el estudio.",
    "fuente": "Petición del usuario (13/10)"
  },
  {
    "conceptoId": "ico",
    "campo": "explicaciones",
    "antes": "Banco público: mediación (riesgo: tu banco) · directa desde 10 M (riesgo: el ICO)   |   Agencia del Estado (el ICO no arriesga)",
    "despues": "Banco público: mediación (riesgo de la entidad de crédito) · directa (riesgo del ICO)   |   Agencia financiera del Estado (riesgo del Estado)",
    "motivo": "Contenido depurado para que la ficha y sus botones refuercen el concepto de la plataforma, sin datos anecdóticos, variables ni referencias legales en el estudio.",
    "fuente": "Petición del usuario (13/10)"
  },
  {
    "conceptoId": "ico",
    "campo": "trampaExamen",
    "antes": "Líneas de mediación: el riesgo lo asume la entidad de crédito, no el ICO. Financiación directa: mínimo 10 millones.",
    "despues": "Distingue las vías por quién asume el riesgo: mediación → entidad de crédito; financiación directa → ICO; agencia financiera → Estado.",
    "motivo": "Contenido depurado para que la ficha y sus botones refuercen el concepto de la plataforma, sin datos anecdóticos, variables ni referencias legales en el estudio.",
    "fuente": "Petición del usuario (13/10)"
  },
  {
    "conceptoId": "ede",
    "campo": "nombre",
    "antes": "Entidades de dinero electrónico y de pago",
    "despues": "Entidades de dinero electrónico (EDE)",
    "motivo": "Contenido depurado para que la ficha y sus botones refuercen el concepto de la plataforma, sin datos anecdóticos, variables ni referencias legales en el estudio.",
    "fuente": "Petición del usuario (13/10)"
  },
  {
    "conceptoId": "ede",
    "campo": "definicion",
    "antes": "Emiten <b>dinero electrónico</b>: exigible a su emisor, almacenado en soporte electrónico y aceptado como medio de pago por entidades distintas de la emisora. <b>Ley 21/2011.</b> Las autoriza el <b>Banco de España</b>, previo informe del SEPBLAC.",
    "despues": "Emiten <b>dinero electrónico</b>: un saldo monetario exigible a su emisor, almacenado electrónicamente y aceptado como medio de pago por personas o entidades distintas del emisor.",
    "motivo": "Contenido depurado para que la ficha y sus botones refuercen el concepto de la plataforma, sin datos anecdóticos, variables ni referencias legales en el estudio.",
    "fuente": "Petición del usuario (13/10)"
  },
  {
    "conceptoId": "ede",
    "campo": "explicaciones",
    "antes": "No es un banco tradicional, aunque los bancos también pueden emitir dinero electrónico.",
    "despues": "No es lo mismo que un depósito bancario: es un saldo electrónico que puede emitir una entidad habilitada, incluidos los bancos.",
    "motivo": "Contenido depurado para que la ficha y sus botones refuercen el concepto de la plataforma, sin datos anecdóticos, variables ni referencias legales en el estudio.",
    "fuente": "Petición del usuario (13/10)"
  },
  {
    "conceptoId": "ede",
    "campo": "trampaExamen",
    "antes": "Ley 21/2011 = dinero electrónico. RDL 19/2018 = entidades de pago. No las cruces.",
    "despues": "No confundas el dinero electrónico (el saldo emitido y almacenado) con el servicio de pago (la operación que permite transferir dinero).",
    "motivo": "Contenido depurado para que la ficha y sus botones refuercen el concepto de la plataforma, sin datos anecdóticos, variables ni referencias legales en el estudio.",
    "fuente": "Petición del usuario (13/10)"
  },
  {
    "conceptoId": "ede",
    "campo": "enunciado",
    "antes": "¿Quién autoriza la creación de una EDE?",
    "despues": "¿Qué rasgos definen el dinero electrónico?",
    "motivo": "Contenido depurado para que la ficha y sus botones refuercen el concepto de la plataforma, sin datos anecdóticos, variables ni referencias legales en el estudio.",
    "fuente": "Petición del usuario (13/10)"
  },
  {
    "conceptoId": "ede",
    "campo": "opciones",
    "antes": "La CNMV",
    "despues": "Es exigible a su emisor, se almacena electrónicamente y lo aceptan terceros.",
    "motivo": "Contenido depurado para que la ficha y sus botones refuercen el concepto de la plataforma, sin datos anecdóticos, variables ni referencias legales en el estudio.",
    "fuente": "Petición del usuario (13/10)"
  },
  {
    "conceptoId": "ede",
    "campo": "opciones",
    "antes": "El Banco de España, previo informe del SEPBLAC",
    "despues": "Es un depósito bancario que genera intereses y está cubierto por el FGD.",
    "motivo": "Contenido depurado para que la ficha y sus botones refuercen el concepto de la plataforma, sin datos anecdóticos, variables ni referencias legales en el estudio.",
    "fuente": "Petición del usuario (13/10)"
  },
  {
    "conceptoId": "ede",
    "campo": "opciones",
    "antes": "La DGSFP",
    "despues": "Son billetes emitidos por el comercio que los acepta.",
    "motivo": "Contenido depurado para que la ficha y sus botones refuercen el concepto de la plataforma, sin datos anecdóticos, variables ni referencias legales en el estudio.",
    "fuente": "Petición del usuario (13/10)"
  },
  {
    "conceptoId": "ede",
    "campo": "indiceCorrecta",
    "antes": "1",
    "despues": "0",
    "motivo": "Contenido depurado para que la ficha y sus botones refuercen el concepto de la plataforma, sin datos anecdóticos, variables ni referencias legales en el estudio.",
    "fuente": "Petición del usuario (13/10)"
  },
  {
    "conceptoId": "fgd",
    "campo": "definicion",
    "antes": "Garantiza los depósitos en dinero (y valores) de las entidades de crédito hasta <b>100.000 € por titular y entidad</b>. Con el <b>Real Decreto Ley 16/2011</b>, los tres fondos (bancos, cajas, cooperativas) se unificaron en el FGDEC.",
    "despues": "El Fondo de Garantía de Depósitos protege los depósitos en dinero hasta <b>100.000 € por titular y entidad</b>. No confundas la garantía de depósitos con la resolución de una entidad ni con los sistemas de protección de inversiones.",
    "motivo": "Contenido depurado para que la ficha y sus botones refuercen el concepto de la plataforma, sin datos anecdóticos, variables ni referencias legales en el estudio.",
    "fuente": "Petición del usuario (13/10)"
  },
  {
    "conceptoId": "fgd",
    "campo": "trampaExamen",
    "antes": "Test, pregunta 10: las opciones de 120.000 € o 150.000 € son trampas.",
    "despues": "El límite se aplica por titular y por entidad. Distingue este sistema de la resolución bancaria y de la protección de inversiones.",
    "motivo": "Contenido depurado para que la ficha y sus botones refuercen el concepto de la plataforma, sin datos anecdóticos, variables ni referencias legales en el estudio.",
    "fuente": "Petición del usuario (12/10 y 13/10)"
  },
  {
    "conceptoId": "mus",
    "campo": "definicion",
    "antes": "Supervisor bancario único de la zona euro, impulsado en 2012 y en funcionamiento desde el <b>4 de noviembre de 2014</b>. Vela por la seguridad y solidez de la banca europea. Cuatro elementos: <b>regulación, supervisión continuada, medidas correctoras y régimen sancionador</b>.",
    "despues": "Mecanismo de supervisión bancaria de la zona euro, liderado por el BCE. Su labor combina <b>regulación, supervisión continuada, medidas correctoras y régimen sancionador</b>.",
    "motivo": "Contenido depurado para que la ficha y sus botones refuercen el concepto de la plataforma, sin datos anecdóticos, variables ni referencias legales en el estudio.",
    "fuente": "Petición del usuario (13/10)"
  },
  {
    "conceptoId": "mus",
    "campo": "explicacion",
    "antes": "4 de noviembre de 2014.",
    "despues": "El MUS supervisa a las entidades de crédito de la zona euro; el MUR organiza la resolución y el FGD garantiza depósitos.",
    "motivo": "Contenido depurado para que la ficha y sus botones refuercen el concepto de la plataforma, sin datos anecdóticos, variables ni referencias legales en el estudio.",
    "fuente": "Petición del usuario (13/10)"
  },
  {
    "conceptoId": "efc",
    "campo": "explicaciones",
    "antes": "Obligaciones: informar al Banco de España, coeficiente de caja del BCE, coeficiente de garantía y normas con los clientes.",
    "despues": "La clave para distinguirlas de una entidad de depósito: pueden conceder financiación, pero no captar depósitos del público.",
    "motivo": "Contenido depurado para que la ficha y sus botones refuercen el concepto de la plataforma, sin datos anecdóticos, variables ni referencias legales en el estudio.",
    "fuente": "Petición del usuario (13/10)"
  },
  {
    "conceptoId": "efc",
    "campo": "explicacion",
    "antes": "Ley 5/2015.",
    "despues": "Los EFC pueden conceder financiación, pero no captar depósitos del público.",
    "motivo": "Contenido depurado para que la ficha y sus botones refuercen el concepto de la plataforma, sin datos anecdóticos, variables ni referencias legales en el estudio.",
    "fuente": "Petición del usuario (13/10)"
  },
  {
    "conceptoId": "mus",
    "campo": "enunciado",
    "antes": "¿Desde cuándo funciona el MUS?",
    "despues": "¿Qué hace principalmente el MUS?",
    "motivo": "La ficha estudia la función del MUS y su diferencia con el MUR y el FGD, no una fecha.",
    "fuente": "Petición del usuario (13/10)"
  },
  {
    "conceptoId": "mus",
    "campo": "opciones",
    "antes": "1-1-1999",
    "despues": "Supervisa a las entidades de crédito de la zona euro",
    "motivo": "La pregunta comprueba la función del MUS.",
    "fuente": "Petición del usuario (13/10)"
  },
  {
    "conceptoId": "mus",
    "campo": "opciones",
    "antes": "4-11-2014",
    "despues": "Organiza la resolución de las entidades no viables",
    "motivo": "La opción refuerza la diferencia entre MUS y MUR.",
    "fuente": "Petición del usuario (13/10)"
  },
  {
    "conceptoId": "mus",
    "campo": "opciones",
    "antes": "1-11-2019",
    "despues": "Garantiza los depósitos hasta 100.000 €",
    "motivo": "La opción refuerza la diferencia entre supervisión y garantía de depósitos.",
    "fuente": "Petición del usuario (13/10)"
  },
  {
    "conceptoId": "mus",
    "campo": "indiceCorrecta",
    "antes": "1",
    "despues": "0",
    "motivo": "La opción correcta ahora describe la función del MUS.",
    "fuente": "Petición del usuario (13/10)"
  },
  {
    "conceptoId": "coop",
    "campo": "ejemploReal",
    "antes": "Tipos: cajas rurales (la mayoría), cajas populares y cajas profesionales. Patronal: UNACC (1970). Dependen del Ministerio de Trabajo y Economía Social y del de Economía (Banco de España).",
    "despues": "Una cooperativa de crédito pertenece a sus socios y puede ofrecer servicios financieros tanto a ellos como a terceros.",
    "motivo": "Se eliminan el dato histórico de una patronal y una adscripción institucional que no ayudan a entender el concepto.",
    "fuente": "Petición del usuario (13/10)"
  }
];
