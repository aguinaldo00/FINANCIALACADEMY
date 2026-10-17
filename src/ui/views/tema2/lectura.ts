/*
 * «Cómo leer un enunciado»: primera tarjeta de A · Identificar. El método de cuatro preguntas, el
 * diccionario de expresiones, las palabras trampa y dos ejercicios con enunciados del generador (no
 * se acaban): «Lectura rápida» (solo qué te piden, 10 seguidos y cronometrados) y «Marca tú el
 * enunciado» (cada dato a su símbolo; al acertar toma su color). Lo único que se guarda es la mejor
 * marca de la lectura rápida, en este navegador.
 */
import { DICCIONARIO, PASOS_LECTURA, TRAMPAS } from '../../../content/temas/tema-02/lectura.ts';
import { formulasDe, type BloqueId } from '../../../content/temas/tema-02/formulas.ts';
import { simbolo } from '../../../content/temas/tema-02/simbolos.ts';
import { generarEjercicio } from '../../../domain/tema2/generador.ts';
import { LABORATORIOS } from '../../../domain/tema2/laboratorio.ts';
import { claseSimbolo } from '../../matematica/formula.ts';
import { formatoReloj } from '../../components/relojExamen.ts';
import { escaparHtml, formulaHtml, textoT2 } from './comun.ts';
import { marcarEnunciado, type EnunciadoMarcado } from './enunciadoMarcado.ts';
import { PALETA } from './fases.ts';

const RONDAS = 10;
const claveMarca = (b: BloqueId) => `fa-t2-lectura:${b}`;

const azar = () => Math.floor(Math.random() * 99991) + 1;

/** Un enunciado nuevo del bloque (fórmulas que calculan), ya partido en trozos. */
export function enunciadoAlAzar(bloque: BloqueId, semilla = azar()): (EnunciadoMarcado & { formula: string }) | null {
  const ids = formulasDe(bloque).map((f) => f.id).filter((id) => LABORATORIOS[id]);
  for (let k = 0; k < 8; k++) {
    const id = ids[(semilla + k) % ids.length]!;
    const e = generarEjercicio(id, semilla + k);
    const m = e && marcarEnunciado(id, e.datos, e.periodicidad);
    if (m) return { ...m, formula: id };
  }
  return null;
}

const paleta = (bloque: BloqueId, atributo: string) => `<div class="t2-paleta" role="group" aria-label="¿Qué símbolo es?">${PALETA[bloque].map((c) =>
  `<button type="button" class="t2-sim" ${atributo}="${c}" title="${escaparHtml(simbolo(c)?.nombre ?? c)}">${formulaHtml(c)}<small>${escaparHtml(simbolo(c)?.nombre ?? '')}</small></button>`).join('')}</div>`;

export function htmlLectura(bloque: BloqueId): string {
  return `<section class="t2-lectura" aria-labelledby="t2-lectura-tit">
    <header class="t2-lectura-cab">
      <p class="t2-ceja">Antes de identificar</p>
      <h2 id="t2-lectura-tit">Cómo leer un enunciado</h2>
      <p>No se falla en la cuenta: se falla antes, al leer. Hazte siempre estas cuatro preguntas, en este orden.</p>
    </header>
    <ol class="t2-lectura-pasos">${PASOS_LECTURA.map((p, k) => `<li><span class="t2-lectura-n">${k + 1}</span><div><h3>${escaparHtml(p.pregunta)}</h3><p>${textoT2(p.hacer)}</p><p class="t2-lectura-ej">${textoT2(p.ejemplo)}</p></div></li>`).join('')}</ol>
    <details class="t2-pliegue t2-lectura-pliegue"><summary>Diccionario: qué símbolo es cada expresión</summary>
      <div class="t2-dicc">${DICCIONARIO.map((g) => `<div class="t2-dicc-grupo"><h3>${escaparHtml(g.grupo)}</h3><ul>${g.expresiones.map((e) =>
        `<li><span class="t2-dicc-texto">«${escaparHtml(e.texto)}»</span><span class="t2-dicc-sim">→ ${formulaHtml(e.simbolo)}</span>${e.nota ? `<small>${escaparHtml(e.nota)}</small>` : ''}</li>`).join('')}</ul></div>`).join('')}</div>
    </details>
    <details class="t2-pliegue t2-lectura-pliegue"><summary>Palabras que cambian el ejercicio</summary>
      <ul class="t2-trampas">${TRAMPAS.map((t) => `<li><b>${escaparHtml(t.frase)}</b><span>${textoT2(t.ojo)}</span></li>`).join('')}</ul>
    </details>

    <div class="t2-lectura-juegos">
      <article class="t2-lectura-juego" data-lectura-rapida>
        <h3>Lectura rápida <small>${RONDAS} enunciados · solo «¿qué te piden?»</small></h3>
        <p class="t2-lectura-estado" aria-live="polite" data-lr-estado>Lee la pregunta y pulsa el símbolo de lo que te piden. Cuenta el tiempo.</p>
        <p class="t2-enunciado" data-lr-enunciado hidden></p>
        <div data-lr-paleta hidden>${paleta(bloque, 'data-lr-sim')}</div>
        <p class="t2-lectura-marca" data-lr-marca></p>
        <button type="button" class="btn-principal" data-lr-empezar>Empezar</button>
      </article>
      <article class="t2-lectura-juego" data-marca-tu>
        <h3>Marca tú el enunciado <small>cada dato a su símbolo</small></h3>
        <p class="t2-lectura-estado" aria-live="polite" data-mt-aviso>Pulsa un trozo subrayado (también la pregunta) y elige su símbolo.</p>
        <p class="t2-enunciado" data-mt-enunciado></p>
        ${paleta(bloque, 'data-mt-sim')}
        <button type="button" class="btn-secundario" data-mt-otro>Otro enunciado</button>
      </article>
    </div>
  </section>`;
}

/** Monta los dos ejercicios de lectura. Devuelve la función que los desmonta. */
export function montarLectura(raiz: HTMLElement, bloque: BloqueId): () => void {
  const caja = raiz.querySelector<HTMLElement>('.t2-lectura');
  if (!caja) return () => {};
  const $ = <T extends HTMLElement>(sel: string) => caja.querySelector<T>(sel)!;

  /* ---------------------------------------------------------------- lectura rápida */
  const lrEstado = $('[data-lr-estado]');
  const lrEnunciado = $('[data-lr-enunciado]');
  const lrPaleta = $('[data-lr-paleta]');
  const lrMarca = $('[data-lr-marca]');
  const lrEmpezar = $<HTMLButtonElement>('[data-lr-empezar]');
  let ronda = 0;
  let aciertos = 0;
  let inicio = 0;
  let actual: ReturnType<typeof enunciadoAlAzar> = null;
  let reloj = 0;
  const mejor = (): { aciertos: number; segundos: number } | null => {
    try { return JSON.parse(localStorage.getItem(claveMarca(bloque)) ?? 'null'); } catch { return null; }
  };
  const pintarMejor = () => {
    const m = mejor();
    lrMarca.textContent = m ? `Tu mejor marca: ${m.aciertos} de ${RONDAS} en ${formatoReloj(m.segundos)}.` : '';
  };
  const siguiente = () => {
    actual = enunciadoAlAzar(bloque);
    if (!actual) return;
    lrEnunciado.textContent = actual.texto;
    lrEstado.textContent = `Enunciado ${ronda + 1} de ${RONDAS} · ${formatoReloj((Date.now() - inicio) / 1000)}`;
  };
  const terminar = () => {
    window.clearInterval(reloj);
    const segundos = Math.round((Date.now() - inicio) / 1000);
    lrEnunciado.hidden = true;
    lrPaleta.hidden = true;
    lrEmpezar.hidden = false;
    lrEmpezar.textContent = 'Otra vez';
    lrEstado.textContent = `${aciertos} de ${RONDAS} en ${formatoReloj(segundos)}. ${aciertos === RONDAS ? '¡Todas!' : 'Repasa el diccionario y vuelve a probar.'}`;
    const m = mejor();
    if (!m || aciertos > m.aciertos || (aciertos === m.aciertos && segundos < m.segundos)) {
      try { localStorage.setItem(claveMarca(bloque), JSON.stringify({ aciertos, segundos })); } catch { /* sin almacenamiento */ }
    }
    pintarMejor();
  };
  pintarMejor();

  /* ------------------------------------------------------------ marca tú el enunciado */
  const mtEnunciado = $('[data-mt-enunciado]');
  const mtAviso = $('[data-mt-aviso]');
  let mt: ReturnType<typeof enunciadoAlAzar> = null;
  let activo = -1;
  const pintarMarcaTu = () => {
    mt = enunciadoAlAzar(bloque);
    activo = -1;
    if (!mt) return;
    const e = mt;
    // Los datos y la pregunta son botones; lo demás, texto.
    mtEnunciado.innerHTML = e.trozos.map((t, k) => {
      const esPregunta = k === e.pregunta;
      if (!t.simbolo && !esPregunta) return escaparHtml(t.texto);
      return `<button type="button" class="t2-frag" data-mt-trozo="${k}" aria-pressed="false">${escaparHtml(t.texto)}</button>`;
    }).join('');
    mtAviso.textContent = 'Pulsa un trozo subrayado (también la pregunta) y elige su símbolo.';
  };
  pintarMarcaTu();

  const alPulsar = (ev: Event) => {
    const b = (ev.target as Element).closest<HTMLButtonElement>('button');
    if (!b || !caja.contains(b)) return;
    if (b.hasAttribute('data-lr-empezar')) {
      ronda = 0;
      aciertos = 0;
      inicio = Date.now();
      lrEnunciado.hidden = false;
      lrPaleta.hidden = false;
      lrEmpezar.hidden = true;
      window.clearInterval(reloj);
      reloj = window.setInterval(() => { if (actual) lrEstado.textContent = `Enunciado ${ronda + 1} de ${RONDAS} · ${formatoReloj((Date.now() - inicio) / 1000)}`; }, 500);
      siguiente();
    } else if (b.dataset.lrSim && actual) {
      const bien = b.dataset.lrSim === actual.incognita;
      if (bien) aciertos++;
      b.classList.add(bien ? 't2-sim-bien' : 't2-sim-mal');
      window.setTimeout(() => b.classList.remove('t2-sim-bien', 't2-sim-mal'), 350);
      ronda++;
      if (ronda >= RONDAS) terminar();
      else siguiente();
    } else if (b.dataset.mtTrozo !== undefined) {
      if (b.classList.contains('ok')) return;
      mtEnunciado.querySelectorAll('[data-mt-trozo]').forEach((x) => x.setAttribute('aria-pressed', 'false'));
      b.setAttribute('aria-pressed', 'true');
      activo = Number(b.dataset.mtTrozo);
      mtAviso.textContent = `«${mt!.trozos[activo]!.texto.slice(0, 60)}${mt!.trozos[activo]!.texto.length > 60 ? '…' : ''}» es…`;
    } else if (b.dataset.mtSim && mt) {
      if (activo < 0) { mtAviso.textContent = 'Primero pulsa un trozo subrayado del enunciado.'; return; }
      const esperado = activo === mt.pregunta ? mt.incognita : mt.trozos[activo]!.simbolo!;
      const boton = mtEnunciado.querySelector<HTMLElement>(`[data-mt-trozo="${activo}"]`)!;
      if (b.dataset.mtSim === esperado) {
        boton.classList.add('ok', claseSimbolo(esperado));
        boton.setAttribute('aria-pressed', 'false');
        boton.title = simbolo(esperado)?.nombre ?? esperado;
        const quedan = mtEnunciado.querySelectorAll('[data-mt-trozo]:not(.ok)').length;
        mtAviso.innerHTML = quedan
          ? `Bien: es ${formulaHtml(esperado)}, ${escaparHtml((simbolo(esperado)?.nombre ?? '').toLowerCase())}${activo === mt.pregunta ? ' (lo que te piden)' : ''}. Quedan ${quedan}.`
          : 'Enunciado completo: ya sabes qué te dan y qué te piden. Ahora, ¿qué fórmula? (fase B).';
        activo = -1;
      } else {
        boton.classList.remove('t2-sacude');
        void boton.offsetWidth;
        boton.classList.add('t2-sacude');
        mtAviso.innerHTML = `${formulaHtml(b.dataset.mtSim)} no: ${escaparHtml((simbolo(b.dataset.mtSim)?.significado ?? '').replace(/\.$/, ''))}. Prueba otro.`;
      }
    } else if (b.hasAttribute('data-mt-otro')) pintarMarcaTu();
  };
  caja.addEventListener('click', alPulsar);
  return () => {
    window.clearInterval(reloj);
    caja.removeEventListener('click', alPulsar);
  };
}
