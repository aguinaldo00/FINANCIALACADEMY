import type { PantallaTema2, Ruta } from '../../app/router.ts';
import { hrefAcademia, hrefAsignatura, hrefBloqueTema2, hrefFase, hrefFormula, hrefTema2 } from '../../app/router.ts';
import { buscarAsignatura, ID_GESTION_FINANCIERA } from '../../content/academia.ts';
import { montarEditorial, navegacionEditorial, sumarioEditorial } from '../components/editorial.ts';
import { BLOQUES, formulaPorId, formulasDe, type BloqueId } from '../../content/temas/tema-02/formulas.ts';
import { FASES_TEMA2, tema02 } from '../../content/temas/tema-02/index.ts';
import { montarCapitalizacionCompuesta } from '../components/capitalizacionCompuesta.ts';
import { montarPracticaCompuesta, seccionErrores, seccionReconocer } from '../components/practicaCompuesta.ts';
import { enlaceTodosLosTemas } from '../components/rail.ts';
import { escaparHtml } from '../components/simbolos.ts';
import { bloque as datosBloque, pestanasBloque, recorridoFases } from './tema2/comun.ts';
import { htmlElegir, htmlIdentificar, htmlPractica, montarFase } from './tema2/fases.ts';
import { htmlFicha, montarFicha } from './tema2/ficha.ts';
import { htmlIndice, montarIndice } from './tema2/indice.ts';
import type { EstadoEstudio } from '../../app/store.ts';
import type { ContextoVista } from './context.ts';

/*
 * Tema 2 · Introducción al cálculo financiero. Cuatro fases sobre tres bloques del temario:
 *  A · índice de fórmulas (y la ficha animada de cada una),
 *  B · identificar los datos, C · elegir la fórmula, D · practicar en papel.
 */

type RutaTema2 = Extract<Ruta, { vista: 'tema2' }>;

let detenerExperiencia: (() => void) | null = null;
let pantallaMontada = '';

export function detenerTemaDos(): void {
  detenerExperiencia?.();
  detenerExperiencia = null;
  pantallaMontada = '';
}

const clavePantalla = (p: PantallaTema2) => (p.tipo === 'formula' ? `f:${p.id}` : p.tipo === 'fase' ? `${p.bloque}:${p.fase}` : 'indice');

const INTRO_FASE = {
  datos: 'Con un ejercicio delante, lo primero es leer el enunciado y dar a cada dato su símbolo. Aquí no se calcula nada.',
  elegir: 'En el examen nadie te dice qué fórmula toca. Con los datos identificados, mira qué te dan y qué te piden, elige la fórmula y comprueba por qué es esa.',
  practica: 'Ahora sí: en papel, con calculadora y con cada vez menos ayuda. Si una fórmula no te cuadra, vuelve a C y mira su animación.',
} as const;

function htmlFase(bloque: BloqueId, fase: 'datos' | 'elegir' | 'practica'): string {
  const b = datosBloque(bloque);
  const f = FASES_TEMA2.find((x) => x.id === fase)!;
  // En D de compuesta: el ejemplo año a año y los errores típicos, después del ejercicio aleatorio.
  const extraAntes = bloque === 'compuesta' && fase === 'practica'
    ? `<section class="t2-extra" aria-labelledby="t2-ejemplo-titulo">
        <h2 id="t2-ejemplo-titulo">Antes de empezar: un ejemplo resuelto, año a año</h2>
        <p>Con el modo cuaderno, cada cálculo se oculta hasta que lo hayas hecho tú.</p>
        <div data-capitalizacion-compuesta></div>
      </section>
      <section class="t2-extra" aria-labelledby="t2-errores-titulo">
        <h2 id="t2-errores-titulo">Errores típicos en compuesta</h2>
        <p>Antes de pulsar, piensa qué está mal.</p>
        ${seccionErrores()}
      </section>`
    : '';
  const extraDespues = bloque === 'compuesta' && fase === 'elegir'
    ? `<section class="t2-extra" aria-labelledby="t2-mezcla-titulo">
        <h2 id="t2-mezcla-titulo">Repaso mezclado: simple y compuesta</h2>
        <p>Tipos de ejercicio intercalados, como en el examen.</p>
        ${seccionReconocer()}
      </section>`
    : '';
  const siguiente = FASES_TEMA2[FASES_TEMA2.findIndex((x) => x.id === fase) + 1];
  const bloqueSiguiente = BLOQUES[BLOQUES.findIndex((x) => x.id === bloque) + 1];
  // Tras elegir, C (comprender) es el paso siguiente, pero quien ya entiende la fórmula puede ir a D.
  const atajo = siguiente?.id === 'formulas' ? `<a class="t2-continuar-atajo" href="${hrefFase(bloque, 'practica')}">Ya la entiendo: D · Practicar en papel</a>` : '';
  const continuar = siguiente
    ? `${atajo}<a class="btn-principal" href="${hrefFase(bloque, siguiente.id)}">${siguiente.letra} · ${siguiente.titulo}</a>`
    : bloqueSiguiente
      ? `<a class="btn-principal" href="${hrefFase(bloqueSiguiente.id, FASES_TEMA2[0].id)}">Siguiente bloque: ${escaparHtml(bloqueSiguiente.titulo)}</a>`
      : `<a class="btn-principal" href="${hrefTema2()}">Volver al índice de fórmulas</a>`;
  return `<div class="tema-matematica t2 t2-fase-pagina">
    <header class="t2-cabecera t2-cabecera-fase">
      <p class="t2-ceja">${escaparHtml(b.apartado)} · ${escaparHtml(b.titulo)}</p>
      <h1><span class="t2-letra">${f.letra}</span>${escaparHtml(f.titulo)}</h1>
      <p class="t2-entradilla">${INTRO_FASE[fase]}</p>
      ${recorridoFases(bloque, fase)}
      ${pestanasBloque(bloque, fase)}
    </header>
    ${fase === 'datos' ? htmlIdentificar(bloque) : fase === 'elegir' ? htmlElegir(bloque) : htmlPractica(bloque, extraAntes)}
    ${extraDespues}
    <nav class="t2-continuar">${continuar}</nav>
  </div>`;
}

function tituloPantalla(p: PantallaTema2): string {
  if (p.tipo === 'formula') return formulaPorId(p.id)!.nombre;
  if (p.tipo === 'fase') return FASES_TEMA2.find((f) => f.id === p.fase)!.titulo;
  return p.bloque ? datosBloque(p.bloque).titulo : 'Índice de fórmulas';
}

export function pintarTemaDos(ctx: ContextoVista, ruta: RutaTema2, estado: EstadoEstudio): void {
  detenerTemaDos();
  const p = ruta.pantalla;
  if (p.tipo === 'indice') ctx.pagina.innerHTML = htmlIndice(estado);
  else {
    // Fichas y fases: la misma navegación editorial y el mismo Sumario que el índice (sin el índice lateral oscuro).
    const gf = buscarAsignatura(ID_GESTION_FINANCIERA)!;
    const migas = [{ texto: 'Academia', href: hrefAcademia() }, { texto: gf.nombre, href: hrefAsignatura(gf.id) }, { texto: `Tema ${tema02.numero}`, href: hrefTema2() }, { texto: tituloPantalla(p) }];
    ctx.pagina.innerHTML = `${navegacionEditorial('noche', migas)}<div class="t2-estudio">${p.tipo === 'formula' ? htmlFicha(p.id) : htmlFase(p.bloque, p.fase)}</div>${sumarioEditorial(gf, estado)}`;
  }
  ctx.tituloMovil.textContent = `Tema ${tema02.numero} · ${tituloPantalla(p)}`;
  const paradas: (() => void)[] = [];
  if (p.tipo !== 'indice') paradas.push(montarEditorial(ctx.pagina));
  if (p.tipo === 'formula') paradas.push(montarFicha(ctx.pagina));
  else if (p.tipo === 'fase') {
    paradas.push(montarFase(ctx.pagina, p.bloque, p.fase));
    const ejemplo = ctx.pagina.querySelector<HTMLElement>('[data-capitalizacion-compuesta]');
    if (ejemplo) paradas.push(montarCapitalizacionCompuesta(ejemplo));
    if (ctx.pagina.querySelector('[data-mat-error], [data-mat-pregunta]')) paradas.push(montarPracticaCompuesta(ctx.pagina));
  } else {
    paradas.push(montarIndice(ctx.pagina));
  }
  detenerExperiencia = () => paradas.forEach((parar) => parar());
  pantallaMontada = clavePantalla(p);
  desplazar(ctx, p);
}

function desplazar(ctx: ContextoVista, p: PantallaTema2): void {
  const ancla = location.hash.includes('#t2-') ? location.hash.slice(location.hash.lastIndexOf('#')) : '';
  if (p.tipo === 'indice' && p.bloque) ctx.pagina.querySelector(`#t2-${p.bloque}`)?.scrollIntoView({ block: 'start' });
  // El ancla viene de la URL: se busca por id (un ancla mal escrita no es un selector válido y rompería la página).
  else if (ancla) document.getElementById(ancla.slice(1))?.scrollIntoView({ block: 'start' });
}

/** Si la pantalla pedida ya está montada, solo se desplaza (no se pierde lo hecho). Devuelve si lo ha hecho. */
export function desplazarTemaDos(ctx: ContextoVista, ruta: RutaTema2): boolean {
  if (!detenerExperiencia || !ctx.pagina.querySelector('.t2, [data-tema2]') || pantallaMontada !== clavePantalla(ruta.pantalla)) return false;
  if (ruta.scrollArriba) window.scrollTo(0, 0);
  desplazar(ctx, ruta.pantalla);
  return true;
}

export function pintarRailTemaDos(rail: HTMLElement, ruta: RutaTema2): void {
  const p = ruta.pantalla;
  const bloqueActual = p.tipo === 'formula' ? formulaPorId(p.id)!.bloque : p.bloque;
  const grupos = BLOQUES.map((b) => {
    const abierto = b.id === bloqueActual;
    const formulas = formulasDe(b.id).map((f) => {
      const on = p.tipo === 'formula' && p.id === f.id;
      return `<a class="sl t2-sl${on ? ' on' : ''}" href="${hrefFormula(f.id)}"${on ? ' aria-current="location"' : ''}><div class="top"><span class="id">${f.numero}</span><span>${escaparHtml(f.nombre)}</span></div></a>`;
    }).join('');
    // En el orden de la ruta: A y B, las fórmulas (C) y D.
    const fases = FASES_TEMA2.map((f) => {
      if (f.id === 'formulas') return formulas;
      const on = p.tipo === 'fase' && p.bloque === b.id && p.fase === f.id;
      return `<a class="sl${on ? ' on' : ''}" href="${hrefFase(b.id, f.id)}"${on ? ' aria-current="location"' : ''}><div class="top"><span class="id">${f.letra}</span><span>${f.titulo}</span></div><small class="sl-sub">${f.subtitulo}</small></a>`;
    }).join('');
    return `<details class="t2-rail-bloque"${abierto || !bloqueActual ? ' open' : ''}><summary class="grp"><a href="${hrefBloqueTema2(b.id)}">${escaparHtml(b.titulo)}</a></summary>${fases}</details>`;
  }).join('');
  rail.innerHTML = `${enlaceTodosLosTemas()}<a class="brand" href="${hrefTema2()}"><span class="ring tema-anillo" aria-hidden="true">${tema02.numero}</span><span><small class="brand-ante">Gestión financiera</small><b>${tema02.titulo}</b><small>Tema ${tema02.numero} · índice de fórmulas</small></span></a>
    ${grupos}`;
}
