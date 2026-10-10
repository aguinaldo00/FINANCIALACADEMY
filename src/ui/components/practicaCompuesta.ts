import {
  EJERCICIOS_PAPEL,
  EJERCICIOS_RECONOCER,
  ERRORES_TIPICOS,
  FORMULAS,
  type NivelAyuda,
} from '../../content/temas/tema-02/practica.ts';
import { colorearSimbolos, escaparHtml } from './simbolos.ts';

const NIVEL: Record<NivelAyuda, string> = {
  completar: 'Con ayuda: completa el cálculo',
  guiado: 'Ayuda mínima: solo una pista',
  solo: 'Sin ayuda, como en el examen',
};

/** Errores típicos: primero se ve el error y se piensa qué falla; la corrección se descubre después. */
export function seccionErrores(): string {
  return `<div class="mat-errores">${ERRORES_TIPICOS.map((e, i) => `
    <article class="mat-error" data-mat-error="${i}">
      <h3>${escaparHtml(e.titulo)}</h3>
      <p class="mat-error-mal"><span>Así no</span>${colorearSimbolos(e.mal)}</p>
      <button type="button" class="ab" data-mat-revelar-error="${i}" aria-expanded="false">¿Qué falla? Ver la corrección</button>
      <p class="mat-error-bien" hidden><span>Así sí</span>${colorearSimbolos(e.bien)}</p>
    </article>`).join('')}</div>`;
}

/** Práctica en papel: las ayudas se retiran de un ejercicio al siguiente y la solución va oculta. */
export function seccionPapel(): string {
  return `<ol class="mat-papel">${EJERCICIOS_PAPEL.map((ej, i) => {
    const datos = ej.ayuda.datos
      ? `<dl class="mat-papel-datos">${ej.ayuda.datos.map(([s, v]) => `<div><dt>${colorearSimbolos(s)}</dt><dd>${escaparHtml(v)}</dd></div>`).join('')}</dl>`
      : '';
    const formula = ej.ayuda.formula ? `<p class="mat-papel-formula">${colorearSimbolos(ej.ayuda.formula)}</p>` : '';
    const pista = ej.ayuda.pista ? `<p class="mat-papel-pista"><b>Pista.</b> ${colorearSimbolos(ej.ayuda.pista)}</p>` : '';
    return `<li class="mat-ejercicio" data-mat-ejercicio="${ej.id}">
      <p class="mat-papel-nivel mat-nivel-${ej.nivel}">Ejercicio ${i + 1} · ${NIVEL[ej.nivel]}</p>
      <p class="mat-papel-enunciado">${escaparHtml(ej.enunciado)}</p>
      <p class="mat-papel-fuente">${escaparHtml(ej.fuente)}</p>
      ${datos}${formula}${pista}
      <p class="mat-papel-instruccion">Resuélvelo en tu cuaderno con la calculadora. Cuando tengas el resultado, compáralo.</p>
      <button type="button" class="ab o" data-mat-solucion="${ej.id}" aria-expanded="false">Ya lo he hecho: ver la solución</button>
      <div class="mat-papel-solucion" hidden>
        <ol>${ej.solucion.pasos.map((p) => `<li>${colorearSimbolos(p)}</li>`).join('')}</ol>
        <p class="mat-papel-calc"><span>En la calculadora</span><code>${escaparHtml(ej.solucion.calculadora)}</code></p>
        <p class="mat-papel-resultado">${colorearSimbolos(ej.solucion.resultado)}</p>
        <div class="mat-autoevaluacion" role="group" aria-label="¿Te ha salido?">
          <button type="button" class="ab" data-mat-auto="bien">Me ha salido</button>
          <button type="button" class="ab" data-mat-auto="mal">Me he equivocado</button>
        </div>
        <p class="mat-auto-respuesta" aria-live="polite"></p>
      </div>
    </li>`;
  }).join('')}</ol>`;
}

/** Reconocer qué fórmula toca, con tipos mezclados. No se calcula nada. */
export function seccionReconocer(): string {
  return `<div class="mat-reconocer">${EJERCICIOS_RECONOCER.map((ej, i) => `
    <fieldset class="mat-pregunta" data-mat-pregunta="${ej.id}">
      <legend><span>${i + 1} / ${EJERCICIOS_RECONOCER.length}</span>${escaparHtml(ej.enunciado)}</legend>
      <div class="mat-opciones">${ej.opciones.map((id) => `
        <button type="button" class="mat-opcion" data-mat-opcion="${id}">
          <small>${escaparHtml(FORMULAS[id].nombre)}</small><span>${colorearSimbolos(FORMULAS[id].expresion)}</span>
        </button>`).join('')}</div>
      <p class="mat-porque" hidden></p>
    </fieldset>`).join('')}
    <p class="mat-marcador" aria-live="polite" data-mat-marcador>Llevas 0 de ${EJERCICIOS_RECONOCER.length}.</p>
    <button type="button" class="ab" data-mat-repetir hidden>Repetir</button>
  </div>`;
}

/** Conecta los botones de las tres secciones. Devuelve la función para desconectarlos. */
export function montarPracticaCompuesta(raiz: HTMLElement): () => void {
  let aciertos = 0;
  let respondidas = 0;

  function marcador(): void {
    const el = raiz.querySelector<HTMLElement>('[data-mat-marcador]');
    if (!el) return;
    const total = EJERCICIOS_RECONOCER.length;
    el.textContent = respondidas < total
      ? `Llevas ${aciertos} de ${respondidas} respondidas (${total} en total).`
      : `Resultado: ${aciertos} de ${total}. ${aciertos === total ? 'Perfecto: repítelo otro día para fijarlo.' : 'Repasa las que has fallado: mira qué te daban y qué te pedían.'}`;
    const repetir = raiz.querySelector<HTMLElement>('[data-mat-repetir]');
    if (repetir) repetir.hidden = respondidas < total;
  }

  function responder(boton: HTMLButtonElement): void {
    const pregunta = boton.closest<HTMLElement>('[data-mat-pregunta]');
    if (!pregunta || pregunta.dataset.respondida) return;
    const ej = EJERCICIOS_RECONOCER.find((e) => e.id === pregunta.dataset.matPregunta);
    if (!ej) return;
    const acierto = boton.dataset.matOpcion === ej.correcta;
    pregunta.dataset.respondida = acierto ? 'bien' : 'mal';
    pregunta.querySelectorAll<HTMLButtonElement>('[data-mat-opcion]').forEach((b) => {
      b.disabled = true;
      if (b.dataset.matOpcion === ej.correcta) b.classList.add('correcta');
    });
    if (!acierto) boton.classList.add('incorrecta');
    const porque = pregunta.querySelector<HTMLElement>('.mat-porque')!;
    porque.innerHTML = `<b>${acierto ? 'Correcto.' : 'No es esa.'}</b> ${colorearSimbolos(ej.porQue)}`;
    porque.hidden = false;
    respondidas++;
    if (acierto) aciertos++;
    marcador();
  }

  function repetir(): void {
    aciertos = 0;
    respondidas = 0;
    raiz.querySelectorAll<HTMLElement>('[data-mat-pregunta]').forEach((p) => {
      delete p.dataset.respondida;
      p.querySelectorAll<HTMLButtonElement>('[data-mat-opcion]').forEach((b) => {
        b.disabled = false;
        b.classList.remove('correcta', 'incorrecta');
      });
      p.querySelector<HTMLElement>('.mat-porque')!.hidden = true;
    });
    marcador();
  }

  function alPulsar(evento: Event): void {
    const objetivo = evento.target instanceof Element ? evento.target : null;
    const boton = objetivo?.closest<HTMLButtonElement>('button');
    if (!boton || boton.disabled || !raiz.contains(boton)) return;

    if (boton.dataset.matRevelarError !== undefined) {
      const tarjeta = boton.closest<HTMLElement>('[data-mat-error]')!;
      tarjeta.querySelector<HTMLElement>('.mat-error-bien')!.hidden = false;
      boton.setAttribute('aria-expanded', 'true');
      boton.hidden = true;
    } else if (boton.dataset.matSolucion !== undefined) {
      const ejercicio = boton.closest<HTMLElement>('[data-mat-ejercicio]')!;
      ejercicio.querySelector<HTMLElement>('.mat-papel-solucion')!.hidden = false;
      boton.setAttribute('aria-expanded', 'true');
      boton.hidden = true;
    } else if (boton.dataset.matAuto !== undefined) {
      const respuesta = boton.closest<HTMLElement>('.mat-papel-solucion')!.querySelector<HTMLElement>('.mat-auto-respuesta')!;
      respuesta.textContent = boton.dataset.matAuto === 'bien'
        ? 'Bien. Vuelve a hacerlo dentro de unos días sin mirar: así se fija.'
        : 'Busca el primer paso en el que tu cuaderno se separa de la solución y mira si es uno de los errores típicos.';
    } else if (boton.dataset.matOpcion !== undefined) {
      responder(boton);
    } else if (boton.dataset.matRepetir !== undefined) {
      repetir();
    }
  }

  raiz.addEventListener('click', alPulsar);
  return () => raiz.removeEventListener('click', alPulsar);
}
