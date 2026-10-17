/*
 * Selector de fórmulas del laboratorio (hoja digital y cuaderno de papel). Sustituye a la vista del
 * <select> nativo, que pintaba las 19 fórmulas en texto plano, gris sobre gris y todas abiertas: aquí
 * cada parte del tema es un desplegable cerrado y cada fórmula se ve escrita como en la ficha
 * (número, nombre y fórmula con sus colores). El <select> sigue debajo, oculto, como fuente de verdad:
 * el resto del laboratorio lee y escribe su valor igual que antes y este botón solo lo refleja.
 */
import { BLOQUES, FORMULAS_TEMA2, formulaPorId } from '../../content/temas/tema-02/formulas.ts';
import { formulaHtml } from '../matematica/formula.ts';
import { escaparHtml } from './simbolos.ts';

const VACIO = 'Elige la fórmula…';

/** Envuelve el <select> de fórmulas con el botón y el panel desplegable. */
export function selectorFormulasHtml(select: string, idBoton?: string): string {
  const grupos = BLOQUES.map((b) => `<details class="selfx-grupo" data-selfx-bloque="${b.id}">
      <summary><span>${escaparHtml(b.titulo)}</span><small>${FORMULAS_TEMA2.filter((f) => f.bloque === b.id).length}</small></summary>
      <ul role="listbox" aria-label="${escaparHtml(b.titulo)}">${FORMULAS_TEMA2.filter((f) => f.bloque === b.id).map((f) => `<li><button type="button" role="option" aria-selected="false" data-selfx-valor="${f.id}">
        <span class="selfx-num">${f.numero}</span><span class="selfx-nombre">${escaparHtml(f.nombre)}</span><span class="selfx-fx">${formulaHtml(f.expresion)}</span></button></li>`).join('')}</ul>
    </details>`).join('');
  return `<div class="selfx" data-selfx>
    <button type="button" class="selfx-boton" data-selfx-boton${idBoton ? ` id="${idBoton}"` : ''} aria-expanded="false" aria-haspopup="listbox"><span class="selfx-elegida" data-selfx-elegida>${VACIO}</span><svg viewBox="0 0 12 8" aria-hidden="true"><path d="M1 1.5l5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
    <div class="selfx-panel" data-selfx-panel hidden>${grupos}</div>
    ${select.replace('<select ', '<select tabindex="-1" aria-hidden="true" ').replace('class="', 'class="selfx-nativo ')}
  </div>`;
}

/** Refleja en cada selector el valor de su <select> (y si está oculto). Llamar tras cambiarlo por código. */
export function sincronizarSelectoresFormula(raiz: ParentNode): void {
  raiz.querySelectorAll<HTMLElement>('[data-selfx]').forEach((caja) => {
    const select = caja.querySelector<HTMLSelectElement>('select')!;
    caja.hidden = select.hidden;
    const f = select.value ? formulaPorId(select.value) : undefined;
    caja.querySelector<HTMLElement>('[data-selfx-elegida]')!.innerHTML = f
      ? `<span class="selfx-num">${f.numero}</span>${formulaHtml(f.expresion)}<span class="selfx-nombre">${escaparHtml(f.nombre)}</span>`
      : VACIO;
    caja.classList.toggle('selfx-con-valor', Boolean(f));
    caja.querySelectorAll<HTMLButtonElement>('[data-selfx-valor]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.selfxValor === select.value)));
  });
}

function abrir(caja: HTMLElement, abierto: boolean): void {
  const panel = caja.querySelector<HTMLElement>('[data-selfx-panel]')!;
  const boton = caja.querySelector<HTMLButtonElement>('[data-selfx-boton]')!;
  panel.hidden = !abierto;
  boton.setAttribute('aria-expanded', String(abierto));
  caja.classList.toggle('selfx-abierto', abierto);
  if (!abierto) return;
  // Se abre solo la parte de la fórmula elegida (o ninguna): el resto, plegado.
  const valor = caja.querySelector<HTMLSelectElement>('select')!.value;
  const bloque = valor ? formulaPorId(valor)?.bloque : undefined;
  caja.querySelectorAll<HTMLDetailsElement>('details').forEach((d) => { d.open = d.dataset.selfxBloque === bloque; });
  (caja.querySelector<HTMLElement>('[aria-selected="true"]') ?? caja.querySelector<HTMLElement>('summary'))?.focus();
}

/** Monta los selectores de `raiz`. Devuelve la función que los desmonta. */
export function montarSelectoresFormula(raiz: HTMLElement): () => void {
  const alPulsar = (ev: Event) => {
    const objetivo = ev.target as Element;
    const dentro = raiz.contains(objetivo);
    const boton = dentro ? objetivo.closest<HTMLElement>('[data-selfx-boton]') : null;
    const opcion = dentro ? objetivo.closest<HTMLElement>('[data-selfx-valor]') : null;
    // Clic fuera: se cierran los que estén abiertos.
    raiz.querySelectorAll<HTMLElement>('.selfx-abierto').forEach((c) => { if (!c.contains(objetivo)) abrir(c, false); });
    if (boton) {
      const caja = boton.closest<HTMLElement>('[data-selfx]')!;
      abrir(caja, !caja.classList.contains('selfx-abierto'));
    } else if (opcion) {
      const caja = opcion.closest<HTMLElement>('[data-selfx]')!;
      const select = caja.querySelector<HTMLSelectElement>('select')!;
      select.value = opcion.dataset.selfxValor!;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      abrir(caja, false);
      sincronizarSelectoresFormula(caja.parentElement ?? caja);
      caja.querySelector<HTMLElement>('[data-selfx-boton]')!.focus();
    }
  };
  const alTeclear = (ev: KeyboardEvent) => {
    if (ev.key !== 'Escape') return;
    const caja = (ev.target as Element).closest<HTMLElement>('.selfx-abierto');
    if (!caja) return;
    abrir(caja, false);
    caja.querySelector<HTMLElement>('[data-selfx-boton]')!.focus();
  };
  const alCambiar = () => sincronizarSelectoresFormula(raiz);
  document.addEventListener('click', alPulsar);
  raiz.addEventListener('keydown', alTeclear);
  raiz.addEventListener('change', alCambiar);
  sincronizarSelectoresFormula(raiz);
  return () => {
    document.removeEventListener('click', alPulsar);
    raiz.removeEventListener('keydown', alTeclear);
    raiz.removeEventListener('change', alCambiar);
  };
}
