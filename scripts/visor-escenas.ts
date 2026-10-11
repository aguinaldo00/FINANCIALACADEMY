/*
 * Visor de escenas del Tema 2 (solo desarrollo): `npm run dev` y abrir
 *   /scripts/visor-escenas.html?escena=<id>&t=<segundo>   → un fotograma congelado
 *   /scripts/visor-escenas.html?escena=<id>               → el reproductor completo
 * Sirve para revisar las animaciones fotograma a fotograma (scripts/fotogramas-escenas.mjs).
 */
import '../src/styles/fuentes.css';
import '../src/styles/base.css';
import '../src/styles/tema2.css';
import '../src/styles/escenasTema1.css';
import { ESCENAS as ESCENAS_TEMA2 } from '../src/ui/escenas/index.ts';
import { ESCENAS_TEMA1 } from '../src/ui/escenas/tema1/index.ts';

const ESCENAS = { ...ESCENAS_TEMA2, ...ESCENAS_TEMA1 };
import { montarReproductor, pintarFotograma } from '../src/ui/motion/reproductor.ts';

const q = new URLSearchParams(location.search);
const v = document.querySelector<HTMLElement>('#v')!;
const escena = ESCENAS[q.get('escena') ?? ''];
if (!escena) {
  v.innerHTML = `<ul>${Object.keys(ESCENAS).map((id) => `<li><a style="color:#e0b25e" href="?escena=${id}">${id}</a></li>`).join('')}</ul>`;
} else if (q.has('t')) {
  const marco = document.createElement('div');
  marco.className = 'mo-marco';
  v.append(marco);
  pintarFotograma(marco, escena, Number(q.get('t')));
  document.fonts.ready.then(() => document.body.setAttribute('data-listo', ''));
} else {
  const fig = document.createElement('figure');
  v.append(fig);
  montarReproductor(fig, escena);
}
