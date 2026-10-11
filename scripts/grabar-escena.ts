/*
 * Página de grabación (solo desarrollo): pinta una escena del Tema 2 en el instante pedido, con su
 * subtítulo debajo, para sacar el vídeo fotograma a fotograma (scripts/grabar-escena.mjs).
 *   /scripts/grabar-escena.html?escena=simple-intereses
 */
import '../src/styles/fuentes.css';
import '../src/styles/base.css';
import '../src/styles/tema2.css';
import '../src/styles/editorial.css';
import { ESCENAS } from '../src/ui/escenas/index.ts';
import { Lienzo } from '../src/ui/motion/lienzo.ts';
import { capituloEn, textoConFormulas } from '../src/ui/motion/reproductor.ts';

const escena = ESCENAS[new URLSearchParams(location.search).get('escena') ?? ''] ?? ESCENAS['simple-intereses']!;
const lienzo = new Lienzo(escena.titulo);
document.querySelector('#lienzo')!.append(lienzo.svg);
const pintar = escena.montar(lienzo);
const sub = document.querySelector<HTMLElement>('#sub')!;
let capitulo = -1;
(window as unknown as { __pintar: (t: number) => void; __duracion: number }).__pintar = (t: number) => {
  lienzo.instante = t;
  pintar(t);
  const k = capituloEn(escena, t);
  if (k !== capitulo) {
    capitulo = k;
    sub.innerHTML = textoConFormulas(escena.capitulos[k]!.texto);
  }
};
(window as unknown as { __duracion: number }).__duracion = escena.duracion;
document.fonts.ready.then(() => {
  lienzo.remaquetar();
  document.body.setAttribute('data-listo', '');
});
