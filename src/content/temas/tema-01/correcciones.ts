/*
 * Correcciones de exactitud aprobadas por el usuario (11/10) sobre el contenido heredado del prototipo
 * (legacy/ciudad-del-dinero-tema1.html). La prueba de paridad aplica estas sustituciones al prototipo
 * y exige que el resultado sea exactamente el contenido actual: nada cambia sin quedar registrado aquí.
 */
/** Campos de un concepto que admiten correcciones (enunciado y explicacion son los de su pregunta). */
export type CampoCorregible = 'definicion' | 'ejemploReal' | 'explicaciones' | 'trampaExamen' | 'enunciado' | 'explicacion';

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
    "antes": "Es un <b>intermediario atípico</b>: financia a las Administraciones públicas, no a familias.",
    "despues": "Es un <b>intermediario atípico</b>: no trabaja con familias ni empresas, sino con las entidades de crédito y con el Estado, al que lleva la tesorería y la deuda pública. La ley le <b>prohíbe prestar</b> a las Administraciones públicas (art. 13 de su Ley de Autonomía).",
    "motivo": "El Banco de España no puede financiar a las Administraciones públicas.",
    "fuente": "Ley 13/1994, art. 13"
  },
  {
    "conceptoId": "estructura-b",
    "campo": "definicion",
    "antes": "Debajo, las <b>entidades de crédito</b>: entidades de depósito (bancos, cajas, cooperativas), ICO, entidades de dinero electrónico y EFC. Y <b>otras entidades</b>: sociedades de tasación, SGR, entidades de cambio de divisa y entidades de pago.",
    "despues": "Debajo, las <b>entidades de crédito</b>: entidades de depósito (bancos, cajas, cooperativas) e ICO. Y <b>otras entidades</b> que también supervisa: EFC, entidades de dinero electrónico, sociedades de tasación, SGR, entidades de cambio de divisa y entidades de pago. Ojo: en esquemas antiguos aún aparecen los EFC y las EDE entre las entidades de crédito, pero los EFC dejaron de serlo con la Ley 5/2015 y las EDE, con la Ley 21/2011.",
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
    "despues": "Entidad de crédito ≠ entidad de depósito: el ICO es de crédito pero no de depósito. Los EFC ya no son entidades de crédito (Ley 5/2015), aunque los supervisa el Banco de España.",
    "motivo": "Los EFC ya no son entidades de crédito.",
    "fuente": "Ley 5/2015"
  },
  {
    "conceptoId": "fgd",
    "campo": "explicaciones",
    "antes": "☂️ 100.000 € por titular y entidad · obligatorio para entidades españolas · voluntario para sucursales de la UE",
    "despues": "☂️ 100.000 € por titular y entidad · obligatorio para entidades españolas · las sucursales de bancos de otros países de la UE las cubre el fondo de su país",
    "motivo": "Dato desactualizado: las sucursales de la UE las cubre el fondo de su país de origen.",
    "fuente": "Directiva 2014/49/UE, art. 14"
  },
  {
    "conceptoId": "efc",
    "campo": "definicion",
    "antes": "Entidades de crédito especializadas que <b>no pueden captar depósitos del público</b>. <b>Ley 5/2015</b> de Fomento de la Financiación Empresarial: condiciones parecidas a los bancos con menos capital.",
    "despues": "Entidades financieras especializadas en prestar que <b>no pueden captar depósitos del público</b>. Con la <b>Ley 5/2015</b> de Fomento de la Financiación Empresarial <b>dejaron de ser entidades de crédito</b>, pero las sigue supervisando el Banco de España.",
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
    "antes": "Test, pregunta 9: \"lograr",
    "despues": "Pregunta trampa típica: \"lograr",
    "motivo": "Citaba el libro (test, actividad, tabla o página) en vez de explicarlo.",
    "fuente": "Petición del usuario (12/10)"
  },
  {
    "conceptoId": "directa",
    "campo": "trampaExamen",
    "antes": " (test, pregunta 8).",
    "despues": ".",
    "motivo": "Citaba el libro (test, actividad, tabla o página) en vez de explicarlo.",
    "fuente": "Petición del usuario (12/10)"
  },
  {
    "conceptoId": "indirecta",
    "campo": "trampaExamen",
    "antes": "La frase que buscan en la actividad 4:",
    "despues": "La frase que buscan en el examen:",
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
    "antes": "Actividad 22: la finalidad del supervisor único.",
    "despues": "Su finalidad: velar por la seguridad y solidez de la banca europea.",
    "motivo": "Citaba el libro (test, actividad, tabla o página) en vez de explicarlo.",
    "fuente": "Petición del usuario (12/10)"
  },
  {
    "conceptoId": "bde",
    "campo": "explicaciones",
    "antes": "Test 11: máxima autoridad",
    "despues": "Máxima autoridad",
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
    "conceptoId": "cajas",
    "campo": "trampaExamen",
    "antes": " No (Comprueba 30).",
    "despues": " No.",
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
    "antes": "Línea del libro para comercio minorista",
    "despues": "Ejemplo de línea de financiación para comercio minorista",
    "motivo": "Citaba el libro (test, actividad, tabla o página) en vez de explicarlo.",
    "fuente": "Petición del usuario (12/10)"
  },
  {
    "conceptoId": "ede",
    "campo": "explicaciones",
    "antes": "Comprueba 5: definir las EDE y poner dos ejemplos.",
    "despues": "Pregunta típica: define las EDE y pon dos ejemplos (Bnext, MoneyToPay…).",
    "motivo": "Citaba el libro (test, actividad, tabla o página) en vez de explicarlo.",
    "fuente": "Petición del usuario (12/10)"
  },
  {
    "conceptoId": "ede",
    "campo": "explicacion",
    "antes": "Pág. 25 del libro.",
    "despues": "Las EDE las autoriza el Banco de España, previo informe del SEPBLAC (el servicio que vigila el blanqueo de capitales). Ni la CNMV ni la DGSFP intervienen.",
    "motivo": "Citaba el libro (test, actividad, tabla o página) en vez de explicarlo.",
    "fuente": "Petición del usuario (12/10)"
  },
  {
    "conceptoId": "fgd",
    "campo": "trampaExamen",
    "antes": "Test, pregunta 10: las opciones",
    "despues": "Las opciones",
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
    "antes": "No la confundas con el \"mercado directo\" del punto 3.2: si hay un intermediario que cobra comisión, el mercado es intermediado",
    "despues": "No la confundas con la clasificación de los mercados: si hay un intermediario que cobra comisión, el mercado es intermediado",
    "motivo": "La explicación remitía a un punto del libro.",
    "fuente": "Petición del usuario (13/10)"
  },
  {
    "conceptoId": "rrl",
    "campo": "ejemploReal",
    "antes": "⚠ dato del libro, puede haber cambiado: letras del Tesoro en torno al 2,6 % a 12 meses y depósitos entre el 2 y el 3 %.",
    "despues": "⚠ Datos orientativos que pueden haber cambiado: letras del Tesoro en torno al 2,6 % a 12 meses y depósitos entre el 2 y el 3 %.",
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
    "despues": "Sede en Frankfurt. Presidenta desde el 1-11-2019: Christine Lagarde, mandato de 8 años no renovable. La cifra de países puede haber cambiado: desde el 1-1-2026 Bulgaria usa el euro y son 21.",
    "motivo": "Se sustituye la referencia al libro por un aviso contextual sobre la cifra.",
    "fuente": "Petición del usuario (13/10)"
  },
  {
    "conceptoId": "ede",
    "campo": "ejemploReal",
    "antes": "⚠ dato del libro, puede haber cambiado: Bnext, MoneyToPay, PFS Card y Pecunia Cards. Entidades de pago (RDL 19/2018): Moneytrans y Safetypay.",
    "despues": "⚠ Estos ejemplos pueden haber quedado desactualizados: Bnext, MoneyToPay, PFS Card y Pecunia Cards. Entidades de pago (RDL 19/2018): Moneytrans y Safetypay.",
    "motivo": "Se conserva el aviso de vigencia y se elimina la referencia al libro.",
    "fuente": "Petición del usuario (13/10)"
  }
];
