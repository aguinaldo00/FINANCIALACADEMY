import type { Concepto, ModoExplicacion } from '../../content/schema.ts';
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
  const { enunciado, opciones, explicacion } = concepto.pregunta;
  panel.innerHTML = `<p><b>${enunciado}</b></p><div class="opts">${opciones.map((t, i) => `<button class="opt" data-k="${i}">${t}</button>`).join('')}</div><div class="fb"></div>`;
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
