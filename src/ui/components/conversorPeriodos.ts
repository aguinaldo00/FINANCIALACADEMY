/*
 * Conversor de unidades de tiempo, con dos modos:
 *  - Duración: cuánto es una cantidad de una unidad en otra (1 semestre = 1,5 cuatrimestres).
 *  - Tipo de interés: qué tipo de una unidad equivale a otro, en simple (proporcional) o en compuesta
 *    (tantos equivalentes), incluido entre dos fracciones del año (trimestral → cuatrimestral).
 * En los dos, la animación se genera para la pareja elegida (escenas/conversionPeriodos.ts y
 * escenas/conversionTipos.ts), cubre cualquier unidad del temario hacia cualquier otra y se amplía.
 * Al lado, una calculadora analógica (la misma del laboratorio) para hacer la cuenta a mano.
 */
import { calcular, formatear } from '../../domain/tema2/expresion.ts';
import { generarPreguntaTiempo, nuevaSemilla, type PreguntaTiempo } from '../../domain/tema2/generador.ts';
import { convertirDuracion, convertirTipo, necesitaConvenio, nombreUnidad, unidad, UNIDADES, type Convenio, type Regimen, type Unidad } from '../../domain/tema2/periodos.ts';
import { escenaConversion, sePuedeDibujar } from '../escenas/conversionPeriodos.ts';
import { escenaConversionTipo, sePuedeDibujarTipo } from '../escenas/conversionTipos.ts';
import { montarReproductor, type Escena } from '../motion/reproductor.ts';
import { htmlCalculadora, montarCalculadora } from './calculadora.ts';
import { expandir } from './reproductorExpandido.ts';
import { escaparHtml } from './simbolos.ts';

export type ModoConversor = 'duracion' | 'tipo';
type Pregunta = { modo: ModoConversor; valor: string; de: Unidad; a: Unidad; convenio: Convenio; regimen?: Regimen };

/** Preguntas típicas de cada modo: las que no encajan, las de días con los dos convenios y los casos del libro. */
export const ATAJOS: readonly Pregunta[] = [
  { modo: 'duracion', valor: '1', de: 'semestre', a: 'cuatrimestre', convenio: 360 },
  { modo: 'duracion', valor: '1', de: 'semestre', a: 'trimestre', convenio: 360 },
  { modo: 'duracion', valor: '1', de: 'cuatrimestre', a: 'trimestre', convenio: 360 },
  { modo: 'duracion', valor: '1', de: 'trimestre', a: 'cuatrimestre', convenio: 360 },
  { modo: 'duracion', valor: '9', de: 'mes', a: 'semestre', convenio: 360 },
  { modo: 'duracion', valor: '2,5', de: 'año', a: 'mes', convenio: 360 },
  { modo: 'duracion', valor: '1', de: 'trimestre', a: 'dia', convenio: 360 },
  { modo: 'duracion', valor: '45', de: 'dia', a: 'año', convenio: 360 },
  { modo: 'duracion', valor: '195', de: 'dia', a: 'año', convenio: 365 },
  { modo: 'duracion', valor: '195', de: 'dia', a: 'trimestre', convenio: 365 },
  { modo: 'tipo', valor: '10 %', de: 'año', a: 'mes', convenio: 360, regimen: 'compuesta' },
  { modo: 'tipo', valor: '10 %', de: 'año', a: 'mes', convenio: 360, regimen: 'simple' },
  { modo: 'tipo', valor: '1 %', de: 'mes', a: 'año', convenio: 360, regimen: 'compuesta' },
  { modo: 'tipo', valor: '2 %', de: 'trimestre', a: 'cuatrimestre', convenio: 360, regimen: 'compuesta' },
  { modo: 'tipo', valor: '2 %', de: 'trimestre', a: 'cuatrimestre', convenio: 360, regimen: 'simple' },
  { modo: 'tipo', valor: '5 %', de: 'semestre', a: 'cuatrimestre', convenio: 360, regimen: 'compuesta' },
  { modo: 'tipo', valor: '6 %', de: 'semestre', a: 'año', convenio: 360, regimen: 'compuesta' },
  { modo: 'tipo', valor: '3 %', de: 'año', a: 'dia', convenio: 365, regimen: 'simple' },
  { modo: 'tipo', valor: '4 %', de: 'año', a: 'trimestre', convenio: 360, regimen: 'compuesta' },
];

const num = (v: number, max = 4) => {
  const r = Number(v.toFixed(max));
  return formatear(r, (String(r).split('.')[1] ?? '').length);
};
const pct = (v: number) => `${num(v * 100, 4)} %`;

function textoAtajo(q: Pregunta): string {
  const dias = necesitaConvenio(q.de, q.a) ? ` (${q.convenio})` : '';
  if (q.modo === 'tipo') return `${q.valor} ${unidad(q.de).adjetivo} → ${unidad(q.a).adjetivo} · ${q.regimen}${dias}`;
  return `${q.valor} ${nombreUnidad(q.de, Number(q.valor.replace(',', '.')))} → ${unidad(q.a).plural}${dias}`;
}

/** Una medida con su unidad en singular o plural: «1 mes», «6 meses», «30 días». */
const medida = (v: number, camino: 'meses' | 'dias') => `${num(v)} ${Math.abs(v - 1) < 1e-9 ? (camino === 'meses' ? 'mes' : 'día') : camino === 'meses' ? 'meses' : 'días'}`;
const cuantas = (u: Unidad, m: number) => `${num(m)} ${nombreUnidad(u, m)}`;

/** Paso a paso de una duración: la misma regla que la animación, con los números de la pregunta. */
export function pasosDuracion(cantidad: number, de: Unidad, a: Unidad, dias: Convenio): string[] {
  const c = convertirDuracion(cantidad, de, a, dias);
  const ua = unidad(a);
  const final = `<b>${num(c.resultado)} ${nombreUnidad(a, c.resultado)}</b>`;
  if (c.camino === 'año') {
    const mDe = unidad(de).porAño(dias);
    const mA = ua.porAño(dias);
    const años = cantidad / mDe;
    return [
      'Año civil: 365 días. Los meses civiles no miden lo mismo (28, 30 o 31 días), así que se pasa por el <b>año</b>.',
      `En un año caben ${cuantas(de, mDe)} y ${cuantas(a, mA)}.`,
      ...(de === 'año' ? [] : [`Pasa la cantidad a años: ${num(cantidad)} ÷ ${mDe} = <b>${num(años)} ${años === 1 ? 'año' : 'años'}</b>.`]),
      ...(a === 'año' ? [] : [`Pasa los años a ${ua.plural}: ${num(años)} × ${mA} = ${final}.`]),
    ];
  }
  const camino = c.camino === 'meses' ? 'meses' : 'dias';
  const enComun = cantidad * c.medidaDe;
  return [
    camino === 'meses' ? 'Sin días de por medio se pasa por los <b>meses</b>: el año tiene 12 y todas las unidades miden meses enteros.' : 'Año comercial: 360 días, con meses de 30. Se pasa por los <b>días</b>.',
    `Lo que mide cada unidad: 1 ${unidad(de).singular} = ${medida(c.medidaDe, camino)}; 1 ${ua.singular} = ${medida(c.medidaA, camino)}.`,
    `Pasa la cantidad a ${camino === 'meses' ? 'meses' : 'días'}: ${num(cantidad)} × ${num(c.medidaDe)} = <b>${medida(enComun, camino)}</b>.`,
    `Cuenta cuántos ${ua.plural} caben: ${num(enComun)} ÷ ${num(c.medidaA)} = ${final}.`,
  ];
}

/** Paso a paso de un tipo: proporcional en simple; acumulado y raíz en compuesta. */
export function pasosTipo(tipo: number, de: Unidad, a: Unidad, regimen: Regimen, dias: Convenio): string[] {
  const c = convertirTipo(tipo, de, a, regimen, dias);
  const ua = unidad(a);
  const final = `<b>${pct(c.resultado)} ${ua.adjetivo}</b>`;
  const cabe = `En un año caben ${cuantas(de, c.mDe)} y ${cuantas(a, c.mA)}: es la <i>m</i> de cada tipo.`;
  if (regimen === 'simple') {
    return [
      cabe,
      'En simple cada periodo cosecha sobre el mismo capital: lo que rinde el año se <b>reparte en proporción</b>.',
      ...(c.mDe === 1 ? [] : [`Lo que rinde el año: ${pct(tipo)} × ${num(c.mDe)} = <b>${pct(tipo * c.mDe)}</b>.`]),
      c.mA === 1 ? `Ese es el tipo anual: ${final}.` : `Repártelo entre ${num(c.mA)}: ${pct(tipo * c.mDe)} ÷ ${num(c.mA)} = ${final}.`,
    ];
  }
  const pasos = [
    cabe,
    'En compuesta cada periodo crece sobre lo acumulado: el tipo <b>no se reparte</b>. Se busca el que lleva 1 € al mismo sitio en un año.',
    c.mDe === 1 ? `En un año, 1 € llega a 1 + ${num(tipo, 6)} = <b>${num(c.factorAño, 6)} €</b>.` : `Lleva el tipo al año: (1 + ${num(tipo, 6)})<sup>${num(c.mDe)}</sup> = <b>${num(c.factorAño, 6)}</b>.`,
    c.mA === 1 ? `Resta 1: ${num(c.factorAño, 6)} − 1 = ${final}.` : `Raíz de índice ${num(c.mA)}: ${num(c.factorAño, 6)}<sup>1/${num(c.mA)}</sup> = ${num(1 + c.resultado, 6)}. Resta 1: ${final}.`,
  ];
  if (Math.abs(c.proporcional - c.resultado) > 1e-12) pasos.push(`Error típico: dividir da ${pct(c.proporcional)}, que ${c.proporcional < c.resultado ? 'se queda corto' : 'se pasa'}.`);
  return pasos;
}

/** El año partido en cada unidad: la chuleta que se mira para cualquier conversión. */
function htmlAño(): string {
  const meses = ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
  const fila = (u: Unidad) => {
    const d = unidad(u);
    const m = d.porAño(360);
    return `<div class="conv-año-fila" data-conv-fila="${u}"><span class="conv-año-nombre">${u === 'año' ? 'Año' : d.plural[0]!.toUpperCase() + d.plural.slice(1)}</span>${Array.from({ length: m }, (_, k) => `<span class="conv-año-trozo" style="grid-column:span ${12 / m}">${m === 1 ? '12 meses' : m === 12 ? k + 1 : `${k + 1}<small> · ${12 / m} m</small>`}</span>`).join('')}<span class="conv-año-m"><i>m</i> = ${m}</span></div>`;
  };
  return `<section class="conv-año" aria-labelledby="conv-año-tit">
    <h3 id="conv-año-tit">El año partido</h3>
    <p class="conv-apoyo-texto">Cada fila es el mismo año cortado en trozos iguales; <i>m</i> es cuántos caben. Para pasar de una unidad a otra se mide todo en meses (o en días) y se cuenta.</p>
    <div class="conv-año-tabla" role="img" aria-label="Un año: 2 semestres de 6 meses, 3 cuatrimestres de 4, 4 trimestres de 3 y 12 meses; 360 días en el año comercial y 365 en el civil.">
      <div class="conv-año-fila conv-año-meses" aria-hidden="true"><span></span>${meses.map((l) => `<span>${l}</span>`).join('')}<span></span></div>
      ${(['año', 'semestre', 'cuatrimestre', 'trimestre', 'mes'] as const).map(fila).join('')}
      <div class="conv-año-fila" data-conv-fila="dia"><span class="conv-año-nombre">Días</span><span class="conv-año-trozo conv-año-dias" style="grid-column:span 12">360 en el año comercial (30 por mes) · 365 en el civil</span><span class="conv-año-m"><i>m</i> = 360 · 365</span></div>
    </div>
  </section>`;
}

const DADO = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="3.5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="9" cy="9" r="1.5" fill="currentColor"/><circle cx="15" cy="15" r="1.5" fill="currentColor"/><circle cx="15" cy="9" r="1.5" fill="currentColor"/><circle cx="9" cy="15" r="1.5" fill="currentColor"/></svg>';

function htmlEjercicio(): string {
  return `<section class="conv-ejercicio" data-conv-ejercicio aria-labelledby="conv-ej-tit">
    <h3 id="conv-ej-tit">Ejercicio aleatorio</h3>
    <p class="conv-apoyo-texto" data-conv-ej-origen>Te propone una conversión al azar del modo elegido (duración o tipo). Resuélvela tú; puedes escribir la operación (195/365*4).</p>
    <p class="conv-ej-enunciado" data-conv-ej-enunciado hidden></p>
    <label class="conv-campo" data-conv-ej-campo hidden><span>Tu respuesta</span><input type="text" inputmode="decimal" autocomplete="off" data-conv-ej-respuesta></label>
    <div class="conv-ej-botones">
      <button type="button" class="lab-boton conv-ej-generar" data-conv-ej-generar>${DADO}Generar ejercicio</button>
      <button type="button" class="lab-comprobar" data-conv-ej-comprobar hidden>Comprobar</button>
      <button type="button" class="lab-mini" data-conv-ej-solucion hidden>Ver cómo se hace</button>
    </div>
    <p class="conv-ej-nota" data-conv-ej-nota aria-live="polite"></p>
  </section>`;
}

const opcionesUnidad = (modo: ModoConversor, sel: Unidad) => UNIDADES.map((u) => `<option value="${u.id}"${u.id === sel ? ' selected' : ''}>${escaparHtml(modo === 'tipo' ? u.adjetivo : u.plural)}</option>`).join('');

/** Pregunta inicial de cada ficha: la de su tema (tipos en las de tipos; duraciones en el resto). */
export function preguntaInicial(idFormula: string): number {
  if (idFormula === 'simple-fraccionado') return ATAJOS.findIndex((q) => q.modo === 'tipo' && q.regimen === 'simple');
  if (idFormula === 'compuesta-equivalentes' || idFormula === 'compuesta-tae') return ATAJOS.findIndex((q) => q.modo === 'tipo' && q.regimen === 'compuesta');
  return 0;
}

/** Régimen de la ficha: en las de compuesta el tipo se convierte en compuesta, y en las de simple, en simple. */
export function regimenDeFicha(idFormula: string): Regimen | null {
  if (idFormula.startsWith('compuesta-') || idFormula.startsWith('descuento-compuesto-')) return 'compuesta';
  if (idFormula.startsWith('simple-') || idFormula.startsWith('descuento-')) return 'simple';
  return null;
}

const ENTRADA: Record<Regimen | 'ambos', string> = {
  ambos: 'Cualquier unidad del tema a cualquier otra: años, semestres, cuatrimestres, trimestres, meses y días (año comercial o civil). Una <b>duración</b> solo cambia cómo se mide el tiempo; un <b>tipo de interés</b> cambia cuánto rinde cada periodo, y ahí importa si es simple o compuesta.',
  simple: 'Una <b>duración</b> solo cambia cómo se mide el tiempo: 1 semestre son 1,5 cuatrimestres. Un <b>tipo de interés</b>, en simple, se reparte en proporción, porque cada periodo cosecha sobre el mismo capital: iₐ · mₐ = i · m.',
  compuesta: 'Una <b>duración</b> se pasa igual que en simple: el tiempo es el mismo (1 semestre son 1,5 cuatrimestres). Un <b>tipo de interés</b>, en compuesta, <b>no se reparte</b>: cada periodo crece sobre lo acumulado, así que se busca el tipo que llega al mismo sitio en el mismo tiempo: (1 + iₐ)<sup>mₐ</sup> = (1 + i)<sup>m</sup>.',
};

export function htmlConversor(k = 0, regimenFicha: Regimen | null = null): string {
  const q = ATAJOS[k] ?? ATAJOS[0]!;
  // En una ficha de un régimen, las preguntas de tipos son solo de ese régimen (la otra se puede comparar con el botón).
  const ofrecida = (a: Pregunta) => !regimenFicha || !a.regimen || a.regimen === regimenFicha;
  return `<section class="conv" data-conversor data-modo="${q.modo}"${regimenFicha ? ` data-conv-ficha="${regimenFicha}"` : ''} aria-labelledby="conv-tit">
    <header class="conv-cab">
      <p class="conv-volanta">Calendario de equivalencias${regimenFicha ? ` · ${regimenFicha}` : ''}</p>
      <h2 id="conv-tit">Pasar de una unidad de tiempo a otra</h2>
      <p class="conv-entrada">${ENTRADA[regimenFicha ?? 'ambos']}</p>
    </header>
    <div class="conv-cuerpo">
      <div class="conv-mandos">
        <div class="conv-modo" role="group" aria-label="Qué se convierte">
          <button type="button" data-conv-modo="duracion" aria-pressed="${q.modo === 'duracion'}">Duración</button>
          <button type="button" data-conv-modo="tipo" aria-pressed="${q.modo === 'tipo'}">Tipo de interés</button>
        </div>
        <div class="conv-pregunta">
          <label class="conv-campo"><span data-conv-etiqueta-valor>${q.modo === 'tipo' ? 'Tipo' : 'Cantidad'}</span><input type="text" inputmode="decimal" data-conv-valor value="${escaparHtml(q.valor)}" autocomplete="off"></label>
          <label class="conv-campo"><span>De</span><select data-conv-de data-inicial="${q.de}">${opcionesUnidad(q.modo, q.de)}</select></label>
          <label class="conv-campo"><span>A</span><select data-conv-a data-inicial="${q.a}">${opcionesUnidad(q.modo, q.a)}</select></label>
          <fieldset class="conv-convenio conv-regimen" data-conv-regimen${q.modo === 'tipo' ? '' : ' hidden'}><legend>Régimen</legend>
            <label><input type="radio" name="conv-regimen" value="simple"${q.regimen === 'simple' ? ' checked' : ''}> Simple</label>
            <label><input type="radio" name="conv-regimen" value="compuesta"${q.regimen !== 'simple' ? ' checked' : ''}> Compuesta</label>
          </fieldset>
          <fieldset class="conv-convenio" data-conv-convenio${necesitaConvenio(q.de, q.a) ? '' : ' hidden'}><legend>Días del año</legend>
            <label><input type="radio" name="conv-convenio" value="360"${q.convenio === 360 ? ' checked' : ''}> Comercial · 360</label>
            <label><input type="radio" name="conv-convenio" value="365"${q.convenio === 365 ? ' checked' : ''}> Civil · 365</label>
          </fieldset>
        </div>
        <p class="conv-resultado" data-conv-resultado aria-live="polite"></p>
        <ol class="conv-pasos" data-conv-pasos aria-label="Paso a paso"></ol>
        <p class="conv-atajos-tit">Preguntas típicas</p>
        <ul class="conv-atajos">${ATAJOS.map((a, i) => (ofrecida(a) ? `<li data-conv-atajo-modo="${a.modo}"${a.modo === q.modo ? '' : ' hidden'}><button type="button" data-conv-atajo="${i}">${escaparHtml(textoAtajo(a))}</button></li>` : '')).join('')}</ul>
      </div>
      <figure class="conv-escena" data-conv-figura>
        <div class="conv-escena-medio" data-vx-medio><div data-conv-reproductor></div></div>
        <figcaption><button type="button" class="lab-boton" data-conv-ampliar aria-haspopup="dialog"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>Ampliar animación</button></figcaption>
      </figure>
      <section class="lab-calculadora conv-calculadora" aria-label="Calculadora analógica">
        <header class="lab-panel-cab"><h2><span>∑</span>Calculadora</h2></header>
        ${htmlCalculadora({ id: 'conv-cal-entrada', enviar: 'Usar en el conversor', analogica: true })}
      </section>
    </div>
    <div class="conv-apoyo">${htmlAño()}${htmlEjercicio()}</div>
  </section>`;
}

export function montarConversor(raiz: HTMLElement): () => void {
  const conv = raiz.querySelector<HTMLElement>('[data-conversor]');
  if (!conv) return () => {};
  const valor = conv.querySelector<HTMLInputElement>('[data-conv-valor]')!;
  const etiquetaValor = conv.querySelector<HTMLElement>('[data-conv-etiqueta-valor]')!;
  const de = conv.querySelector<HTMLSelectElement>('[data-conv-de]')!;
  const a = conv.querySelector<HTMLSelectElement>('[data-conv-a]')!;
  const convenio = conv.querySelector<HTMLElement>('[data-conv-convenio]')!;
  const regimen = conv.querySelector<HTMLElement>('[data-conv-regimen]')!;
  const resultado = conv.querySelector<HTMLElement>('[data-conv-resultado]')!;
  const pasos = conv.querySelector<HTMLElement>('[data-conv-pasos]')!;
  const figura = conv.querySelector<HTMLElement>('[data-conv-figura]')!;
  const contenedor = conv.querySelector<HTMLElement>('[data-conv-reproductor]')!;
  const regimenFicha = (conv.dataset.convFicha ?? null) as Regimen | null;
  let pararReproductor: () => void = () => {};
  let escenaActual: Escena | null = null;
  let ultimaClave = '';
  // La pregunta inicial se fija aquí: no se confía en el atributo «selected» del HTML.
  for (const sel of [de, a]) if (sel.dataset.inicial) sel.value = sel.dataset.inicial;

  const modo = () => conv.dataset.modo as ModoConversor;
  const marcado = (grupo: HTMLElement) => grupo.querySelector<HTMLInputElement>('input:checked')?.value;

  const ponerModo = (m: ModoConversor) => {
    conv.dataset.modo = m;
    conv.querySelectorAll<HTMLButtonElement>('[data-conv-modo]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.convModo === m)));
    etiquetaValor.textContent = m === 'tipo' ? 'Tipo' : 'Cantidad';
    regimen.hidden = m !== 'tipo';
    for (const sel of [de, a]) {
      const v = sel.value as Unidad;
      sel.innerHTML = opcionesUnidad(m, v);
      sel.value = v;
    }
    conv.querySelectorAll<HTMLElement>('[data-conv-atajo-modo]').forEach((li) => { li.hidden = li.dataset.convAtajoModo !== m; });
  };

  const decir = (html: string, aviso = false) => {
    resultado.innerHTML = html;
    resultado.classList.toggle('conv-aviso', aviso);
    if (aviso) pasos.innerHTML = '';
  };
  const ponerPasos = (lista: string[]) => { pasos.innerHTML = lista.map((p) => `<li>${p}</li>`).join(''); };
  // En «El año partido» se marcan las dos unidades de la pregunta: la de partida y la de llegada.
  const marcarAño = (u1: Unidad, u2: Unidad) => conv.querySelectorAll<HTMLElement>('[data-conv-fila]').forEach((f) => {
    f.dataset.papel = f.dataset.convFila === u1 ? 'de' : f.dataset.convFila === u2 ? 'a' : '';
  });

  const actualizar = (forzar = false) => {
    const u1 = de.value as Unidad;
    const u2 = a.value as Unidad;
    const dias = (marcado(convenio) === '365' ? 365 : 360) as Convenio;
    convenio.hidden = !necesitaConvenio(u1, u2);
    marcarAño(u1, u2);
    const r = calcular(valor.value);
    if (!r.ok) return decir(escaparHtml(r.error), true);
    if (!(r.valor > 0)) return decir(modo() === 'tipo' ? 'Escribe un tipo mayor que 0.' : 'Escribe una cantidad mayor que 0.', true);
    let escena: Escena | null = null;
    let nota = '';
    if (modo() === 'tipo') {
      // Un tipo sin % y mayor que 1 no se corrige: se avisa (¿7 % o 0,07?).
      if (r.valor > 1 && !valor.value.includes('%')) return decir(`¿${escaparHtml(num(r.valor))} %? Escríbelo con el signo % o en tanto por uno.`, true);
      const reg = (marcado(regimen) === 'simple' ? 'simple' : 'compuesta') as Regimen;
      const c = convertirTipo(r.valor, u1, u2, reg, dias);
      decir(`<b>${escaparHtml(pct(r.valor))} ${escaparHtml(unidad(u1).adjetivo)}</b> = <b>${escaparHtml(pct(c.resultado))} ${escaparHtml(unidad(u2).adjetivo)}</b><small>${reg === 'simple' ? 'En simple: proporcional.' : 'En compuesta: tanto equivalente.'} Los dos llevan 1 € a ${escaparHtml(num(c.factorAño))} € en un año.</small>`);
      ponerPasos(pasosTipo(r.valor, u1, u2, reg, dias));
      const peticion = { tipo: r.valor, de: u1, a: u2, regimen: reg, convenio: dias };
      if (sePuedeDibujarTipo(peticion)) escena = escenaConversionTipo(peticion);
      else nota = '<small>Con un crecimiento tan grande la animación no se lee bien; la regla es la misma.</small>';
    } else {
      const c = convertirDuracion(r.valor, u1, u2, dias);
      decir(`<b>${escaparHtml(num(r.valor))} ${escaparHtml(nombreUnidad(u1, r.valor))}</b> = <b>${escaparHtml(num(c.resultado))} ${escaparHtml(nombreUnidad(u2, c.resultado))}</b>`);
      ponerPasos(pasosDuracion(r.valor, u1, u2, dias));
      const peticion = { cantidad: r.valor, de: u1, a: u2, convenio: dias };
      if (sePuedeDibujar(peticion)) escena = escenaConversion(peticion);
      else nota = '<small>La animación dibuja hasta 20 años de calendario; para más, se aplica la misma regla.</small>';
    }
    if (!escena) { resultado.innerHTML += nota; return; }
    if (escena.id === ultimaClave && !forzar) return;
    ultimaClave = escena.id;
    pararReproductor();
    escenaActual = escena;
    pararReproductor = montarReproductor(contenedor, escena);
  };

  function aplicarAtajo(k: number): void {
    const q = ATAJOS[k];
    if (!q) return;
    if (q.modo !== modo()) ponerModo(q.modo);
    valor.value = q.valor;
    de.value = q.de;
    a.value = q.a;
    convenio.querySelectorAll<HTMLInputElement>('input').forEach((r) => { r.checked = Number(r.value) === q.convenio; });
    if (q.regimen) regimen.querySelectorAll<HTMLInputElement>('input').forEach((r) => { r.checked = r.value === q.regimen; });
    actualizar();
  }
  const alCambiar = (e: Event) => {
    if ((e.target as Element).closest('[data-calculadora], [data-conv-ejercicio]')) return;
    actualizar();
  };
  const alPulsar = (e: Event) => {
    const b = (e.target as Element).closest<HTMLButtonElement>('button');
    if (!b || b.closest('[data-calculadora]')) return;
    if (b.dataset.convModo) aplicarAtajo(ATAJOS.findIndex((q) => q.modo === b.dataset.convModo && (!regimenFicha || !q.regimen || q.regimen === regimenFicha)));
    else if (b.dataset.convAtajo !== undefined) aplicarAtajo(Number(b.dataset.convAtajo));
    else if (b.hasAttribute('data-conv-ampliar') && escenaActual) expandir(figura, { tipo: 'escena', escena: escenaActual, volanta: 'Calendario de equivalencias' });
    else if (b.hasAttribute('data-conv-ej-generar')) generar();
    else if (b.hasAttribute('data-conv-ej-comprobar')) comprobarRespuesta();
    else if (b.hasAttribute('data-conv-ej-solucion')) verSolucion();
  };

  /* Ejercicio aleatorio: una pregunta al azar del modo elegido (y, en tipos, del régimen de la ficha). */
  const ej = conv.querySelector<HTMLElement>('[data-conv-ejercicio]')!;
  const ejOrigen = ej.querySelector<HTMLElement>('[data-conv-ej-origen]')!;
  const ejEnunciado = ej.querySelector<HTMLElement>('[data-conv-ej-enunciado]')!;
  const ejCampo = ej.querySelector<HTMLElement>('[data-conv-ej-campo]')!;
  const ejRespuesta = ej.querySelector<HTMLInputElement>('[data-conv-ej-respuesta]')!;
  const ejComprobar = ej.querySelector<HTMLButtonElement>('[data-conv-ej-comprobar]')!;
  const ejSolucion = ej.querySelector<HTMLButtonElement>('[data-conv-ej-solucion]')!;
  const ejNota = ej.querySelector<HTMLElement>('[data-conv-ej-nota]')!;
  const mandos = conv.querySelector<HTMLElement>('.conv-mandos');
  let pregunta: PreguntaTiempo | null = null;
  let semilla = Math.floor(Math.random() * 99991) + 1;

  function generar(): void {
    semilla = nuevaSemilla(semilla);
    pregunta = generarPreguntaTiempo(semilla, modo(), regimenFicha ?? undefined);
    const q = pregunta;
    const dias = necesitaConvenio(q.de, q.a) ? ` Año ${q.convenio === 360 ? 'comercial (360 días)' : 'civil (365 días)'}.` : '';
    ej.dataset.semilla = String(semilla);
    ejOrigen.textContent = `Ejercicio aleatorio nº ${semilla} · generado, no es del libro`;
    ejEnunciado.textContent = q.modo === 'duracion'
      ? `¿Cuántos ${unidad(q.a).plural} son ${num(q.valor)} ${nombreUnidad(q.de, q.valor)}?${dias}`
      : `Un tipo del ${pct(q.valor)} ${unidad(q.de).adjetivo} en ${q.regimen}: ¿qué tipo ${unidad(q.a).adjetivo} es equivalente?${dias}`;
    ejEnunciado.hidden = false;
    ejCampo.hidden = false;
    ejComprobar.hidden = false;
    ejSolucion.hidden = false;
    ejRespuesta.value = '';
    ejNota.textContent = '';
    ejNota.className = 'conv-ej-nota';
    ej.querySelector<HTMLElement>('[data-conv-ej-generar]')!.lastChild!.textContent = 'Otro ejercicio';
  }

  function comprobarRespuesta(): void {
    if (!pregunta) return;
    const q = pregunta;
    const nota = (texto: string, estado: 'bien' | 'casi' | 'mal') => { ejNota.textContent = texto; ejNota.className = `conv-ej-nota conv-ej-${estado}`; };
    const r = calcular(ejRespuesta.value);
    if (!ejRespuesta.value.trim()) return nota('Escribe tu respuesta (o la operación).', 'mal');
    if (!r.ok) return nota(r.error, 'mal');
    if (q.modo === 'tipo' && r.valor > 1 && !ejRespuesta.value.includes('%')) return nota(`¿${num(r.valor)} %? Escríbelo con % o en tanto por uno.`, 'mal');
    const real = q.resultado;
    const tolerancia = q.modo === 'tipo' ? Math.max(1e-7, Math.abs(real) * 0.001) : Math.max(0.005, Math.abs(real) * 0.001);
    const fin = q.modo === 'tipo' ? `${pct(real)} ${unidad(q.a).adjetivo}` : `${num(real)} ${nombreUnidad(q.a, real)}`;
    if (Math.abs(r.valor - real) <= tolerancia) return nota(`Bien: ${fin}.`, 'bien');
    // El error típico va antes que el «casi»: con tipos pequeños, repartir se queda muy cerca y no es un redondeo.
    if (q.modo === 'tipo' && q.regimen === 'compuesta' && Math.abs(r.valor - q.proporcional) <= Math.max(1e-7, Math.abs(q.proporcional) * 0.001)) {
      return nota('Eso es repartir en proporción, lo de simple. En compuesta se lleva el tipo al año y se saca la raíz.', 'mal');
    }
    if (Math.abs(r.valor - real) <= Math.abs(real) * 0.01) return nota('Casi: revisa el redondeo (deja al menos 4 decimales).', 'casi');
    nota(q.modo === 'tipo'
      ? (q.regimen === 'simple' ? 'No es eso. Pista: en simple, lo que rinde el año se reparte entre los periodos de llegada.' : 'No es eso. Pista: lleva el tipo al año, (1 + i) elevado a su m, y luego saca la raíz de la m de llegada.')
      : 'No es eso. Pista: pasa la cantidad a meses (o a días, o a años si el año es civil) y cuenta cuántas caben.', 'mal');
  }

  function verSolucion(): void {
    if (!pregunta) return;
    const q = pregunta;
    if (q.modo !== modo()) ponerModo(q.modo);
    valor.value = q.modo === 'tipo' ? pct(q.valor) : num(q.valor);
    de.value = q.de;
    a.value = q.a;
    convenio.querySelectorAll<HTMLInputElement>('input').forEach((r) => { r.checked = Number(r.value) === q.convenio; });
    regimen.querySelectorAll<HTMLInputElement>('input').forEach((r) => { r.checked = r.value === q.regimen; });
    actualizar();
    mandos?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  }

  conv.addEventListener('input', alCambiar);
  conv.addEventListener('change', alCambiar);
  conv.addEventListener('click', alPulsar);
  // La calculadora analógica: «Usar en el conversor» lleva su resultado al campo de la cantidad o del tipo.
  const pararCalculadora = montarCalculadora(conv.querySelector<HTMLElement>('.conv-calculadora')!, {
    alEnviar: (_expresion, res) => {
      valor.value = res;
      actualizar();
    },
  });
  actualizar(true);
  return () => {
    pararReproductor();
    pararCalculadora();
    conv.removeEventListener('input', alCambiar);
    conv.removeEventListener('change', alCambiar);
    conv.removeEventListener('click', alPulsar);
  };
}
