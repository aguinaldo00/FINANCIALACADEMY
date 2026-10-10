import { TEMAS, type TemaCatalogo } from '../../content/temas/index.ts';
import {
  FORMULA_CAPITAL_FINAL,
  FORMULA_INTERESES_TOTALES,
  FORMULA_INTERESES_TOTALES_FACTOR,
  NOTACION_CAPITALIZACION_COMPUESTA,
  tema02,
} from '../../content/temas/tema-02/index.ts';
import { montarCapitalizacionCompuesta } from '../components/capitalizacionCompuesta.ts';
import type { ContextoVista } from './context.ts';

let detenerExperiencia: (() => void) | null = null;

export function detenerTemaDos(): void {
  detenerExperiencia?.();
  detenerExperiencia = null;
}

export function pintarIndiceTemas(ctx: ContextoVista, catalogo: readonly TemaCatalogo[] = TEMAS): void {
  ctx.pagina.innerHTML = `<div class="tema-indice">
    <header class="sh"><div class="kick"><span class="pill k">Gestión financiera</span></div>
      <h1>Elige un tema</h1><p>Cada tema tiene su propio contenido y forma de estudio.</p>
    </header>
    <nav class="tema-opciones" aria-label="Temas disponibles">${catalogo.map((tema) => `
      <a class="tile tema-opcion" href="${tema.href}">
        <span class="i">Tema ${tema.numero}</span><span class="n">${tema.titulo}</span>
        <span class="w">${tema.descripcion}</span><span class="tema-ir">Abrir tema →</span>
      </a>`).join('')}
    </nav>
  </div>`;
  ctx.tituloMovil.textContent = 'Todos los temas';
}

export function pintarTemaDos(ctx: ContextoVista, hash: string): void {
  detenerTemaDos();
  ctx.pagina.innerHTML = `<div class="tema-matematica">
    <p class="tema-migas"><a href="#temas">Todos los temas</a><span aria-hidden="true">/</span><span>Tema ${tema02.numero}</span></p>
    <header class="sh">
      <div class="kick"><span class="pill k">Tema ${tema02.numero}</span><span class="pill">${tema02.fuente}</span></div>
      <h1>${tema02.titulo}</h1>
      <p>Un capital actual se convierte en un capital futuro. Vamos a seguir cómo se incorpora el interés y por qué cada periodo parte de una cantidad mayor.</p>
    </header>

    <section class="mat-leccion" id="mat-capitalizacion" aria-labelledby="mat-titulo">
      <header class="mat-leccion-cabecera">
        <p class="mat-ceja">TEMA ${tema02.numero} · LECCIÓN 1</p>
        <h2 id="mat-titulo">${tema02.primeraLeccion}: de C₀ a Cₙ</h2>
        <p>Primero identificamos la regla; después calculamos el interés de cada periodo, lo incorporamos al capital y generalizamos el proceso.</p>
      </header>
      <div data-capitalizacion-compuesta></div>
    </section>

    <section class="mat-notacion" aria-labelledby="mat-notacion-titulo">
      <div class="mat-notacion-cabecera"><div><p class="mat-ceja">NOTACIÓN DEL TEMA</p><h2 id="mat-notacion-titulo">Qué significa cada símbolo</h2></div></div>
      <dl class="mat-notacion-lista">${NOTACION_CAPITALIZACION_COMPUESTA.map((dato) =>
        `<div><dt>${dato.simbolo}</dt><dd>${dato.significado}</dd></div>`,
      ).join('')}</dl>
      <div class="mat-formulas" aria-label="Fórmulas de capitalización compuesta">
        <p><span>Capital final</span><strong>${FORMULA_CAPITAL_FINAL}</strong></p>
        <p><span>Intereses totales</span><strong>${FORMULA_INTERESES_TOTALES}</strong></p>
        <p><span>Intereses totales · expresión con factor</span><strong>${FORMULA_INTERESES_TOTALES_FACTOR}</strong></p>
      </div>
    </section>
  </div>`;
  ctx.tituloMovil.textContent = `Tema ${tema02.numero} · ${tema02.titulo}`;

  const contenedor = ctx.pagina.querySelector<HTMLElement>('[data-capitalizacion-compuesta]');
  if (contenedor) detenerExperiencia = montarCapitalizacionCompuesta(contenedor);
  if (hash.endsWith('/capitalizacion-compuesta')) {
    ctx.pagina.querySelector('#mat-capitalizacion')?.scrollIntoView({ block: 'start' });
  }
}

export function pintarRailTemas(rail: HTMLElement, catalogo: readonly TemaCatalogo[] = TEMAS): void {
  rail.innerHTML = `<a class="brand" href="#temas"><span class="ring tema-anillo" aria-hidden="true">GF</span><span><small class="brand-ante">Gestión financiera</small><b>Temas</b><small>${catalogo.length} disponibles</small></span></a>
    <div class="grp">CONTENIDO</div>${catalogo.map((tema) => `<a class="sl" href="${tema.href}"><div class="top"><span class="id">${tema.numero}</span><span>${tema.titulo}</span></div></a>`).join('')}`;
}

export function pintarRailTemaDos(rail: HTMLElement, hash: string): void {
  const activo = hash.startsWith('#tema/2');
  rail.innerHTML = `<a class="brand" href="#tema/2"><span class="ring tema-anillo" aria-hidden="true">2</span><span><small class="brand-ante">Gestión financiera</small><b>Matemática financiera</b><small>Tema ${tema02.numero}</small></span></a>
    <a class="sl tema-cambio" href="#temas"><div class="top"><span class="id">←</span><span>Todos los temas</span></div></a>
    <div class="grp">TEMA ${tema02.numero}</div>
    <a class="sl${activo ? ' on' : ''}" href="#tema/2/capitalizacion-compuesta"><div class="top"><span class="id">01</span><span>Capitalización compuesta</span></div><small class="ex-sub">La regla y su cálculo</small></a>`;
}
