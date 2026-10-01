// Genera el contenido tipado del Tema 1 y los glifos a partir del prototipo legacy.
// Uso puntual: `npm run content:extract`. El prototipo no se modifica.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(resolve(root, 'legacy/ciudad-del-dinero-tema1.html'), 'utf8').replace(/\r\n/g, '\n');

function slice(startMarker, endMarker) {
  const start = html.indexOf(startMarker);
  const end = html.indexOf(endMarker, start);
  if (start < 0 || end < 0) throw new Error(`No encuentro ${startMarker}`);
  return html.slice(start + startMarker.length, end).trim().replace(/;$/, '');
}
const evaluate = (src) => new Function(`return (${src});`)();

const DATA = evaluate(slice('const DATA=', '\n/* ====='));
const G = evaluate(slice('const G=', '\nfunction icon('));
const cityIds = evaluate(slice('const ids=', '\n'));
const cityH = evaluate(slice('const H=', '\n'));
const cityRoof = evaluate(slice('const roof=', '\n'));

const ROOF = { ped: 'fronton', flag: 'bandera', ruin: 'ruina', barn: 'granero', dome: 'cupula', ant: 'antena', flat: 'plano' };
const ESQUEMA_INDEX = 2; // El prototipo pinta el modo 3 ("Esquema visual") como bloque .esq.

const tema = {
  meta: { numero: DATA.meta.tema, titulo: DATA.meta.titulo, ciudad: DATA.meta.ciudad, fuente: DATA.meta.fuente },
  grupos: DATA.grupos.map((g) => ({ id: g.id, titulo: g.t })),
  secciones: DATA.secciones.map((s) => ({ id: s.id, grupoId: s.g, titulo: s.t, pesoExamen: s.p, descripcion: s.d })),
  modos: DATA.modos.map((m, i) => ({ etiqueta: m, formato: i === ESQUEMA_INDEX ? 'esquema' : 'texto' })),
  conceptos: DATA.conceptos.map((c) => ({
    id: c.id,
    seccionId: c.s,
    nombre: c.n,
    iconos: c.ic,
    color: c.col,
    definicion: c.c,
    ejemploReal: c.e,
    explicaciones: c.o,
    trampaExamen: c.t,
    pregunta: { enunciado: c.q[0], opciones: c.q[1], indiceCorrecta: c.q[2], explicacion: c.q[3] },
  })),
  ciudad: {
    edificios: cityIds.map((id, i) => ({ conceptoId: id, altura: cityH[i], tejado: ROOF[cityRoof[i]] })),
  },
};

// JSON válido como TS, con claves sin comillas para que sea legible.
const toTs = (value) => JSON.stringify(value, null, 2).replace(/^(\s*)"([A-Za-z_]\w*)":/gm, '$1$2:');

const HEADER = '// Generado desde legacy/ciudad-del-dinero-tema1.html con `npm run content:extract`.\n// Contenido académico literal del prototipo: no ampliar ni reformular.\n';
const outDir = resolve(root, 'src/content/temas/tema-01');
mkdirSync(outDir, { recursive: true });

const files = {
  'meta.ts': `import type { Grupo, ModoExplicacion, TemaMeta } from '../../schema.ts';\n\nexport const meta: TemaMeta = ${toTs(tema.meta)};\n\nexport const grupos: Grupo[] = ${toTs(tema.grupos)};\n\nexport const modos: ModoExplicacion[] = ${toTs(tema.modos)};\n`,
  'secciones.ts': `import type { Seccion } from '../../schema.ts';\n\nexport const secciones: Seccion[] = ${toTs(tema.secciones)};\n`,
  'conceptos.ts': `import type { Concepto } from '../../schema.ts';\n\nexport const conceptos: Concepto[] = ${toTs(tema.conceptos)};\n`,
  'ciudad.ts': `import type { EdificioCiudad } from '../../schema.ts';\n\n/** Edificios de la portada, de izquierda a derecha. */\nexport const edificios: EdificioCiudad[] = ${toTs(tema.ciudad.edificios)};\n`,
};
for (const [name, body] of Object.entries(files)) writeFileSync(resolve(outDir, name), HEADER + '\n' + body);

mkdirSync(resolve(root, 'src/icons'), { recursive: true });
writeFileSync(
  resolve(root, 'src/icons/glyphs.ts'),
  `// Generado desde legacy/ciudad-del-dinero-tema1.html con \`npm run content:extract\`.\n// Gramática visual: trazos SVG originales en una caja 64×64.\n\nexport const GLYPHS = ${toTs(G)} as const satisfies Record<string, string>;\n\nexport type GlyphName = keyof typeof GLYPHS;\n`,
);

console.log(`Tema ${tema.meta.numero}: ${tema.secciones.length} secciones, ${tema.conceptos.length} conceptos, ${Object.keys(G).length} glifos, ${tema.ciudad.edificios.length} edificios.`);
