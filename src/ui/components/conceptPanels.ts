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

function arbol(n: NodoEsquema, nivel: number): string {
  if (!n.hijos?.length) return `<li class="esq-hoja">${n.texto}</li>`;
  return `<li><details open><summary><span>${n.texto}</span><small class="esq-n">${n.hijos.length}</small></summary><ul>${n.hijos.map((h) => arbol(h, nivel + 1)).join('')}</ul></details></li>`;
}

/** Pieza de un diagrama de flujo: una caja o un conector (con su etiqueta y sentido). */
type PiezaFlujo = { tipo: 'nodo'; texto: string } | { tipo: 'con'; etiqueta: string; sentido: 'der' | 'izq' | 'doble' | 'contiene' | 'contenido' };

/**
 * Lee el esquema de texto de DATA ("A ──x──▶ B", "A → B", "A ⇄ B", varias filas separadas por
 * "   ·   " o " | ") como filas de un diagrama de flujo. Solo cambia la presentación: los textos son los
 * de DATA tal cual. Si una fila no tiene conectores, es una lista ("A · B · C").
 */
export function leerEsquema(texto: string): PiezaFlujo[][] {
  const conector = /──(.+?)──▶|◀──(.+?)──|→|⇄|▶/g;
  return texto
    .split(/\s{2,}·\s{2,}|\s\|\s/)
    .map((fila) => {
      const piezas: PiezaFlujo[] = [];
      let ultimo = 0;
      for (const m of fila.matchAll(conector)) {
        const antes = fila.slice(ultimo, m.index).trim();
        if (antes) piezas.push({ tipo: 'nodo', texto: antes });
        if (m[1] !== undefined) piezas.push({ tipo: 'con', etiqueta: m[1].trim(), sentido: 'der' });
        else if (m[2] !== undefined) piezas.push({ tipo: 'con', etiqueta: m[2].trim(), sentido: 'izq' });
        else piezas.push({ tipo: 'con', etiqueta: '', sentido: m[0] === '⇄' ? 'doble' : 'der' });
        ultimo = (m.index ?? 0) + m[0].length;
      }
      const resto = fila.slice(ultimo).trim();
      if (resto) piezas.push({ tipo: 'nodo', texto: resto });
      // Sin conectores: es una lista de elementos.
      if (!piezas.some((p) => p.tipo === 'con')) return resto.split(/\s·\s/).map((t): PiezaFlujo => ({ tipo: 'nodo', texto: t.trim() }));
      return piezas;
    })
    .filter((f) => f.length);
}

const FLECHA: Record<Extract<PiezaFlujo, { tipo: 'con' }>['sentido'], string> = { der: '→', izq: '←', doble: '⇄', contiene: '⊃', contenido: '⊂' };

function diagramaFlujo(filas: PiezaFlujo[][]): string {
  return `<div class="flujo">${filas
    .map((fila) => {
      const lista = !fila.some((p) => p.tipo === 'con');
      const html = fila.map((p) =>
        p.tipo === 'nodo'
          ? `<span class="f-nodo">${p.texto}</span>`
          : `<span class="f-con ${p.sentido}" aria-label="${p.etiqueta || FLECHA[p.sentido]}">${p.etiqueta ? `<small>${p.etiqueta}</small>` : ''}<i aria-hidden="true">${FLECHA[p.sentido]}</i></span>`,
      );
      // Cada conector va pegado a la caja que le sigue: al partir la fila no queda una flecha suelta.
      const grupos: string[] = [];
      for (let k = 0; k < html.length; k++) {
        if (fila[k]!.tipo === 'con' && k + 1 < html.length) {
          grupos.push(`<span class="f-par">${html[k]}${html[k + 1]}</span>`);
          k++;
        } else grupos.push(html[k]!);
      }
      return `<div class="flujo-fila${lista ? ' lista' : ''}">${grupos.join('')}</div>`;
    })
    .join('')}</div>`;
}

/**
 * Panel "Esquema": diagrama de flujo (de la historia del concepto o del esquema de texto de DATA)
 * y, si los apuntes tienen un esquema de este concepto, un árbol desplegable.
 */
export function pintarEsquema(panel: HTMLElement, concepto: Concepto, tema: Tema): void {
  const indice = tema.modos.findIndex((m) => m.formato === 'esquema');
  const texto = concepto.explicaciones[indice] ?? '';
  const h = historiaDeConcepto(tema, concepto.id);
  let filas: PiezaFlujo[][];
  if (h) {
    const fila: PiezaFlujo[] = [];
    h.entidades.forEach((e, i) => {
      fila.push({ tipo: 'nodo', texto: e.etiqueta });
      const f = h.flujos[i];
      if (f && i < h.entidades.length - 1) {
        const sentido = f.tipo === 'contiene' ? (f.desde === e.id ? 'contiene' : 'contenido') : f.tipo === 'intercambio' ? 'doble' : f.desde === e.id ? 'der' : 'izq';
        fila.push({ tipo: 'con', etiqueta: f.etiqueta ?? '', sentido });
      }
    });
    filas = [fila];
  } else {
    filas = leerEsquema(texto.replace(/⚠.*$/, '').trim());
  }
  const aviso = texto.includes('⚠') ? `<p class="flujo-aviso">${resaltarAviso(texto.slice(texto.indexOf('⚠')))}</p>` : '';
  const propios = tema.ampliacion?.esquemas.filter((e) => e.conceptoId === concepto.id) ?? [];
  const desplegables = propios
    .map((e) => `<div class="esq-arbol"><div class="esq-arbol-h"><h5>${e.titulo} <small>· de tus apuntes</small></h5><span class="esq-ctrl"><button type="button" data-arbol="abrir">Desplegar todo</button><button type="button" data-arbol="cerrar">Plegar todo</button></span></div><ul class="esq-raiz">${arbol(e.raiz, 0)}</ul></div>`)
    .join('');
  panel.innerHTML = `<div class="md"><b>🗺️ Esquema visual</b></div>${diagramaFlujo(filas)}${aviso}${desplegables}`;
  for (const boton of panel.querySelectorAll<HTMLButtonElement>('[data-arbol]')) {
    boton.onclick = () => {
      const abrir = boton.dataset.arbol === 'abrir';
      boton.closest('.esq-arbol')?.querySelectorAll('details').forEach((d) => (d.open = abrir));
    };
  }
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
