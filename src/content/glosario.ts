/*
 * Glosario de la asignatura: siglas y términos que el alumno se encuentra antes de que el temario
 * los explique. El desarrollo de cada sigla está comprobado con el material (docs/fuentes, conceptos)
 * y con fuentes oficiales (ver docs/auditoria-tema2.md, §9); la explicación es una versión sencilla,
 * con un ejemplo cuando ayuda. Aprobado por el usuario el 11/10. No se incluye ninguna sigla cuyo
 * significado no se haya podido confirmar.
 */
export interface EntradaGlosario {
  /** Lo que aparece en el texto (la sigla o el término). */
  termino: string;
  /** Desarrollo de la sigla (solo en siglas). */
  desarrollo?: string;
  /** Explicación sencilla. */
  explica: string;
  ejemplo?: string;
  /** Ficha del Tema 1 que lo trata a fondo. */
  conceptoId?: string;
  tema: 1 | 2;
  /** Otras formas en que aparece en el texto (plural, variantes). */
  formas?: string[];
}

const S = (termino: string, desarrollo: string, explica: string, extra: Partial<EntradaGlosario> = {}): EntradaGlosario => ({ termino, desarrollo, explica, tema: 1, ...extra });
const T = (termino: string, explica: string, extra: Partial<EntradaGlosario> = {}): EntradaGlosario => ({ termino, explica, tema: 1, ...extra });

export const GLOSARIO: readonly EntradaGlosario[] = [
  // ---- Tema 1 · siglas ----
  S('BCE', 'Banco Central Europeo', 'El banco central de los países de la UE que usan el euro: vigila que los precios sean estables.', { conceptoId: 'bce' }),
  S('BdE', 'Banco de España', 'El banco central español: forma parte del Eurosistema y supervisa a los bancos.', { conceptoId: 'bde' }),
  S('UE', 'Unión Europea', 'Los 27 países que comparten instituciones y mercado único; no todos usan el euro.'),
  S('SEBC', 'Sistema Europeo de Bancos Centrales', 'El club de todos los bancos centrales de la UE más el BCE, usen o no el euro.', { ejemplo: 'El banco central de Suecia está dentro aunque Suecia no usa el euro.', conceptoId: 'sebc' }),
  T('Eurosistema', 'La parte del SEBC que sí usa el euro: el BCE y los bancos centrales de esos países, como el Banco de España.', { conceptoId: 'eurosistema' }),
  S('MUS', 'Mecanismo Único de Supervisión', 'El inspector único de los bancos de la zona euro, dirigido por el BCE, desde el 4 de noviembre de 2014.', { ejemplo: 'Inspectores del MUS revisan las cuentas de un gran banco español.', conceptoId: 'mus' }),
  S('MUR', 'Mecanismo Único de Resolución', 'Actúa cuando un banco ya no se sostiene: decide cómo venderlo, partirlo o cerrarlo de forma ordenada, para proteger a los depositantes y que no lo pague el contribuyente.', { ejemplo: 'En 2017 el Banco Popular se vendió por 1 € al Banco Santander.', conceptoId: 'mur' }),
  S('AES', 'Autoridades Europeas de Supervisión', 'Tres agencias de la UE que fijan reglas comunes: la ABE para bancos, la AEVM para valores y mercados y la AESPJ para seguros y pensiones.', { conceptoId: 'otras-ue' }),
  S('ABE', 'Autoridad Bancaria Europea', 'Una de las tres AES: fija reglas comunes para los bancos de la UE.', { conceptoId: 'otras-ue' }),
  S('AEVM', 'Autoridad Europea de Valores y Mercados', 'Una de las tres AES: fija reglas comunes para los valores y los mercados de la UE.', { conceptoId: 'otras-ue' }),
  S('AESPJ', 'Autoridad Europea de Seguros y Pensiones de Jubilación', 'Una de las tres AES: fija reglas comunes para los seguros y las pensiones de la UE.', { conceptoId: 'otras-ue' }),
  S('FMI', 'Fondo Monetario Internacional', 'Organismo internacional que vela por la estabilidad monetaria de todo el mundo.', { conceptoId: 'otras-ue' }),
  S('BM', 'Banco Mundial', 'Organismo internacional que financia el desarrollo de los países; no confundir con el FMI.', { conceptoId: 'otras-ue' }),
  S('AIAF', 'Asociación de Intermediarios de Activos Financieros', 'El mercado español de renta fija privada: parte del mercado de capitales, junto a la bolsa.', { conceptoId: 'activo' }),
  S('SA', 'sociedad anónima', 'Empresa cuyo capital está dividido en acciones; sus dueños son los accionistas.'),
  S('CNMV', 'Comisión Nacional del Mercado de Valores', 'El vigilante de la bolsa, de las empresas de servicios de inversión y de los fondos.', { ejemplo: 'Si una empresa engaña sobre sus cuentas al salir a bolsa, la CNMV la sanciona.', conceptoId: 'cnmv' }),
  S('DGSFP', 'Dirección General de Seguros y Fondos de Pensiones', 'El vigilante de las aseguradoras y de los fondos de pensiones; depende del Ministerio de Economía, Comercio y Empresa.', { conceptoId: 'dgsfp' }),
  S('ICO', 'Instituto de Crédito Oficial', 'El banco público del Estado: presta a empresas, casi siempre a través de tu banco, y gestiona fondos públicos por encargo del Gobierno.', { conceptoId: 'ico' }),
  S('EFC', 'Establecimiento financiero de crédito', 'Empresa que presta pero no puede guardar los ahorros del público. Desde la Ley 5/2015 ya no es entidad de crédito.', { ejemplo: 'La financiera de un concesionario que te presta para el coche.', conceptoId: 'efc' }),
  S('EDE', 'Entidad de dinero electrónico', 'Empresa que convierte tu dinero en saldo electrónico para pagar con el móvil o con una tarjeta prepago.', { conceptoId: 'ede' }),
  S('SGR', 'Sociedad de garantía recíproca', 'Una sociedad de pymes que avala a sus socias ante el banco para que consigan préstamos en mejores condiciones.', { conceptoId: 'sgr' }),
  S('ESI', 'Empresa de servicios de inversión', 'Empresa que compra y vende valores por ti o te asesora: agencias y sociedades de valores, gestoras de carteras…'),
  S('IIC', 'Institución de inversión colectiva', 'Una hucha común de muchos inversores que gestionan profesionales: los fondos y las sociedades de inversión.', { conceptoId: 'fondo' }),
  S('SICAV', 'Sociedad de inversión de capital variable', 'Sociedad anónima que invierte en bolsa y en bonos el dinero de sus accionistas.', { conceptoId: 'sociedad-inv' }),
  S('SII', 'Sociedad de inversión inmobiliaria', 'Sociedad que compra pisos y locales urbanos para alquilarlos.', { conceptoId: 'sociedad-inv' }),
  S('EAF', 'Empresa de asesoramiento financiero', 'Empresa que te aconseja en qué invertir, pero no compra ni vende por ti.'),
  S('FGD', 'Fondo de Garantía de Depósitos', 'El seguro de tus ahorros: si tu banco quiebra, te devuelve hasta 100.000 € por titular y entidad.', { conceptoId: 'fgd' }),
  S('FGDEC', 'Fondo de Garantía de Depósitos de Entidades de Crédito', 'El fondo único que nació en 2011 (Real Decreto-ley 16/2011) al juntar los de bancos, cajas y cooperativas.', { conceptoId: 'fgd' }),
  S('FOGAIN', 'Fondo General de Garantía de Inversiones', 'El equivalente del FGD para clientes de empresas de servicios de inversión: hasta 100.000 € si la empresa quiebra. No cubre lo que pierdas en bolsa.'),
  S('SEPBLAC', 'Servicio Ejecutivo de la Comisión de Prevención del Blanqueo de Capitales e Infracciones Monetarias', 'El organismo que persigue el dinero sucio: antes de autorizar una entidad de dinero electrónico informa sobre el riesgo de blanqueo.'),
  S('CERSA', 'Compañía Española de Reafianzamiento', 'Empresa pública que avala a las SGR: si la pyme no paga, CERSA cubre a la SGR una parte de lo que pierde (el reaval).', { conceptoId: 'sgr' }),
  S('OTC', 'over the counter («sobre el mostrador»)', 'Operaciones pactadas a medida entre dos partes, fuera de la bolsa.'),
  S('SIBE', 'Sistema de Interconexión Bursátil Español', 'El sistema informático que une las bolsas españolas en un solo mercado continuo.'),
  S('FRO', 'Fondo de Reserva Obligatorio', 'Parte del beneficio que una cooperativa de crédito tiene que guardar como reserva.', { conceptoId: 'coop' }),
  S('FEP', 'Fondo de Educación y Promoción', 'Parte del beneficio que una cooperativa de crédito dedica a formación y promoción.', { conceptoId: 'coop' }),
  S('UNACC', 'Unión Nacional de Cooperativas de Crédito', 'La asociación que agrupa a las cooperativas de crédito españolas.'),
  S('CCAA', 'comunidades autónomas', 'Las 17 comunidades en que se organiza España, como Andalucía o Cataluña.'),
  S('RDL', 'Real Decreto-ley', 'Norma con rango de ley que aprueba el Gobierno por urgencia y que después convalida el Congreso.'),
  // ---- Tema 1 · términos ----
  T('intermediación', 'Hacer de puente para que el ahorro de unos llegue a quien lo necesita. Directa: tú compras el bono a la empresa. Indirecta: el banco recoge tu depósito y presta a la empresa.'),
  T('riesgo de crédito', 'El riesgo de que quien te debe dinero no te lo devuelva. Lo asume quien perdería el dinero si eso ocurre.', { ejemplo: 'Prestas 1.000 € a una pyme que cierra: pierde quien prestó.', formas: ['riesgo crediticio'] }),
  T('garantía explícita', 'El Estado se compromete por ley a pagar las deudas del ICO si el ICO no pudiera. Por eso los inversores le prestan barato.', { conceptoId: 'ico' }),
  T('línea de mediación', 'El ICO da dinero a tu banco para que te lo preste con las condiciones del ICO. El banco decide si te lo da y es él quien pierde si no pagas.', { conceptoId: 'ico', formas: ['líneas de mediación'] }),
  T('financiación directa', 'El ICO presta él mismo a la empresa, sin pasar por tu banco: si la empresa no paga, pierde el ICO.', { conceptoId: 'ico' }),
  T('entidad pública empresarial', 'Empresa del Estado que funciona casi como una privada.', { conceptoId: 'ico' }),
  T('agencia financiera del Estado', 'Quien gestiona dinero del Gobierno por encargo suyo: si sale mal, pierde el Estado.', { conceptoId: 'ico' }),
  T('aval', 'Compromiso de alguien de pagar si tú no pagas.', { formas: ['avales'] }),
  T('reaval', 'El aval del aval: alguien cubre a quien avaló si tiene que pagar.', { conceptoId: 'sgr' }),
  T('personalidad jurídica', 'Poder actuar como «persona» ante la ley: firmar contratos, tener bienes, demandar. Un fondo no la tiene; una sociedad sí.', { conceptoId: 'fondo' }),
  T('cuenta ajena', 'Operar con el dinero del cliente, siguiendo sus órdenes.', { conceptoId: 'av' }),
  T('cuenta propia', 'Operar con el dinero de la propia empresa.', { conceptoId: 'sv' }),
  T('emitir', 'Crear y vender por primera vez un título (un bono, una acción) para conseguir dinero.', { formas: ['emite', 'emiten', 'emisión'] }),
  T('bono', 'Un préstamo que haces a una empresa o al Estado a cambio de intereses.', { formas: ['bonos'] }),
  // ---- Tema 2 ----
  { termino: 'TIN', desarrollo: 'tipo de interés nominal', explica: 'El interés que anuncia el banco, sin contar cuántas veces se capitaliza en el año.', tema: 2 },
  { termino: 'TAE', desarrollo: 'tasa anual equivalente', explica: 'Lo que de verdad ganas o pagas en un año, contando la capitalización.', ejemplo: 'Un 4 % TIN con capitalización trimestral es un 4,06 % TAE.', tema: 2 },
  { termino: 'efecto', explica: 'Documento por el que alguien te pagará en una fecha, como una letra de cambio o un pagaré.', tema: 2, formas: ['efectos'] },
  { termino: 'remesa', explica: 'Un paquete de efectos que se lleva al banco a la vez para descontarlos.', tema: 2 },
  { termino: 'timbre', explica: 'Impuesto que grava el documento (el efecto).', tema: 2 },
  { termino: 'derecho de cobro', explica: 'Tener un papel que dice que alguien te debe dinero y te lo pagará en una fecha. Todavía no tienes el dinero, solo la promesa.', ejemplo: 'Vendes mercancía a un cliente y te firma un pagaré: tienes derecho a cobrar 6.000 € dentro de 45 días.', tema: 2 },
  { termino: 'pagaré', explica: 'Papel firmado en el que alguien promete pagarte una cantidad en una fecha concreta.', ejemplo: '«Pagaré 6.000 € el 15 de marzo».', tema: 2, formas: ['pagarés'] },
  { termino: 'letra', explica: 'Letra de cambio: papel parecido al pagaré con el que alguien se compromete a pagar una cantidad en una fecha.', tema: 2, formas: ['letras', 'letra de cambio'] },
  { termino: 'vencimiento', explica: 'El día en que hay que pagar lo que dice el papel. Antes de esa fecha, el dinero todavía no se puede cobrar.', tema: 2, formas: ['vence', 'vencen'] },
  { termino: 'nominal', explica: 'La cantidad que pone el papel: lo que se cobra el día del vencimiento.', ejemplo: 'Un pagaré de 6.000 € tiene un nominal de 6.000 €.', tema: 2 },
  { termino: 'efectivo', explica: 'Lo que recibes de verdad hoy si cobras antes de tiempo: el nominal menos lo que se queda el banco.', ejemplo: '6.000 € − 37,50 € = 5.962,50 €.', tema: 2 },
  { termino: 'descontar', explica: 'Llevar un pagaré o una letra al banco para cobrarlo antes de su fecha. El banco te adelanta el dinero y se queda una parte por esperar él.', tema: 2, formas: ['descuenta', 'descuentas', 'descontado'] },
  { termino: 'adelanta', explica: 'Te da hoy un dinero que tú ibas a cobrar más adelante.', tema: 2, formas: ['adelantar', 'adelanto'] },
  { termino: 'comisión', explica: 'Lo que cobra el banco por hacerte el servicio, aparte del descuento. Suele ser un porcentaje con un mínimo.', ejemplo: '1 % de 6.000 € = 60 € (como es más que el mínimo de 10 €, se cobran 60 €).', tema: 2, formas: ['comisiones'] },
  { termino: 'valor líquido', explica: 'Lo que te llega al final, cuando el banco ya ha restado el descuento, las comisiones y los gastos.', tema: 2, formas: ['líquido'] },
  { termino: 'año comercial', explica: 'Contar el año como si tuviera 360 días (12 meses de 30). Si el enunciado dice «año civil», son 365.', tema: 2, formas: ['comercial (360)'] },
];
