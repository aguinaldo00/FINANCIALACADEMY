window.DATOS = {
 "meta": {
  "numero": 1,
  "titulo": "El sistema financiero español",
  "ciudad": "La Ciudad del Dinero",
  "fuente": "Libro de texto CFGS Administración y Finanzas, Unidad 1"
 },
 "c": {
  "sf": {
   "nombre": "Sistema financiero y unidades económicas",
   "color": "#ffd23f",
   "definicion": "Conjunto de instituciones, medios (activos) y mercados que canaliza el ahorro de las unidades con superávit (les sobra: ahorradores) hacia las que tienen déficit (les falta: inversores). Las unidades económicas son familias, empresas y sector público.",
   "frase": "Sistema financiero = instituciones, medios y mercados cuyo objetivo es canalizar el ahorro a la inversión.",
   "esquema": "Superávit (familias) → [mercados · intermediarios · instrumentos] → Déficit (empresas, sector público)"
  },
  "funciones": {
   "nombre": "Las funciones del sistema financiero",
   "color": "#3ddbd9",
   "definicion": "Función esencial: canalizar los recursos de las unidades con superávit hacia las de déficit. Además: analizar la viabilidad de los proyectos, fomentar el ahorro, sustentar el sistema de pagos, asignar eficientemente los recursos, contribuir a la estabilidad monetaria y financiera, y velar por las instituciones.",
   "frase": "Función esencial: canalizar los recursos de las unidades con superávit hacia las unidades con déficit.",
   "esquema": "Viabilidad · Ahorro · Pagos · Asignación · Estabilidad · Vigilancia → \"Ve A Pagar A Este Vendedor\""
  },
  "directa": {
   "nombre": "Intermediación directa",
   "color": "#ff4f8b",
   "definicion": "Los agentes con déficit emiten instrumentos (bonos, acciones) y los agentes con superávit los compran. El ahorrador sabe a quién financia y asume el riesgo.",
   "frase": "Directa: entre agentes con déficit, que emiten instrumentos financieros, y agentes con superávit, que los adquieren.",
   "esquema": "Ahorrador ──€──▶ Empresa   ·   Ahorrador ◀──bono── Empresa"
  },
  "indirecta": {
   "nombre": "Intermediación indirecta",
   "color": "#60a5fa",
   "definicion": "El ahorrador deposita su excedente en el banco y el banco hace llegar ese dinero a quien tiene déficit. Ambos agentes no tienen contacto entre ellos.",
   "frase": "Indirecta: el agente con superávit ingresa su excedente en el banco y el banco lo hace llegar al agente con déficit.",
   "esquema": "Ahorrador ──depósito──▶ 🏦 ──préstamo──▶ Empresa"
  },
  "pagos": {
   "nombre": "Sistema de pagos",
   "color": "#3ddbd9",
   "definicion": "Conjunto de recursos mediante los cuales se transfiere dinero entre las instituciones financieras y de estas a los particulares. Las transacciones deben ser transparentes para que funcione.",
   "frase": "Sustentar el sistema de pagos: garantizar que las transacciones se realicen de forma segura y eficiente.",
   "esquema": "Banco A ⇄ Banco B ⇄ Particulares"
  },
  "instrumento": {
   "nombre": "Instrumento financiero",
   "color": "#ffd23f",
   "definicion": "Título emitido por las unidades económicas para dirigir el ahorro a la inversión. Es un derecho para quien lo posee y una obligación para quien lo emite.",
   "frase": "Instrumentos financieros: derecho para quien los posee y obligación para quien los emite.",
   "esquema": "Emisor (obligación) ──título──▶ Poseedor (derecho)"
  },
  "rrl": {
   "nombre": "Riesgo, liquidez y rentabilidad",
   "color": "#ff5a5a",
   "definicion": "Riesgo: probabilidad de que, al vencimiento, el emisor no pague. Liquidez: facilidad para convertirlo en dinero. Rentabilidad: capacidad de generar intereses.",
   "frase": "Las características principales de los instrumentos son el riesgo, la liquidez y la rentabilidad.",
   "esquema": "↑ riesgo o ↓ liquidez ⇒ ↑ rentabilidad exigida"
  },
  "mercado": {
   "nombre": "Mercado financiero",
   "color": "#3ddbd9",
   "definicion": "Lugar o punto de encuentro, físico o virtual, donde quienes demandan y quienes ofrecen activos financieros se ponen en contacto para intercambiarlos y fijar su precio.",
   "frase": "Mercado financiero: lugar o punto de encuentro donde se intercambian activos financieros y se fija su precio.",
   "esquema": "Oferentes ⇄ 📈 precio ⇄ Demandantes"
  },
  "fase": {
   "nombre": "Primario vs secundario",
   "color": "#ff4f8b",
   "definicion": "Según la fase de negociación. Primario: se adquieren activos de nueva creación, al emisor o mediante intermediarios. Secundario: se negocian activos ya emitidos, lo que les da movilidad.",
   "frase": "Primarios: activos de nueva creación. Secundarios: activos ya existentes; ej.: la bolsa de valores.",
   "esquema": "Emisor ─(primario)─▶ Inversor A ─(secundario)─▶ Inversor B"
  },
  "activo": {
   "nombre": "Monetario vs de capitales",
   "color": "#60a5fa",
   "definicion": "Según el tipo de activo. Monetario: vencimiento inferior a 18 meses, mucha liquidez y poco riesgo; ahí se fija el euríbor. De capitales: más de 18 meses; renta fija (AIAF) y renta variable (bolsa).",
   "frase": "Monetarios: vencimiento inferior a 18 meses. De capitales: superior a 18 meses.",
   "esquema": "⏱️ menos de 18 meses → monetario   ·   🏔️ más de 18 meses → capitales (AIAF / bolsa)"
  },
  "estructura-m": {
   "nombre": "Directo vs intermediado",
   "color": "#ff8a3d",
   "definicion": "Según la estructura del mercado. Directo: no hay intermediarios; comprador y vendedor buscan la contrapartida. Intermediado: un intermediario pone en contacto a las partes a cambio de una comisión.",
   "frase": "Directos: sin mediadores. Intermediados: con intermediarios que cobran comisión.",
   "esquema": "Directo: A ⇄ B   ·   Intermediado: A ⇄ 🤝 (comisión) ⇄ B"
  },
  "formalizacion": {
   "nombre": "Organizados vs OTC",
   "color": "#a78bfa",
   "definicion": "Según el grado de formalización. Organizados: se negocia con normas y reglamentos (bolsa, deuda pública anotada). No organizados u OTC: las partes fijan las reglas y no hay un sitio concreto.",
   "frase": "OTC: las partes que intervienen establecen las reglas de intercambio.",
   "esquema": "📋 reglas fijas → organizado   ·   🤝 reglas pactadas → OTC (over the counter)"
  },
  "regulados-plazo": {
   "nombre": "Regulados vs no regulados · Spot vs a plazo",
   "color": "#4ade80",
   "definicion": "Por intervención: en los regulados las autoridades intervienen en precio y número de activos; en los no regulados manda la oferta y la demanda (hoy la mayoría). Por plazo: al contado (spot), con entrega inmediata, o a plazo (futuros y opciones), para una fecha futura a precio fijado.",
   "frase": "Al contado: entrega inmediata. A plazo: futuros y opciones.",
   "esquema": "👮 regulado / 🌊 no regulado   ·   ⚡ spot / 📅 a plazo"
  },
  "bolsas": {
   "nombre": "Las 4 bolsas, el mercado continuo y el SIBE",
   "color": "#ffd23f",
   "definicion": "España tiene cuatro bolsas oficiales: Madrid, Barcelona, Bilbao y Valencia. El mercado continuo las interconecta para que funcionen como un único mercado, gracias a la plataforma electrónica SIBE (Sistema de Interconexión Bursátil Español).",
   "frase": "Mercado continuo: interconexión de las cuatro bolsas de valores mediante el SIBE.",
   "esquema": "🏛️ Madrid · 🏛️ Barcelona · 🏛️ Bilbao · 🏛️ Valencia ──▶ 🖥️ SIBE = mercado continuo"
  },
  "caracteristicas-m": {
   "nombre": "Las 5 características de los mercados",
   "color": "#ff4f8b",
   "definicion": "Libertad (sin barreras de entrada y salida), profundidad (muchas órdenes de compra y venta), transparencia (información fácil de obtener), flexibilidad (precios que reaccionan rápido) y amplitud (muchos activos negociados).",
   "frase": "Libertad, profundidad, transparencia, flexibilidad y amplitud.",
   "esquema": "L · P · T · F · A → \"Los Payasos Toman Fanta Ahora\""
  },
  "perfecto": {
   "nombre": "El mercado perfecto",
   "color": "#ffd23f",
   "definicion": "Modelo teórico con muchísimos oferentes y demandantes (nadie influye en el precio), tipo de interés sin variaciones, impuestos, margen e inflación nulos, entrada y salida libres e información igual para todos. No existe.",
   "frase": "No existe ningún mercado financiero perfecto: aparece como unidad de medida.",
   "esquema": "Mercado real ──comparar──▶ Mercado perfecto (L, P, T, F y A al máximo)"
  },
  "intermediario": {
   "nombre": "Intermediario financiero",
   "color": "#ff8a3d",
   "definicion": "Institución que media entre oferentes y demandantes de dinero y canaliza el ahorro hacia quien lo necesita. Ofrece garantías a ambos: al que presta, que recuperará su dinero con rentabilidad; al que pide, condiciones adaptadas.",
   "frase": "Instituciones que median entre oferentes y demandantes de dinero y canalizan el ahorro.",
   "esquema": "Oferentes ─▶ 🤝 intermediario ─▶ Demandantes"
  },
  "margen": {
   "nombre": "Margen, ventajas e inconvenientes",
   "color": "#4ade80",
   "definicion": "El margen de intermediación es el beneficio del intermediario: diferencia entre el tipo que cobra a los inversores y el que paga a los ahorradores. Ventajas: facilitan el acceso a los instrumentos y canalizan el ahorro. Inconveniente: encarecen las operaciones.",
   "frase": "Un margen elevado puede indicar que el sistema financiero es ineficiente.",
   "esquema": "Tipo cobrado (4 %) − tipo pagado (1 %) = margen (3 %)"
  },
  "tipos-int": {
   "nombre": "Bancarios vs no bancarios",
   "color": "#60a5fa",
   "definicion": "Bancarios: emiten instrumentos aceptados como medio de pago, es decir, crean dinero (ej.: bancos). No bancarios: emiten instrumentos con valor monetario que no son medio de pago (ej.: compañías de seguros).",
   "frase": "Solo los intermediarios bancarios pueden crear dinero.",
   "esquema": "💳 medio de pago → bancario   ·   📄 valor pero no paga → no bancario"
  },
  "transformacion": {
   "nombre": "Vía directa e intermediada: la transformación",
   "color": "#a78bfa",
   "definicion": "Vía directa: las unidades con superávit aportan fondos directamente; no hay transformación de activos. Vía intermediada: hay transformación: lo que recibe quien pide no tiene nada que ver con lo que entregó quien ahorra.",
   "frase": "En la vía intermediada se produce transformación de los activos financieros.",
   "esquema": "Depósito (corto, a la vista) ─▶ 🏦 ─▶ Préstamo (largo)"
  },
  "carac-int": {
   "nombre": "Características de los intermediarios",
   "color": "#ff8a3d",
   "definicion": "Facilitan la mediación; captan a corto plazo (cuentas, depósitos) y prestan a largo (préstamos, obligaciones); reducen el riesgo diversificando; cobran comisión o margen; y transmiten información de confianza que agiliza las operaciones.",
   "frase": "Permiten reducir el riesgo diversificando las carteras de inversión.",
   "esquema": "Captan ⏱️ corto → prestan 🏔️ largo · reparten el riesgo 🧺"
  },
  "bce": {
   "nombre": "Banco Central Europeo (BCE)",
   "color": "#60a5fa",
   "definicion": "Banco central de los países de la UE que han adoptado el euro. Mantiene la estabilidad de precios (el poder adquisitivo del euro) e instrumenta la política monetaria. Da la autorización final para crear nuevas entidades de crédito.",
   "frase": "BCE: banco central de los países de la UE que han adoptado el euro.",
   "esquema": "🧠 BCE ⊂ Eurosistema ⊂ SEBC"
  },
  "eurosistema": {
   "nombre": "Eurosistema",
   "color": "#60a5fa",
   "definicion": "Autoridad monetaria de la eurozona: el BCE más los bancos centrales nacionales de los países con euro. Define y diseña la política monetaria y autoriza la emisión de billetes y monedas.",
   "frase": "Eurosistema: BCE + bancos centrales de los Estados miembros que tienen el euro.",
   "esquema": "🧠 BCE + 🏦🇪🇸 🏦🇫🇷 🏦🇩🇪… (solo países con euro)"
  },
  "sebc": {
   "nombre": "Sistema Europeo de Bancos Centrales (SEBC)",
   "color": "#a78bfa",
   "definicion": "El BCE más los bancos centrales de todos los países de la UE, tengan o no el euro. Mantiene la estabilidad de precios y apoya las políticas económicas de la Comunidad.",
   "frase": "SEBC: Sistema Europeo de Bancos Centrales.",
   "esquema": "🌍 SEBC ⊃ Eurosistema ⊃ BCE"
  },
  "mus": {
   "nombre": "Mecanismo Único de Supervisión (MUS)",
   "color": "#4ade80",
   "definicion": "Supervisor bancario único de la zona euro, impulsado en 2012 y en funcionamiento desde el 4 de noviembre de 2014. Vela por la seguridad y solidez de la banca europea. Cuatro elementos: regulación, supervisión continuada, medidas correctoras y régimen sancionador.",
   "frase": "MUS: velar por la seguridad y solidez del sistema bancario europeo y aumentar la integración y estabilidad.",
   "esquema": "👁️ MUS: Reglas → Vigilancia → Corrección → Sanción"
  },
  "mur": {
   "nombre": "Mecanismo Único de Resolución (MUR)",
   "color": "#ff5a5a",
   "definicion": "Sistema de la UE que trabaja junto al MUS para gestionar las crisis de entidades que no son viables. Refuerza la confianza en el sector bancario.",
   "frase": "MUR: gestiona las crisis de entidades que no sean viables.",
   "esquema": "🔥🏦 ──▶ 🚒 MUR"
  },
  "otras-ue": {
   "nombre": "AES, Banco Mundial y FMI",
   "color": "#ffd23f",
   "definicion": "Autoridad Europea de Supervisión: protege la estabilidad del sistema financiero europeo. Banco Mundial: desarrollo económico mundial y nivel de vida. Fondo Monetario Internacional: estabilidad del sistema monetario internacional.",
   "frase": "Instituciones que controlan globalmente las economías de los países.",
   "esquema": "AES → Europa · BM → desarrollo mundial · FMI → estabilidad monetaria internacional"
  },
  "bde": {
   "nombre": "Banco de España",
   "color": "#60a5fa",
   "definicion": "Banco central nacional, miembro del SEBC y del Eurosistema y autoridad nacional de supervisión (dentro del MUS desde 2014). Es un intermediario atípico: financia a las Administraciones públicas, no a familias. Lo regula la Ley de Autonomía del Banco de España.",
   "frase": "Test 11: máxima autoridad en política monetaria en España, con autonomía respecto al Gobierno e integrada en el SEBC: el Banco de España.",
   "esquema": "🔑 SEBC: billetes · política monetaria · divisas · reservas · pagos   |   🔑 Nacional: supervisión · moneda metálica · tesorería · estadística · asesorar"
  },
  "estructura-b": {
   "nombre": "Estructura del sector bancario",
   "color": "#60a5fa",
   "definicion": "Arriba, el Banco de España. Debajo, las entidades de crédito: entidades de depósito (bancos, cajas, cooperativas), ICO, entidades de dinero electrónico y EFC. Y otras entidades: sociedades de tasación, SGR, entidades de cambio de divisa y entidades de pago.",
   "frase": "Comprueba 3: entidades de depósito = bancos, cajas de ahorro y cooperativas de crédito.",
   "esquema": "BdE → Entidades de crédito {depósito: bancos · cajas · cooperativas · ICO · EDE · EFC} + Otras {tasación · SGR · divisa · pago}"
  },
  "bancos": {
   "nombre": "Bancos privados",
   "color": "#ff8a3d",
   "definicion": "Sociedades anónimas con ánimo de lucro: buscan el máximo beneficio y lo reparten entre sus propietarios (accionistas). Captan fondos con depósitos y emitiendo títulos de renta fija y variable, y prestan a empresas y Administraciones públicas.",
   "frase": "Bancos: sociedades anónimas con ánimo de lucro.",
   "esquema": "Depósitos ─▶ 🏴‍☠️ banco ─▶ préstamos   ·   beneficio ─▶ accionistas"
  },
  "cajas": {
   "nombre": "Cajas de ahorro",
   "color": "#ff4f8b",
   "definicion": "Entidades de crédito sin ánimo de lucro, con forma jurídica de fundación y fines sociales. Sus beneficios no se reparten: se reinvierten en obra social. Su ámbito no supera una comunidad autónoma o un máximo de 10 provincias limítrofes.",
   "frase": "Cajas de ahorro: no tienen ánimo de lucro, sus fines son sociales.",
   "esquema": "⛪ caja ─▶ beneficios ─▶ ❤️ obra social (nunca a dueños)"
  },
  "coop": {
   "nombre": "Cooperativas de crédito",
   "color": "#ffd23f",
   "definicion": "Sociedades mercantiles privadas y cooperativas, con número ilimitado de socios y sin ánimo de lucro. Son entidades de depósito y sirven a las necesidades financieras de sus socios y de terceros. Deben destinar como mínimo el 20 % de beneficios al FRO y al menos el 10 % al FEP.",
   "frase": "Test 4: las sociedades cooperativas sirven a las necesidades financieras de sus socios mediante actividades de entidades de crédito.",
   "esquema": "🐝 socios ilimitados · beneficios: 20 % FRO (reserva) + 10 % FEP (educación y promoción)"
  },
  "ico": {
   "nombre": "Instituto de Crédito Oficial (ICO)",
   "color": "#ff5a5a",
   "definicion": "Entidad pública empresarial adscrita al Ministerio de Economía, Comercio y Empresa, con consideración de agencia financiera del Estado. Actúa como banco público (financiación a pymes y autónomos) y como agencia financiera del Estado. Sus deudas tienen garantía explícita, irrevocable, incondicional y directa del Estado.",
   "frase": "Su objetivo es facilitar a las pymes el acceso a la financiación bancaria.",
   "esquema": "Banco público: mediación (riesgo: tu banco) · directa desde 10 M (riesgo: el ICO)   |   Agencia del Estado (el ICO no arriesga)"
  },
  "ede": {
   "nombre": "Entidades de dinero electrónico y de pago",
   "color": "#a78bfa",
   "definicion": "Emiten dinero electrónico: exigible a su emisor, almacenado en soporte electrónico y aceptado como medio de pago por entidades distintas de la emisora. Ley 21/2011. Las autoriza el Banco de España, previo informe del SEPBLAC.",
   "frase": "Comprueba 5: definir las EDE y poner dos ejemplos.",
   "esquema": "📱 EDE ──€──▶ 🏪 otra empresa (Exigible · Electrónico · aceptado por Extraños)"
  },
  "fgd": {
   "nombre": "Fondo de Garantía de Depósitos",
   "color": "#4ade80",
   "definicion": "Garantiza los depósitos en dinero (y valores) de las entidades de crédito hasta 100.000 € por titular y entidad. Con el Real Decreto Ley 16/2011, los tres fondos (bancos, cajas, cooperativas) se unificaron en el FGDEC.",
   "frase": "Garantiza los depósitos en dinero con un límite de 100.000 €.",
   "esquema": "☂️ 100.000 € por titular y entidad · obligatorio para entidades españolas · voluntario para sucursales de la UE"
  },
  "fondo": {
   "nombre": "Fondos de inversión",
   "color": "#3ddbd9",
   "definicion": "Patrimonio de varios inversores (partícipes), sin personalidad jurídica, dividido en participaciones. Lo administra una sociedad gestora y una entidad depositaria custodia los valores. Su precio diario es el valor liquidativo = patrimonio ÷ número de participaciones.",
   "frase": "Suscripción = comprar participaciones; reembolso = venderlas.",
   "esquema": "👥 partícipes ─▶ 🧺 fondo (👔 gestora · 🔐 depositario) ─▶ 📈 🏠 💶"
  },
  "sociedad-inv": {
   "nombre": "Sociedades de inversión: SICAV y SII",
   "color": "#a78bfa",
   "definicion": "IIC con forma de sociedad anónima: por eso no necesitan sociedad gestora, pero sí entidad depositaria. SICAV: invierte en activos financieros; sus socios son accionistas y sus acciones suelen cotizar en bolsa. SII: compra inmuebles urbanos para alquilarlos.",
   "frase": "Comprueba 21: ¿necesitan gestora? No. ¿Depositaria? Sí.",
   "esquema": "🏢 SA (accionistas) · gestora ✖ · depositaria ✔   ·   SICAV 📈 / SII 🏠"
  },
  "sv": {
   "nombre": "Sociedades de valores (dealers)",
   "color": "#ff4f8b",
   "definicion": "Empresas de servicios de inversión que operan por cuenta ajena y por cuenta propia: además de las órdenes de sus clientes, pueden obtener beneficios propios.",
   "frase": "Sociedades de valores: operan tanto por cuenta ajena como por cuenta propia.",
   "esquema": "🤲 cuenta ajena + cuenta propia ─▶ 📈"
  },
  "av": {
   "nombre": "Agencias de valores (brókeres)",
   "color": "#60a5fa",
   "definicion": "Empresas de servicios de inversión que operan únicamente por cuenta ajena: reciben, transmiten y ejecutan las órdenes de sus clientes.",
   "frase": "Agencias de valores: operan únicamente por cuenta ajena.",
   "esquema": "👤 cliente ─📨─▶ 📈 mercado"
  },
  "esi-otras": {
   "nombre": "Gestoras de carteras y EAF",
   "color": "#ff8a3d",
   "definicion": "También son empresas de servicios de inversión. Gestoras de carteras: reciben fondos y valores del cliente y compran o venden según la filosofía que él marca. Empresas de asesoramiento financiero (EAF): solo asesoran en inversión, fusiones y adquisiciones, e informes de análisis.",
   "frase": "Las ESI las supervisa la CNMV.",
   "esquema": "ESI = sociedades de valores · agencias de valores · gestoras de carteras · EAF"
  },
  "efc": {
   "nombre": "Establecimientos financieros de crédito (EFC)",
   "color": "#ffd23f",
   "definicion": "Entidades de crédito especializadas que no pueden captar depósitos del público. Ley 5/2015 de Fomento de la Financiación Empresarial: condiciones parecidas a los bancos con menos capital. Operaciones: leasing, factoring, confirming, consumo, hipotecas, avales y tarjetas.",
   "frase": "Obligaciones: informar al Banco de España, coeficiente de caja del BCE, coeficiente de garantía y normas con los clientes.",
   "esquema": "🏪 EFC: 🚗 leasing · 🧾➡️💰 factoring · confirming · consumo · tarjetas   |   🚫 depósitos"
  },
  "sgr": {
   "nombre": "Sociedades de garantía recíproca (SGR)",
   "color": "#4ade80",
   "definicion": "Sociedades mercantiles de capital variable que conceden avales a sus socios, las pymes, para que obtengan financiación bancaria en mejores condiciones. Están vinculadas a un territorio o sector y tienen un sistema de reaval (CERSA).",
   "frase": "SGR: especializadas en otorgar garantías (avales) a sus socios.",
   "esquema": "🏢 pyme ─▶ 🏦 banco ◀── 🤝 SGR \"yo te avalo\" ◀── CERSA (reaval)"
  },
  "seguros": {
   "nombre": "Compañías de seguros",
   "color": "#ff4f8b",
   "definicion": "Cubren los riesgos de bienes o personas: si ocurre el siniestro, pagan una indemnización a cambio de la prima. Son intermediarios no bancarios: la póliza no es medio de pago. Elementos: aseguradora, tomador, asegurado, beneficiario, póliza y mediadores.",
   "frase": "Actividad 45: define tomador, prima e indemnización.",
   "esquema": "Tomador ─prima─▶ 🛡️ aseguradora ─indemnización─▶ beneficiario (si hay siniestro)"
  },
  "cnmv": {
   "nombre": "CNMV",
   "color": "#ffd23f",
   "definicion": "Comisión Nacional del Mercado de Valores: supervisa e inspecciona los mercados de valores (bolsa), las empresas de servicios de inversión y las instituciones de inversión colectiva (fondos y sociedades de inversión).",
   "frase": "La CNMV supervisa las sociedades de inversión (tabla 1.6).",
   "esquema": "🔎📈 CNMV → bolsa · ESI · IIC"
  },
  "dgsfp": {
   "nombre": "DGSFP",
   "color": "#ff5a5a",
   "definicion": "Dirección General de Seguros y Fondos de Pensiones, adscrita al Ministerio de Economía: supervisa las compañías aseguradoras y los fondos de pensiones.",
   "frase": "Supervisor de las compañías aseguradoras (tabla 1.6).",
   "esquema": "🛡️ DGSFP → 🏠 seguros · 👴 pensiones"
  }
 }
};
