// Vuelca a video/datos.json los textos LITERALES de src/content (no se inventa nada).
// Uso: node --experimental-strip-types video/datos.mjs
import { writeFileSync } from 'node:fs';
import { meta } from '../src/content/temas/tema-01/meta.ts';
import { conceptos } from '../src/content/temas/tema-01/conceptos.ts';

const limpia = (s) => s.replace(/<[^>]+>/g, '');
const c = {};
for (const x of conceptos) {
  c[x.id] = { nombre: x.nombre, color: x.color, definicion: limpia(x.definicion), frase: x.explicaciones[4], esquema: x.explicaciones[2] };
}
const json = JSON.stringify({ meta, c }, null, 1);
writeFileSync(new URL('./datos.json', import.meta.url), json);
writeFileSync(new URL('./datos.js', import.meta.url), `window.DATOS = ${json};\n`);
console.log('datos.json:', Object.keys(c).length, 'conceptos');
