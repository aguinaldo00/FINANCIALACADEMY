import type { Concepto } from '../../content/schema.ts';
import { dominioConcepto } from '../../domain/mastery.ts';
import type { Progreso } from '../../domain/progress.ts';
import { iconoSvg } from '../../icons/icon.ts';
import { colorDominio, porcentaje, resaltarAviso } from '../format.ts';

/** Ficha de concepto: definición, ejemplo y los tres paneles (otra forma, trampa, compruébalo). */
export function fichaConcepto(c: Concepto, progreso: Progreso): string {
  const d = dominioConcepto(progreso, c.id);
  return `<article class="cc rev" id="c-${c.id}" data-id="${c.id}">
 <div class="cc-h"><div class="ico">${iconoSvg(c.iconos, c.color)}</div><div><h2>${c.nombre}</h2><div class="meta"><span class="pill">${c.seccionId}</span><span class="dm" style="background:${colorDominio(d)}">Dominio ${porcentaje(d)}</span></div></div></div>
 <p class="corta">${c.definicion}</p>
 <p class="ej"><span class="lab">🌍 En la vida real:</span> ${resaltarAviso(c.ejemploReal)}</p>
 <div class="acts"><button class="ab o" data-a="o" aria-expanded="false">🔄 Explícamelo de otra forma</button><button class="ab t" data-a="t" aria-expanded="false">⚠️ Trampa de examen</button><button class="ab q" data-a="q" aria-expanded="false">✅ Compruébalo</button><button class="ab e" data-a="e" aria-expanded="false">🗺️ Esquema</button><button class="ab f" data-a="f" aria-expanded="false">🃏 Flashcards</button><button class="ab p" data-a="p" aria-expanded="false">🧠 Más preguntas</button></div>
 <div class="pn o" hidden></div><div class="pn t" hidden><h4>⚠️ Así te la intentan colar</h4><p>${c.trampaExamen}</p></div><div class="pn q" hidden></div><div class="pn e" hidden></div><div class="pn f" hidden></div><div class="pn p" hidden></div>
</article>`;
}

/** Actualiza la etiqueta de dominio de una ficha ya pintada. */
export function actualizarEtiquetaDominio(ficha: HTMLElement, valor: number): void {
  const etiqueta = ficha.querySelector<HTMLElement>('.dm');
  if (!etiqueta) return;
  etiqueta.textContent = `Dominio ${porcentaje(valor)}`;
  etiqueta.style.background = colorDominio(valor);
}
