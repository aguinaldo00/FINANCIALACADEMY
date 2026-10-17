/*
 * Fase D (Descuento) · Equivalencia de capitales en una fecha focal: tres letras con vencimientos
 * distintos se sustituyen por una sola que vence en X. Las que vencen antes de X se llevan hacia
 * delante (se capitalizan) y las que vencen después, hacia atrás (se descuentan), cada una con sus
 * días hasta X y con la ley que dice el enunciado. Se comprueba fila a fila y el nominal de la letra
 * nueva. Las cifras salen de src/domain/tema2/equivalencia.ts; el número lo hace reproducible.
 */
import { generarFocal, trasladar, valorEnFocal, type EjercicioFocal, type LineaFocal, type Metodo, type Sentido } from '../../../domain/tema2/equivalencia.ts';
import { textoFecha } from '../../../domain/tema2/remesa.ts';
import { escaparHtml, formulaHtml } from './comun.ts';
import { leerNumero } from './fases.ts';
import { DADO, desglose, eur } from './remesaPractica.ts';

const LETRAS = [0, 1, 2] as const;
const pct = (v: number) => `${new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 }).format(v * 100)} %`;
const coma = (v: number) => String(v).replace('.', ',');
const plano = (v: number) => eur(v).replace(',00 €', '').replace(' €', '');

const LEY: Record<Metodo, (tipo: string, base: number) => string> = {
  'simple-comercial': (tipo, base) => `Se opera en régimen simple al ${tipo}, con año ${base === 360 ? 'comercial (360 días)' : 'civil (365 días)'}: las letras que vencen antes de la nueva fecha se capitalizan a interés simple y las que vencen después se descuentan con descuento comercial.`,
  'simple-racional': (tipo, base) => `Se opera en régimen simple al ${tipo}, con año ${base === 360 ? 'comercial (360 días)' : 'civil (365 días)'}: las letras que vencen antes de la nueva fecha se capitalizan a interés simple y las que vencen después se actualizan con descuento racional.`,
  compuesta: (tipo) => `Se opera en régimen compuesto al ${tipo} anual, con año de 365 días: capitalización compuesta hacia delante y descuento compuesto hacia atrás.`,
};

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
  const enunciado = `Hoy, ${textoFecha(e.hoy)}, una empresa debe tres letras: ${lista}. Acuerda con su acreedor sustituirlas por una sola letra que vencerá el ${textoFecha(e.focal, e.focal.anio !== e.hoy.anio)}. ${LEY[e.metodo](pct(e.tipo), e.base)} ¿Cuál será el nominal de la nueva letra?`;
  return { ...e, semilla, lineas, total, enunciado };
}

/** La cuenta de una letra con sus números, como se escribe en el cuaderno. */
function cuenta(f: Focal, l: LineaFocal): string {
  const t = `${l.dias}/${f.base}`;
  const i = coma(f.tipo);
  if (l.sentido === 'delante') return f.metodo === 'compuesta' ? `${plano(l.nominal)} · (1 + ${i})^{${t}}` : `${plano(l.nominal)} · (1 + ${t} · ${i})`;
  if (f.metodo === 'simple-comercial') return `${plano(l.nominal)} · (1 - ${t} · ${i})`;
  if (f.metodo === 'simple-racional') return `${plano(l.nominal)} / (1 + ${t} · ${i})`;
  return `${plano(l.nominal)} · (1 + ${i})^{-${t}}`;
}

export function htmlFocalPractica(): string {
  const campo = (k: number, nombre: string, etiqueta: string, pista: string) =>
    `<label class="t2-rem-campo"><span>${etiqueta}</span><input class="lab-campo" inputmode="decimal" autocomplete="off" data-foc="${nombre}:${k}" placeholder="${pista}"></label>`;
  return `<article class="t2-practica t2-aleatorio t2-rem-ej" data-focal-ej aria-labelledby="t2-foc-tit">
    <header><span class="t2-ej-num" aria-hidden="true">X</span><h2 class="t2-aleatorio-tit" id="t2-foc-tit">Varias letras a una fecha focal</h2><p class="t2-ej-fuente" data-foc-origen></p></header>
    <p class="t2-instruccion">Sustituir varias letras por una: todas se llevan a la fecha de la letra nueva (la fecha focal X). Las que vencen antes de X van hacia delante; las que vencen después, hacia atrás. Cada una con sus días.</p>
    <p class="t2-enunciado" data-foc-enunciado></p>
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
      <button type="button" class="btn-control" data-foc-pista="eje">Pista: dibuja el eje</button>
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
  if (campo === 'total') return cerca(v, f.total, 0.05) ? null : 'suma los valores de las tres letras ya llevados a X';
  if (cerca(v, l.valor)) return null;
  const otro: Sentido = l.sentido === 'delante' ? 'atras' : 'delante';
  if (cerca(v, trasladar(l.nominal, l.dias / f.base, otro, f.metodo, f.tipo))) return `la has movido al revés: ${antesDespues}`;
  if (l.sentido === 'atras' && f.metodo !== 'compuesta') {
    const otraLey: Metodo = f.metodo === 'simple-comercial' ? 'simple-racional' : 'simple-comercial';
    if (cerca(v, trasladar(l.nominal, l.dias / f.base, 'atras', otraLey, f.tipo))) return `el enunciado dice descuento ${f.metodo === 'simple-comercial' ? 'comercial: N · (1 − t · d)' : 'racional: C / (1 + t · i)'}`;
  }
  if (cerca(v, trasladar(l.nominal, l.dias / (f.base === 360 ? 365 : 360), l.sentido, f.metodo, f.tipo))) return `el enunciado dice año de ${f.base} días`;
  if (cerca(v, trasladar(l.nominal, f.diasFocal / f.base, l.sentido, f.metodo, f.tipo)) || cerca(v, trasladar(l.nominal, l.vence / f.base, l.sentido, f.metodo, f.tipo))) return 'el tiempo de cada letra es el que hay entre su vencimiento y X, no el que hay desde hoy';
  return 'revisa la cuenta: t = días / base y la ley que dice el enunciado';
}

export function montarFocalPractica(raiz: HTMLElement): () => void {
  const art = raiz.querySelector<HTMLElement>('[data-focal-ej]');
  if (!art) return () => {};
  const $ = <T extends HTMLElement>(sel: string) => art.querySelector<T>(sel)!;
  const form = $<HTMLFormElement>('[data-foc-form]');
  const feedback = $('[data-foc-feedback]');
  const eje = $('[data-foc-eje]');
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
    // El eje: las fechas en orden, con X en su sitio.
    const puntos = [...f.lineas.map((l, k) => ({ dia: l.vence, texto: `Letra ${k + 1} (${textoFecha(f.vencimientos[k]!, f.vencimientos[k]!.anio !== f.hoy.anio)})` })), { dia: f.diasFocal, texto: `<b>X</b> (${textoFecha(f.focal, f.focal.anio !== f.hoy.anio)})` }].sort((a, b) => a.dia - b.dia);
    eje.innerHTML = `<p>Dibuja una línea de tiempo y coloca las fechas en orden: ${puntos.map((p) => p.texto).join(' → ')}. Lo que queda a la izquierda de X va hacia delante; lo que queda a la derecha, hacia atrás. Los días de cada letra se cuentan desde su vencimiento hasta X, no desde hoy.</p>`;
    eje.hidden = true;
    solucion.hidden = true;
    botonSolucion.disabled = true;
    solucion.innerHTML = `<ol>
      ${f.lineas.map((l, k) => {
        const v = f.vencimientos[k]!;
        const dias = l.sentido === 'delante' ? desglose(v, f.focal) : desglose(f.focal, v);
        return `<li><b>Letra ${k + 1}</b> (${eur(l.nominal)}, vence el ${escaparHtml(textoFecha(v, v.anio !== f.hoy.anio))}): ${l.sentido === 'delante' ? 'antes' : 'después'} de X, ${dias} = ${l.dias} días → ${l.sentido === 'delante' ? 'hacia delante' : 'hacia atrás'}: ${formulaHtml(cuenta(f, l))} = ${eur(l.valor)}</li>`;
      }).join('')}
    </ol>
    <p class="t2-resultado">Nominal de la letra nueva = ${f.lineas.map((l) => eur(l.valor)).join(' + ')} = <b>${eur(f.total)}</b></p>`;
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
