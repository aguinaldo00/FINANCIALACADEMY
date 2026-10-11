/*
 * Correcciones de exactitud aprobadas por el usuario (11/10) sobre el contenido heredado del prototipo
 * (legacy/ciudad-del-dinero-tema1.html). La prueba de paridad aplica estas sustituciones al prototipo
 * y exige que el resultado sea exactamente el contenido actual: nada cambia sin quedar registrado aquí.
 */
export interface CorreccionConcepto {
  conceptoId: string;
  campo: 'definicion' | 'explicaciones' | 'trampaExamen';
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
    "despues": "Debajo, las <b>entidades de crédito</b>: entidades de depósito (bancos, cajas, cooperativas) e ICO. Y <b>otras entidades</b> que también supervisa: EFC, entidades de dinero electrónico, sociedades de tasación, SGR, entidades de cambio de divisa y entidades de pago. Ojo: el libro (figura 1.19) aún pone los EFC y las EDE entre las entidades de crédito, pero los EFC dejaron de serlo con la Ley 5/2015 y las EDE, con la Ley 21/2011.",
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
  }
];
