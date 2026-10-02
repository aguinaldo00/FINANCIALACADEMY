import type { EstadoPractica } from '../../app/practiceStore.ts';
import { hrefConcepto, hrefRepaso } from '../../app/router.ts';
import type { EstadoEstudio } from '../../app/store.ts';
import { type CorreccionSimulacro, construirSimulacro, corregirSimulacro, type PreguntaExamen } from '../../domain/exam.ts';
import { colorBloque, nombreCortoBloque } from '../blockColors.ts';
import { anilloDominio } from '../components/ring.ts';
import { resaltarAviso } from '../format.ts';
import type { ContextoVista } from './context.ts';

/** Segundos por pregunta con el modo "con tiempo". */
export const SEGUNDOS_POR_PREGUNTA = 60;
const TAMANOS = [10, 20, 30];

let reloj: ReturnType<typeof setInterval> | undefined;

/** Para el cronómetro si se sale de la vista a mitad de un simulacro. */
export function detenerSimulacro(): void {
  if (reloj) clearInterval(reloj);
  reloj = undefined;
}

interface Config {
  total: number;
  conTiempo: boolean;
}

/**
 * Simulacro del tema: examen tipo test repartido por bloques según la predicción, una pregunta
 * cada vez y sin corrección hasta el final. No cambia el dominio; los fallos van al repaso.
 */
export function pintarSimulacro(ctx: ContextoVista, estado: EstadoEstudio, practica: EstadoPractica): void {
  ctx.tituloMovil.textContent = 'Simulacro';
  ctx.pagina.innerHTML = `<div class="sim" data-simulacro></div>`;
  const raiz = ctx.pagina.querySelector<HTMLElement>('[data-simulacro]')!;
  inicio(raiz, estado, practica, { total: 20, conTiempo: false });
}

function inicio(raiz: HTMLElement, estado: EstadoEstudio, practica: EstadoPractica, config: Config): void {
  detenerSimulacro();
  const previos = practica.practica.simulacros.slice(-5).reverse();
  const historial = previos.length
    ? `<div class="sim-hist"><h3>Tus últimos simulacros</h3><ol>${previos
        .map((s) => {
          const nota = Math.round((s.aciertos / s.total) * 100) / 10;
          return `<li><span>${s.fecha.split('-').reverse().join('/')}</span><i style="--p:${(s.aciertos / s.total) * 100}%"></i><b>${nota.toLocaleString('es-ES')}</b><small>${s.aciertos}/${s.total}</small></li>`;
        })
        .join('')}</ol></div>`
    : '';
  const bloques = estado.tema.ampliacion?.bloques ?? [];
  raiz.innerHTML = `<header class="sh"><div class="kick"><span class="pill k">📝 Simulacro</span><span class="pill">No cambia tu dominio · los fallos van a tu repaso</span></div><h1>Simulacro de examen</h1><p>Preguntas tipo test de todo el tema, repartidas según la predicción (${bloques.map((b) => `${nombreCortoBloque(b)} ${b.probabilidad} %`).join(' · ')}). La corrección llega al final.</p></header>
<div class="sim-config"><fieldset><legend>Número de preguntas</legend>${TAMANOS.map((n) => `<label class="sim-op"><input type="radio" name="sim-n" value="${n}"${n === config.total ? ' checked' : ''}><span>${n}</span></label>`).join('')}</fieldset>
<label class="sim-tiempo"><input type="checkbox" name="sim-t"${config.conTiempo ? ' checked' : ''}><span>Con tiempo (${SEGUNDOS_POR_PREGUNTA} s por pregunta)</span></label>
<button type="button" class="ab q sim-empezar" data-sim-empezar>Empezar el simulacro →</button></div>${historial}`;
  raiz.querySelector<HTMLButtonElement>('[data-sim-empezar]')!.onclick = () => {
    const total = Number(raiz.querySelector<HTMLInputElement>('input[name="sim-n"]:checked')?.value ?? 20);
    const conTiempo = Boolean(raiz.querySelector<HTMLInputElement>('input[name="sim-t"]')?.checked);
    const preguntas = construirSimulacro(estado.tema, { total, semilla: Date.now() });
    jugar(raiz, estado, practica, { total, conTiempo }, preguntas, []);
  };
}

function jugar(raiz: HTMLElement, estado: EstadoEstudio, practica: EstadoPractica, config: Config, preguntas: PreguntaExamen[], respuestas: (number | null)[]): void {
  detenerSimulacro();
  const i = respuestas.length;
  if (i >= preguntas.length) return resultado(raiz, estado, practica, config, preguntas, respuestas);
  const p = preguntas[i]!;
  const bloques = estado.tema.ampliacion?.bloques ?? [];
  const bi = bloques.findIndex((b) => b.id === p.bloqueId);
  const bloque = bloques[bi];
  const tiempo = config.conTiempo ? `<div class="sim-reloj" aria-hidden="true"><i data-sim-reloj></i></div><span class="sim-seg" data-sim-seg>${SEGUNDOS_POR_PREGUNTA} s</span>` : '';
  raiz.innerHTML = `<div class="sim-cab"><span class="sim-n">Pregunta <b>${i + 1}</b> de ${preguntas.length}</span>${bloque ? `<span class="sim-bloque" style="--c:${colorBloque(bi)}">${nombreCortoBloque(bloque)}</span>` : ''}<button type="button" class="fc-btn" data-sim-salir>Abandonar</button></div>
<div class="sim-progreso" role="progressbar" aria-valuemin="0" aria-valuemax="${preguntas.length}" aria-valuenow="${i}"><i style="width:${(i / preguntas.length) * 100}%"></i></div>${tiempo}
<article class="sim-pregunta"><h2>${p.enunciado}</h2><div class="opts">${p.opciones.map((t, k) => `<button type="button" class="opt" data-k="${k}">${t}</button>`).join('')}</div>
<div class="sim-pie"><button type="button" class="fc-btn" data-sim-saltar>Dejar en blanco</button></div></article>`;
  const responder = (k: number | null) => {
    detenerSimulacro();
    for (const b of raiz.querySelectorAll<HTMLButtonElement>('.opt')) {
      b.disabled = true;
      if (k !== null && Number(b.dataset.k) === k) b.classList.add('elegida');
    }
    // Un instante para ver la elección marcada y se pasa a la siguiente (sin decir si es correcta).
    setTimeout(() => raiz.isConnected && jugar(raiz, estado, practica, config, preguntas, [...respuestas, k]), k === null ? 0 : 280);
  };
  for (const b of raiz.querySelectorAll<HTMLButtonElement>('.opt')) b.onclick = () => responder(Number(b.dataset.k));
  raiz.querySelector<HTMLButtonElement>('[data-sim-saltar]')!.onclick = () => responder(null);
  raiz.querySelector<HTMLButtonElement>('[data-sim-salir]')!.onclick = () => inicio(raiz, estado, practica, config);
  raiz.querySelector<HTMLButtonElement>('.opt')?.focus({ preventScroll: true });
  if (config.conTiempo) {
    const fin = Date.now() + SEGUNDOS_POR_PREGUNTA * 1000;
    const barra = raiz.querySelector<HTMLElement>('[data-sim-reloj]');
    const seg = raiz.querySelector<HTMLElement>('[data-sim-seg]');
    reloj = setInterval(() => {
      if (!raiz.isConnected) return detenerSimulacro();
      const queda = Math.max(0, fin - Date.now());
      if (barra) barra.style.width = `${(queda / (SEGUNDOS_POR_PREGUNTA * 1000)) * 100}%`;
      if (seg) seg.textContent = `${Math.ceil(queda / 1000)} s`;
      if (!queda) responder(null);
    }, 250);
  }
}

function resultado(raiz: HTMLElement, estado: EstadoEstudio, practica: EstadoPractica, config: Config, preguntas: PreguntaExamen[], respuestas: (number | null)[]): void {
  const r: CorreccionSimulacro = corregirSimulacro(preguntas, respuestas);
  practica.simulacro(r.aciertos, r.total);
  preguntas.forEach((p, i) => practica.responder(p.id, respuestas[i] === p.indiceCorrecta));
  const bloques = estado.tema.ampliacion?.bloques ?? [];
  const veredicto = r.nota >= 9 ? '¡Sobresaliente!' : r.nota >= 7 ? 'Notable: vas muy bien.' : r.nota >= 5 ? 'Aprobado: repasa tus fallos.' : 'Toca repasar: empieza por tus fallos.';
  const barras = bloques
    .map((b, bi) => {
      const x = r.porBloque.find((y) => y.bloqueId === b.id);
      if (!x) return '';
      return `<div class="ex-fila"><span class="ex-et">${nombreCortoBloque(b)}</span><div class="ex-pista"><i class="ex-barra prob" style="width:${Math.max((x.aciertos / x.total) * 100, 0.6)}%;--c:${colorBloque(bi)}"></i><b class="ex-val">${x.aciertos}/${x.total}</b></div></div>`;
    })
    .join('');
  const conceptoNombre = (id: string) => estado.tema.conceptos.find((c) => c.id === id)?.nombre ?? id;
  const correccion = preguntas
    .map((p, i) => {
      const elegida = respuestas[i];
      const bien = elegida === p.indiceCorrecta;
      const tuya = elegida === null || elegida === undefined ? '<em>En blanco</em>' : p.opciones[elegida];
      return `<li class="${bien ? 'bien' : 'mal'}"><div class="sim-c-h"><span class="sim-c-n">${i + 1}</span><b>${p.enunciado}</b><span class="sim-c-r" aria-label="${bien ? 'Correcta' : 'Incorrecta'}">${bien ? '✓' : '✗'}</span></div>${bien ? '' : `<p class="sim-tuya">Tu respuesta: ${tuya}</p>`}<p class="sim-ok">Correcta: <b>${p.opciones[p.indiceCorrecta]}</b></p><p class="sim-exp">${resaltarAviso(p.explicacion)}</p><a class="sim-ficha" href="${hrefConcepto(p.conceptoId)}">Ir a la ficha: ${conceptoNombre(p.conceptoId)} →</a></li>`;
    })
    .join('');
  raiz.innerHTML = `<header class="sim-nota"><div class="sim-anillo">${anilloDominio(r.aciertos / (r.total || 1), 150)}</div><div><span class="pill k">📝 Resultado</span><h1><span data-sim-nota>${r.nota.toLocaleString('es-ES')}</span><small>/10</small></h1><p>${r.aciertos} de ${r.total} correctas · ${veredicto}</p><div class="acts"><button type="button" class="ab q" data-sim-repetir>Otro simulacro</button>${r.fallos.length ? `<a class="ab p" href="${hrefRepaso()}">Repasar mis fallos (${r.fallos.length})</a>` : ''}</div></div></header>
<figure class="ex-graf"><figcaption><h3>Aciertos por bloque</h3><small>Dónde has fallado más</small></figcaption><div class="ex-plot">${barras}</div></figure>
<section class="sim-correccion"><h2>Corrección</h2><div class="sim-filtro"><button type="button" class="fc-btn on" data-ver="todas">Todas</button><button type="button" class="fc-btn" data-ver="mal">Solo fallos (${r.fallos.length})</button></div><ol>${correccion}</ol></section>`;
  raiz.querySelector<HTMLButtonElement>('[data-sim-repetir]')!.onclick = () => inicio(raiz, estado, practica, config);
  for (const b of raiz.querySelectorAll<HTMLButtonElement>('[data-ver]')) {
    b.onclick = () => {
      raiz.querySelectorAll('[data-ver]').forEach((x) => x.classList.toggle('on', x === b));
      raiz.querySelector('.sim-correccion ol')?.classList.toggle('solo-mal', b.dataset.ver === 'mal');
    };
  }
  window.scrollTo(0, 0);
}
