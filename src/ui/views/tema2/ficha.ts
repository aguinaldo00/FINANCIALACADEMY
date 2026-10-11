/*
 * Ficha de una fórmula: arriba, el laboratorio (cuaderno, animación ampliable y calculadora, en modo
 * digital o analógico); debajo, la teoría: qué calcula, cada símbolo, cómo reconocerla y el resto
 * plegado para cuando haga falta.
 */
import { hrefFase } from '../../../app/router.ts';
import { FORMULAS_TEMA2, formulaPorId } from '../../../content/temas/tema-02/formulas.ts';
import { simbolo } from '../../../content/temas/tema-02/simbolos.ts';
import { simbolosDe } from '../../matematica/formula.ts';
import { bloque, escaparHtml, formulaHtml, hrefBloqueTema2, hrefFormula, textoT2 } from './comun.ts';
import { htmlLaboratorio, montarLaboratorio } from './laboratorio.ts';

function lista(items: string[]): string {
  return `<ul>${items.map((x) => `<li>${textoT2(x)}</li>`).join('')}</ul>`;
}

export function htmlFicha(id: string): string {
  const f = formulaPorId(id)!;
  const b = bloque(f.bloque);
  const k = FORMULAS_TEMA2.indexOf(f);
  const anterior = FORMULAS_TEMA2[k - 1];
  const siguiente = FORMULAS_TEMA2[k + 1];
  const claves = [...new Set([...simbolosDe(f.expresion), ...(f.variantes ?? []).flatMap((v) => simbolosDe(v.expresion))])];
  const calcula = f.calcula ? simbolo(f.calcula) : null;
  return `<div class="tema-matematica t2 t2-ficha" data-formula="${f.id}">
    <nav class="t2-volver"><a href="${hrefBloqueTema2(f.bloque)}">← ${escaparHtml(b.titulo)} · índice de fórmulas</a></nav>
    <header class="t2-ficha-cabecera">
      <div class="t2-ficha-titulo">
        <p class="t2-ceja">Tema 2 · Fórmula ${f.numero} · ${escaparHtml(b.titulo)}</p>
        <h1>${escaparHtml(f.nombre)}</h1>
      </div>
      <p class="t2-ficha-fx">${formulaHtml(f.expresion)}</p>
      <a class="t2-practicar" href="${hrefFase(f.bloque, 'datos')}">Practicar</a>
    </header>
    ${htmlLaboratorio(f.id)}
    <section class="t2-teoria" aria-labelledby="t2-teoria-tit">
      <h2 class="t2-teoria-tit" id="t2-teoria-tit">Para entenderla</h2>
      ${f.variantes?.length ? `<ul class="t2-variantes">${f.variantes.map((v) => `<li>${formulaHtml(v.expresion)}<span>${escaparHtml(v.nota)}</span></li>`).join('')}</ul>` : ''}
      <div class="t2-ficha-info">
        <p class="t2-calcula">${calcula ? `<span>Calcula</span>${formulaHtml(f.calcula!)}<b>${escaparHtml(calcula.nombre)}</b>` : f.id === 'descuento-remesa' ? '<span>Calcula</span><b>El valor líquido de la remesa</b>' : '<span>Compara</span><b>Simple y compuesta según el plazo</b>'}</p>
        <section class="t2-seccion">
          <h2>Cada símbolo</h2>
          <dl class="t2-simbolos">${claves.map((c) => {
            const s = simbolo(c);
            const nota = f.notas?.[c];
            return `<div><dt>${formulaHtml(c)}</dt><dd><b>${escaparHtml(s?.nombre ?? c)}.</b> ${escaparHtml(s?.significado ?? '')}${nota ? ` <em>${escaparHtml(nota)}</em>` : ''}</dd></div>`;
          }).join('')}</dl>
        </section>
        <section class="t2-seccion t2-reconocer">
          <h2>Cómo reconocerla</h2>
          <p>${textoT2(f.reconocer)}</p>
        </section>
        <section class="t2-seccion">
          <h2>En el enunciado</h2>
          ${lista(f.datos)}
        </section>
        <details class="t2-pliegue"><summary>Cuándo se usa</summary>${lista(f.cuando)}</details>
        <details class="t2-pliegue"><summary>Para no memorizarla</summary>${lista(f.consejos)}</details>
        <details class="t2-pliegue" data-errores><summary>Errores habituales <small>${f.errores.length}</small></summary>
          <ul class="t2-errores">${f.errores.map((e, i) => `<li data-t2-error="${i}"><p class="t2-mal"><span>Así no</span>${textoT2(e.mal)}</p>
            <button type="button" class="btn-enlace" data-t2-ver-error aria-expanded="false">¿Qué falla?</button>
            <p class="t2-bien" hidden><span>Así sí</span>${textoT2(e.bien)}</p></li>`).join('')}</ul>
        </details>
        <section class="t2-seccion">
          <h2>Relacionada con</h2>
          <ul class="t2-relaciones">${f.relaciones.map((r) => {
            const o = formulaPorId(r.id)!;
            return `<li><a href="${hrefFormula(o.id)}"><b>${o.numero}</b>${formulaHtml(o.expresion)}</a><span>${textoT2(r.texto)}</span></li>`;
          }).join('')}</ul>
        </section>
        <section class="t2-ejemplo">
          <p class="t2-ceja">${escaparHtml(f.ejemplo.fuente)}</p>
          <p>${textoT2(f.ejemplo.texto)}</p>
        </section>
      </div>
    </section>
    <nav class="t2-ficha-nav" aria-label="Otras fórmulas">
      ${anterior ? `<a class="t2-ficha-ant" href="${hrefFormula(anterior.id)}"><small>Fórmula ${anterior.numero}</small>${escaparHtml(anterior.nombre)}</a>` : '<span></span>'}
      <a class="btn-principal" href="${hrefFase(f.bloque, 'datos')}">Practicar: identificar los datos</a>
      ${siguiente ? `<a class="t2-ficha-sig" href="${hrefFormula(siguiente.id)}"><small>Fórmula ${siguiente.numero}</small>${escaparHtml(siguiente.nombre)}</a>` : '<span></span>'}
    </nav>
  </div>`;
}

export function montarFicha(raiz: HTMLElement): () => void {
  const parar = montarLaboratorio(raiz);
  const alPulsar = (e: Event) => {
    const boton = (e.target as Element | null)?.closest<HTMLButtonElement>('[data-t2-ver-error]');
    if (!boton) return;
    const li = boton.closest('li')!;
    li.querySelector<HTMLElement>('.t2-bien')!.hidden = false;
    boton.setAttribute('aria-expanded', 'true');
    boton.hidden = true;
  };
  raiz.addEventListener('click', alPulsar);
  return () => {
    parar();
    raiz.removeEventListener('click', alPulsar);
  };
}
