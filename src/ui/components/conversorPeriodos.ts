/*
 * Conversor de unidades de tiempo: el alumno elige cuánto, de qué unidad y a cuál, y la animación del
 * calendario se genera para esa pareja (src/ui/escenas/conversionPeriodos.ts). Cubre cualquier
 * unidad del temario hacia cualquier otra; el convenio de días solo se pregunta si interviene el día.
 * Los atajos son las preguntas típicas del tema («1 semestre, ¿cuántos cuatrimestres?»).
 */
import { calcular, formatear } from '../../domain/tema2/expresion.ts';
import { convertirDuracion, necesitaConvenio, nombreUnidad, UNIDADES, type Convenio, type Unidad } from '../../domain/tema2/periodos.ts';
import { escenaConversion, sePuedeDibujar } from '../escenas/conversionPeriodos.ts';
import { montarReproductor } from '../motion/reproductor.ts';
import { expandir } from './reproductorExpandido.ts';
import { escaparHtml } from './simbolos.ts';

type Pregunta = { cantidad: string; de: Unidad; a: Unidad; convenio: Convenio };

/** Preguntas típicas: las que no encajan (semestre ↔ cuatrimestre) y las de días con los dos convenios. */
export const ATAJOS: readonly Pregunta[] = [
  { cantidad: '1', de: 'semestre', a: 'cuatrimestre', convenio: 360 },
  { cantidad: '1', de: 'semestre', a: 'trimestre', convenio: 360 },
  { cantidad: '1', de: 'cuatrimestre', a: 'trimestre', convenio: 360 },
  { cantidad: '1', de: 'trimestre', a: 'cuatrimestre', convenio: 360 },
  { cantidad: '9', de: 'mes', a: 'semestre', convenio: 360 },
  { cantidad: '2,5', de: 'año', a: 'mes', convenio: 360 },
  { cantidad: '1', de: 'trimestre', a: 'dia', convenio: 360 },
  { cantidad: '45', de: 'dia', a: 'año', convenio: 360 },
  { cantidad: '195', de: 'dia', a: 'año', convenio: 365 },
  { cantidad: '195', de: 'dia', a: 'trimestre', convenio: 365 },
];

const num = (v: number) => {
  const r = Number(v.toFixed(4));
  return formatear(r, (String(r).split('.')[1] ?? '').length);
};
const textoAtajo = (q: Pregunta) => `${q.cantidad} ${nombreUnidad(q.de, Number(q.cantidad.replace(',', '.')))} → ${UNIDADES.find((u) => u.id === q.a)!.plural}${necesitaConvenio(q.de, q.a) ? ` (${q.convenio})` : ''}`;

const opciones = (sel: Unidad) => UNIDADES.map((u) => `<option value="${u.id}"${u.id === sel ? ' selected' : ''}>${escaparHtml(u.plural)}</option>`).join('');

export function htmlConversor(inicial: Pregunta = ATAJOS[0]!): string {
  return `<section class="conv" data-conversor aria-labelledby="conv-tit">
    <header class="conv-cab">
      <p class="conv-volanta">Calendario de equivalencias</p>
      <h2 id="conv-tit">Pasar de una unidad de tiempo a otra</h2>
      <p class="conv-entrada">Cualquier unidad del tema a cualquier otra: años, semestres, cuatrimestres, trimestres, meses y días (año comercial o civil). Solo cambia cómo se mide el tiempo; el dinero no se mueve.</p>
    </header>
    <div class="conv-cuerpo">
      <div class="conv-mandos">
        <div class="conv-pregunta">
          <label class="conv-campo"><span>Cantidad</span><input type="text" inputmode="decimal" data-conv-cantidad value="${escaparHtml(inicial.cantidad)}" autocomplete="off"></label>
          <label class="conv-campo"><span>De</span><select data-conv-de data-inicial="${inicial.de}">${opciones(inicial.de)}</select></label>
          <label class="conv-campo"><span>A</span><select data-conv-a data-inicial="${inicial.a}">${opciones(inicial.a)}</select></label>
          <fieldset class="conv-convenio" data-conv-convenio${necesitaConvenio(inicial.de, inicial.a) ? '' : ' hidden'}><legend>Días del año</legend>
            <label><input type="radio" name="conv-convenio" value="360"${inicial.convenio === 360 ? ' checked' : ''}> Comercial · 360</label>
            <label><input type="radio" name="conv-convenio" value="365"${inicial.convenio === 365 ? ' checked' : ''}> Civil · 365</label>
          </fieldset>
        </div>
        <p class="conv-resultado" data-conv-resultado aria-live="polite"></p>
        <p class="conv-atajos-tit">Preguntas típicas</p>
        <ul class="conv-atajos">${ATAJOS.map((q, k) => `<li><button type="button" data-conv-atajo="${k}">${escaparHtml(textoAtajo(q))}</button></li>`).join('')}</ul>
      </div>
      <figure class="conv-escena" data-conv-figura>
        <div class="conv-escena-medio" data-vx-medio><div data-conv-reproductor></div></div>
        <figcaption><button type="button" class="lab-boton" data-conv-ampliar aria-haspopup="dialog"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>Ampliar animación</button></figcaption>
      </figure>
    </div>
  </section>`;
}

export function montarConversor(raiz: HTMLElement): () => void {
  const conv = raiz.querySelector<HTMLElement>('[data-conversor]');
  if (!conv) return () => {};
  const cantidad = conv.querySelector<HTMLInputElement>('[data-conv-cantidad]')!;
  const de = conv.querySelector<HTMLSelectElement>('[data-conv-de]')!;
  const a = conv.querySelector<HTMLSelectElement>('[data-conv-a]')!;
  const convenio = conv.querySelector<HTMLElement>('[data-conv-convenio]')!;
  const resultado = conv.querySelector<HTMLElement>('[data-conv-resultado]')!;
  const figura = conv.querySelector<HTMLElement>('[data-conv-figura]')!;
  const contenedor = conv.querySelector<HTMLElement>('[data-conv-reproductor]')!;
  // La pregunta inicial se fija aquí: no se confía en el atributo «selected» del HTML.
  for (const sel of [de, a]) if (sel.dataset.inicial) sel.value = sel.dataset.inicial;
  let pararReproductor: () => void = () => {};
  let escenaActual: ReturnType<typeof escenaConversion> | null = null;
  let ultimaClave = '';

  const leer = () => {
    const r = calcular(cantidad.value);
    const conv365 = convenio.querySelector<HTMLInputElement>('input:checked')?.value === '365';
    return { valor: r.ok ? r.valor : NaN, error: r.ok ? '' : r.error, de: de.value as Unidad, a: a.value as Unidad, convenio: (conv365 ? 365 : 360) as Convenio };
  };

  const actualizar = (forzar = false) => {
    const q = leer();
    convenio.hidden = !necesitaConvenio(q.de, q.a);
    if (q.error || !(q.valor > 0)) {
      resultado.textContent = q.error || 'Escribe una cantidad mayor que 0.';
      resultado.classList.add('conv-aviso');
      return;
    }
    resultado.classList.remove('conv-aviso');
    const c = convertirDuracion(q.valor, q.de, q.a, q.convenio);
    resultado.innerHTML = `<b>${escaparHtml(num(q.valor))} ${escaparHtml(nombreUnidad(q.de, q.valor))}</b> = <b>${escaparHtml(num(c.resultado))} ${escaparHtml(nombreUnidad(q.a, c.resultado))}</b>`;
    const peticion = { cantidad: q.valor, de: q.de, a: q.a, convenio: q.convenio };
    if (!sePuedeDibujar(peticion)) {
      resultado.innerHTML += '<small>La animación dibuja hasta 20 años de calendario; para más, se aplica la misma regla.</small>';
      return;
    }
    const clave = JSON.stringify(peticion);
    if (clave === ultimaClave && !forzar) return;
    ultimaClave = clave;
    pararReproductor();
    escenaActual = escenaConversion(peticion);
    pararReproductor = montarReproductor(contenedor, escenaActual);
  };

  const alCambiar = () => actualizar();
  const alPulsar = (e: Event) => {
    const b = (e.target as Element).closest<HTMLButtonElement>('button');
    if (!b) return;
    if (b.dataset.convAtajo !== undefined) {
      const q = ATAJOS[Number(b.dataset.convAtajo)]!;
      cantidad.value = q.cantidad;
      de.value = q.de;
      a.value = q.a;
      convenio.querySelectorAll<HTMLInputElement>('input').forEach((r) => { r.checked = Number(r.value) === q.convenio; });
      actualizar();
    } else if (b.hasAttribute('data-conv-ampliar') && escenaActual) {
      expandir(figura, { tipo: 'escena', escena: escenaActual, volanta: 'Calendario de equivalencias' });
    }
  };
  conv.addEventListener('input', alCambiar);
  conv.addEventListener('change', alCambiar);
  conv.addEventListener('click', alPulsar);
  actualizar(true);
  return () => {
    pararReproductor();
    conv.removeEventListener('input', alCambiar);
    conv.removeEventListener('change', alCambiar);
    conv.removeEventListener('click', alPulsar);
  };
}
