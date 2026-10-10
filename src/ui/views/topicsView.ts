import type { Ruta } from '../../app/router.ts';
import { hrefTema2 } from '../../app/router.ts';
import {
  FORMULA_CAPITAL_FINAL,
  FORMULA_INTERESES_TOTALES,
  FORMULA_INTERESES_TOTALES_FACTOR,
  LECCIONES_TEMA2,
  NOTACION_CAPITALIZACION_COMPUESTA,
  PARTES_LECCION,
  tema02,
} from '../../content/temas/tema-02/index.ts';
import { montarCapitalizacionCompuesta } from '../components/capitalizacionCompuesta.ts';
import { montarPracticaCompuesta, seccionErrores, seccionPapel, seccionReconocer } from '../components/practicaCompuesta.ts';
import { enlaceTodosLosTemas } from '../components/rail.ts';
import { colorearSimbolos } from '../components/simbolos.ts';
import type { ContextoVista } from './context.ts';

type RutaTema2 = Extract<Ruta, { vista: 'tema2' }>;

let detenerExperiencia: (() => void) | null = null;

export function detenerTemaDos(): void {
  detenerExperiencia?.();
  detenerExperiencia = null;
}

const PARTE = Object.fromEntries(PARTES_LECCION.map((p) => [p.id, p])) as Record<(typeof PARTES_LECCION)[number]['id'], (typeof PARTES_LECCION)[number]>;

function cabeceraParte(id: keyof typeof PARTE, numero: number, intro: string): string {
  const p = PARTE[id];
  return `<header class="mat-parte-cabecera"><p class="mat-ceja">${String(numero).padStart(2, '0')} · ${p.subtitulo.toUpperCase()}</p>
    <h2 id="mat-${id}-titulo">${p.titulo}</h2><p>${intro}</p></header>`;
}

export function pintarTemaDos(ctx: ContextoVista, ruta: RutaTema2): void {
  detenerTemaDos();
  const leccion = LECCIONES_TEMA2[0];
  ctx.pagina.innerHTML = `<div class="tema-matematica">
    <header class="sh">
      <div class="kick"><span class="pill k">Tema ${tema02.numero}</span><span class="pill">${tema02.fuente}</span></div>
      <h1>${leccion.titulo}</h1>
      <p>Un capital actual se convierte en uno futuro, y cada periodo el interés se suma al capital y genera más interés. Esta lección va en cinco partes; ten a mano <b>papel y calculadora</b>: en cada paso, intenta escribirlo tú antes de verlo.</p>
      <ol class="mat-indice" aria-label="Partes de la lección">${PARTES_LECCION.map((p, i) => `<li><a href="${hrefTema2(leccion.id, p.id)}"><span>${String(i + 1).padStart(2, '0')}</span>${p.titulo}</a></li>`).join('')}</ol>
    </header>

    <section class="mat-parte mat-notacion" id="mat-simbolos" aria-labelledby="mat-simbolos-titulo">
      ${cabeceraParte('simbolos', 1, 'Antes de ver el cálculo, apréndete qué es cada letra. Cada símbolo tiene siempre el mismo color en toda la lección.')}
      <dl class="mat-notacion-lista">${NOTACION_CAPITALIZACION_COMPUESTA.map((dato) =>
        `<div><dt>${colorearSimbolos(dato.simbolo)}</dt><dd>${dato.significado}</dd></div>`,
      ).join('')}</dl>
      <div class="mat-formulas" aria-label="Fórmulas de capitalización compuesta">
        <p><span>Capital final</span><strong>${colorearSimbolos(FORMULA_CAPITAL_FINAL)}</strong></p>
        <p><span>Intereses totales</span><strong>${colorearSimbolos(FORMULA_INTERESES_TOTALES)}</strong></p>
        <p><span>Intereses totales · con el factor</span><strong>${colorearSimbolos(FORMULA_INTERESES_TOTALES_FACTOR)}</strong></p>
      </div>
      <p class="mat-aviso">El tipo <span class="s s-i">i</span> se usa en tanto por uno (5 % = 0,05) y en la misma unidad de tiempo que <span class="s s-n">n</span>.</p>
    </section>

    <section class="mat-parte mat-leccion" id="mat-leccion" aria-labelledby="mat-leccion-titulo">
      ${cabeceraParte('leccion', 2, 'Un ejemplo resuelto, año a año. Con el modo cuaderno, cada cálculo se oculta hasta que lo hayas hecho tú en papel.')}
      <div data-capitalizacion-compuesta></div>
    </section>

    <section class="mat-parte" id="mat-errores" aria-labelledby="mat-errores-titulo">
      ${cabeceraParte('errores', 3, 'Lo que más se falla en estos ejercicios. Antes de pulsar, piensa qué está mal.')}
      ${seccionErrores()}
    </section>

    <section class="mat-parte" id="mat-papel" aria-labelledby="mat-papel-titulo">
      ${cabeceraParte('papel', 4, 'Casos resueltos del libro. El primero te da casi todo; el último, nada. Resuélvelos en el cuaderno y solo después mira la solución.')}
      ${seccionPapel()}
    </section>

    <section class="mat-parte" id="mat-reconocer" aria-labelledby="mat-reconocer-titulo">
      ${cabeceraParte('reconocer', 5, 'En el examen nadie te dice qué tipo de ejercicio es. Aquí no se calcula nada: solo entrenas a elegir la fórmula, con tipos mezclados.')}
      ${seccionReconocer()}
    </section>
  </div>`;
  ctx.tituloMovil.textContent = `Tema ${tema02.numero} · ${leccion.titulo}`;

  const contenedor = ctx.pagina.querySelector<HTMLElement>('[data-capitalizacion-compuesta]');
  const detenerLeccion = contenedor ? montarCapitalizacionCompuesta(contenedor) : () => {};
  const detenerPractica = montarPracticaCompuesta(ctx.pagina);
  detenerExperiencia = () => {
    detenerLeccion();
    detenerPractica();
  };
  if (ruta.parte) ctx.pagina.querySelector(`#mat-${ruta.parte}`)?.scrollIntoView({ block: 'start' });
}

/** Si la lección ya está montada, solo se desplaza a la parte pedida. Devuelve si lo ha hecho. */
export function desplazarTemaDos(ctx: ContextoVista, ruta: RutaTema2): boolean {
  if (!detenerExperiencia || !ctx.pagina.querySelector('.tema-matematica')) return false;
  if (ruta.parte) ctx.pagina.querySelector(`#mat-${ruta.parte}`)?.scrollIntoView({ block: 'start' });
  else window.scrollTo(0, 0);
  return true;
}

export function pintarRailTemaDos(rail: HTMLElement, ruta: RutaTema2): void {
  const leccion = LECCIONES_TEMA2[0];
  const partes = PARTES_LECCION.map((p, i) => {
    const activa = ruta.parte === p.id;
    return `<a class="sl${activa ? ' on' : ''}" href="${hrefTema2(leccion.id, p.id)}"${activa ? ' aria-current="location"' : ''}><div class="top"><span class="id">${String(i + 1).padStart(2, '0')}</span><span>${p.titulo}</span></div><small class="sl-sub">${p.subtitulo}</small></a>`;
  }).join('');
  rail.innerHTML = `${enlaceTodosLosTemas()}<a class="brand" href="${hrefTema2()}"><span class="ring tema-anillo" aria-hidden="true">${tema02.numero}</span><span><small class="brand-ante">Gestión financiera</small><b>${tema02.titulo}</b><small>Tema ${tema02.numero}</small></span></a>
    <div class="grp">${leccion.titulo}</div>${partes}`;
}
