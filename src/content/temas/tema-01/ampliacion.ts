// Ampliación del Tema 1 a partir de los apuntes del alumno (resumen de la Unidad 1 y predicción de
// examen que aportó el 02/10). No forma parte de DATA: el contenido del prototipo sigue intacto.
// Las preguntas extra son de práctica y no cambian el dominio.

import type { AmpliacionTema, BloqueExamen, EsquemaConcepto, Flashcard, NodoEsquema, PreguntaExtra } from '../../schema.ts';

const bloques: BloqueExamen[] = [
  {
    id: 'intermediarios',
    titulo: 'Intermediarios financieros (bancarios y no bancarios)',
    probabilidad: 30,
    formato: 'Es la parte con más peso del tema.',
    conceptoIds: [
      'intermediario', 'margen', 'tipos-int', 'transformacion', 'carac-int',
      'estructura-b', 'bancos', 'cajas', 'coop', 'ico', 'ede', 'fgd',
      'fondo', 'sociedad-inv', 'sv', 'av', 'esi-otras', 'efc', 'sgr', 'seguros',
    ],
    claves: [
      'Qué entidades pueden captar depósitos y crear dinero (bancarias) y cuáles no (no bancarias).',
      'Sociedad de Valores (dealer: cuenta propia y ajena) frente a Agencia de Valores (bróker: solo cuenta ajena).',
      'EFC: tienen prohibido captar depósitos; hacen leasing, factoring y confirming.',
      'Fondo de inversión (sin personalidad jurídica, gestora y depositaria) frente a sociedad de inversión (con personalidad jurídica, p. ej. SICAV).',
      'Límite del Fondo de Garantía de Depósitos (100.000 €) y líneas de mediación del ICO.',
    ],
  },
  {
    id: 'supervisores',
    titulo: 'Organismos supervisores (BCE, Banco de España, CNMV, DGSFP)',
    probabilidad: 25,
    formato: 'Pregunta fija en tipo test o en ejercicios de emparejamiento.',
    conceptoIds: ['bce', 'eurosistema', 'sebc', 'mus', 'mur', 'otras-ue', 'bde', 'cnmv', 'dgsfp'],
    claves: [
      'Quién vigila qué: Bolsa e IIC → CNMV; seguros y pensiones → DGSFP; banca y EFC → Banco de España.',
      'La autorización de nuevos bancos corresponde al BCE, a propuesta del Banco de España.',
      'Funciones del Banco de España como miembro del SEBC frente a sus funciones nacionales.',
    ],
  },
  {
    id: 'mercados',
    titulo: 'Clasificación de los mercados financieros',
    probabilidad: 20,
    formato: 'Suele caer con conceptos cruzados o preguntas de verdadero/falso.',
    conceptoIds: ['mercado', 'fase', 'activo', 'estructura-m', 'formalizacion', 'regulados-plazo', 'bolsas', 'caracteristicas-m', 'perfecto'],
    claves: [
      'Primario (activos nuevos, captación de fondos) frente a secundario (activos ya existentes, liquidez).',
      'Monetario frente a capitales: el criterio de los 18 meses y el riesgo.',
      'Las 5 características del mercado perfecto: libertad, profundidad, transparencia, flexibilidad y amplitud.',
      'SIBE / Mercado Continuo: unifica las 4 bolsas oficiales (Madrid, Barcelona, Bilbao y Valencia).',
    ],
  },
  {
    id: 'activos',
    titulo: 'Activos financieros y el trinomio rentabilidad–riesgo–liquidez',
    probabilidad: 15,
    formato: 'Relaciones entre variables y casos de Letras del Tesoro.',
    conceptoIds: ['instrumento', 'rrl'],
    claves: [
      'A mayor riesgo o menor liquidez, mayor rentabilidad exigida.',
      'Letras del Tesoro: emisión al descuento (se compran por debajo del nominal).',
    ],
  },
  {
    id: 'basicos',
    titulo: 'Conceptos básicos y flujo del dinero',
    probabilidad: 10,
    formato: 'Suelen caer al principio del examen, en preguntas de opción múltiple muy directas.',
    conceptoIds: ['sf', 'funciones', 'directa', 'indirecta', 'pagos'],
    claves: [
      'Identificar unidades con superávit (ahorradores) y con déficit (inversores).',
      'Intermediación directa frente a indirecta: quién asume el riesgo y qué es el margen de intermediación.',
    ],
  },
];

const P = (
  id: string,
  conceptoId: string,
  enunciado: string,
  opciones: string[],
  indiceCorrecta: number,
  explicacion: string,
): PreguntaExtra => ({ id, conceptoId, enunciado, opciones, indiceCorrecta, explicacion });

const preguntas: PreguntaExtra[] = [
  // Conceptos básicos
  P('sf-1', 'sf', '¿Qué es el sistema financiero?', ['El conjunto de bancos y cajas de un país', 'El conjunto de instituciones, medios y mercados que canalizan el ahorro hacia la inversión', 'El organismo que supervisa a los bancos'], 1, 'Instituciones, medios (activos) y mercados cuyo objetivo es canalizar el ahorro a la inversión.'),
  P('sf-2', 'sf', 'Una unidad económica cuyos gastos superan a sus ingresos es una unidad con…', ['Superávit', 'Déficit', 'Capacidad de financiación'], 1, 'Tiene necesidad de financiación: es una unidad con déficit (típico de empresas y sector público).'),
  P('sf-3', 'sf', '¿Qué unidades económicas suelen tener superávit?', ['Las economías domésticas (familias)', 'Las empresas', 'El sector público'], 0, 'Las familias suelen ingresar más de lo que gastan: tienen capacidad de financiación.'),
  P('funciones-1', 'funciones', '¿Cuál de estas NO es una función del sistema financiero?', ['Fomentar el ahorro', 'Sustentar el sistema de pagos', 'Fijar los salarios de los trabajadores'], 2, 'Funciones: viabilidad de proyectos, fomentar el ahorro, sistema de pagos, asignación eficiente, estabilidad y velar por las instituciones.'),
  P('funciones-2', 'funciones', 'Analizar si un proyecto de inversión es viable y rentable es una función del sistema financiero.', ['Verdadero', 'Falso'], 0, 'Es una de sus funciones: analizar la viabilidad y rentabilidad de los proyectos.'),
  P('directa-1', 'directa', 'En la intermediación directa, el riesgo de que el emisor no pague lo asume…', ['La entidad que intermedia', 'El ahorrador que compra el título', 'El Banco de España'], 1, 'El ahorrador adquiere directamente acciones o bonos: la entidad no asume el riesgo entre ellos.'),
  P('indirecta-1', 'indirecta', 'En la intermediación indirecta, ¿quién asume el riesgo de crédito?', ['El ahorrador', 'El banco', 'La empresa que pide el préstamo'], 1, 'El banco presta con el dinero depositado y asume el riesgo crediticio.'),
  P('indirecta-2', 'indirecta', 'El beneficio que obtiene el banco en la intermediación indirecta se llama…', ['Margen de intermediación', 'Prima', 'Valor liquidativo'], 0, 'Margen de intermediación: diferencia entre el tipo cobrado al prestatario y el pagado al ahorrador.'),
  P('pagos-1', 'pagos', 'Sustentar el sistema de pagos significa canalizar los fondos de forma…', ['Lenta pero segura', 'Rápida, segura y eficaz', 'Solo en efectivo'], 1, 'El sistema financiero hace que los fondos circulen de forma rápida, segura y eficaz.'),

  // Activos y trinomio
  P('instrumento-1', 'instrumento', 'Un activo financiero representa…', ['Un derecho para quien lo adquiere y una obligación para quien lo emite', 'Una obligación para quien lo adquiere', 'Un bien físico como un inmueble'], 0, 'Lo emiten las unidades con déficit: derecho para el comprador, obligación para el emisor.'),
  P('instrumento-2', 'instrumento', 'Las Letras del Tesoro se emiten…', ['Con cupones periódicos de interés', 'Al descuento: se compran por debajo del nominal', 'Siempre a más de 18 meses'], 1, 'No pagan cupones: se compran, por ejemplo, a 970 € y al vencimiento se cobran 1.000 €.'),
  P('instrumento-3', 'instrumento', 'Compras una Letra del Tesoro por 970 € y al vencimiento cobras 1.000 €. Los 30 € de diferencia son…', ['Una comisión del Estado', 'La rentabilidad bruta obtenida', 'Un impuesto'], 1, 'La diferencia entre precio de compra y nominal es la rentabilidad bruta.'),
  P('instrumento-4', 'instrumento', '¿A qué plazos emite el Estado las Letras del Tesoro?', ['3, 6, 9 o 12 meses', '2, 5 o 10 años', 'Solo a 18 meses'], 0, 'Son títulos de renta fija pública a corto plazo: 3, 6, 9 o 12 meses.'),
  P('rrl-1', 'rrl', '¿Qué propiedad mide la rapidez para convertir un activo en dinero sin perder valor?', ['Rentabilidad', 'Riesgo', 'Liquidez'], 2, 'Liquidez: rapidez y facilidad de conversión en dinero sin pérdidas.'),
  P('rrl-2', 'rrl', 'Si un activo tiene más riesgo o menos liquidez, la rentabilidad exigida es…', ['Mayor', 'Menor', 'La misma'], 0, 'El inversor exige compensación: a mayor riesgo o menor liquidez, mayor rentabilidad.'),
  P('rrl-3', 'rrl', 'El riesgo de un activo es…', ['La rapidez con la que se vende', 'La probabilidad de que el emisor no pague al vencimiento', 'Los intereses que genera'], 1, 'Riesgo: probabilidad de que, llegado el vencimiento, el emisor no haga frente al pago.'),

  // Mercados
  P('mercado-1', 'mercado', 'Un mercado financiero es…', ['Solo un edificio físico como la Bolsa', 'El punto de encuentro, físico o electrónico, donde se intercambian activos y se fijan sus precios', 'Un banco'], 1, 'Puede ser físico o electrónico; lo esencial es el intercambio y la fijación de precios.'),
  P('fase-1', 'fase', 'Una ampliación de capital en la que la empresa vende acciones nuevas se negocia en el mercado…', ['Primario', 'Secundario', 'OTC'], 0, 'Primario: activos de nueva creación, la empresa capta fondos directamente.'),
  P('fase-2', 'fase', 'La Bolsa, donde los inversores se compran y venden acciones ya existentes, es un mercado…', ['Primario', 'Secundario', 'Monetario'], 1, 'Secundario: activos ya existentes; aporta liquidez.'),
  P('activo-1', 'activo', 'Un activo con vencimiento a 6 meses se negocia en el mercado…', ['Monetario', 'De capitales', 'Primario siempre'], 0, 'Monetario: corto plazo (menos de 18 meses), bajo riesgo y alta liquidez.'),
  P('activo-2', 'activo', 'El mercado de capitales incluye…', ['Solo el mercado interbancario', 'La renta fija (AIAF) y la renta variable (Bolsa)', 'Solo las Letras del Tesoro'], 1, 'Capitales: medio y largo plazo; renta fija (AIAF) y renta variable (Bolsa).'),
  P('activo-3', 'activo', 'El Euríbor y el mercado interbancario pertenecen al mercado…', ['Monetario', 'De capitales', 'De seguros'], 0, 'Son ejemplos de mercado monetario (corto plazo).'),
  P('estructura-m-1', 'estructura-m', 'Según su estructura, los mercados se clasifican en…', ['Directos e intermediados', 'Públicos y privados', 'Nacionales y extranjeros'], 0, 'Criterio de estructura: directos frente a intermediados.'),
  P('formalizacion-1', 'formalizacion', 'Un mercado en el que las partes fijan libremente las reglas del intercambio es…', ['Organizado', 'OTC (no organizado)', 'Regulado'], 1, 'OTC (Over The Counter): reglas pactadas entre las partes.'),
  P('formalizacion-2', 'formalizacion', 'La Bolsa de valores es un mercado…', ['Organizado', 'OTC', 'Sin normas'], 0, 'Organizado: normas y reglamentos fijos.'),
  P('regulados-plazo-1', 'regulados-plazo', 'En un mercado al contado (spot) la entrega es…', ['Inmediata', 'En una fecha futura', 'Nunca se entrega'], 0, 'Spot: entrega inmediata. A plazo: futuros y opciones.'),
  P('bolsas-1', 'bolsas', '¿Cuántas bolsas oficiales hay en España?', ['Dos', 'Cuatro: Madrid, Barcelona, Bilbao y Valencia', 'Una'], 1, 'Cuatro bolsas oficiales, interconectadas por el SIBE.'),
  P('bolsas-2', 'bolsas', '¿Qué es el SIBE?', ['Un banco público', 'La plataforma que interconecta las cuatro bolsas (Mercado Continuo)', 'Un fondo de inversión'], 1, 'Sistema de Interconexión Bursátil Español: funcionan como un único mercado nacional.'),
  P('perfecto-1', 'perfecto', '¿Cuál NO es una característica del mercado perfecto?', ['Transparencia', 'Profundidad', 'Exclusividad'], 2, 'Las cinco: libertad, profundidad, transparencia, flexibilidad y amplitud.'),
  P('perfecto-2', 'perfecto', 'Que haya un número elevado de órdenes de compra y venta para cada activo es…', ['Profundidad', 'Amplitud', 'Libertad'], 0, 'Profundidad: muchas órdenes. Amplitud: muchos activos distintos.'),
  P('caracteristicas-m-1', 'caracteristicas-m', 'Que los precios reaccionen con rapidez ante cualquier cambio es…', ['Flexibilidad', 'Transparencia', 'Amplitud'], 0, 'Flexibilidad: capacidad de los precios para reaccionar rápido.'),

  // Supervisores
  P('bce-1', 'bce', '¿Quién da la autorización final para crear un nuevo banco en España?', ['El Banco de España', 'El BCE, a propuesta del Banco de España', 'La CNMV'], 1, 'El BCE autoriza; el Banco de España propone e informa.'),
  P('bce-2', 'bce', 'El objetivo prioritario del BCE es…', ['Maximizar beneficios', 'Mantener la estabilidad de precios', 'Supervisar las aseguradoras'], 1, 'Preservar el poder adquisitivo del euro e instrumentar la política monetaria.'),
  P('bce-3', 'bce', 'El mandato de la presidencia del BCE es de…', ['4 años renovables', '8 años no renovables', '6 años'], 1, 'Mandato de 8 años no renovable; sede en Frankfurt.'),
  P('eurosistema-1', 'eurosistema', 'El Eurosistema está formado por…', ['El BCE y los bancos centrales de todos los países de la UE', 'El BCE y los bancos centrales de los países que usan el euro', 'Solo el BCE'], 1, 'Eurosistema = BCE + bancos centrales de los países con euro.'),
  P('sebc-1', 'sebc', 'Un banco central de un país de la UE que no usa el euro forma parte del…', ['Eurosistema', 'SEBC', 'Ninguno de los dos'], 1, 'SEBC = BCE + bancos centrales de todos los Estados de la UE, con euro o sin él.'),
  P('mus-1', 'mus', '¿Quién lidera el Mecanismo Único de Supervisión?', ['El BCE', 'La CNMV', 'El Banco Mundial'], 0, 'El MUS está liderado por el BCE (funciona desde el 4 de noviembre de 2014).'),
  P('mur-1', 'mur', 'El MUR se encarga de…', ['Emitir billetes', 'Gestionar la resolución de las entidades de crédito no viables', 'Supervisar la Bolsa'], 1, 'Trabaja junto al MUS para resolver entidades que no son viables.'),
  P('bde-1', 'bde', '¿Cuál es una función del Banco de España como banco central NACIONAL?', ['Emitir billetes de curso legal', 'Supervisar la solvencia de las entidades de crédito y EFC', 'Definir la política monetaria de la zona euro'], 1, 'Supervisar es nacional; emitir billetes y la política monetaria son funciones como miembro del SEBC.'),
  P('bde-2', 'bde', '¿Quién pone en circulación la moneda metálica en España?', ['El Banco de España', 'El BCE', 'Los bancos privados'], 0, 'Es una de sus funciones como banco central nacional.'),
  P('bde-3', 'bde', 'Emitir billetes de curso legal es una función del Banco de España como…', ['Miembro del SEBC', 'Banco central nacional', 'Supervisor de seguros'], 0, 'Billetes, política monetaria, divisas, reservas y sistemas de pago: funciones como miembro del SEBC.'),
  P('cnmv-1', 'cnmv', 'Un fondo de inversión está supervisado por…', ['El Banco de España', 'La CNMV', 'La DGSFP'], 1, 'La CNMV supervisa mercados de valores, ESI e IIC (fondos y sociedades de inversión).'),
  P('cnmv-2', 'cnmv', 'Una agencia de valores (bróker) está supervisada por…', ['La CNMV', 'La DGSFP', 'El MUR'], 0, 'Las ESI (sociedades y agencias de valores) dependen de la CNMV.'),
  P('dgsfp-1', 'dgsfp', 'Un plan de pensiones contratado en la oficina de un banco lo supervisa…', ['El Banco de España, porque se vende en un banco', 'La DGSFP', 'La CNMV'], 1, 'La supervisión va por la naturaleza del producto, no por la oficina donde se vende.'),
  P('dgsfp-2', 'dgsfp', 'La DGSFP está adscrita al…', ['Ministerio de Economía', 'BCE', 'Banco de España'], 0, 'Órgano del Ministerio de Economía que supervisa seguros, reaseguros, mediadores y fondos de pensiones.'),

  // Intermediarios (estas seis se basan en el texto de DATA del propio concepto)
  P('intermediario-1', 'intermediario', 'Un intermediario financiero…', ['Media entre oferentes y demandantes de dinero y canaliza el ahorro', 'Solo vende acciones en Bolsa', 'Fija los tipos de interés del BCE'], 0, 'Ofrece garantías a ambos: al que presta y al que pide.'),
  P('margen-1', 'margen', '¿Cuál es el inconveniente de los intermediarios financieros?', ['Que no canalizan el ahorro', 'Que encarecen las operaciones', 'Que no ofrecen garantías'], 1, 'Ventajas: facilitan el acceso y canalizan el ahorro. Inconveniente: encarecen las operaciones.'),
  P('margen-2', 'margen', 'Un margen de intermediación elevado puede indicar que el sistema financiero es…', ['Ineficiente', 'Perfecto', 'Muy líquido'], 0, 'Un margen elevado puede indicar ineficiencia.'),
  P('transformacion-1', 'transformacion', '¿En qué vía se produce la transformación de los activos financieros?', ['En la vía directa', 'En la vía intermediada', 'En ninguna'], 1, 'En la intermediada, lo que recibe quien pide no tiene nada que ver con lo que entregó quien ahorra.'),
  P('carac-int-1', 'carac-int', 'Los intermediarios captan fondos a ___ plazo y prestan a ___ plazo.', ['Largo / corto', 'Corto / largo', 'Corto / corto'], 1, 'Captan a corto (cuentas, depósitos) y prestan a largo (préstamos, obligaciones).'),
  P('carac-int-2', 'carac-int', '¿Cómo reducen el riesgo los intermediarios?', ['Diversificando', 'Prestando solo a una empresa', 'Sin cobrar comisión'], 0, 'Reducen el riesgo diversificando las carteras de inversión.'),
  P('otras-ue-1', 'otras-ue', '¿Qué institución vela por la estabilidad del sistema monetario internacional?', ['El Banco Mundial', 'El Fondo Monetario Internacional', 'La Autoridad Europea de Supervisión'], 1, 'FMI: estabilidad monetaria internacional. Banco Mundial: desarrollo. AES: estabilidad del sistema financiero europeo.'),
  P('estructura-b-1', 'estructura-b', '¿Cuáles son las entidades de depósito?', ['Bancos, cajas de ahorro y cooperativas de crédito', 'ICO, EDE y EFC', 'SGR y sociedades de tasación'], 0, 'Entidades de depósito = bancos, cajas y cooperativas (todas bajo el Banco de España).'),
  P('tipos-int-1', 'tipos-int', '¿Quién puede crear dinero bancario?', ['Los intermediarios financieros bancarios', 'Las aseguradoras', 'Las sociedades de valores'], 0, 'Solo los bancarios captan depósitos y emiten medios de pago aceptados.'),
  P('bancos-1', 'bancos', 'Los bancos privados son…', ['Fundaciones sin ánimo de lucro', 'Sociedades anónimas con ánimo de lucro', 'Organismos públicos'], 1, 'Buscan el máximo beneficio para repartirlo entre sus accionistas.'),
  P('cajas-1', 'cajas', '¿Adónde destinan sus beneficios las cajas de ahorro?', ['A sus accionistas', 'A la obra social y a reservas', 'Al Estado'], 1, 'Naturaleza fundacional, sin ánimo de lucro, con fines sociales.'),
  P('cajas-2', 'cajas', 'El ámbito de actuación de una caja de ahorros no puede superar…', ['Una comunidad autónoma o 10 provincias limítrofes', 'Un municipio', 'La Unión Europea'], 0, 'Una CCAA o un máximo de 10 provincias limítrofes entre sí.'),
  P('coop-1', 'coop', 'Una cooperativa de crédito debe destinar al Fondo de Reserva Obligatorio (FRO) como mínimo…', ['El 10 % de sus beneficios', 'El 20 % de sus beneficios', 'El 50 % de sus beneficios'], 1, 'Mínimo 20 % al FRO y al menos 10 % al FEP.'),
  P('coop-2', 'coop', '¿Cuál es el tipo más numeroso de cooperativa de crédito?', ['Cajas rurales', 'Cajas profesionales', 'Cajas populares'], 0, 'Cajas rurales, populares y profesionales; las rurales son las más numerosas.'),
  P('ico-1', 'ico', 'En las líneas de mediación del ICO, ¿quién asume el riesgo?', ['El ICO', 'La entidad de crédito privada que tramita el préstamo', 'El Banco de España'], 1, 'En mediación, el banco tramita, estudia la viabilidad y asume el riesgo.'),
  P('ico-2', 'ico', 'En la financiación directa del ICO (proyectos de más de 10 millones de euros), el riesgo lo asume…', ['El ICO', 'El banco privado', 'Nadie'], 0, 'En la vía directa el ICO asume el riesgo.'),
  P('ico-3', 'ico', 'Como agencia financiera del Estado, el ICO…', ['Asume el riesgo de crédito', 'Gestiona fondos públicos sin asumir el riesgo', 'Capta depósitos'], 1, 'Gestiona fondos públicos asignados por el Gobierno (catástrofes, exportación, ayuda al desarrollo).'),
  P('ede-1', 'ede', '¿Quién autoriza la creación de una Entidad de Dinero Electrónico?', ['El Ministerio de Economía, previo informe del Banco de España y del SEPBLAC', 'La CNMV', 'La DGSFP'], 0, 'Reguladas por la Ley 21/2011.'),
  P('fgd-1', 'fgd', '¿Hasta qué importe garantiza el Fondo de Garantía de Depósitos?', ['50.000 € por titular', '100.000 € por titular y entidad', 'Sin límite'], 1, 'Límite de 100.000 € por titular y entidad; adhesión obligatoria para las entidades españolas.'),
  P('fgd-2', 'fgd', 'Para las inversiones en ESI, el equivalente al FGD es…', ['El FOGAIN', 'El FRO', 'El SEPBLAC'], 0, 'FOGAIN: Fondo General de Garantía de Inversiones.'),
  P('fondo-1', 'fondo', 'Un fondo de inversión…', ['Tiene personalidad jurídica', 'No tiene personalidad jurídica y necesita gestora y depositaria', 'Solo necesita depositaria'], 1, 'Patrimonio de los partícipes sin personalidad jurídica: gestora y depositaria obligatorias.'),
  P('fondo-2', 'fondo', 'El valor liquidativo de un fondo se calcula…', ['Patrimonio del fondo ÷ número de participaciones en circulación', 'Número de partícipes × comisión', 'Beneficio ÷ número de gestoras'], 0, 'Es el precio diario de cada participación.'),
  P('fondo-3', 'fondo', 'En un fondo de inversión, ¿quién custodia los títulos y vigila a la gestora?', ['La entidad depositaria', 'Los partícipes', 'La CNMV directamente'], 0, 'Depositaria: banco, caja o sociedad de valores inscrita en la CNMV.'),
  P('sociedad-inv-1', 'sociedad-inv', 'Una sociedad de inversión (SICAV o SII)…', ['No necesita obligatoriamente gestora, pero sí depositaria', 'Necesita gestora pero no depositaria', 'No necesita ninguna de las dos'], 0, 'Es una sociedad anónima con personalidad jurídica propia.'),
  P('sociedad-inv-2', 'sociedad-inv', 'Una SII invierte en…', ['Acciones y bonos', 'Bienes inmuebles urbanos para arrendamiento', 'Letras del Tesoro'], 1, 'SII: inmobiliaria. SICAV: activos financieros.'),
  P('sv-1', 'sv', 'Una sociedad de valores (dealer) puede operar…', ['Solo por cuenta ajena', 'Por cuenta propia y por cuenta ajena', 'Solo por cuenta propia'], 1, 'El dealer opera por cuenta propia y ajena; el bróker, solo por cuenta ajena.'),
  P('av-1', 'av', 'Una agencia de valores (bróker)…', ['Solo opera por cuenta ajena', 'Opera por cuenta propia y ajena', 'Capta depósitos'], 0, 'Solo cuenta ajena: compra y vende en nombre de sus clientes.'),
  P('esi-otras-1', 'esi-otras', '¿Cuál de estas es una Empresa de Servicios de Inversión?', ['Una Empresa de Asesoramiento Financiero (EAF)', 'Una caja de ahorros', 'Una aseguradora'], 0, 'ESI: sociedades y agencias de valores, gestoras de carteras y EAF.'),
  P('efc-1', 'efc', '¿Qué diferencia esencial hay entre un banco y un EFC?', ['El EFC no puede conceder préstamos', 'El EFC tiene prohibido captar depósitos del público', 'El EFC no está supervisado'], 1, 'Ley 5/2015: los EFC no pueden captar depósitos.'),
  P('efc-2', 'efc', 'Ceder a una entidad el cobro de las facturas de tus clientes es…', ['Leasing', 'Factoring', 'Confirming'], 1, 'Factoring: cesión de cobros. Confirming: gestión de pagos a proveedores. Leasing: arrendamiento con opción de compra.'),
  P('efc-3', 'efc', 'El leasing es…', ['Un arrendamiento financiero con opción de compra', 'La gestión de pagos a proveedores', 'Un depósito a plazo'], 0, 'Arrendamiento financiero con opción de compra al final.'),
  P('sgr-1', 'sgr', 'Las sociedades de garantía recíproca sirven para…', ['Facilitar a las pymes el acceso a la financiación mediante avales', 'Captar depósitos', 'Supervisar a los bancos'], 0, 'Sociedades mercantiles de capital variable formadas por pymes que conceden avales.'),
  P('seguros-1', 'seguros', 'En un contrato de seguro, quien contrata la póliza y paga la prima es el…', ['Asegurado', 'Tomador', 'Beneficiario'], 1, 'Tomador: contrata y paga. Beneficiario: cobra la indemnización si hay siniestro.'),
  P('seguros-2', 'seguros', 'La persona que recibe la indemnización en caso de siniestro es el…', ['Beneficiario', 'Tomador', 'Asegurador'], 0, 'El asegurador (la compañía) paga; el beneficiario cobra.'),
];

const F = (id: string, conceptoId: string, anverso: string, reverso: string): Flashcard => ({ id, conceptoId, anverso, reverso });

const flashcards: Flashcard[] = [
  F('f-sf', 'sf', 'Unidad con superávit', 'Sus ingresos superan a sus gastos: tiene capacidad de financiación (familias).'),
  F('f-sf2', 'sf', 'Unidad con déficit', 'Sus gastos superan a sus ingresos: necesita financiación (empresas y sector público).'),
  F('f-margen', 'indirecta', 'Margen de intermediación', 'Diferencia entre el tipo cobrado al prestatario y el pagado al ahorrador.'),
  F('f-activo', 'instrumento', 'Activo financiero', 'Derecho para quien lo adquiere, obligación para quien lo emite.'),
  F('f-letras', 'instrumento', 'Letras del Tesoro', 'Renta fija pública a 3, 6, 9 o 12 meses, emitida al descuento.'),
  F('f-rrl', 'rrl', 'Relación del trinomio', 'A mayor riesgo o menor liquidez, mayor rentabilidad exigida.'),
  F('f-monetario', 'activo', 'Mercado monetario frente a capitales', 'Monetario: menos de 18 meses. Capitales: más de 18 meses (AIAF y Bolsa).'),
  F('f-primario', 'fase', 'Primario frente a secundario', 'Primario: activos nuevos. Secundario: activos ya existentes (Bolsa).'),
  F('f-otc', 'formalizacion', 'Mercado OTC', 'No organizado: las partes fijan libremente las reglas.'),
  F('f-sibe', 'bolsas', 'SIBE', 'Interconecta las 4 bolsas (Madrid, Barcelona, Bilbao, Valencia): Mercado Continuo.'),
  F('f-perfecto', 'perfecto', 'Mercado perfecto', 'Libertad, Profundidad, Transparencia, Flexibilidad y Amplitud.'),
  F('f-bce', 'bce', 'Autorización de nuevos bancos', 'El BCE, a propuesta e informe del Banco de España.'),
  F('f-bce2', 'bce', 'Mandato de la presidencia del BCE', '8 años, no renovable. Sede: Frankfurt.'),
  F('f-euro', 'eurosistema', 'Eurosistema', 'BCE + bancos centrales de los países con euro.'),
  F('f-sebc', 'sebc', 'SEBC', 'BCE + bancos centrales de todos los países de la UE.'),
  F('f-mus', 'mus', 'MUS', 'Supervisión bancaria europea liderada por el BCE, desde el 4/11/2014.'),
  F('f-bde', 'bde', 'Banco de España: funciones nacionales', 'Supervisar solvencia (entidades de crédito y EFC), moneda metálica, tesorería y deuda pública, estadísticas, asesorar al Gobierno.'),
  F('f-bde2', 'bde', 'Banco de España: funciones como miembro del SEBC', 'Billetes, política monetaria, divisas, reservas y sistemas de pago.'),
  F('f-cnmv', 'cnmv', 'CNMV supervisa…', 'Mercados de valores (Bolsa), ESI e IIC.'),
  F('f-dgsfp', 'dgsfp', 'DGSFP supervisa…', 'Aseguradoras, reaseguradoras, mediadores de seguros y fondos de pensiones.'),
  F('f-cajas', 'cajas', 'Cajas de ahorro que quedan', 'Caixa Ontinyent y Colonya Caixa Pollença.'),
  F('f-coop', 'coop', 'Cooperativas: reparto de beneficios', 'Mínimo 20 % al FRO y al menos 10 % al FEP.'),
  F('f-ico', 'ico', 'ICO: mediación frente a directa', 'Mediación: el banco asume el riesgo. Directa (> 10 M€): el ICO asume el riesgo.'),
  F('f-ede', 'ede', 'EDE: ley y autorización', 'Ley 21/2011. Autoriza el Ministerio de Economía, previo informe del BdE y del SEPBLAC.'),
  F('f-fgd', 'fgd', 'Fondo de Garantía de Depósitos', '100.000 € por titular y entidad (RDL 16/2011). Para ESI: FOGAIN.'),
  F('f-fondo', 'fondo', 'Valor liquidativo', 'Patrimonio del fondo ÷ número de participaciones en circulación.'),
  F('f-fondo2', 'fondo', 'Fondo de inversión', 'Sin personalidad jurídica: gestora y depositaria obligatorias.'),
  F('f-sicav', 'sociedad-inv', 'SICAV frente a SII', 'SICAV: activos financieros. SII: inmuebles urbanos para alquilar. Depositaria obligatoria, gestora no.'),
  F('f-dealer', 'sv', 'Dealer frente a bróker', 'Sociedad de valores: cuenta propia y ajena. Agencia de valores: solo cuenta ajena.'),
  F('f-efc', 'efc', 'EFC', 'Ley 5/2015. Prohibido captar depósitos. Leasing, factoring, confirming, consumo, hipotecas y avales.'),
  F('f-sgr', 'sgr', 'SGR', 'Sociedades de pymes que conceden avales para acceder al crédito.'),
  F('f-seguros', 'seguros', 'Elementos del seguro', 'Tomador (contrata y paga), asegurador (compañía), asegurado (expuesto al riesgo), beneficiario (cobra).'),
];

const N = (texto: string, ...hijos: (string | NodoEsquema)[]): NodoEsquema => ({
  texto,
  hijos: hijos.length ? hijos.map((h) => (typeof h === 'string' ? { texto: h } : h)) : undefined,
});

const esquemas: EsquemaConcepto[] = [
  {
    conceptoId: 'sf',
    titulo: 'Flujo del dinero',
    raiz: N('Sistema financiero', N('Unidades con superávit', 'Ingresos > gastos', 'Familias'), N('Unidades con déficit', 'Gastos > ingresos', 'Empresas y sector público'), N('Vías', 'Directa: el ahorrador asume el riesgo', 'Indirecta: el banco asume el riesgo y cobra el margen')),
  },
  {
    conceptoId: 'rrl',
    titulo: 'El trinomio',
    raiz: N('Activo financiero', 'Rentabilidad: intereses o beneficios', 'Riesgo: que el emisor no pague', 'Liquidez: convertirlo en dinero sin perder valor', '↑ riesgo o ↓ liquidez ⇒ ↑ rentabilidad exigida'),
  },
  {
    conceptoId: 'mercado',
    titulo: 'Clasificación de los mercados',
    raiz: N('Mercados financieros', 'Fase: primario / secundario', 'Activo: monetario (< 18 meses) / capitales (> 18 meses)', 'Formalización: organizado / OTC', 'Intervención: regulado / no regulado', 'Entrega: spot / a plazo', 'Estructura: directo / intermediado'),
  },
  {
    conceptoId: 'bolsas',
    titulo: 'Mercado bursátil español',
    raiz: N('SIBE (Mercado Continuo)', 'Bolsa de Madrid', 'Bolsa de Barcelona', 'Bolsa de Bilbao', 'Bolsa de Valencia'),
  },
  {
    conceptoId: 'bce',
    titulo: 'Supervisión europea',
    raiz: N('Unión Europea', N('SEBC', N('Eurosistema', 'BCE', 'Bancos centrales de los países con euro'), 'Bancos centrales de los países sin euro'), N('Unión bancaria', 'MUS: supervisión (liderada por el BCE)', 'MUR: resolución de entidades no viables')),
  },
  {
    conceptoId: 'bde',
    titulo: 'Funciones del Banco de España',
    raiz: N('Banco de España', N('Como miembro del SEBC', 'Emitir billetes', 'Política monetaria de la zona euro', 'Operaciones de divisas', 'Reservas oficiales', 'Sistemas de pago'), N('Como banco central nacional', 'Supervisar solvencia (entidades de crédito y EFC)', 'Moneda metálica', 'Tesorería y agente de la deuda pública', 'Estadísticas', 'Asesorar al Gobierno')),
  },
  {
    conceptoId: 'cnmv',
    titulo: 'Quién vigila qué',
    raiz: N('Supervisión en España (por producto, no por oficina)', N('Banco de España', 'Bancos, cajas, cooperativas, ICO', 'EFC, EDE, SGR, tasación, divisas, pago'), N('CNMV', 'Bolsa y mercados de valores', 'ESI', 'IIC (fondos y sociedades de inversión)'), N('DGSFP', 'Aseguradoras y reaseguradoras', 'Mediadores de seguros', 'Fondos de pensiones')),
  },
  {
    conceptoId: 'estructura-b',
    titulo: 'Intermediarios bancarios',
    raiz: N('Captan depósitos y crean dinero bancario', 'Bancos privados: SA con ánimo de lucro', 'Cajas de ahorro: fundacionales, obra social', 'Cooperativas: 20 % FRO + 10 % FEP', 'ICO: banco público y agencia financiera', 'EDE: dinero electrónico (Ley 21/2011)', 'FGD: garantiza 100.000 €'),
  },
  {
    conceptoId: 'ico',
    titulo: 'Las dos vías del ICO',
    raiz: N('ICO', N('Banco público', 'Mediación: el banco tramita y asume el riesgo', 'Directa (> 10 M€): el ICO asume el riesgo'), N('Agencia financiera del Estado', 'Gestiona fondos públicos', 'No asume el riesgo')),
  },
  {
    conceptoId: 'tipos-int',
    titulo: 'Intermediarios no bancarios',
    raiz: N('No crean dinero ni captan depósitos', N('IIC', 'Fondos de inversión', 'SICAV y SII'), N('ESI', 'Sociedades de valores (dealers)', 'Agencias de valores (brókeres)', 'Gestoras de carteras y EAF'), 'EFC: leasing, factoring, confirming', 'SGR: avales a pymes', 'Compañías de seguros'),
  },
  {
    conceptoId: 'fondo',
    titulo: 'Fondo frente a sociedad de inversión',
    raiz: N('IIC', N('Fondo de inversión', 'Sin personalidad jurídica', 'Gestora obligatoria', 'Depositaria obligatoria'), N('Sociedad de inversión (SICAV, SII)', 'Sociedad anónima con personalidad jurídica', 'Gestora no obligatoria', 'Depositaria obligatoria')),
  },
  {
    conceptoId: 'seguros',
    titulo: 'El contrato de seguro',
    raiz: N('Seguro', 'Tomador: contrata y paga la prima', 'Asegurador: asume el riesgo y paga', 'Asegurado: persona o bien expuesto', 'Beneficiario: cobra la indemnización'),
  },
];

export const ampliacion: AmpliacionTema = {
  fuente: 'Tus apuntes de la Unidad 1 (resumen y predicción de examen)',
  bloques,
  preguntas,
  flashcards,
  esquemas,
};
