/*
 * Reproductor de escenas. Pinta la escena con requestAnimationFrame, muestra el subtítulo del
 * capítulo en curso y deja volver a cualquier capítulo. Arranca solo cuando la escena entra en
 * pantalla y se pausa al salir. Con movimiento reducido no hay reproducción continua: cada capítulo
 * se ve en su estado final y se pasa de uno a otro con un fundido.
 */
import { formulaHtml } from '../matematica/formula.ts';
import { escaparHtml } from '../components/simbolos.ts';
import { alCambiarMovimiento, movimientoReducido } from '../motion.ts';
import { Lienzo } from './lienzo.ts';

export interface Capitulo {
  /** Segundo en que empieza. */
  t: number;
  /** Subtítulo: una frase; las fórmulas van entre $…$. */
  texto: string;
}

export interface Escena {
  id: string;
  titulo: string;
  duracion: number;
  capitulos: readonly Capitulo[];
  /** Qué queda en pantalla al final (para lectores de pantalla). */
  descripcion: string;
  /** Construye el dibujo y devuelve la función que lo pinta en el segundo t. */
  montar(lienzo: Lienzo): (t: number) => void;
}

/** Subtítulo con fórmulas coloreadas: "Cada cosecha es $C_0 · i$". */
export function textoConFormulas(texto: string): string {
  return texto
    .split(/(\$[^$]+\$)/g)
    .map((trozo) => (trozo.startsWith('$') ? formulaHtml(trozo.slice(1, -1), 'fx-linea') : escaparHtml(trozo)))
    .join('');
}

/** Índice del capítulo que corresponde al segundo t. */
export function capituloEn(escena: Escena, t: number): number {
  let k = 0;
  escena.capitulos.forEach((c, i) => {
    if (t >= c.t - 1e-6) k = i;
  });
  return k;
}

/** Final de un capítulo: el instante en que su composición está completa. */
export function finCapitulo(escena: Escena, k: number): number {
  const siguiente = escena.capitulos[k + 1];
  return siguiente ? Math.max(escena.capitulos[k]!.t, siguiente.t - 0.05) : escena.duracion;
}

/** Dibuja la escena congelada en un instante (miniaturas del índice). */
export function pintarFotograma(contenedor: HTMLElement, escena: Escena, t = escena.duracion): () => void {
  const lienzo = new Lienzo(`${escena.titulo}. ${escena.descripcion}`);
  contenedor.replaceChildren(lienzo.svg);
  const pintarEscena = escena.montar(lienzo);
  const pintar = (instante: number) => {
    lienzo.instante = instante;
    pintarEscena(instante);
  };
  pintar(t);
  let vivo = true;
  document.fonts?.ready.then(() => {
    if (!vivo) return;
    lienzo.remaquetar();
    pintar(t);
  }).catch(() => {});
  return () => { vivo = false; };
}

const ICONO_PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z"/></svg>';
const ICONO_PAUSA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>';
const ICONO_REPETIR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12a7 7 0 1 0 2.05-4.95M5 4.5V8h3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

export interface OpcionesReproductor {
  /** Arrancar al entrar en pantalla (por defecto sí, salvo movimiento reducido). */
  automatico?: boolean;
}

/** Monta el reproductor dentro de `contenedor`. Devuelve la función que lo desmonta. */
export function montarReproductor(contenedor: HTMLElement, escena: Escena, opciones: OpcionesReproductor = {}): () => void {
  const lienzo = new Lienzo(`${escena.titulo}. ${escena.descripcion}`);
  const total = escena.duracion;
  contenedor.classList.add('mo');
  contenedor.dataset.escena = escena.id;
  contenedor.innerHTML = `
    <div class="mo-marco" data-mo-marco></div>
    <p class="mo-sub" aria-live="polite" data-mo-sub></p>
    <div class="mo-mandos">
      <button type="button" class="mo-play" data-mo-play aria-label="Reproducir">${ICONO_PLAY}</button>
      <ol class="mo-caps" aria-label="Capítulos de la animación">${escena.capitulos.map((c, i) => {
        const fin = escena.capitulos[i + 1]?.t ?? total;
        return `<li style="flex:${Math.max(0.6, fin - c.t)} 1 0"><button type="button" data-mo-cap="${i}" title="${escaparHtml(c.texto.replace(/\$/g, ''))}"><span class="mo-cap-n">${i + 1}</span><span class="mo-cap-barra"><i data-mo-relleno></i></span><span class="sr">Ir al paso ${i + 1}</span></button></li>`;
      }).join('')}</ol>
      <button type="button" class="mo-repetir" data-mo-repetir aria-label="Volver a empezar">${ICONO_REPETIR}</button>
    </div>`;
  const marco = contenedor.querySelector<HTMLElement>('[data-mo-marco]')!;
  marco.append(lienzo.svg);
  const sub = contenedor.querySelector<HTMLElement>('[data-mo-sub]')!;
  const play = contenedor.querySelector<HTMLButtonElement>('[data-mo-play]')!;
  const rellenos = [...contenedor.querySelectorAll<HTMLElement>('[data-mo-relleno]')];
  const botonesCap = [...contenedor.querySelectorAll<HTMLButtonElement>('[data-mo-cap]')];
  const pintarEscena = escena.montar(lienzo);
  const pintar = (instante: number) => {
    lienzo.instante = instante;
    pintarEscena(instante);
  };

  let reducido = movimientoReducido();
  let t = 0;
  let reproduciendo = false;
  let ultimo = 0;
  let marcoRaf = 0;
  let capituloMostrado = -1;
  let vivo = true;
  let yaArranco = false;

  function dibujar(): void {
    pintar(t);
    const k = capituloEn(escena, t);
    if (k !== capituloMostrado) {
      capituloMostrado = k;
      sub.innerHTML = textoConFormulas(escena.capitulos[k]!.texto);
      botonesCap.forEach((b, i) => b.toggleAttribute('aria-current', i === k));
    }
    escena.capitulos.forEach((c, i) => {
      const fin = escena.capitulos[i + 1]?.t ?? total;
      const p = Math.min(1, Math.max(0, (t - c.t) / (fin - c.t)));
      rellenos[i]!.style.transform = `scaleX(${p})`;
    });
    contenedor.classList.toggle('mo-terminada', t >= total - 0.01);
  }

  function estadoBoton(): void {
    const terminada = t >= total - 0.01;
    play.innerHTML = reproduciendo ? ICONO_PAUSA : ICONO_PLAY;
    play.setAttribute('aria-label', reproduciendo ? 'Pausar' : reducido ? 'Siguiente paso' : terminada ? 'Volver a ver' : 'Reproducir');
    contenedor.classList.toggle('mo-reproduciendo', reproduciendo);
  }

  function bucle(ahora: number): void {
    if (!vivo || !reproduciendo) return;
    const dt = Math.min(0.1, (ahora - ultimo) / 1000);
    ultimo = ahora;
    t = Math.min(total, t + dt);
    dibujar();
    if (t >= total) {
      reproduciendo = false;
      estadoBoton();
      return;
    }
    marcoRaf = requestAnimationFrame(bucle);
  }

  function reproducir(): void {
    if (reducido) return;
    if (t >= total - 0.01) t = 0;
    reproduciendo = true;
    yaArranco = true;
    ultimo = performance.now();
    estadoBoton();
    cancelAnimationFrame(marcoRaf);
    marcoRaf = requestAnimationFrame(bucle);
  }

  function pausar(): void {
    reproduciendo = false;
    cancelAnimationFrame(marcoRaf);
    estadoBoton();
  }

  /** Con movimiento reducido: el capítulo se ve completo, con un fundido corto. */
  function irACapituloQuieto(k: number): void {
    t = finCapitulo(escena, k);
    marco.classList.remove('mo-fundido');
    void marco.offsetWidth;
    marco.classList.add('mo-fundido');
    dibujar();
    estadoBoton();
  }

  play.addEventListener('click', () => {
    if (reducido) {
      const k = capituloEn(escena, t);
      irACapituloQuieto(t >= total - 0.01 ? 0 : Math.min(escena.capitulos.length - 1, k + 1));
      return;
    }
    if (reproduciendo) pausar();
    else reproducir();
  });
  contenedor.querySelector('[data-mo-repetir]')!.addEventListener('click', () => {
    if (reducido) return irACapituloQuieto(0);
    t = 0;
    dibujar();
    reproducir();
  });
  botonesCap.forEach((b, k) => b.addEventListener('click', () => {
    if (reducido) return irACapituloQuieto(k);
    t = escena.capitulos[k]!.t;
    dibujar();
    reproducir();
  }));
  // Barra espaciadora sobre el dibujo: pausa y sigue.
  marco.tabIndex = 0;
  marco.setAttribute('aria-label', `Animación: ${escena.titulo}. Espacio para reproducir o pausar.`);
  marco.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      play.click();
    }
  });

  // Estado inicial: si no va a arrancar sola (movimiento reducido o sin reproducción automática), se
  // ve la composición completa, que resume la explicación; si va a arrancar, el primer fotograma.
  t = reducido || opciones.automatico === false ? total : 0;
  dibujar();
  estadoBoton();

  const quitarMovimiento = alCambiarMovimiento((r) => {
    reducido = r;
    if (r) {
      pausar();
      irACapituloQuieto(capituloEn(escena, t));
    }
    estadoBoton();
  });

  let observador: IntersectionObserver | null = null;
  if (typeof IntersectionObserver === 'function') {
    observador = new IntersectionObserver((entradas) => {
      for (const e of entradas) {
        if (e.isIntersecting && !yaArranco && !reducido && opciones.automatico !== false) reproducir();
        else if (!e.isIntersecting && reproduciendo) pausar();
      }
    }, { threshold: 0.45 });
    observador.observe(marco);
  }

  document.fonts?.ready.then(() => {
    if (!vivo) return;
    lienzo.remaquetar();
    dibujar();
  }).catch(() => {});

  return () => {
    vivo = false;
    cancelAnimationFrame(marcoRaf);
    observador?.disconnect();
    quitarMovimiento();
  };
}
