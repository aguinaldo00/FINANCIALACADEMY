/*
 * Reloj del «Examen real» del laboratorio: una cuenta atrás que arranca sola al abrir el examen,
 * como en el aula. Se calcula con la hora de inicio (no sumando segundos), así que no se desajusta
 * si la pestaña se queda en segundo plano y sigue donde iba al recargar la página. Para que se sienta
 * examen: cada minuto cumplido se ilumina en rojo un momento («quedan 9 min»), en el último cuarto
 * del tiempo pasa a ámbar y en el último minuto a rojo; al llegar a cero no corta el ejercicio: avisa
 * y cuenta el tiempo extra.
 * Al comprobar el resultado se para y enseña cuánto se ha tardado.
 */
/** Minutos que se pueden elegir por ejercicio (el de en medio es el que se usa por defecto). */
export const DURACIONES_EXAMEN = [5, 10, 15, 20] as const;
const CLAVE_DURACION = 'fa-lab-reloj-minutos';

/** «4:07», o «+0:23» si es tiempo de más. */
export function formatoReloj(segundos: number): string {
  const s = Math.abs(Math.trunc(segundos));
  return `${segundos < 0 ? '+' : ''}${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/**
 * Fase del reloj según lo que queda: normal, mitad (los 12 s siguientes a pasar la mitad, para un aviso
 * suave), último cuarto del tiempo, último minuto, agotado.
 */
export function faseReloj(quedan: number, total = Infinity): 'normal' | 'mitad' | 'cuarto' | 'ultimo' | 'agotado' {
  if (quedan <= 0) return 'agotado';
  if (quedan <= 60) return 'ultimo';
  const usados = total - quedan;
  if (usados >= total / 2 && usados < total / 2 + 12) return 'mitad';
  return Number.isFinite(total) && quedan <= total / 4 ? 'cuarto' : 'normal';
}

/** Segundos que dura el toque rojo de cada minuto cumplido. */
const TOQUE = 2.5;

/**
 * Minutos que quedan si se acaba de cumplir un minuto (en los TOQUE segundos siguientes), para el toque
 * rojo; si no, null. En exámenes de más de 20 minutos (el simulacro), cada 5 minutos. No suena al
 * empezar ni en el último minuto (que ya va en rojo).
 */
export function toqueReloj(quedan: number, total: number): number | null {
  if (quedan <= 60 || quedan > total - TOQUE) return null;
  const paso = total > 20 * 60 ? 300 : 60;
  const resto = quedan % paso;
  return resto === 0 || resto > paso - TOQUE ? Math.round(quedan / 60) : null;
}

export function minutosGuardados(clave = CLAVE_DURACION, opciones: readonly number[] = DURACIONES_EXAMEN, defecto = 10): number {
  let v = 0;
  try { v = Number(localStorage.getItem(clave)); } catch { v = 0; }
  return opciones.includes(v) ? v : defecto;
}

export function htmlRelojExamen(opciones: readonly number[] = DURACIONES_EXAMEN, etiqueta = 'Minutos por ejercicio'): string {
  return `<div class="lab-reloj" data-lab-reloj hidden role="timer" aria-label="Tiempo del examen">
    <span class="lab-reloj-icono" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="13" r="7.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 9v4.2l2.6 1.6M9.5 3.5h5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>
    <span class="lab-reloj-cifra" data-lab-reloj-cifra>10:00</span>
    <span class="lab-reloj-estado" data-lab-reloj-estado>quedan</span>
    <label class="lab-reloj-duracion"><span class="sr">${etiqueta}</span>
      <select data-lab-reloj-minutos>${opciones.map((m) => `<option value="${m}">${m} min</option>`).join('')}</select></label>
    <span class="sr" aria-live="assertive" data-lab-reloj-aviso></span>
  </div>`;
}

export interface RelojExamen {
  /** Muestra el reloj contando desde `inicio` (ms); si `fin` existe, queda parado en ese instante. */
  mostrar(inicio: number, minutos: number, fin?: number): void;
  ocultar(): void;
  parar(): void;
  desmontar(): void;
}

/**
 * Monta el reloj en `raiz` (que contiene el HTML de htmlRelojExamen). `alCambiarMinutos` se llama
 * cuando el alumno elige otra duración: el laboratorio decide si reinicia el ejercicio.
 */
export function montarRelojExamen(raiz: HTMLElement, alCambiarMinutos: (minutos: number) => void, clave = CLAVE_DURACION): RelojExamen {
  const caja = raiz.querySelector<HTMLElement>('[data-lab-reloj]')!;
  const cifra = caja.querySelector<HTMLElement>('[data-lab-reloj-cifra]')!;
  const estado = caja.querySelector<HTMLElement>('[data-lab-reloj-estado]')!;
  const aviso = caja.querySelector<HTMLElement>('[data-lab-reloj-aviso]')!;
  const selector = caja.querySelector<HTMLSelectElement>('[data-lab-reloj-minutos]')!;
  let intervalo = 0;
  let inicio = 0;
  let total = 600;
  let fin: number | undefined;
  let faseAnunciada = '';

  const pintar = () => {
    const ahora = fin ?? Date.now();
    const usados = Math.max(0, (ahora - inicio) / 1000);
    const quedan = total - usados;
    const fase = fin !== undefined ? 'parado' : faseReloj(quedan, total);
    caja.dataset.fase = fase;
    const toque = fin === undefined ? toqueReloj(quedan, total) : null;
    caja.toggleAttribute('data-toque', toque !== null);
    if (fin !== undefined) {
      cifra.textContent = formatoReloj(usados);
      estado.textContent = quedan >= 0 ? 'has tardado' : `has tardado (${formatoReloj(-quedan).replace('+', '')} de más)`;
    } else {
      cifra.textContent = formatoReloj(Math.ceil(quedan));
      estado.textContent = fase === 'agotado' ? 'tiempo agotado · llevas de más'
        : fase === 'mitad' ? 'mitad del tiempo · ¿tienes la fórmula?'
        : toque !== null ? `quedan ${toque} min`
        : fase === 'ultimo' ? 'último minuto' : 'quedan';
    }
    // Avisos para lectores de pantalla, una vez por fase.
    if (fase !== faseAnunciada) {
      faseAnunciada = fase;
      aviso.textContent = fase === 'ultimo' ? 'Queda un minuto.' : fase === 'agotado' ? 'Tiempo agotado.' : fase === 'mitad' ? 'Llevas la mitad del tiempo.' : '';
    }
  };

  const alCambiar = () => {
    const m = Number(selector.value);
    try { localStorage.setItem(clave, String(m)); } catch { /* sin almacenamiento */ }
    alCambiarMinutos(m);
  };
  selector.addEventListener('change', alCambiar);

  const parada = () => { window.clearInterval(intervalo); intervalo = 0; };
  return {
    mostrar(desde, minutos, hasta) {
      inicio = desde;
      total = minutos * 60;
      fin = hasta;
      faseAnunciada = '';
      selector.value = String(minutos);
      selector.disabled = hasta !== undefined;
      caja.hidden = false;
      parada();
      pintar();
      if (hasta === undefined) intervalo = window.setInterval(pintar, 250);
    },
    ocultar() {
      parada();
      caja.hidden = true;
    },
    parar() {
      if (fin !== undefined || caja.hidden) return;
      fin = Date.now();
      parada();
      selector.disabled = true;
      pintar();
    },
    desmontar() {
      parada();
      selector.removeEventListener('change', alCambiar);
    },
  };
}
