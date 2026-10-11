/*
 * Siglas y términos explicables. En cada texto marcado, la primera aparición de cada entrada del
 * glosario se convierte en un botón que abre una explicación breve (popover nativo: funciona con
 * teclado —Enter, Espacio, Escape—, con el dedo y con lector de pantalla gracias a aria-describedby).
 * Las siguientes apariciones en el mismo texto no se tocan, para no llenar de paradas el tabulador.
 */
import { hrefConcepto } from '../../app/router.ts';
import { type EntradaGlosario, GLOSARIO } from '../../content/glosario.ts';

let contador = 0;

const escapar = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const regexEscape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Patrón de una entrada: las siglas distinguen mayúsculas; los términos, no. */
function patron(e: EntradaGlosario): RegExp {
  const formas = [e.termino, ...(e.formas ?? [])].sort((a, b) => b.length - a.length).map(regexEscape).join('|');
  return new RegExp(`(?<![\\p{L}\\p{N}])(?:${formas})(?![\\p{L}\\p{N}])`, e.desarrollo ? 'u' : 'iu');
}
const PATRONES = new Map(GLOSARIO.map((e) => [e, patron(e)]));

/** Contenido del popover de una entrada. */
export function explicacionHtml(e: EntradaGlosario, idDescripcion: string): string {
  const cabecera = e.desarrollo ? `<b>${escapar(e.termino)}</b> · ${escapar(e.desarrollo)}` : `<b>${escapar(e.termino)}</b>`;
  return `<p class="sigla-pop-t">${cabecera}</p><p id="${idDescripcion}">${escapar(e.explica)}</p>${e.ejemplo ? `<p class="sigla-pop-ej">Ej.: ${escapar(e.ejemplo)}</p>` : ''}<p class="sigla-pop-enlaces">${e.conceptoId ? `<a href="${hrefConcepto(e.conceptoId)}">Ver ficha</a>` : ''}<a href="#glosario">Glosario</a></p>`;
}

const NO_MARCAR = 'button, a, input, textarea, select, label, svg, code, .sigla, .sigla-pop, [data-sin-siglas]';

/**
 * Marca las siglas y términos del glosario dentro de `raiz` (o solo dentro de los elementos que
 * cumplan `soloDentro`). Los popovers se añaden a `destino` (por defecto, la propia raíz). Devuelve
 * cuántas entradas se han marcado.
 */
export function marcarSiglas(raiz: HTMLElement, destino: HTMLElement = raiz, tema?: 1 | 2, soloDentro?: string): number {
  const pendientes = new Set(GLOSARIO.filter((e) => !tema || e.tema === tema));
  // Lo ya marcado en esta raíz no se vuelve a marcar.
  for (const b of raiz.querySelectorAll<HTMLElement>('.sigla[data-termino]')) for (const e of pendientes) if (e.termino === b.dataset.termino) pendientes.delete(e);
  let marcadas = 0;
  const caminante = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (n.parentElement?.closest(NO_MARCAR) || (soloDentro && !n.parentElement?.closest(soloDentro)) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  });
  const textos: Text[] = [];
  for (let n = caminante.nextNode(); n; n = caminante.nextNode()) textos.push(n as Text);
  for (const texto of textos) {
    let nodo: Text | null = texto;
    while (nodo && pendientes.size) {
      // La aparición más temprana de cualquier entrada pendiente en este trozo de texto.
      let mejor: { e: EntradaGlosario; i: number; largo: number } | null = null;
      for (const e of pendientes) {
        const m = PATRONES.get(e)!.exec(nodo.data);
        if (m && (!mejor || m.index < mejor.i || (m.index === mejor.i && m[0].length > mejor.largo))) mejor = { e, i: m.index, largo: m[0].length };
      }
      if (!mejor) break;
      pendientes.delete(mejor.e);
      const id = `sg-${++contador}`;
      const resto = nodo.splitText(mejor.i);
      const despues = resto.splitText(mejor.largo);
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'sigla';
      boton.dataset.termino = mejor.e.termino;
      boton.setAttribute('popovertarget', id);
      boton.setAttribute('aria-describedby', `${id}-d`);
      boton.textContent = resto.data;
      resto.replaceWith(boton);
      const pop = document.createElement('div');
      pop.id = id;
      pop.className = 'sigla-pop';
      pop.setAttribute('popover', '');
      pop.setAttribute('role', 'note');
      pop.innerHTML = explicacionHtml(mejor.e, `${id}-d`);
      destino.append(pop);
      marcadas++;
      nodo = despues;
    }
  }
  return marcadas;
}
