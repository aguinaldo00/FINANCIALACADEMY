import { tituloMarca } from '../components/brandTitle.ts';
import { nubeRealista, TEXTURAS_INTRO } from '../components/nubesRealistas.ts';

/*
 * Intro cinemática: el primer acto de La Ciudad del Dinero, a pantalla completa y antes de ver el
 * mapa. Una sola toma continua:
 *   NEGRO → NUBES → (velo) → DESCENSO → CIUDAD → EXPLORACIÓN
 * La capa cuenta la parte de las nubes y la bienvenida; debajo, la escena 3D carga en paralelo y,
 * bajo el velo blanco, la cámara empieza a bajar (`alDescender`). Cuando el iris se abre la cámara
 * ya está en movimiento y atraviesa nubes 3D con la misma textura: no hay corte.
 */

export interface OpcionesIntro {
  /** Se resuelve cuando la escena 3D está montada (o null si no hay 3D). */
  mundoListo: Promise<boolean>;
  /** Arranca el descenso de la cámara (bajo el velo). */
  alDescender: () => void;
  /** Deja la cámara en el encuadre final (al saltar la intro). */
  alSaltar: () => void;
  /** La capa ha terminado (sola o saltada). */
  alTerminar: () => void;
  /** Subtítulo de la bienvenida (tema). */
  subtitulo: string;
}

/** Instantes del guion (ms desde que arranca la intro). */
export const GUION = {
  volar: 60,
  blanco: 3300,
  morph: 4200,
  descenso: 4400,
  presagio: 5200,
  subtitulo: 5600,
  iris: 6200,
  vuelaFuera: 6300,
  fin: 7700,
} as const;

/** Espera máxima por la 3D antes de abrir el iris igualmente. */
const ESPERA_MAXIMA = 4000;

/**
 * Morph gooey entre dos textos: se cruzan desenfoque y opacidad bajo un filtro de umbral alfa, así
 * las letras de uno se "funden" en las del otro.
 */
function morph(a: HTMLElement, b: HTMLElement, duracion: number, alAcabar: () => void): () => void {
  let raf = 0;
  const t0 = performance.now();
  const paso = (ahora: number) => {
    const t = Math.min(1, (ahora - t0) / duracion);
    const k = t * t * (3 - 2 * t);
    const fb = Math.min(8 / Math.max(k, 0.0001) - 8, 100);
    const fa = Math.min(8 / Math.max(1 - k, 0.0001) - 8, 100);
    b.style.filter = `blur(${fb}px)`;
    b.style.opacity = `${Math.pow(k, 0.4) * 100}%`;
    a.style.filter = `blur(${fa}px)`;
    a.style.opacity = `${Math.pow(1 - k, 0.4) * 100}%`;
    if (t < 1) raf = requestAnimationFrame(paso);
    else {
      a.style.opacity = '0';
      b.style.filter = '';
      b.style.opacity = '1';
      alAcabar();
    }
  };
  raf = requestAnimationFrame(paso);
  return () => cancelAnimationFrame(raf);
}

/** Reproduce la intro. Devuelve una función para saltarla. */
export function reproducirIntro(o: OpcionesIntro): () => void {
  const capa = document.createElement('div');
  capa.className = 'intro';
  capa.setAttribute('role', 'dialog');
  capa.setAttribute('aria-label', 'Introducción: Bienvenido a la Ciudad Financiera');
  const nube = (clase: string, variante: number, ancho: number) => {
    const img = nubeRealista(variante, ancho);
    return `<i class="nube ${clase}${img ? ' real' : ''}"${img ? ` style="--img:url(${img})"` : ''}></i>`;
  };
  const { lejanas, cercanas } = TEXTURAS_INTRO;
  const nubes = Array.from({ length: 10 }, (_, i) => nube(`n${i + 1}`, lejanas[i % lejanas.length]![0], lejanas[i % lejanas.length]![1])).join('');
  const cerca = Array.from({ length: 4 }, (_, i) => nube(`cerca c${i + 1}`, cercanas[i % cercanas.length]![0], cercanas[i % cercanas.length]![1])).join('');
  // Las dos últimas nubes salen despedidas hacia los bordes al abrirse el iris (el vuelo sigue).
  const salida = nube('salida s1', cercanas[0][0], cercanas[0][1]) + nube('salida s2', cercanas[1][0], cercanas[1][1]);
  const palabras = o.subtitulo.split(' ').map((p, i) => `<span style="--i:${i}">${p}</span>`).join(' ');
  capa.innerHTML = `<svg class="intro-filtros" aria-hidden="true" width="0" height="0"><filter id="intro-goo"><feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 255 -140"/></filter></svg>
<div class="intro-cielo"></div>
<div class="nubes" aria-hidden="true">${nubes}${cerca}</div>
<div class="bruma" aria-hidden="true"></div>
<div class="intro-titulo">${tituloMarca('entrada')}</div>
<div class="intro-velo" aria-hidden="true"></div>
<div class="nubes nubes-salida" aria-hidden="true">${salida}</div>
<div class="intro-bienvenida"><div class="intro-morph"><span class="m-a">La ciudad del dinero</span><span class="m-b">Bienvenido a la Ciudad Financiera</span></div><p class="intro-sub">${palabras}</p></div>
<button type="button" class="intro-saltar">Saltar intro</button>`;
  document.body.append(capa);
  document.body.classList.add('intro-activa');

  const temporizadores: number[] = [];
  const despues = (ms: number, fn: () => void) => temporizadores.push(window.setTimeout(fn, ms));
  let pararMorph: (() => void) | null = null;
  let terminada = false;

  const terminar = () => {
    if (terminada) return;
    terminada = true;
    for (const t of temporizadores) clearTimeout(t);
    pararMorph?.();
    document.removeEventListener('keydown', alTeclado);
    capa.remove();
    document.body.classList.remove('intro-activa');
    o.alTerminar();
  };
  const saltar = () => {
    if (terminada) return;
    o.alSaltar();
    terminar();
  };
  const alTeclado = (e: KeyboardEvent) => {
    if (e.key === 'Escape') saltar();
  };
  document.addEventListener('keydown', alTeclado);
  capa.querySelector('.intro-saltar')!.addEventListener('click', saltar);
  capa.addEventListener('pointerdown', (e) => {
    if (!(e.target as Element).closest('button')) saltar();
  });

  // El guion se encadena paso a paso: cada fase se programa desde que la anterior ha ocurrido de
  // verdad. Si el hilo principal se bloquea (la 3D compila sus sombreadores), el guion se retrasa,
  // pero sus fases nunca se amontonan.
  const secuencia = (pasos: [number, () => void][], alAcabar?: () => void) => {
    let i = 0;
    const siguiente = () => {
      if (terminada) return;
      const paso = pasos[i++];
      if (!paso) return alAcabar?.();
      despues(paso[0], () => {
        if (terminada) return;
        paso[1]();
        siguiente();
      });
    };
    siguiente();
  };

  // Acto 3: descenso. La cámara empieza a bajar bajo el velo cuando la bienvenida ya está en marcha
  // y la 3D está lista; si tarda, la bienvenida respira mientras tanto (como mucho ESPERA_MAXIMA).
  let hay3d: boolean | null = null;
  let enPunto = false;
  let decidido = false;
  const descender = (con3d: boolean) => {
    if (decidido || terminada) return;
    decidido = true;
    capa.classList.remove('espera');
    const seguir = () =>
      secuencia([
        [GUION.presagio - GUION.descenso, () => capa.classList.add('presagio')],
        [GUION.subtitulo - GUION.presagio, () => capa.classList.add('subtitulo')],
        [GUION.iris - GUION.subtitulo, () => capa.classList.add('iris')],
        [GUION.vuelaFuera - GUION.iris, () => capa.classList.add('fuera')],
        [GUION.fin - GUION.vuelaFuera, terminar],
      ]);
    if (!con3d) return seguir();
    o.alDescender();
    // El primer fotograma del descenso puede tardar (sombreadores, texturas): el guion de la capa
    // sigue cuando ya se ha dibujado, para que el iris y la cámara vayan a la par.
    requestAnimationFrame(() => requestAnimationFrame(seguir));
  };
  const probar = () => {
    if (enPunto && hay3d !== null) descender(hay3d);
  };
  void o.mundoListo.then(
    (ok) => {
      hay3d = ok;
      probar();
    },
    () => {
      hay3d = false;
      probar();
    },
  );

  // Acto 1: negro → cielo y vuelo entre nubes con el título.
  // Acto 2: una nube cercana llena la pantalla (velo blanco) y el título se funde en la bienvenida.
  requestAnimationFrame(() => capa.classList.add('en'));
  secuencia(
    [
      [GUION.volar, () => capa.classList.add('volando')],
      [GUION.blanco - GUION.volar, () => capa.classList.add('blanco')],
      [
        GUION.morph - GUION.blanco,
        () => {
          capa.classList.add('morph');
          pararMorph = morph(capa.querySelector<HTMLElement>('.m-a')!, capa.querySelector<HTMLElement>('.m-b')!, 1500, () => capa.classList.add('bienvenida'));
        },
      ],
      [GUION.descenso - GUION.morph, () => (enPunto = true)],
    ],
    () => {
      probar();
      if (decidido) return;
      capa.classList.add('espera');
      despues(ESPERA_MAXIMA, () => descender(false));
    },
  );

  return saltar;
}
