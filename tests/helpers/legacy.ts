import { readFileSync } from 'node:fs';

/* Ejecuta en aislamiento las partes puras del prototipo legacy para comparar resultados. */

const html = readFileSync(new URL('../../legacy/ciudad-del-dinero-tema1.html', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

function trozo(desde: string, hasta: string, incluirInicio = true): string {
  const inicio = html.indexOf(desde);
  const fin = html.indexOf(hasta, inicio + desde.length);
  if (inicio < 0 || fin < 0) throw new Error(`Marcador no encontrado: ${desde}`);
  return html.slice(incluirInicio ? inicio : inicio + desde.length, fin);
}

export interface LegacyConcepto {
  id: string; s: string; n: string; ic: string[]; col: string;
  c: string; e: string; o: string[]; t: string; q: [string, string[], number, string];
}
export interface LegacyData {
  meta: { tema: number; titulo: string; ciudad: string; fuente: string };
  grupos: { id: string; t: string }[];
  secciones: { id: string; g: string; t: string; p: number; d: string }[];
  modos: string[];
  conceptos: LegacyConcepto[];
}
export interface LegacyEstado { dom: Record<string, number>; tries: Record<string, number> }

export interface LegacyMotor {
  DATA: LegacyData;
  G: Record<string, string>;
  icon: (ic: string[], col: string) => string;
  domC: (id: string) => number;
  domS: (sid: string) => number;
  domG: () => number;
  heat: (v: number) => string;
  pct: (v: number) => string;
  warn: (s: string) => string;
  ring: (v: number, size?: number) => string;
  pixelCity: () => string;
}

const fuente = [
  trozo('const DATA=', '\n/* ====='),
  trozo('const G=', '\nfunction icon('),
  trozo('function icon(', '\n/* ====='),
  'const SEC=DATA.secciones,CON=DATA.conceptos;',
  trozo('const domC=', '\nfunction buildRail('),
  trozo('function pixelCity(){', '\nfunction home(){'),
  'return {DATA,G,icon,domC,domS,domG,heat,pct,warn,ring,pixelCity};',
].join('\n');

/** Motor legacy con un estado `ST` inyectado (como si viniera de localStorage). */
export function motorLegacy(ST: LegacyEstado = { dom: {}, tries: {} }): LegacyMotor {
  return new Function('ST', fuente)(ST) as LegacyMotor;
}

/** Valores literales de la portada legacy. */
export const ciudadLegacy = {
  ids: new Function(`return ${trozo('const ids=', ';', false)}`)() as string[],
  alturas: new Function(`return ${trozo('const H=', ';', false)}`)() as number[],
  tejados: new Function(`return ${trozo('const roof=', ';', false)}`)() as string[],
};

/** Texto de la portada del prototipo, para comprobar que se conserva literalmente. */
export const htmlLegacy = html;
