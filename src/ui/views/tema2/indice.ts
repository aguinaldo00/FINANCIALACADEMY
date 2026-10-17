/*
 * Fase C · Índice de fórmulas del Tema 2, con la identidad editorial: apertura con la ruta A → D y la
 * animación de la fórmula 1, una barra del capítulo que se queda arriba al bajar y las tres partes:
 * Simple y Compuesta como estrella (la madre y sus ramas) y Descuento como matriz. Cada parte
 * termina con su práctica (A, B y D). El temario completo está en el Sumario. Con un ejercicio
 * delante se empieza por A (identificar); quien empieza de cero tiene aquí mismo las fórmulas.
 */
import { hrefAcademia, hrefAsignatura, hrefFase, hrefLetras } from '../../../app/router.ts';
import type { EstadoEstudio } from '../../../app/store.ts';
import { buscarAsignatura, ID_GESTION_FINANCIERA } from '../../../content/academia.ts';
import { BLOQUES, formulaPorId, formulasDe, type BloqueId } from '../../../content/temas/tema-02/formulas.ts';
import { tema02 } from '../../../content/temas/tema-02/index.ts';
import { montarEditorial, navegacionEditorial, ROMANOS, sumarioEditorial } from '../../components/editorial.ts';
import { conectarMiniaturas, duracionLegible, type FuenteExpandible, miniaturaHtml } from '../../components/reproductorExpandido.ts';
import { ESCENAS } from '../../escenas/index.ts';
import { montarReproductor } from '../../motion/reproductor.ts';
import { escaparHtml, formulaHtml, hrefBloqueTema2, hrefFormula, textoT2 } from './comun.ts';

/** Cómo se obtiene cada fórmula a partir de otra (las ramas de cada parte). */
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

const como = (bloque: BloqueId, id: string) => DERIVACIONES[bloque].find((d) => d.hacia === id)?.como ?? '';
const duracion = (id: string) => duracionLegible(ESCENAS[id]?.duracion ?? 0);

/** Animaciones que se amplían desde el índice (expansión cinematográfica): las de Simple y Compuesta. */
const MEDIOS: Readonly<Record<string, FuenteExpandible>> = Object.fromEntries(
  BLOQUES.slice(0, 2).flatMap((b, k) => formulasDe(b.id).map((f) => [f.id, { tipo: 'escena', escena: ESCENAS[f.id]!, volanta: `Parte ${ROMANOS[k]} · Fórmula ${f.numero}` } as FuenteExpandible])),
);

/**
 * Un nodo de fórmula: número, nombre y fórmula, que llevan a su ficha. Sin caja. Si su animación se
 * amplía desde el índice (la miniatura va al lado), el pie invita a abrir la ficha; si no, anuncia
 * la animación que hay dentro.
 */
function nodo(id: string, clase = ''): string {
  const f = formulaPorId(id)!;
  const pie = MEDIOS[id] ? 'Abrir la ficha <span aria-hidden="true">→</span>' : `<i aria-hidden="true"></i>Animación · ${duracion(id)}`;
  return `<a class="ed-f ${clase}" href="${hrefFormula(id)}" data-formula="${id}">
    <span class="ed-f-num">${f.numero}</span>
    <span class="ed-f-nombre">${escaparHtml(f.nombre)}</span>
    <span class="ed-f-fx">${formulaHtml(f.expresion)}</span>
    <span class="ed-f-ver">${pie}</span>
  </a>`;
}

/** Una rama: cómo sale de la madre, la fórmula y, si la tiene, la miniatura que amplía su animación. */
const rama = (bloque: BloqueId, id: string) =>
  `<li><span class="ed-rama">${escaparHtml(como(bloque, id))}</span>${nodo(id)}${MEDIOS[id] ? miniaturaHtml(id, MEDIOS[id], 'vx-papel ed-mini') : ''}</li>`;

/**
 * Simple y Compuesta comparten composición: a la izquierda, la madre con su animación grande (se
 * amplía) y lo mínimo que hay que memorizar; a la derecha, una sola columna con las fórmulas que
 * salen de ella, cada una con cómo sale y su animación en miniatura.
 */
function estrella(bloque: BloqueId, madre: string, ramas: string[]): string {
  return `<div class="ed-estrella">
        <div class="ed-estrella-centro">
          ${miniaturaHtml(madre, MEDIOS[madre]!, 'vx-papel')}
          ${nodo(madre, 'ed-f-madre ed-f-centro')}
          ${memoriza(bloque)}
        </div>
        <ul class="ed-estrella-ramas">${ramas.map((id) => rama(bloque, id)).join('')}</ul>
      </div>`;
}

function cabParte(k: number, b: (typeof BLOQUES)[number], cita: string): string {
  return `<header class="ed-parte-cab">
    <span class="ed-parte-num" aria-hidden="true">${ROMANOS[k]}</span>
    <div><p class="ed-volanta">Parte ${ROMANOS[k]} · ${escaparHtml(b.apartado)} · ${formulasDe(b.id).length} fórmulas</p>
    <h2 id="t2-${b.id}-titulo">${escaparHtml(b.titulo)}</h2>
    <blockquote>${escaparHtml(cita)}</blockquote></div>
  </header>`;
}

function practicaParte(b: BloqueId): string {
  return `<nav class="ed-parte-practica" aria-label="Practicar esta parte"><span>Con un ejercicio de esta parte</span>
    <a href="${hrefFase(b, 'datos')}"><b>A</b> Identificar los datos</a>
    <a href="${hrefFase(b, 'elegir')}"><b>B</b> Elegir la fórmula</a>
    <a href="${hrefFase(b, 'practica')}"><b>D</b> Resolver en papel</a>${b === 'descuento' ? `
    <a href="${hrefLetras()}"><b>+</b> Varias letras (examen)</a>` : ''}</nav>`;
}

function memoriza(b: BloqueId): string {
  const bloque = BLOQUES.find((x) => x.id === b)!;
  return `<aside class="ed-margen"><p class="ed-volanta">Para no memorizarlo todo</p><ul>${bloque.memoriza.map((m) => `<li>${textoT2(m)}</li>`).join('')}</ul></aside>`;
}

const parte = (b: (typeof BLOQUES)[number], cuerpo: string) =>
  `<section class="ed-parte ed-parte-${b.id}" id="t2-${b.id}" data-ed-parte="${b.id}" aria-labelledby="t2-${b.id}-titulo">${cuerpo}</section>`;

/** Barra del capítulo: la secuencia A → D y las tres partes, siempre a mano al bajar. */
function barraCapitulo(): string {
  return `<nav class="ed-barra-cap" aria-label="Capítulo II">
    <p class="ed-barra-cap-tit"><span>II</span>Cálculo financiero</p>
    <ol class="ed-barra-fases">
      <li><a href="${hrefFase('simple', 'datos')}"><b>A</b> Identificar</a></li>
      <li><a href="${hrefFase('simple', 'elegir')}"><b>B</b> Elegir</a></li>
      <li class="on"><a href="#tema/2" aria-current="step"><b>C</b> Comprender</a></li>
      <li><a href="${hrefFase('simple', 'practica')}"><b>D</b> En papel</a></li>
    </ol>
    <ol class="ed-barra-partes">${BLOQUES.map((b, k) => `<li><a href="${hrefBloqueTema2(b.id)}" data-parte="${b.id}"><span>${ROMANOS[k]}</span>${escaparHtml(b.titulo.replace('Capitalización ', ''))}</a></li>`).join('')}</ol>
  </nav>`;
}

export function htmlIndice(estado: EstadoEstudio): string {
  const gf = buscarAsignatura(ID_GESTION_FINANCIERA)!;
  const [simple, compuesta, descuento] = BLOQUES as unknown as [(typeof BLOQUES)[number], (typeof BLOQUES)[number], (typeof BLOQUES)[number]];
  return `<div class="ed-pagina ed-pagina-papel ed-indice-t2" data-tema2>
  ${navegacionEditorial('papel', [{ texto: 'Academia', href: hrefAcademia() }, { texto: gf.nombre, href: hrefAsignatura(gf.id) }, { texto: `Capítulo II · Tema ${tema02.numero}` }])}
  ${barraCapitulo()}
  <div class="ed">
    <section class="ed-t2-apertura" aria-labelledby="ed-t2-titular">
      <div class="ed-t2-titulo">
        <p class="ed-volanta ed-volanta-tinta"><i></i>Capítulo II · ${escaparHtml(tema02.fuente)}</p>
        <h1 class="ed-titular-papel" id="ed-t2-titular">${escaparHtml(tema02.titulo).replace('cálculo financiero', '<em>cálculo financiero</em>')}</h1>
        <p class="ed-entradilla">El dinero no vale lo mismo hoy que dentro de un año. Este capítulo enseña a medir esa diferencia: qué datos te dan, qué fórmula toca, por qué funciona y cómo se resuelve en papel.</p>
        <ol class="ed-ruta" aria-label="Cómo se resuelve un ejercicio">
          <li><a href="${hrefFase('simple', 'datos')}"><b>A</b><span>Identificar<small>los datos del enunciado</small></span></a></li>
          <li><a href="${hrefFase('simple', 'elegir')}"><b>B</b><span>Elegir<small>la fórmula adecuada</small></span></a></li>
          <li class="on"><span class="ed-ruta-paso"><b>C</b><span>Comprender<small>cada fórmula, con su animación</small></span></span><small class="ed-ruta-aqui">Estás aquí</small></li>
          <li><a href="${hrefFase('simple', 'practica')}"><b>D</b><span>Practicar<small>en papel, sin ayuda</small></span></a></li>
        </ol>
        <p class="ed-ruta-nota"><b>¿Tienes un ejercicio delante?</b> Empieza por <a href="${hrefFase('simple', 'datos')}">A · Identificar los datos</a>. <b>¿Empiezas de cero?</b> Quédate aquí: abajo están todas las fórmulas, cada una con su animación.</p>
      </div>
      <figure class="ed-t2-pantalla">
        <div class="ed-reproductor" data-reproductor="simple-intereses"></div>
        <figcaption><b>Empieza aquí.</b> Fórmula 1 · Intereses totales: la semilla, el tipo y los tomates.</figcaption>
      </figure>
    </section>

    <nav class="ed-contenido" aria-label="Partes del capítulo">
      ${BLOQUES.map((b, k) => `<a href="${hrefBloqueTema2(b.id)}"><span class="ed-contenido-num">${ROMANOS[k]}</span><span class="ed-contenido-tit">${escaparHtml(b.titulo)}<small>${escaparHtml(b.idea)}</small></span><span class="ed-contenido-pag">${formulasDe(b.id).length}</span></a>`).join('')}
      <div class="ed-clave"><p class="ed-volanta">Clave de colores</p><ul>
        <li>${formulaHtml('C_0')}<span>hoy</span></li><li>${formulaHtml('C_n')}<span>al final</span></li><li>${formulaHtml('I')}<span>lo que crece</span></li>
        <li>${formulaHtml('i')}<span>tipos</span></li><li>${formulaHtml('n')}<span>tiempo</span></li><li>${formulaHtml('m')}<span>partes del año</span></li><li>${formulaHtml('D')}<span>descuento</span></li></ul></div>
    </nav>

    ${parte(simple, `${cabParte(0, simple, '«Los intereses de cada periodo se calculan siempre sobre el capital inicial.»')}
      ${estrella('simple', 'simple-intereses', ['simple-montante', 'simple-capital-inicial', 'simple-tipo', 'simple-tiempo', 'simple-fraccionado'])}
      ${practicaParte('simple')}`)}

    ${parte(compuesta, `${cabParte(1, compuesta, '«Los intereses se suman al capital y producen nuevos intereses.»')}
      ${estrella('compuesta', 'compuesta-montante', ['compuesta-intereses', 'compuesta-capital-inicial', 'compuesta-tiempo', 'compuesta-tipo', 'compuesta-equivalentes', 'compuesta-tae', 'compuesta-comparacion'])}
      ${practicaParte('compuesta')}`)}

    ${parte(descuento, `${cabParte(2, descuento, '«Cobrar hoy lo que vence mañana tiene un precio: el descuento.»')}
      <p class="ed-siempre">Siempre: <span>${formulaHtml('E = N - D')}</span> lo que recibes hoy es el nominal menos el descuento.</p>
      <div class="ed-matriz" role="table" aria-label="Descuentos según la base y el régimen">
        <div class="ed-matriz-fila ed-matriz-cab" role="row"><span role="columnheader"><span class="sr">Régimen</span></span><span role="columnheader">Comercial<small>se calcula sobre el nominal, N</small></span><span role="columnheader">Racional<small>se calcula sobre el efectivo</small></span></div>
        <div class="ed-matriz-fila" role="row"><span role="rowheader">Simple<small>hasta un año</small></span><span role="cell">${nodo('descuento-comercial')}</span><span role="cell">${nodo('descuento-racional')}</span></div>
        <div class="ed-matriz-fila" role="row"><span role="rowheader">Compuesto<small>más de un año</small></span><span role="cell">${nodo('descuento-compuesto-comercial')}</span><span role="cell">${nodo('descuento-compuesto-racional')}</span></div>
      </div>
      <div class="ed-liquidacion"><span class="ed-rama">En el banco: ${escaparHtml(como('descuento', 'descuento-remesa'))}</span>${nodo('descuento-remesa')}</div>
      ${practicaParte('descuento')}`)}

    <footer class="ed-siguiente">
      <p class="ed-volanta ed-volanta-tinta">Cuando entiendas las fórmulas</p>
      <a href="${hrefFase('simple', 'practica')}"><b>D</b> Resolver en papel <span aria-hidden="true">→</span></a>
      <p class="ed-siguiente-nota">Con cada ejercicio, el mismo orden: <a href="${hrefFase('simple', 'datos')}">A · Identificar los datos</a>, <a href="${hrefFase('simple', 'elegir')}">B · Elegir la fórmula</a>, C · Comprenderla (esta página) y D · Resolver en papel, parte por parte.</p>
    </footer>
  </div>
  ${sumarioEditorial(gf, estado)}
</div>`;
}

/** Monta la navegación, el Sumario, la animación de la apertura y las miniaturas expandibles. */
export function montarIndice(pagina: HTMLElement): () => void {
  const raiz = pagina.querySelector<HTMLElement>('.ed-pagina');
  if (!raiz) return () => {};
  const paradas = [montarEditorial(raiz), conectarMiniaturas(raiz, MEDIOS)];
  const portada = raiz.querySelector<HTMLElement>('[data-reproductor]');
  const escena = ESCENAS[portada?.dataset.reproductor ?? ''];
  if (portada && escena) paradas.push(montarReproductor(portada, escena));
  return () => paradas.forEach((p) => p());
}
