/*
 * Simulacro de examen del Tema 2 (en D · Practicar en papel): 4, 5 o 6 ejercicios mezclados de las
 * tres partes, con un solo reloj para todo (30, 45 o 60 minutos) y una calculadora de examen, sin
 * explicaciones ni soluciones hasta entregar. En cada ejercicio se contesta qué te piden, qué fórmula
 * se usa y el resultado; así, al entregar, cada fallo se clasifica (lectura, elección, unidades o
 * cálculo). El simulacro en curso se guarda en este navegador: si se recarga la página, sigue igual y
 * con el reloj donde iba. Al entregar se guarda la nota para «Mi progreso».
 */
import { BLOQUES, formulaPorId, FORMULAS_TEMA2 } from '../../../content/temas/tema-02/formulas.ts';
import { enunciadoExamen } from '../../../content/temas/tema-02/enunciados.ts';
import { simbolo } from '../../../content/temas/tema-02/simbolos.ts';
import { anotarFallo, anotarSimulacro, CONSEJO_FALLO, type CuentaFallos, diagnosticar, NOMBRE_FALLO, simulacrosGuardados, type TipoFallo } from '../../../domain/tema2/diagnostico.ts';
import { generarEjercicio, type EjercicioGenerado } from '../../../domain/tema2/generador.ts';
import { esperado, LABORATORIOS, leerDato, mostrar } from '../../../domain/tema2/laboratorio.ts';
import { htmlCalculadora, montarCalculadora } from '../../components/calculadora.ts';
import { formatoReloj, htmlRelojExamen, minutosGuardados, montarRelojExamen } from '../../components/relojExamen.ts';
import { montarSelectoresFormula, selectorFormulasHtml } from '../../components/selectorFormulas.ts';
import { escaparHtml, formulaHtml, hrefFormula } from './comun.ts';
import { DERIVACIONES } from './indice.ts';

const CLAVE = 'fa-t2-simulacro';
const CLAVE_MINUTOS = 'fa-t2-simulacro-minutos';
const MINUTOS = [30, 45, 60] as const;
const PREGUNTAS = [4, 5, 6] as const;
/** Lo que se puede contestar en «¿Qué te piden?»: todas las incógnitas del tema. */
const INCOGNITAS = [...new Set(Object.values(LABORATORIOS).map((l) => l.incognita.simbolo))];

interface Estado {
  semilla: number;
  total: number;
  minutos: number;
  periodos: boolean;
  inicio: number;
  fin?: number;
  respuestas: Record<string, string>;
  /** Segundos dedicados a cada ejercicio (mientras se escribe en él). */
  tiempos: number[];
}

interface Pregunta { formula: string; ejercicio: EjercicioGenerado }

/** Los ejercicios del simulacro: uno de cada parte por turno, sin repetir fórmula. Reproducible por la semilla. */
export function preguntasSimulacro(semilla: number, total: number, periodos: boolean): Pregunta[] {
  const porParte = BLOQUES.map((b) => FORMULAS_TEMA2.filter((f) => f.bloque === b.id && LABORATORIOS[f.id]).map((f) => f.id));
  const usadas = new Set<string>();
  const salida: Pregunta[] = [];
  for (let k = 0; salida.length < total && k < total * 6; k++) {
    const ids = porParte[k % porParte.length]!;
    const id = ids[(semilla * (k + 3) + k * 7) % ids.length]!;
    if (usadas.has(id)) continue;
    const ejercicio = generarEjercicio(id, semilla + k * 977, { todosLosPeriodos: periodos });
    if (!ejercicio) continue;
    usadas.add(id);
    salida.push({ formula: id, ejercicio });
  }
  return salida;
}

function leerEstado(): Estado | null {
  try { return JSON.parse(localStorage.getItem(CLAVE) ?? 'null'); } catch { return null; }
}
function guardarEstado(e: Estado | null): void {
  try {
    if (e) localStorage.setItem(CLAVE, JSON.stringify(e));
    else localStorage.removeItem(CLAVE);
  } catch { /* sin almacenamiento: se trabaja igual */ }
}

export function htmlSimulacroT2(): string {
  return `<section class="t2-simex" aria-labelledby="t2-simex-tit" data-simex>
    <header class="t2-simex-cab">
      <p class="t2-ceja">Las tres partes, mezcladas</p>
      <h2 id="t2-simex-tit">Simulacro de examen</h2>
      <p>Como en el aula: varios ejercicios seguidos, un solo reloj y solo la calculadora. Las soluciones se ven al entregar.</p>
    </header>
    <form class="t2-simex-config" data-simex-config>
      <fieldset><legend>Ejercicios</legend>${PREGUNTAS.map((n) => `<label class="sim-op"><input type="radio" name="simex-n" value="${n}"${n === 5 ? ' checked' : ''}><span>${n}</span></label>`).join('')}</fieldset>
      <fieldset><legend>Tiempo</legend>${MINUTOS.map((m) => `<label class="sim-op"><input type="radio" name="simex-min" value="${m}"${m === minutosGuardados(CLAVE_MINUTOS, MINUTOS, 45) ? ' checked' : ''}><span>${m} min</span></label>`).join('')}</fieldset>
      <label class="t2-simex-check"><input type="checkbox" name="simex-periodos"> Con tipos semestrales, mensuales, diarios…</label>
      <button type="submit" class="btn-principal">Empezar el simulacro</button>
      <p class="t2-simex-historial" data-simex-historial></p>
    </form>
    <div class="t2-simex-examen" data-simex-examen hidden>
      <div class="t2-simex-barra">${htmlRelojExamen(MINUTOS, 'Minutos del simulacro')}<p class="t2-simex-num" data-simex-num></p><button type="button" class="btn-secundario t2-simex-calboton" data-simex-cal aria-expanded="false">Calculadora</button></div>
      <div class="t2-simex-mesa">
        <ol class="t2-simex-lista" data-simex-lista></ol>
        <aside class="t2-simex-cal" aria-label="Calculadora de examen" data-simex-calpanel hidden>
          <p class="t2-simex-n">Calculadora</p>
          ${htmlCalculadora({ id: 'simex-cal', examen: true })}
        </aside>
      </div>
      <div class="t2-simex-pie"><button type="button" class="btn-principal" data-simex-entregar>Entregar</button><button type="button" class="btn-enlace" data-simex-abandonar>Abandonar</button></div>
    </div>
    <div class="t2-simex-resultado" data-simex-resultado hidden aria-live="polite"></div>
  </section>`;
}

const opcionesIncognita = () => `<option value="">¿Qué te piden?</option>${INCOGNITAS.map((s) => `<option value="${s}">${escaparHtml(simbolo(s)?.nombre ?? s)}</option>`).join('')}`;
const selectorFormula = (k: number) => selectorFormulasHtml(`<select class="lab-campo hoja-select" data-simex-campo="formula:${k}"><option value="">Elige la fórmula…</option>${BLOQUES.map((b) => `<optgroup label="${escaparHtml(b.titulo)}">${FORMULAS_TEMA2.filter((f) => f.bloque === b.id).map((f) => `<option value="${f.id}">Nº ${f.numero}</option>`).join('')}</optgroup>`).join('')}</select>`);

function tarjetaHtml(p: Pregunta, k: number): string {
  return `<li class="t2-simex-ej" data-simex-ej="${k}">
    <p class="t2-simex-n">Ejercicio ${k + 1}</p>
    <p class="t2-simex-enunciado">${escaparHtml(enunciadoExamen(p.formula, p.ejercicio.datos, p.ejercicio.periodicidad) ?? '')}</p>
    <div class="t2-simex-campos">
      <label><span>1 · Te piden</span><select class="lab-campo hoja-select" data-simex-campo="incognita:${k}">${opcionesIncognita()}</select></label>
      <div class="t2-simex-formula"><span>2 · Fórmula</span>${selectorFormula(k)}</div>
      <label><span>3 · Resultado</span><input class="lab-campo" type="text" inputmode="decimal" autocomplete="off" data-simex-campo="resultado:${k}" placeholder="con su unidad: €, % o años"></label>
    </div>
  </li>`;
}

/** Monta el simulacro. Devuelve la función que lo desmonta. */
export function montarSimulacroT2(raiz: HTMLElement): () => void {
  const caja = raiz.querySelector<HTMLElement>('[data-simex]');
  if (!caja) return () => {};
  const $ = <T extends HTMLElement>(s: string) => caja.querySelector<T>(s)!;
  const config = $<HTMLFormElement>('[data-simex-config]');
  const examen = $('[data-simex-examen]');
  const lista = $('[data-simex-lista]');
  const resultado = $('[data-simex-resultado]');
  const paradas: (() => void)[] = [];
  let estado = leerEstado();
  let preguntas: Pregunta[] = [];
  let activo = -1;
  let desde = 0;

  const reloj = montarRelojExamen(examen, (minutos) => {
    if (!estado) return;
    estado.minutos = minutos;
    guardarEstado(estado);
    reloj.mostrar(estado.inicio, minutos);
  }, CLAVE_MINUTOS);
  paradas.push(() => reloj.desmontar(), montarCalculadora(examen), montarSelectoresFormula(examen));

  const pintarHistorial = () => {
    const h = simulacrosGuardados().slice(-3).reverse();
    $('[data-simex-historial]').textContent = h.length ? `Últimos: ${h.map((s) => `${s.nota.toFixed(1).replace('.', ',')} (${s.aciertos}/${s.total}, ${formatoReloj(s.segundos)})`).join(' · ')}` : '';
  };
  /** Suma el tiempo del ejercicio en el que se estaba escribiendo. */
  const cerrarTramo = () => {
    if (!estado || activo < 0) return;
    estado.tiempos[activo] = (estado.tiempos[activo] ?? 0) + (Date.now() - desde) / 1000;
    desde = Date.now();
    guardarEstado(estado);
  };

  const pintarExamen = () => {
    if (!estado) return;
    preguntas = preguntasSimulacro(estado.semilla, estado.total, estado.periodos);
    lista.innerHTML = preguntas.map(tarjetaHtml).join('');
    for (const [campo, valor] of Object.entries(estado.respuestas)) {
      const c = lista.querySelector<HTMLInputElement | HTMLSelectElement>(`[data-simex-campo="${campo}"]`);
      if (c) c.value = valor;
    }
    lista.querySelectorAll('select').forEach((s) => s.dispatchEvent(new Event('change', { bubbles: true })));
    $('[data-simex-num]').textContent = `Simulacro nº ${estado.semilla} · ${estado.total} ejercicios`;
    config.hidden = true;
    resultado.hidden = true;
    examen.hidden = false;
    reloj.mostrar(estado.inicio, estado.minutos);
  };

  const corregir = () => {
    if (!estado) return;
    cerrarTramo();
    estado.fin = Date.now();
    reloj.parar();
    const fallos: CuentaFallos = { lectura: 0, eleccion: 0, unidades: 0, calculo: 0 };
    let aciertos = 0;
    const filas = preguntas.map((p, k) => {
      const lab = LABORATORIOS[p.formula]!;
      const r = (c: string) => estado!.respuestas[`${c}:${k}`] ?? '';
      const f = r('formula');
      const formulaBien = f === p.formula || Object.values(DERIVACIONES).flat().some((x) => x.hacia === p.formula && x.desde === f);
      const vacio = !r('resultado').trim();
      const tipo: TipoFallo | null = !vacio
        ? diagnosticar({ lecturaBien: r('incognita') === lab.incognita.simbolo, formulaBien, resultado: r('resultado') }, lab, p.ejercicio.datos, p.ejercicio.periodicidad)
        : (r('incognita') && r('incognita') !== lab.incognita.simbolo ? 'lectura' : f && !formulaBien ? 'eleccion' : 'calculo');
      // Sin resultado: no se diagnostica (salvo que lo leído o la fórmula ya delaten el fallo).
      const sinResponder = vacio && !(r('incognita') && r('incognita') !== lab.incognita.simbolo) && !(f && !formulaBien);
      if (sinResponder) { /* cuenta como fallo, sin tipo */ } else if (tipo) { fallos[tipo]++; anotarFallo(tipo); } else aciertos++;
      const valores: Record<string, number> = {};
      for (const d of lab.datos) { const l = leerDato(p.ejercicio.datos[d.simbolo] ?? '', d.magnitud); if (l.ok === true) valores[d.simbolo] = l.valor; }
      const x = esperado(lab, valores);
      const fx = formulaPorId(p.formula)!;
      return `<tr class="${sinResponder || tipo ? 't2-simex-mal' : 't2-simex-bien'}"><th scope="row">${k + 1}</th>
        <td>${sinResponder ? '✗ <b>Sin responder</b>' : tipo ? `✗ <b>${escaparHtml(NOMBRE_FALLO[tipo])}</b>` : '✓ <b>Bien</b>'}</td>
        <td>${escaparHtml(r('resultado') || '—')}</td>
        <td>${formulaHtml(lab.incognita.simbolo)} = ${x === null ? '—' : escaparHtml(mostrar(x, lab.incognita.magnitud))}<small><a href="${hrefFormula(p.formula)}">Fórmula ${fx.numero}: ${formulaHtml(fx.expresion)}</a></small></td>
        <td>${formatoReloj(estado!.tiempos[k] ?? 0)}</td></tr>`;
    }).join('');
    const nota = Math.round((aciertos / preguntas.length) * 100) / 10;
    const segundos = Math.round((estado.fin - estado.inicio) / 1000);
    anotarSimulacro({ fecha: new Date().toISOString().slice(0, 10), nota, aciertos, total: preguntas.length, segundos, minutos: estado.minutos, fallos });
    const peor = (Object.entries(fallos) as [TipoFallo, number][]).sort((a, b) => b[1] - a[1])[0]!;
    resultado.innerHTML = `<h3>Nota: ${nota.toFixed(1).replace('.', ',')} <small>${aciertos} de ${preguntas.length} · ${formatoReloj(segundos)} de ${estado.minutos} min</small></h3>
      ${peor[1] ? `<p class="t2-simex-consejo"><b>Donde más fallas: ${escaparHtml(NOMBRE_FALLO[peor[0]].toLowerCase())}.</b> ${escaparHtml(CONSEJO_FALLO[peor[0]])}</p>` : '<p class="t2-simex-consejo"><b>Todo bien.</b> Prueba con menos tiempo o con más periodos.</p>'}
      <div class="t2-simex-tabla"><table><thead><tr><th scope="col">Nº</th><th scope="col">Resultado</th><th scope="col">Tu respuesta</th><th scope="col">Solución</th><th scope="col">Tiempo</th></tr></thead><tbody>${filas}</tbody></table></div>
      <button type="button" class="btn-principal" data-simex-otro>Otro simulacro</button>`;
    resultado.hidden = false;
    examen.hidden = true;
    config.hidden = true;
    guardarEstado(null);
    estado = null;
    pintarHistorial();
    resultado.scrollIntoView({ block: 'start' });
  };

  const alEnviar = (ev: Event) => {
    ev.preventDefault();
    const datos = new FormData(config);
    const minutos = Number(datos.get('simex-min')) || 45;
    try { localStorage.setItem(CLAVE_MINUTOS, String(minutos)); } catch { /* sin almacenamiento */ }
    estado = { semilla: Math.floor(Math.random() * 99991) + 1, total: Number(datos.get('simex-n')) || 5, minutos, periodos: datos.get('simex-periodos') === 'on', inicio: Date.now(), respuestas: {}, tiempos: [] };
    guardarEstado(estado);
    pintarExamen();
    lista.querySelector<HTMLElement>('select, input')?.focus();
  };
  const alEscribir = (ev: Event) => {
    const c = (ev.target as Element).closest<HTMLInputElement | HTMLSelectElement>('[data-simex-campo]');
    if (!c || !estado) return;
    estado.respuestas[c.dataset.simexCampo!] = c.value;
    guardarEstado(estado);
  };
  const alEntrar = (ev: Event) => {
    const ej = (ev.target as Element).closest<HTMLElement>('[data-simex-ej]');
    if (!ej || !estado) return;
    const k = Number(ej.dataset.simexEj);
    if (k === activo) return;
    cerrarTramo();
    activo = k;
    desde = Date.now();
  };
  const alPulsar = (ev: Event) => {
    const b = (ev.target as Element).closest<HTMLElement>('button');
    if (!b || !caja.contains(b)) return;
    if (b.hasAttribute('data-simex-cal')) {
      // La calculadora flota en una esquina y se abre o cierra sin perder de vista los enunciados.
      const panel = $('[data-simex-calpanel]');
      panel.hidden = !panel.hidden;
      b.setAttribute('aria-expanded', String(!panel.hidden));
      if (!panel.hidden) panel.querySelector<HTMLInputElement>('input')?.focus();
      return;
    }
    if (b.hasAttribute('data-simex-entregar')) {
      const vacios = preguntas.filter((_, k) => !(estado?.respuestas[`resultado:${k}`] ?? '').trim()).length;
      if (vacios && !window.confirm(`Te quedan ${vacios} ejercicio(s) sin resultado. ¿Entregar igualmente?`)) return;
      corregir();
    } else if (b.hasAttribute('data-simex-abandonar')) {
      if (!window.confirm('¿Abandonar el simulacro? No se guardará la nota.')) return;
      guardarEstado(null);
      estado = null;
      reloj.ocultar();
      examen.hidden = true;
      config.hidden = false;
    } else if (b.hasAttribute('data-simex-otro')) {
      resultado.hidden = true;
      config.hidden = false;
      config.scrollIntoView({ block: 'start' });
    }
  };
  config.addEventListener('submit', alEnviar);
  lista.addEventListener('input', alEscribir);
  lista.addEventListener('change', alEscribir);
  lista.addEventListener('focusin', alEntrar);
  caja.addEventListener('click', alPulsar);
  paradas.push(() => {
    cerrarTramo();
    config.removeEventListener('submit', alEnviar);
    lista.removeEventListener('input', alEscribir);
    lista.removeEventListener('change', alEscribir);
    lista.removeEventListener('focusin', alEntrar);
    caja.removeEventListener('click', alPulsar);
  });

  pintarHistorial();
  if (estado) pintarExamen();
  return () => paradas.forEach((p) => p());
}
