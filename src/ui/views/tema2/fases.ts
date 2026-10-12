/*
 * Fases B, C y D del Tema 2 sobre los mismos enunciados (src/content/temas/tema-02/ejercicios.ts):
 *  B · Identificar los datos: se pulsa un fragmento del enunciado y se le asigna su símbolo. El
 *      fragmento toma el color del símbolo y pasa a la tabla de datos con su valor y su significado.
 *  C · Elegir la fórmula: con los datos ya identificados, se elige entre fórmulas del índice y se
 *      explica por qué esa sí y por qué las otras no.
 *  D · Practicar en papel: la web solo comprueba el resultado; las ayudas se retiran por niveles y
 *      la solución completa no aparece hasta haberlo intentado.
 * No se guarda nada: el progreso y su persistencia siguen siendo los del resto de la web.
 */
import { htmlAleatorioPapel, montarAleatorioPapel } from './aleatorioPapel.ts';
import { formulaPorId, type BloqueId } from '../../../content/temas/tema-02/formulas.ts';
import { ejerciciosDe, type DatoEnunciado, type EjercicioTema2 } from '../../../content/temas/tema-02/ejercicios.ts';
import { simbolo } from '../../../content/temas/tema-02/simbolos.ts';
import { claseSimbolo, formulaTexto } from '../../matematica/formula.ts';
import { escaparHtml, formulaHtml, hrefFormula, textoT2 } from './comun.ts';
import { hrefFase } from '../../../app/router.ts';

/* ------------------------------------------------------------------------------- utilidades */

/** Símbolos que se ofrecen en cada bloque para identificar los datos. */
export const PALETA: Record<BloqueId, string[]> = {
  simple: ['C_0', 'C_n', 'I', 'i', 'n', 'm'],
  compuesta: ['C_0', 'C_n', 'I', 'i', 'n', 'm', 'i_m', 'J_m', 'TAE'],
  descuento: ['N', 'E', 'D_c', 'D_r', 'C_n', 'C_0', 'd', 'i', 'n', 'm'],
};

/** Pista por papel cuando se falla dos veces el mismo dato. */
const PISTA_PAPEL: Record<string, string> = {
  presente: 'es un importe de hoy (lo que se invierte o lo que se recibe al descontar).',
  futuro: 'es un importe del final de la operación.',
  interes: 'es lo que ha producido el capital.',
  descuento: 'es lo que se resta al cobrar antes.',
  tipo: 'es una tasa: un porcentaje por periodo.',
  tiempo: 'es una duración.',
  fraccion: 'dice en cuántas partes se divide el año.',
};

/** Fragmentos del enunciado en orden de aparición (datos e incógnita). */
export function fragmentos(ej: EjercicioTema2): (DatoEnunciado & { inicio: number; incognita: boolean })[] {
  const todos = [...ej.datos.map((d) => ({ ...d, incognita: false })), ...(ej.incognita ? [{ ...ej.incognita, incognita: true }] : [])];
  return todos.map((d) => ({ ...d, inicio: ej.enunciado.indexOf(d.texto) })).sort((a, b) => a.inicio - b.inicio);
}

/** Enunciado con los fragmentos como botones (fase B) o ya marcados con su color (fase C). */
function enunciadoHtml(ej: EjercicioTema2, modo: 'botones' | 'marcado'): string {
  let html = '';
  let cursor = 0;
  fragmentos(ej).forEach((f, k) => {
    html += escaparHtml(ej.enunciado.slice(cursor, f.inicio));
    const texto = escaparHtml(f.texto);
    html += modo === 'botones'
      ? `<button type="button" class="t2-frag" data-frag="${k}" aria-pressed="false">${texto}</button>`
      : `<mark class="t2-marcado s ${claseSimbolo(f.clave)}">${texto}</mark>`;
    cursor = f.inicio + f.texto.length;
  });
  return html + escaparHtml(ej.enunciado.slice(cursor));
}

const fuente = (ej: EjercicioTema2) => `<p class="t2-ej-fuente">${escaparHtml(ej.fuente)}</p>`;

/* ------------------------------------------------------------------------ B · los datos */

export function htmlIdentificar(bloque: BloqueId): string {
  const ejercicios = ejerciciosDe(bloque).filter((e) => e.incognita);
  return `<div class="t2-fase" data-fase="datos">
    <p class="t2-instruccion">Antes de calcular nada: pulsa cada dato subrayado del enunciado y elige qué símbolo es. Al acertar se colorea igual que en el índice y pasa a tu tabla de datos.</p>
    <p class="t2-marcador" data-t2-marcador-datos aria-live="polite">0 de ${ejercicios.length} enunciados completos.</p>
    ${ejercicios.map((ej, k) => `
    <article class="t2-ident" data-ident="${ej.id}" id="t2-ej-${ej.id}">
      <header><span class="t2-ej-num">${k + 1}</span>${fuente(ej)}</header>
      <p class="t2-enunciado">${enunciadoHtml(ej, 'botones')}</p>
      <div class="t2-paleta" role="group" aria-label="¿Qué símbolo es?">${PALETA[bloque].map((c) =>
        `<button type="button" class="t2-sim" data-sim="${c}" title="${escaparHtml(simbolo(c)?.nombre ?? c)}">${formulaHtml(c)}<small>${escaparHtml(simbolo(c)?.nombre ?? '')}</small></button>`).join('')}</div>
      <p class="t2-aviso" aria-live="polite" data-t2-aviso>Pulsa un dato del enunciado.</p>
      <table class="t2-tabla"><thead><tr><th scope="col">En el enunciado</th><th scope="col">Símbolo</th><th scope="col">En la fórmula</th></tr></thead><tbody></tbody></table>
      <p class="t2-hecho" hidden>Datos completos. <a href="${hrefFase(bloque, 'elegir')}#t2-ej-${ej.id}">Ahora, ¿qué fórmula?</a></p>
    </article>`).join('')}
  </div>`;
}

function montarIdentificar(raiz: HTMLElement, bloque: BloqueId): (e: Event) => void {
  const estado = new Map<string, { activo: number | null; fallos: Map<number, number>; hechos: Set<number> }>();
  const marcador = () => {
    const total = raiz.querySelectorAll('[data-ident]').length;
    const hechos = raiz.querySelectorAll('[data-ident].completo').length;
    const el = raiz.querySelector('[data-t2-marcador-datos]');
    if (el) el.textContent = `${hechos} de ${total} enunciados completos.`;
  };
  return (evento) => {
    const objetivo = evento.target as Element | null;
    const tarjeta = objetivo?.closest<HTMLElement>('[data-ident]');
    if (!tarjeta) return;
    const ej = ejerciciosDe(bloque).find((e) => e.id === tarjeta.dataset.ident)!;
    const frags = fragmentos(ej);
    const st = estado.get(ej.id) ?? { activo: null, fallos: new Map(), hechos: new Set() };
    estado.set(ej.id, st);
    const aviso = tarjeta.querySelector<HTMLElement>('[data-t2-aviso]')!;
    const fragBoton = objetivo!.closest<HTMLButtonElement>('[data-frag]');
    if (fragBoton) {
      if (fragBoton.disabled) return;
      st.activo = Number(fragBoton.dataset.frag);
      tarjeta.querySelectorAll('[data-frag]').forEach((b) => b.setAttribute('aria-pressed', String(b === fragBoton)));
      aviso.innerHTML = `«${escaparHtml(frags[st.activo]!.texto)}» es…`;
      return;
    }
    const simBoton = objetivo!.closest<HTMLButtonElement>('[data-sim]');
    if (!simBoton) return;
    if (st.activo === null) {
      aviso.textContent = 'Primero pulsa un dato del enunciado.';
      return;
    }
    const k = st.activo;
    const f = frags[k]!;
    const elegido = simBoton.dataset.sim!;
    const boton = tarjeta.querySelector<HTMLButtonElement>(`[data-frag="${k}"]`)!;
    const fallos = st.fallos.get(k) ?? 0;
    if (elegido !== f.clave && fallos < 2) {
      st.fallos.set(k, fallos + 1);
      const s = simbolo(elegido);
      const pista = fallos + 1 >= 2 ? ` Pista: ${PISTA_PAPEL[simbolo(f.clave)!.papel]}` : '';
      aviso.innerHTML = `${formulaHtml(elegido)} no: ${escaparHtml((s?.significado ?? '').replace(/\.$/, ''))}.${escaparHtml(pista)}`;
      boton.classList.remove('t2-sacude');
      void boton.offsetWidth;
      boton.classList.add('t2-sacude');
      return;
    }
    // Acierto (o, tras dos fallos, se enseña la respuesta).
    st.hechos.add(k);
    st.activo = null;
    boton.disabled = true;
    boton.setAttribute('aria-pressed', 'false');
    boton.classList.add('ok', 's', claseSimbolo(f.clave));
    const s = simbolo(f.clave)!;
    aviso.innerHTML = `${elegido === f.clave ? 'Bien' : 'Era este'}: «${escaparHtml(f.texto)}» es ${formulaHtml(f.clave)}, ${escaparHtml(s.nombre.toLowerCase())}.`;
    const fila = document.createElement('tr');
    fila.className = 't2-fila-nueva';
    fila.innerHTML = `<td>«${escaparHtml(f.texto)}»</td><td>${formulaHtml(f.clave)}<small>${escaparHtml(s.nombre)}</small></td><td>${f.incognita ? '<b class="t2-incognita">? · lo que te piden</b>' : escaparHtml(f.valor)}</td>`;
    tarjeta.querySelector('tbody')!.append(fila);
    if (st.hechos.size === frags.length) {
      tarjeta.classList.add('completo');
      tarjeta.querySelector<HTMLElement>('.t2-hecho')!.hidden = false;
      marcador();
    }
  };
}

/* ----------------------------------------------------------------------- C · la fórmula */

/** Por qué una alternativa no sirve para el enunciado (la propia o una deducida del índice). */
export function razonNo(opcion: string, ej: EjercicioTema2): string {
  const propia = ej.porQueNo?.[opcion];
  if (propia) return propia;
  const o = formulaPorId(opcion)!;
  const pedida = ej.incognita?.clave;
  const regimen = (b: string) => (b === 'simple' ? 'capitalización simple' : b === 'compuesta' ? 'capitalización compuesta' : 'descuento');
  if (o.bloque !== ej.bloque && o.bloque !== 'descuento' && ej.bloque !== 'descuento') {
    return `Es de ${regimen(o.bloque)} y el enunciado es de ${regimen(ej.bloque)}.`;
  }
  if (o.calcula && pedida && o.calcula !== pedida) {
    return `Sirve para calcular ${formulaTexto(o.calcula)} (${simbolo(o.calcula)!.nombre.toLowerCase()}), y te piden ${formulaTexto(pedida)} (${simbolo(pedida)!.nombre.toLowerCase()}).`;
  }
  return `No encaja con este enunciado. Se usa cuando: ${o.reconocer}`;
}

export function htmlElegir(bloque: BloqueId): string {
  const ejercicios = ejerciciosDe(bloque);
  return `<div class="t2-fase" data-fase="elegir">
    <p class="t2-instruccion">Los datos ya están identificados. Mira qué te dan y qué te piden, y elige la fórmula. Después lee por qué esa sí y por qué las demás no.</p>
    <p class="t2-marcador" data-t2-marcador-elegir aria-live="polite">Llevas 0 de ${ejercicios.length}.</p>
    ${ejercicios.map((ej, k) => `
    <fieldset class="t2-elegir" data-elegir="${ej.id}" id="t2-ej-${ej.id}">
      <legend><span class="t2-ej-num">${k + 1}</span>${fuente(ej)}</legend>
      <p class="t2-enunciado">${enunciadoHtml(ej, 'marcado')}</p>
      <ul class="t2-datos-chips">${ej.datos.map((d) => `<li>${formulaHtml(d.clave)}<span>${escaparHtml(d.valor)}</span></li>`).join('')}${ej.incognita ? `<li class="t2-chip-incognita">${formulaHtml(ej.incognita.clave)}<span>?</span></li>` : '<li class="t2-chip-incognita"><span>Te piden: lo que se cobra</span></li>'}</ul>
      <div class="t2-opciones">${ej.opciones.map((id) => {
        const f = formulaPorId(id)!;
        return `<button type="button" class="t2-opcion" data-opcion="${id}"><small>Fórmula ${f.numero} · ${escaparHtml(f.nombre)}</small>${formulaHtml(f.expresion)}</button>`;
      }).join('')}</div>
      <div class="t2-explica" hidden aria-live="polite"></div>
    </fieldset>`).join('')}
  </div>`;
}

function montarElegir(raiz: HTMLElement, bloque: BloqueId): (e: Event) => void {
  let aciertos = 0;
  let respondidas = 0;
  return (evento) => {
    const boton = (evento.target as Element | null)?.closest<HTMLButtonElement>('[data-opcion]');
    const caja = boton?.closest<HTMLElement>('[data-elegir]');
    if (!boton || !caja || caja.dataset.respondida) return;
    const ej = ejerciciosDe(bloque).find((e) => e.id === caja.dataset.elegir)!;
    const elegida = boton.dataset.opcion!;
    const bien = elegida === ej.formula;
    caja.dataset.respondida = bien ? 'bien' : 'mal';
    caja.querySelectorAll<HTMLButtonElement>('[data-opcion]').forEach((b) => {
      b.disabled = true;
      if (b.dataset.opcion === ej.formula) b.classList.add('correcta');
    });
    if (!bien) boton.classList.add('incorrecta');
    const correcta = formulaPorId(ej.formula)!;
    const otras = ej.opciones.filter((o) => o !== ej.formula && o !== elegida);
    const explica = caja.querySelector<HTMLElement>('.t2-explica')!;
    explica.innerHTML = `
      <p class="t2-veredicto ${bien ? 'bien' : 'mal'}"><b>${bien ? 'Correcto.' : 'No es esa.'}</b> ${bien ? '' : textoT2(razonNo(elegida, ej))}</p>
      <p><b>Fórmula ${correcta.numero}:</b> ${formulaHtml(correcta.expresion)} — ${textoT2(ej.porQue)} <a href="${hrefFormula(correcta.id)}">Ver su animación</a></p>
      ${otras.length ? `<ul class="t2-otras">${otras.map((o) => `<li><b>Fórmula ${formulaPorId(o)!.numero}:</b> ${textoT2(razonNo(o, ej))}</li>`).join('')}</ul>` : ''}`;
    explica.hidden = false;
    respondidas++;
    if (bien) aciertos++;
    const total = raiz.querySelectorAll('[data-elegir]').length;
    const m = raiz.querySelector('[data-t2-marcador-elegir]');
    if (m) m.textContent = respondidas < total ? `Llevas ${aciertos} de ${respondidas} (${total} en total).` : `Resultado: ${aciertos} de ${total}.`;
  };
}

/* --------------------------------------------------------------------- D · en papel */

const NIVELES: Record<EjercicioTema2['nivel'], string> = {
  1: 'Con los datos y la fórmula a la vista',
  2: 'Con pistas si las necesitas',
  3: 'Pistas solo después de intentarlo',
  4: 'Como en el examen',
};

const PISTAS = ['Los datos', 'La fórmula', 'La sustitución'] as const;

/** Lee un número escrito a la española (1.234,56 · 0,06 · 6 % · 2,78). */
export function leerNumero(texto: string): { valor: number; porcentaje: boolean } | null {
  const porcentaje = texto.includes('%');
  let t = texto.replace(/[€%\s]/g, '').replace(/años?$/i, '');
  if (!t) return null;
  if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.');
  else if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, '');
  const valor = Number(t);
  return Number.isFinite(valor) ? { valor, porcentaje } : null;
}

/** Comprueba una respuesta. Devuelve si es correcta y, si no, un aviso concreto. */
export function comprobar(ej: EjercicioTema2, texto: string): { bien: boolean; aviso: string } {
  const leido = leerNumero(texto);
  if (!leido) return { bien: false, aviso: 'Escribe solo el número (por ejemplo 1.234,56).' };
  const { tipo, valor: esperado } = ej.respuesta;
  const tolerancia = ej.respuesta.tolerancia ?? (tipo === 'euros' ? 0.011 : tipo === 'tanto' ? 0.0005 : 0.01);
  let v = leido.valor;
  if (tipo === 'tanto' && leido.porcentaje) v /= 100;
  if (Math.abs(v - esperado) <= tolerancia) return { bien: true, aviso: '' };
  if (tipo === 'tanto' && !leido.porcentaje && Math.abs(v / 100 - esperado) <= tolerancia) {
    return { bien: false, aviso: 'Parece que lo has escrito en porcentaje sin el símbolo: escribe «6 %» o «0,06».' };
  }
  if (Math.abs(v - esperado * 100) <= tolerancia * 100 || Math.abs(v * 100 - esperado) <= tolerancia) {
    return { bien: false, aviso: 'Te sale 100 veces más grande o más pequeño: ¿has pasado el tipo a tanto por uno (7 % → 0,07)?' };
  }
  return { bien: false, aviso: 'No coincide. Repasa los datos y la unidad del tiempo, y vuelve a calcular.' };
}

export function htmlPractica(bloque: BloqueId): string {
  const ejercicios = [...ejerciciosDe(bloque)].sort((a, b) => a.nivel - b.nivel);
  return `<div class="t2-fase" data-fase="practica">
    <p class="t2-instruccion"><b>Papel y calculadora.</b> Resuelve cada ejercicio en tu cuaderno; aquí solo compruebas el resultado. Empieza por el aleatorio, que no se acaba nunca, o sigue los casos guiados de abajo, en los que las ayudas se van retirando.</p>
    ${htmlAleatorioPapel(bloque)}
    <h2 class="t2-guiados-tit">Casos guiados</h2>
    ${ejercicios.map((ej, k) => {
      const f = formulaPorId(ej.formula)!;
      const datos = `<dl class="t2-datos-chips t2-datos-papel">${ej.datos.map((d) => `<div>${formulaHtml(d.clave)}<span>${escaparHtml(d.valor)}</span></div>`).join('')}</dl>`;
      const visibles = ej.nivel === 1 ? [0, 1] : ej.nivel === 2 ? [0] : [];
      const pistas = ej.nivel === 4 ? [] : [0, 1, 2].filter((p) => !visibles.includes(p));
      const contenido = [datos, `<p class="t2-papel-fx">${formulaHtml(f.expresion)}</p>`, `<p class="t2-papel-fx">${textoT2(ej.sustitucion)}</p>`];
      const unidad = ej.respuesta.tipo === 'euros' ? '€' : ej.respuesta.tipo === 'anos' ? 'años' : '';
      const ejemplo = ej.respuesta.tipo === 'euros' ? 'p. ej. 1.234,56' : ej.respuesta.tipo === 'anos' ? 'p. ej. 2,5' : 'p. ej. 0,05 o 5 %';
      return `
    <article class="t2-practica" data-practica="${ej.id}" data-nivel="${ej.nivel}" data-intentos="0" id="t2-ej-${ej.id}">
      <header><span class="t2-ej-num">${k + 1}</span><span class="t2-nivel t2-nivel-${ej.nivel}">Nivel ${ej.nivel} · ${NIVELES[ej.nivel]}</span>${fuente(ej)}</header>
      <p class="t2-enunciado">${escaparHtml(ej.enunciado)}</p>
      ${visibles.map((p) => `<div class="t2-ayuda">${contenido[p]}</div>`).join('')}
      ${pistas.length ? `<div class="t2-pistas">${pistas.map((p) => `<button type="button" class="btn-control" data-pista="${p}"${ej.nivel === 3 ? ' disabled' : ''}>Pista: ${PISTAS[p]!.toLowerCase()}</button>`).join('')}${ej.nivel === 3 ? '<small>Se desbloquean al comprobar un primer resultado.</small>' : ''}</div>
      <div class="t2-pistas-texto">${pistas.map((p) => `<div class="t2-ayuda" data-pista-texto="${p}" hidden>${contenido[p]}</div>`).join('')}</div>` : ''}
      <form class="t2-respuesta" data-respuesta>
        <label for="t2-r-${ej.id}">Tu resultado${ej.respuesta.tipo === 'anos' ? ' (en años, con decimales)' : ''}</label>
        <span class="t2-campo"><input id="t2-r-${ej.id}" inputmode="decimal" autocomplete="off" placeholder="${ejemplo}"><span>${unidad}</span></span>
        <button type="submit" class="btn-principal">Comprobar</button>
      </form>
      <p class="t2-feedback" aria-live="polite" data-feedback></p>
      <button type="button" class="btn-enlace" data-ver-solucion hidden>Ver la solución completa</button>
      <div class="t2-solucion" hidden>
        <ol>${ej.pasos.map((p) => `<li>${textoT2(p)}</li>`).join('')}</ol>
        <p class="t2-resultado">${textoT2(ej.respuesta.texto)}</p>
        <p><a href="${hrefFormula(f.id)}">Volver a ver la fórmula ${f.numero} animada</a></p>
      </div>
    </article>`;
    }).join('')}
  </div>`;
}

function montarPractica(bloque: BloqueId): { clic: (e: Event) => void; envio: (e: Event) => void } {
  const ej = (el: HTMLElement) => ejerciciosDe(bloque).find((e) => e.id === el.dataset.practica)!;
  const clic = (evento: Event) => {
    const objetivo = evento.target as Element | null;
    const tarjeta = objetivo?.closest<HTMLElement>('[data-practica]');
    if (!tarjeta) return;
    const pista = objetivo!.closest<HTMLButtonElement>('[data-pista]');
    if (pista && !pista.disabled) {
      tarjeta.querySelector<HTMLElement>(`[data-pista-texto="${pista.dataset.pista}"]`)!.hidden = false;
      pista.disabled = true;
      pista.classList.add('usada');
      return;
    }
    if (objetivo!.closest('[data-ver-solucion]')) {
      tarjeta.querySelector<HTMLElement>('.t2-solucion')!.hidden = false;
      objetivo!.closest<HTMLElement>('[data-ver-solucion]')!.hidden = true;
    }
  };
  const envio = (evento: Event) => {
    const form = (evento.target as Element | null)?.closest<HTMLFormElement>('[data-respuesta]');
    if (!form) return;
    evento.preventDefault();
    const tarjeta = form.closest<HTMLElement>('[data-practica]')!;
    const e = ej(tarjeta);
    const input = form.querySelector('input')!;
    const r = comprobar(e, input.value);
    const intentos = Number(tarjeta.dataset.intentos) + 1;
    tarjeta.dataset.intentos = String(intentos);
    const fb = tarjeta.querySelector<HTMLElement>('[data-feedback]')!;
    fb.className = `t2-feedback ${r.bien ? 'bien' : 'mal'}`;
    fb.innerHTML = r.bien ? `<b>Correcto.</b> ${textoT2(e.respuesta.texto)}` : `<b>Todavía no.</b> ${escaparHtml(r.aviso)}`;
    tarjeta.classList.toggle('resuelta', r.bien);
    // Tras el primer intento se desbloquean las pistas (nivel 3) y la solución completa.
    tarjeta.querySelectorAll<HTMLButtonElement>('[data-pista]:not(.usada)').forEach((b) => { b.disabled = false; });
    tarjeta.querySelector<HTMLElement>('[data-ver-solucion]')!.hidden = !tarjeta.querySelector<HTMLElement>('.t2-solucion')!.hidden;
  };
  return { clic, envio };
}

/* ------------------------------------------------------------------------------ montaje */

export function montarFase(raiz: HTMLElement, bloque: BloqueId, fase: 'datos' | 'elegir' | 'practica'): () => void {
  if (fase === 'practica') {
    const { clic, envio } = montarPractica(bloque);
    const pararAleatorio = montarAleatorioPapel(raiz);
    raiz.addEventListener('click', clic);
    raiz.addEventListener('submit', envio);
    return () => {
      pararAleatorio();
      raiz.removeEventListener('click', clic);
      raiz.removeEventListener('submit', envio);
    };
  }
  const manejador = fase === 'datos' ? montarIdentificar(raiz, bloque) : montarElegir(raiz, bloque);
  raiz.addEventListener('click', manejador);
  return () => raiz.removeEventListener('click', manejador);
}
