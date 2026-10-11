/*
 * Fase A · Índice de fórmulas del Tema 2. Es el centro del tema: una visión de conjunto por bloque
 * (cómo sale cada fórmula de otra), qué hay que memorizar y qué se deduce, y una ficha por fórmula
 * con la miniatura de su animación (el último fotograma, pintado por la propia escena).
 */
import { hrefFase } from '../../../app/router.ts';
import { BLOQUES, formulaPorId, formulasDe, type BloqueId } from '../../../content/temas/tema-02/formulas.ts';
import { tema02 } from '../../../content/temas/tema-02/index.ts';
import { ESCENAS } from '../../escenas/index.ts';
import { pintarFotograma } from '../../motion/reproductor.ts';
import { escaparHtml, formulaHtml, hrefBloqueTema2, hrefFormula, leyendaColores, recorridoFases, textoT2 } from './comun.ts';

/** Cómo se obtiene cada fórmula a partir de otra (el mapa de relaciones de cada bloque). */
export const DERIVACIONES: Record<BloqueId, { desde: string; hacia: string; como: string }[]> = {
  simple: [
    { desde: 'simple-intereses', hacia: 'simple-montante', como: 'sumar C₀ y sacar factor común' },
    { desde: 'simple-montante', hacia: 'simple-capital-inicial', como: 'despejar C₀' },
    { desde: 'simple-intereses', hacia: 'simple-tipo', como: 'I = Cₙ − C₀ y despejar i' },
    { desde: 'simple-intereses', hacia: 'simple-tiempo', como: 'I = Cₙ − C₀ y despejar n' },
    { desde: 'simple-intereses', hacia: 'simple-fraccionado', como: 'i → iₘ y n → n · m' },
  ],
  compuesta: [
    { desde: 'compuesta-montante', hacia: 'compuesta-intereses', como: 'restar C₀' },
    { desde: 'compuesta-montante', hacia: 'compuesta-capital-inicial', como: 'dividir entre (1 + i)ⁿ' },
    { desde: 'compuesta-montante', hacia: 'compuesta-tiempo', como: 'logaritmos' },
    { desde: 'compuesta-montante', hacia: 'compuesta-tipo', como: 'raíz de índice n' },
    { desde: 'compuesta-montante', hacia: 'compuesta-equivalentes', como: 'igualar montantes' },
    { desde: 'compuesta-equivalentes', hacia: 'compuesta-tae', como: 'iₘ = Jₘ / m' },
    { desde: 'compuesta-montante', hacia: 'compuesta-comparacion', como: 'frente a la recta de simple' },
  ],
  descuento: [
    { desde: 'descuento-comercial', hacia: 'descuento-remesa', como: 'restar también comisiones y gastos' },
    { desde: 'simple-capital-inicial', hacia: 'descuento-racional', como: 'Dr = Cₙ − C₀' },
    { desde: 'compuesta-capital-inicial', hacia: 'descuento-compuesto-racional', como: 'Dr = Cₙ − C₀' },
    { desde: 'descuento-comercial', hacia: 'descuento-compuesto-comercial', como: 'quitar d de lo que queda cada año' },
  ],
};

function chip(id: string): string {
  const f = formulaPorId(id)!;
  return `<a class="t2-chip" href="${hrefFormula(id)}"><b>${f.numero}</b>${formulaHtml(f.expresion)}</a>`;
}

function mapa(bloque: BloqueId): string {
  return `<ul class="t2-mapa" aria-label="Cómo se obtiene cada fórmula">${DERIVACIONES[bloque].map((d) =>
    `<li>${chip(d.desde)}<span class="t2-flecha"><span>${escaparHtml(d.como)}</span></span>${chip(d.hacia)}</li>`).join('')}</ul>`;
}

function tarjeta(id: string): string {
  const f = formulaPorId(id)!;
  const calcula = f.calcula ? `<span class="t2-calcula-mini">Calcula ${formulaHtml(f.calcula)}</span>` : '<span class="t2-calcula-mini">Compara</span>';
  return `<li><a class="t2-carta" href="${hrefFormula(id)}">
    <span class="t2-miniatura" data-miniatura="${id}" aria-hidden="true"></span>
    <span class="t2-carta-texto"><span class="t2-num">Fórmula ${f.numero}</span><span class="t2-carta-nombre">${escaparHtml(f.nombre)}</span>
    <span class="t2-carta-fx">${formulaHtml(f.expresion)}</span>${calcula}</span></a></li>`;
}

export function htmlIndice(): string {
  return `<div class="tema-matematica t2 t2-indice">
    <header class="t2-cabecera">
      <div class="kick"><span class="pill k">Tema ${tema02.numero}</span><span class="pill">${tema02.fuente}</span></div>
      <h1>${tema02.titulo}</h1>
      <p class="t2-entradilla">Primero se entiende cada fórmula: qué significa cada símbolo y por qué funciona. Después se aprende a sacar los datos del enunciado, a elegir la fórmula y a resolver en papel, cada vez con menos ayuda.</p>
      ${recorridoFases(null, 'formulas')}
      ${leyendaColores()}
    </header>
    ${BLOQUES.map((b) => `
    <section class="t2-bloque" id="t2-${b.id}" aria-labelledby="t2-${b.id}-titulo">
      <header class="t2-bloque-cabecera">
        <p class="t2-ceja">${escaparHtml(b.apartado)}</p>
        <h2 id="t2-${b.id}-titulo"><a href="${hrefBloqueTema2(b.id)}">${escaparHtml(b.titulo)}</a></h2>
        <p>${escaparHtml(b.idea)}</p>
      </header>
      <ol class="t2-fichas">${formulasDe(b.id).map((f) => tarjeta(f.id)).join('')}</ol>
      <div class="t2-relacion">
        <div><h3>Cómo se relacionan</h3>${mapa(b.id)}</div>
        <aside class="t2-memoriza"><h3>Para no memorizarlo todo</h3><ul>${b.memoriza.map((m) => `<li>${textoT2(m)}</li>`).join('')}</ul></aside>
      </div>
      <nav class="t2-siguiente" aria-label="Practicar ${escaparHtml(b.titulo.toLowerCase())}">
        <a class="btn-secundario" href="${hrefFase(b.id, 'datos')}"><b>B</b> Identificar los datos</a>
        <a class="btn-secundario" href="${hrefFase(b.id, 'elegir')}"><b>C</b> Elegir la fórmula</a>
        <a class="btn-secundario" href="${hrefFase(b.id, 'practica')}"><b>D</b> Practicar en papel</a>
      </nav>
    </section>`).join('')}
  </div>`;
}

/** Pinta las miniaturas cuando entran en pantalla. Devuelve la función que lo detiene. */
export function montarMiniaturas(raiz: HTMLElement): () => void {
  const pendientes = [...raiz.querySelectorAll<HTMLElement>('[data-miniatura]')];
  const paradas: (() => void)[] = [];
  const pintar = (el: HTMLElement) => {
    const escena = ESCENAS[el.dataset.miniatura ?? ''];
    if (!escena || el.dataset.pintada) return;
    el.dataset.pintada = '1';
    el.classList.add('mo-marco');
    paradas.push(pintarFotograma(el, escena));
  };
  let observador: IntersectionObserver | null = null;
  if (typeof IntersectionObserver === 'function') {
    observador = new IntersectionObserver((entradas) => {
      for (const e of entradas) if (e.isIntersecting) {
        pintar(e.target as HTMLElement);
        observador?.unobserve(e.target);
      }
    }, { rootMargin: '200px 0px' });
    pendientes.forEach((el) => observador!.observe(el));
  } else {
    pendientes.forEach(pintar);
  }
  return () => {
    observador?.disconnect();
    paradas.forEach((p) => p());
  };
}
