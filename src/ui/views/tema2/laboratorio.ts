/*
 * Laboratorio de una fórmula (el mismo para las 19): el cuaderno a la izquierda, la animación en el
 * centro (se amplía sin salir de la página) y la calculadora a la derecha. El selector
 * DIGITAL/ANALÓGICO cambia la forma del cuaderno y de la calculadora, no el ejercicio: los dos modos
 * escriben en el mismo estado (cada campo tiene su data-campo y todos los que lo comparten se
 * mantienen iguales) y usan el mismo motor de cálculo. En ANALÓGICO el cuaderno es papel pautado que
 * sube desde detrás de la animación; ocultarlo no borra nada.
 *
 * El ejercicio por defecto es el caso de la animación (Escena.caso): el enunciado lo muestra y el
 * cuaderno se compara con él. Si el alumno prefiere sus propios datos, se dice claramente que la
 * animación sigue enseñando su caso de ejemplo. Lo escrito se guarda en este navegador, por fórmula.
 */
import { formulaPorId } from '../../../content/temas/tema-02/formulas.ts';
import { simbolo } from '../../../content/temas/tema-02/simbolos.ts';
import { calcular, formatearExacto } from '../../../domain/tema2/expresion.ts';
import { comprobar, esperado, LABORATORIOS, leerDato, type Magnitud } from '../../../domain/tema2/laboratorio.ts';
import { htmlCalculadora, montarCalculadora } from '../../components/calculadora.ts';
import { expandir } from '../../components/reproductorExpandido.ts';
import { ESCENAS } from '../../escenas/index.ts';
import { formulaTexto, simbolosDe } from '../../matematica/formula.ts';
import { asegurarGrano, ruido } from '../../motion/papel.ts';
import { montarReproductor } from '../../motion/reproductor.ts';
import { escaparHtml, formulaHtml } from './comun.ts';

type Modo = 'digital' | 'analogico';
const CLAVE_MODO = 'fa-lab-modo';
const claveEstado = (id: string) => `fa-lab:${id}`;

/** Datos que pide la fórmula: los de su laboratorio o, si no calcula una incógnita, todos sus símbolos. */
function datosDe(id: string): { simbolo: string; magnitud: Magnitud }[] {
  const lab = LABORATORIOS[id];
  if (lab) return [...lab.datos];
  return simbolosDe(formulaPorId(id)!.expresion).map((s) => ({ simbolo: s, magnitud: 'euros' as const }));
}

const PISTA_DATO: Record<Magnitud, string> = { euros: '3.000', tipo: '7 % o 0,07', tiempo: '3 o 195/365', partes: '12' };
/** Unidad de cada dato, para reconocerlo de un vistazo. n va en la unidad del tipo (homogeneidad). */
const UNIDAD: Record<Magnitud, { texto: string; titulo: string }> = {
  euros: { texto: '€', titulo: 'euros' },
  tipo: { texto: '%', titulo: 'con el signo % o en tanto por uno' },
  tiempo: { texto: 'periodos', titulo: 'en la misma unidad que el tipo: años si el tipo es anual' },
  partes: { texto: 'm', titulo: 'partes del año' },
};

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

const campo = (nombre: string, etiqueta: string, pista: string, extra = '') =>
  `<input class="lab-campo" type="text" data-campo="${nombre}" aria-label="${escaparHtml(etiqueta)}" placeholder="${escaparHtml(pista)}" autocomplete="off" spellcheck="false"${extra}>`;

function filaDatos(id: string, papel: boolean): string {
  return `<div class="lab-datos">${datosDe(id).map((d) => {
    const u = UNIDAD[d.magnitud];
    return `<label class="lab-dato"><span class="lab-sim">${formulaHtml(d.simbolo)}${papel ? ' =' : ''}</span>
    <span class="lab-dato-celda">${campo(`dato:${d.simbolo}`, `${simbolo(d.simbolo)?.nombre ?? d.simbolo} (${u.titulo})`, PISTA_DATO[d.magnitud])}<abbr class="lab-unidad" title="${escaparHtml(u.titulo)}">${u.texto}</abbr></span>
    <small class="lab-salida" data-salida="dato:${d.simbolo}"></small></label>`;
  }).join('')}</div>`;
}

function selectorIncognita(id: string): string {
  const f = formulaPorId(id)!;
  const opciones = simbolosDe(f.expresion).map((s) => `<option value="${s}">${escaparHtml(formulaTexto(s))} · ${escaparHtml(simbolo(s)?.nombre ?? s)}</option>`).join('');
  return `<select class="lab-campo" data-campo="incognita" aria-label="Incógnita"><option value="">¿Qué te piden?</option>${opciones}</select><small class="lab-salida" data-salida="incognita"></small>`;
}

/** Los pasos del cuaderno; `papel` cambia solo la forma (papel pautado y letra manuscrita). */
function pasos(id: string, papel: boolean): string {
  const fila = (n: number, titulo: string, cuerpo: string, clase = '') =>
    `<li class="lab-paso ${clase}"><span class="lab-paso-n" aria-hidden="true">${n}</span><div class="lab-paso-cuerpo"><p class="lab-paso-tit">${titulo}${papel ? ':' : ''}</p>${cuerpo}</div></li>`;
  const f = formulaPorId(id)!;
  return `<ol class="lab-pasos">
    ${fila(1, 'Datos', filaDatos(id, papel), 'lab-paso-datos')}
    ${fila(2, 'Incógnita', selectorIncognita(id))}
    ${fila(3, 'Fórmula', `${campo('formula', 'Fórmula', 'La fórmula que vas a usar')}
      <button type="button" class="lab-pista" data-lab-pista aria-expanded="false">¿Cuál era?</button><p class="lab-pista-fx" hidden>${formulaHtml(f.expresion)}</p>`)}
    ${fila(4, 'Despeje', campo('despeje', 'Despeje', 'Si la incógnita no está sola, despéjala'))}
    ${fila(5, 'Sustitución', `${campo('sustitucion', 'Sustitución', 'Los números en su sitio: 12100 ÷ (1 + 3 × 0,07)')}<small class="lab-salida lab-derivado" data-salida="sustitucion"></small>`)}
    ${fila(6, 'Operaciones', `<textarea class="lab-campo" data-campo="operaciones" rows="3" aria-label="Operaciones" placeholder="Una operación por línea" spellcheck="false"></textarea><small class="lab-salida lab-derivado lab-salida-lineas" data-salida="operaciones"></small>`)}
    ${fila(7, 'Resultado', `<div class="lab-resultado">${campo('resultado', 'Resultado', 'Tu resultado')}<button type="button" class="lab-comprobar" data-lab-comprobar>Comprobar</button></div><p class="lab-veredicto" data-salida="resultado" aria-live="polite"></p>`, 'lab-paso-resultado')}
    ${papel ? fila(8, 'Siguiente paso', `<textarea class="lab-campo" data-campo="notas" rows="2" aria-label="Notas" placeholder="Escribe aquí el siguiente paso…"></textarea>`) : ''}
  </ol>`;
}

/** Enunciado del caso de la animación, escrito con sus datos y su incógnita (sin inventar nada). */
function enunciadoCaso(id: string): string {
  const caso = ESCENAS[id]?.caso;
  const lab = LABORATORIOS[id];
  if (!caso || !lab) return '';
  const datos = lab.datos.map((d) => `${formulaHtml(d.simbolo)} = ${escaparHtml(caso[d.simbolo]!)}`);
  const lista = datos.length > 1 ? `${datos.slice(0, -1).join(', ')} y ${datos.at(-1)}` : datos[0];
  const inc = lab.incognita.simbolo;
  return `Te dan ${lista}. Calcula ${formulaHtml(inc)}, ${escaparHtml((simbolo(inc)?.nombre ?? inc).toLowerCase())}.`;
}

export function htmlLaboratorio(id: string): string {
  const escena = ESCENAS[id];
  const hayCaso = Boolean(escena?.caso && LABORATORIOS[id]);
  return `<div class="lab" data-laboratorio="${id}" data-modo="digital" data-ejercicio="${hayCaso ? 'animacion' : 'propio'}">
    <div class="lab-barra">
      ${hayCaso ? `<div class="lab-caso" aria-live="polite">
        <p class="lab-caso-volanta"><span data-lab-caso-origen>Ejercicio · el caso de la animación</span></p>
        <p class="lab-caso-texto" data-lab-caso-texto>${enunciadoCaso(id)}</p>
        <p class="lab-caso-estado" data-lab-caso-estado></p>
        <button type="button" class="lab-mini" data-lab-ejercicio>Usar mis propios datos</button>
      </div>` : '<div class="lab-caso"><p class="lab-caso-volanta">Cuaderno libre</p><p class="lab-caso-texto">Esta fórmula compara o liquida importes: usa el cuaderno y la calculadora con tus datos.</p></div>'}
      <div class="lab-modo" role="group" aria-label="Forma de trabajar">
        <button type="button" data-lab-modo="digital" aria-pressed="true">Digital</button>
        <button type="button" data-lab-modo="analogico" aria-pressed="false">Analógico</button>
      </div>
    </div>
    <section class="lab-panel lab-cuaderno" aria-labelledby="lab-cuaderno-tit">
      <header class="lab-panel-cab"><h2 id="lab-cuaderno-tit"><span>01</span>Cuaderno de trabajo</h2>
        <button type="button" class="lab-mini" data-lab-limpiar>Borrar el cuaderno</button></header>
      ${pasos(id, false)}
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
  const caso = escena?.caso;
  const datos = datosDe(id);
  const paradas: (() => void)[] = [];

  // Estado compartido por los dos modos, guardado por fórmula.
  let estado: Record<string, string> = {};
  try { estado = JSON.parse(localStorage.getItem(claveEstado(id)) ?? '{}') as Record<string, string>; } catch { estado = {}; }
  const guardar = () => { try { localStorage.setItem(claveEstado(id), JSON.stringify(estado)); } catch { /* sin almacenamiento: se trabaja igual */ } };
  const campos = (nombre: string) => [...lab.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(`[data-campo="${nombre}"]`)];
  const salidas = (nombre: string) => [...lab.querySelectorAll<HTMLElement>(`[data-salida="${nombre}"]`)];
  const decir = (nombre: string, html: string, clase = '') => salidas(nombre).forEach((s) => {
    s.innerHTML = html;
    s.classList.remove('lab-bien', 'lab-mal', 'lab-aviso');
    if (clase) s.classList.add(clase);
  });
  const conCaso = () => Boolean(caso && definicion) && (estado.ejercicio ?? 'animacion') === 'animacion';

  /** Valor de un dato del caso de la animación. */
  const valorCaso = (s: string, m: Magnitud): number | null => {
    const l = caso?.[s] !== undefined ? leerDato(caso[s]!, m) : null;
    return l && l.ok === true ? l.valor : null;
  };
  /** Valores de los datos ya escritos (para la calculadora y el comprobador). */
  const valores = (): Record<string, number> => {
    const v: Record<string, number> = {};
    for (const d of datos) {
      const l = leerDato(estado[`dato:${d.simbolo}`] ?? '', d.magnitud);
      if (l.ok === true) v[d.simbolo] = l.valor;
    }
    return v;
  };

  /** ¿El cuaderno resuelve el mismo ejercicio que la animación? Lo dice el enunciado y la escena. */
  const coherencia = () => {
    const estadoCaso = lab.querySelector<HTMLElement>('[data-lab-caso-estado]');
    const nota = lab.querySelector<HTMLElement>('[data-lab-escena-nota]');
    const origen = lab.querySelector<HTMLElement>('[data-lab-caso-origen]');
    const texto = lab.querySelector<HTMLElement>('[data-lab-caso-texto]');
    const boton = lab.querySelector<HTMLButtonElement>('[data-lab-ejercicio]');
    lab.dataset.ejercicio = conCaso() ? 'animacion' : 'propio';
    if (!caso || !definicion) return;
    if (!conCaso()) {
      if (origen) origen.textContent = 'Ejercicio propio';
      if (texto) texto.textContent = 'Escribe tus datos en el cuaderno: la calculadora y la comprobación usan los tuyos.';
      if (estadoCaso) estadoCaso.textContent = '';
      if (nota) nota.textContent = 'La animación enseña su caso de ejemplo, no tus datos.';
      if (boton) boton.textContent = 'Volver al caso de la animación';
      return;
    }
    if (origen) origen.textContent = 'Ejercicio · el caso de la animación';
    if (texto) texto.innerHTML = enunciadoCaso(id);
    if (boton) boton.textContent = 'Usar mis propios datos';
    if (nota) nota.textContent = '';
    const v = valores();
    const escritos = datos.filter((d) => v[d.simbolo] !== undefined);
    const iguales = escritos.filter((d) => Math.abs(v[d.simbolo]! - (valorCaso(d.simbolo, d.magnitud) ?? NaN)) < 1e-9);
    if (!estadoCaso) return;
    estadoCaso.classList.remove('lab-bien', 'lab-aviso');
    if (!escritos.length) estadoCaso.textContent = 'Copia los datos al cuaderno, con su símbolo.';
    else if (iguales.length === datos.length) { estadoCaso.textContent = 'El cuaderno y la animación resuelven el mismo ejercicio.'; estadoCaso.classList.add('lab-bien'); }
    else if (iguales.length < escritos.length) { estadoCaso.textContent = 'Algún dato del cuaderno no es el del enunciado.'; estadoCaso.classList.add('lab-aviso'); }
    else estadoCaso.textContent = `Llevas ${iguales.length} de ${datos.length} datos.`;
  };

  const evaluar = (nombre: string) => {
    const texto = estado[nombre] ?? '';
    if (nombre.startsWith('dato:')) {
      const d = datos.find((x) => `dato:${x.simbolo}` === nombre);
      if (!d) return;
      const l = leerDato(texto, d.magnitud);
      const delCaso = conCaso() ? valorCaso(d.simbolo, d.magnitud) : null;
      if (l.ok === 'vacio') decir(nombre, '');
      else if (l.ok === false) decir(nombre, escaparHtml(l.error), 'lab-mal');
      else if (l.aviso) decir(nombre, escaparHtml(l.aviso), 'lab-aviso');
      else if (delCaso !== null && Math.abs(l.valor - delCaso) > 1e-9) decir(nombre, `El enunciado dice ${escaparHtml(caso![d.simbolo]!)}.`, 'lab-aviso');
      // La equivalencia solo se enseña si aporta algo (un %, una operación); nunca se cambia lo escrito.
      else decir(nombre, /[%÷×*/+^()√a-z]|\d\s*-/i.test(texto.replace(/€|años?|meses|días/gi, '')) ? `= ${escaparHtml(formatearExacto(l.valor))}` : '');
    } else if (nombre === 'incognita') {
      if (!texto || !definicion) decir(nombre, '');
      else decir(nombre, texto === definicion.incognita.simbolo ? 'Bien: es lo que te piden.' : 'Mira la pregunta: ¿qué cantidad no conoces?', texto === definicion.incognita.simbolo ? 'lab-bien' : 'lab-aviso');
    } else if (nombre === 'sustitucion') {
      if (!texto.trim()) return decir(nombre, '');
      const r = calcular(texto);
      decir(nombre, r.ok ? `= ${escaparHtml(formatearExacto(r.valor))}` : escaparHtml(r.error), r.ok ? '' : 'lab-mal');
    } else if (nombre === 'operaciones') {
      const lineas = texto.split('\n').filter((l) => l.trim());
      decir(nombre, lineas.map((l) => {
        const r = calcular(l.split('=')[0]!);
        return r.ok ? `<span>= ${escaparHtml(formatearExacto(r.valor))}</span>` : '<span class="lab-mal">—</span>';
      }).join(''));
    }
  };
  const evaluarTodo = () => { for (const d of datos) evaluar(`dato:${d.simbolo}`); coherencia(); };

  const escribir = (nombre: string, valor: string, origen?: Element) => {
    estado[nombre] = valor;
    campos(nombre).forEach((c) => { if (c !== origen) c.value = valor; });
    evaluar(nombre);
    if (nombre === 'resultado') decir('resultado', '');
    if (nombre.startsWith('dato:')) coherencia();
    guardar();
  };

  // Estado inicial en todos los campos (los dos modos).
  for (const [nombre, valor] of Object.entries(estado)) {
    campos(nombre).forEach((c) => { c.value = valor; });
    evaluar(nombre);
  }
  evaluarTodo();

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

  const alPulsar = (e: Event) => {
    const b = (e.target as Element).closest<HTMLButtonElement>('button');
    if (!b || !lab.contains(b)) return;
    if (b.dataset.labModo) ponerModo(b.dataset.labModo as Modo);
    else if (b.hasAttribute('data-lab-abrir-papel')) abrirPapel(!lab.classList.contains('lab-papel-abierto'));
    else if (b.hasAttribute('data-lab-ampliar') && escena) expandir(figura, { tipo: 'escena', escena, volanta: `Fórmula ${formulaPorId(id)!.numero} · Laboratorio` });
    else if (b.hasAttribute('data-lab-ejercicio')) {
      estado.ejercicio = conCaso() ? 'propio' : 'animacion';
      guardar();
      evaluarTodo();
    } else if (b.hasAttribute('data-lab-pista')) {
      const fx = b.nextElementSibling as HTMLElement;
      fx.hidden = !fx.hidden;
      b.setAttribute('aria-expanded', String(!fx.hidden));
    } else if (b.hasAttribute('data-lab-limpiar')) {
      const ejercicio = estado.ejercicio;
      estado = ejercicio ? { ejercicio } : {};
      guardar();
      lab.querySelectorAll<HTMLInputElement>('[data-campo]').forEach((c) => { c.value = ''; });
      lab.querySelectorAll<HTMLElement>('[data-salida]').forEach((s) => { s.innerHTML = ''; });
      evaluarTodo();
    } else if (b.hasAttribute('data-lab-comprobar')) {
      if (!definicion) return decir('resultado', 'Esta fórmula compara o liquida importes: no hay una incógnita que comprobar aquí.', 'lab-aviso');
      const x = esperado(definicion, valores());
      if (x === null) return decir('resultado', 'Primero escribe todos los datos.', 'lab-aviso');
      const v = comprobar(estado.resultado ?? '', definicion, x);
      decir('resultado', escaparHtml(v.mensaje), v.bien ? 'lab-bien' : 'lab-mal');
    }
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
