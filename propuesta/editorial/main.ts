/*
 * PROPUESTA VISUAL (no es la web) · dirección editorial aprobada, fase de consolidación.
 *   npm run dev → /propuesta/editorial/?pantalla=portada | indice | animacion
 *   Opciones: &sumario (sumario abierto) · &limpio (sin la barra de la maqueta) · &quieto (sin autoplay)
 *
 * Página aislada: no sustituye ninguna pantalla ni entra en el build. Usa los datos, el progreso,
 * las rutas, el temario, las imágenes y el motor de animación reales del proyecto, para demostrar
 * que el diseño se puede aplicar sobre la arquitectura actual. El selector de mundos no se toca.
 */
import '../../src/styles/fuentes.css';
import '../../src/styles/base.css';
import '../../src/styles/tema2.css';
import './editorial.css';
import './referencia/referencia.css';
import { hrefAcademia, hrefAsignatura, hrefExamen, hrefFase, hrefFormula, hrefInicio, hrefProgreso, hrefRepaso, hrefSesion, hrefSimulacro, hrefTema2, hrefVisual } from '../../src/app/router.ts';
import { EstadoEstudio } from '../../src/app/store.ts';
import { EstadoPractica } from '../../src/app/practiceStore.ts';
import { ASIGNATURAS, ID_GESTION_FINANCIERA } from '../../src/content/academia.ts';
import { tema01 } from '../../src/content/temas/tema-01/index.ts';
import { tema02 } from '../../src/content/temas/tema-02/index.ts';
import { BLOQUES, formulaPorId, formulasDe, FORMULAS_TEMA2, type BloqueId } from '../../src/content/temas/tema-02/formulas.ts';
import { EJERCICIOS_TEMA2 } from '../../src/content/temas/tema-02/ejercicios.ts';
import { dominioGlobal } from '../../src/domain/mastery.ts';
import { almacenNavegador, leerJson } from '../../src/persistence/storage.ts';
import { conectarBuscadorTemario, temarioHtml } from '../../src/ui/components/temario.ts';
import { ESCENAS } from '../../src/ui/escenas/index.ts';
import { formulaHtml } from '../../src/ui/matematica/formula.ts';
import { finCapitulo, montarReproductor, pintarFotograma, textoConFormulas, type Escena } from '../../src/ui/motion/reproductor.ts';
import { escaparHtml } from '../../src/ui/components/simbolos.ts';
import { escenaReferencia } from './referencia/escena.ts';
import cielo from '../../src/assets/mundos/cielo.webp';
import isla from '../../src/assets/mundos/isla-gestion-financiera.webp';
import niebla from '../../src/assets/mundos/niebla.webp';

type Pantalla = 'portada' | 'indice' | 'animacion';
const raiz = document.querySelector<HTMLElement>('#propuesta')!;
const q = new URLSearchParams(location.search);
const pantalla: Pantalla = q.get('pantalla') === 'indice' ? 'indice' : q.get('pantalla') === 'animacion' ? 'animacion' : 'portada';
if (q.has('limpio')) document.body.classList.add('limpio');

const almacen = almacenNavegador();
const estado = new EstadoEstudio(tema01, almacen);
const practica = new EstadoPractica(tema01, almacen);
const gf = ASIGNATURAS.find((a) => a.id === ID_GESTION_FINANCIERA)!;
const numeroAsignatura = ASIGNATURAS.indexOf(gf) + 1;
/** Mismo dato que usa la web (CLAVE_ULTIMO en src/app/app.ts): último sitio de cada asignatura. */
const ultimo = (leerJson(almacen, 'financial-academy:ultimo') as Record<string, { href: string; titulo: string }> | null)?.[gf.id];
const ESCENAS_VISTA: Record<string, Escena> = { ...ESCENAS, [escenaReferencia.id]: escenaReferencia };
const pct = (v: number) => `${Math.round(v * 100)} %`;
const duracion = (id: string) => {
  const s = Math.round(ESCENAS_VISTA[id]?.duracion ?? 0);
  return `0:${String(s).padStart(2, '0')}`;
};
const ROMANOS = ['I', 'II', 'III'];

/* ------------------------------------------------------------------ navegación global */

/**
 * Una barra discreta: marca, dónde estás y cuatro accesos. En el móvil, los accesos van en un menú.
 * El temario no está aquí: está en el Sumario (una capa), para no repetirlo en ninguna barra lateral.
 */
function navegacion(variante: 'noche' | 'papel', ruta: string): string {
  const accesos = `
      <button type="button" class="ed-accion" data-sumario aria-haspopup="dialog"><span class="ed-ico ed-ico-sumario" aria-hidden="true"></span>Sumario</button>
      <a class="ed-accion" href="${hrefInicio()}" title="Hoy el Atlas se abre dentro de la Ciudad del Dinero"><span class="ed-ico ed-ico-atlas" aria-hidden="true"></span>Atlas</a>
      <a class="ed-accion" href="${hrefSesion()}">Cuaderno</a>
      <a class="ed-accion" href="${hrefProgreso()}">Mi progreso</a>`;
  return `<header class="ed-nav ed-nav-${variante}" data-nav>
    <a class="ed-marca" href="${hrefAcademia()}"><b>Financial</b><b>Academy</b></a>
    <nav class="ed-migas" aria-label="Estás en">${ruta}</nav>
    <nav class="ed-acciones" aria-label="Accesos">${accesos}</nav>
    <button type="button" class="ed-menu-boton" data-menu aria-expanded="false" aria-controls="ed-menu"><span aria-hidden="true"></span>Menú</button>
    <div class="ed-menu" id="ed-menu" hidden>
      <p class="ed-menu-ruta">${ruta}</p>
      <nav aria-label="Accesos">${accesos}<a class="ed-accion" href="${hrefAcademia()}">Academia · todas las asignaturas</a></nav>
    </div>
  </header>`;
}

/** Sumario: el temario real (src/ui/components/temario.ts), con su buscador y tu dominio. */
function sumario(): string {
  const continuar = ultimo
    ? `<a class="ed-sumario-continuar" href="${ultimo.href}"><small>Continuar donde lo dejaste</small>${escaparHtml(ultimo.titulo)} →</a>`
    : '';
  return `<div class="ed-sumario" data-capa-sumario hidden role="dialog" aria-modal="true" aria-labelledby="ed-sumario-t">
    <div class="ed-sumario-hoja" data-temario>
      <header>
        <p class="ed-volanta">${escaparHtml(gf.nombre)} · ${gf.temas.length} capítulos</p>
        <h2 id="ed-sumario-t">Sumario</h2>
        <button type="button" class="ed-cerrar" data-cerrar-sumario>Cerrar <span aria-hidden="true">×</span></button>
        <label class="ed-buscar"><span class="sr">Buscar en el sumario</span><input type="search" data-tm-buscar placeholder="Buscar: 3.2B, bancos, TAE, descuento…"></label>
        ${continuar}
      </header>
      <div class="ed-sumario-columnas">${gf.temas.map((t, k) => `<section class="ed-sumario-cap-${k + 1}"><p class="ed-sumario-cap"><span>${ROMANOS[k]}</span>${escaparHtml(t.titulo)}</p>${temarioHtml(t, estado)}</section>`).join('')}</div>
      <p class="ed-sumario-vacio" data-tm-vacio hidden>Nada coincide con la búsqueda.</p>
    </div>
  </div>`;
}

/* ----------------------------------------------------------------------------- portada */

function formulaAnotada(): string {
  const notas: [string, string][] = [['I', 'Intereses totales'], ['C_0', 'Capital inicial'], ['n', 'Número de periodos'], ['i', 'Tipo por periodo']];
  return `<div class="ed-anotada">
    <p class="ed-anotada-fx">${formulaHtml('I = C_0 · n · i')}</p>
    <ul>${notas.map(([s, t]) => `<li>${formulaHtml(s)}<span>${t}</span></li>`).join('')}</ul>
  </div>`;
}

function atlas(): string {
  // Constelación con los datos reales: bloques, apartados y conceptos del Tema 1; partes, fórmulas y
  // relaciones del Tema 2. Las fichas son las puertas; los puntos, lo que hay dentro.
  const W = 1000;
  const H = 520;
  let nodos = '';
  let lineas = '';
  const ficha = (x: number, y: number, texto: string, giro: number, clase = '') => {
    const ancho = texto.length * 6.4 + 30;
    return `<g class="ficha ${clase}" transform="translate(${x} ${y}) rotate(${giro})"><rect x="${-ancho / 2}" y="-16" width="${ancho}" height="32"/><text y="4">${escaparHtml(texto)}</text></g>`;
  };
  const centros1: [number, number][] = [[150, 110], [380, 120], [170, 360], [400, 370]];
  tema01.grupos.forEach((g, gi) => {
    const [cx, cy] = centros1[gi]!;
    const secs = tema01.secciones.filter((s) => s.grupoId === g.id);
    secs.forEach((s, si) => {
      const a = (si / Math.max(1, secs.length)) * Math.PI * 2 + gi * 0.9 + 0.4;
      const r = secs.length > 1 ? 82 : 70;
      const sx = cx + Math.cos(a) * r;
      const sy = cy + Math.sin(a) * r * 0.78;
      lineas += `<line x1="${cx}" y1="${cy}" x2="${sx.toFixed(1)}" y2="${sy.toFixed(1)}"/>`;
      const cs = tema01.conceptos.filter((c) => c.seccionId === s.id);
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
  tema01.grupos.forEach((g, gi) => {
    const [cx, cy] = centros1[gi]!;
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
    <text class="rotulo" x="40" y="${H - 14}">Capítulo I · ${tema01.conceptos.length} conceptos en ${tema01.secciones.length} apartados</text>
    <text class="rotulo" x="560" y="${H - 14}">Capítulo II · ${FORMULAS_TEMA2.length} fórmulas · — relaciones entre partes</text>
  </svg>`;
}

function portada(): string {
  const dominio = dominioGlobal(tema01, estado.progreso);
  const pendientes = practica.pendientes();
  const [t1, t2] = gf.temas as [(typeof gf.temas)[number], (typeof gf.temas)[number]];
  const cta = ultimo
    ? `<a class="ed-boton" href="${ultimo.href}"><small>Continuar donde lo dejaste</small>${escaparHtml(ultimo.titulo)}</a><a class="ed-enlace" href="${t1.href}">o vuelve al capítulo I →</a>`
    : `<a class="ed-boton" href="${t1.href}"><small>Empezar</small>Capítulo I · La Ciudad del Dinero</a><a class="ed-enlace" href="${t2.href}">o ve al capítulo II →</a>`;
  return `${navegacion('noche', `<a href="${hrefAcademia()}">Academia</a><span>/</span><b>${gf.nombre}</b>`)}
  <main class="ed ed-portada" id="contenido">
    <section class="ed-apertura" aria-labelledby="ed-titular">
      <div class="ed-apertura-fondo" style="background-image:url(${cielo})" aria-hidden="true"></div>
      <div class="ed-apertura-texto">
        <p class="ed-volanta">Asignatura ${String(numeroAsignatura).padStart(2, '0')} · Ciclo de Administración y Finanzas</p>
        <h1 class="ed-titular" id="ed-titular"><span>Gestión</span> <em>Financiera</em></h1>
        <p class="ed-entradilla">Una obra en dos capítulos. Primero, por dónde viaja el dinero entre quien ahorra y quien invierte. Después, cuánto vale ese dinero cuando pasa el tiempo.</p>
        <div class="ed-cta">${cta}</div>
      </div>
      <div class="ed-collage" aria-hidden="true">
        <img class="ed-isla" src="${isla}" alt="">
        <img class="ed-niebla n1" src="${niebla}" alt="">
        <img class="ed-niebla n2" src="${niebla}" alt="">
        <figure class="ed-recorte ed-recorte-papel">${formulaAnotada()}<figcaption>II · El cálculo financiero</figcaption></figure>
        <p class="ed-pie-collage"><span>I</span> La Ciudad del Dinero</p>
      </div>
    </section>

    <section class="ed-capitulos" aria-labelledby="ed-caps-t">
      <header class="ed-seccion-cab"><p class="ed-volanta">Índice de la obra</p><h2 id="ed-caps-t">Dos capítulos, <em>dos maneras</em> de estudiar</h2></header>
      <article class="ed-cap ed-cap-1" aria-labelledby="ed-cap1-t">
        <div class="ed-cap-visual" style="background-image:url(${cielo})"><img src="${isla}" alt="La Ciudad del Dinero: los edificios del sistema financiero sobre una isla"><img class="ed-niebla n3" src="${niebla}" alt=""></div>
        <div class="ed-cap-texto">
          <span class="ed-cap-num" aria-hidden="true">I</span>
          <p class="ed-volanta">Capítulo I · Exploración 3D</p>
          <h3 id="ed-cap1-t">El sistema financiero <em>español</em></h3>
          <p>${escaparHtml(t1.descripcion)} Cada edificio es una institución; cada calle, un flujo de dinero.</p>
          <dl class="ed-datos"><div><dt>Bloques</dt><dd>${tema01.grupos.length}</dd></div><div><dt>Apartados</dt><dd>${tema01.secciones.length}</dd></div><div><dt>Conceptos</dt><dd>${tema01.conceptos.length}</dd></div><div><dt>Tu dominio</dt><dd>${pct(dominio)}</dd></div></dl>
          <a class="ed-enlace-fuerte" href="${t1.href}">Entrar en la ciudad <span aria-hidden="true">→</span></a>
        </div>
      </article>
      <article class="ed-cap ed-cap-2" aria-labelledby="ed-cap2-t">
        <div class="ed-cap-texto">
          <span class="ed-cap-num" aria-hidden="true">II</span>
          <p class="ed-volanta">Capítulo II · Lección con animaciones</p>
          <h3 id="ed-cap2-t">Introducción al <em>cálculo financiero</em></h3>
          <p>Diecinueve fórmulas explicadas con animaciones, y un recorrido para usarlas solo: identificar los datos, elegir la fórmula y resolver en papel.</p>
          <dl class="ed-datos"><div><dt>Partes</dt><dd>${BLOQUES.length}</dd></div><div><dt>Fórmulas animadas</dt><dd>${FORMULAS_TEMA2.length}</dd></div><div><dt>Enunciados</dt><dd>${EJERCICIOS_TEMA2.length}</dd></div></dl>
          <a class="ed-enlace-fuerte" href="?pantalla=indice">Abrir el índice de fórmulas <span aria-hidden="true">→</span></a>
        </div>
        <div class="ed-cap-visual ed-cap-visual-papel"><div class="ed-fotograma mo-marco" data-fotograma="${escenaReferencia.id}"></div><p class="ed-leyenda-foto">Fotograma final de «${escaparHtml(escenaReferencia.titulo)}» · ${duracion(escenaReferencia.id)}</p></div>
      </article>
    </section>

    <section class="ed-cuaderno" aria-labelledby="ed-cuaderno-t">
      <header><p class="ed-volanta">Cuaderno de estudio · Capítulo I</p><h2 id="ed-cuaderno-t">Para cuando toque <em>repasar</em></h2></header>
      <a class="ed-cuaderno-hoy" href="${hrefSesion()}"><small>Estudiar hoy</small><b>${pendientes ? `${pendientes} repasos pendientes` : 'Una sesión corta, a tu ritmo'}</b><span aria-hidden="true">→</span></a>
      <ul class="ed-cuaderno-lista">
        <li><a href="${hrefExamen()}"><b>Predicción de examen</b><span>Qué apartados pesan más y cómo vas en cada uno.</span></a></li>
        <li><a href="${hrefSimulacro()}"><b>Simulacro</b><span>Preguntas con tiempo, como el día del examen.</span></a></li>
        <li><a href="${hrefRepaso()}"><b>Repaso</b><span>Lo que toca volver a ver hoy.</span></a></li>
        <li><a href="${hrefVisual()}"><b>Infografías</b><span>Los esquemas del capítulo, de un vistazo.</span></a></li>
        <li><a href="${hrefProgreso()}"><b>Mi progreso</b><span>Tu dominio por apartado.</span></a></li>
      </ul>
    </section>

    <section class="ed-atlas" id="atlas" aria-labelledby="ed-atlas-t">
      <div class="ed-atlas-texto">
        <p class="ed-volanta">Atlas del conocimiento</p>
        <h2 id="ed-atlas-t">Todo está <em>conectado</em></h2>
        <p>Un mapa para explorar cómo se relacionan los conceptos de los dos capítulos. Es para curiosear y repasar relaciones: no hace falta para estudiar las lecciones.</p>
        <a class="ed-enlace-fuerte" href="${hrefInicio()}">Abrir el Atlas <span aria-hidden="true">→</span></a>
        <p class="ed-nota-pie">Hoy se abre dentro de la Ciudad del Dinero; en la siguiente fase tendría su propia página.</p>
      </div>
      ${atlas()}
    </section>

    <footer class="ed-pie">
      <p>¿Buscas un apartado concreto?</p>
      <button type="button" class="ed-enlace-fuerte" data-sumario>Abrir el sumario y buscar <span aria-hidden="true">→</span></button>
    </footer>
  </main>
  ${sumario()}`;
}

/* ---------------------------------------------------------------------- índice tema 2 */

function nodo(id: string, clase = ''): string {
  const f = formulaPorId(id)!;
  return `<a class="ed-f ${clase}" href="${hrefFormula(id)}">
    <span class="ed-f-num">${f.numero}</span>
    <span class="ed-f-nombre">${escaparHtml(f.nombre)}</span>
    <span class="ed-f-fx">${formulaHtml(f.expresion)}</span>
    <span class="ed-f-ver"><i aria-hidden="true"></i>Animación · ${duracion(id === 'simple-intereses' ? escenaReferencia.id : id)}</span>
  </a>`;
}

const rama = (como: string, id: string) => `<li><span class="ed-rama">${escaparHtml(como)}</span>${nodo(id)}</li>`;

function cabParte(num: string, b: (typeof BLOQUES)[number], cita: string): string {
  return `<header class="ed-parte-cab">
    <span class="ed-parte-num" aria-hidden="true">${num}</span>
    <div><p class="ed-volanta">Parte ${num} · ${escaparHtml(b.apartado)} · ${formulasDe(b.id).length} fórmulas</p>
    <h2 id="parte-${b.id}-t">${escaparHtml(b.titulo)}</h2>
    <blockquote>${escaparHtml(cita)}</blockquote></div>
  </header>`;
}

function practicaParte(b: BloqueId): string {
  return `<nav class="ed-parte-practica" aria-label="Practicar esta parte"><span>Cuando la entiendas, practícala</span>
    <a href="${hrefFase(b, 'datos')}"><b>B</b> Identificar los datos</a>
    <a href="${hrefFase(b, 'elegir')}"><b>C</b> Elegir la fórmula</a>
    <a href="${hrefFase(b, 'practica')}"><b>D</b> Resolver en papel</a></nav>`;
}

function memoriza(b: BloqueId): string {
  const bloque = BLOQUES.find((x) => x.id === b)!;
  const texto = (s: string) => s.split(/(\$[^$]+\$)/g).map((t) => (t.startsWith('$') ? formulaHtml(t.slice(1, -1)) : escaparHtml(t))).join('');
  return `<aside class="ed-margen"><p class="ed-volanta">Para no memorizarlo todo</p><ul>${bloque.memoriza.map((m) => `<li>${texto(m)}</li>`).join('')}</ul></aside>`;
}

/** Barra del capítulo: la secuencia A → D y las tres partes, siempre a mano al bajar. */
function barraCapitulo(): string {
  return `<nav class="ed-barra-cap" aria-label="Capítulo II" data-barra-cap>
    <p class="ed-barra-cap-tit"><span>II</span>Cálculo financiero</p>
    <ol class="ed-barra-fases">
      <li class="on"><a href="#contenido" aria-current="step"><b>A</b> Comprender</a></li>
      <li><a href="${hrefFase('simple', 'datos')}"><b>B</b> Identificar</a></li>
      <li><a href="${hrefFase('simple', 'elegir')}"><b>C</b> Elegir</a></li>
      <li><a href="${hrefFase('simple', 'practica')}"><b>D</b> En papel</a></li>
    </ol>
    <ol class="ed-barra-partes">${BLOQUES.map((b, k) => `<li><a href="#parte-${b.id}" data-parte="${b.id}"><span>${ROMANOS[k]}</span>${escaparHtml(b.titulo.replace('Capitalización ', ''))}</a></li>`).join('')}</ol>
  </nav>`;
}

function indice(): string {
  const [simple, compuesta, descuento] = BLOQUES as unknown as [(typeof BLOQUES)[number], (typeof BLOQUES)[number], (typeof BLOQUES)[number]];
  return `${navegacion('papel', `<a href="?pantalla=portada">${gf.nombre}</a><span>/</span><b>Capítulo II</b>`)}
  ${barraCapitulo()}
  <main class="ed ed-indice" id="contenido">
    <section class="ed-t2-apertura" aria-labelledby="ed-t2-titular">
      <div class="ed-t2-titulo">
        <p class="ed-volanta ed-volanta-tinta"><i></i>Capítulo II · ${escaparHtml(tema02.fuente)}</p>
        <h1 class="ed-titular-papel" id="ed-t2-titular">Introducción al <em>cálculo financiero</em></h1>
        <p class="ed-entradilla">El dinero no vale lo mismo hoy que dentro de un año. Este capítulo enseña a medir esa diferencia: primero entendiendo cada fórmula y después usándola solo, en papel.</p>
        <ol class="ed-ruta" aria-label="Cómo se estudia este capítulo">
          <li class="on"><span class="ed-ruta-paso"><b>A</b><span>Comprender<small>cada fórmula, con su animación</small></span></span><small class="ed-ruta-aqui">Estás aquí</small></li>
          <li><a href="${hrefFase('simple', 'datos')}"><b>B</b><span>Identificar<small>los datos del enunciado</small></span></a></li>
          <li><a href="${hrefFase('simple', 'elegir')}"><b>C</b><span>Elegir<small>la fórmula adecuada</small></span></a></li>
          <li><a href="${hrefFase('simple', 'practica')}"><b>D</b><span>Practicar<small>en papel, sin ayuda</small></span></a></li>
        </ol>
      </div>
      <figure class="ed-t2-pantalla">
        <div class="ed-reproductor" data-reproductor="${escenaReferencia.id}"></div>
        <figcaption><b>Empieza aquí.</b> Fórmula 1 · Intereses totales: el capital, el tipo y las cosechas.</figcaption>
      </figure>
    </section>

    <nav class="ed-contenido" aria-label="Partes del capítulo">
      ${BLOQUES.map((b, k) => `<a href="#parte-${b.id}"><span class="ed-contenido-num">${ROMANOS[k]}</span><span class="ed-contenido-tit">${escaparHtml(b.titulo)}<small>${escaparHtml(b.idea)}</small></span><span class="ed-contenido-pag">${formulasDe(b.id).length}</span></a>`).join('')}
      <div class="ed-clave"><p class="ed-volanta">Clave de colores</p><ul>
        <li>${formulaHtml('C_0')}<span>hoy</span></li><li>${formulaHtml('C_n')}<span>al final</span></li><li>${formulaHtml('I')}<span>lo que crece</span></li>
        <li>${formulaHtml('i')}<span>tipos</span></li><li>${formulaHtml('n')}<span>tiempo</span></li><li>${formulaHtml('m')}<span>partes del año</span></li><li>${formulaHtml('D')}<span>descuento</span></li></ul></div>
    </nav>

    <section class="ed-parte ed-parte-simple" id="parte-simple" aria-labelledby="parte-simple-t">
      ${cabParte('I', simple, '«Los intereses de cada periodo se calculan siempre sobre el capital inicial.»')}
      <div class="ed-parte-cuerpo">
        <div class="ed-genealogia">
          <div class="ed-madres">
            ${nodo('simple-intereses', 'ed-f-madre')}
            <span class="ed-union"><span>+ C₀ y factor común</span></span>
            ${nodo('simple-montante', 'ed-f-madre')}
          </div>
          <div class="ed-hijas">
            <ul class="ed-hijas-col">${rama('I = Cₙ − C₀ · despejar i', 'simple-tipo')}${rama('I = Cₙ − C₀ · despejar n', 'simple-tiempo')}${rama('i → iₘ · n → n · m', 'simple-fraccionado')}</ul>
            <ul class="ed-hijas-col">${rama('despejar C₀', 'simple-capital-inicial')}</ul>
          </div>
        </div>
        ${memoriza('simple')}
      </div>
      ${practicaParte('simple')}
    </section>

    <section class="ed-parte ed-parte-compuesta" id="parte-compuesta" aria-labelledby="parte-compuesta-t">
      ${cabParte('II', compuesta, '«Los intereses se suman al capital y producen nuevos intereses.»')}
      <div class="ed-estrella">
        <div class="ed-estrella-centro">
          <div class="ed-fotograma mo-marco" data-fotograma="compuesta-montante"></div>
          ${nodo('compuesta-montante', 'ed-f-madre ed-f-centro')}
        </div>
        <ul class="ed-estrella-ramas">
          ${rama('restar C₀', 'compuesta-intereses')}
          ${rama('dividir entre (1 + i)ⁿ', 'compuesta-capital-inicial')}
          ${rama('logaritmos', 'compuesta-tiempo')}
          ${rama('raíz de índice n', 'compuesta-tipo')}
          ${rama('igualar montantes', 'compuesta-equivalentes')}
          ${rama('iₘ = Jₘ / m', 'compuesta-tae')}
          ${rama('frente a la recta de simple', 'compuesta-comparacion')}
        </ul>
      </div>
      ${practicaParte('compuesta')}
    </section>

    <section class="ed-parte ed-parte-descuento" id="parte-descuento" aria-labelledby="parte-descuento-t">
      ${cabParte('III', descuento, '«Cobrar hoy lo que vence mañana tiene un precio: el descuento.»')}
      <p class="ed-siempre">Siempre: <span>${formulaHtml('E = N - D')}</span> lo que recibes hoy es el nominal menos el descuento.</p>
      <div class="ed-matriz" role="table" aria-label="Descuentos según la base y el régimen">
        <div class="ed-matriz-fila ed-matriz-cab" role="row"><span role="columnheader"><span class="sr">Régimen</span></span><span role="columnheader">Comercial<small>se calcula sobre el nominal, N</small></span><span role="columnheader">Racional<small>se calcula sobre el efectivo</small></span></div>
        <div class="ed-matriz-fila" role="row"><span role="rowheader">Simple<small>hasta un año</small></span><span role="cell">${nodo('descuento-comercial')}</span><span role="cell">${nodo('descuento-racional')}</span></div>
        <div class="ed-matriz-fila" role="row"><span role="rowheader">Compuesto<small>más de un año</small></span><span role="cell">${nodo('descuento-compuesto-comercial')}</span><span role="cell">${nodo('descuento-compuesto-racional')}</span></div>
      </div>
      <div class="ed-liquidacion"><span class="ed-rama">En el banco: restar también comisiones y gastos</span>${nodo('descuento-remesa')}</div>
      ${practicaParte('descuento')}
    </section>

    <footer class="ed-siguiente">
      <p class="ed-volanta ed-volanta-tinta">Cuando hayas visto las fórmulas</p>
      <a href="${hrefFase('simple', 'datos')}"><b>B</b> Identificar los datos <span aria-hidden="true">→</span></a>
      <p class="ed-siguiente-nota">Después: <a href="${hrefFase('simple', 'elegir')}">C · Elegir la fórmula</a> y <a href="${hrefFase('simple', 'practica')}">D · Resolver en papel</a>. En la maqueta, estos enlaces llevan a las pantallas actuales.</p>
    </footer>
  </main>
  ${sumario()}`;
}

/* ------------------------------------------------------------ revisión de la animación */

function animacion(): string {
  const e = escenaReferencia;
  return `${navegacion('papel', `<a href="?pantalla=indice">Capítulo II</a><span>/</span><b>Animación de referencia</b>`)}
  <main class="ed ed-revision" id="contenido">
    <header class="ed-revision-cab">
      <p class="ed-volanta ed-volanta-tinta"><i></i>Motion design · referencia para revisar</p>
      <h1 class="ed-titular-papel">Capitalización <em>simple</em></h1>
      <p class="ed-entradilla">La secuencia completa de la fórmula 1, tal como se reproduce en la web: ${Math.round(e.duracion)} segundos en ${e.capitulos.length} capítulos. Con la barra espaciadora sobre el dibujo se pausa; los botones numerados llevan a cada capítulo.</p>
    </header>
    <figure class="ed-revision-reproductor"><div data-reproductor="${e.id}"></div></figure>
    <section class="ed-guion" aria-labelledby="ed-guion-t">
      <h2 id="ed-guion-t">Guion: qué explica cada momento</h2>
      <ol>${e.capitulos.map((c, k) => `<li>
        <div class="ed-guion-foto mo-marco" data-fotograma="${e.id}" data-t="${finCapitulo(e, k)}"></div>
        <p class="ed-guion-t">${String(Math.floor(c.t)).padStart(2, '0')} s · capítulo ${k + 1}</p>
        <p>${textoConFormulas(c.texto)}</p></li>`).join('')}</ol>
    </section>
    <section class="ed-antes" aria-labelledby="ed-antes-t">
      <h2 id="ed-antes-t">Antes y ahora</h2>
      <p>La versión anterior de la misma fórmula (abajo) explicaba lo mismo con barras; la nueva cuenta la idea con el capital como bloque, la planta y las cosechas, y termina con la fórmula anotada. Las dos usan el mismo motor.</p>
      <div class="ed-antes-vista"><div data-reproductor="simple-intereses" data-quieto></div></div>
    </section>
  </main>`;
}

/* ----------------------------------------------------------------------------- montaje */

raiz.innerHTML = `<a class="ed-saltar" href="#contenido">Saltar al contenido</a>
  <div class="ed-barra-propuesta" role="note">
    <b>Propuesta</b><span>Maqueta aislada con datos reales</span>
    <a href="?pantalla=portada"${pantalla === 'portada' ? ' aria-current="page"' : ''}>Portada</a>
    <a href="?pantalla=indice"${pantalla === 'indice' ? ' aria-current="page"' : ''}>Índice T2</a>
    <a href="?pantalla=animacion"${pantalla === 'animacion' ? ' aria-current="page"' : ''}>Animación</a>
    <a class="ed-barra-comparar" href="${{ portada: hrefAsignatura(gf.id), indice: hrefTema2(), animacion: hrefFormula('simple-intereses') }[pantalla]}">Comparar con la web actual ↗</a>
  </div>
  <div class="ed-pagina ${pantalla === 'portada' ? 'ed-pagina-noche' : 'ed-pagina-papel'}">${pantalla === 'portada' ? portada() : pantalla === 'indice' ? indice() : animacion()}</div>`;
document.title = { portada: 'Propuesta · Gestión Financiera', indice: 'Propuesta · Capítulo II', animacion: 'Propuesta · Animación de referencia' }[pantalla];

// Los enlaces de la web real (#…) salen de la maqueta a la aplicación; los internos se quedan.
raiz.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
  const h = a.getAttribute('href')!;
  if (h !== '#contenido' && h !== '#atlas' && !h.startsWith('#parte-')) a.href = `/${h}`;
});

raiz.querySelectorAll<HTMLElement>('[data-fotograma]').forEach((el) => {
  const escena = ESCENAS_VISTA[el.dataset.fotograma!];
  if (escena) pintarFotograma(el, escena, el.dataset.t ? Number(el.dataset.t) : escena.duracion);
});
raiz.querySelectorAll<HTMLElement>('[data-reproductor]').forEach((el) => {
  const escena = ESCENAS_VISTA[el.dataset.reproductor!];
  if (escena) montarReproductor(el, escena, { automatico: !q.has('quieto') && !el.hasAttribute('data-quieto') });
});

// Sumario: el buscador es el del temario real.
const capa = raiz.querySelector<HTMLElement>('[data-capa-sumario]');
const hoja = capa?.querySelector<HTMLElement>('[data-temario]');
if (hoja) conectarBuscadorTemario(hoja);
let volverA: HTMLElement | null = null;
const abrirSumario = (desde: HTMLElement | null) => {
  if (!capa) return;
  volverA = desde;
  capa.hidden = false;
  document.body.classList.add('ed-sin-scroll');
  capa.querySelector<HTMLInputElement>('input')?.focus();
};
const cerrarSumario = () => {
  if (!capa || capa.hidden) return;
  capa.hidden = true;
  document.body.classList.remove('ed-sin-scroll');
  volverA?.focus();
};
const menu = raiz.querySelector<HTMLElement>('#ed-menu');
const botonMenu = raiz.querySelector<HTMLButtonElement>('[data-menu]');
const cerrarMenu = () => {
  if (!menu || menu.hidden) return;
  menu.hidden = true;
  botonMenu?.setAttribute('aria-expanded', 'false');
};
raiz.addEventListener('click', (e) => {
  const t = e.target as Element;
  const abre = t.closest<HTMLElement>('[data-sumario]');
  if (abre) {
    cerrarMenu();
    abrirSumario(abre);
  } else if (t.closest('[data-cerrar-sumario]') || t === capa) cerrarSumario();
  else if (t.closest('[data-menu]') && menu && botonMenu) {
    menu.hidden = !menu.hidden;
    botonMenu.setAttribute('aria-expanded', String(!menu.hidden));
  } else if (!t.closest('#ed-menu')) cerrarMenu();
});
addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    cerrarSumario();
    cerrarMenu();
  }
});
if (q.has('sumario')) abrirSumario(null);

// La barra superior se vuelve compacta al bajar (sobre la apertura es transparente).
const nav = raiz.querySelector<HTMLElement>('[data-nav]');
const alBajar = () => nav?.classList.toggle('compacta', scrollY > 60);
addEventListener('scroll', alBajar, { passive: true });
alBajar();
// La barra del capítulo se pega justo debajo de la barra superior, mida lo que mida.
if (nav && typeof ResizeObserver === 'function') {
  new ResizeObserver(() => document.documentElement.style.setProperty('--ed-nav-alto', `${nav.offsetHeight}px`)).observe(nav, { box: 'border-box' });
}

// Barra del capítulo: marca la parte que se está leyendo.
const partes = [...raiz.querySelectorAll<HTMLElement>('.ed-parte')];
if (partes.length && typeof IntersectionObserver === 'function') {
  const enlaces = new Map([...raiz.querySelectorAll<HTMLAnchorElement>('[data-parte]')].map((a) => [a.dataset.parte!, a]));
  const obs = new IntersectionObserver((entradas) => {
    for (const en of entradas) {
      if (!en.isIntersecting) continue;
      enlaces.forEach((a) => a.removeAttribute('aria-current'));
      enlaces.get(en.target.id.replace('parte-', ''))?.setAttribute('aria-current', 'location');
    }
  }, { rootMargin: '-40% 0px -55% 0px' });
  partes.forEach((p) => obs.observe(p));
}
document.fonts.ready.then(() => document.body.setAttribute('data-listo', ''));
