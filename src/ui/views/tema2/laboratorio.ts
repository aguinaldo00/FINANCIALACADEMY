/*
 * Laboratorio de una fórmula (el mismo para las 19): el cuaderno a la izquierda, la animación en el
 * centro (se amplía sin salir de la página) y la calculadora a la derecha. El selector
 * DIGITAL/ANALÓGICO cambia la forma del cuaderno y de la calculadora, no el ejercicio: los dos modos
 * escriben en el mismo estado (cada campo tiene su data-campo y todos los que lo comparten se
 * mantienen iguales) y usan el mismo motor de cálculo. En ANALÓGICO el cuaderno es papel pautado que
 * sube desde detrás de la animación; ocultarlo no borra nada.
 *
 * El ejercicio se elige arriba: el caso de la animación (Escena.caso), un ejercicio de práctica
 * generado (reproducible por su número) o los datos del alumno. Mientras se escribe no se corrige
 * nada ni se calcula nada por el alumno: todo se revisa al pulsar «Comprobar», paso a paso y sin
 * desvelar los valores. Lo escrito se guarda en este navegador, por fórmula.
 */
import { BLOQUES, FORMULAS_TEMA2, formulaPorId } from '../../../content/temas/tema-02/formulas.ts';
import { enunciadoExamen } from '../../../content/temas/tema-02/enunciados.ts';
import { simbolo } from '../../../content/temas/tema-02/simbolos.ts';
import { generarEjercicio, nuevaSemilla, type PeriodicidadEjercicio } from '../../../domain/tema2/generador.ts';
import { comprobar, esperado, LABORATORIOS, leerDato, type Magnitud } from '../../../domain/tema2/laboratorio.ts';
import { htmlCalculadora, montarCalculadora } from '../../components/calculadora.ts';
import { htmlHoja, montarHoja, refrescarHoja, simboloDeNombre } from '../../components/hojaCalculo.ts';
import { montarSelectoresFormula, selectorFormulasHtml, sincronizarSelectoresFormula } from '../../components/selectorFormulas.ts';
import { formatoReloj, htmlRelojExamen, minutosGuardados, montarRelojExamen } from '../../components/relojExamen.ts';
import { anotarFallo, anotarTiempo, CONSEJO_FALLO, diagnosticar, NOMBRE_FALLO } from '../../../domain/tema2/diagnostico.ts';
import { expandir } from '../../components/reproductorExpandido.ts';
import { ESCENAS } from '../../escenas/index.ts';
import { formulaTexto, simbolosDe } from '../../matematica/formula.ts';
import { asegurarGrano, ruido } from '../../motion/papel.ts';
import { montarReproductor } from '../../motion/reproductor.ts';
import { escaparHtml, formulaHtml } from './comun.ts';
import { DERIVACIONES } from './indice.ts';

type Modo = 'digital' | 'analogico';
type Ejercicio = 'animacion' | 'practica' | 'examen' | 'examen-real' | 'propio';
const CLAVE_MODO = 'fa-lab-modo';
const CLAVE_PERIODOS = 'fa-lab-todos-periodos';
const CLAVE_REDACTADO = 'fa-lab-enunciado-redactado';
const claveEstado = (id: string) => `fa-lab:${id}`;

/** Datos que pide la fórmula: los de su laboratorio o, si no calcula una incógnita, todos sus símbolos. */
function datosDe(id: string): { simbolo: string; magnitud: Magnitud }[] {
  const lab = LABORATORIOS[id];
  if (lab) return [...lab.datos];
  return simbolosDe(formulaPorId(id)!.expresion).map((s) => ({ simbolo: s, magnitud: 'euros' as const }));
}

/** Ayuda de cada celda: dice CÓMO escribir el dato, nunca cuál es. */
const PISTA_DATO: Record<Magnitud, string> = { euros: 'importe', tipo: 'con % o en tanto por uno', tiempo: 'en la unidad del tipo', partes: 'partes del año' };
/** Unidad de cada dato, para reconocerlo de un vistazo. n va en la unidad del tipo (homogeneidad). */
const UNIDAD: Record<Magnitud, { texto: string; titulo: string }> = {
  euros: { texto: '€', titulo: 'euros' },
  tipo: { texto: '%', titulo: 'con el signo % o en tanto por uno' },
  tiempo: { texto: 'periodos', titulo: 'en la misma unidad que el tipo: años si el tipo es anual' },
  partes: { texto: 'm', titulo: 'partes del año' },
};

/** Qué es cada paso que cuesta: se explica cómo se hace, sin dar la respuesta. */
const AYUDA_DESPEJE = 'Despejar es dejar sola la incógnita a un lado del igual, haciendo lo mismo en los dos lados: lo que suma pasa restando, lo que multiplica pasa dividiendo y un exponente pasa como raíz (o con logaritmos si la incógnita está en el exponente). Si la fórmula ya empieza por la incógnita, no hace falta despejar: cópiala tal cual.';
const AYUDA_SUSTITUCION = 'Sustituir es escribir la fórmula ya despejada cambiando cada letra por su número, sin operar todavía: los tipos en tanto por uno (7 % → 0,07) y n en la misma unidad que el tipo. Después se opera en la calculadora.';
/** Qué se escribe en cada línea, con un ejemplo de OTRA fórmula (la 1): enseña la forma, no la respuesta. */
const QUE_ESCRIBIR = {
  despeje: { que: 'Escribe la fórmula con la incógnita sola a la izquierda del igual. Solo letras, todavía sin números.', ejemplo: 'Con otra fórmula: de I = C₀ · n · i, si te piden n → n = I / (C₀ · i)' },
  sustitucion: { que: 'Copia la fórmula despejada y cambia cada letra por su dato, sin operar todavía.', ejemplo: 'Siguiendo el ejemplo, con I = 600 €, C₀ = 5.000 € e i = 4 %: n = 600 / (5.000 · 0,04)' },
};
export const queEscribir = (paso: keyof typeof QUE_ESCRIBIR) =>
  `<p class="lab-que">${escaparHtml(QUE_ESCRIBIR[paso].que)}</p><p class="lab-ejemplo"><span>Ejemplo</span>${escaparHtml(QUE_ESCRIBIR[paso].ejemplo)}</p>`;

/**
 * Borde de papel rasgado: un polígono con pequeñas irregularidades (más en los bordes de arriba y
 * abajo, que son los cortados a mano). Determinista: la misma semilla da siempre el mismo corte.
 */
export function bordeRasgado(semilla: number): string {
  const p: string[] = [];
  const j = (k: number, a: number) => Math.abs(ruido(semilla, k)) * a;
  for (let k = 0; k <= 16; k++) p.push(`${(k * 100) / 16}% ${j(k, 2.2).toFixed(2)}%`);
  for (let k = 1; k < 6; k++) p.push(`${(100 - j(40 + k, 0.7)).toFixed(2)}% ${(k * 100) / 6}%`);
  for (let k = 16; k >= 0; k--) p.push(`${(k * 100) / 16}% ${(100 - j(80 + k, 3)).toFixed(2)}%`);
  for (let k = 5; k > 0; k--) p.push(`${j(120 + k, 0.7).toFixed(2)}% ${(k * 100) / 6}%`);
  return `polygon(${p.join(',')})`;
}

/** La fórmula como pieza de cartulina: papel con grano y fibras, borde rasgado, cinta y sombra. */
export function cartulinaHtml(expresion: string, semilla: number): string {
  return `<div class="lab-cartulina"><span class="lab-cinta" aria-hidden="true"></span>
    <div class="lab-cartulina-papel ed-sobre-papel" style="clip-path:${bordeRasgado(semilla)}"><p class="t2-ficha-fx">${formulaHtml(expresion)}</p></div></div>`;
}

const campo = (nombre: string, etiqueta: string, pista: string) =>
  `<input class="lab-campo" type="text" data-campo="${nombre}" aria-label="${escaparHtml(etiqueta)}" placeholder="${escaparHtml(pista)}" autocomplete="off" spellcheck="false">`;

const ayuda = (texto: string) => `<details class="lab-ayuda"><summary>¿Qué es?</summary><p>${escaparHtml(texto)}</p></details>`;

function filaDatos(id: string, papel: boolean): string {
  const guiados = `<div class="lab-datos" data-lab-datos-fijos>${datosDe(id).map((d) => {
    const u = UNIDAD[d.magnitud];
    return `<label class="lab-dato"><span class="lab-sim">${formulaHtml(d.simbolo)}${papel ? ' =' : ''}</span>
    <span class="lab-dato-celda">${campo(`dato:${d.simbolo}`, `${simbolo(d.simbolo)?.nombre ?? d.simbolo} (${u.titulo})`, PISTA_DATO[d.magnitud])}<abbr class="lab-unidad" title="${escaparHtml(u.titulo)}">${u.texto}</abbr></span></label>`;
  }).join('')}</div>`;
  if (!papel) return guiados;
  return `${guiados}<div class="lab-variables-manuales" data-lab-datos-manuales hidden>
    <div class="lab-variables-filas" data-lab-variables-filas>${filasVariablesManuales(3)}</div>
    <div class="lab-variables-acciones"><button type="button" data-lab-variable-mas>+ Añadir variable</button><button type="button" data-lab-variable-limpiar>Borrar variables</button></div>
  </div>`;
}

function filaVariableManual(k: number): string {
  return `<div class="lab-variable-fila" data-lab-variable-fila="${k}">
    <input class="lab-campo" type="text" data-campo="manual:nombre:${k}" aria-label="Nombre de la variable ${k + 1}" placeholder="Variable" autocomplete="off" spellcheck="false">
    <input class="lab-campo" type="text" data-campo="manual:valor:${k}" aria-label="Valor de la variable ${k + 1}" placeholder="Valor" autocomplete="off" spellcheck="false">
    <button type="button" class="lab-variable-quitar" data-lab-variable-quitar aria-label="Eliminar variable ${k + 1}" title="Eliminar variable">×</button></div>`;
}

function filasVariablesManuales(cantidad: number): string {
  return Array.from({ length: Math.max(1, Math.min(20, cantidad)) }, (_, k) => filaVariableManual(k)).join('');
}

function selectorIncognita(id: string): string {
  const f = formulaPorId(id)!;
  const opciones = simbolosDe(f.expresion).map((s) => `<option value="${s}">${escaparHtml(formulaTexto(s))} · ${escaparHtml(simbolo(s)?.nombre ?? s)}</option>`).join('');
  return `<select class="lab-campo" data-campo="incognita" data-lab-incognita-select aria-label="Incógnita"><option value="">¿Qué te piden?</option>${opciones}</select>
    <input class="lab-campo" type="text" data-campo="incognita" data-lab-incognita-text aria-label="Qué te piden" placeholder="¿Qué te piden?" autocomplete="off" spellcheck="false" hidden>`;
}

/** Desplegable con las 19 fórmulas del tema, por bloques: se elige la que se va a usar sin salir de la página. */
function selectorFormula(): string {
  const grupos = BLOQUES.map((b) => `<optgroup label="${escaparHtml(b.titulo)}">${FORMULAS_TEMA2.filter((f) => f.bloque === b.id).map((f) => `<option value="${f.id}">Nº ${f.numero} — ${escaparHtml(formulaTexto(f.expresion))}</option>`).join('')}</optgroup>`).join('');
  return `${selectorFormulasHtml(`<select class="lab-campo lab-campo-formula" data-campo="formula" data-lab-formula-select aria-label="Fórmula que vas a usar"><option value="">Elige la fórmula…</option>${grupos}</select>`)}
    <input class="lab-campo" type="text" data-campo="formula" data-lab-formula-text aria-label="Fórmula escrita" placeholder="Escribe la fórmula que usarás" autocomplete="off" spellcheck="false" hidden><p class="lab-formula-elegida" data-lab-formula-elegida></p>`;
}

/** Los pasos del cuaderno; `papel` cambia solo la forma (papel pautado y letra manuscrita). */
function pasos(id: string, papel: boolean): string {
  const fila = (n: number, paso: string, titulo: string, cuerpo: string) =>
    `<li class="lab-paso lab-paso-${paso}" data-paso="${paso}"><span class="lab-paso-n" aria-hidden="true">${n}</span><div class="lab-paso-cuerpo"><p class="lab-paso-tit">${titulo}${papel ? ':' : ''}</p>${cuerpo}<p class="lab-paso-nota" data-nota="${paso}"></p></div></li>`;
  return `<ol class="lab-pasos">
    ${fila(1, 'datos', 'Datos', filaDatos(id, papel))}
    ${fila(2, 'incognita', 'Incógnita', selectorIncognita(id))}
    ${fila(3, 'formula', 'Fórmula', selectorFormula())}
    ${fila(4, 'despeje', 'Despeje (opcional)', `${queEscribir('despeje')}${campo('despeje', 'Despeje opcional', 'Incógnita = … (solo letras)')}${ayuda(AYUDA_DESPEJE)}`)}
    ${fila(5, 'sustitucion', 'Sustitución (opcional)', `${queEscribir('sustitucion')}${campo('sustitucion', 'Sustitución opcional', 'Incógnita = … (con tus números)')}${ayuda(AYUDA_SUSTITUCION)}`)}
    ${fila(6, 'operaciones', 'Operaciones', `<textarea class="lab-campo" data-campo="operaciones" rows="3" aria-label="Operaciones" placeholder="Una operación por línea" spellcheck="false"></textarea>`)}
    ${fila(7, 'resultado', 'Resultado', `<div class="lab-resultado">${campo('resultado', 'Resultado', 'Tu resultado')}<button type="button" class="lab-comprobar" data-lab-comprobar>Comprobar</button></div>`)}
  </ol>
  <div class="lab-revision" data-lab-revision aria-live="polite"></div>`;
}

// La hoja de cálculo (modo digital) es un componente compartido con la fase D.
export { formaDespejada, sustitucion } from '../../components/hojaCalculo.ts';

/** Enunciado con unos datos y la incógnita de la fórmula (sin inventar nada más). */
function enunciado(id: string, datos: Readonly<Record<string, string>>, periodicidad?: PeriodicidadEjercicio): string {
  const lab = LABORATORIOS[id];
  if (!lab) return '';
  const adj: Record<PeriodicidadEjercicio['unidad'], string> = { año: 'anual', semestre: 'semestral', cuatrimestre: 'cuatrimestral', trimestre: 'trimestral', mes: 'mensual', dia: 'diario' };
  const anuales = id === 'simple-fraccionado' || id === 'compuesta-equivalentes' || id === 'compuesta-tae';
  // Cada dato va entero en una línea (símbolo, signo y cifra) y la pregunta en la suya: así se lee de un vistazo.
  const partes = lab.datos.map((d) => {
    const plural: Record<PeriodicidadEjercicio['unidad'], string> = { año: 'años', semestre: 'semestres', cuatrimestre: 'cuatrimestres', trimestre: 'trimestres', mes: 'meses', dia: 'días' };
    const unidadDato = periodicidad && d.simbolo === 'n' ? ` ${plural[periodicidad.unidad]}` : '';
    const baseDia = periodicidad?.unidad === 'dia' && !anuales ? ` (año ${periodicidad.convenio === 360 ? 'comercial de 360 días' : 'civil de 365 días'})` : '';
    const tipoDato = periodicidad && ['i', 'd'].includes(d.simbolo) ? ` ${anuales ? 'anual' : `${adj[periodicidad.unidad]}${baseDia}`}` : d.simbolo === 'J_m' && periodicidad ? ' anual nominal' : '';
    const frecuencia = periodicidad && d.simbolo === 'm' ? ` (${periodicidad.unidad === 'dia' ? 'diaria' : adj[periodicidad.unidad]}; ${periodicidad.m} al año${periodicidad.unidad === 'dia' ? `, año ${periodicidad.convenio === 360 ? 'comercial de 360 días' : 'civil de 365 días'}` : ''})` : '';
    const valor = `${datos[d.simbolo] ?? '?'}${unidadDato}${tipoDato}${frecuencia}`;
    return `<span class="lab-caso-dato">${formulaHtml(d.simbolo)} = <b>${escaparHtml(valor)}</b></span>`;
  });
  const lista = partes.length > 1 ? `${partes.slice(0, -1).join(', ')} y ${partes.at(-1)}` : partes[0];
  const inc = lab.incognita.simbolo;
  return `<span class="lab-caso-datos">Te dan ${lista}.</span> <span class="lab-caso-pide">Calcula ${formulaHtml(inc)}, ${escaparHtml((simbolo(inc)?.nombre ?? inc).toLowerCase())}.</span>`;
}

export { enunciadoColoreado } from './enunciadoMarcado.ts';
import { enunciadoColoreado } from './enunciadoMarcado.ts';

export function htmlLaboratorio(id: string): string {
  const escena = ESCENAS[id];
  const calcula = Boolean(LABORATORIOS[id]);
  const hayCaso = Boolean(escena?.caso && calcula);
  return `<div class="lab" data-laboratorio="${id}" data-modo="digital" data-ejercicio="${hayCaso ? 'animacion' : 'propio'}" role="region" aria-label="Cuadro de mando">
    <div class="lab-barra">
      ${calcula ? `<div class="lab-ejercicios" role="group" aria-label="Qué ejercicio resolver">
        ${hayCaso ? '<button type="button" data-lab-ejercicio="animacion">Caso de la animación</button>' : ''}
        <button type="button" data-lab-ejercicio="practica">Ejercicio aleatorio</button>
        <button type="button" data-lab-ejercicio="propio">Mis datos</button>
        <button type="button" data-lab-ejercicio="examen">Práctica</button>
        <button type="button" data-lab-ejercicio="examen-real">Examen real</button>
      </div>` : ''}
      <div class="lab-opciones">
        <label class="lab-periodos" data-lab-periodos-control hidden title="Alterna anual, semestral, cuatrimestral, trimestral, mensual y diario">
          <input type="checkbox" role="switch" data-lab-todos-periodos aria-label="Incluir varios periodos de interés">
          <span class="lab-periodos-interruptor" aria-hidden="true"><span></span></span>
          <span class="lab-periodos-texto"><b>Todos los tipos de interés</b><small>Alterna anual, semestral, cuatrimestral, trimestral, mensual y diario</small></span>
        </label>
        <label class="lab-periodos lab-redactado" data-lab-redactado-control hidden title="Como en el examen, con cada dato en su color">
          <input type="checkbox" role="switch" data-lab-redactado aria-label="Enunciado redactado">
          <span class="lab-periodos-interruptor" aria-hidden="true"><span></span></span>
          <span class="lab-periodos-texto"><b>Enunciado redactado</b><small>Como en el examen, con cada dato en su color</small></span>
        </label>
      </div>
      <div class="lab-caso" role="region" aria-label="Enunciado del ejercicio">
        <p class="lab-caso-volanta" data-lab-caso-origen>${calcula ? '' : 'Cuaderno libre'}</p>
        ${calcula ? htmlRelojExamen() : ''}
        <p class="lab-caso-texto" data-lab-caso-texto>${calcula ? '' : 'Esta fórmula compara o liquida importes: usa el cuaderno y la calculadora con tus datos.'}</p>
        <button type="button" class="lab-pista" data-lab-pista hidden>Ver una pista</button>
        <button type="button" class="lab-mini lab-compartir" data-lab-compartir hidden title="Copia un enlace que abre este mismo ejercicio (para hacerlo toda la clase a la vez)">Copiar enlace a este ejercicio</button>
        <p class="lab-pista-texto" data-lab-pista-texto hidden></p>
        <button type="button" class="lab-boton lab-otro" data-lab-otro hidden><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="3.5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="9" cy="9" r="1.5"/><circle cx="15" cy="15" r="1.5"/><circle cx="15" cy="9" r="1.5"/><circle cx="9" cy="15" r="1.5"/></svg>Generar otro ejercicio</button>
      </div>
      <div class="lab-modo" role="group" aria-label="Forma de trabajar">
        <button type="button" data-lab-modo="digital" aria-pressed="true">Digital</button>
        <button type="button" data-lab-modo="analogico" aria-pressed="false">Analógico</button>
      </div>
    </div>
    <section class="lab-panel lab-cuaderno" aria-labelledby="lab-cuaderno-tit">
      <header class="lab-panel-cab"><h2 id="lab-cuaderno-tit"><span>01</span>Hoja de cálculo</h2>
        <span class="lab-cab-acciones"><button type="button" class="lab-mini" data-lab-imprimir title="Imprime el enunciado y el cuaderno, o guárdalos como PDF">Imprimir / PDF</button><button type="button" class="lab-mini" data-lab-limpiar>Borrar</button></span></header>
      <div data-lab-hoja-sitio></div>
    </section>
    <div class="lab-centro">
      <div class="lab-papel-marco" data-lab-papel-marco>
        <div class="lab-papel-pliegue"><div class="lab-papel" data-lab-papel aria-hidden="true">
          <header class="lab-panel-cab"><h2><span>02</span>Cuaderno de papel</h2><span class="lab-cab-acciones"><button type="button" class="lab-mini" data-lab-imprimir title="Imprime el enunciado y el cuaderno, o guárdalos como PDF">Imprimir / PDF</button><button type="button" class="lab-mini" data-lab-limpiar>Borrar el cuaderno</button></span></header>
          ${pasos(id, true)}
        </div></div>
      </div>
      <figure class="lab-escena" data-lab-escena aria-label="Animación de la fórmula">
        <div class="lab-escena-medio" data-vx-medio><div data-escena-ficha="${id}"></div></div>
        <figcaption class="lab-escena-pie">
          <span class="lab-escena-nota" data-lab-escena-nota></span>
          <span class="lab-escena-botones">
            <button type="button" class="lab-boton lab-boton-papel" data-lab-abrir-papel aria-expanded="false">Cuaderno de papel</button>
            ${escena ? '<button type="button" class="lab-boton" data-lab-ampliar aria-haspopup="dialog"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>Ampliar animación</button>' : ''}
          </span>
        </figcaption>
        <div class="lab-crt-apagado" aria-hidden="true"><span>SIN SEÑAL</span></div>
      </figure>
    </div>
    <button type="button" class="lab-ir-calc" data-lab-ir-calc>Calculadora ↓</button>
    <section class="lab-panel lab-calculadora" aria-labelledby="lab-cal-tit">
      <header class="lab-panel-cab"><h2 id="lab-cal-tit"><span>03</span>Calculadora</h2></header>
      ${htmlCalculadora()}
    </section>
  </div>`;
}

export function montarLaboratorio(raiz: HTMLElement): () => void {
  const lab = raiz.querySelector<HTMLElement>('[data-laboratorio]');
  if (!lab) return () => {};
  asegurarGrano();
  const id = lab.dataset.laboratorio!;
  const definicion = LABORATORIOS[id];
  const escena = ESCENAS[id];
  const caso = definicion ? escena?.caso : undefined;
  const datos = datosDe(id);
  const paradas: (() => void)[] = [];
  // Selector de fórmulas del cuaderno de papel (el de la hoja digital lo monta la hoja).
  const papelFormula = lab.querySelector<HTMLElement>('[data-lab-papel]');
  if (papelFormula) paradas.push(montarSelectoresFormula(papelFormula));

  // Estado compartido por los dos modos, guardado por fórmula.
  let estado: Record<string, string> = {};
  try { estado = JSON.parse(localStorage.getItem(claveEstado(id)) ?? '{}') as Record<string, string>; } catch { estado = {}; }
  // Enlace a un ejercicio concreto (el que comparte la profesora): «#tema/2/f/<id>?ejercicio=examen-real&n=12345».
  // Abre ese ejercicio con el cuaderno limpio; el resto de la página sigue igual.
  const consulta = new URLSearchParams(location.hash.split('?')[1]?.split('#')[0] ?? '');
  const compartido = consulta.get('ejercicio');
  if (compartido && ['practica', 'examen', 'examen-real'].includes(compartido) && Number(consulta.get('n')) > 0) {
    estado = { ejercicio: compartido, semilla: String(Math.trunc(Number(consulta.get('n')))) };
    if (consulta.get('periodos') === '1') try { localStorage.setItem(CLAVE_PERIODOS, 'true'); } catch { /* sin almacenamiento */ }
    try { localStorage.setItem(claveEstado(id), JSON.stringify(estado)); } catch { /* sin almacenamiento */ }
  }
  let redactado = true;
  try { redactado = localStorage.getItem(CLAVE_REDACTADO) !== 'false'; } catch { redactado = true; }
  let todosLosPeriodos = false;
  try { todosLosPeriodos = localStorage.getItem(CLAVE_PERIODOS) === 'true'; } catch { todosLosPeriodos = false; }
  const guardar = () => { try { localStorage.setItem(claveEstado(id), JSON.stringify(estado)); } catch { /* sin almacenamiento: se trabaja igual */ } };
  const campos = (nombre: string) => [...lab.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(`[data-campo="${nombre}"]`)];

  const leerFilasManual = () => [...lab.querySelectorAll<HTMLElement>('[data-lab-variable-fila]')].map((fila) => {
    const k = fila.dataset.labVariableFila!;
    return { nombre: estado[`manual:nombre:${k}`] ?? '', valor: estado[`manual:valor:${k}`] ?? '' };
  });
  const pintarFilasManual = (filas = leerFilasManual()) => {
    const cuerpo = lab.querySelector<HTMLElement>('[data-lab-variables-filas]');
    if (!cuerpo) return;
    const cantidadGuardada = Math.max(1, Number.parseInt(estado['manual:filas'] ?? '3', 10) || 3);
    const cantidad = Math.min(20, Math.max(cantidadGuardada, filas.length, ...Object.keys(estado).flatMap((k) => {
      const m = /^manual:(?:nombre|valor):(\d+)$/.exec(k);
      return m && estado[k] ? [Number(m[1]) + 1] : [];
    })));
    cuerpo.innerHTML = filasVariablesManuales(cantidad);
    for (let k = 0; k < cantidad; k++) {
      const nombre = cuerpo.querySelector<HTMLInputElement>(`[data-campo="manual:nombre:${k}"]`);
      const valor = cuerpo.querySelector<HTMLInputElement>(`[data-campo="manual:valor:${k}"]`);
      if (nombre) nombre.value = filas[k]?.nombre ?? estado[`manual:nombre:${k}`] ?? '';
      if (valor) valor.value = filas[k]?.valor ?? estado[`manual:valor:${k}`] ?? '';
    }
    estado['manual:filas'] = String(cantidad);
  };
  const reconstruirFilasManual = (filas: { nombre: string; valor: string }[]) => {
    for (let k = 0; k < 20; k++) {
      delete estado[`manual:nombre:${k}`];
      delete estado[`manual:valor:${k}`];
    }
    const cantidad = Math.max(1, Math.min(20, filas.length));
    estado['manual:filas'] = String(cantidad);
    for (let k = 0; k < cantidad; k++) {
      estado[`manual:nombre:${k}`] = filas[k]?.nombre ?? '';
      estado[`manual:valor:${k}`] = filas[k]?.valor ?? '';
    }
    pintarFilasManual(filas);
    guardar();
  };

  const ejercicio = (): Ejercicio => {
    const e = estado.ejercicio as Ejercicio | undefined;
    if (!definicion) return 'propio';
    if (e === 'animacion' && !caso) return 'practica';
    return e ?? (caso ? 'animacion' : 'practica');
  };
  const semilla = () => Number(estado.semilla) || 1;
  const ejercicioGenerado = () => generarEjercicio(id, semilla(), { todosLosPeriodos });
  /** Datos del enunciado del ejercicio elegido (ninguno si son los del alumno). */
  const datosEnunciado = (): Readonly<Record<string, string>> | null => {
    const e = ejercicio();
    if (e === 'animacion') return caso ?? null;
    if (e === 'practica' || e === 'examen' || e === 'examen-real') return ejercicioGenerado()?.datos ?? null;
    return null;
  };
  const periodicidadEnunciado = () => ejercicioGenerado()?.periodicidad;
  const leerValores = (fuente: (s: string) => string | undefined): Record<string, number> => {
    const v: Record<string, number> = {};
    for (const d of datos) {
      const l = leerDato(fuente(d.simbolo) ?? '', d.magnitud);
      if (l.ok === true) v[d.simbolo] = l.valor;
    }
    return v;
  };
  /** Valores escritos en el cuaderno (para la calculadora). */
  const valores = () => leerValores((s) => estado[`dato:${s}`]);

  /** Barra del ejercicio: qué se resuelve y qué enseña la animación. */
  const pintarEjercicio = () => {
    const e = ejercicio();
    lab.dataset.ejercicio = e;
    lab.querySelectorAll<HTMLButtonElement>('[data-lab-ejercicio]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.labEjercicio === e)));
    const origen = lab.querySelector<HTMLElement>('[data-lab-caso-origen]')!;
    const texto = lab.querySelector<HTMLElement>('[data-lab-caso-texto]')!;
    const otro = lab.querySelector<HTMLButtonElement>('[data-lab-otro]')!;
    const pista = lab.querySelector<HTMLButtonElement>('[data-lab-pista]')!;
    const pistaTexto = lab.querySelector<HTMLElement>('[data-lab-pista-texto]')!;
    const controlPeriodos = lab.querySelector<HTMLElement>('[data-lab-periodos-control]')!;
    const togglePeriodos = lab.querySelector<HTMLInputElement>('[data-lab-todos-periodos]')!;
    const nota = lab.querySelector<HTMLElement>('[data-lab-escena-nota]')!;
    if (!definicion) return;
    const d = datosEnunciado();
    const periodicidad = periodicidadEnunciado();
    otro.hidden = e !== 'practica' && e !== 'examen' && e !== 'examen-real';
    const compartir = lab.querySelector<HTMLElement>('[data-lab-compartir]');
    if (compartir) { compartir.hidden = otro.hidden; compartir.textContent = 'Copiar enlace a este ejercicio'; }
    pista.hidden = e !== 'examen';
    pistaTexto.hidden = true;
    controlPeriodos.hidden = e !== 'practica' && e !== 'examen' && e !== 'examen-real';
    togglePeriodos.checked = todosLosPeriodos;
    const controlRedactado = lab.querySelector<HTMLElement>('[data-lab-redactado-control]');
    if (controlRedactado) controlRedactado.hidden = e !== 'animacion' && e !== 'practica';
    const toggleRedactado = lab.querySelector<HTMLInputElement>('[data-lab-redactado]');
    if (toggleRedactado) toggleRedactado.checked = redactado;
    const conColor = (datosEj: Readonly<Record<string, string>>, p?: PeriodicidadEjercicio) => (redactado ? enunciadoColoreado(id, datosEj, p) : null) ?? enunciado(id, datosEj, p);
    const examenManual = e === 'examen-real' && lab.dataset.modo === 'analogico';
    const datosFijos = lab.querySelector<HTMLElement>('[data-lab-datos-fijos]');
    const datosManuales = lab.querySelector<HTMLElement>('[data-lab-datos-manuales]');
    if (datosFijos) datosFijos.hidden = examenManual;
    if (datosManuales) datosManuales.hidden = !examenManual;
    const incSelect = lab.querySelector<HTMLElement>('[data-lab-incognita-select]');
    const incTexto = lab.querySelector<HTMLElement>('[data-lab-incognita-text]');
    const formulaSelect = lab.querySelector<HTMLElement>('[data-lab-formula-select]');
    const formulaTexto = lab.querySelector<HTMLElement>('[data-lab-formula-text]');
    if (incSelect) incSelect.hidden = examenManual;
    if (incTexto) incTexto.hidden = !examenManual;
    if (formulaSelect) formulaSelect.hidden = examenManual;
    sincronizarSelectoresFormula(lab);
    if (formulaTexto) formulaTexto.hidden = !examenManual;
    if (examenManual) pintarFilasManual();
    if (e === 'animacion') {
      origen.textContent = 'El caso de la animación';
      texto.innerHTML = conColor(d!);
      nota.textContent = '';
    } else if (e === 'practica') {
      origen.textContent = `Ejercicio aleatorio nº ${semilla()} · generado al azar`;
      texto.innerHTML = conColor(d!, periodicidad);
      nota.textContent = 'La animación enseña su caso de ejemplo; tu ejercicio tiene otros datos.';
    } else if (e === 'examen') {
      // Práctica con enunciado redactado y una única pista opcional.
      origen.textContent = `Práctica · ejercicio nº ${semilla()}`;
      texto.textContent = enunciadoExamen(id, d!, periodicidad) ?? enunciado(id, d!, periodicidad) ?? '';
      nota.textContent = 'La animación enseña su caso de ejemplo; tu ejercicio tiene otros datos.';
    } else if (e === 'examen-real') {
      // Evaluación estricta: el enunciado no etiqueta las variables y no ofrece pistas.
      origen.textContent = `Examen real · ejercicio nº ${semilla()}`;
      texto.textContent = enunciadoExamen(id, d!, periodicidad) ?? enunciado(id, d!, periodicidad) ?? '';
      nota.textContent = 'La animación queda apagada durante el examen.';
    } else {
      origen.textContent = 'Mis datos';
      texto.textContent = 'Escribe tus propios datos en el cuaderno: la calculadora y la comprobación usan los tuyos.';
      nota.textContent = 'La animación enseña su caso de ejemplo, no tus datos.';
    }
  };

  /** La fórmula elegida, escrita debajo del desplegable. */
  const pintarFormulaElegida = () => {
    const f = estado.formula ? formulaPorId(estado.formula) : undefined;
    lab.querySelectorAll<HTMLElement>('[data-lab-formula-elegida]').forEach((p) => { p.innerHTML = f ? formulaHtml(f.expresion) : ''; });
    sincronizarSelectoresFormula(lab);
  };

  /*
   * Reloj del examen real: arranca solo al abrir un examen (cada ejercicio nuevo empieza de cero) y
   * se para al comprobar o calcular el resultado. Inicio, minutos y final se guardan con el cuaderno.
   */
  const reloj = lab.querySelector('[data-lab-reloj]') ? montarRelojExamen(lab, (minutos) => {
    if (ejercicio() !== 'examen-real') return;
    estado['reloj:minutos'] = String(minutos);
    estado['reloj:inicio'] = String(Date.now());
    delete estado['reloj:fin'];
    guardar();
    sincronizarReloj();
  }) : null;
  if (reloj) paradas.push(() => reloj.desmontar());
  function sincronizarReloj(): void {
    if (!reloj) return;
    if (ejercicio() !== 'examen-real') return reloj.ocultar();
    if (!estado['reloj:inicio']) {
      estado['reloj:inicio'] = String(Date.now());
      estado['reloj:minutos'] = String(minutosGuardados());
      guardar();
    }
    const fin = estado['reloj:fin'] ? Number(estado['reloj:fin']) : undefined;
    reloj.mostrar(Number(estado['reloj:inicio']), Number(estado['reloj:minutos']) || minutosGuardados(), fin);
  }
  function pararReloj(): void {
    if (!reloj || ejercicio() !== 'examen-real' || estado['reloj:fin'] || !estado['reloj:inicio']) return;
    estado['reloj:fin'] = String(Date.now());
    guardar();
    reloj.parar();
  }

  const limpiarRevision = () => {
    lab.querySelectorAll<HTMLElement>('[data-paso]').forEach((li) => { delete li.dataset.revision; });
    lab.querySelectorAll<HTMLElement>('[data-nota]').forEach((n) => { n.textContent = ''; });
    lab.querySelectorAll<HTMLElement>('[data-lab-revision]').forEach((r) => { r.innerHTML = ''; r.className = 'lab-revision'; });
  };

  /**
   * Revisión al pulsar «Comprobar»: cada paso queda marcado bien o por revisar, con una nota que dice
   * qué mirar pero no el valor correcto. El resultado se compara con la respuesta del enunciado.
   */
  const revisar = () => {
    limpiarRevision();
    if (!definicion) return;
    const notas: Record<string, { bien: boolean; texto: string }> = {};
    const enunciadoDatos = datosEnunciado();
    const examenManual = ejercicio() === 'examen-real' && lab.dataset.modo === 'analogico';
    // Datos
    const fallos: string[] = [];
    for (const d of datos) {
      const nombre = formulaTexto(d.simbolo);
      let valorEscrito = estado[`dato:${d.simbolo}`] ?? '';
      if (examenManual) {
        const fila = leerFilasManual().find((f) => simboloDeNombre(f.nombre) === d.simbolo);
        valorEscrito = fila?.valor ?? '';
      }
      const l = leerDato(valorEscrito, d.magnitud);
      if (l.ok === 'vacio') { fallos.push(`falta ${nombre}`); continue; }
      if (l.ok === false) { fallos.push(`${nombre}: ${l.error}`); continue; }
      if (l.aviso) { fallos.push(`${nombre}: ${l.aviso}`); continue; }
      if (enunciadoDatos) {
        const e = leerDato(enunciadoDatos[d.simbolo] ?? '', d.magnitud);
        if (e.ok === true && Math.abs(e.valor - l.valor) > 1e-9) fallos.push(`${nombre} no es el del enunciado`);
      }
    }
    notas.datos = fallos.length
      ? { bien: false, texto: `Revisa: ${fallos.join('; ')}.` }
      : { bien: true, texto: examenManual ? 'Variables y valores bien anotados.' : 'Datos bien copiados.' };
    // Incógnita
    const incManual = (estado['manual:incognita'] ?? '').trim();
    const normalizar = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
    const inc = examenManual
      ? simboloDeNombre(incManual) ?? (normalizar(incManual) === normalizar(simbolo(definicion.incognita.simbolo)?.nombre ?? '') ? definicion.incognita.simbolo : '')
      : estado.incognita;
    notas.incognita = !inc ? { bien: false, texto: 'Escribe qué te piden.' } : inc === definicion.incognita.simbolo ? { bien: true, texto: 'Es lo que te piden.' } : { bien: false, texto: 'Mira la pregunta: ¿qué cantidad no conoces?' };
    // Fórmula: la de la ficha o una de la que sale despejando
    const f = estado.formula;
    const desde = Object.values(DERIVACIONES).flat().filter((x) => x.hacia === id).map((x) => x.desde);
    if (!examenManual) {
      notas.formula = !f ? { bien: false, texto: 'Elige la fórmula que vas a usar.' }
        : f === id ? { bien: true, texto: 'Es la fórmula que calcula lo que te piden.' }
          : desde.includes(f) ? { bien: true, texto: 'También vale: de esa fórmula sale despejando.' }
            : { bien: false, texto: 'Esa fórmula no calcula lo que te piden.' };
    }
    // Resultado
    const v = enunciadoDatos ? leerValores((s) => enunciadoDatos[s]) : valores();
    const x = esperado(definicion, v);
    if (x === null) notas.resultado = { bien: false, texto: 'Sin todos los datos no se puede comprobar el resultado.' };
    else {
      const ver = comprobar(estado.resultado ?? '', definicion, x);
      notas.resultado = { bien: ver.bien, texto: ver.mensaje };
    }
    for (const [paso, n] of Object.entries(notas)) {
      lab.querySelectorAll<HTMLElement>(`[data-paso="${paso}"]`).forEach((li) => { li.dataset.revision = n.bien ? 'bien' : 'mal'; });
      lab.querySelectorAll<HTMLElement>(`[data-nota="${paso}"]`).forEach((p) => { p.textContent = n.texto; });
    }
    const todo = Object.values(notas).every((n) => n.bien);
    pararReloj();
    // Qué tipo de fallo es (lectura, elección, unidades o cálculo), con el ejercicio del enunciado.
    let diagnostico = '';
    if (enunciadoDatos && notas.resultado && !notas.resultado.bien && (estado.resultado ?? '').trim()) {
      const tipo = diagnosticar({
        lecturaBien: notas.datos.bien && notas.incognita.bien,
        formulaBien: notas.formula ? notas.formula.bien : null,
        resultado: estado.resultado ?? '',
      }, definicion, enunciadoDatos, ejercicio() === 'animacion' ? undefined : periodicidadEnunciado());
      if (tipo) {
        anotarFallo(tipo);
        diagnostico = ` Tipo de fallo: ${NOMBRE_FALLO[tipo].toLowerCase()}. ${CONSEJO_FALLO[tipo]}`;
      }
    }
    // Examen real resuelto bien: se anota el tiempo y se compara con la vez anterior.
    let tiempo = '';
    if (notas.resultado?.bien && ejercicio() === 'examen-real' && estado['reloj:inicio'] && !estado['reloj:anotado']) {
      const segundos = Math.round((Number(estado['reloj:fin'] ?? Date.now()) - Number(estado['reloj:inicio'])) / 1000);
      const antes = anotarTiempo(id, segundos);
      estado['reloj:anotado'] = '1';
      guardar();
      tiempo = antes ? ` Tiempo: ${formatoReloj(segundos)} (antes: ${formatoReloj(antes.ultimo)}; tu mejor: ${formatoReloj(Math.min(antes.mejor, segundos))}).` : ` Tiempo: ${formatoReloj(segundos)}. Es tu primera marca en esta fórmula.`;
    }
    lab.querySelectorAll<HTMLElement>('[data-lab-revision]').forEach((r) => {
      r.className = `lab-revision ${todo ? 'lab-bien' : 'lab-mal'}`;
      r.textContent = (todo ? 'Todo el cuaderno está bien.' : 'Hay pasos por revisar: están marcados en el cuaderno.') + diagnostico + tiempo;
    });
  };

  const escribir = (nombre: string, valor: string, origen?: Element) => {
    estado[nombre] = valor;
    campos(nombre).forEach((c) => { if (c !== origen) c.value = valor; });
    if (nombre === 'formula') {
      pintarFormulaElegida();
      // Si la fórmula se eligió en el papel, la hoja pide los datos de esa fórmula.
      if (!origen?.closest('[data-hoja]')) refrescarHoja(lab, leerEstado);
    }
    limpiarRevision();
    guardar();
  };

  // La hoja de cálculo (modo digital), con el estado guardado.
  const leerEstado = (c: string) => estado[c] ?? '';
  lab.querySelector<HTMLElement>('[data-lab-hoja-sitio]')!.innerHTML = htmlHoja(`hoja-${id}`, leerEstado);
  paradas.push(montarHoja(lab, {
    leer: leerEstado,
    objetivo: () => (definicion ? { incognita: definicion.incognita, datos: datosEnunciado(), examen: ejercicio() === 'examen-real' } : null),
    alCalcular: (texto) => {
      pararReloj();
      estado.resultado = texto;
      campos('resultado').forEach((c) => { c.value = texto; });
      guardar();
    },
    alGuardar: (c, v) => { estado[c] = v; guardar(); },
  }));

  // Estado inicial en todos los campos (los dos modos).
  for (const [nombre, valor] of Object.entries(estado)) campos(nombre).forEach((c) => { c.value = valor; });
  pintarFormulaElegida();
  pintarEjercicio();
  sincronizarReloj();

  const alEscribir = (e: Event) => {
    const c = (e.target as Element).closest<HTMLInputElement>('[data-campo]');
    if (c) escribir(c.dataset.campo!, c.value, c);
  };
  lab.addEventListener('input', alEscribir);
  lab.addEventListener('change', alEscribir);
  paradas.push(() => { lab.removeEventListener('input', alEscribir); lab.removeEventListener('change', alEscribir); });

  // Modo DIGITAL / ANALÓGICO (se recuerda) y el papel que sube desde detrás de la animación.
  const papel = lab.querySelector<HTMLElement>('[data-lab-papel]')!;
  const botonPapel = lab.querySelector<HTMLButtonElement>('[data-lab-abrir-papel]')!;
  const cartulina = lab.closest<HTMLElement>('.t2-ficha')?.querySelector<HTMLElement>('.lab-cartulina');
  const animarCartulina = (cae: boolean) => {
    if (!cartulina) return;
    cartulina.classList.remove('lab-cartulina-cae', 'lab-cartulina-aparece');
    void cartulina.offsetWidth;
    const clase = cae ? 'lab-cartulina-cae' : 'lab-cartulina-aparece';
    cartulina.classList.add(clase);
    cartulina.addEventListener('animationend', () => cartulina.classList.remove(clase), { once: true });
  };
  const abrirPapel = (abrir: boolean) => {
    lab.classList.toggle('lab-papel-abierto', abrir);
    papel.setAttribute('aria-hidden', String(!abrir));
    papel.inert = !abrir;
    botonPapel.setAttribute('aria-expanded', String(abrir));
    botonPapel.textContent = abrir ? 'Bajar el cuaderno' : 'Cuaderno de papel';
  };
  const ponerModo = (modo: Modo) => {
    lab.dataset.modo = modo;
    lab.querySelectorAll<HTMLButtonElement>('[data-lab-modo]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.labModo === modo)));
    abrirPapel(modo === 'analogico');
    pintarEjercicio();
    try { localStorage.setItem(CLAVE_MODO, modo); } catch { /* sin almacenamiento */ }
  };
  let modoGuardado: string | null = null;
  try { modoGuardado = localStorage.getItem(CLAVE_MODO); } catch { modoGuardado = null; }
  ponerModo(modoGuardado === 'analogico' ? 'analogico' : 'digital');

  // La animación: reproductor en la página y «Ampliar» con la expansión cinematográfica.
  const figura = lab.querySelector<HTMLElement>('[data-lab-escena]')!;
  const contenedor = figura.querySelector<HTMLElement>('[data-escena-ficha]')!;
  if (escena) paradas.push(montarReproductor(contenedor, escena));

  /** Cambiar de ejercicio empieza un cuaderno nuevo (el anterior no se mezcla con el nuevo enunciado). */
  const cambiarEjercicio = (e: Ejercicio, otraSemilla = false) => {
    const anterior = ejercicio();
    const s = otraSemilla ? nuevaSemilla(semilla()) : semilla();
    if (e !== anterior || otraSemilla) {
      estado = { ejercicio: e, semilla: String(s), ...(estado['hoja:modo'] ? { 'hoja:modo': estado['hoja:modo'] } : {}) };
      lab.querySelectorAll<HTMLInputElement>('[data-campo]').forEach((c) => { c.value = ''; });
      pintarFormulaElegida();
      refrescarHoja(lab, leerEstado);
      limpiarRevision();
    }
    estado.ejercicio = e;
    estado.semilla = String(s);
    guardar();
    pintarEjercicio();
    sincronizarReloj();
    if (anterior !== 'examen-real' && e === 'examen-real') animarCartulina(true);
    else if (anterior === 'examen-real' && e !== 'examen-real') animarCartulina(false);
  };

  const alCambiarPeriodos = (ev: Event) => {
    const interruptor = (ev.target as Element).closest<HTMLInputElement>('[data-lab-redactado]');
    if (interruptor) {
      redactado = interruptor.checked;
      try { localStorage.setItem(CLAVE_REDACTADO, String(redactado)); } catch { /* sin almacenamiento */ }
      pintarEjercicio();
      return;
    }
    const control = (ev.target as Element).closest<HTMLInputElement>('[data-lab-todos-periodos]');
    if (!control) return;
    todosLosPeriodos = control.checked;
    try { localStorage.setItem(CLAVE_PERIODOS, String(todosLosPeriodos)); } catch { /* sin almacenamiento */ }
    const actual = ejercicio();
    if (actual === 'practica' || actual === 'examen' || actual === 'examen-real') cambiarEjercicio(actual, true);
    else pintarEjercicio();
  };

  const alPulsar = (ev: Event) => {
    const b = (ev.target as Element).closest<HTMLButtonElement>('button');
    if (!b || !lab.contains(b)) return;
    if (b.dataset.labModo) ponerModo(b.dataset.labModo as Modo);
    else if (b.dataset.labEjercicio) cambiarEjercicio(b.dataset.labEjercicio as Ejercicio);
    else if (b.hasAttribute('data-lab-otro')) {
      const actual = ejercicio();
      cambiarEjercicio(actual === 'examen-real' ? 'examen-real' : actual === 'examen' ? 'examen' : 'practica', true);
    } else if (b.hasAttribute('data-lab-pista')) {
      b.hidden = true;
      const p = lab.querySelector<HTMLElement>('[data-lab-pista-texto]')!;
      p.textContent = 'Pista: identifica qué cantidad te piden y busca una fórmula que permita calcularla con los datos del enunciado.';
      p.hidden = false;
    }
    else if (b.hasAttribute('data-lab-variable-mas')) {
      const filas = leerFilasManual();
      if (filas.length < 20) filas.push({ nombre: '', valor: '' });
      reconstruirFilasManual(filas);
      lab.querySelector<HTMLInputElement>(`[data-campo="manual:nombre:${filas.length - 1}"]`)?.focus();
    } else if (b.hasAttribute('data-lab-variable-quitar')) {
      const fila = b.closest<HTMLElement>('[data-lab-variable-fila]');
      if (!fila) return;
      const filas = leerFilasManual();
      const indice = Number(fila.dataset.labVariableFila);
      if (filas.length > 1) filas.splice(indice, 1);
      else filas[0] = { nombre: '', valor: '' };
      reconstruirFilasManual(filas);
    } else if (b.hasAttribute('data-lab-variable-limpiar')) {
      reconstruirFilasManual(leerFilasManual().map(() => ({ nombre: '', valor: '' })));
    }
    else if (b.hasAttribute('data-lab-abrir-papel')) abrirPapel(!lab.classList.contains('lab-papel-abierto'));
    else if (b.hasAttribute('data-lab-ampliar') && escena) expandir(figura, { tipo: 'escena', escena, volanta: `Fórmula ${formulaPorId(id)!.numero} · Laboratorio` });
    else if (b.hasAttribute('data-lab-limpiar')) {
      // Borrar el cuaderno no reinicia el reloj del examen.
      const reloj = Object.fromEntries(Object.entries(estado).filter(([k]) => k.startsWith('reloj:')));
      estado = { ejercicio: ejercicio(), semilla: String(semilla()), ...(estado['hoja:modo'] ? { 'hoja:modo': estado['hoja:modo'] } : {}), ...reloj };
      guardar();
      lab.querySelectorAll<HTMLInputElement>('[data-campo]').forEach((c) => { c.value = ''; });
      pintarFormulaElegida();
      refrescarHoja(lab, leerEstado);
      limpiarRevision();
    } else if (b.hasAttribute('data-lab-comprobar')) revisar();
    else if (b.hasAttribute('data-lab-imprimir')) window.print();
    // Botón de móvil: baja a la calculadora (el hash no se toca: es la ruta de la página).
    else if (b.hasAttribute('data-lab-ir-calc')) lab.querySelector('.lab-calculadora')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    else if (b.hasAttribute('data-lab-compartir')) {
      const enlace = `${location.origin}${location.pathname}#tema/2/f/${id}?ejercicio=${ejercicio()}&n=${semilla()}${todosLosPeriodos ? '&periodos=1' : ''}`;
      const hecho = () => { b.textContent = 'Enlace copiado ✓'; };
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(enlace).then(hecho, () => window.prompt('Copia este enlace:', enlace));
      else window.prompt('Copia este enlace:', enlace);
    }
  };
  lab.addEventListener('click', alPulsar);
  lab.addEventListener('change', alCambiarPeriodos);
  paradas.push(() => { lab.removeEventListener('click', alPulsar); lab.removeEventListener('change', alCambiarPeriodos); });

  // La calculadora conoce los datos del cuaderno y le envía sus operaciones.
  paradas.push(montarCalculadora(lab, {
    // Para la explicación, los símbolos como se leen (Cₙ, no C_n).
    datos: () => Object.fromEntries(Object.entries(valores()).map(([s, v]) => [formulaTexto(s), v])),
    alEnviar: (expresion, resultado) => {
      const previo = estado.operaciones?.trim() ? `${estado.operaciones.trimEnd()}\n` : '';
      escribir('operaciones', `${previo}${expresion} = ${resultado}`);
      if (!estado.resultado?.trim()) escribir('resultado', resultado);
    },
  }));
  return () => paradas.forEach((p) => p());
}
