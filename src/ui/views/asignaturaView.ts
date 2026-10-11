import { hrefAcademia, hrefExamen, hrefInicio, hrefProgreso, hrefRepaso, hrefSesion, hrefSimulacro, hrefVisual } from '../../app/router.ts';
import type { EstadoEstudio } from '../../app/store.ts';
import type { EstadoPractica } from '../../app/practiceStore.ts';
import { type Asignatura, ASIGNATURAS } from '../../content/academia.ts';
import type { TemaCatalogo } from '../../content/temas/index.ts';
import { EJERCICIOS_TEMA2 } from '../../content/temas/tema-02/ejercicios.ts';
import { BLOQUES, formulaPorId, formulasDe, FORMULAS_TEMA2, type BloqueId } from '../../content/temas/tema-02/formulas.ts';
import { dominioGlobal } from '../../domain/mastery.ts';
import { ESCENAS } from '../escenas/index.ts';
import { formulaHtml } from '../matematica/formula.ts';
import { montarEditorial, navegacionEditorial, ROMANOS, sumarioEditorial } from '../components/editorial.ts';
import { conectarMiniaturas, type FuenteExpandible, miniaturaHtml } from '../components/reproductorExpandido.ts';
import { escaparHtml } from '../components/simbolos.ts';
import { porcentaje } from '../format.ts';
import type { UltimoSitio } from './academiaView.ts';
import type { ContextoVista } from './context.ts';
import cielo from '../../assets/mundos/cielo.webp';
import niebla from '../../assets/mundos/niebla.webp';
import videoSistemaFinancieroMp4 from '../../../video/sistema-financiero.mp4';
import videoSistemaFinancieroWebm from '../../../video/sistema-financiero.webm';

/*
 * Portada de una asignatura con la identidad editorial: una apertura con una sola acción principal,
 * sus temas como capítulos con identidad propia (el I es noche y ciudad; el II, papel y tinta), el
 * Cuaderno de estudio con las herramientas de siempre, el Atlas como sección propia y el temario
 * completo en el Sumario. Mismas rutas y mismos datos que antes: solo cambia la presentación.
 */

/** Vídeos y animaciones que se abren con la expansión cinematográfica desde esta portada. */
const MEDIOS: Readonly<Record<string, FuenteExpandible>> = {
  'sistema-financiero': {
    tipo: 'video',
    // WebM (VP9) primero: lo reproducen también los navegadores sin H.264; si no, el MP4.
    archivos: [{ src: videoSistemaFinancieroWebm, tipo: 'video/webm' }, { src: videoSistemaFinancieroMp4, tipo: 'video/mp4' }],
    titulo: 'El sistema financiero español',
    volanta: 'Capítulo I · Vídeo',
    duracion: 72,
    fotogramaMiniatura: 3,
    nota: 'Vídeo sin sonido: los rótulos y las explicaciones van en la imagen.',
  },
  'simple-intereses': { tipo: 'escena', escena: ESCENAS['simple-intereses']!, volanta: 'Capítulo II · Fórmula 1' },
};

function formulaAnotada(): string {
  // La composición con la que termina la animación de la fórmula 1: cada símbolo con su significado.
  const notas: [string, string][] = [['I', 'Intereses totales'], ['C_0', 'Capital inicial'], ['n', 'Número de periodos'], ['i', 'Tipo por periodo']];
  return `<div class="ed-anotada">
    <p class="ed-anotada-fx">${formulaHtml('I = C_0 · n · i')}</p>
    <ul>${notas.map(([s, t]) => `<li>${formulaHtml(s)}<span>${t}</span></li>`).join('')}</ul>
  </div>`;
}

/** «El sistema financiero español» → las últimas n palabras en cursiva (la voz del titular). */
function cursivaFinal(titulo: string, n: number): string {
  const palabras = titulo.split(' ');
  if (palabras.length <= n) return escaparHtml(titulo);
  return `${escaparHtml(palabras.slice(0, -n).join(' '))} <em>${escaparHtml(palabras.slice(-n).join(' '))}</em>`;
}

/** Atlas: constelación con los datos reales de los dos capítulos y las relaciones entre fórmulas. */
function atlas(estado: EstadoEstudio): string {
  const { tema } = estado;
  const W = 1000;
  const H = 520;
  let nodos = '';
  let lineas = '';
  const ficha = (x: number, y: number, texto: string, giro: number, clase = '') => {
    const ancho = texto.length * 6.4 + 30;
    return `<g class="ficha ${clase}" transform="translate(${x} ${y}) rotate(${giro})"><rect x="${-ancho / 2}" y="-16" width="${ancho}" height="32"/><text y="4">${escaparHtml(texto)}</text></g>`;
  };
  const centros1: [number, number][] = [[150, 110], [380, 120], [170, 360], [400, 370]];
  tema.grupos.forEach((g, gi) => {
    const [cx, cy] = centros1[gi % centros1.length]!;
    const secs = tema.secciones.filter((s) => s.grupoId === g.id);
    secs.forEach((s, si) => {
      const a = (si / Math.max(1, secs.length)) * Math.PI * 2 + gi * 0.9 + 0.4;
      const r = secs.length > 1 ? 82 : 70;
      const sx = cx + Math.cos(a) * r;
      const sy = cy + Math.sin(a) * r * 0.78;
      lineas += `<line x1="${cx}" y1="${cy}" x2="${sx.toFixed(1)}" y2="${sy.toFixed(1)}"/>`;
      const cs = tema.conceptos.filter((c) => c.seccionId === s.id);
      cs.forEach((c, ci) => {
        const b = a + (ci - (cs.length - 1) / 2) * 0.28;
        const x = sx + Math.cos(b) * 40;
        const y = sy + Math.sin(b) * 34;
        lineas += `<line class="fina" x1="${sx.toFixed(1)}" y1="${sy.toFixed(1)}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"/>`;
        nodos += `<circle class="concepto" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3"><title>${escaparHtml(c.nombre)}</title></circle>`;
      });
      nodos += `<circle class="apartado" cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="5.5"><title>${escaparHtml(s.titulo)}</title></circle>`;
    });
  });
  tema.grupos.forEach((g, gi) => {
    const [cx, cy] = centros1[gi % centros1.length]!;
    nodos += ficha(cx, cy, g.titulo.replace(/^\d+\s·\s/, ''), gi % 2 ? 2 : -2);
  });
  const centros2: Record<BloqueId, [number, number]> = { simple: [660, 120], compuesta: [870, 280], descuento: [650, 410] };
  const pos = new Map<string, [number, number]>();
  BLOQUES.forEach((b, bi) => {
    const [cx, cy] = centros2[b.id];
    const fs = formulasDe(b.id);
    fs.forEach((f, fi) => {
      const a = (fi / fs.length) * Math.PI * 2 + bi * 0.7 + 0.3;
      const x = cx + Math.cos(a) * 92;
      const y = cy + Math.sin(a) * 66;
      pos.set(f.id, [x, y]);
      lineas += `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"/>`;
    });
  });
  // Relaciones reales entre partes: el descuento racional sale del capital inicial.
  const puente = (a: string, b: string) => {
    const [x1, y1] = pos.get(a)!;
    const [x2, y2] = pos.get(b)!;
    return `<path class="puente" d="M${x1.toFixed(1)} ${y1.toFixed(1)} C ${((x1 + x2) / 2 + 40).toFixed(1)} ${y1.toFixed(1)}, ${((x1 + x2) / 2 - 40).toFixed(1)} ${y2.toFixed(1)}, ${x2.toFixed(1)} ${y2.toFixed(1)}"/>`;
  };
  lineas += puente('simple-capital-inicial', 'descuento-racional') + puente('compuesta-capital-inicial', 'descuento-compuesto-racional');
  pos.forEach(([x, y], id) => {
    const f = formulaPorId(id)!;
    nodos += `<g class="formula"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="11"/><text x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}">${f.numero}</text><title>${escaparHtml(f.nombre)}</title></g>`;
  });
  BLOQUES.forEach((b, bi) => {
    const [cx, cy] = centros2[b.id];
    nodos += ficha(cx, cy, b.titulo, bi % 2 ? -2 : 2, 'ficha-papel');
  });
  return `<svg class="ed-atlas-mapa" viewBox="0 0 ${W} ${H}" role="img" aria-label="Mapa de conceptos de los dos capítulos">
    <g class="lineas">${lineas}</g><g>${nodos}</g>
    <text class="rotulo" x="40" y="${H - 14}">Capítulo I · ${tema.conceptos.length} conceptos en ${tema.secciones.length} apartados</text>
    <text class="rotulo" x="560" y="${H - 14}">Capítulo II · ${FORMULAS_TEMA2.length} fórmulas · — relaciones entre partes</text>
  </svg>`;
}

/** Capítulo de un tema que se explora en la ciudad (noche, con el vídeo del tema). */
function capituloCiudad(t: TemaCatalogo, k: number, estado: EstadoEstudio): string {
  const { tema } = estado;
  const dominio = t.numero === tema.meta.numero ? `<div><dt>Tu dominio</dt><dd>${porcentaje(dominioGlobal(tema, estado.progreso))}</dd></div>` : '';
  return `<article class="ed-cap ed-cap-1" aria-labelledby="ed-cap${k}-t">
    <figure class="ed-cap-visual ed-cap-video">
      ${miniaturaHtml('sistema-financiero', MEDIOS['sistema-financiero']!)}
      <figcaption class="ed-leyenda-foto">«El sistema financiero español», el capítulo en un minuto · vídeo</figcaption>
    </figure>
    <div class="ed-cap-texto">
      <span class="ed-cap-num" aria-hidden="true">${ROMANOS[k]}</span>
      <p class="ed-volanta">Capítulo ${ROMANOS[k]} · Exploración 3D</p>
      <h3 id="ed-cap${k}-t">${cursivaFinal(t.titulo, 1)}</h3>
      <p>${escaparHtml(t.descripcion)} Cada edificio es una institución; cada calle, un flujo de dinero.</p>
      <dl class="ed-datos"><div><dt>Bloques</dt><dd>${tema.grupos.length}</dd></div><div><dt>Apartados</dt><dd>${tema.secciones.length}</dd></div><div><dt>Conceptos</dt><dd>${tema.conceptos.length}</dd></div>${dominio}</dl>
      <a class="ed-enlace-fuerte" href="${t.href}">Entrar en la ciudad <span aria-hidden="true">→</span></a>
    </div>
  </article>`;
}

/** Capítulo de un tema que es una lección con animaciones (papel y tinta). */
function capituloLeccion(t: TemaCatalogo, k: number): string {
  return `<article class="ed-cap ed-cap-2" aria-labelledby="ed-cap${k}-t">
    <div class="ed-cap-texto">
      <span class="ed-cap-num" aria-hidden="true">${ROMANOS[k]}</span>
      <p class="ed-volanta">Capítulo ${ROMANOS[k]} · Lección con animaciones</p>
      <h3 id="ed-cap${k}-t">${cursivaFinal(t.titulo, 2)}</h3>
      <p>${FORMULAS_TEMA2.length} fórmulas explicadas con animaciones, y un recorrido para usarlas solo: identificar los datos, elegir la fórmula y resolver en papel.</p>
      <dl class="ed-datos"><div><dt>Partes</dt><dd>${BLOQUES.length}</dd></div><div><dt>Fórmulas animadas</dt><dd>${FORMULAS_TEMA2.length}</dd></div><div><dt>Enunciados</dt><dd>${EJERCICIOS_TEMA2.length}</dd></div></dl>
      <a class="ed-enlace-fuerte" href="${t.href}">Abrir el índice de fórmulas <span aria-hidden="true">→</span></a>
    </div>
    <figure class="ed-cap-visual ed-cap-visual-papel">
      ${miniaturaHtml('simple-intereses', MEDIOS['simple-intereses']!, 'vx-papel')}
      <figcaption class="ed-leyenda-foto">Fórmula 1 · «${escaparHtml(ESCENAS['simple-intereses']!.titulo)}»</figcaption>
    </figure>
  </article>`;
}

/** Cuaderno de estudio: las herramientas del Tema 1, una destacada y el resto como lista. */
function cuaderno(estado: EstadoEstudio, practica: EstadoPractica | undefined): string {
  const { tema } = estado;
  if (!tema.ampliacion?.bloques.length) return '';
  const n = practica?.pendientes() ?? 0;
  const item = (href: string, titulo: string, texto: string, extra = '') => `<li><a href="${href}"><b>${titulo}${extra}</b><span>${texto}</span></a></li>`;
  return `<section class="ed-cuaderno" aria-labelledby="ed-cuaderno-t">
    <header><p class="ed-volanta">Cuaderno de estudio · Capítulo I</p><h2 id="ed-cuaderno-t">Para cuando toque <em>repasar</em></h2></header>
    <a class="ed-cuaderno-hoy" href="${hrefSesion()}"><small>Estudiar hoy</small><b>${n ? `${n} repasos pendientes` : 'Una sesión corta, a tu ritmo'}</b><span aria-hidden="true">→</span></a>
    <ul class="ed-cuaderno-lista">
      ${item(hrefExamen(), 'Predicción de examen', 'Qué apartados pesan más y cómo vas en cada uno.')}
      ${item(hrefSimulacro(), 'Simulacro', 'Preguntas con tiempo, como el día del examen.')}
      ${item(hrefRepaso(), 'Repaso', 'Lo que toca volver a ver hoy.', n ? ` <span class="ed-insignia" aria-label="${n} pendientes">${n}</span>` : '')}
      ${tema.ampliacion.infografias?.length ? item(hrefVisual(), 'Infografías', 'Los esquemas del capítulo, de un vistazo.') : ''}
      ${item(hrefProgreso(), 'Mi progreso', 'Tu dominio por apartado.')}
    </ul>
  </section>`;
}

/** «Gestión Financiera» → la primera palabra en romana y el resto en cursiva. */
function titular(nombre: string): string {
  const [primera, ...resto] = nombre.split(' ');
  return `<span>${escaparHtml(primera ?? '')}</span>${resto.length ? ` <em>${escaparHtml(resto.join(' '))}</em>` : ''}`;
}

export function pintarAsignatura(ctx: ContextoVista, a: Asignatura, estado: EstadoEstudio, practica?: EstadoPractica, ultimo?: UltimoSitio): () => void {
  const numero = ASIGNATURAS.indexOf(a) + 1;
  const ciudad = a.temas.find((t) => t.experiencia === 'ciudad-3d');
  const leccion = a.temas.find((t) => t.experiencia !== 'ciudad-3d');
  // El índice de fórmulas del capítulo II siempre está a la vista, junto al botón principal.
  const indiceFormulas = leccion ? `<a class="ed-boton ed-boton-papel" href="${leccion.href}"><small>Capítulo II · ${FORMULAS_TEMA2.length} fórmulas</small>Abrir el índice de fórmulas</a>` : '';
  const cta = ultimo
    ? `<a class="ed-boton" href="${ultimo.href}"><small>Continuar donde lo dejaste</small>${escaparHtml(ultimo.titulo)}</a>${indiceFormulas}${ciudad ? `<a class="ed-enlace" href="${ciudad.href}">o vuelve al capítulo I →</a>` : ''}`
    : `<a class="ed-boton" href="${a.temas[0]?.href ?? hrefInicio()}"><small>Empezar</small>Capítulo I · ${escaparHtml(a.temas[0]?.titulo ?? '')}</a>${indiceFormulas}`;
  ctx.pagina.innerHTML = `<div class="ed-pagina ed-pagina-noche ed-portada" style="--c:${a.color}">
  ${navegacionEditorial('noche', [{ texto: 'Academia', href: hrefAcademia() }, { texto: a.nombre }])}
  <div class="ed">
    <section class="ed-apertura" aria-labelledby="ed-titular">
      <div class="ed-apertura-fondo" style="background-image:url(${cielo})" aria-hidden="true"></div>
      <div class="ed-apertura-texto">
        <p class="ed-volanta">Asignatura ${String(numero).padStart(2, '0')} · Ciclo de Administración y Finanzas</p>
        <h1 class="ed-titular" id="ed-titular">${titular(a.nombre)}</h1>
        <p class="ed-entradilla">Una obra en ${a.temas.length === 2 ? 'dos' : a.temas.length} capítulos. Primero, por dónde viaja el dinero entre quien ahorra y quien invierte. Después, cuánto vale ese dinero cuando pasa el tiempo.</p>
        <div class="ed-cta">${cta}</div>
      </div>
      <div class="ed-collage" aria-hidden="true">
        <img class="ed-niebla n1" src="${niebla}" alt="">
        <img class="ed-niebla n2" src="${niebla}" alt="">
        <figure class="ed-recorte ed-recorte-papel">${formulaAnotada()}<figcaption>II · El cálculo financiero</figcaption></figure>
      </div>
    </section>

    <section class="ed-capitulos" aria-labelledby="ed-caps-t">
      <header class="ed-seccion-cab"><p class="ed-volanta">Índice de la obra</p><h2 id="ed-caps-t">Dos capítulos, <em>dos maneras</em> de estudiar</h2></header>
      ${a.temas.map((t, k) => (t.experiencia === 'ciudad-3d' ? capituloCiudad(t, k, estado) : capituloLeccion(t, k))).join('')}
    </section>

    ${cuaderno(estado, practica)}

    <section class="ed-atlas" aria-labelledby="ed-atlas-t">
      <div class="ed-atlas-texto">
        <p class="ed-volanta">Atlas del conocimiento</p>
        <h2 id="ed-atlas-t">Todo está <em>conectado</em></h2>
        <p>Un mapa para explorar cómo se relacionan los conceptos de los dos capítulos. Es para curiosear y repasar relaciones: no hace falta para estudiar las lecciones.</p>
        <a class="ed-enlace-fuerte" href="${hrefInicio()}">Abrir el Atlas <span aria-hidden="true">→</span></a>
        <p class="ed-nota-pie">Se abre dentro de la Ciudad del Dinero.</p>
      </div>
      ${atlas(estado)}
    </section>

    <footer class="ed-pie">
      <p>¿Buscas un apartado concreto?</p>
      <button type="button" class="ed-enlace-fuerte" data-sumario>Abrir el sumario y buscar <span aria-hidden="true">→</span></button>
    </footer>
  </div>
  ${sumarioEditorial(a, estado, ultimo)}
</div>`;
  ctx.tituloMovil.textContent = a.nombre;
  const raiz = ctx.pagina.querySelector<HTMLElement>('.ed-pagina')!;
  const paradas = [montarEditorial(raiz), conectarMiniaturas(raiz, MEDIOS)];
  return () => paradas.forEach((p) => p());
}
