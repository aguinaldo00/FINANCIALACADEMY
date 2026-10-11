import { hrefConcepto } from '../../app/router.ts';
import { GLOSARIO } from '../../content/glosario.ts';
import { iconoUi } from '../../icons/ui.ts';
import type { ContextoVista } from './context.ts';

const escapar = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const orden = (a: string, b: string) => a.localeCompare(b, 'es', { sensitivity: 'base' });

/**
 * Glosario de la asignatura: cada sigla con su desarrollo y cada término con una explicación sencilla
 * y, si hay, un ejemplo y el enlace a su ficha. Se puede filtrar escribiendo.
 */
export function pintarGlosario(ctx: ContextoVista): void {
  ctx.tituloMovil.textContent = 'Glosario';
  const bloque = (tema: 1 | 2, titulo: string) => {
    const entradas = GLOSARIO.filter((e) => e.tema === tema).slice().sort((a, b) => orden(a.termino, b.termino));
    return `<section class="gl-bloque" aria-labelledby="gl-t${tema}"><h2 id="gl-t${tema}">${titulo}</h2><dl class="gl-lista">${entradas
      .map((e) => `<div class="gl-entrada" id="gl-${encodeURIComponent(e.termino)}" data-buscar="${escapar(`${e.termino} ${e.desarrollo ?? ''} ${e.explica}`.toLowerCase())}">
<dt><b>${escapar(e.termino)}</b>${e.desarrollo ? `<span>${escapar(e.desarrollo)}</span>` : ''}</dt>
<dd><p>${escapar(e.explica)}</p>${e.ejemplo ? `<p class="gl-ejemplo">Ej.: ${escapar(e.ejemplo)}</p>` : ''}${e.conceptoId ? `<a href="${hrefConcepto(e.conceptoId)}">Ver ficha</a>` : ''}</dd></div>`)
      .join('')}</dl></section>`;
  };
  ctx.pagina.innerHTML = `<div class="gl"><header class="sh"><div class="kick"><span class="pill k">${iconoUi('pergamino')} Glosario</span><span class="pill">${GLOSARIO.length} siglas y términos</span></div><h1>Qué significa cada sigla</h1>
<p>Las siglas y palabras técnicas que aparecen en la asignatura, explicadas sin dar nada por sabido. En las fichas y las infografías, toca una sigla subrayada para ver su explicación.</p>
<label class="gl-buscar"><span>Buscar</span><input type="search" placeholder="Por ejemplo: CNMV, aval, TAE…" autocomplete="off"></label></header>
${bloque(1, 'Tema 1 · El sistema financiero')}${bloque(2, 'Tema 2 · Introducción al cálculo financiero')}
<p class="gl-vacio" hidden>No hay ninguna entrada con ese texto.</p></div>`;
  const campo = ctx.pagina.querySelector<HTMLInputElement>('.gl-buscar input')!;
  const vacio = ctx.pagina.querySelector<HTMLElement>('.gl-vacio')!;
  campo.oninput = () => {
    const q = campo.value.trim().toLowerCase();
    let visibles = 0;
    for (const el of ctx.pagina.querySelectorAll<HTMLElement>('.gl-entrada')) {
      const ver = !q || el.dataset.buscar!.includes(q);
      el.hidden = !ver;
      if (ver) visibles++;
    }
    vacio.hidden = visibles > 0;
  };
}
