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

/*
 * Los patrones no usan «lookbehind» (Safari anterior a 16.4 no lo entiende): el carácter previo se
 * captura en el grupo 1 y la sigla va en el grupo 2.
 */
const ANTES = '(^|[^\\p{L}\\p{N}])';
const DESPUES = '(?![\\p{L}\\p{N}])';

/** Patrón de una entrada: las siglas distinguen mayúsculas; los términos, no. */
function patron(e: EntradaGlosario): RegExp {
  const formas = [e.termino, ...(e.formas ?? [])].sort((a, b) => b.length - a.length).map(regexEscape).join('|');
  return new RegExp(`${ANTES}(${formas})${DESPUES}`, e.desarrollo ? 'u' : 'iu');
}
const PATRONES = new Map(GLOSARIO.map((e) => [e, patron(e)]));

/** Contenido del popover de una entrada. */
export function explicacionHtml(e: EntradaGlosario, idDescripcion: string): string {
  const cabecera = e.desarrollo ? `<b>${escapar(e.termino)}</b> · ${escapar(e.desarrollo)}` : `<b>${escapar(e.termino)}</b>`;
  return `<p class="sigla-pop-t">${cabecera}</p><p id="${idDescripcion}">${escapar(e.explica)}</p>${e.ejemplo ? `<p class="sigla-pop-ej">Ej.: ${escapar(e.ejemplo)}</p>` : ''}<p class="sigla-pop-enlaces">${e.conceptoId ? `<a href="${hrefConcepto(e.conceptoId)}">Ver ficha</a>` : ''}<a href="#glosario">Glosario</a></p>`;
}

/*
 * Respaldo para navegadores sin popover nativo (Safari anterior a 17): el botón abre su tarjeta con
 * una clase, y un toque fuera o Escape la cierra. Con popover nativo no se instala nada.
 */
let respaldoPuesto = false;
function asegurarRespaldoPopover(): void {
  if (respaldoPuesto || typeof HTMLElement === 'undefined' || 'popover' in HTMLElement.prototype) return;
  respaldoPuesto = true;
  const cerrar = () => document.querySelectorAll('.sigla-pop-abierta').forEach((p) => p.classList.remove('sigla-pop-abierta'));
  document.addEventListener('click', (ev) => {
    const objetivo = ev.target as Element | null;
    const boton = objetivo?.closest?.('.sigla[popovertarget]');
    if (boton) {
      const pop = document.getElementById(boton.getAttribute('popovertarget')!);
      const abierta = pop?.classList.contains('sigla-pop-abierta');
      cerrar();
      if (pop && !abierta) pop.classList.add('sigla-pop-abierta');
    } else if (!objetivo?.closest?.('.sigla-pop')) cerrar();
  });
  document.addEventListener('keydown', (ev) => ev.key === 'Escape' && cerrar());
}

const NO_MARCAR = 'button, a, input, textarea, select, label, svg, code, .sigla, .sigla-pop, [data-sin-siglas]';

/**
 * Marca las siglas y términos del glosario dentro de `raiz` (o solo dentro de los elementos que
 * cumplan `soloDentro`). Los popovers se añaden a `destino` (por defecto, la propia raíz). Devuelve
 * cuántas entradas se han marcado.
 */
export function marcarSiglas(raiz: HTMLElement, destino: HTMLElement = raiz, tema?: 1 | 2, soloDentro?: string): number {
  asegurarRespaldoPopover();
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
        if (!m) continue;
        const i = m.index + m[1]!.length;
        const largo = m[2]!.length;
        if (!mejor || i < mejor.i || (i === mejor.i && largo > mejor.largo)) mejor = { e, i, largo };
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

/* ------------------------------------------------- siglas en preguntas tipo test */

/*
 * En las preguntas, las opciones son botones y no pueden llevar otro botón dentro: allí las siglas
 * se marcan con <abbr title> y un botón "Ver qué significan las siglas" escribe el desarrollo
 * detrás (por CSS, sin cambiar el texto). Al corregir se revelan todas.
 */
const SIGLAS_PREGUNTA = new Map(GLOSARIO.filter((e) => e.desarrollo).flatMap((e) => [e.termino, ...(e.formas ?? [])].map((f) => [f, e.desarrollo!] as const)));
const PATRON_SIGLAS = new RegExp(`${ANTES}(${[...SIGLAS_PREGUNTA.keys()].sort((a, b) => b.length - a.length).map(regexEscape).join('|')})${DESPUES}`, 'gu');

/** Siglas del glosario que aparecen en un texto (sin repetir). */
export function siglasEn(texto: string): string[] {
  return [...new Set([...texto.replace(/<[^>]*>/g, ' ').matchAll(PATRON_SIGLAS)].map((m) => m[2]!))];
}

/**
 * Siglas que no se deben revelar en una pregunta: las que pregunta el enunciado ("¿Qué significa
 * SEBC?") y aquellas cuyo desarrollo aparece en alguna opción (revelarlo daría la respuesta).
 */
export function siglasProtegidas(enunciado: string, opciones: readonly string[]): Set<string> {
  const protegidas = new Set<string>();
  const preguntaPorSigla = /signific|siglas/i.test(enunciado);
  const textoOpciones = opciones.join(' ').toLowerCase();
  for (const s of siglasEn(`${enunciado} ${opciones.join(' ')}`)) {
    const desarrollo = SIGLAS_PREGUNTA.get(s)!.toLowerCase().replace(/\s*\(.*\)$/, '');
    if ((preguntaPorSigla && siglasEn(enunciado).includes(s)) || textoOpciones.includes(desarrollo)) protegidas.add(s);
  }
  return protegidas;
}

/** Marca con <abbr> las siglas de un trozo de HTML (solo el texto, nunca las etiquetas). */
export function marcarSiglasPregunta(html: string, excluir: ReadonlySet<string> = new Set()): string {
  return html
    .split(/(<[^>]*>)/)
    .map((t) => (t.startsWith('<') ? t : t.replace(PATRON_SIGLAS, (_m, antes: string, s: string) => antes + (excluir.has(s) ? s : `<abbr class="sg-q" title="${escapar(SIGLAS_PREGUNTA.get(s)!)}">${s}</abbr>`))))
    .join('');
}

/** Botón para revelar las siglas (vacío si el HTML no tiene ninguna marcada). */
export function botonSiglas(html: string): string {
  return html.includes('class="sg-q"') ? '<button type="button" class="btn-enlace sg-revelar" data-siglas aria-pressed="false">Ver qué significan las siglas</button>' : '';
}

/** Muestra u oculta el desarrollo de las siglas marcadas dentro de `raiz`. */
export function revelarSiglas(raiz: HTMLElement, ver: boolean): void {
  raiz.classList.toggle('siglas-vistas', ver);
  const b = raiz.querySelector<HTMLButtonElement>('[data-siglas]');
  if (!b) return;
  b.setAttribute('aria-pressed', String(ver));
  b.textContent = ver ? 'Ocultar el significado de las siglas' : 'Ver qué significan las siglas';
}

/** Conecta el botón de siglas de un panel (si lo tiene). */
export function conectarSiglas(raiz: HTMLElement): void {
  const b = raiz.querySelector<HTMLButtonElement>('[data-siglas]');
  if (b) b.onclick = () => revelarSiglas(raiz, b.getAttribute('aria-pressed') !== 'true');
}
