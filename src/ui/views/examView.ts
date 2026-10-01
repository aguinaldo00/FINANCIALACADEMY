import { hrefConcepto } from '../../app/router.ts';
import type { EstadoEstudio } from '../../app/store.ts';
import type { BloqueExamen, Pregunta } from '../../content/schema.ts';
import { dominioConcepto } from '../../domain/mastery.ts';
import { pintarPreguntaEn } from '../components/conceptPanels.ts';
import { colorDominio, porcentaje } from '../format.ts';
import type { ContextoVista } from './context.ts';

interface DatosBloque {
  bloque: BloqueExamen;
  oficiales: Pregunta[];
  practica: Pregunta[];
  dominio: number;
  /** Probabilidad × lo que falta por dominar: dónde rinde más estudiar ahora. */
  prioridad: number;
}

function datosDe(estado: EstadoEstudio): DatosBloque[] {
  const { tema, progreso } = estado;
  const amp = tema.ampliacion;
  if (!amp) return [];
  return amp.bloques.map((bloque) => {
    const conceptos = bloque.conceptoIds.map((id) => tema.conceptos.find((c) => c.id === id)!).filter(Boolean);
    const dominio = conceptos.reduce((s, c) => s + dominioConcepto(progreso, c.id), 0) / (conceptos.length || 1);
    return {
      bloque,
      oficiales: conceptos.map((c) => c.pregunta),
      practica: amp.preguntas.filter((p) => bloque.conceptoIds.includes(p.conceptoId)),
      dominio,
      prioridad: bloque.probabilidad * (1 - dominio),
    };
  });
}

/** Nombre corto de cada bloque para las etiquetas de los gráficos (los de tu predicción). */
const CORTO: Record<string, string> = {
  intermediarios: 'Intermediarios',
  supervisores: 'Supervisores',
  mercados: 'Mercados',
  activos: 'Activos y trinomio',
  basicos: 'Conceptos básicos',
};
const corto = (b: BloqueExamen) => CORTO[b.id] ?? b.titulo.split(' (')[0]!;

/** Marcas del eje: 0 y múltiplos de `paso` hasta `max` (incluido). */
function eje(max: number, paso: number, sufijo = ''): string {
  const marcas: string[] = [];
  for (let v = 0; v <= max; v += paso) marcas.push(`<span style="left:${(v / max) * 100}%">${v}${sufijo}</span>`);
  return `<div class="ex-eje" aria-hidden="true">${marcas.join('')}</div>`;
}

function graficoProbabilidad(datos: DatosBloque[]): string {
  const max = 30;
  const filas = datos
    .map(({ bloque: b }) => {
      const tip = `<b>${b.titulo}</b><br>${b.probabilidad} % de probabilidad estimada<br><span>${b.formato}</span>`;
      return `<div class="ex-fila"><span class="ex-et">${corto(b)}</span><div class="ex-pista"><i class="ex-barra prob" style="width:${(b.probabilidad / max) * 100}%" tabindex="0" data-tip="${encodeURIComponent(tip)}" aria-label="${b.titulo}: ${b.probabilidad} %"></i><b class="ex-val">${b.probabilidad} %</b></div></div>`;
    })
    .join('');
  return `<figure class="ex-graf"><figcaption><h3>Probabilidad de que caiga</h3><small>Estimada según tus apuntes · % del examen</small></figcaption>${filas}<div class="ex-fila"><span></span>${eje(max, 10, ' %')}</div></figure>`;
}

function graficoPreguntas(datos: DatosBloque[]): string {
  const total = Math.max(...datos.map((d) => d.oficiales.length + d.practica.length));
  const max = Math.ceil(total / 10) * 10;
  const filas = datos
    .map(({ bloque: b, oficiales, practica }) => {
      const n = oficiales.length + practica.length;
      const tip = `<b>${b.titulo}</b><br>${oficiales.length} de "Compruébalo" (miden tu dominio)<br>${practica.length} de práctica (de tus apuntes)`;
      return `<div class="ex-fila"><span class="ex-et">${corto(b)}</span><div class="ex-pista" tabindex="0" data-tip="${encodeURIComponent(tip)}" aria-label="${b.titulo}: ${oficiales.length} de Compruébalo y ${practica.length} de práctica"><i class="ex-barra of" style="width:${(oficiales.length / max) * 100}%"></i><i class="ex-barra pr" style="width:${(practica.length / max) * 100}%"></i><b class="ex-val">${n}</b></div></div>`;
    })
    .join('');
  const leyenda = `<div class="ex-ley"><span><i class="of"></i>Compruébalo · miden tu dominio</span><span><i class="pr"></i>Práctica · de tus apuntes</span></div>`;
  return `<figure class="ex-graf"><figcaption><h3>Preguntas para entrenar cada bloque</h3><small>Número de preguntas tipo test disponibles</small></figcaption>${leyenda}${filas}<div class="ex-fila"><span></span>${eje(max, 10)}</div></figure>`;
}

function diagrama(datos: DatosBloque[], estado: EstadoEstudio): string {
  const { tema, progreso } = estado;
  const columnas = datos
    .map(({ bloque: b, dominio }, i) => {
      const chips = b.conceptoIds
        .map((id) => {
          const c = tema.conceptos.find((x) => x.id === id);
          if (!c) return '';
          return `<a class="ex-chip" href="${hrefConcepto(id)}" style="--d:${colorDominio(dominioConcepto(progreso, id))}">${c.nombre}</a>`;
        })
        .join('');
      return `<div class="ex-bloque" style="flex-grow:${b.probabilidad}"><div class="ex-bh"><span class="ex-rank">${i + 1}</span><b class="ex-pct">${b.probabilidad} %</b></div><h4>${b.titulo}</h4><div class="ex-dom"><i style="width:${dominio * 100}%;background:${colorDominio(dominio)}"></i></div><small class="ex-domt">Tu dominio: ${porcentaje(dominio)} · ${b.conceptoIds.length} conceptos</small><div class="ex-chips">${chips}</div></div>`;
    })
    .join('');
  return `<section class="ex-sec"><h2>Mapa del examen</h2><p class="ex-intro">De más a menos probable, con los conceptos de cada bloque. Los conceptos llevan el color de tu dominio; pulsa uno para ir a su ficha.</p><div class="ex-raiz">Examen · Tema ${tema.meta.numero}</div><div class="ex-diag">${columnas}</div></section>`;
}

function tabla(datos: DatosBloque[]): string {
  const filas = datos
    .map((d) => `<tr><th scope="row">${d.bloque.titulo}</th><td>${d.bloque.probabilidad} %</td><td>${d.oficiales.length}</td><td>${d.practica.length}</td><td>${porcentaje(d.dominio)}</td></tr>`)
    .join('');
  return `<details class="ex-tabla"><summary>Ver los datos en tabla</summary><div class="ex-tw"><table><thead><tr><th scope="col">Bloque</th><th scope="col">Probabilidad</th><th scope="col">Compruébalo</th><th scope="col">Práctica</th><th scope="col">Tu dominio</th></tr></thead><tbody>${filas}</tbody></table></div></details>`;
}

function porDondeEmpezar(datos: DatosBloque[]): string {
  const orden = [...datos].sort((a, b) => b.prioridad - a.prioridad);
  if (orden.every((d) => d.prioridad === 0)) return `<p class="ex-intro">Dominas todos los bloques. Repasa con los simulacros.</p>`;
  return `<ol class="ex-orden">${orden
    .filter((d) => d.prioridad > 0)
    .slice(0, 3)
    .map((d) => `<li><a href="#ex-${d.bloque.id}"><b>${d.bloque.titulo}</b></a><small>${d.bloque.probabilidad} % del examen · dominas el ${porcentaje(d.dominio)}</small></li>`)
    .join('')}</ol>`;
}

function fichaBloque(d: DatosBloque, i: number): string {
  const b = d.bloque;
  const n = d.oficiales.length + d.practica.length;
  return `<article class="cc ex-ficha rev" id="ex-${b.id}" data-bloque="${b.id}"><div class="kick"><span class="pill k">#${i + 1}</span><span class="pill">${b.probabilidad} % estimado</span><span class="pill" style="border-color:${colorDominio(d.dominio)}">Dominio ${porcentaje(d.dominio)}</span></div><h2>${b.titulo}</h2><p class="ex-formato">${b.formato}</p><h5>Qué te preguntarán</h5><ul class="ex-claves">${b.claves.map((k) => `<li>${k}</li>`).join('')}</ul><div class="acts"><button type="button" class="ab p" data-sim="abrir" aria-expanded="false">🎯 Simulacro del bloque (${n} preguntas)</button></div><div class="pn p" hidden></div></article>`;
}

/**
 * Predicción de examen: probabilidad estimada de cada bloque (según los apuntes del alumno),
 * preguntas disponibles, mapa de bloques → conceptos con el dominio y un simulacro por bloque.
 * El simulacro es práctica: no cambia el dominio (que solo mide "Compruébalo" en cada ficha).
 */
export function pintarExamen(ctx: ContextoVista, estado: EstadoEstudio): void {
  const datos = datosDe(estado);
  const fuente = estado.tema.ampliacion?.fuente ?? '';
  ctx.pagina.innerHTML = `<div class="ex" data-examen><header class="sh"><div class="kick"><span class="pill k">📊 Predicción</span><span class="pill">Fuente: ${fuente}</span></div><h1>¿Qué caerá en el examen?</h1><p>Los cinco bloques del tema, ordenados por la probabilidad de que salgan. Es una estimación de tus apuntes, no un dato oficial.</p></header>
<section class="ex-sec"><h2>Por dónde empezar</h2><p class="ex-intro">Lo que más cae y menos dominas.</p>${porDondeEmpezar(datos)}</section>
${diagrama(datos, estado)}
<section class="ex-sec"><h2>En cifras</h2><div class="ex-grafs">${graficoProbabilidad(datos)}${graficoPreguntas(datos)}</div>${tabla(datos)}</section>
<section class="ex-sec"><h2>Bloque a bloque</h2>${datos.map(fichaBloque).join('')}</section>
<div class="ex-tip" role="tooltip" hidden></div></div>`;
  ctx.tituloMovil.textContent = 'Predicción de examen';

  const raiz = ctx.pagina.querySelector<HTMLElement>('[data-examen]')!;
  conectarTooltip(raiz);
  raiz.addEventListener('click', (e) => {
    const boton = (e.target as Element).closest<HTMLElement>('[data-sim]');
    const ficha = boton?.closest<HTMLElement>('[data-bloque]');
    const d = datos.find((x) => x.bloque.id === ficha?.dataset.bloque);
    if (!boton || !ficha || !d) return;
    const panel = ficha.querySelector<HTMLElement>('.pn.p')!;
    if (boton.dataset.sim === 'abrir') {
      const abierto = !panel.hidden;
      panel.hidden = abierto;
      boton.setAttribute('aria-expanded', String(!abierto));
      if (!abierto) pintarSimulacro(ficha, panel, d, Number(ficha.dataset.si || 0));
    } else {
      pintarSimulacro(ficha, panel, d, Number(ficha.dataset.si || 0) + 1);
    }
  });
}

function pintarSimulacro(ficha: HTMLElement, panel: HTMLElement, d: DatosBloque, indice: number): void {
  const lista = [...d.oficiales, ...d.practica];
  const i = indice % lista.length;
  ficha.dataset.si = String(i);
  const pregunta = lista[i]!;
  const pie = `<div class="pq-pie"><span>Simulacro ${i + 1} / ${lista.length} · no cambia tu dominio</span><button type="button" class="fc-btn" data-sim="siguiente">Siguiente →</button></div>`;
  pintarPreguntaEn(panel, pregunta, (k) => k === pregunta.indiceCorrecta, pie);
}

/** Tooltip compartido de los gráficos: aparece al pasar el ratón o al enfocar una barra. */
function conectarTooltip(raiz: HTMLElement): void {
  const tip = raiz.querySelector<HTMLElement>('.ex-tip')!;
  const mostrar = (el: HTMLElement, x: number, y: number) => {
    tip.innerHTML = decodeURIComponent(el.dataset.tip ?? '');
    tip.hidden = false;
    const caja = raiz.getBoundingClientRect();
    const ancho = tip.offsetWidth;
    tip.style.left = `${Math.max(0, Math.min(caja.width - ancho, x - caja.left + 14))}px`;
    tip.style.top = `${y - caja.top + 16}px`;
  };
  raiz.addEventListener('pointermove', (e) => {
    const el = (e.target as Element).closest<HTMLElement>('[data-tip]');
    if (el) mostrar(el, e.clientX, e.clientY);
    else tip.hidden = true;
  });
  raiz.addEventListener('pointerleave', () => (tip.hidden = true));
  raiz.addEventListener('focusin', (e) => {
    const el = (e.target as Element).closest<HTMLElement>('[data-tip]');
    if (!el) return;
    const r = el.getBoundingClientRect();
    mostrar(el, r.left + r.width / 2, r.bottom - 8);
  });
  raiz.addEventListener('focusout', () => (tip.hidden = true));
}
