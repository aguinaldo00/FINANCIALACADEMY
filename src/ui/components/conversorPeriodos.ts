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

const opcionesUnidad = (modo: ModoConversor, sel: Unidad) => UNIDADES.map((u) => `<option value="${u.id}"${u.id === sel ? ' selected' : ''}>${escaparHtml(modo === 'tipo' ? u.adjetivo : u.plural)}</option>`).join('');

/** Pregunta inicial de cada ficha: la de su tema (tipos en las de tipos; duraciones en el resto). */
export function preguntaInicial(idFormula: string): number {
  if (idFormula === 'simple-fraccionado') return ATAJOS.findIndex((q) => q.modo === 'tipo' && q.regimen === 'simple');
  if (idFormula === 'compuesta-equivalentes' || idFormula === 'compuesta-tae') return ATAJOS.findIndex((q) => q.modo === 'tipo' && q.regimen === 'compuesta');
  return 0;
}

export function htmlConversor(k = 0): string {
  const q = ATAJOS[k] ?? ATAJOS[0]!;
  return `<section class="conv" data-conversor data-modo="${q.modo}" aria-labelledby="conv-tit">
    <header class="conv-cab">
      <p class="conv-volanta">Calendario de equivalencias</p>
      <h2 id="conv-tit">Pasar de una unidad de tiempo a otra</h2>
      <p class="conv-entrada">Cualquier unidad del tema a cualquier otra: años, semestres, cuatrimestres, trimestres, meses y días (año comercial o civil). Una <b>duración</b> solo cambia cómo se mide el tiempo; un <b>tipo de interés</b> cambia cuánto rinde cada periodo, y ahí importa si es simple o compuesta.</p>
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
        <p class="conv-atajos-tit">Preguntas típicas</p>
        <ul class="conv-atajos">${ATAJOS.map((a, i) => `<li data-conv-atajo-modo="${a.modo}"${a.modo === q.modo ? '' : ' hidden'}><button type="button" data-conv-atajo="${i}">${escaparHtml(textoAtajo(a))}</button></li>`).join('')}</ul>
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
  const figura = conv.querySelector<HTMLElement>('[data-conv-figura]')!;
  const contenedor = conv.querySelector<HTMLElement>('[data-conv-reproductor]')!;
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
  };

  const actualizar = (forzar = false) => {
    const u1 = de.value as Unidad;
    const u2 = a.value as Unidad;
    const dias = (marcado(convenio) === '365' ? 365 : 360) as Convenio;
    convenio.hidden = !necesitaConvenio(u1, u2);
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
      const peticion = { tipo: r.valor, de: u1, a: u2, regimen: reg, convenio: dias };
      if (sePuedeDibujarTipo(peticion)) escena = escenaConversionTipo(peticion);
      else nota = '<small>Con un crecimiento tan grande la animación no se lee bien; la regla es la misma.</small>';
    } else {
      const c = convertirDuracion(r.valor, u1, u2, dias);
      decir(`<b>${escaparHtml(num(r.valor))} ${escaparHtml(nombreUnidad(u1, r.valor))}</b> = <b>${escaparHtml(num(c.resultado))} ${escaparHtml(nombreUnidad(u2, c.resultado))}</b>`);
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
    if ((e.target as Element).closest('[data-calculadora]')) return;
    actualizar();
  };
  const alPulsar = (e: Event) => {
    const b = (e.target as Element).closest<HTMLButtonElement>('button');
    if (!b || b.closest('[data-calculadora]')) return;
    if (b.dataset.convModo) aplicarAtajo(ATAJOS.findIndex((q) => q.modo === b.dataset.convModo));
    else if (b.dataset.convAtajo !== undefined) aplicarAtajo(Number(b.dataset.convAtajo));
    else if (b.hasAttribute('data-conv-ampliar') && escenaActual) expandir(figura, { tipo: 'escena', escena: escenaActual, volanta: 'Calendario de equivalencias' });
  };

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
