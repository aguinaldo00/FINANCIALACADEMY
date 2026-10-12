/*
 * Fase D · ejercicio aleatorio: un enunciado nuevo cada vez, de cualquiera de las fórmulas del
 * bloque, redactado como en el examen (los mismos datos del generador y los mismos enunciados que
 * el «Modo examen» del laboratorio). Se resuelve en papel y aquí solo se comprueba. Tras el primer
 * intento se pueden ver la fórmula y la solución; el número del ejercicio lo hace reproducible.
 */
import { enunciadoExamen } from '../../../content/temas/tema-02/enunciados.ts';
import { type BloqueId, formulaPorId } from '../../../content/temas/tema-02/formulas.ts';
import { formatear, formatearExacto } from '../../../domain/tema2/expresion.ts';
import { generarEjercicio, nuevaSemilla } from '../../../domain/tema2/generador.ts';
import { comprobar, esperado, LABORATORIOS, leerDato, mostrar } from '../../../domain/tema2/laboratorio.ts';
import { escaparHtml, formulaHtml, hrefFormula } from './comun.ts';
import { formaDespejada, sustitucion } from './laboratorio.ts';

const DADO = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="3.5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="9" cy="9" r="1.5" fill="currentColor"/><circle cx="15" cy="15" r="1.5" fill="currentColor"/><circle cx="15" cy="9" r="1.5" fill="currentColor"/><circle cx="9" cy="15" r="1.5" fill="currentColor"/></svg>';

/** Fórmulas del bloque que calculan una incógnita (las que tienen enunciado de examen). */
export const formulasAleatorias = (bloque: BloqueId): string[] => Object.keys(LABORATORIOS).filter((id) => formulaPorId(id)?.bloque === bloque);

export interface EjercicioAleatorio {
  semilla: number;
  formula: string;
  enunciado: string;
  /** Datos tal como vienen en el enunciado. */
  datos: Readonly<Record<string, string>>;
  /** Resultado exacto (sin redondear). */
  resultado: number;
}

/** El ejercicio de una semilla: la fórmula también sale de la semilla, así que es reproducible. */
export function ejercicioAleatorio(bloque: BloqueId, semilla: number): EjercicioAleatorio | null {
  const ids = formulasAleatorias(bloque);
  if (!ids.length) return null;
  const formula = ids[semilla % ids.length]!;
  const lab = LABORATORIOS[formula]!;
  const datos = generarEjercicio(formula, semilla)?.datos;
  const enunciado = datos ? enunciadoExamen(formula, datos) : null;
  if (!datos || !enunciado) return null;
  const valores: Record<string, number> = {};
  for (const d of lab.datos) {
    const l = leerDato(datos[d.simbolo] ?? '', d.magnitud);
    if (l.ok === true) valores[d.simbolo] = l.valor;
  }
  const resultado = esperado(lab, valores);
  return resultado === null ? null : { semilla, formula, enunciado, datos, resultado };
}

const PISTA_RESULTADO = { euros: 'p. ej. 1.234,56', tipo: 'p. ej. 5 % o 0,05', tiempo: 'en años, p. ej. 2,5', partes: 'p. ej. 4' } as const;

export function htmlAleatorioPapel(bloque: BloqueId): string {
  if (!formulasAleatorias(bloque).length) return '';
  return `<article class="t2-practica t2-aleatorio" data-aleatorio="${bloque}" aria-labelledby="t2-al-tit">
    <header><span class="t2-ej-num" aria-hidden="true">${DADO}</span><h2 class="t2-aleatorio-tit" id="t2-al-tit">Ejercicio aleatorio</h2><p class="t2-ej-fuente" data-al-origen></p></header>
    <p class="t2-instruccion">Un enunciado nuevo cada vez, de cualquier fórmula de este bloque y como en el examen: sin decirte qué es cada dato ni qué fórmula usar.</p>
    <p class="t2-enunciado" data-al-enunciado></p>
    <form class="t2-respuesta" data-al-respuesta>
      <label for="t2-al-r">Tu resultado</label>
      <span class="t2-campo"><input id="t2-al-r" inputmode="decimal" autocomplete="off" data-al-campo></span>
      <button type="submit" class="btn-principal">Comprobar</button>
    </form>
    <p class="t2-feedback" aria-live="polite" data-al-feedback></p>
    <div class="t2-pistas">
      <button type="button" class="btn-control" data-al-pista="formula" disabled>Pista: la fórmula</button>
      <button type="button" class="btn-control" data-al-pista="solucion" disabled>Ver la solución</button>
      <button type="button" class="btn-secundario" data-al-otro>${DADO}Otro ejercicio</button>
    </div>
    <div class="t2-ayuda" data-al-formula hidden></div>
    <div class="t2-solucion" data-al-solucion hidden></div>
  </article>`;
}

export function montarAleatorioPapel(raiz: HTMLElement): () => void {
  const art = raiz.querySelector<HTMLElement>('[data-aleatorio]');
  if (!art) return () => {};
  const bloque = art.dataset.aleatorio as BloqueId;
  const $ = <T extends HTMLElement>(sel: string) => art.querySelector<T>(sel)!;
  let semilla = Math.floor(Math.random() * 99991) + 1;
  let actual: EjercicioAleatorio | null = null;

  const pintar = () => {
    // Si una semilla no da un ejercicio válido (no debería), se prueba la siguiente.
    for (let k = 0; k < 5 && !(actual = ejercicioAleatorio(bloque, semilla)); k++) semilla = nuevaSemilla(semilla);
    if (!actual) return;
    const lab = LABORATORIOS[actual.formula]!;
    art.dataset.semilla = String(semilla);
    $('[data-al-origen]').textContent = `Nº ${semilla} · generado al azar`;
    $('[data-al-enunciado]').textContent = actual.enunciado;
    const campo = $<HTMLInputElement>('[data-al-campo]');
    campo.value = '';
    campo.placeholder = PISTA_RESULTADO[lab.incognita.magnitud];
    $('[data-al-feedback]').textContent = '';
    $('[data-al-feedback]').className = 't2-feedback';
    art.classList.remove('resuelta');
    art.querySelectorAll<HTMLButtonElement>('[data-al-pista]').forEach((b) => { b.disabled = true; b.classList.remove('usada'); });
    $('[data-al-formula]').hidden = true;
    $('[data-al-solucion]').hidden = true;
  };

  const alEnviar = (e: Event) => {
    if (!(e.target as Element).closest('[data-al-respuesta]') || !actual) return;
    e.preventDefault();
    const lab = LABORATORIOS[actual.formula]!;
    const v = comprobar($<HTMLInputElement>('[data-al-campo]').value, lab, actual.resultado);
    const fb = $('[data-al-feedback]');
    fb.className = `t2-feedback ${v.bien ? 'bien' : 'mal'}`;
    fb.innerHTML = v.bien ? `<b>Correcto.</b> ${escaparHtml(v.mensaje.replace(/^Correcto: /, ''))}` : `<b>Todavía no.</b> ${escaparHtml(v.mensaje.replace(/; la calculadora te puede explicar tu operación/, ''))}`;
    art.classList.toggle('resuelta', v.bien);
    // Tras el primer intento se desbloquean las ayudas.
    art.querySelectorAll<HTMLButtonElement>('[data-al-pista]:not(.usada)').forEach((b) => { b.disabled = false; });
  };

  const alPulsar = (e: Event) => {
    const b = (e.target as Element).closest<HTMLButtonElement>('button');
    if (!b || !art.contains(b) || !actual) return;
    if (b.hasAttribute('data-al-otro')) {
      semilla = nuevaSemilla(semilla);
      pintar();
      return;
    }
    const f = formulaPorId(actual.formula)!;
    const lab = LABORATORIOS[actual.formula]!;
    if (b.dataset.alPista === 'formula') {
      const cajaF = $('[data-al-formula]');
      cajaF.innerHTML = `<p>Fórmula ${f.numero} · ${escaparHtml(f.nombre)}</p><p class="t2-papel-fx">${formulaHtml(f.expresion)}</p>`;
      cajaF.hidden = false;
    } else if (b.dataset.alPista === 'solucion') {
      const valores: Record<string, string> = {};
      for (const d of lab.datos) {
        const l = leerDato(actual.datos[d.simbolo] ?? '', d.magnitud);
        if (l.ok === true) valores[d.simbolo] = d.magnitud === 'euros' ? formatear(l.valor, Number.isInteger(l.valor) ? 0 : 2) : formatearExacto(l.valor);
      }
      const sol = $('[data-al-solucion]');
      sol.innerHTML = `<ol><li>Fórmula ${f.numero}: ${formulaHtml(f.expresion)}</li><li>Con los datos (los tipos en tanto por uno; el tiempo en la unidad del tipo): ${formulaHtml(sustitucion(formaDespejada(f.id, lab.incognita.simbolo), valores))}</li></ol>
        <p class="t2-resultado">${formulaHtml(lab.incognita.simbolo)} = ${escaparHtml(mostrar(actual.resultado, lab.incognita.magnitud))}</p>
        <p><a href="${hrefFormula(f.id)}">Ver la fórmula ${f.numero} animada</a></p>`;
      sol.hidden = false;
    } else return;
    b.disabled = true;
    b.classList.add('usada');
  };

  art.addEventListener('submit', alEnviar);
  art.addEventListener('click', alPulsar);
  pintar();
  return () => {
    art.removeEventListener('submit', alEnviar);
    art.removeEventListener('click', alPulsar);
  };
}
