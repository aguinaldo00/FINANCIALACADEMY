// Generado desde legacy/ciudad-del-dinero-tema1.html con `npm run content:extract`.
// Contenido académico literal del prototipo: no ampliar ni reformular.

import type { Concepto } from '../../schema.ts';

export const conceptos: Concepto[] = [
  {
    id: "sf",
    seccionId: "1",
    nombre: "Sistema financiero y unidades económicas",
    iconos: [
      "people",
      "arrow",
      "bank"
    ],
    color: "#ffd23f",
    definicion: "Conjunto de <b>instituciones, medios (activos) y mercados</b> que canaliza el ahorro de las unidades con <b>superávit</b> (les sobra: ahorradores) hacia las que tienen <b>déficit</b> (les falta: inversores). Las unidades económicas son familias, empresas y sector público.",
    ejemploReal: "Tu nómina en el banco acaba financiando la nave que construye una empresa de tu comarca.",
    explicaciones: [
      "La red de tuberías que lleva el agua de quien tiene de sobra a quien tiene sed.",
      "Hay gente con dinero guardado y gente que lo necesita. El sistema financiero los junta para que el dinero no se quede parado.",
      "Superávit (familias) → [mercados · intermediarios · instrumentos] → Déficit (empresas, sector público)",
      "No es lo mismo que \"los bancos\": los bancos son solo una pieza (intermediarios). El sistema incluye también mercados e instrumentos.",
      "Sistema financiero = instituciones, medios y mercados cuyo objetivo es canalizar el ahorro a la inversión."
    ],
    trampaExamen: "En el test (pregunta 1) la buena es \"instituciones, medios y mercados que canalizan el ahorro a la inversión\". Las trampas lo reducen a \"bancos y cajas\" o a \"instituciones bancarias\".",
    pregunta: {
      enunciado: "INST, SA ingresa 450.000 € y gasta 320.000 €. Es una unidad con…",
      opciones: [
        "Superávit",
        "Déficit",
        "Financiación"
      ],
      indiceCorrecta: 0,
      explicacion: "Ingresos mayores que gastos: superávit (capacidad de financiación)."
    }
  },
  {
    id: "funciones",
    seccionId: "2",
    nombre: "Las funciones del sistema financiero",
    iconos: [
      "scale",
      "eye"
    ],
    color: "#3ddbd9",
    definicion: "<b>Función esencial:</b> canalizar los recursos de las unidades con superávit hacia las de déficit. Además: analizar la viabilidad de los proyectos, fomentar el ahorro, sustentar el sistema de pagos, asignar eficientemente los recursos, contribuir a la estabilidad monetaria y financiera, y velar por las instituciones.",
    ejemploReal: "El banco estudia tu plan de negocio antes de prestarte (viabilidad) y tu transferencia llega al momento (sistema de pagos).",
    explicaciones: [
      "Es fontanero y árbitro a la vez: hace que el dinero llegue y vigila que nadie rompa las tuberías.",
      "El sistema mira si los proyectos van a salir bien, anima a ahorrar, hace que los pagos lleguen y cuida que todo funcione sin sustos.",
      "Viabilidad · Ahorro · Pagos · Asignación · Estabilidad · Vigilancia → \"Ve A Pagar A Este Vendedor\"",
      "No confundas la función esencial (una: canalizar ahorro → inversión) con la lista de seis funciones.",
      "Función esencial: canalizar los recursos de las unidades con superávit hacia las unidades con déficit."
    ],
    trampaExamen: "Test, pregunta 9: \"lograr la estabilidad mediante políticas expansivas de los mercados organizados\" suena bien, pero es falso.",
    pregunta: {
      enunciado: "¿Cuál es la función ESENCIAL del sistema financiero?",
      opciones: [
        "Emitir billetes",
        "Canalizar recursos del superávit al déficit",
        "Supervisar a los bancos"
      ],
      indiceCorrecta: 1,
      explicacion: "Las otras son funciones de organismos concretos."
    }
  },
  {
    id: "directa",
    seccionId: "2",
    nombre: "Intermediación directa",
    iconos: [
      "arrow",
      "chart"
    ],
    color: "#ff4f8b",
    definicion: "Los agentes con déficit <b>emiten instrumentos</b> (bonos, acciones) y los agentes con superávit <b>los compran</b>. El ahorrador sabe a quién financia y asume el riesgo.",
    ejemploReal: "Compras en bolsa los bonos que acaba de emitir una empresa.",
    explicaciones: [
      "Prestar dinero a un amigo cara a cara: si no te paga, pierdes tú.",
      "Le das tu dinero directamente a quien lo necesita, a cambio de un papel que dice que te lo devolverá.",
      "Ahorrador ──€──▶ Empresa   ·   Ahorrador ◀──bono── Empresa",
      "Su gemela es la indirecta: allí hay un banco en medio y ahorrador e inversor no se conocen.",
      "Directa: entre agentes con déficit, que emiten instrumentos financieros, y agentes con superávit, que los adquieren."
    ],
    trampaExamen: "No la confundas con el \"mercado directo\" del punto 3.2: si hay un intermediario que cobra comisión, el mercado es intermediado (test, pregunta 8).",
    pregunta: {
      enunciado: "Compras acciones en la salida a bolsa de una empresa. Es intermediación…",
      opciones: [
        "Directa",
        "Indirecta"
      ],
      indiceCorrecta: 0,
      explicacion: "Compras tú el título al emisor."
    }
  },
  {
    id: "indirecta",
    seccionId: "2",
    nombre: "Intermediación indirecta",
    iconos: [
      "bank",
      "arrow"
    ],
    color: "#60a5fa",
    definicion: "El ahorrador <b>deposita su excedente en el banco</b> y el banco hace llegar ese dinero a quien tiene déficit. <b>Ambos agentes no tienen contacto entre ellos.</b>",
    ejemploReal: "Tus ahorros en un depósito financian el préstamo de una pyme que no conoces.",
    explicaciones: [
      "Dejar comida en un banco de alimentos: no sabes quién se la come.",
      "Le das tu dinero al banco y el banco se lo presta a otra persona. Tú solo hablas con el banco.",
      "Ahorrador ──depósito──▶ 🏦 ──préstamo──▶ Empresa",
      "Gemela de la directa. Aquí el riesgo lo asume el banco, que cobra el margen.",
      "Indirecta: el agente con superávit ingresa su excedente en el banco y el banco lo hace llegar al agente con déficit."
    ],
    trampaExamen: "La frase que buscan en la actividad 4: \"ambos agentes no tienen ningún contacto entre ellos\".",
    pregunta: {
      enunciado: "Metes tus ahorros en un depósito. Es intermediación…",
      opciones: [
        "Directa",
        "Indirecta"
      ],
      indiceCorrecta: 1,
      explicacion: "El banco hace de puente."
    }
  },
  {
    id: "pagos",
    seccionId: "2",
    nombre: "Sistema de pagos",
    iconos: [
      "card",
      "link"
    ],
    color: "#3ddbd9",
    definicion: "Conjunto de recursos mediante los cuales se <b>transfiere dinero entre las instituciones financieras</b> y de estas a los particulares. Las transacciones deben ser transparentes para que funcione.",
    ejemploReal: "Un pago con tarjeta o una transferencia que llega al instante.",
    explicaciones: [
      "Las carreteras por las que viaja el dinero.",
      "Es el camino que sigue el dinero cuando pagas con tarjeta o mandas una transferencia.",
      "Banco A ⇄ Banco B ⇄ Particulares",
      "No es lo mismo que el medio de pago (dinero, tarjeta): el sistema es el camino, no el vehículo.",
      "Sustentar el sistema de pagos: garantizar que las transacciones se realicen de forma segura y eficiente."
    ],
    trampaExamen: "Actividad 7: debe estar saneado porque, si falla, el dinero no llega y la economía se para.",
    pregunta: {
      enunciado: "¿Qué es un sistema de pagos?",
      opciones: [
        "Los billetes y monedas",
        "Recursos para transferir dinero entre instituciones y particulares",
        "El conjunto de bancos"
      ],
      indiceCorrecta: 1,
      explicacion: "Es la infraestructura de las transferencias."
    }
  },
  {
    id: "instrumento",
    seccionId: "3.1",
    nombre: "Instrumento financiero",
    iconos: [
      "invoice",
      "scale"
    ],
    color: "#ffd23f",
    definicion: "Título emitido por las unidades económicas para dirigir el ahorro a la inversión. Es un <b>derecho para quien lo posee</b> y una <b>obligación para quien lo emite</b>.",
    ejemploReal: "Acciones, bonos, letras del Tesoro, depósitos bancarios, seguros.",
    explicaciones: [
      "Un pagaré entre amigos: uno tiene derecho a cobrar y el otro, la obligación de pagar.",
      "Es un papel (o un registro en el ordenador) que dice \"te debo dinero\".",
      "Emisor (obligación) ──título──▶ Poseedor (derecho)",
      "No confundir instrumento (el título) con intermediario (la entidad) ni con mercado (el lugar).",
      "Instrumentos financieros: derecho para quien los posee y obligación para quien los emite."
    ],
    trampaExamen: "Se suele invertir: el derecho es del poseedor; la obligación, del emisor.",
    pregunta: {
      enunciado: "Para quien EMITE un instrumento financiero es…",
      opciones: [
        "Un derecho",
        "Una obligación",
        "Un medio de pago"
      ],
      indiceCorrecta: 1,
      explicacion: "El emisor debe pagar."
    }
  },
  {
    id: "rrl",
    seccionId: "3.1",
    nombre: "Riesgo, liquidez y rentabilidad",
    iconos: [
      "scale",
      "clock"
    ],
    color: "#ff5a5a",
    definicion: "<b>Riesgo:</b> probabilidad de que, al vencimiento, el emisor no pague. <b>Liquidez:</b> facilidad para convertirlo en dinero. <b>Rentabilidad:</b> capacidad de generar intereses.",
    ejemploReal: "⚠ dato del libro, puede haber cambiado: letras del Tesoro en torno al 2,6 % a 12 meses y depósitos entre el 2 y el 3 %.",
    explicaciones: [
      "Riesgo: que tu amigo no te devuelva el dinero. Liquidez: un billete frente a un piso (uno se gasta ya, el otro tarda meses en venderse). Rentabilidad: lo que te paga tu dinero por trabajar.",
      "¿Me lo devolverán? (riesgo) ¿Puedo recuperarlo rápido? (liquidez) ¿Cuánto me da? (rentabilidad)",
      "↑ riesgo o ↓ liquidez ⇒ ↑ rentabilidad exigida",
      "Liquidez no es \"tener mucho dinero\": es lo fácil que es convertir algo en dinero.",
      "Las características principales de los instrumentos son el riesgo, la liquidez y la rentabilidad."
    ],
    trampaExamen: "Actividad 12c: te piden identificar las tres en el producto que recomiendas. No te olvides de ninguna.",
    pregunta: {
      enunciado: "La facilidad de convertir un activo en dinero es…",
      opciones: [
        "Rentabilidad",
        "Liquidez",
        "Riesgo"
      ],
      indiceCorrecta: 1,
      explicacion: "Eso es liquidez."
    }
  },
  {
    id: "mercado",
    seccionId: "3.2A",
    nombre: "Mercado financiero",
    iconos: [
      "store",
      "chart"
    ],
    color: "#3ddbd9",
    definicion: "Lugar o punto de encuentro, <b>físico o virtual</b>, donde quienes demandan y quienes ofrecen activos financieros se ponen en contacto para <b>intercambiarlos y fijar su precio</b>.",
    ejemploReal: "La bolsa de Madrid o el mercado interbancario, totalmente electrónico.",
    explicaciones: [
      "Un mercadillo, pero de acciones y bonos en lugar de fruta.",
      "El sitio donde se compran y venden \"papeles de dinero\" y se decide cuánto valen.",
      "Oferentes ⇄ 📈 precio ⇄ Demandantes",
      "Mercado (el lugar) ≠ intermediario (quien media). En un mercado directo no hay intermediario.",
      "Mercado financiero: lugar o punto de encuentro donde se intercambian activos financieros y se fija su precio."
    ],
    trampaExamen: "Test, pregunta 9: es función del mercado \"poner en contacto a los agentes que intervienen en las operaciones financieras\".",
    pregunta: {
      enunciado: "Según el test del libro, es función de un mercado financiero:",
      opciones: [
        "Poner en contacto a los agentes",
        "Emitir billetes",
        "Estabilizar con políticas expansivas"
      ],
      indiceCorrecta: 0,
      explicacion: "Pregunta 9 del test de repaso."
    }
  },
  {
    id: "fase",
    seccionId: "3.2B",
    nombre: "Primario vs secundario",
    iconos: [
      "chart",
      "arrow"
    ],
    color: "#ff4f8b",
    definicion: "Según la fase de negociación. <b>Primario:</b> se adquieren activos de nueva creación, al emisor o mediante intermediarios. <b>Secundario:</b> se negocian activos ya emitidos, lo que les da movilidad.",
    ejemploReal: "Primario: acciones nuevas, pagarés, letras del Tesoro, ampliaciones de capital. Secundario: la bolsa de valores.",
    explicaciones: [
      "Primario es el estreno de la película; secundario, la tienda de segunda mano.",
      "En el primario compras algo recién hecho; en el secundario se lo compras a otra persona que ya lo tenía.",
      "Emisor ─(primario)─▶ Inversor A ─(secundario)─▶ Inversor B",
      "No confundir primario/secundario (fase) con monetario/capitales (plazo del activo).",
      "Primarios: activos de nueva creación. Secundarios: activos ya existentes; ej.: la bolsa de valores."
    ],
    trampaExamen: "Comprueba 14: en una emisión de letras del Tesoro los activos son nuevos → primario (y, por plazo, monetario).",
    pregunta: {
      enunciado: "En una emisión de letras del Tesoro, el mercado es…",
      opciones: [
        "Secundario",
        "Primario",
        "OTC"
      ],
      indiceCorrecta: 1,
      explicacion: "Son activos nuevos."
    }
  },
  {
    id: "activo",
    seccionId: "3.2B",
    nombre: "Monetario vs de capitales",
    iconos: [
      "clock",
      "chart"
    ],
    color: "#60a5fa",
    definicion: "Según el tipo de activo. <b>Monetario:</b> vencimiento inferior a 18 meses, mucha liquidez y poco riesgo; ahí se fija el <b>euríbor</b>. <b>De capitales:</b> más de 18 meses; renta fija (AIAF) y renta variable (bolsa).",
    ejemploReal: "Monetario: el mercado interbancario. Capitales: bonos a 10 años o acciones.",
    explicaciones: [
      "El monetario es la caja chica (corto plazo, siempre a mano); el de capitales, la hucha del futuro.",
      "Si el dinero vuelve en menos de año y medio, es monetario. Si tarda más, de capitales.",
      "⏱️ menos de 18 meses → monetario   ·   🏔️ más de 18 meses → capitales (AIAF / bolsa)",
      "El euríbor (tipo medio al que se prestan los bancos europeos) es del monetario, no del de capitales.",
      "Monetarios: vencimiento inferior a 18 meses. De capitales: superior a 18 meses."
    ],
    trampaExamen: "La frontera son 18 meses, no 12. Es la cifra que más cambian en los test.",
    pregunta: {
      enunciado: "La frontera entre mercado monetario y de capitales es…",
      opciones: [
        "12 meses",
        "18 meses",
        "24 meses"
      ],
      indiceCorrecta: 1,
      explicacion: "18 meses."
    }
  },
  {
    id: "estructura-m",
    seccionId: "3.2B",
    nombre: "Directo vs intermediado",
    iconos: [
      "handshake",
      "arrow"
    ],
    color: "#ff8a3d",
    definicion: "Según la estructura del mercado. <b>Directo:</b> no hay intermediarios; comprador y vendedor buscan la contrapartida. <b>Intermediado:</b> un intermediario pone en contacto a las partes a cambio de una comisión.",
    ejemploReal: "Directo: acciones que no se negocian en bolsa. Intermediado: compras a través de un bróker.",
    explicaciones: [
      "Directo: vendes tu moto a un vecino. Intermediado: la vendes en un concesionario que cobra comisión.",
      "O te apañas tú solo con el otro, o alguien os junta y cobra por ello.",
      "Directo: A ⇄ B   ·   Intermediado: A ⇄ 🤝 (comisión) ⇄ B",
      "Se parece a la intermediación directa/indirecta del punto 2, pero aquí se clasifican mercados.",
      "Directos: sin mediadores. Intermediados: con intermediarios que cobran comisión."
    ],
    trampaExamen: "Test, pregunta 8: \"uno de los participantes es un intermediario que cobra comisión\" describe un mercado intermediado, no directo.",
    pregunta: {
      enunciado: "Si un intermediario cobra comisión por poner en contacto a las partes, el mercado es…",
      opciones: [
        "Directo",
        "Intermediado",
        "Primario"
      ],
      indiceCorrecta: 1,
      explicacion: "Pregunta 8 del test."
    }
  },
  {
    id: "formalizacion",
    seccionId: "3.2B",
    nombre: "Organizados vs OTC",
    iconos: [
      "invoice",
      "handshake"
    ],
    color: "#a78bfa",
    definicion: "Según el grado de formalización. <b>Organizados:</b> se negocia con normas y reglamentos (bolsa, deuda pública anotada). <b>No organizados u OTC:</b> las partes fijan las reglas y no hay un sitio concreto.",
    ejemploReal: "Organizado: la bolsa. OTC: préstamos o acciones de pymes.",
    explicaciones: [
      "Organizado: un partido con reglamento y árbitro. OTC: un partido de barrio con las reglas que pactéis.",
      "En unos hay reglas fijas para todos; en otros, cada uno se pone de acuerdo como quiere.",
      "📋 reglas fijas → organizado   ·   🤝 reglas pactadas → OTC (over the counter)",
      "\"Anotada\" significa registrada electrónicamente, sin papel. No tiene nada que ver con \"no organizado\".",
      "OTC: las partes que intervienen establecen las reglas de intercambio."
    ],
    trampaExamen: "En los OTC se intercambia la mayoría de los activos financieros, no en los organizados.",
    pregunta: {
      enunciado: "Préstamos y acciones de pymes se negocian sobre todo en mercados…",
      opciones: [
        "Organizados",
        "OTC"
      ],
      indiceCorrecta: 1,
      explicacion: "Las partes fijan sus reglas."
    }
  },
  {
    id: "regulados-plazo",
    seccionId: "3.2B",
    nombre: "Regulados vs no regulados · Spot vs a plazo",
    iconos: [
      "scale",
      "clock"
    ],
    color: "#4ade80",
    definicion: "Por intervención: en los <b>regulados</b> las autoridades intervienen en precio y número de activos; en los <b>no regulados</b> manda la oferta y la demanda (hoy la mayoría). Por plazo: <b>al contado (spot)</b>, con entrega inmediata, o <b>a plazo</b> (futuros y opciones), para una fecha futura a precio fijado.",
    ejemploReal: "A plazo: pactas hoy comprar dentro de seis meses a un precio cerrado.",
    explicaciones: [
      "Spot es comprar el pan y llevártelo. A plazo es encargar la tarta del cumpleaños con precio cerrado.",
      "O el árbitro mete mano en los precios o no. Y o te lo llevas ya, o quedas para más adelante.",
      "👮 regulado / 🌊 no regulado   ·   ⚡ spot / 📅 a plazo",
      "\"A plazo\" no es \"de capitales\": habla de cuándo se entrega, no de cuánto dura el activo.",
      "Al contado: entrega inmediata. A plazo: futuros y opciones."
    ],
    trampaExamen: "Actividad 11: en las opciones se paga una prima por el derecho a comprar o vender en el futuro.",
    pregunta: {
      enunciado: "Futuros y opciones son mercados…",
      opciones: [
        "Al contado",
        "A plazo",
        "Monetarios"
      ],
      indiceCorrecta: 1,
      explicacion: "Se pacta para una fecha futura."
    }
  },
  {
    id: "bolsas",
    seccionId: "3.2B",
    nombre: "Las 4 bolsas, el mercado continuo y el SIBE",
    iconos: [
      "metro",
      "screen"
    ],
    color: "#ffd23f",
    definicion: "España tiene <b>cuatro bolsas oficiales: Madrid, Barcelona, Bilbao y Valencia</b>. El <b>mercado continuo</b> las interconecta para que funcionen como un único mercado, gracias a la plataforma electrónica <b>SIBE</b> (Sistema de Interconexión Bursátil Español).",
    ejemploReal: "Una acción cotiza a la vez en las cuatro bolsas. Bolsas internacionales: Nueva York, Tokio, Shanghái, Hong Kong, Londres, Shenzhen, NASDAQ y Euronext.",
    explicaciones: [
      "El mercado continuo es una línea de metro que une cuatro estaciones; el SIBE, la centralita que la hace funcionar.",
      "Hay cuatro bolsas, pero un ordenador las conecta y funcionan como si fueran una sola.",
      "🏛️ Madrid · 🏛️ Barcelona · 🏛️ Bilbao · 🏛️ Valencia ──▶ 🖥️ SIBE = mercado continuo",
      "El SIBE es la plataforma; el mercado continuo, el resultado (las cuatro como una).",
      "Mercado continuo: interconexión de las cuatro bolsas de valores mediante el SIBE."
    ],
    trampaExamen: "\"Mi Barco Bebe Vino\": Madrid, Barcelona, Bilbao, Valencia. Ni Sevilla ni Zaragoza.",
    pregunta: {
      enunciado: "¿Cuál NO es una bolsa oficial española?",
      opciones: [
        "Bilbao",
        "Sevilla",
        "Valencia"
      ],
      indiceCorrecta: 1,
      explicacion: "Madrid, Barcelona, Bilbao y Valencia."
    }
  },
  {
    id: "caracteristicas-m",
    seccionId: "3.2C",
    nombre: "Las 5 características de los mercados",
    iconos: [
      "chart",
      "scale"
    ],
    color: "#ff4f8b",
    definicion: "<b>Libertad</b> (sin barreras de entrada y salida), <b>profundidad</b> (muchas órdenes de compra y venta), <b>transparencia</b> (información fácil de obtener), <b>flexibilidad</b> (precios que reaccionan rápido) y <b>amplitud</b> (muchos activos negociados).",
    ejemploReal: "Un inversor que quiere diversificar su cartera busca un mercado amplio (actividad 13).",
    explicaciones: [
      "Un buen supermercado: entras y sales libremente, hay mucha gente comprando, los precios están a la vista, cambian rápido y hay de todo.",
      "Un buen mercado deja entrar a cualquiera, tiene mucha gente, no esconde nada, cambia rápido y tiene muchas cosas.",
      "L · P · T · F · A → \"Los Payasos Toman Fanta Ahora\"",
      "Profundidad (muchas órdenes para un activo) ≠ amplitud (muchos activos distintos).",
      "Libertad, profundidad, transparencia, flexibilidad y amplitud."
    ],
    trampaExamen: "Profundidad y amplitud son las que más se confunden.",
    pregunta: {
      enunciado: "Que se negocien muchos activos distintos es…",
      opciones: [
        "Profundidad",
        "Amplitud",
        "Flexibilidad"
      ],
      indiceCorrecta: 1,
      explicacion: "Amplitud = número de activos."
    }
  },
  {
    id: "perfecto",
    seccionId: "3.2C",
    nombre: "El mercado perfecto",
    iconos: [
      "scale",
      "eye"
    ],
    color: "#ffd23f",
    definicion: "Modelo teórico con muchísimos oferentes y demandantes (nadie influye en el precio), tipo de interés sin variaciones, impuestos, margen e inflación nulos, entrada y salida libres e información igual para todos. <b>No existe.</b>",
    ejemploReal: "Se usa como unidad de medida para comparar los mercados reales.",
    explicaciones: [
      "Como el 10 en un examen: casi nadie lo saca, pero sirve para medir lo cerca que estás.",
      "Es un mercado ideal que no existe; sirve para ver cómo de bueno es uno de verdad.",
      "Mercado real ──comparar──▶ Mercado perfecto (L, P, T, F y A al máximo)",
      "No confundas las 5 características con las circunstancias del mercado perfecto (la lista ideal).",
      "No existe ningún mercado financiero perfecto: aparece como unidad de medida."
    ],
    trampaExamen: "Caso práctico 2 y actividad 15: describirlo usando las 5 características.",
    pregunta: {
      enunciado: "¿Existe un mercado financiero perfecto?",
      opciones: [
        "Sí, la bolsa",
        "No, es un modelo teórico",
        "Sí, el interbancario"
      ],
      indiceCorrecta: 1,
      explicacion: "Es una unidad de medida."
    }
  },
  {
    id: "intermediario",
    seccionId: "3.3A",
    nombre: "Intermediario financiero",
    iconos: [
      "handshake",
      "bank"
    ],
    color: "#ff8a3d",
    definicion: "Institución que <b>media entre oferentes y demandantes de dinero</b> y canaliza el ahorro hacia quien lo necesita. Ofrece garantías a ambos: al que presta, que recuperará su dinero con rentabilidad; al que pide, condiciones adaptadas.",
    ejemploReal: "Un banco, una cooperativa de crédito o una aseguradora.",
    explicaciones: [
      "Un agente inmobiliario del dinero: junta al que tiene con al que necesita y responde de que el trato salga bien.",
      "Es quien se pone en medio para que el que tiene dinero y el que lo necesita se entiendan.",
      "Oferentes ─▶ 🤝 intermediario ─▶ Demandantes",
      "Intermediario (entidad) ≠ mercado (lugar).",
      "Instituciones que median entre oferentes y demandantes de dinero y canalizan el ahorro."
    ],
    trampaExamen: "Actividad 23: oferentes buscan seguridad y rentabilidad; demandantes, condiciones adaptadas. No las cruces.",
    pregunta: {
      enunciado: "¿Qué buscan los oferentes de fondos en un intermediario?",
      opciones: [
        "Condiciones adaptadas",
        "Que les devuelvan su dinero con rentabilidad",
        "Avales"
      ],
      indiceCorrecta: 1,
      explicacion: "Los demandantes buscan condiciones adaptadas."
    }
  },
  {
    id: "margen",
    seccionId: "3.3A",
    nombre: "Margen, ventajas e inconvenientes",
    iconos: [
      "euro",
      "scale"
    ],
    color: "#4ade80",
    definicion: "El <b>margen de intermediación</b> es el beneficio del intermediario: diferencia entre el tipo que cobra a los inversores y el que paga a los ahorradores. <b>Ventajas:</b> facilitan el acceso a los instrumentos y canalizan el ahorro. <b>Inconveniente:</b> encarecen las operaciones.",
    ejemploReal: "Paga un 1 % por tu depósito y cobra un 4 % por un préstamo: margen del 3 %.",
    explicaciones: [
      "Comprar barato y vender caro: la diferencia es su sueldo.",
      "El banco te da un poquito por guardar tu dinero y cobra más al que se lo presta. Lo de en medio es para él.",
      "Tipo cobrado (4 %) − tipo pagado (1 %) = margen (3 %)",
      "Margen ≠ comisión fija: el margen sale de la diferencia entre tipos de interés.",
      "Un margen elevado puede indicar que el sistema financiero es ineficiente."
    ],
    trampaExamen: "Un margen alto = sistema ineficiente, no \"banco sano\". Y con lo electrónico se usan cada vez menos intermediarios.",
    pregunta: {
      enunciado: "Un margen de intermediación muy alto indica…",
      opciones: [
        "Sistema eficiente",
        "Sistema ineficiente",
        "Más competencia"
      ],
      indiceCorrecta: 1,
      explicacion: "Lo dice el libro, pág. 15."
    }
  },
  {
    id: "tipos-int",
    seccionId: "3.3B",
    nombre: "Bancarios vs no bancarios",
    iconos: [
      "card",
      "umbrella"
    ],
    color: "#60a5fa",
    definicion: "<b>Bancarios:</b> emiten instrumentos aceptados como medio de pago, es decir, <b>crean dinero</b> (ej.: bancos). <b>No bancarios:</b> emiten instrumentos con valor monetario que <b>no son medio de pago</b> (ej.: compañías de seguros).",
    ejemploReal: "Pagas el pan con tu saldo del banco; con tu póliza de seguro no puedes.",
    explicaciones: [
      "Los bancarios fabrican fichas que valen en cualquier tienda; los no bancarios, vales que no sirven para pagar.",
      "Si con lo que te dan puedes pagar en una tienda, es bancario. Si no, no bancario.",
      "💳 medio de pago → bancario   ·   📄 valor pero no paga → no bancario",
      "Las aseguradoras sí son intermediarios financieros, pero no bancarios (caso práctico 3).",
      "Solo los intermediarios bancarios pueden crear dinero."
    ],
    trampaExamen: "Test, pregunta 3: ¿quiénes pueden crear dinero? Los bancarios, no \"todos\".",
    pregunta: {
      enunciado: "¿Quiénes pueden crear dinero?",
      opciones: [
        "Los no bancarios",
        "Los bancarios",
        "Ninguno"
      ],
      indiceCorrecta: 1,
      explicacion: "Pregunta 3 del test."
    }
  },
  {
    id: "transformacion",
    seccionId: "3.3B",
    nombre: "Vía directa e intermediada: la transformación",
    iconos: [
      "arrow",
      "bank"
    ],
    color: "#a78bfa",
    definicion: "<b>Vía directa:</b> las unidades con superávit aportan fondos directamente; no hay transformación de activos. <b>Vía intermediada:</b> hay transformación: lo que recibe quien pide no tiene nada que ver con lo que entregó quien ahorra.",
    ejemploReal: "Tu depósito disponible acaba convertido en una hipoteca a 30 años.",
    explicaciones: [
      "Entra trigo, sale pan.",
      "El banco recoge tu dinero de una forma y lo presta de otra distinta.",
      "Depósito (corto, a la vista) ─▶ 🏦 ─▶ Préstamo (largo)",
      "Mediación (poner en contacto) ≠ transformación (cambiar el activo). Los bancos hacen las dos (pág. 22).",
      "En la vía intermediada se produce transformación de los activos financieros."
    ],
    trampaExamen: "Pregunta típica: ¿qué doble tarea hacen hoy los bancos? Mediación y transformación.",
    pregunta: {
      enunciado: "¿En qué vía se transforman los activos?",
      opciones: [
        "Directa",
        "Intermediada"
      ],
      indiceCorrecta: 1,
      explicacion: "El intermediario cambia el activo."
    }
  },
  {
    id: "carac-int",
    seccionId: "3.3C",
    nombre: "Características de los intermediarios",
    iconos: [
      "people",
      "shield"
    ],
    color: "#ff8a3d",
    definicion: "Facilitan la mediación; <b>captan a corto plazo</b> (cuentas, depósitos) y <b>prestan a largo</b> (préstamos, obligaciones); <b>reducen el riesgo diversificando</b>; cobran comisión o margen; y transmiten información de confianza que agiliza las operaciones.",
    ejemploReal: "Un banco con miles de clientes reparte el riesgo entre muchos préstamos (actividad 19).",
    explicaciones: [
      "No poner todos los huevos en la misma cesta: el intermediario tiene muchas cestas.",
      "Recogen dinero que puede salir pronto y lo prestan para mucho tiempo, repartiéndolo para no jugárselo todo a una carta.",
      "Captan ⏱️ corto → prestan 🏔️ largo · reparten el riesgo 🧺",
      "Reducen el riesgo, pero no lo eliminan: siempre está presente (pág. 17).",
      "Permiten reducir el riesgo diversificando las carteras de inversión."
    ],
    trampaExamen: "\"Minimizan el riesgo, pero este está permanentemente presente.\" Si una opción dice que lo eliminan, es falsa.",
    pregunta: {
      enunciado: "Los intermediarios captan a ___ y prestan a ___",
      opciones: [
        "Largo / corto",
        "Corto / largo",
        "Corto / corto"
      ],
      indiceCorrecta: 1,
      explicacion: "Captan con depósitos, prestan con préstamos."
    }
  },
  {
    id: "bce",
    seccionId: "4.1",
    nombre: "Banco Central Europeo (BCE)",
    iconos: [
      "brain",
      "euro"
    ],
    color: "#60a5fa",
    definicion: "Banco central de los países de la UE que han adoptado el euro. Mantiene la <b>estabilidad de precios</b> (el poder adquisitivo del euro) e instrumenta la política monetaria. Da la <b>autorización final para crear nuevas entidades de crédito</b>.",
    ejemploReal: "Sede en Frankfurt. Presidenta desde el 1-11-2019: Christine Lagarde, mandato de 8 años no renovable. El libro dice 20 países: ⚠ dato del libro, puede haber cambiado (desde el 1-1-2026 Bulgaria usa el euro y son 21).",
    explicaciones: [
      "El cerebro que manda sobre el euro.",
      "Es el jefe del euro: cuida que las cosas no se encarezcan demasiado.",
      "🧠 BCE ⊂ Eurosistema ⊂ SEBC",
      "BCE (una institución) ≠ Eurosistema (BCE + bancos centrales del euro).",
      "BCE: banco central de los países de la UE que han adoptado el euro."
    ],
    trampaExamen: "Comprueba 2: ¿quién autoriza crear un banco nuevo? El BCE, a propuesta e informe del Banco de España.",
    pregunta: {
      enunciado: "¿Quién da la autorización final para crear un banco?",
      opciones: [
        "Banco de España",
        "BCE",
        "CNMV"
      ],
      indiceCorrecta: 1,
      explicacion: "A propuesta e informe del Banco de España."
    }
  },
  {
    id: "eurosistema",
    seccionId: "4.1",
    nombre: "Eurosistema",
    iconos: [
      "brain",
      "bank"
    ],
    color: "#60a5fa",
    definicion: "Autoridad monetaria de la eurozona: <b>el BCE más los bancos centrales nacionales de los países con euro</b>. Define y diseña la política monetaria y autoriza la emisión de billetes y monedas.",
    ejemploReal: "El Banco de España forma parte del Eurosistema.",
    explicaciones: [
      "El cerebro (BCE) rodeado de su equipo del euro.",
      "El jefe del euro junto con los bancos centrales de cada país que usa euros.",
      "🧠 BCE + 🏦🇪🇸 🏦🇫🇷 🏦🇩🇪… (solo países con euro)",
      "Eurosistema = solo países con euro. SEBC = toda la UE.",
      "Eurosistema: BCE + bancos centrales de los Estados miembros que tienen el euro."
    ],
    trampaExamen: "Desde el euro, la política monetaria de España la define el Eurosistema, no el Banco de España.",
    pregunta: {
      enunciado: "¿Quién define hoy la política monetaria de España?",
      opciones: [
        "Banco de España",
        "Eurosistema",
        "Gobierno"
      ],
      indiceCorrecta: 1,
      explicacion: "El Banco de España colabora."
    }
  },
  {
    id: "sebc",
    seccionId: "4.1",
    nombre: "Sistema Europeo de Bancos Centrales (SEBC)",
    iconos: [
      "globe",
      "link"
    ],
    color: "#a78bfa",
    definicion: "El BCE más los bancos centrales de <b>todos los países de la UE</b>, tengan o no el euro. Mantiene la estabilidad de precios y apoya las políticas económicas de la Comunidad.",
    ejemploReal: "El banco central de Suecia está en el SEBC, pero no en el Eurosistema.",
    explicaciones: [
      "Toda la plantilla europea: titulares (con euro) y suplentes (sin euro).",
      "Es la red de todos los bancos centrales de la Unión Europea, usen euros o no.",
      "🌍 SEBC ⊃ Eurosistema ⊃ BCE",
      "La diferencia con el Eurosistema existe mientras haya países que conserven su moneda.",
      "SEBC: Sistema Europeo de Bancos Centrales."
    ],
    trampaExamen: "Test, pregunta 7: SEBC es \"Sistema Europeo de Bancos Centrales\", no \"del Banco Central\" ni \"Español\".",
    pregunta: {
      enunciado: "¿Qué significa SEBC?",
      opciones: [
        "Sistema Europeo del Banco Central",
        "Sistema Europeo de Bancos Centrales",
        "Sistema Español de Bancos Centrales"
      ],
      indiceCorrecta: 1,
      explicacion: "Pregunta 7 del test."
    }
  },
  {
    id: "mus",
    seccionId: "4.1",
    nombre: "Mecanismo Único de Supervisión (MUS)",
    iconos: [
      "eye",
      "bank"
    ],
    color: "#4ade80",
    definicion: "Supervisor bancario único de la zona euro, impulsado en 2012 y en funcionamiento desde el <b>4 de noviembre de 2014</b>. Vela por la seguridad y solidez de la banca europea. Cuatro elementos: <b>regulación, supervisión continuada, medidas correctoras y régimen sancionador</b>.",
    ejemploReal: "Inspecciones in situ a un gran banco español.",
    explicaciones: [
      "El ojo europeo sobre los bancos: reglamento, mirada, tarjeta amarilla y tarjeta roja.",
      "Es el vigilante que mira que los bancos de Europa no hagan locuras.",
      "👁️ MUS: Reglas → Vigilancia → Corrección → Sanción",
      "MUS vigila; MUR resuelve. Van siempre juntos.",
      "MUS: velar por la seguridad y solidez del sistema bancario europeo y aumentar la integración y estabilidad."
    ],
    trampaExamen: "Actividad 22: la finalidad del supervisor único. Fecha clave: 4-11-2014.",
    pregunta: {
      enunciado: "¿Desde cuándo funciona el MUS?",
      opciones: [
        "1-1-1999",
        "4-11-2014",
        "1-11-2019"
      ],
      indiceCorrecta: 1,
      explicacion: "4 de noviembre de 2014."
    }
  },
  {
    id: "mur",
    seccionId: "4.1",
    nombre: "Mecanismo Único de Resolución (MUR)",
    iconos: [
      "truck",
      "fire"
    ],
    color: "#ff5a5a",
    definicion: "Sistema de la UE que trabaja junto al MUS para <b>gestionar las crisis de entidades que no son viables</b>. Refuerza la confianza en el sector bancario.",
    ejemploReal: "La resolución ordenada de un banco con problemas graves.",
    explicaciones: [
      "Los bomberos de los bancos: cuando hay incendio, intervienen.",
      "Si un banco se pone muy malito, el MUR se encarga de solucionarlo sin que todo se hunda.",
      "🔥🏦 ──▶ 🚒 MUR",
      "MUS = \"te vigilo\". MUR = \"si hay incendio, intervengo\".",
      "MUR: gestiona las crisis de entidades que no sean viables."
    ],
    trampaExamen: "No confundas el MUR con el Fondo de Garantía: el FGD devuelve depósitos; el MUR resuelve la entidad.",
    pregunta: {
      enunciado: "¿Qué hace el MUR?",
      opciones: [
        "Supervisar bancos a diario",
        "Gestionar crisis de entidades no viables",
        "Garantizar 100.000 €"
      ],
      indiceCorrecta: 1,
      explicacion: "Resolución."
    }
  },
  {
    id: "otras-ue",
    seccionId: "4.1",
    nombre: "AES, Banco Mundial y FMI",
    iconos: [
      "globe",
      "shield"
    ],
    color: "#ffd23f",
    definicion: "<b>Autoridad Europea de Supervisión:</b> protege la estabilidad del sistema financiero europeo. <b>Banco Mundial:</b> desarrollo económico mundial y nivel de vida. <b>Fondo Monetario Internacional:</b> estabilidad del sistema monetario internacional.",
    ejemploReal: "Existen porque la política económica de un país influye en los demás.",
    explicaciones: [
      "Los vigilantes del vecindario: lo que hace un país salpica a los demás.",
      "Son organismos que cuidan la economía de Europa y del mundo.",
      "AES → Europa · BM → desarrollo mundial · FMI → estabilidad monetaria internacional",
      "Banco Mundial (desarrollo) ≠ FMI (estabilidad monetaria).",
      "Instituciones que controlan globalmente las economías de los países."
    ],
    trampaExamen: "Banco Mundial y FMI se intercambian en las opciones: desarrollo ↔ estabilidad.",
    pregunta: {
      enunciado: "¿Quién busca la estabilidad del sistema monetario internacional?",
      opciones: [
        "Banco Mundial",
        "FMI",
        "AES"
      ],
      indiceCorrecta: 1,
      explicacion: "El FMI."
    }
  },
  {
    id: "bde",
    seccionId: "4.2A",
    nombre: "Banco de España",
    iconos: [
      "vault",
      "key"
    ],
    color: "#60a5fa",
    definicion: "Banco central nacional, miembro del SEBC y del Eurosistema y <b>autoridad nacional de supervisión</b> (dentro del MUS desde 2014). Es un <b>intermediario atípico</b>: financia a las Administraciones públicas, no a familias. Lo regula la <b>Ley de Autonomía del Banco de España</b>.",
    ejemploReal: "Bajo su sede de Madrid hay una cámara acorazada a 36 metros que se inundaría ante un intento de asalto.",
    explicaciones: [
      "Una cámara acorazada con dos llaves: la europea (billetes, política monetaria del euro, divisas, reservas, pagos) y la nacional (supervisar solvencia, moneda metálica, tesorería y deuda pública, estadísticas, asesorar al Gobierno).",
      "Es el banco de los bancos en España: los vigila y ayuda al jefe europeo del euro.",
      "🔑 SEBC: billetes · política monetaria · divisas · reservas · pagos   |   🔑 Nacional: supervisión · moneda metálica · tesorería · estadística · asesorar",
      "Ya no hace la política monetaria: la define el Eurosistema y él colabora.",
      "Test 11: máxima autoridad en política monetaria en España, con autonomía respecto al Gobierno e integrada en el SEBC: el Banco de España."
    ],
    trampaExamen: "Billetes = función como miembro del SEBC; moneda metálica = función nacional.",
    pregunta: {
      enunciado: "\"Poner en circulación moneda metálica\" es función del Banco de España como…",
      opciones: [
        "Miembro del SEBC",
        "Banco central nacional"
      ],
      indiceCorrecta: 1,
      explicacion: "Los billetes son la función europea."
    }
  },
  {
    id: "estructura-b",
    seccionId: "4.2A",
    nombre: "Estructura del sector bancario",
    iconos: [
      "vault",
      "link"
    ],
    color: "#60a5fa",
    definicion: "Arriba, el Banco de España. Debajo, las <b>entidades de crédito</b>: entidades de depósito (bancos, cajas, cooperativas), ICO, entidades de dinero electrónico y EFC. Y <b>otras entidades</b>: sociedades de tasación, SGR, entidades de cambio de divisa y entidades de pago.",
    ejemploReal: "Es el esquema de la figura 1.19, que se completa en la actividad 33.",
    explicaciones: [
      "Un organigrama: el Banco de España es el director; las entidades de crédito, el equipo principal; las otras, los colaboradores.",
      "El Banco de España está arriba y vigila a todos los que tienen que ver con préstamos y depósitos.",
      "BdE → Entidades de crédito {depósito: bancos · cajas · cooperativas · ICO · EDE · EFC} + Otras {tasación · SGR · divisa · pago}",
      "Entidad de crédito ≠ entidad de depósito: el ICO y los EFC son de crédito pero no de depósito.",
      "Comprueba 3: entidades de depósito = bancos, cajas de ahorro y cooperativas de crédito."
    ],
    trampaExamen: "El ICO es entidad de crédito (test, pregunta 5), pero no de depósito.",
    pregunta: {
      enunciado: "Según el test del libro, es entidad de crédito…",
      opciones: [
        "El ICO",
        "Las compañías de seguros",
        "Las agencias de valores"
      ],
      indiceCorrecta: 0,
      explicacion: "Pregunta 5 del test."
    }
  },
  {
    id: "bancos",
    seccionId: "4.2A",
    nombre: "Bancos privados",
    iconos: [
      "ship",
      "people"
    ],
    color: "#ff8a3d",
    definicion: "<b>Sociedades anónimas con ánimo de lucro</b>: buscan el máximo beneficio y lo reparten entre sus propietarios (accionistas). Captan fondos con depósitos y emitiendo títulos de renta fija y variable, y prestan a empresas y Administraciones públicas.",
    ejemploReal: "Hacen doble tarea: mediación (poner en contacto a dos partes) y transformación (cambiar el activo).",
    explicaciones: [
      "Un barco pirata: el botín se reparte entre la tripulación, que son los accionistas.",
      "Es una empresa que guarda dinero y lo presta para ganar dinero para sus dueños.",
      "Depósitos ─▶ 🏴‍☠️ banco ─▶ préstamos   ·   beneficio ─▶ accionistas",
      "Su gemela es la caja de ahorro: hacen lo mismo, pero la caja no tiene ánimo de lucro.",
      "Bancos: sociedades anónimas con ánimo de lucro."
    ],
    trampaExamen: "La diferencia banco-caja es la pregunta más repetida del tema (actividad 30 y actividad final de la síntesis). Y ojo: a los dos los supervisa el Banco de España.",
    pregunta: {
      enunciado: "La principal diferencia entre bancos y cajas de ahorro es…",
      opciones: [
        "Que las cajas no prestan",
        "El ánimo de lucro",
        "El supervisor"
      ],
      indiceCorrecta: 1,
      explicacion: "Bancos: lucro. Cajas: fin social."
    }
  },
  {
    id: "cajas",
    seccionId: "4.2A",
    nombre: "Cajas de ahorro",
    iconos: [
      "chapel",
      "heart"
    ],
    color: "#ff4f8b",
    definicion: "Entidades de crédito <b>sin ánimo de lucro</b>, con forma jurídica de <b>fundación</b> y fines sociales. Sus beneficios no se reparten: se reinvierten en <b>obra social</b>. Su ámbito no supera una comunidad autónoma o un máximo de <b>10 provincias limítrofes</b>.",
    ejemploReal: "En el año 2000 había más de 40. Hoy solo quedan dos: <b>Caixa Ontinyent</b> y <b>Colonya Caixa Pollença</b>.",
    explicaciones: [
      "Una capilla con cepillo de limosna: lo que se recoge va a la comunidad. Y casi en ruinas: solo quedan dos.",
      "Funciona como un banco, pero lo que gana lo da a cosas buenas para la gente.",
      "⛪ caja ─▶ beneficios ─▶ ❤️ obra social (nunca a dueños)",
      "Muchas siguen llamándose \"Caja\" o \"Caixa\" y son bancos. Cajamar es una cooperativa.",
      "Cajas de ahorro: no tienen ánimo de lucro, sus fines son sociales."
    ],
    trampaExamen: "¿Cuántas quedan? Dos. ¿La Caja de Ingenieros o Cajamar son cajas de ahorro? No (Comprueba 30).",
    pregunta: {
      enunciado: "¿Cuántas cajas de ahorro quedan en España?",
      opciones: [
        "Más de 40",
        "2",
        "10"
      ],
      indiceCorrecta: 1,
      explicacion: "Caixa Ontinyent y Colonya Caixa Pollença."
    }
  },
  {
    id: "coop",
    seccionId: "4.2A",
    nombre: "Cooperativas de crédito",
    iconos: [
      "hive",
      "people"
    ],
    color: "#ffd23f",
    definicion: "Sociedades mercantiles privadas y cooperativas, con <b>número ilimitado de socios</b> y sin ánimo de lucro. Son entidades de depósito y sirven a las necesidades financieras de sus socios y de terceros. Deben destinar como mínimo el <b>20 % de beneficios al FRO</b> y al menos el <b>10 % al FEP</b>.",
    ejemploReal: "Tipos: cajas rurales (la mayoría), cajas populares y cajas profesionales. Patronal: UNACC (1970). Dependen del Ministerio de Trabajo y Economía Social y del de Economía (Banco de España).",
    explicaciones: [
      "Una colmena: el banco es de los socios que lo usan. El 20 % va al granero (reserva) y el 10 % a la escuela (educación).",
      "Es un banco que pertenece a la gente que lo usa, como un club.",
      "🐝 socios ilimitados · beneficios: 20 % FRO (reserva) + 10 % FEP (educación y promoción)",
      "Cooperativa ≠ caja de ahorro: la cooperativa es de sus socios; la caja, una fundación.",
      "Test 4: las sociedades cooperativas sirven a las necesidades financieras de sus socios mediante actividades de entidades de crédito."
    ],
    trampaExamen: "20 % al FRO y 10 % al FEP, no al revés.",
    pregunta: {
      enunciado: "Mínimo de beneficios al Fondo de Reserva Obligatorio:",
      opciones: [
        "10 %",
        "20 %",
        "50 %"
      ],
      indiceCorrecta: 1,
      explicacion: "20 % FRO, 10 % FEP."
    }
  },
  {
    id: "ico",
    seccionId: "4.2A",
    nombre: "Instituto de Crédito Oficial (ICO)",
    iconos: [
      "inst",
      "people"
    ],
    color: "#ff5a5a",
    definicion: "Entidad pública empresarial adscrita al Ministerio de Economía, Comercio y Empresa, con consideración de <b>agencia financiera del Estado</b>. Actúa como <b>banco público</b> (financiación a pymes y autónomos) y como <b>agencia financiera del Estado</b>. Sus deudas tienen garantía explícita, irrevocable, incondicional y directa del Estado.",
    ejemploReal: "Grupo ICO: ICO, Axis (capital riesgo) y Fundación ICO. Línea del libro para comercio minorista: hasta 150.000 €, sin comisiones salvo por amortización anticipada y con un año de carencia.",
    explicaciones: [
      "El banquero del pueblo: el banco del Estado que echa una mano a autónomos y pymes, con dos sombreros.",
      "Es el banco del Gobierno: presta a los pequeños negocios y ayuda cuando hay catástrofes.",
      "Banco público: mediación (riesgo: tu banco) · directa desde 10 M (riesgo: el ICO)   |   Agencia del Estado (el ICO no arriesga)",
      "No es banco privado ni supervisor: es una entidad de crédito pública.",
      "Su objetivo es facilitar a las pymes el acceso a la financiación bancaria."
    ],
    trampaExamen: "Líneas de mediación: el riesgo lo asume la entidad de crédito, no el ICO. Financiación directa: mínimo 10 millones.",
    pregunta: {
      enunciado: "En las líneas de mediación del ICO, el riesgo lo asume…",
      opciones: [
        "El ICO",
        "La entidad de crédito que tramita",
        "El Estado"
      ],
      indiceCorrecta: 1,
      explicacion: "El ICO solo asume riesgo en la financiación directa."
    }
  },
  {
    id: "ede",
    seccionId: "4.2A",
    nombre: "Entidades de dinero electrónico y de pago",
    iconos: [
      "phone",
      "card"
    ],
    color: "#a78bfa",
    definicion: "Emiten <b>dinero electrónico</b>: exigible a su emisor, almacenado en soporte electrónico y aceptado como medio de pago por entidades distintas de la emisora. <b>Ley 21/2011.</b> Las autoriza el <b>Banco de España</b>, previo informe del SEPBLAC.",
    ejemploReal: "⚠ dato del libro, puede haber cambiado: Bnext, MoneyToPay, PFS Card y Pecunia Cards. Entidades de pago (RDL 19/2018): Moneytrans y Safetypay.",
    explicaciones: [
      "Un monedero digital con alguien responsable detrás.",
      "Es dinero que vive en una tarjeta o en el móvil y con el que puedes pagar en muchas tiendas.",
      "📱 EDE ──€──▶ 🏪 otra empresa (Exigible · Electrónico · aceptado por Extraños)",
      "No es un banco tradicional, aunque los bancos también pueden emitir dinero electrónico.",
      "Comprueba 5: definir las EDE y poner dos ejemplos."
    ],
    trampaExamen: "Ley 21/2011 = dinero electrónico. RDL 19/2018 = entidades de pago. No las cruces.",
    pregunta: {
      enunciado: "¿Quién autoriza la creación de una EDE?",
      opciones: [
        "La CNMV",
        "El Banco de España, previo informe del SEPBLAC",
        "La DGSFP"
      ],
      indiceCorrecta: 1,
      explicacion: "Pág. 25 del libro."
    }
  },
  {
    id: "fgd",
    seccionId: "4.2A",
    nombre: "Fondo de Garantía de Depósitos",
    iconos: [
      "umbrella",
      "euro"
    ],
    color: "#4ade80",
    definicion: "Garantiza los depósitos en dinero (y valores) de las entidades de crédito hasta <b>100.000 € por titular y entidad</b>. Con el <b>Real Decreto Ley 16/2011</b>, los tres fondos (bancos, cajas, cooperativas) se unificaron en el FGDEC.",
    ejemploReal: "Tienes 150.000 € en un banco que quiebra: recuperas 100.000 €. Para clientes de ESI y gestoras de IIC existe el FOGAIN.",
    explicaciones: [
      "Un paraguas gigante con el rótulo \"100.000 €\": lo que sobresalga, se moja.",
      "Si tu banco se arruina, te devuelven tu dinero, pero como mucho 100.000 €.",
      "☂️ 100.000 € por titular y entidad · obligatorio para entidades españolas · voluntario para sucursales de la UE",
      "FGD (depósitos) ≠ FOGAIN (inversiones en ESI y gestoras de IIC).",
      "Garantiza los depósitos en dinero con un límite de 100.000 €."
    ],
    trampaExamen: "Test, pregunta 10: las opciones de 120.000 € o 150.000 € son trampas.",
    pregunta: {
      enunciado: "Límite del FGD por titular y entidad:",
      opciones: [
        "50.000 €",
        "100.000 €",
        "150.000 €"
      ],
      indiceCorrecta: 1,
      explicacion: "Pregunta 10 del test."
    }
  },
  {
    id: "fondo",
    seccionId: "4.2B",
    nombre: "Fondos de inversión",
    iconos: [
      "basket",
      "people"
    ],
    color: "#3ddbd9",
    definicion: "Patrimonio de varios inversores (partícipes), <b>sin personalidad jurídica</b>, dividido en participaciones. Lo administra una <b>sociedad gestora</b> y una <b>entidad depositaria</b> custodia los valores. Su precio diario es el <b>valor liquidativo = patrimonio ÷ número de participaciones</b>.",
    ejemploReal: "Caso práctico 5: 4 amigos ponen 10.000 € → 40 participaciones de 1.000 €. El fondo sube a 80.000 € → cada una vale 2.000 €.",
    explicaciones: [
      "Una cesta gigante donde mucha gente echa su dinero; un cocinero (gestora) decide qué comprar y un guardia (depositario) vigila la despensa.",
      "Muchas personas juntan su dinero y un experto lo invierte por todos.",
      "👥 partícipes ─▶ 🧺 fondo (👔 gestora · 🔐 depositario) ─▶ 📈 🏠 💶",
      "Fondo (sin personalidad jurídica) ≠ sociedad de inversión (sociedad anónima).",
      "Suscripción = comprar participaciones; reembolso = venderlas."
    ],
    trampaExamen: "El depositario puede ser un banco, una caja, una cooperativa o una sociedad de valores, siempre inscrito en la CNMV.",
    pregunta: {
      enunciado: "Valor liquidativo =",
      opciones: [
        "Participaciones ÷ patrimonio",
        "Patrimonio ÷ participaciones",
        "Patrimonio × participaciones"
      ],
      indiceCorrecta: 1,
      explicacion: "Se publica cada día."
    }
  },
  {
    id: "sociedad-inv",
    seccionId: "4.2B",
    nombre: "Sociedades de inversión: SICAV y SII",
    iconos: [
      "office",
      "people"
    ],
    color: "#a78bfa",
    definicion: "IIC con forma de <b>sociedad anónima</b>: por eso <b>no necesitan sociedad gestora</b>, pero <b>sí entidad depositaria</b>. <b>SICAV:</b> invierte en activos financieros; sus socios son accionistas y sus acciones suelen cotizar en bolsa. <b>SII:</b> compra inmuebles urbanos para alquilarlos.",
    ejemploReal: "La diferencia con los fondos está en la forma jurídica (pág. 27).",
    explicaciones: [
      "El fondo es una cesta; la sociedad, un edificio-empresa del que los inversores son dueños.",
      "Es como un fondo, pero convertido en empresa con nombre propio.",
      "🏢 SA (accionistas) · gestora ✖ · depositaria ✔   ·   SICAV 📈 / SII 🏠",
      "Fondo: gestora ✔ y depositaria ✔. Sociedad: solo depositaria.",
      "Comprueba 21: ¿necesitan gestora? No. ¿Depositaria? Sí."
    ],
    trampaExamen: "Las supervisa la CNMV (actividad 20h), no el Banco de España.",
    pregunta: {
      enunciado: "Una SICAV necesita…",
      opciones: [
        "Gestora y depositaria",
        "Solo depositaria",
        "Solo gestora"
      ],
      indiceCorrecta: 1,
      explicacion: "Es una sociedad anónima."
    }
  },
  {
    id: "sv",
    seccionId: "4.2B",
    nombre: "Sociedades de valores (dealers)",
    iconos: [
      "hands2",
      "chart"
    ],
    color: "#ff4f8b",
    definicion: "Empresas de servicios de inversión que operan <b>por cuenta ajena y por cuenta propia</b>: además de las órdenes de sus clientes, pueden obtener beneficios propios.",
    ejemploReal: "Ejecuta tu orden de compra y, a la vez, invierte su propio dinero.",
    explicaciones: [
      "Dos manos: con una trabaja para ti y con la otra para sí misma.",
      "Compra y vende acciones para sus clientes y también para ella.",
      "🤲 cuenta ajena + cuenta propia ─▶ 📈",
      "Su gemela es la agencia de valores (solo cuenta ajena).",
      "Sociedades de valores: operan tanto por cuenta ajena como por cuenta propia."
    ],
    trampaExamen: "\"Dos manos = sociedad; una flecha = agencia.\"",
    pregunta: {
      enunciado: "¿Quién puede operar por cuenta propia?",
      opciones: [
        "Agencia de valores",
        "Sociedad de valores"
      ],
      indiceCorrecta: 1,
      explicacion: "El dealer."
    }
  },
  {
    id: "av",
    seccionId: "4.2B",
    nombre: "Agencias de valores (brókeres)",
    iconos: [
      "arrow",
      "envelope"
    ],
    color: "#60a5fa",
    definicion: "Empresas de servicios de inversión que operan <b>únicamente por cuenta ajena</b>: reciben, transmiten y ejecutan las órdenes de sus clientes.",
    ejemploReal: "Le pides comprar 100 acciones y lleva tu orden al mercado.",
    explicaciones: [
      "Una flecha: lleva tu orden del cliente al mercado y nada más.",
      "Es un mensajero: lleva tus órdenes a la bolsa, pero no compra para él.",
      "👤 cliente ─📨─▶ 📈 mercado",
      "La sociedad de valores, además, opera por cuenta propia.",
      "Agencias de valores: operan únicamente por cuenta ajena."
    ],
    trampaExamen: "Actividad 42: diferencia entre bróker y dealer, con un ejemplo de cada uno.",
    pregunta: {
      enunciado: "La agencia de valores opera…",
      opciones: [
        "Solo por cuenta ajena",
        "Por cuenta propia y ajena"
      ],
      indiceCorrecta: 0,
      explicacion: "El bróker."
    }
  },
  {
    id: "esi-otras",
    seccionId: "4.2B",
    nombre: "Gestoras de carteras y EAF",
    iconos: [
      "people",
      "eye"
    ],
    color: "#ff8a3d",
    definicion: "También son empresas de servicios de inversión. <b>Gestoras de carteras:</b> reciben fondos y valores del cliente y compran o venden según la filosofía que él marca. <b>Empresas de asesoramiento financiero (EAF):</b> solo asesoran en inversión, fusiones y adquisiciones, e informes de análisis.",
    ejemploReal: "La EAF te hace un informe; la gestora de carteras mueve tu cartera.",
    explicaciones: [
      "La gestora conduce tu coche por la ruta que tú eliges; la EAF solo te da el mapa.",
      "Unos manejan tu dinero según tus instrucciones; otros solo te dan consejos.",
      "ESI = sociedades de valores · agencias de valores · gestoras de carteras · EAF",
      "Gestora de carteras ≠ sociedad gestora de un fondo de inversión.",
      "Las ESI las supervisa la CNMV."
    ],
    trampaExamen: "Son cuatro tipos de ESI. Si una opción dice que captan depósitos, es falsa.",
    pregunta: {
      enunciado: "¿Qué ESI solo asesora?",
      opciones: [
        "Gestora de carteras",
        "EAF",
        "Agencia de valores"
      ],
      indiceCorrecta: 1,
      explicacion: "Asesoramiento financiero."
    }
  },
  {
    id: "efc",
    seccionId: "4.2B",
    nombre: "Establecimientos financieros de crédito (EFC)",
    iconos: [
      "store",
      "car"
    ],
    color: "#ffd23f",
    definicion: "Entidades de crédito especializadas que <b>no pueden captar depósitos del público</b>. <b>Ley 5/2015</b> de Fomento de la Financiación Empresarial: condiciones parecidas a los bancos con menos capital. Operaciones: <b>leasing, factoring, confirming</b>, consumo, hipotecas, avales y tarjetas.",
    ejemploReal: "Leasing: alquilas una furgoneta con opción de compra. Factoring: cedes tus facturas para cobrar ya.",
    explicaciones: [
      "Una tienda de \"compra ahora, paga después\" que no tiene hucha para guardar tu dinero.",
      "Prestan dinero para cosas concretas, pero no te dejan guardar tu dinero con ellos.",
      "🏪 EFC: 🚗 leasing · 🧾➡️💰 factoring · confirming · consumo · tarjetas   |   🚫 depósitos",
      "EFC ≠ banco: los dos prestan, pero el EFC no capta depósitos.",
      "Obligaciones: informar al Banco de España, coeficiente de caja del BCE, coeficiente de garantía y normas con los clientes."
    ],
    trampaExamen: "Test, pregunta 6: son EFC las sociedades de arrendamiento financiero (leasing). Y los supervisa el Banco de España.",
    pregunta: {
      enunciado: "¿Qué tienen prohibido los EFC?",
      opciones: [
        "Dar créditos al consumo",
        "Captar depósitos del público",
        "Hacer leasing"
      ],
      indiceCorrecta: 1,
      explicacion: "Ley 5/2015."
    }
  },
  {
    id: "sgr",
    seccionId: "4.2B",
    nombre: "Sociedades de garantía recíproca (SGR)",
    iconos: [
      "handshake",
      "office"
    ],
    color: "#4ade80",
    definicion: "Sociedades mercantiles de capital variable que <b>conceden avales a sus socios, las pymes</b>, para que obtengan financiación bancaria en mejores condiciones. Están vinculadas a un territorio o sector y tienen un sistema de reaval (CERSA).",
    ejemploReal: "Una pyme no consigue el préstamo; la SGR la avala y el banco dice que sí.",
    explicaciones: [
      "El amigo que dice \"yo te avalo\" cuando el banco pregunta quién responde por ti.",
      "Las empresas pequeñas se juntan para responder unas por otras ante el banco.",
      "🏢 pyme ─▶ 🏦 banco ◀── 🤝 SGR \"yo te avalo\" ◀── CERSA (reaval)",
      "SGR (avala) ≠ EFC (presta).",
      "SGR: especializadas en otorgar garantías (avales) a sus socios."
    ],
    trampaExamen: "Sus socios son las pymes, no los bancos.",
    pregunta: {
      enunciado: "¿Quiénes son los socios de una SGR?",
      opciones: [
        "Los bancos",
        "Las pymes",
        "Los ahorradores"
      ],
      indiceCorrecta: 1,
      explicacion: "Recíproca: se avalan entre ellas."
    }
  },
  {
    id: "seguros",
    seccionId: "4.2B",
    nombre: "Compañías de seguros",
    iconos: [
      "shield",
      "house"
    ],
    color: "#ff4f8b",
    definicion: "Cubren los riesgos de bienes o personas: si ocurre el <b>siniestro</b>, pagan una <b>indemnización</b> a cambio de la <b>prima</b>. Son intermediarios <b>no bancarios</b>: la póliza no es medio de pago. Elementos: aseguradora, tomador, asegurado, beneficiario, póliza y mediadores.",
    ejemploReal: "Seguro de vida de tu padre a tu favor: él es el tomador, su vida es lo asegurado y tú el beneficiario.",
    explicaciones: [
      "Un escudo que pagas a plazos (prima) para que te proteja si algo pasa (siniestro).",
      "Pagas un poco cada mes y, si te pasa algo malo, te dan dinero.",
      "Tomador ─prima─▶ 🛡️ aseguradora ─indemnización─▶ beneficiario (si hay siniestro)",
      "Tomador (contrata y paga) ≠ asegurado (está expuesto) ≠ beneficiario (cobra).",
      "Actividad 45: define tomador, prima e indemnización."
    ],
    trampaExamen: "Son intermediarios financieros no bancarios (caso práctico 3), no \"otra cosa\".",
    pregunta: {
      enunciado: "Quien contrata el seguro y paga la prima es el…",
      opciones: [
        "Asegurado",
        "Tomador",
        "Beneficiario"
      ],
      indiceCorrecta: 1,
      explicacion: "Actividad 45."
    }
  },
  {
    id: "cnmv",
    seccionId: "4.2B",
    nombre: "CNMV",
    iconos: [
      "lens",
      "chart"
    ],
    color: "#ffd23f",
    definicion: "Comisión Nacional del Mercado de Valores: supervisa e inspecciona los <b>mercados de valores</b> (bolsa), las <b>empresas de servicios de inversión</b> y las <b>instituciones de inversión colectiva</b> (fondos y sociedades de inversión).",
    ejemploReal: "Las gestoras de fondos le informan periódicamente.",
    explicaciones: [
      "La gran lupa sobre la bolsa.",
      "Es quien vigila que nadie haga trampas en la bolsa.",
      "🔎📈 CNMV → bolsa · ESI · IIC",
      "CNMV (valores) ≠ Banco de España (entidades de crédito) ≠ DGSFP (seguros).",
      "La CNMV supervisa las sociedades de inversión (tabla 1.6)."
    ],
    trampaExamen: "Actividad 20: sociedades de inversión → CNMV.",
    pregunta: {
      enunciado: "¿Quién supervisa las SICAV?",
      opciones: [
        "Banco de España",
        "CNMV",
        "DGSFP"
      ],
      indiceCorrecta: 1,
      explicacion: "Tabla 1.6."
    }
  },
  {
    id: "dgsfp",
    seccionId: "4.2B",
    nombre: "DGSFP",
    iconos: [
      "shield",
      "elder"
    ],
    color: "#ff5a5a",
    definicion: "<b>Dirección General de Seguros y Fondos de Pensiones</b>, adscrita al Ministerio de Economía: supervisa las compañías aseguradoras y los fondos de pensiones.",
    ejemploReal: "Supervisa la idoneidad de los seguros que se venden en España (Comprueba 27).",
    explicaciones: [
      "Un escudo partido en dos: una casa (seguros) y una persona mayor (pensiones).",
      "Vigila a las empresas de seguros y a los planes para cuando te jubiles.",
      "🛡️ DGSFP → 🏠 seguros · 👴 pensiones",
      "La DGSFP supervisa; la aseguradora es supervisada.",
      "Supervisor de las compañías aseguradoras (tabla 1.6)."
    ],
    trampaExamen: "Actividad 20a: compañías aseguradoras → DGSFP.",
    pregunta: {
      enunciado: "¿Quién supervisa las aseguradoras?",
      opciones: [
        "CNMV",
        "DGSFP",
        "Banco de España"
      ],
      indiceCorrecta: 1,
      explicacion: "Tabla 1.6."
    }
  }
];
