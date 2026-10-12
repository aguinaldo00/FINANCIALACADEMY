/*
 * Fase D · ejercicio aleatorio: un enunciado nuevo cada vez, de cualquiera de las fórmulas del
 * bloque, redactado como en el examen (los mismos datos del generador y los mismos enunciados que
 * el «Modo examen» del laboratorio). Se resuelve como en la ficha de cada fórmula: en DIGITAL, con la
 * hoja de cálculo (guiada o Pro), o en ANALÓGICO, con el cuaderno de papel; con la calculadora al
 * lado. «Comprobar» corrige el resultado; tras el primer intento se pueden ver la fórmula y la
 * solución. El número del ejercicio lo hace reproducible.
 */
import { enunciadoExamen } from '../../../content/temas/tema-02/enunciados.ts';
import { type BloqueId, formulaPorId } from '../../../content/temas/tema-02/formulas.ts';
import { formatear, formatearExacto } from '../../../domain/tema2/expresion.ts';
import { generarEjercicio, nuevaSemilla } from '../../../domain/tema2/generador.ts';
import { comprobar, esperado, LABORATORIOS, leerDato, mostrar } from '../../../domain/tema2/laboratorio.ts';
import { htmlCalculadora, montarCalculadora } from '../../components/calculadora.ts';
import { htmlHoja, montarHoja } from '../../components/hojaCalculo.ts';
import { escaparHtml, formulaHtml, hrefFormula } from './comun.ts';
import { formaDespejada, queEscribir, sustitucion } from './laboratorio.ts';

const CLAVE_MODO = 'fa-lab-modo';

/** Cuaderno de papel genérico (no se sabe la fórmula de antemano): lo que se escribe en cada línea. */
function papelHtml(): string {
  const fila = (n: number, titulo: string, cuerpo: string) =>
    `<li class="lab-paso"><span class="lab-paso-n" aria-hidden="true">${n}</span><div class="lab-paso-cuerpo"><p class="lab-paso-tit">${titulo}:</p>${cuerpo}</div></li>`;
  const area = (nombre: string, etiqueta: string, pista: string, filas = 2) => `<textarea class="lab-campo" data-al-papel="${nombre}" rows="${filas}" aria-label="${etiqueta}" placeholder="${pista}" spellcheck="false"></textarea>`;
  const linea = (nombre: string, etiqueta: string, pista: string) => `<input class="lab-campo" type="text" data-al-papel="${nombre}" aria-label="${etiqueta}" placeholder="${pista}" autocomplete="off" spellcheck="false">`;
  return `<div class="lab-papel" data-al-papel-hoja>
    <header class="lab-panel-cab"><h2><span>01</span>Cuaderno de papel</h2><button type="button" class="lab-mini" data-al-borrar-papel>Borrar</button></header>
    <ol class="lab-pasos">
      ${fila(1, 'Datos', area('datos', 'Datos', 'Cada dato con su letra, uno por línea'))}
      ${fila(2, 'Incógnita', linea('incognita', 'Incógnita', '¿Qué te piden?'))}
      ${fila(3, 'Fórmula', linea('formula', 'Fórmula', 'La fórmula que vas a usar'))}
      ${fila(4, 'Despeje', `${queEscribir('despeje')}${linea('despeje', 'Despeje', 'Incógnita = … (solo letras)')}`)}
      ${fila(5, 'Sustitución', `${queEscribir('sustitucion')}${linea('sustitucion', 'Sustitución', 'Incógnita = … (con tus números)')}`)}
      ${fila(6, 'Operaciones', area('operaciones', 'Operaciones', 'Una operación por línea; la calculadora las trae aquí', 3))}
    </ol>
    <p class="lab-que">El resultado se escribe abajo, en «Tu resultado», y se comprueba allí.</p>
  </div>`;
}

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
    <div class="lab-modo t2-al-modo" role="group" aria-label="Forma de trabajar">
      <button type="button" data-al-modo="digital" aria-pressed="true">Digital</button>
      <button type="button" data-al-modo="analogico" aria-pressed="false">Analógico</button>
    </div>
    <div class="t2-al-trabajo">
      <section class="lab-panel lab-cuaderno t2-al-zona" data-al-zona="digital" aria-label="Hoja de cálculo">
        <header class="lab-panel-cab"><h2><span>01</span>Hoja de cálculo</h2></header>
        <div data-al-hoja-sitio></div>
      </section>
      <section class="t2-al-zona t2-al-papel lab-papel-abierto" data-al-zona="analogico" aria-label="Cuaderno de papel" hidden>${papelHtml()}</section>
      <section class="lab-panel lab-calculadora t2-al-calc" aria-labelledby="t2-al-cal-tit">
        <header class="lab-panel-cab"><h2 id="t2-al-cal-tit"><span>02</span>Calculadora</h2></header>
        ${htmlCalculadora({ id: 't2-al-cal' })}
      </section>
    </div>
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
  const paradas: (() => void)[] = [];

  /* Hoja de cálculo: su estado vive aquí y se vacía con cada ejercicio (salvo el modo guiada/Pro). */
  let hojaEstado: Record<string, string> = {};
  const sitioHoja = $('[data-al-hoja-sitio]');
  let pararHoja: () => void = () => {};
  const pintarHoja = () => {
    pararHoja();
    hojaEstado = hojaEstado['hoja:modo'] ? { 'hoja:modo': hojaEstado['hoja:modo'] } : {};
    const leer = (c: string) => hojaEstado[c] ?? '';
    sitioHoja.innerHTML = htmlHoja('t2-al-hoja', leer);
    pararHoja = montarHoja(sitioHoja, {
      leer,
      // Como en el examen: la hoja calcula, pero no dice si la fórmula o los datos son los buenos.
      objetivo: () => (actual ? { incognita: LABORATORIOS[actual.formula]!.incognita, datos: actual.datos, examen: true } : null),
      alCalcular: (texto) => {
        const campo = $<HTMLInputElement>('[data-al-campo]');
        if (!campo.value.trim()) campo.value = texto;
      },
      alGuardar: (c, v) => { hojaEstado[c] = v; },
    });
  };
  const alEscribirHoja = (e: Event) => {
    const c = (e.target as Element).closest<HTMLInputElement>('[data-hoja] [data-campo]');
    if (c) hojaEstado[c.dataset.campo!] = c.value;
  };
  sitioHoja.addEventListener('input', alEscribirHoja);
  sitioHoja.addEventListener('change', alEscribirHoja);
  paradas.push(() => { pararHoja(); sitioHoja.removeEventListener('input', alEscribirHoja); sitioHoja.removeEventListener('change', alEscribirHoja); });

  /* DIGITAL / ANALÓGICO: el mismo interruptor (y la misma preferencia) que la ficha de cada fórmula. */
  const ponerModo = (modo: 'digital' | 'analogico') => {
    art.dataset.modo = modo;
    art.querySelectorAll<HTMLButtonElement>('[data-al-modo]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.alModo === modo)));
    art.querySelectorAll<HTMLElement>('[data-al-zona]').forEach((z) => { z.hidden = z.dataset.alZona !== modo; });
    try { localStorage.setItem(CLAVE_MODO, modo); } catch { /* sin almacenamiento */ }
  };
  let modoGuardado: string | null = null;
  try { modoGuardado = localStorage.getItem(CLAVE_MODO); } catch { modoGuardado = null; }
  ponerModo(modoGuardado === 'analogico' ? 'analogico' : 'digital');

  const borrarPapel = () => art.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[data-al-papel]').forEach((c) => { c.value = ''; });

  // La calculadora lleva sus operaciones al papel y, si está vacío, el resultado a «Tu resultado».
  paradas.push(montarCalculadora($('.t2-al-calc'), {
    alEnviar: (expresion, resultado) => {
      const ops = $<HTMLTextAreaElement>('[data-al-papel="operaciones"]');
      ops.value = `${ops.value.trim() ? `${ops.value.trimEnd()}\n` : ''}${expresion} = ${resultado}`;
      const campo = $<HTMLInputElement>('[data-al-campo]');
      if (!campo.value.trim()) campo.value = resultado;
    },
  }));

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
    // Ejercicio nuevo: hoja y papel en blanco.
    pintarHoja();
    borrarPapel();
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
    if (b.dataset.alModo) return ponerModo(b.dataset.alModo as 'digital' | 'analogico');
    if (b.hasAttribute('data-al-borrar-papel')) return borrarPapel();
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
    paradas.forEach((p) => p());
    art.removeEventListener('submit', alEnviar);
    art.removeEventListener('click', alPulsar);
  };
}
