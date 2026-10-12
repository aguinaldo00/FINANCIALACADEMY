/*
 * Hoja de cálculo del Tema 2: el modo DIGITAL de la ficha de cada fórmula y de la fase D.
 * Dos formas de rellenarla:
 *  - GUIADA: se elige una de las 19 fórmulas y la hoja pide sus datos; «Calcular» escribe la
 *    sustitución y el resultado.
 *  - PRO: el alumno escribe sus variables (con el nombre que quiera: C0, c0, C_0, Co…) y su propia
 *    fórmula («C0 = Cn / (1 + n × i)»); la hoja la calcula con el mismo motor que la calculadora.
 * La «Guía de variables» dice qué es cada símbolo y cómo se puede escribir.
 * La hoja no corrige el resultado: eso lo hace «Comprobar» de cada pantalla. Solo avisa de lo que
 * impide calcular y, fuera del examen, de si la fórmula calcula lo que te piden o los datos no son
 * los del enunciado.
 */
import { BLOQUES, FORMULAS_TEMA2, formulaPorId } from '../../content/temas/tema-02/formulas.ts';
import { SIMBOLOS, simbolo } from '../../content/temas/tema-02/simbolos.ts';
import { calcular, formatear, formatearExacto } from '../../domain/tema2/expresion.ts';
import { type DatoLab, LABORATORIOS, leerDato, type Magnitud, mostrar } from '../../domain/tema2/laboratorio.ts';
import { formulaTexto } from '../matematica/formula.ts';
import { escaparHtml, formulaHtml } from '../views/tema2/comun.ts';

/* ------------------------------------------------------------------ sustitución */

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
  // Sin «lookbehind» (Safari < 16.4): el carácter previo se captura y se devuelve tal cual.
  const patron = new RegExp(`(^|[^A-Za-z_\\\\])(${claves.join('|')})(?![A-Za-z_0-9])`, 'g');
  return `${izq} = ${der.replace(patron, (_m, antes: string, k: string) => `${antes}"${valores[k]}"`)}`;
}

/* --------------------------------------------------------- nombres de variables (Pro) */

/** Cómo puede escribir el alumno cada símbolo en el modo Pro (además del propio símbolo). */
export const FORMAS_SIMBOLO: Readonly<Record<string, readonly string[]>> = {
  C_0: ['C0', 'c0', 'C_0', 'Co', 'C₀'],
  C_n: ['Cn', 'cn', 'C_n', 'Cₙ'],
  I: ['I'],
  i: ['i'],
  n: ['n'],
  m: ['m'],
  i_m: ['im', 'i_m', 'iₘ', 'i12', 'i4'],
  J_m: ['Jm', 'J_m', 'Jₘ', 'TIN'],
  TAE: ['TAE', 'tae'],
  N: ['N'],
  E: ['E'],
  D: ['D'],
  D_r: ['Dr', 'D_r'],
  D_c: ['Dc', 'D_c'],
  d: ['d'],
};

/**
 * Símbolo del tema al que corresponde un nombre escrito por el alumno, o null. Las letras sueltas
 * distinguen mayúsculas (I intereses ≠ i tipo, N nominal ≠ n tiempo, D ≠ d); los nombres largos no
 * (C0 = c0 = C_0 = Co = C₀).
 */
export function simboloDeNombre(nombre: string): string | null {
  const t = nombre.trim();
  if (!t) return null;
  if (t.length === 1) return FORMAS_SIMBOLO[t] ? t : null;
  const norm = (s: string) => s.toLowerCase().replace(/₀/g, '0').replace(/ₙ/g, 'n').replace(/ₘ/g, 'm').replace(/_/g, '');
  const n = norm(t);
  if (/^i\d+$/.test(n)) return 'i_m';
  if (/^j\d+$/.test(n)) return 'J_m';
  for (const [clave, formas] of Object.entries(FORMAS_SIMBOLO)) if (formas.some((f) => f.length > 1 && norm(f) === n)) return clave;
  return null;
}

/** Magnitud de un símbolo (cómo se escribe el resultado). */
function magnitudDe(clave: string | null): Magnitud | null {
  if (!clave) return null;
  if (['C_0', 'C_n', 'I', 'N', 'E', 'D', 'D_r', 'D_c'].includes(clave)) return 'euros';
  if (['i', 'i_m', 'J_m', 'TAE', 'd'].includes(clave)) return 'tipo';
  if (clave === 'n') return 'tiempo';
  return 'partes';
}

const PALABRA = /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ][A-Za-z0-9_₀ₙₘÁÉÍÓÚÜÑáéíóúüñ]*/g;
const RESERVADAS = new Set(['log', 'ln', 'ans']);
/** Un número para el analizador de la calculadora: coma decimal, sin separador de miles. */
const enCifra = (v: number) => (Number.isInteger(v) ? String(v) : String(Number(v.toPrecision(15)))).replace('.', ',').replace('-', '−');

export type CalculoPro =
  | { ok: true; incognita: string; clave: string | null; valor: number; sustitucion: string; avisos: string[] }
  | { ok: false; error: string };

/**
 * Calcula la fórmula escrita por el alumno con sus variables. `formula` puede ser «x = expresión» o
 * solo la expresión. Las variables se buscan por su nombre normalizado (C0 = c0 = C_0).
 */
export function calcularPro(variables: readonly { nombre: string; valor: string }[], formula: string): CalculoPro {
  const definidas = new Map<string, { nombre: string; valor: number }>();
  const clave = (nombre: string) => simboloDeNombre(nombre) ?? `«${nombre.trim()}»`;
  const avisos: string[] = [];
  for (const v of variables) {
    if (!v.nombre.trim() && !v.valor.trim()) continue;
    if (!v.nombre.trim()) return { ok: false, error: `Falta el nombre de la variable que vale ${v.valor.trim()}.` };
    if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ][A-Za-z0-9_₀ₙₘÁÉÍÓÚÜÑáéíóúüñ]*$/.test(v.nombre.trim())) return { ok: false, error: `«${v.nombre.trim()}» no vale como nombre: empieza por una letra y usa solo letras, números o _ (C0, Cn, i).` };
    if (RESERVADAS.has(v.nombre.trim().toLowerCase())) return { ok: false, error: `«${v.nombre.trim()}» es una función de la calculadora: usa otro nombre.` };
    if (!v.valor.trim()) return { ok: false, error: `Falta el valor de ${v.nombre.trim()}.` };
    const r = calcular(v.valor.replace(/€/g, ''));
    if (!r.ok) return { ok: false, error: `${v.nombre.trim()}: ${r.error}` };
    const k = clave(v.nombre);
    if (definidas.has(k)) return { ok: false, error: `${v.nombre.trim()} y ${definidas.get(k)!.nombre} son la misma variable: déjala una sola vez.` };
    if (magnitudDe(simboloDeNombre(v.nombre)) === 'tipo' && r.valor > 1 && !v.valor.includes('%')) avisos.push(`¿${v.nombre.trim()} = ${v.valor.trim()} %? Un tipo se escribe con % o en tanto por uno.`);
    definidas.set(k, { nombre: v.nombre.trim(), valor: r.valor });
  }
  const texto = formula.trim();
  if (!texto) return { ok: false, error: 'Escribe la fórmula: la incógnita, un igual y la expresión (con tus variables).' };
  const partes = texto.split('=');
  if (partes.length > 2) return { ok: false, error: 'La fórmula lleva un solo «=»: la incógnita a la izquierda y la expresión a la derecha.' };
  const [izq, der] = partes.length === 2 ? [partes[0]!.trim(), partes[1]!.trim()] : ['', texto];
  if (!der) return { ok: false, error: 'Falta la expresión a la derecha del «=».' };
  let falta: string | null = null;
  const sustituir = (conValor: (v: number) => string) => der.replace(PALABRA, (p) => {
    if (RESERVADAS.has(p.toLowerCase())) return p;
    const d = definidas.get(clave(p));
    if (!d) { falta ??= p; return p; }
    return `(${conValor(d.valor)})`;
  });
  const calculable = sustituir(enCifra);
  if (falta) return { ok: false, error: `«${falta}» no está entre tus variables: añádela o revisa cómo la has escrito.` };
  const r = calcular(calculable);
  if (!r.ok) return { ok: false, error: r.error };
  const incognita = izq || '?';
  const simb = izq ? simboloDeNombre(izq) : null;
  return { ok: true, incognita, clave: simb, valor: r.valor, sustitucion: `${incognita} = ${sustituir((v) => formatearExacto(v))}`, avisos };
}

/* ----------------------------------------------------------------------- HTML */

const PISTA_DATO: Record<Magnitud, string> = { euros: 'importe', tipo: 'con % o en tanto por uno', tiempo: 'en la unidad del tipo', partes: 'partes del año' };
const UNIDAD: Record<Magnitud, { texto: string; titulo: string }> = {
  euros: { texto: '€', titulo: 'euros' },
  tipo: { texto: '%', titulo: 'con el signo % o en tanto por uno' },
  tiempo: { texto: 'periodos', titulo: 'en la misma unidad que el tipo: años si el tipo es anual' },
  partes: { texto: 'm', titulo: 'partes del año' },
};

const campoHtml = (nombre: string, etiqueta: string, pista: string, valor = '') =>
  `<input class="lab-campo" type="text" data-campo="${nombre}" aria-label="${escaparHtml(etiqueta)}" placeholder="${escaparHtml(pista)}" value="${escaparHtml(valor)}" autocomplete="off" spellcheck="false">`;

/** Las 19 fórmulas, por bloques. */
function selectorFormulas(prefijo: string): string {
  const grupos = BLOQUES.map((b) => `<optgroup label="${escaparHtml(b.titulo)}">${FORMULAS_TEMA2.filter((f) => f.bloque === b.id).map((f) => `<option value="${f.id}">Nº ${f.numero} — ${escaparHtml(formulaTexto(f.expresion))}</option>`).join('')}</optgroup>`).join('');
  return `<select id="${prefijo}-formula" class="lab-campo hoja-select" data-campo="formula"><option value="">Elige la fórmula…</option>${grupos}</select>`;
}

/** Filas de datos de una fórmula (modo guiado). */
function filasGuiadas(idFormula: string, leer: (campo: string) => string): string {
  const lab = LABORATORIOS[idFormula];
  if (!idFormula) return '<tr class="hoja-vacia"><td colspan="3">Elige primero la fórmula: aquí aparecerán sus datos.</td></tr>';
  if (!lab) return '<tr class="hoja-vacia"><td colspan="3">Esta fórmula no calcula una sola incógnita: usa la calculadora con tus datos.</td></tr>';
  return lab.datos.map((d) => {
    const u = UNIDAD[d.magnitud];
    const nombre = simbolo(d.simbolo)?.nombre ?? d.simbolo;
    return `<tr><th scope="row"><span class="hoja-sim">${formulaHtml(d.simbolo)}</span><small>${escaparHtml(nombre)}</small></th>
      <td>${campoHtml(`dato:${d.simbolo}`, `${nombre} (${u.titulo})`, PISTA_DATO[d.magnitud], leer(`dato:${d.simbolo}`))}</td><td class="hoja-u"><abbr title="${escaparHtml(u.titulo)}">${u.texto}</abbr></td></tr>`;
  }).join('');
}

const filaPro = (k: number, leer: (campo: string) => string) => `<tr data-hoja-pro-fila="${k}">
  <td>${campoHtml(`pro:nombre:${k}`, `Nombre de la variable ${k + 1}`, 'nombre', leer(`pro:nombre:${k}`))}</td>
  <td>${campoHtml(`pro:valor:${k}`, `Valor de la variable ${k + 1}`, 'valor', leer(`pro:valor:${k}`))}</td></tr>`;

/** Guía de variables: qué es cada símbolo y cómo se escribe en la hoja Pro. */
function guiaHtml(): string {
  return `<div class="hoja-guia" data-hoja-guia-panel hidden>
    <p>Cada letra tiene siempre el mismo papel. En la hoja <b>Pro</b> puedes escribirla de cualquiera de estas formas.</p>
    <dl>${SIMBOLOS.filter((s) => FORMAS_SIMBOLO[s.clave]).map((s) => `<div><dt>${formulaHtml(s.clave)}</dt><dd><b>${escaparHtml(s.nombre)}.</b> ${escaparHtml(s.significado)}<small>Se escribe: ${FORMAS_SIMBOLO[s.clave]!.filter((f) => !/[₀ₙₘ]/.test(f)).map(escaparHtml).join(', ')}</small></dd></div>`).join('')}</dl>
  </div>`;
}

/**
 * La hoja. `prefijo` hace únicos los id. `leer` da el valor guardado de cada campo (la ficha comparte
 * estado con el cuaderno de papel).
 */
export function htmlHoja(prefijo: string, leer: (campo: string) => string = () => ''): string {
  const formula = leer('formula');
  // Tres filas de variables, o las que tenga guardadas.
  let filas = 3;
  for (let k = 0; k < 20; k++) if (leer(`pro:nombre:${k}`) || leer(`pro:valor:${k}`)) filas = Math.max(filas, k + 1);
  const modo = leer('hoja:modo') === 'pro' ? 'pro' : 'guiada';
  return `<div class="hoja-cal" data-hoja data-hoja-modo="${modo}">
    <div class="hoja-barra">
      <div class="hoja-modos" role="group" aria-label="Cómo rellenar la hoja">
        <button type="button" data-hoja-poner="guiada" aria-pressed="${modo === 'guiada'}">Guiada</button>
        <button type="button" data-hoja-poner="pro" aria-pressed="${modo === 'pro'}">Pro</button>
      </div>
      <button type="button" class="btn-enlace hoja-guia-boton" data-hoja-guia aria-expanded="false">Guía de variables</button>
    </div>
    ${guiaHtml()}
    <section class="hoja-seccion" data-hoja-seccion="guiada"${modo === 'guiada' ? '' : ' hidden'}>
      <div class="hoja-formula"><label for="${prefijo}-formula"><b>1</b> Fórmula</label>${selectorFormulas(prefijo)}
        <p class="lab-formula-elegida" data-lab-formula-elegida></p></div>
      <p class="hoja-paso"><b>2</b> Sus datos</p>
      <table class="hoja"><thead><tr><th scope="col">Dato</th><th scope="col">Valor</th><th scope="col"><span class="sr">Unidad</span></th></tr></thead><tbody data-hoja-filas>${filasGuiadas(formula, leer)}</tbody></table>
    </section>
    <section class="hoja-seccion" data-hoja-seccion="pro"${modo === 'pro' ? '' : ' hidden'}>
      <p class="hoja-pro-ayuda">Tú decides: escribe tus variables con el nombre que quieras (C0, c0, C_0 o Co valen igual) y la fórmula con esas variables, con × o *, ÷ o /, ^ y paréntesis.</p>
      <table class="hoja hoja-pro"><thead><tr><th scope="col">Variable</th><th scope="col">Valor</th></tr></thead><tbody data-hoja-pro-filas>${Array.from({ length: filas }, (_, k) => filaPro(k, leer)).join('')}</tbody></table>
      <button type="button" class="btn-enlace hoja-mas" data-hoja-pro-mas>+ Añadir variable</button>
      <label class="hoja-formula hoja-formula-pro"><span>Fórmula</span>${campoHtml('pro:formula', 'Tu fórmula', 'incógnita = expresión con tus variables', leer('pro:formula'))}</label>
    </section>
    <button type="button" class="hoja-calcular" data-lab-calcular>Calcular</button>
    <div class="hoja-salida" data-lab-hoja-salida hidden><p class="hoja-sust" data-lab-hoja-sust></p><output class="hoja-resultado" data-lab-hoja-resultado></output></div>
    <p class="hoja-nota" data-lab-hoja-nota aria-live="polite"></p>
  </div>`;
}

/* --------------------------------------------------------------------- montaje */

export interface ObjetivoHoja {
  incognita: DatoLab;
  /** Datos del enunciado (null si son los del alumno). */
  datos: Readonly<Record<string, string>> | null;
  /** En examen la hoja calcula, pero no dice nada de la fórmula ni de los datos. */
  examen: boolean;
}

export interface OpcionesHoja {
  leer?: (campo: string) => string;
  /** Lo que se pide en la pantalla (null: cuaderno libre). */
  objetivo?: () => ObjetivoHoja | null;
  /** Se avisa con el resultado escrito (para llevarlo al cuaderno o a la respuesta). */
  alCalcular?: (texto: string) => void;
  /** Cambio de modo o de filas: para guardarlo. */
  alGuardar?: (campo: string, valor: string) => void;
}

export function montarHoja(raiz: HTMLElement, o: OpcionesHoja = {}): () => void {
  const hoja = raiz.querySelector<HTMLElement>('[data-hoja]');
  if (!hoja) return () => {};
  const leer = o.leer ?? (() => '');
  const $ = <T extends HTMLElement>(sel: string) => hoja.querySelector<T>(sel)!;
  const salida = $('[data-lab-hoja-salida]');
  const nota = $('[data-lab-hoja-nota]');
  const decir = (texto: string, clase: 'bien' | 'mal' | 'aviso') => { nota.textContent = texto; nota.className = `hoja-nota hoja-${clase}`; };
  const limpiar = () => { salida.hidden = true; nota.textContent = ''; nota.className = 'hoja-nota'; };
  const valor = (campo: string) => hoja.querySelector<HTMLInputElement | HTMLSelectElement>(`[data-campo="${campo}"]`)?.value ?? leer(campo);
  const formulaElegida = () => valor('formula');
  const select = $<HTMLSelectElement>('select[data-campo="formula"]');
  select.value = leer('formula');

  const pintarFormula = () => {
    const f = formulaElegida() ? formulaPorId(formulaElegida()) : undefined;
    $('[data-lab-formula-elegida]').innerHTML = f ? formulaHtml(f.expresion) : '';
  };
  const pintarFilas = () => { $('[data-hoja-filas]').innerHTML = filasGuiadas(formulaElegida(), (c) => valor(c)); };
  pintarFormula();

  const ponerModo = (modo: 'guiada' | 'pro') => {
    hoja.dataset.hojaModo = modo;
    hoja.querySelectorAll<HTMLButtonElement>('[data-hoja-poner]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.hojaPoner === modo)));
    hoja.querySelectorAll<HTMLElement>('[data-hoja-seccion]').forEach((s) => { s.hidden = s.dataset.hojaSeccion !== modo; });
    limpiar();
    o.alGuardar?.('hoja:modo', modo);
  };

  /* Guiada: la fórmula elegida decide los datos; se calcula con su ley. */
  const calcularGuiada = () => {
    const f = formulaElegida();
    if (!f) return decir('Elige primero la fórmula.', 'mal');
    const lab = LABORATORIOS[f];
    if (!lab) return decir('Esta fórmula no calcula una sola incógnita: usa la calculadora con tus datos.', 'aviso');
    const problemas: string[] = [];
    const v: Record<string, number> = {};
    for (const d of lab.datos) {
      const l = leerDato(valor(`dato:${d.simbolo}`), d.magnitud);
      const nombre = formulaTexto(d.simbolo);
      if (l.ok === 'vacio') problemas.push(`falta ${nombre}`);
      else if (l.ok === false) problemas.push(`${nombre}: ${l.error}`);
      else if (l.aviso) problemas.push(`${nombre}: ${l.aviso}`);
      else v[d.simbolo] = l.valor;
    }
    if (problemas.length) return decir(`Antes de calcular: ${problemas.join('; ')}.`, 'mal');
    const x = lab.resolver(v);
    if (!Number.isFinite(x)) return decir('Con estos datos no sale un resultado: revisa que ningún dato valga 0 donde divide.', 'mal');
    const inc = lab.incognita;
    const numeros = Object.fromEntries(lab.datos.map((d) => [d.simbolo, d.magnitud === 'euros' ? formatear(v[d.simbolo]!, Number.isInteger(v[d.simbolo]) ? 0 : 2) : formatearExacto(v[d.simbolo]!)]));
    $('[data-lab-hoja-sust]').innerHTML = formulaHtml(sustitucion(formaDespejada(f, inc.simbolo), numeros));
    const texto = mostrar(x, inc.magnitud);
    $('[data-lab-hoja-resultado]').innerHTML = `${formulaHtml(inc.simbolo)} = ${escaparHtml(texto)}${inc.magnitud === 'tipo' ? ` <small>(${escaparHtml(formatearExacto(x))} en tanto por uno)</small>` : ''}`;
    salida.hidden = false;
    o.alCalcular?.(texto);
    const obj = o.objetivo?.() ?? null;
    if (!obj || obj.examen) return decir('Calculado con tus datos.', 'bien');
    if (inc.simbolo !== obj.incognita.simbolo) {
      return decir(`Esa fórmula calcula ${simbolo(inc.simbolo)?.nombre.toLowerCase() ?? formulaTexto(inc.simbolo)}, y te piden ${simbolo(obj.incognita.simbolo)?.nombre.toLowerCase() ?? formulaTexto(obj.incognita.simbolo)}: elige otra.`, 'mal');
    }
    if (!obj.datos) return decir('Calculado con tus datos.', 'bien');
    const distintos = lab.datos.filter((d) => {
      const e = leerDato(obj.datos![d.simbolo] ?? '', d.magnitud);
      return e.ok === true && Math.abs(e.valor - v[d.simbolo]!) > 1e-9;
    }).map((d) => formulaTexto(d.simbolo));
    if (distintos.length) decir(`Calculado, pero ${distintos.join(' y ')} no ${distintos.length > 1 ? 'coinciden' : 'coincide'} con el enunciado.`, 'aviso');
    else decir('Calculado. Los datos coinciden con el enunciado.', 'bien');
  };

  /* Pro: las variables y la fórmula del alumno. */
  const calcularModoPro = () => {
    const filas = [...hoja.querySelectorAll<HTMLElement>('[data-hoja-pro-fila]')].map((tr) => {
      const k = tr.dataset.hojaProFila!;
      return { nombre: valor(`pro:nombre:${k}`), valor: valor(`pro:valor:${k}`) };
    });
    const r = calcularPro(filas, valor('pro:formula'));
    if (!r.ok) return decir(r.error, 'mal');
    const m = magnitudDe(r.clave);
    const texto = m ? mostrar(r.valor, m) : formatearExacto(r.valor);
    $('[data-lab-hoja-sust]').textContent = r.sustitucion;
    $('[data-lab-hoja-resultado]').innerHTML = `${escaparHtml(r.incognita)} = ${escaparHtml(texto)}${m === 'tipo' ? ` <small>(${escaparHtml(formatearExacto(r.valor))} en tanto por uno)</small>` : ''}`;
    salida.hidden = false;
    o.alCalcular?.(texto);
    if (r.avisos.length) return decir(r.avisos.join(' '), 'aviso');
    const obj = o.objetivo?.() ?? null;
    if (obj && !obj.examen && r.clave && r.clave !== obj.incognita.simbolo) {
      return decir(`Has calculado ${formulaTexto(r.clave)}, y te piden ${formulaTexto(obj.incognita.simbolo)}.`, 'aviso');
    }
    decir(r.clave ? 'Calculado con tus variables.' : 'Calculado. Pon a la izquierda del «=» qué calculas (C0, Cn, i…) para saber qué es.', 'bien');
  };

  const alPulsar = (e: Event) => {
    const b = (e.target as Element).closest<HTMLButtonElement>('button');
    if (!b || !hoja.contains(b)) return;
    if (b.dataset.hojaPoner) ponerModo(b.dataset.hojaPoner as 'guiada' | 'pro');
    else if (b.hasAttribute('data-hoja-guia')) {
      const panel = $('[data-hoja-guia-panel]');
      panel.hidden = !panel.hidden;
      b.setAttribute('aria-expanded', String(!panel.hidden));
    } else if (b.hasAttribute('data-hoja-pro-mas')) {
      const cuerpo = $('[data-hoja-pro-filas]');
      const k = cuerpo.children.length;
      cuerpo.insertAdjacentHTML('beforeend', filaPro(k, () => ''));
      cuerpo.querySelector<HTMLInputElement>(`[data-campo="pro:nombre:${k}"]`)?.focus();
    } else if (b.hasAttribute('data-lab-calcular')) (hoja.dataset.hojaModo === 'pro' ? calcularModoPro : calcularGuiada)();
  };
  const alCambiar = (e: Event) => {
    const c = (e.target as Element).closest<HTMLElement>('[data-campo]');
    if (!c) return;
    limpiar();
    if (c.dataset.campo === 'formula' && e.type === 'change') { pintarFormula(); pintarFilas(); }
  };
  hoja.addEventListener('click', alPulsar);
  hoja.addEventListener('input', alCambiar);
  hoja.addEventListener('change', alCambiar);
  return () => {
    hoja.removeEventListener('click', alPulsar);
    hoja.removeEventListener('input', alCambiar);
    hoja.removeEventListener('change', alCambiar);
  };
}

/** Vuelve a pintar la hoja tras un cambio de fuera (otro ejercicio, borrar, el papel cambió la fórmula). */
export function refrescarHoja(raiz: HTMLElement, leer: (campo: string) => string): void {
  const hoja = raiz.querySelector<HTMLElement>('[data-hoja]');
  if (!hoja) return;
  const select = hoja.querySelector<HTMLSelectElement>('select[data-campo="formula"]')!;
  select.value = leer('formula');
  const f = select.value ? formulaPorId(select.value) : undefined;
  hoja.querySelector<HTMLElement>('[data-lab-formula-elegida]')!.innerHTML = f ? formulaHtml(f.expresion) : '';
  hoja.querySelector<HTMLElement>('[data-hoja-filas]')!.innerHTML = filasGuiadas(select.value, leer);
  hoja.querySelector<HTMLElement>('[data-lab-hoja-salida]')!.hidden = true;
  const nota = hoja.querySelector<HTMLElement>('[data-lab-hoja-nota]')!;
  nota.textContent = '';
  nota.className = 'hoja-nota';
}
