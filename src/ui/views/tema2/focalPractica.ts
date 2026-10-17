/*
 * Fase D (Descuento) · Equivalencia de capitales en una fecha focal: tres letras con vencimientos
 * distintos se sustituyen por una sola que vence en X. Las que vencen antes de X se llevan hacia
 * delante (se capitalizan) y las que vencen después, hacia atrás (se descuentan), cada una con sus
 * días hasta X y con la ley que dice el enunciado. Se comprueba fila a fila y el nominal de la letra
 * nueva. Las cifras salen de src/domain/tema2/equivalencia.ts; el número lo hace reproducible.
 */
import { esCompuesta, generarFocal, trasladar, valorEnFocal, type EjercicioFocal, type LineaFocal, type Metodo, type Sentido } from '../../../domain/tema2/equivalencia.ts';
import { textoFecha, type Fecha } from '../../../domain/tema2/remesa.ts';
import { escaparHtml, formulaHtml } from './comun.ts';
import { leerNumero } from './fases.ts';
import { DADO, desglose, eur } from './remesaPractica.ts';

const LETRAS = [0, 1, 2] as const;
const pct = (v: number) => `${new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 }).format(v * 100)} %`;
const coma = (v: number) => String(v).replace('.', ',');
const plano = (v: number) => eur(v).replace(',00 €', '').replace(' €', '');

const anio = (base: number) => (base === 360 ? 'año comercial (360 días)' : 'año civil (365 días)');
/** Lo que dice el enunciado sobre la ley de cada sentido: el temario no fija una por defecto. */
const LEY: Record<Metodo, (tipo: string, base: number) => string> = {
  'simple-comercial': (tipo, base) => `Régimen simple, ${anio(base)}: las letras que vencen antes de la nueva fecha se capitalizan a interés simple al ${tipo} y las que vencen después se descuentan con descuento comercial simple al ${tipo}.`,
  'simple-racional': (tipo, base) => `Régimen simple, ${anio(base)}: las letras que vencen antes de la nueva fecha se capitalizan a interés simple al ${tipo} y las que vencen después se descuentan con descuento racional simple al ${tipo}.`,
  'compuesta-racional': (tipo, base) => `Régimen compuesto, ${anio(base)}: las letras que vencen antes de la nueva fecha se capitalizan a interés compuesto al ${tipo} y las que vencen después se descuentan con descuento compuesto racional al ${tipo}.`,
  'compuesta-comercial': (tipo, base) => `Régimen compuesto, ${anio(base)}: las letras que vencen antes de la nueva fecha se capitalizan a interés compuesto al ${tipo} y las que vencen después se descuentan con descuento compuesto comercial al ${tipo}.`,
};

/** La fórmula del temario que toca en cada sentido, con su número. */
const FORMULA: Record<Metodo, Record<'delante' | 'atras', { nombre: string; fx: string }>> = {
  'simple-comercial': { delante: { nombre: 'capitalización simple (fórmula 2)', fx: 'C_n = C_0 · (1 + n · i)' }, atras: { nombre: 'descuento comercial simple: el efectivo (fórmula 15)', fx: 'E = N · (1 - n · d)' } },
  'simple-racional': { delante: { nombre: 'capitalización simple (fórmula 2)', fx: 'C_n = C_0 · (1 + n · i)' }, atras: { nombre: 'descuento racional simple (fórmulas 3 y 16)', fx: 'C_0 = \\frac{C_n}{1 + n · i}' } },
  'compuesta-racional': { delante: { nombre: 'capitalización compuesta (fórmula 7)', fx: 'C_n = C_0 · (1 + i)^n' }, atras: { nombre: 'descuento compuesto racional (fórmulas 9 y 18)', fx: 'C_0 = C_n · (1 + i)^{-n}' } },
  'compuesta-comercial': { delante: { nombre: 'capitalización compuesta (fórmula 7)', fx: 'C_n = C_0 · (1 + i)^n' }, atras: { nombre: 'descuento compuesto comercial: el efectivo (fórmula 19)', fx: 'E = N · (1 - d)^n' } },
};

/** Por qué cada sentido lleva su operación. */
const POR_QUE = {
  delante: 'vence antes de X: ese dinero se cobraría antes de la fecha de la letra nueva y, hasta X, produce intereses. Por eso se capitaliza y vale más.',
  atras: 'vence después de X: pagarla en X es pagarla antes de su vencimiento. Por eso se descuenta y vale menos.',
} as const;

interface Focal extends EjercicioFocal {
  semilla: number;
  lineas: LineaFocal[];
  total: number;
  enunciado: string;
}

export function focalDe(semilla: number): Focal {
  const e = generarFocal(semilla);
  const { lineas, total } = valorEnFocal(e.capitales, e.diasFocal, e.metodo, e.tipo, e.base);
  const conAnio = (k: number) => e.vencimientos[k]!.anio !== e.hoy.anio;
  const lista = e.capitales.map((c, k) => `letra ${k + 1} de ${plano(c.nominal)} € que vence el ${textoFecha(e.vencimientos[k]!, conAnio(k))}`).join('; ');
  const enunciado = `Hoy, ${textoFecha(e.hoy)}, una empresa debe tres letras: ${lista}. Acuerda con su acreedor sustituirlas por una sola letra equivalente que vencerá el ${textoFecha(e.focal, e.focal.anio !== e.hoy.anio)}. ${LEY[e.metodo](pct(e.tipo), e.base)} ¿Cuál será el nominal de la nueva letra?`;
  return { ...e, semilla, lineas, total, enunciado };
}

/** La cuenta de una letra con sus números, como se escribe en el cuaderno. */
function cuenta(f: Focal, l: LineaFocal): string {
  const n = `${l.dias}/${f.base}`;
  const i = coma(f.tipo);
  if (l.sentido === 'delante') return esCompuesta(f.metodo) ? `${plano(l.nominal)} · (1 + ${i})^{${n}}` : `${plano(l.nominal)} · (1 + ${n} · ${i})`;
  if (f.metodo === 'simple-comercial') return `${plano(l.nominal)} · (1 - ${n} · ${i})`;
  if (f.metodo === 'simple-racional') return `\\frac{${plano(l.nominal)}}{1 + ${n} · ${i}}`;
  if (f.metodo === 'compuesta-comercial') return `${plano(l.nominal)} · (1 - ${i})^{${n}}`;
  return `${plano(l.nominal)} · (1 + ${i})^{-${n}}`;
}

/**
 * La línea temporal del ejercicio: hoy, los tres vencimientos y X, en orden. Con `traslados`, cada
 * letra lleva su flecha hacia X y sus días.
 */
function lineaTemporal(f: Focal, traslados: boolean): string {
  const fecha = (x: Fecha) => escaparHtml(textoFecha(x, x.anio !== f.hoy.anio));
  const puntos = [
    { dia: 0, html: `<li class="t2-lt-punto t2-lt-hoy"><b>Hoy</b><span>${fecha(f.hoy)}</span></li>` },
    { dia: f.diasFocal, html: `<li class="t2-lt-punto t2-lt-x"><b>X</b><span>${fecha(f.focal)}</span><small>letra nueva</small></li>` },
    ...f.lineas.map((l, k) => ({
      dia: l.vence,
      html: `<li class="t2-lt-punto t2-lt-${l.sentido}"><b>Letra ${k + 1}</b><span>${fecha(f.vencimientos[k]!)}</span><small>${eur(l.nominal)}</small>${traslados ? `<em>${l.sentido === 'delante' ? `${l.dias} días → hasta X` : `← ${l.dias} días hasta X`}</em>` : ''}</li>`,
    })),
  ].sort((a, b) => a.dia - b.dia);
  return `<ol class="t2-lt" aria-label="Línea temporal: las fechas en orden">${puntos.map((p) => p.html).join('')}</ol>`;
}

export function htmlFocalPractica(): string {
  const campo = (k: number, nombre: string, etiqueta: string, pista: string) =>
    `<label class="t2-rem-campo"><span>${etiqueta}</span><input class="lab-campo" inputmode="decimal" autocomplete="off" data-foc="${nombre}:${k}" placeholder="${pista}"></label>`;
  return `<article class="t2-practica t2-aleatorio t2-rem-ej" data-focal-ej aria-labelledby="t2-foc-tit">
    <header><span class="t2-ej-num" aria-hidden="true">X</span><h2 class="t2-aleatorio-tit" id="t2-foc-tit">Varias letras a una fecha focal</h2><p class="t2-ej-fuente" data-foc-origen></p></header>
    <p class="t2-instruccion">Para sustituir varias letras por una, todas se llevan a la misma fecha: la de la letra nueva (la fecha focal X). Solo ahí se pueden sumar.</p>
    <ol class="t2-foc-pasos">
      <li><b>Línea temporal.</b> Coloca hoy, X y cada vencimiento en orden.</li>
      <li><b>Sentido.</b> Lo que queda antes de X va hacia delante (se capitaliza); lo que queda después, hacia atrás (se descuenta).</li>
      <li><b>Tiempo.</b> Los días entre el vencimiento de cada letra y X (no desde hoy): n = días / base.</li>
      <li><b>Operación.</b> La ley que dice el enunciado para cada sentido.</li>
      <li><b>Suma.</b> Los tres valores en X: ese es el nominal de la letra nueva.</li>
    </ol>
    <p class="t2-enunciado" data-foc-enunciado></p>
    <div data-foc-linea></div>
    <form class="t2-rem-tabla" data-foc-form>
      ${LETRAS.map((k) => `<fieldset class="t2-rem-fila" data-foc-fila="${k}"><legend>Letra ${k + 1} <small data-foc-nominal="${k}"></small></legend>
        ${campo(k, 'dias', 'Días hasta X', 'p. ej. 40')}
        <label class="t2-rem-campo"><span>Sentido</span><select class="lab-campo hoja-select" data-foc="sentido:${k}"><option value="">¿Hacia dónde?</option><option value="delante">→ Delante</option><option value="atras">← Atrás</option></select></label>
        ${campo(k, 'valor', 'Valor en X', 'p. ej. 2.011,11')}
      </fieldset>`).join('')}
      <div class="t2-rem-total">
        <label class="t2-rem-campo"><span>Nominal de la letra nueva</span><input class="lab-campo" inputmode="decimal" autocomplete="off" data-foc="total:0" placeholder="p. ej. 9.781,95"></label>
        <button type="submit" class="btn-principal">Comprobar</button>
      </div>
    </form>
    <p class="t2-feedback" aria-live="polite" data-foc-feedback></p>
    <div class="t2-pistas">
      <button type="button" class="btn-control" data-foc-pista="eje">Pista: los traslados en la línea</button>
      <button type="button" class="btn-control" data-foc-pista="solucion" disabled>Ver la solución</button>
      <button type="button" class="btn-secundario" data-foc-otra>${DADO}Otro ejercicio</button>
    </div>
    <div class="t2-ayuda" data-foc-eje hidden></div>
    <div class="t2-solucion" data-foc-solucion hidden></div>
  </article>`;
}

/** Corrige una casilla. Devuelve null si está bien y, si no, qué revisar. */
function revisar(f: Focal, campo: string, texto: string, l: LineaFocal): string | null {
  const antesDespues = l.sentido === 'delante' ? 'vence antes de X: va hacia delante (se capitaliza)' : 'vence después de X: va hacia atrás (se descuenta)';
  if (campo === 'sentido') return texto === l.sentido ? null : antesDespues;
  const leido = leerNumero(texto);
  if (!leido) return 'escribe un número';
  const v = leido.valor;
  if (campo === 'dias') {
    if (v === l.dias) return null;
    if (Math.abs(v - l.dias) === 1) return 'te sobra o te falta un día: cuenta el día de llegada y no el de salida';
    return 'son los días entre el vencimiento de esta letra y la fecha focal X (no desde hoy)';
  }
  const cerca = (a: number, b: number, tol = 0.011) => Math.abs(a - b) <= tol;
  if (campo === 'total') return cerca(v, f.total, 0.05) ? null : 'suma los valores de las tres letras ya llevados a X (no los nominales)';
  if (cerca(v, l.valor)) return null;
  const otro: Sentido = l.sentido === 'delante' ? 'atras' : 'delante';
  if (cerca(v, trasladar(l.nominal, l.dias / f.base, otro, f.metodo, f.tipo))) return `la has movido al revés: ${antesDespues}`;
  if (l.sentido === 'atras') {
    const otraLey: Record<Metodo, Metodo> = { 'simple-comercial': 'simple-racional', 'simple-racional': 'simple-comercial', 'compuesta-racional': 'compuesta-comercial', 'compuesta-comercial': 'compuesta-racional' };
    if (cerca(v, trasladar(l.nominal, l.dias / f.base, 'atras', otraLey[f.metodo], f.tipo))) return `el enunciado dice ${FORMULA[f.metodo].atras.nombre}`;
  }
  const otroRegimen: Metodo = esCompuesta(f.metodo) ? 'simple-comercial' : 'compuesta-racional';
  if (l.sentido === 'delante' && cerca(v, trasladar(l.nominal, l.dias / f.base, 'delante', otroRegimen, f.tipo))) return `el enunciado dice régimen ${esCompuesta(f.metodo) ? 'compuesto' : 'simple'}: ${FORMULA[f.metodo].delante.nombre}`;
  if (cerca(v, trasladar(l.nominal, l.dias / (f.base === 360 ? 365 : 360), l.sentido, f.metodo, f.tipo))) return `el enunciado dice año de ${f.base} días`;
  if (cerca(v, trasladar(l.nominal, f.diasFocal / f.base, l.sentido, f.metodo, f.tipo)) || cerca(v, trasladar(l.nominal, l.vence / f.base, l.sentido, f.metodo, f.tipo))) return 'el tiempo de cada letra es el que hay entre su vencimiento y X, no el que hay desde hoy';
  return `revisa la cuenta: n = días / ${f.base} y ${FORMULA[f.metodo][l.sentido === 'delante' ? 'delante' : 'atras'].nombre}`;
}

export function montarFocalPractica(raiz: HTMLElement): () => void {
  const art = raiz.querySelector<HTMLElement>('[data-focal-ej]');
  if (!art) return () => {};
  const $ = <T extends HTMLElement>(sel: string) => art.querySelector<T>(sel)!;
  const form = $<HTMLFormElement>('[data-foc-form]');
  const feedback = $('[data-foc-feedback]');
  const eje = $('[data-foc-eje]');
  const linea = $('[data-foc-linea]');
  const solucion = $('[data-foc-solucion]');
  const botonSolucion = $<HTMLButtonElement>('[data-foc-pista="solucion"]');
  let f = focalDe(Math.floor(Math.random() * 99991) + 1);

  const pintar = () => {
    $('[data-foc-origen]').textContent = `nº ${f.semilla}`;
    $('[data-foc-enunciado]').textContent = f.enunciado;
    LETRAS.forEach((k) => { $(`[data-foc-nominal="${k}"]`).textContent = eur(f.lineas[k]!.nominal); });
    form.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[data-foc]').forEach((i) => { i.value = ''; i.removeAttribute('aria-invalid'); i.classList.remove('t2-rem-bien'); });
    feedback.textContent = '';
    feedback.className = 't2-feedback';
    linea.innerHTML = lineaTemporal(f, false);
    eje.innerHTML = `${lineaTemporal(f, true)}<p>Lo que queda a la izquierda de X va hacia delante; lo que queda a la derecha, hacia atrás. Los días de cada letra van de su vencimiento a X, no desde hoy.</p>`;
    eje.hidden = true;
    solucion.hidden = true;
    botonSolucion.disabled = true;
    solucion.innerHTML = `<ol>
      ${f.lineas.map((l, k) => {
        const v = f.vencimientos[k]!;
        const dias = l.sentido === 'delante' ? desglose(v, f.focal) : desglose(f.focal, v);
        const sentido = l.sentido === 'delante' ? 'delante' : 'atras';
        const fx = FORMULA[f.metodo][sentido];
        return `<li><b>Letra ${k + 1}</b> (${eur(l.nominal)}, vence el ${escaparHtml(textoFecha(v, v.anio !== f.hoy.anio))})
          <p>${sentido === 'delante' ? '<b>Hacia delante.</b> ' : '<b>Hacia atrás.</b> '}${escaparHtml(POR_QUE[sentido][0]!.toUpperCase() + POR_QUE[sentido].slice(1))}</p>
          <p>Tiempo: ${dias} = ${l.dias} días → n = ${l.dias}/${f.base}.</p>
          <p>Operación: ${escaparHtml(fx.nombre)}, ${formulaHtml(fx.fx)} → ${formulaHtml(cuenta(f, l))} = <b>${eur(l.valor)}</b></p></li>`;
      }).join('')}
    </ol>
    <p class="t2-resultado">Ya están las tres en X: nominal de la letra nueva = ${f.lineas.map((l) => eur(l.valor)).join(' + ')} = <b>${eur(f.total)}</b></p>`;
  };

  const alEnviar = (e: Event) => {
    e.preventDefault();
    const fallos: string[] = [];
    let rellenas = 0;
    form.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[data-foc]').forEach((campo) => {
      const [nombre, kTexto] = campo.dataset.foc!.split(':') as [string, string];
      const k = Number(kTexto);
      campo.classList.remove('t2-rem-bien');
      campo.removeAttribute('aria-invalid');
      if (!campo.value.trim()) return;
      rellenas += 1;
      const aviso = revisar(f, nombre, campo.value, f.lineas[k]!);
      if (aviso) {
        campo.setAttribute('aria-invalid', 'true');
        fallos.push(`${nombre === 'total' ? 'Letra nueva' : `Letra ${k + 1}, ${nombre === 'dias' ? 'días' : nombre === 'sentido' ? 'sentido' : 'valor en X'}`}: ${aviso}.`);
      } else campo.classList.add('t2-rem-bien');
    });
    botonSolucion.disabled = false;
    if (!rellenas) {
      feedback.textContent = 'Rellena al menos una casilla (por ejemplo, los días y el sentido de cada letra) y comprueba.';
      feedback.className = 't2-feedback';
      return;
    }
    const todoBien = !fallos.length && $('[data-foc="total:0"]').classList.contains('t2-rem-bien');
    feedback.className = `t2-feedback ${fallos.length ? 'mal' : 'bien'}`;
    feedback.innerHTML = todoBien
      ? `<b>Bien:</b> ${eur(f.total)}. Las tres letras ya están en la misma fecha.`
      : fallos.length ? `<b>Revisa.</b> ${fallos.map(escaparHtml).join(' ')}` : '<b>Vas bien.</b> Lo que has escrito está bien; sigue con el resto.';
  };

  const alPulsar = (e: Event) => {
    const b = (e.target as Element | null)?.closest<HTMLButtonElement>('button');
    if (!b || !art.contains(b)) return;
    if (b.dataset.focPista === 'eje') eje.hidden = !eje.hidden;
    else if (b.dataset.focPista === 'solucion') solucion.hidden = false;
    else if (b.hasAttribute('data-foc-otra')) { f = focalDe(Math.floor(Math.random() * 99991) + 1); pintar(); }
  };

  pintar();
  form.addEventListener('submit', alEnviar);
  art.addEventListener('click', alPulsar);
  return () => {
    form.removeEventListener('submit', alEnviar);
    art.removeEventListener('click', alPulsar);
  };
}
