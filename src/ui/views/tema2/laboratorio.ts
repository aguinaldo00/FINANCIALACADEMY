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
import { generarEjercicio, nuevaSemilla } from '../../../domain/tema2/generador.ts';
import { formatear, formatearExacto } from '../../../domain/tema2/expresion.ts';
import { comprobar, esperado, LABORATORIOS, leerDato, type Magnitud, mostrar } from '../../../domain/tema2/laboratorio.ts';
import { htmlCalculadora, montarCalculadora } from '../../components/calculadora.ts';
import { expandir } from '../../components/reproductorExpandido.ts';
import { ESCENAS } from '../../escenas/index.ts';
import { formulaTexto, simbolosDe } from '../../matematica/formula.ts';
import { asegurarGrano, ruido } from '../../motion/papel.ts';
import { montarReproductor } from '../../motion/reproductor.ts';
import { escaparHtml, formulaHtml } from './comun.ts';
import { DERIVACIONES } from './indice.ts';

type Modo = 'digital' | 'analogico';
type Ejercicio = 'animacion' | 'practica' | 'examen' | 'propio';
const CLAVE_MODO = 'fa-lab-modo';
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
const queEscribir = (paso: keyof typeof QUE_ESCRIBIR) =>
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
  return `<div class="lab-datos">${datosDe(id).map((d) => {
    const u = UNIDAD[d.magnitud];
    return `<label class="lab-dato"><span class="lab-sim">${formulaHtml(d.simbolo)}${papel ? ' =' : ''}</span>
    <span class="lab-dato-celda">${campo(`dato:${d.simbolo}`, `${simbolo(d.simbolo)?.nombre ?? d.simbolo} (${u.titulo})`, PISTA_DATO[d.magnitud])}<abbr class="lab-unidad" title="${escaparHtml(u.titulo)}">${u.texto}</abbr></span></label>`;
  }).join('')}</div>`;
}

function selectorIncognita(id: string): string {
  const f = formulaPorId(id)!;
  const opciones = simbolosDe(f.expresion).map((s) => `<option value="${s}">${escaparHtml(formulaTexto(s))} · ${escaparHtml(simbolo(s)?.nombre ?? s)}</option>`).join('');
  return `<select class="lab-campo" data-campo="incognita" aria-label="Incógnita"><option value="">¿Qué te piden?</option>${opciones}</select>`;
}

/** Desplegable con las 19 fórmulas del tema, por bloques: se elige la que se va a usar sin salir de la página. */
function selectorFormula(): string {
  const grupos = BLOQUES.map((b) => `<optgroup label="${escaparHtml(b.titulo)}">${FORMULAS_TEMA2.filter((f) => f.bloque === b.id).map((f) => `<option value="${f.id}">Nº ${f.numero} — ${escaparHtml(formulaTexto(f.expresion))}</option>`).join('')}</optgroup>`).join('');
  return `<select class="lab-campo lab-campo-formula" data-campo="formula" aria-label="Fórmula que vas a usar"><option value="">Elige la fórmula…</option>${grupos}</select><p class="lab-formula-elegida" data-lab-formula-elegida></p>`;
}

/** Los pasos del cuaderno; `papel` cambia solo la forma (papel pautado y letra manuscrita). */
function pasos(id: string, papel: boolean): string {
  const fila = (n: number, paso: string, titulo: string, cuerpo: string) =>
    `<li class="lab-paso lab-paso-${paso}" data-paso="${paso}"><span class="lab-paso-n" aria-hidden="true">${n}</span><div class="lab-paso-cuerpo"><p class="lab-paso-tit">${titulo}${papel ? ':' : ''}</p>${cuerpo}<p class="lab-paso-nota" data-nota="${paso}"></p></div></li>`;
  return `<ol class="lab-pasos">
    ${fila(1, 'datos', 'Datos', filaDatos(id, papel))}
    ${fila(2, 'incognita', 'Incógnita', selectorIncognita(id))}
    ${fila(3, 'formula', 'Fórmula', selectorFormula())}
    ${fila(4, 'despeje', 'Despeje', `${queEscribir('despeje')}${campo('despeje', 'Despeje', 'Incógnita = … (solo letras)')}${ayuda(AYUDA_DESPEJE)}`)}
    ${fila(5, 'sustitucion', 'Sustitución', `${queEscribir('sustitucion')}${campo('sustitucion', 'Sustitución', 'Incógnita = … (con tus números)')}${ayuda(AYUDA_SUSTITUCION)}`)}
    ${fila(6, 'operaciones', 'Operaciones', `<textarea class="lab-campo" data-campo="operaciones" rows="3" aria-label="Operaciones" placeholder="Una operación por línea" spellcheck="false"></textarea>`)}
    ${fila(7, 'resultado', 'Resultado', `<div class="lab-resultado">${campo('resultado', 'Resultado', 'Tu resultado')}<button type="button" class="lab-comprobar" data-lab-comprobar>Comprobar</button></div>`)}
    ${papel ? fila(8, 'notas', 'Siguiente paso', `<textarea class="lab-campo" data-campo="notas" rows="2" aria-label="Notas" placeholder="Escribe aquí el siguiente paso…"></textarea>`) : ''}
  </ol>
  <div class="lab-revision" data-lab-revision aria-live="polite"></div>`;
}

/** Fórmulas del mismo bloque que la ficha: la lista corta del modo digital. */
function selectorFormulaCorto(id: string): string {
  const f = formulaPorId(id)!;
  const opciones = FORMULAS_TEMA2.filter((o) => o.bloque === f.bloque).map((o) => `<option value="${o.id}">Nº ${o.numero} — ${escaparHtml(formulaTexto(o.expresion))}</option>`).join('');
  return `<select class="lab-campo hoja-select" data-campo="formula" aria-label="Fórmula que vas a usar"><option value="">Elige la fórmula…</option>${opciones}</select>`;
}

/**
 * Modo DIGITAL: una hoja de cálculo. Solo se rellenan los datos, se elige la fórmula y se pulsa
 * «Calcular»; la hoja escribe la sustitución y el resultado. Los pasos a mano (despeje,
 * sustitución, operaciones) son del modo ANALÓGICO.
 */
function hojaDigital(id: string): string {
  const calcula = Boolean(LABORATORIOS[id]);
  const filas = datosDe(id).map((d) => {
    const u = UNIDAD[d.magnitud];
    const nombre = simbolo(d.simbolo)?.nombre ?? d.simbolo;
    return `<tr><th scope="row"><span class="hoja-sim">${formulaHtml(d.simbolo)}</span><small>${escaparHtml(nombre)}</small></th>
      <td>${campo(`dato:${d.simbolo}`, `${nombre} (${u.titulo})`, PISTA_DATO[d.magnitud])}</td><td class="hoja-u"><abbr title="${escaparHtml(u.titulo)}">${u.texto}</abbr></td></tr>`;
  }).join('');
  return `<table class="hoja"><thead><tr><th scope="col">Dato</th><th scope="col">Valor</th><th scope="col"><span class="sr">Unidad</span></th></tr></thead><tbody>${filas}</tbody></table>
    <div class="hoja-formula"><label for="hoja-formula-${id}">Fórmula</label>${selectorFormulaCorto(id).replace('<select ', `<select id="hoja-formula-${id}" `)}
      <p class="lab-formula-elegida" data-lab-formula-elegida></p></div>
    ${calcula ? `<button type="button" class="hoja-calcular" data-lab-calcular>Calcular</button>
    <div class="hoja-salida" data-lab-hoja-salida hidden><p class="hoja-sust" data-lab-hoja-sust></p><output class="hoja-resultado" data-lab-hoja-resultado></output></div>
    <p class="hoja-nota" data-lab-hoja-nota aria-live="polite"></p>` : '<p class="hoja-nota">Esta fórmula no calcula una sola incógnita: usa la calculadora con tus datos.</p>'}`;
}

/** La forma de la fórmula que empieza por la incógnita (la de la ficha o una variante despejada). */
export function formaDespejada(idFormula: string, incognita: string): string {
  const f = formulaPorId(idFormula)!;
  return [f.expresion, ...(f.variantes ?? []).map((v) => v.expresion)].find((e) => e.startsWith(`${incognita} = `)) ?? f.expresion;
}

/** La fórmula con los números en lugar de las letras (sin operar), para enseñar la sustitución. */
export function sustitucion(expresion: string, valores: Readonly<Record<string, string>>): string {
  const [izq, der] = expresion.split(/ = (.*)/s);
  if (der === undefined) return expresion;
  const claves = Object.keys(valores).sort((a, b) => b.length - a.length).map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (!claves.length) return expresion;
  const patron = new RegExp(`(?<![A-Za-z_\\\\])(${claves.join('|')})(?![A-Za-z_0-9])`, 'g');
  return `${izq} = ${der.replace(patron, (k) => `"${valores[k]}"`)}`;
}

/** Enunciado con unos datos y la incógnita de la fórmula (sin inventar nada más). */
function enunciado(id: string, datos: Readonly<Record<string, string>>): string {
  const lab = LABORATORIOS[id];
  if (!lab) return '';
  const partes = lab.datos.map((d) => `${formulaHtml(d.simbolo)} = ${escaparHtml(datos[d.simbolo] ?? '?')}`);
  const lista = partes.length > 1 ? `${partes.slice(0, -1).join(', ')} y ${partes.at(-1)}` : partes[0];
  const inc = lab.incognita.simbolo;
  return `Te dan ${lista}. Calcula ${formulaHtml(inc)}, ${escaparHtml((simbolo(inc)?.nombre ?? inc).toLowerCase())}.`;
}

export function htmlLaboratorio(id: string): string {
  const escena = ESCENAS[id];
  const calcula = Boolean(LABORATORIOS[id]);
  const hayCaso = Boolean(escena?.caso && calcula);
  return `<div class="lab" data-laboratorio="${id}" data-modo="digital" data-ejercicio="${hayCaso ? 'animacion' : 'propio'}">
    <div class="lab-barra">
      <div class="lab-caso">
        ${calcula ? `<div class="lab-ejercicios" role="group" aria-label="Qué ejercicio resolver">
          ${hayCaso ? '<button type="button" data-lab-ejercicio="animacion">Caso de la animación</button>' : ''}
          <button type="button" data-lab-ejercicio="practica">Ejercicio aleatorio</button>
          <button type="button" data-lab-ejercicio="propio">Mis datos</button>
          <button type="button" data-lab-ejercicio="examen">Modo examen</button>
        </div>` : ''}
        <p class="lab-caso-volanta" data-lab-caso-origen>${calcula ? '' : 'Cuaderno libre'}</p>
        <p class="lab-caso-texto" data-lab-caso-texto>${calcula ? '' : 'Esta fórmula compara o liquida importes: usa el cuaderno y la calculadora con tus datos.'}</p>
        <button type="button" class="lab-boton lab-otro" data-lab-otro hidden><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="3.5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="9" cy="9" r="1.5"/><circle cx="15" cy="15" r="1.5"/><circle cx="15" cy="9" r="1.5"/><circle cx="9" cy="15" r="1.5"/></svg>Generar otro ejercicio</button>
      </div>
      <div class="lab-modo" role="group" aria-label="Forma de trabajar">
        <button type="button" data-lab-modo="digital" aria-pressed="true">Digital</button>
        <button type="button" data-lab-modo="analogico" aria-pressed="false">Analógico</button>
      </div>
    </div>
    <section class="lab-panel lab-cuaderno" aria-labelledby="lab-cuaderno-tit">
      <header class="lab-panel-cab"><h2 id="lab-cuaderno-tit"><span>01</span>Hoja de cálculo</h2>
        <button type="button" class="lab-mini" data-lab-limpiar>Borrar</button></header>
      ${hojaDigital(id)}
    </section>
    <section class="lab-centro" aria-label="Animación y cuaderno de papel">
      <div class="lab-papel-marco" data-lab-papel-marco>
        <div class="lab-papel-pliegue"><div class="lab-papel" data-lab-papel aria-hidden="true">
          <header class="lab-panel-cab"><h2><span>02</span>Cuaderno de papel</h2><button type="button" class="lab-mini" data-lab-limpiar>Borrar el cuaderno</button></header>
          ${pasos(id, true)}
        </div></div>
      </div>
      <figure class="lab-escena" data-lab-escena>
        <div class="lab-escena-medio" data-vx-medio><div data-escena-ficha="${id}"></div></div>
        <figcaption class="lab-escena-pie">
          <span class="lab-escena-nota" data-lab-escena-nota></span>
          <span class="lab-escena-botones">
            <button type="button" class="lab-boton lab-boton-papel" data-lab-abrir-papel aria-expanded="false">Cuaderno de papel</button>
            ${escena ? '<button type="button" class="lab-boton" data-lab-ampliar aria-haspopup="dialog"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>Ampliar animación</button>' : ''}
          </span>
        </figcaption>
      </figure>
    </section>
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

  // Estado compartido por los dos modos, guardado por fórmula.
  let estado: Record<string, string> = {};
  try { estado = JSON.parse(localStorage.getItem(claveEstado(id)) ?? '{}') as Record<string, string>; } catch { estado = {}; }
  const guardar = () => { try { localStorage.setItem(claveEstado(id), JSON.stringify(estado)); } catch { /* sin almacenamiento: se trabaja igual */ } };
  const campos = (nombre: string) => [...lab.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(`[data-campo="${nombre}"]`)];

  const ejercicio = (): Ejercicio => {
    const e = estado.ejercicio as Ejercicio | undefined;
    if (!definicion) return 'propio';
    if (e === 'animacion' && !caso) return 'practica';
    return e ?? (caso ? 'animacion' : 'practica');
  };
  const semilla = () => Number(estado.semilla) || 1;
  /** Datos del enunciado del ejercicio elegido (ninguno si son los del alumno). */
  const datosEnunciado = (): Readonly<Record<string, string>> | null => {
    const e = ejercicio();
    if (e === 'animacion') return caso ?? null;
    if (e === 'practica' || e === 'examen') return generarEjercicio(id, semilla())?.datos ?? null;
    return null;
  };
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
    const nota = lab.querySelector<HTMLElement>('[data-lab-escena-nota]')!;
    if (!definicion) return;
    const d = datosEnunciado();
    otro.hidden = e !== 'practica' && e !== 'examen';
    if (e === 'animacion') {
      origen.textContent = 'El caso de la animación';
      texto.innerHTML = enunciado(id, d!);
      nota.textContent = '';
    } else if (e === 'practica') {
      origen.textContent = `Ejercicio aleatorio nº ${semilla()} · generado al azar`;
      texto.innerHTML = enunciado(id, d!);
      nota.textContent = 'La animación enseña su caso de ejemplo; tu ejercicio tiene otros datos.';
    } else if (e === 'examen') {
      // Como en un examen: el enunciado redactado, sin decir qué letra es cada dato.
      origen.textContent = `Modo examen · ejercicio nº ${semilla()}`;
      texto.textContent = enunciadoExamen(id, d!) ?? '';
      nota.textContent = 'La animación enseña su caso de ejemplo; tu ejercicio tiene otros datos.';
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
  };

  /** Vacía la salida de la hoja (cambia algo: hay que volver a calcular). */
  const limpiarHoja = () => {
    const salida = lab.querySelector<HTMLElement>('[data-lab-hoja-salida]');
    if (salida) salida.hidden = true;
    const nota = lab.querySelector<HTMLElement>('[data-lab-hoja-nota]');
    if (nota) { nota.textContent = ''; nota.className = 'hoja-nota'; }
  };

  /**
   * «Calcular» de la hoja: con los datos escritos y la fórmula elegida, escribe la sustitución y el
   * resultado. Si la fórmula no sirve o falta un dato, lo dice sin calcular nada.
   */
  const calcularHoja = () => {
    if (!definicion) return;
    const salida = lab.querySelector<HTMLElement>('[data-lab-hoja-salida]')!;
    const nota = lab.querySelector<HTMLElement>('[data-lab-hoja-nota]')!;
    const decir = (texto: string, clase: 'bien' | 'mal' | 'aviso') => { nota.textContent = texto; nota.className = `hoja-nota hoja-${clase}`; };
    salida.hidden = true;
    const problemas: string[] = [];
    for (const d of datos) {
      const l = leerDato(estado[`dato:${d.simbolo}`] ?? '', d.magnitud);
      const nombre = formulaTexto(d.simbolo);
      if (l.ok === 'vacio') problemas.push(`falta ${nombre}`);
      else if (l.ok === false) problemas.push(`${nombre}: ${l.error}`);
      else if (l.aviso) problemas.push(`${nombre}: ${l.aviso}`);
    }
    if (problemas.length) return decir(`Antes de calcular: ${problemas.join('; ')}.`, 'mal');
    const f = estado.formula;
    if (!f) return decir('Elige la fórmula que vas a usar.', 'mal');
    const desde = Object.values(DERIVACIONES).flat().filter((x) => x.hacia === id).map((x) => x.desde);
    if (f !== id && !desde.includes(f)) {
      return decir(ejercicio() === 'examen' ? 'Con esa fórmula y estos datos no se puede calcular lo que te piden.' : 'Esa fórmula no calcula lo que te piden: elige otra.', 'mal');
    }
    const v = valores();
    const x = esperado(definicion, v);
    if (x === null) return decir('Con estos datos no sale un resultado: revisa que ningún dato valga 0 donde divide.', 'mal');
    const inc = definicion.incognita;
    // Sustitución sobre la fórmula de la ficha (si se eligió otra, sale despejando de ella).
    const numeros = Object.fromEntries(datos.map((d) => [d.simbolo, d.magnitud === 'euros' ? formatear(v[d.simbolo]!, Number.isInteger(v[d.simbolo]) ? 0 : 2) : formatearExacto(v[d.simbolo]!)]));
    lab.querySelector<HTMLElement>('[data-lab-hoja-sust]')!.innerHTML = `${f === id ? '' : '<small>Despejando:</small> '}${formulaHtml(sustitucion(formaDespejada(id, inc.simbolo), numeros))}`;
    const texto = mostrar(x, inc.magnitud);
    lab.querySelector<HTMLElement>('[data-lab-hoja-resultado]')!.innerHTML = `${formulaHtml(inc.simbolo)} = ${escaparHtml(texto)}${inc.magnitud === 'tipo' ? ` <small>(${escaparHtml(formatearExacto(x))} en tanto por uno)</small>` : ''}`;
    salida.hidden = false;
    estado.resultado = texto;
    campos('resultado').forEach((c) => { c.value = texto; });
    guardar();
    // Comparación con el enunciado (no en examen: allí no hay pistas).
    const enunciadoDatos = datosEnunciado();
    if (!enunciadoDatos || ejercicio() === 'examen') return decir('Calculado con tus datos.', 'bien');
    const distintos = datos.filter((d) => {
      const e = leerDato(enunciadoDatos[d.simbolo] ?? '', d.magnitud);
      return e.ok === true && Math.abs(e.valor - v[d.simbolo]!) > 1e-9;
    }).map((d) => formulaTexto(d.simbolo));
    if (distintos.length) decir(`Calculado, pero ${distintos.join(' y ')} no ${distintos.length > 1 ? 'coinciden' : 'coincide'} con el enunciado.`, 'aviso');
    else decir('Calculado. Los datos coinciden con el enunciado.', 'bien');
  };

  const limpiarRevision = () => {
    limpiarHoja();
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
    // Datos
    const fallos: string[] = [];
    for (const d of datos) {
      const nombre = formulaTexto(d.simbolo);
      const l = leerDato(estado[`dato:${d.simbolo}`] ?? '', d.magnitud);
      if (l.ok === 'vacio') { fallos.push(`falta ${nombre}`); continue; }
      if (l.ok === false) { fallos.push(`${nombre}: ${l.error}`); continue; }
      if (l.aviso) { fallos.push(`${nombre}: ${l.aviso}`); continue; }
      if (enunciadoDatos) {
        const e = leerDato(enunciadoDatos[d.simbolo] ?? '', d.magnitud);
        if (e.ok === true && Math.abs(e.valor - l.valor) > 1e-9) fallos.push(`${nombre} no es el del enunciado`);
      }
    }
    notas.datos = fallos.length ? { bien: false, texto: `Revisa: ${fallos.join('; ')}.` } : { bien: true, texto: 'Datos bien copiados.' };
    // Incógnita
    const inc = estado.incognita;
    notas.incognita = !inc ? { bien: false, texto: 'Elige qué te piden.' } : inc === definicion.incognita.simbolo ? { bien: true, texto: 'Es lo que te piden.' } : { bien: false, texto: 'Mira la pregunta: ¿qué cantidad no conoces?' };
    // Fórmula: la de la ficha o una de la que sale despejando
    const f = estado.formula;
    const desde = Object.values(DERIVACIONES).flat().filter((x) => x.hacia === id).map((x) => x.desde);
    notas.formula = !f ? { bien: false, texto: 'Elige la fórmula que vas a usar.' }
      : f === id ? { bien: true, texto: 'Es la fórmula que calcula lo que te piden.' }
        : desde.includes(f) ? { bien: true, texto: 'También vale: de esa fórmula sale despejando.' }
          : { bien: false, texto: 'Esa fórmula no calcula lo que te piden.' };
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
    lab.querySelectorAll<HTMLElement>('[data-lab-revision]').forEach((r) => {
      r.className = `lab-revision ${todo ? 'lab-bien' : 'lab-mal'}`;
      r.textContent = todo ? 'Todo el cuaderno está bien.' : 'Hay pasos por revisar: están marcados en el cuaderno.';
    });
  };

  const escribir = (nombre: string, valor: string, origen?: Element) => {
    estado[nombre] = valor;
    campos(nombre).forEach((c) => { if (c !== origen) c.value = valor; });
    if (nombre === 'formula') pintarFormulaElegida();
    limpiarRevision();
    guardar();
  };

  // Estado inicial en todos los campos (los dos modos).
  for (const [nombre, valor] of Object.entries(estado)) campos(nombre).forEach((c) => { c.value = valor; });
  pintarFormulaElegida();
  pintarEjercicio();

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
      estado = { ejercicio: e, semilla: String(s) };
      lab.querySelectorAll<HTMLInputElement>('[data-campo]').forEach((c) => { c.value = ''; });
      pintarFormulaElegida();
      limpiarRevision();
    }
    estado.ejercicio = e;
    estado.semilla = String(s);
    guardar();
    pintarEjercicio();
  };

  const alPulsar = (ev: Event) => {
    const b = (ev.target as Element).closest<HTMLButtonElement>('button');
    if (!b || !lab.contains(b)) return;
    if (b.dataset.labModo) ponerModo(b.dataset.labModo as Modo);
    else if (b.dataset.labEjercicio) cambiarEjercicio(b.dataset.labEjercicio as Ejercicio);
    else if (b.hasAttribute('data-lab-otro')) cambiarEjercicio(ejercicio() === 'examen' ? 'examen' : 'practica', true);
    else if (b.hasAttribute('data-lab-abrir-papel')) abrirPapel(!lab.classList.contains('lab-papel-abierto'));
    else if (b.hasAttribute('data-lab-ampliar') && escena) expandir(figura, { tipo: 'escena', escena, volanta: `Fórmula ${formulaPorId(id)!.numero} · Laboratorio` });
    else if (b.hasAttribute('data-lab-limpiar')) {
      estado = { ejercicio: ejercicio(), semilla: String(semilla()) };
      guardar();
      lab.querySelectorAll<HTMLInputElement>('[data-campo]').forEach((c) => { c.value = ''; });
      pintarFormulaElegida();
      limpiarRevision();
    } else if (b.hasAttribute('data-lab-comprobar')) revisar();
    else if (b.hasAttribute('data-lab-calcular')) calcularHoja();
  };
  lab.addEventListener('click', alPulsar);
  paradas.push(() => lab.removeEventListener('click', alPulsar));

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
