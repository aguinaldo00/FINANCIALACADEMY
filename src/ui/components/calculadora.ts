/*
 * Calculadora del laboratorio. Calcula de verdad con el motor de src/domain/tema2/expresion.ts: lo
 * tecleado se ve tal cual arriba y el resultado debajo; nunca se reescribe lo que escribe el alumno.
 * Funciona con las teclas en pantalla y con el teclado físico (la pantalla es un campo de texto).
 * «Explícame este cálculo» cuenta los pasos en el orden en que se hacen y, si el cuaderno tiene
 * datos, dice qué representa cada número.
 */
import { analizar, calcular, explicar, formatear, formatearExacto } from '../../domain/tema2/expresion.ts';
import { escaparHtml } from './simbolos.ts';

type Tecla = { t: string; inserta?: string; accion?: 'borrar' | 'atras' | 'igual'; clase?: string; etiqueta?: string };

const TECLAS: Tecla[] = [
  { t: '(' }, { t: ')' }, { t: '√', inserta: '√(', etiqueta: 'Raíz cuadrada' }, { t: 'log', inserta: 'log(', etiqueta: 'Logaritmo decimal' }, { t: 'ln', inserta: 'ln(', etiqueta: 'Logaritmo neperiano' },
  { t: 'C', accion: 'borrar', clase: 'cal-borrar', etiqueta: 'Borrar todo' }, { t: '⌫', accion: 'atras', etiqueta: 'Borrar el último signo' }, { t: 'xʸ', inserta: '^', etiqueta: 'Potencia' }, { t: '%' }, { t: '÷', clase: 'cal-op', etiqueta: 'Dividir' },
  { t: '7' }, { t: '8' }, { t: '9' }, { t: 'Ans', etiqueta: 'Resultado anterior' }, { t: '×', clase: 'cal-op', etiqueta: 'Multiplicar' },
  { t: '4' }, { t: '5' }, { t: '6' }, { t: ',', etiqueta: 'Coma decimal' }, { t: '−', clase: 'cal-op', etiqueta: 'Restar' },
  { t: '1' }, { t: '2' }, { t: '3' }, { t: '0' }, { t: '+', clase: 'cal-op', etiqueta: 'Sumar' },
  { t: '=', accion: 'igual', clase: 'cal-igual', etiqueta: 'Calcular' },
];

export function htmlCalculadora(): string {
  return `<div class="cal" data-calculadora>
    <div class="cal-pantalla">
      <label class="sr" for="cal-entrada">Operación</label>
      <input id="cal-entrada" class="cal-entrada" data-cal-entrada type="text" inputmode="decimal" autocomplete="off" spellcheck="false" placeholder="3000 ÷ (1 + 3 × 0,07)">
      <output class="cal-resultado" data-cal-resultado aria-live="polite">0</output>
      <p class="cal-error" data-cal-error hidden></p>
    </div>
    <div class="cal-teclas">${TECLAS.map((k) => `<button type="button" class="cal-tecla ${k.clase ?? ''}" data-cal-tecla="${escaparHtml(k.inserta ?? k.t)}"${k.accion ? ` data-cal-accion="${k.accion}"` : ''}${k.etiqueta ? ` aria-label="${escaparHtml(k.etiqueta)}"` : ''}>${escaparHtml(k.t)}</button>`).join('')}</div>
    <div class="cal-acciones">
      <button type="button" class="cal-enlace" data-cal-explicar aria-expanded="false"><svg class="cal-icono" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg> Explícame este cálculo paso a paso</button>
      <button type="button" class="cal-enlace" data-cal-enviar>Enviar al cuaderno <span aria-hidden="true">→</span></button>
    </div>
    <ol class="cal-explicacion" data-cal-explicacion hidden></ol>
  </div>`;
}

export interface OpcionesCalculadora {
  /** Datos del cuaderno (símbolo → valor) para decir qué representa cada número. */
  datos?: () => Readonly<Record<string, number>>;
  /** Lo que se envía al cuaderno: la operación tal como se tecleó y su resultado. */
  alEnviar?: (expresion: string, resultado: string) => void;
}

export function montarCalculadora(raiz: HTMLElement, opciones: OpcionesCalculadora = {}): () => void {
  const cal = raiz.querySelector<HTMLElement>('[data-calculadora]');
  if (!cal) return () => {};
  const entrada = cal.querySelector<HTMLInputElement>('[data-cal-entrada]')!;
  const resultado = cal.querySelector<HTMLElement>('[data-cal-resultado]')!;
  const error = cal.querySelector<HTMLElement>('[data-cal-error]')!;
  const explicacion = cal.querySelector<HTMLOListElement>('[data-cal-explicacion]')!;
  const botonExplicar = cal.querySelector<HTMLButtonElement>('[data-cal-explicar]')!;
  let ans = 0;

  /** Vista previa mientras se escribe; los errores solo se enseñan al pulsar =. */
  const previa = () => {
    error.hidden = true;
    const r = calcular(entrada.value, ans);
    if (r.ok) resultado.textContent = formatearExacto(r.valor);
    if (!botonExplicar.getAttribute('aria-expanded')?.includes('true')) return;
    explicar_();
  };
  const igual = () => {
    const r = calcular(entrada.value, ans);
    if (!r.ok) {
      error.textContent = r.error;
      error.hidden = false;
      entrada.focus();
      entrada.setSelectionRange(r.posicion, r.posicion);
      return;
    }
    ans = r.valor;
    resultado.textContent = formatearExacto(r.valor);
    error.hidden = true;
  };
  const insertar = (texto: string) => {
    const ini = entrada.selectionStart ?? entrada.value.length;
    const fin = entrada.selectionEnd ?? entrada.value.length;
    entrada.value = entrada.value.slice(0, ini) + texto + entrada.value.slice(fin);
    const pos = ini + texto.length;
    entrada.setSelectionRange(pos, pos);
    previa();
  };
  function explicar_(): void {
    const pasos = entrada.value.trim() ? explicar(entrada.value, opciones.datos?.() ?? {}, ans) : ['Escribe una operación y te explico cómo se calcula.'];
    explicacion.innerHTML = pasos.map((p) => `<li>${escaparHtml(p)}</li>`).join('');
  }

  const alPulsar = (e: Event) => {
    const t = (e.target as Element).closest<HTMLButtonElement>('button');
    if (!t || !cal.contains(t)) return;
    if (t.dataset.calTecla !== undefined) {
      const accion = t.dataset.calAccion;
      if (accion === 'borrar') { entrada.value = ''; resultado.textContent = '0'; error.hidden = true; previa(); }
      else if (accion === 'atras') {
        const ini = entrada.selectionStart ?? entrada.value.length;
        const fin = entrada.selectionEnd ?? ini;
        const desde = ini === fin ? Math.max(0, ini - 1) : ini;
        entrada.value = entrada.value.slice(0, desde) + entrada.value.slice(fin);
        entrada.setSelectionRange(desde, desde);
        previa();
      } else if (accion === 'igual') igual();
      else insertar(t.dataset.calTecla);
      return;
    }
    if (t.hasAttribute('data-cal-explicar')) {
      const abrir = explicacion.hidden;
      explicacion.hidden = !abrir;
      t.setAttribute('aria-expanded', String(abrir));
      if (abrir) explicar_();
      return;
    }
    if (t.hasAttribute('data-cal-enviar')) {
      const a = analizar(entrada.value);
      const r = calcular(entrada.value, ans);
      if (!a.ok || !r.ok) { igual(); return; }
      opciones.alEnviar?.(entrada.value.trim(), formatear(r.valor, Math.abs(r.valor) < 1 ? 6 : 2));
    }
  };
  const alTeclear = (e: KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); igual(); }
  };
  cal.addEventListener('click', alPulsar);
  entrada.addEventListener('input', previa);
  entrada.addEventListener('keydown', alTeclear);
  return () => {
    cal.removeEventListener('click', alPulsar);
    entrada.removeEventListener('input', previa);
    entrada.removeEventListener('keydown', alTeclear);
  };
}
