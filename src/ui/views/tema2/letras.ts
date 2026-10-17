/*
 * Descuento · Varias letras con fechas distintas: el apartado de los ejercicios de examen, en los que
 * casi nunca hay una sola letra. Tres partes: contar los días entre fechas, la remesa (varias letras
 * descontadas el mismo día) y la fecha focal (llevar varias letras a una misma fecha para sustituirlas
 * por una). Cada parte con su animación y su ejercicio.
 */
import { hrefBloqueTema2, hrefFase, hrefLetras } from '../../../app/router.ts';
import { escenaFechaFocal } from '../../escenas/fechaFocal.ts';
import { escenaRemesaTres } from '../../escenas/remesa.ts';
import { montarReproductor } from '../../motion/reproductor.ts';
import { recorridoFases } from './comun.ts';
import { htmlFocalPractica, montarFocalPractica } from './focalPractica.ts';
import { htmlRemesaPractica, montarRemesaPractica } from './remesaPractica.ts';

/** Enlace destacado al apartado, para las fases del bloque Descuento y la ficha de la fórmula 17. */
export function tarjetaLetras(): string {
  return `<a class="t2-letras-enlace" href="${hrefLetras()}"><b>En el examen: varias letras con fechas distintas</b><span>Remesas de tres letras y fecha focal, con animación y ejercicios</span><i aria-hidden="true">→</i></a>`;
}

export function htmlLetras(): string {
  return `<div class="tema-matematica t2 t2-fase-pagina t2-letras">
    <nav class="t2-volver"><a href="${hrefBloqueTema2('descuento')}">← Descuento · índice de fórmulas</a></nav>
    <header class="t2-cabecera t2-cabecera-fase">
      <p class="t2-ceja">Descuento · ejercicios de examen</p>
      <h1>Varias letras con fechas distintas</h1>
      <p class="t2-entradilla">En el examen casi nunca hay una sola letra: suelen ser varias, cada una con su vencimiento (por ejemplo, a 40, 50 y 300 días). Cada letra tiene su propio tiempo y se calcula por separado; al final se suma todo.</p>
      ${recorridoFases('descuento', null, true)}
      <ol class="t2-letras-indice">
        <li><a href="${hrefLetras()}#t2-letras-dias"><b>1</b>Contar los días</a></li>
        <li><a href="${hrefLetras()}#t2-letras-remesa"><b>2</b>Remesa</a></li>
        <li><a href="${hrefLetras()}#t2-letras-focal"><b>3</b>Fecha focal</a></li>
      </ol>
    </header>

    <section class="t2-letras-sec" id="t2-letras-dias" aria-labelledby="t2-letras-dias-tit">
      <h2 id="t2-letras-dias-tit"><span>1</span>Contar los días entre dos fechas</h2>
      <p>El tiempo de cada letra son los días entre la fecha de referencia (el día del descuento, o la fecha focal) y su vencimiento. No cuenta el primer día y sí el último. Mes a mes: lo que queda del primer mes, los meses enteros y los días del último mes.</p>
      <p class="t2-letras-ej">Del 10 de marzo al 19 de abril: 21 (marzo: 31 − 10) + 19 (abril) = <b>40 días</b>. Del 10 de marzo al 29 de abril: 21 + 29 = <b>50 días</b>.</p>
      <p>Después, como el tipo es anual, se pasa a años: n = días / 360 (año comercial) o días / 365 (año civil), según el enunciado.</p>
    </section>

    <section class="t2-letras-sec" id="t2-letras-remesa" aria-labelledby="t2-letras-remesa-tit">
      <h2 id="t2-letras-remesa-tit"><span>2</span>Remesa: varias letras descontadas el mismo día</h2>
      <p>La empresa lleva al banco varias letras el mismo día. Cada una vence en una fecha distinta, así que cada una tiene sus días, su descuento y su comisión. El valor líquido es la suma de todo.</p>
      <div class="t2-letras-anim" data-remesa-anim></div>
      ${htmlRemesaPractica()}
    </section>

    <section class="t2-letras-sec" id="t2-letras-focal" aria-labelledby="t2-letras-focal-tit">
      <h2 id="t2-letras-focal-tit"><span>3</span>Fecha focal: llevar varias letras a la misma fecha</h2>
      <p>Para sustituir varias letras por una sola, todas se llevan a la fecha de la letra nueva (la fecha focal X). Las que vencen antes de X van hacia delante (se capitalizan); las que vencen después, hacia atrás (se descuentan). Qué ley se usa lo dice el enunciado.</p>
      <div class="t2-letras-anim" data-focal-anim></div>
      ${htmlFocalPractica()}
    </section>

    <nav class="t2-continuar"><a class="btn-principal" href="${hrefFase('descuento', 'practica')}">D · Practicar en papel (una letra)</a></nav>
  </div>`;
}

export function montarLetras(raiz: HTMLElement): () => void {
  const paradas: (() => void)[] = [montarRemesaPractica(raiz), montarFocalPractica(raiz)];
  const remesa = raiz.querySelector<HTMLElement>('[data-remesa-anim]');
  const focal = raiz.querySelector<HTMLElement>('[data-focal-anim]');
  if (remesa) paradas.push(montarReproductor(remesa, escenaRemesaTres));
  if (focal) paradas.push(montarReproductor(focal, escenaFechaFocal));
  return () => paradas.forEach((parar) => parar());
}
