import type { Concepto, ModoExplicacion, NodoEsquema, Pregunta, Tema } from '../../content/schema.ts';
import { historiaDeConcepto } from '../../experiences/registry.ts';
import { resaltarAviso } from '../format.ts';

/** Panel "Explícamelo de otra forma" en el modo indicado. */
export function pintarOtraForma(panel: HTMLElement, concepto: Concepto, modos: ModoExplicacion[], indice: number): void {
  const modo = modos[indice];
  const texto = resaltarAviso(concepto.explicaciones[indice] ?? '');
  const puntos = modos.map((_, k) => `<i class="${k === indice ? 'on' : ''}"></i>`).join('');
  const cuerpo = modo?.formato === 'esquema' ? `<div class="esq">${texto}</div>` : `<p>${texto}</p>`;
  panel.innerHTML = `<div class="md"><b>${modo?.etiqueta ?? ''}</b><span class="dots">${puntos}</span></div>${cuerpo}`;
  // Reinicia la animación de entrada en cada cambio de modo.
  panel.style.animation = 'none';
  void panel.offsetWidth;
  panel.style.animation = '';
}

/** Panel "Compruébalo": pinta la pregunta y delega cada elección en `alResponder`. */
export function pintarPregunta(
  panel: HTMLElement,
  concepto: Concepto,
  alResponder: (indice: number) => boolean,
): void {
  pintarPreguntaEn(panel, concepto.pregunta, alResponder);
}

/** Pregunta tipo test (la oficial del concepto o una de práctica) dentro de un panel. */
export function pintarPreguntaEn(
  panel: HTMLElement,
  pregunta: Pregunta,
  alResponder: (indice: number) => boolean,
  pie = '',
): void {
  const { enunciado, opciones, explicacion } = pregunta;
  panel.innerHTML = `<p><b>${enunciado}</b></p><div class="opts">${opciones.map((t, i) => `<button class="opt" data-k="${i}">${t}</button>`).join('')}</div><div class="fb"></div>${pie}`;
  const feedback = panel.querySelector<HTMLElement>('.fb')!;
  const botones = [...panel.querySelectorAll<HTMLButtonElement>('.opt')];

  for (const boton of botones) {
    boton.onclick = () => {
      if (alResponder(Number(boton.dataset.k))) {
        boton.classList.add('ok');
        for (const b of botones) b.disabled = true;
        feedback.innerHTML = `✅ <b>Correcto.</b> ${explicacion}`;
      } else {
        boton.classList.add('no', 'shake');
        feedback.innerHTML = '❌ No es esa. Pulsa "Explícamelo de otra forma" y vuelve a intentarlo.';
      }
    };
  }
}

/* ------------------------------------------------------------ ampliación */

function arbol(n: NodoEsquema, abierto: boolean): string {
  if (!n.hijos?.length) return `<li>${n.texto}</li>`;
  return `<li><details${abierto ? ' open' : ''}><summary>${n.texto}</summary><ul>${n.hijos.map((h) => arbol(h, true)).join('')}</ul></details></li>`;
}

/**
 * Panel "Esquema": el esquema visual de DATA (como cadena de elementos si se puede leer como
 * flujo) y, si los apuntes tienen un esquema de este concepto, un árbol desplegable.
 */
export function pintarEsquema(panel: HTMLElement, concepto: Concepto, tema: Tema): void {
  const indice = tema.modos.findIndex((m) => m.formato === 'esquema');
  const texto = resaltarAviso(concepto.explicaciones[indice] ?? '');
  const h = historiaDeConcepto(tema, concepto.id);
  const cadena = h
    ? `<ol class="esq-cadena">${h.entidades
        .map((e, i) => {
          const f = h.flujos[i];
          const flecha = !f ? '' : f.tipo === 'contiene' ? (f.desde === e.id ? '⊃' : '⊂') : f.tipo === 'intercambio' ? '⇄' : f.desde === e.id ? '→' : '←';
          return `<li class="esq-nodo">${e.etiqueta}</li>${f ? `<li class="esq-flecha" aria-hidden="true">${f.etiqueta ? `<small>${f.etiqueta}</small>` : ''}${flecha}</li>` : ''}`;
        })
        .join('')}</ol>`
    : `<div class="esq">${texto}</div>`;
  const propios = tema.ampliacion?.esquemas.filter((e) => e.conceptoId === concepto.id) ?? [];
  const desplegables = propios
    .map((e) => `<div class="esq-arbol"><h5>${e.titulo} <small>· de tus apuntes</small></h5><ul>${arbol(e.raiz, true)}</ul></div>`)
    .join('');
  panel.innerHTML = `<div class="md"><b>🗺️ Esquema visual</b></div>${cadena}${desplegables}`;
}

export interface Tarjeta {
  anverso: string;
  reverso: string;
  fuente: string;
}

/** Tarjetas del concepto: la de DATA (nombre → frase de examen) y las de los apuntes. */
export function tarjetasDe(concepto: Concepto, tema: Tema): Tarjeta[] {
  const frase = tema.modos.findIndex((m) => m.etiqueta.includes('Frase de examen'));
  const propias = (tema.ampliacion?.flashcards ?? []).filter((f) => f.conceptoId === concepto.id);
  return [
    { anverso: concepto.nombre, reverso: concepto.explicaciones[frase >= 0 ? frase : concepto.explicaciones.length - 1] ?? '', fuente: 'Frase de examen' },
    ...propias.map((f) => ({ anverso: f.anverso, reverso: f.reverso, fuente: 'De tus apuntes' })),
  ];
}

/** Panel "Flashcards": una tarjeta cada vez; se gira al pulsarla. */
export function pintarFlashcard(panel: HTMLElement, tarjetas: Tarjeta[], indice: number, girada: boolean): void {
  const t = tarjetas[indice];
  if (!t) return;
  panel.innerHTML = `<div class="md"><b>🃏 Flashcards</b><span class="fc-n">${indice + 1} / ${tarjetas.length}</span></div>
 <button type="button" class="fc${girada ? ' girada' : ''}" data-fc="girar" aria-pressed="${girada}">
  <span class="fc-cara fc-anverso"><small>${t.fuente}</small>${t.anverso}<em>Pulsa para ver la respuesta</em></span>
  <span class="fc-cara fc-reverso">${resaltarAviso(t.reverso)}</span>
 </button>
 <div class="fc-ctrl"><button type="button" class="fc-btn" data-fc="anterior"${indice === 0 ? ' disabled' : ''}>← Anterior</button><button type="button" class="fc-btn" data-fc="siguiente"${indice >= tarjetas.length - 1 ? ' disabled' : ''}>Siguiente →</button></div>`;
}
