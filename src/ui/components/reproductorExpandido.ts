/*
 * Reproductor con expansión cinematográfica (shared element / hero transition, técnica FLIP).
 *
 * Una miniatura de vídeo se convierte en el reproductor grande sin cortes: se mide dónde está la
 * miniatura (First), se coloca el reproductor en su sitio final (Last), se calcula la diferencia
 * (Invert) y se anima de vuelta a cero (Play). Se animan posición, tamaño, recorte y esquinas a la
 * vez: el reproductor empieza recortado exactamente como la miniatura (mismo encuadre y mismo radio)
 * y se abre hasta su formato completo, con una inclinación 3D muy leve que se endereza al llegar.
 * Al cerrar, el mismo movimiento al revés lo devuelve a la miniatura.
 *
 * Dos fuentes, el mismo patrón:
 *  - vídeo: el propio <video> de la miniatura viaja al reproductor y vuelve a ella (nunca una
 *    imagen fija en su lugar);
 *  - escena: las animaciones del motor (montarReproductor), que la miniatura enseña congeladas.
 *
 * Accesible: la miniatura es un botón; el reproductor es un diálogo modal (el resto de la página
 * queda inerte), Esc lo cierra y el foco vuelve a la miniatura. Con movimiento reducido no hay
 * desplazamiento ni 3D: un fundido corto, y nada arranca solo.
 */
import { movimientoReducido } from '../motion.ts';
import { montarReproductor, pintarFotograma, type Escena } from '../motion/reproductor.ts';
import { escaparHtml } from './simbolos.ts';

export type FuenteExpandible =
  | {
      tipo: 'video';
      /** Archivos del mismo vídeo, por orden de preferencia (p. ej. WebM y después MP4). */
      archivos: readonly { src: string; tipo: string }[];
      titulo: string;
      volanta: string;
      /** Duración en segundos (se corrige con la del archivo al cargar sus metadatos). */
      duracion: number;
      /** Segundo que enseña la miniatura mientras no se reproduce. */
      fotogramaMiniatura?: number;
      /** Aviso bajo los controles (p. ej. si el vídeo no tiene sonido). */
      nota?: string;
    }
  | { tipo: 'escena'; escena: Escena; volanta: string };

const ICONO_PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z"/></svg>';
const ICONO_PAUSA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>';

/** 72 → «1:12». */
export const duracionLegible = (s: number): string => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

const tituloDe = (f: FuenteExpandible) => (f.tipo === 'video' ? f.titulo : f.escena.titulo);
const duracionDe = (f: FuenteExpandible) => (f.tipo === 'video' ? f.duracion : f.escena.duracion);

/** Botón-miniatura. Su medio (el vídeo o el fotograma) lo pone conectarMiniaturas. */
export function miniaturaHtml(id: string, fuente: FuenteExpandible, clase = ''): string {
  const tipo = fuente.tipo === 'video' ? 'Vídeo' : 'Animación';
  const dur = duracionLegible(duracionDe(fuente));
  return `<button type="button" class="vx-miniatura vx-${fuente.tipo} ${clase}" data-expandir="${id}" aria-haspopup="dialog">
    <span class="vx-medio${fuente.tipo === 'escena' ? ' mo-marco' : ''}" data-vx-medio></span>
    <span class="vx-play" aria-hidden="true">${ICONO_PLAY}</span>
    <span class="vx-rotulo" aria-hidden="true"><span>${tipo}</span><span data-vx-dur>${dur}</span></span>
    <span class="sr">Reproducir ${tipo.toLowerCase()}: ${escaparHtml(tituloDe(fuente))} (<span data-vx-dur>${dur}</span>)</span>
  </button>`;
}

/* --------------------------------------------------------------------------- expansión */

interface Contenido {
  /** El elemento compartido: lo que viaja de la miniatura al reproductor. */
  compartido: HTMLElement;
  /** Lo que aparece con un fundido cuando el reproductor ya está en su sitio. */
  secundarios: HTMLElement[];
  foco: HTMLElement;
  /** Arranca la reproducción al terminar de abrirse (no con movimiento reducido). */
  empezar(): void;
  /** Teclas propias del contenido (espacio, flechas). Devuelve si la ha usado. */
  tecla(e: KeyboardEvent): boolean;
  /** Se detiene al empezar a cerrarse: vuelve a la miniatura el fotograma en el que se dejó. */
  detener(): void;
  /** Deja el contenido como estaba (el vídeo vuelve a su miniatura). */
  devolver(): void;
}

function contenidoVideo(capa: HTMLElement, cuerpo: HTMLElement, hueco: HTMLElement, fuente: Extract<FuenteExpandible, { tipo: 'video' }>): Contenido {
  const video = hueco.querySelector('video')!;
  const marco = document.createElement('div');
  marco.className = 'vx-marco';
  marco.append(video);
  const mandos = document.createElement('div');
  mandos.className = 'vx-mandos';
  mandos.innerHTML = `
    <button type="button" class="vx-boton" data-vx-play aria-label="Reproducir">${ICONO_PLAY}</button>
    <input type="range" class="vx-barra" data-vx-barra min="0" max="${fuente.duracion}" step="0.1" value="0" aria-label="Posición del vídeo">
    <span class="vx-tiempo" data-vx-tiempo>0:00 / ${duracionLegible(fuente.duracion)}</span>
    ${fuente.nota ? `<p class="vx-nota">${escaparHtml(fuente.nota)}</p>` : ''}`;
  cuerpo.append(marco, mandos);
  const play = mandos.querySelector<HTMLButtonElement>('[data-vx-play]')!;
  const barra = mandos.querySelector<HTMLInputElement>('[data-vx-barra]')!;
  const reloj = mandos.querySelector<HTMLElement>('[data-vx-tiempo]')!;
  const momentoMiniatura = video.currentTime;
  video.controls = false;
  video.muted = true;
  video.tabIndex = -1;

  const total = () => (Number.isFinite(video.duration) && video.duration > 0 ? video.duration : fuente.duracion);
  const pintar = () => {
    const parado = video.paused || video.ended;
    play.innerHTML = parado ? ICONO_PLAY : ICONO_PAUSA;
    play.setAttribute('aria-label', parado ? (video.ended ? 'Volver a ver' : 'Reproducir') : 'Pausar');
    barra.max = String(total());
    barra.value = String(video.currentTime);
    barra.style.setProperty('--p', `${(video.currentTime / total()) * 100}%`);
    barra.setAttribute('aria-valuetext', `${duracionLegible(video.currentTime)} de ${duracionLegible(total())}`);
    reloj.textContent = `${duracionLegible(video.currentTime)} / ${duracionLegible(total())}`;
    capa.classList.toggle('vx-reproduciendo', !parado);
  };
  const alternar = () => {
    if (video.paused || video.ended) {
      if (video.ended) video.currentTime = 0;
      void video.play().catch(() => pintar());
    } else video.pause();
  };
  const eventos = ['play', 'pause', 'timeupdate', 'ended', 'loadedmetadata', 'seeked'] as const;
  eventos.forEach((ev) => video.addEventListener(ev, pintar));
  play.addEventListener('click', alternar);
  video.addEventListener('click', alternar);
  barra.addEventListener('input', () => {
    video.currentTime = Number(barra.value);
    pintar();
  });
  pintar();

  return {
    compartido: marco,
    secundarios: [mandos],
    foco: play,
    empezar() {
      // Sigue desde el fotograma que enseñaba la miniatura: la imagen no salta al expandirse.
      if (video.ended) video.currentTime = 0;
      void video.play().catch(() => pintar());
    },
    tecla(e) {
      const enControl = (e.target as Element).closest('button, input');
      if ((e.key === ' ' || e.key === 'k') && !enControl) {
        alternar();
        return true;
      }
      if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && !(e.target as Element).closest('input')) {
        video.currentTime = Math.max(0, Math.min(total(), video.currentTime + (e.key === 'ArrowRight' ? 5 : -5)));
        return true;
      }
      return false;
    },
    detener: () => video.pause(),
    devolver() {
      video.pause();
      eventos.forEach((ev) => video.removeEventListener(ev, pintar));
      video.removeEventListener('click', alternar);
      // Al acabar, la miniatura vuelve a su fotograma de siempre; si no, se queda donde se paró.
      if (video.ended) video.currentTime = momentoMiniatura;
      hueco.append(video);
    },
  };
}

function contenidoEscena(cuerpo: HTMLElement, escena: Escena): Contenido {
  const sitio = document.createElement('div');
  cuerpo.append(sitio);
  // Sin reproducción automática el reproductor enseña la composición final: la misma que la miniatura.
  const parar = montarReproductor(sitio, escena, { automatico: false });
  const marco = sitio.querySelector<HTMLElement>('.mo-marco')!;
  const play = sitio.querySelector<HTMLButtonElement>('[data-mo-play]')!;
  return {
    compartido: marco,
    secundarios: [...sitio.querySelectorAll<HTMLElement>('.mo-sub, .mo-mandos')],
    foco: play,
    empezar: () => play.click(),
    tecla: () => false,
    detener: () => {
      if (sitio.classList.contains('mo-reproduciendo')) play.click();
    },
    devolver: parar,
  };
}

/** El rectángulo de la miniatura expresado como transformación + recorte del elemento compartido. */
function inversion(primero: DOMRect, ultimo: DOMRect, radioInicial: number, radioFinal: number, reducido: boolean): Keyframe[] {
  const s = Math.max(primero.width / ultimo.width, primero.height / ultimo.height);
  const dx = primero.left + primero.width / 2 - (ultimo.left + ultimo.width / 2);
  const dy = primero.top + primero.height / 2 - (ultimo.top + ultimo.height / 2);
  // Recorte en coordenadas del propio elemento (antes de escalar): lo que se ve de la miniatura.
  const rx = Math.max(0, (ultimo.width - primero.width / s) / 2);
  const ry = Math.max(0, (ultimo.height - primero.height / s) / 2);
  const giro = reducido ? 0 : 4;
  return [
    { transform: `perspective(1600px) translate(${dx}px, ${dy}px) scale(${s}) rotateX(${giro}deg)`, clipPath: `inset(${ry}px ${rx}px round ${radioInicial / s}px)` },
    { transform: 'perspective(1600px) translate(0px, 0px) scale(1) rotateX(0deg)', clipPath: `inset(0px 0px round ${radioFinal}px)` },
  ];
}

const ABRIR = { duration: 620, easing: 'cubic-bezier(.2,.75,.12,1)' };
const CERRAR = { duration: 460, easing: 'cubic-bezier(.45,0,.2,1)' };

interface Expansion {
  cerrar(inmediato?: boolean): void;
}

let actual: Expansion | null = null;

/** Abre el reproductor grande desde la miniatura. */
export function expandir(miniatura: HTMLElement, fuente: FuenteExpandible): Expansion {
  actual?.cerrar(true);
  const reducido = movimientoReducido();
  const hueco = miniatura.querySelector<HTMLElement>('[data-vx-medio]')!;
  const primero = hueco.getBoundingClientRect();
  const radioMiniatura = parseFloat(getComputedStyle(miniatura).borderTopLeftRadius) || 0;

  const capa = document.createElement('div');
  capa.className = `vx-capa vx-capa-${fuente.tipo}`;
  capa.setAttribute('role', 'dialog');
  capa.setAttribute('aria-modal', 'true');
  capa.setAttribute('aria-labelledby', 'vx-titulo');
  capa.innerHTML = `<div class="vx-fondo" data-vx-cerrar></div>
    <div class="vx-escenario">
      <header class="vx-cab"><p class="vx-volanta">${escaparHtml(fuente.volanta)}</p><h2 id="vx-titulo">${escaparHtml(tituloDe(fuente))}</h2>
        <button type="button" class="vx-cerrar" data-vx-cerrar>Cerrar <span aria-hidden="true">×</span></button></header>
      <div class="vx-cuerpo"></div>
    </div>`;
  document.body.append(capa);
  const cuerpo = capa.querySelector<HTMLElement>('.vx-cuerpo')!;
  const cab = capa.querySelector<HTMLElement>('.vx-cab')!;
  const fondo = capa.querySelector<HTMLElement>('.vx-fondo')!;
  const c = fuente.tipo === 'video' ? contenidoVideo(capa, cuerpo, hueco, fuente) : contenidoEscena(cuerpo, fuente.escena);
  const secundarios = [cab, ...c.secundarios];

  // Modal: el resto de la página queda inerte mientras el reproductor está abierto.
  const inertes = [...document.body.children].filter((el): el is HTMLElement => el !== capa && el instanceof HTMLElement && !el.inert);
  inertes.forEach((el) => { el.inert = true; });
  miniatura.classList.add('vx-en-viaje');

  const radioFinal = parseFloat(getComputedStyle(c.compartido).borderTopLeftRadius) || 0;
  const ultimo = c.compartido.getBoundingClientRect();
  const animaciones: Animation[] = [];
  const animar = (el: Element, marcos: Keyframe[], opciones: KeyframeAnimationOptions) => {
    if (typeof el.animate !== 'function') return null;
    const a = el.animate(marcos, { fill: 'both', ...opciones });
    animaciones.push(a);
    return a;
  };
  const cancelarTodas = () => {
    animaciones.splice(0).forEach((a) => a.cancel());
  };

  c.foco.focus({ preventScroll: true });
  let cerrando = false;
  const conMedidas = primero.width > 0 && primero.height > 0 && ultimo.width > 0;

  if (reducido || !conMedidas) {
    const a = animar(capa, [{ opacity: 0 }, { opacity: 1 }], { duration: reducido ? 160 : 220, easing: 'ease-out' });
    a?.finished.then(cancelarTodas).catch(() => {});
  } else {
    const viaje = animar(c.compartido, inversion(primero, ultimo, radioMiniatura, radioFinal, false), ABRIR);
    animar(fondo, [{ opacity: 0 }, { opacity: 1 }], { duration: 420, easing: 'ease-out' });
    secundarios.forEach((el, k) => animar(el, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 320, delay: 360 + k * 50, easing: 'ease-out' }));
    viaje?.finished.then(() => {
      if (cerrando) return;
      cancelarTodas();
      c.empezar();
    }).catch(() => {});
  }

  const alTeclear = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      expansion.cerrar();
    } else if (e.key === 'Tab') {
      // El foco da la vuelta dentro del reproductor, sin salir a la página de detrás.
      const enfocables = [...capa.querySelectorAll<HTMLElement>('button, input, [tabindex="0"]')].filter((el) => !el.closest('[hidden]'));
      const primero = enfocables[0];
      const ultimo = enfocables[enfocables.length - 1];
      if (!primero || !ultimo) return;
      const dentro = capa.contains(document.activeElement);
      if (e.shiftKey && (document.activeElement === primero || !dentro)) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && (document.activeElement === ultimo || !dentro)) {
        e.preventDefault();
        primero.focus();
      }
    } else if (c.tecla(e)) e.preventDefault();
  };
  // Mientras está abierto, la página de detrás no se desplaza (sin quitar la barra de scroll, para
  // que la miniatura no cambie de sitio).
  const sinDesplazar = (e: Event) => e.preventDefault();
  document.addEventListener('keydown', alTeclear);
  capa.addEventListener('wheel', sinDesplazar, { passive: false });
  capa.addEventListener('touchmove', sinDesplazar, { passive: false });
  capa.addEventListener('click', (e) => {
    if ((e.target as Element).closest('[data-vx-cerrar]')) expansion.cerrar();
  });

  const terminar = () => {
    document.removeEventListener('keydown', alTeclear);
    cancelarTodas();
    c.devolver();
    capa.remove();
    inertes.forEach((el) => { el.inert = false; });
    miniatura.classList.remove('vx-en-viaje');
    if (actual === expansion) actual = null;
  };

  const expansion: Expansion = {
    cerrar(inmediato = false) {
      if (cerrando) return;
      cerrando = true;
      if (inmediato) return terminar();
      c.detener();
      cancelarTodas();
      const destino = hueco.getBoundingClientRect();
      const volver = () => {
        terminar();
        miniatura.focus({ preventScroll: true });
      };
      if (reducido || destino.width === 0 || typeof capa.animate !== 'function') {
        const a = animar(capa, [{ opacity: 1 }, { opacity: 0 }], { duration: reducido ? 140 : 200, easing: 'ease-in' });
        if (a) a.finished.then(volver).catch(volver);
        else volver();
        return;
      }
      const desde = c.compartido.getBoundingClientRect();
      const viaje = animar(c.compartido, inversion(destino, desde, radioMiniatura, radioFinal, false).reverse(), CERRAR);
      animar(fondo, [{ opacity: 1 }, { opacity: 0 }], { duration: CERRAR.duration, easing: 'ease-in' });
      secundarios.forEach((el) => animar(el, [{ opacity: 1 }, { opacity: 0 }], { duration: 140, easing: 'ease-in' }));
      viaje?.finished.then(volver).catch(volver);
    },
  };
  actual = expansion;
  return expansion;
}

/**
 * Prepara las miniaturas [data-expandir] de una vista: pone su medio (el vídeo real o el fotograma
 * de la animación) y las abre al pulsarlas. Devuelve la función que lo desmonta todo.
 */
export function conectarMiniaturas(raiz: HTMLElement, fuentes: Readonly<Record<string, FuenteExpandible>>): () => void {
  const paradas: (() => void)[] = [];
  for (const boton of raiz.querySelectorAll<HTMLElement>('[data-expandir]')) {
    const fuente = fuentes[boton.dataset.expandir ?? ''];
    const hueco = boton.querySelector<HTMLElement>('[data-vx-medio]');
    if (!fuente || !hueco) continue;
    if (fuente.tipo === 'video') {
      const video = document.createElement('video');
      video.muted = true;
      video.playsInline = true;
      video.preload = 'metadata';
      video.setAttribute('aria-hidden', 'true');
      video.tabIndex = -1;
      for (const archivo of fuente.archivos) {
        const origen = document.createElement('source');
        origen.src = archivo.src;
        origen.type = archivo.tipo;
        video.append(origen);
      }
      // La miniatura es el propio vídeo detenido en un fotograma representativo.
      video.addEventListener('loadedmetadata', () => {
        if (video.currentTime === 0 && fuente.fotogramaMiniatura) video.currentTime = fuente.fotogramaMiniatura;
        if (Number.isFinite(video.duration)) boton.querySelectorAll('[data-vx-dur]').forEach((d) => { d.textContent = duracionLegible(video.duration); });
      }, { once: true });
      hueco.append(video);
    } else {
      paradas.push(pintarFotograma(hueco, fuente.escena));
    }
    const abrir = () => expandir(boton, fuente);
    boton.addEventListener('click', abrir);
    paradas.push(() => boton.removeEventListener('click', abrir));
  }
  return () => {
    actual?.cerrar(true);
    paradas.forEach((p) => p());
  };
}
