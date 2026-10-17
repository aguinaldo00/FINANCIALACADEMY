/*
 * Fase D (Descuento) · Remesa de tres letras, como en el examen: el enunciado da la fecha del
 * descuento y la del vencimiento de cada letra, y el alumno cuenta los días, descuenta cada letra por
 * separado (Dc = N · días/base · d), aplica la comisión con su mínimo y suma. Aquí se comprueba fila
 * a fila y el valor líquido. Las cifras salen de src/domain/tema2/remesa.ts; el número lo hace
 * reproducible.
 */
import { desgloseDias, fechaDescuento, generarRemesa, liquidarRemesa, sumarDias, textoFecha, type Fecha, type Liquidacion } from '../../../domain/tema2/remesa.ts';
import { escaparHtml, formulaHtml, hrefFormula } from './comun.ts';
import { leerNumero } from './fases.ts';

export const eur = (v: number) => `${new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v)} €`;
const pct = (v: number) => `${new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 }).format(v * 100)} %`;
const LETRAS = [0, 1, 2] as const;
const ORDENES = [[1, 2, 0], [2, 0, 1], [0, 2, 1], [1, 0, 2], [2, 1, 0], [0, 1, 2]] as const;

interface Remesa {
  semilla: number;
  descuento: Fecha;
  vencimientos: Fecha[];
  liquidacion: Liquidacion;
  base: 360 | 365;
  d: number;
  enunciado: string;
}

export function remesaDe(semilla: number): Remesa {
  const generada = generarRemesa(semilla);
  const c = generada.condiciones;
  // Las letras van desordenadas, como en los ejercicios reales: no siempre la primera es la que vence antes.
  const orden = ORDENES[semilla % ORDENES.length]!;
  const letras = orden.map((k) => generada.letras[k]!);
  const descuento = fechaDescuento(semilla);
  const vencimientos = letras.map((l) => sumarDias(descuento, l.dias));
  const liquidacion = liquidarRemesa(letras, c);
  const lista = letras.map((l, k) => `letra ${k + 1}: ${eur(l.nominal).replace(',00 €', ' €')}, vence el ${textoFecha(vencimientos[k]!, vencimientos[k]!.anio !== descuento.anio)}`).join('; ');
  const enunciado = `El ${textoFecha(descuento)} una empresa lleva al banco una remesa de tres letras (${lista}). El banco las descuenta al ${pct(c.d)} de descuento comercial simple, con año ${c.base === 360 ? 'comercial (360 días)' : 'civil (365 días)'}, y cobra una comisión del ${pct(c.comision)} sobre el nominal con un mínimo de ${c.minimo} € por letra, más ${c.gastos} € de gastos de correo por letra. ¿Cuál es el valor líquido de la remesa?`;
  return { semilla, descuento, vencimientos, liquidacion, base: c.base, d: c.d, enunciado };
}

export const DADO = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="3.5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="9" cy="9" r="1.5" fill="currentColor"/><circle cx="15" cy="15" r="1.5" fill="currentColor"/><circle cx="15" cy="9" r="1.5" fill="currentColor"/><circle cx="9" cy="15" r="1.5" fill="currentColor"/></svg>';

/** Los días mes a mes; los meses enteros del medio, juntos: «21 (abril) + 245 (mayo a diciembre) + 1 (enero)». */
export function desglose(desde: Fecha, hasta: Fecha): string {
  const p = desgloseDias(desde, hasta);
  const trozos = p.length > 3
    ? [p[0]!, { mes: `${p[1]!.mes} a ${p[p.length - 2]!.mes}`, dias: p.slice(1, -1).reduce((a, x) => a + x.dias, 0) }, p[p.length - 1]!]
    : p;
  return trozos.map((x) => `${x.dias} (${x.mes})`).join(' + ');
}

export function htmlRemesaPractica(): string {
  const campo = (k: number, nombre: string, etiqueta: string, pista: string) =>
    `<label class="t2-rem-campo"><span>${etiqueta}</span><input class="lab-campo" inputmode="decimal" autocomplete="off" data-rem="${nombre}:${k}" placeholder="${pista}"></label>`;
  return `<article class="t2-practica t2-aleatorio t2-rem-ej" data-remesa-ej aria-labelledby="t2-rem-ej-tit">
    <header><span class="t2-ej-num" aria-hidden="true">3</span><h2 class="t2-aleatorio-tit" id="t2-rem-ej-tit">Remesa de tres letras</h2><p class="t2-ej-fuente" data-rem-origen></p></header>
    <p class="t2-instruccion">Como en el examen: varias letras, cada una con su fecha. Haz la tabla en tu cuaderno (días, descuento y comisión de cada letra) y comprueba aquí cada fila y el total.</p>
    <p class="t2-enunciado" data-rem-enunciado></p>
    <form class="t2-rem-tabla" data-rem-form>
      ${LETRAS.map((k) => `<fieldset class="t2-rem-fila" data-rem-fila="${k}"><legend>Letra ${k + 1} <small data-rem-nominal="${k}"></small></legend>
        ${campo(k, 'dias', 'Días', 'p. ej. 40')}
        ${campo(k, 'dc', 'Descuento (Dc)', 'p. ej. 6,67')}
        ${campo(k, 'comision', 'Comisión', 'p. ej. 12')}
      </fieldset>`).join('')}
      <div class="t2-rem-total">
        <label class="t2-rem-campo"><span>Valor líquido de la remesa</span><input class="lab-campo" inputmode="decimal" autocomplete="off" data-rem="liquido:0" placeholder="p. ej. 4.801,77"></label>
        <button type="submit" class="btn-principal">Comprobar</button>
      </div>
    </form>
    <p class="t2-feedback" aria-live="polite" data-rem-feedback></p>
    <div class="t2-pistas">
      <button type="button" class="btn-control" data-rem-pista="dias">Pista: cómo contar los días</button>
      <button type="button" class="btn-control" data-rem-pista="solucion" disabled>Ver la solución</button>
      <button type="button" class="btn-secundario" data-rem-otra>${DADO}Otra remesa</button>
    </div>
    <div class="t2-ayuda" data-rem-ayuda-dias hidden></div>
    <div class="t2-solucion" data-rem-solucion hidden></div>
  </article>`;
}

/** Corrige una casilla. Devuelve null si está bien (o vacía) y, si no, qué revisar. */
function revisar(campo: string, texto: string, esperado: number, r: Remesa, k: number): string | null {
  const leido = leerNumero(texto);
  if (!leido) return 'escribe un número';
  const v = leido.valor;
  if (campo === 'dias') {
    if (v === esperado) return null;
    if (v === esperado + 1) return 'has contado también el día del descuento: ese día no cuenta, el del vencimiento sí';
    return 'cuenta lo que queda del mes del descuento, los meses enteros y los días del mes del vencimiento';
  }
  const tolerancia = campo === 'liquido' ? 0.05 : 0.011;
  if (Math.abs(v - esperado) <= tolerancia) return null;
  const linea = r.liquidacion.lineas[k];
  if (campo === 'dc' && linea) {
    const otraBase = linea.nominal * (linea.dias / (r.base === 360 ? 365 : 360)) * r.d;
    if (Math.abs(v - otraBase) <= 0.011) return `el enunciado dice año ${r.base === 360 ? 'comercial: días / 360' : 'civil: días / 365'}`;
    return 'Dc = N · (días / base) · d, con los días de esta letra';
  }
  if (campo === 'comision' && linea?.minimoAplicado) return `el porcentaje no llega al mínimo: se cobra el mínimo`;
  if (campo === 'comision') return 'es el porcentaje sobre el nominal (si no llega al mínimo, el mínimo)';
  return 'nominales − descuentos − comisiones − gastos (los gastos van por letra)';
}

export function montarRemesaPractica(raiz: HTMLElement): () => void {
  const art = raiz.querySelector<HTMLElement>('[data-remesa-ej]');
  if (!art) return () => {};
  const $ = <T extends HTMLElement>(sel: string) => art.querySelector<T>(sel)!;
  const form = $<HTMLFormElement>('[data-rem-form]');
  const feedback = $('[data-rem-feedback]');
  const ayudaDias = $('[data-rem-ayuda-dias]');
  const solucion = $('[data-rem-solucion]');
  const botonSolucion = $<HTMLButtonElement>('[data-rem-pista="solucion"]');
  let r = remesaDe(Math.floor(Math.random() * 99991) + 1);

  const pintar = () => {
    $('[data-rem-origen]').textContent = `nº ${r.semilla}`;
    $('[data-rem-enunciado]').textContent = r.enunciado;
    LETRAS.forEach((k) => { $(`[data-rem-nominal="${k}"]`).textContent = eur(r.liquidacion.lineas[k]!.nominal); });
    form.querySelectorAll<HTMLInputElement>('[data-rem]').forEach((i) => { i.value = ''; i.removeAttribute('aria-invalid'); i.classList.remove('t2-rem-bien'); });
    feedback.textContent = '';
    feedback.className = 't2-feedback';
    const ejemplo = r.liquidacion.lineas[0]!;
    const partes = desglose(r.descuento, r.vencimientos[0]!);
    ayudaDias.innerHTML = `<p>No cuenta el día del descuento y sí el del vencimiento. Mes a mes: lo que queda del mes del descuento (días del mes − día del descuento), los meses enteros y los días del mes del vencimiento.</p>
      <p>Letra 1, del ${escaparHtml(textoFecha(r.descuento, false))} al ${escaparHtml(textoFecha(r.vencimientos[0]!, false))}: ${partes} = <b>${ejemplo.dias} días</b>. Las otras dos, igual.</p>`;
    ayudaDias.hidden = true;
    solucion.hidden = true;
    botonSolucion.disabled = true;
    const L = r.liquidacion;
    solucion.innerHTML = `<ol>
      ${L.lineas.map((x, k) => `<li><b>Letra ${k + 1}</b> (${eur(x.nominal)}): ${desglose(r.descuento, r.vencimientos[k]!)} = ${x.dias} días · ${formulaHtml(`D_c = ${eur(x.nominal).replace(',00 €', '')} · ${x.dias}/${r.base} · ${String(r.d).replace('.', ',')}`)} = ${eur(x.descuento)} · comisión ${eur(x.comision)}${x.minimoAplicado ? ' (el mínimo)' : ''} · gastos ${eur(x.gastos)}</li>`).join('')}
      <li>Sumas: descuentos ${eur(L.descuento)}, comisiones ${eur(L.comision)}, gastos ${eur(L.gastos)}.</li>
    </ol>
    <p class="t2-resultado">Valor líquido = ${eur(L.nominal)} − ${eur(L.descuento)} − ${eur(L.comision)} − ${eur(L.gastos)} = <b>${eur(L.liquido)}</b></p>
    <p><a href="${hrefFormula('descuento-remesa')}">Ver la fórmula 17 y su animación</a></p>`;
  };

  const alEnviar = (e: Event) => {
    e.preventDefault();
    const fallos: string[] = [];
    let rellenas = 0;
    form.querySelectorAll<HTMLInputElement>('[data-rem]').forEach((input) => {
      const [campo, kTexto] = input.dataset.rem!.split(':') as [string, string];
      const k = Number(kTexto);
      input.classList.remove('t2-rem-bien');
      input.removeAttribute('aria-invalid');
      if (!input.value.trim()) return;
      rellenas += 1;
      const linea = r.liquidacion.lineas[k]!;
      const esperado = campo === 'dias' ? linea.dias : campo === 'dc' ? linea.descuento : campo === 'comision' ? linea.comision : r.liquidacion.liquido;
      const aviso = revisar(campo, input.value, esperado, r, k);
      if (aviso) {
        input.setAttribute('aria-invalid', 'true');
        fallos.push(`${campo === 'liquido' ? 'Valor líquido' : `Letra ${k + 1}, ${campo === 'dias' ? 'días' : campo === 'dc' ? 'descuento' : 'comisión'}`}: ${aviso}.`);
      } else input.classList.add('t2-rem-bien');
    });
    botonSolucion.disabled = false;
    if (!rellenas) {
      feedback.textContent = 'Escribe al menos una casilla (por ejemplo, los días de cada letra) y comprueba.';
      feedback.className = 't2-feedback';
      return;
    }
    const total = form.querySelector<HTMLInputElement>('[data-rem="liquido:0"]')!;
    const todoBien = !fallos.length && total.classList.contains('t2-rem-bien');
    feedback.className = `t2-feedback ${todoBien ? 'bien' : fallos.length ? 'mal' : 'bien'}`;
    feedback.innerHTML = todoBien
      ? `<b>Bien:</b> ${eur(r.liquidacion.liquido)}. Así se resuelve una remesa de examen.`
      : fallos.length ? `<b>Revisa.</b> ${fallos.map(escaparHtml).join(' ')}` : '<b>Vas bien.</b> Lo que has escrito está bien; sigue con el resto de la tabla.';
  };

  const alPulsar = (e: Event) => {
    const b = (e.target as Element | null)?.closest<HTMLButtonElement>('button');
    if (!b || !art.contains(b)) return;
    if (b.dataset.remPista === 'dias') ayudaDias.hidden = !ayudaDias.hidden;
    else if (b.dataset.remPista === 'solucion') solucion.hidden = false;
    else if (b.hasAttribute('data-rem-otra')) { r = remesaDe(Math.floor(Math.random() * 99991) + 1); pintar(); }
  };

  pintar();
  form.addEventListener('submit', alEnviar);
  art.addEventListener('click', alPulsar);
  return () => {
    form.removeEventListener('submit', alEnviar);
    art.removeEventListener('click', alPulsar);
  };
}
