/*
 * Piezas comunes de la identidad editorial: la navegación discreta (marca, dónde estás y cuatro
 * accesos; en el móvil, «Sumario» y «Menú»), el Sumario (el temario real, con su buscador y el
 * dominio, en una capa de papel) y la barra de un capítulo, que marca la parte que se está leyendo.
 * Las usan la portada de la asignatura y el índice del Tema 2.
 */
import { hrefAcademia, hrefInicio, hrefProgreso, hrefSesion } from '../../app/router.ts';
import type { EstadoEstudio } from '../../app/store.ts';
import type { Asignatura } from '../../content/academia.ts';
import type { UltimoSitio } from '../views/academiaView.ts';
import { escaparHtml } from './simbolos.ts';
import { conectarBuscadorTemario, temarioHtml } from './temario.ts';

export interface MigaEditorial {
  texto: string;
  href?: string;
}

export const ROMANOS = ['I', 'II', 'III', 'IV', 'V'] as const;

const migasHtml = (migas: readonly MigaEditorial[]) =>
  migas.map((m) => (m.href ? `<a href="${m.href}">${escaparHtml(m.texto)}</a>` : `<b>${escaparHtml(m.texto)}</b>`)).join('<span aria-hidden="true">/</span>');

/** Barra superior. «noche» flota sobre una apertura oscura; «papel», fija sobre la lectura. */
export function navegacionEditorial(variante: 'noche' | 'papel', migas: readonly MigaEditorial[]): string {
  const accesos = `
      <button type="button" class="ed-accion" data-sumario aria-haspopup="dialog"><span class="ed-ico ed-ico-sumario" aria-hidden="true"></span>Sumario</button>
      <a class="ed-accion" href="${hrefInicio()}" title="El Atlas se abre dentro de la Ciudad del Dinero"><span class="ed-ico ed-ico-atlas" aria-hidden="true"></span>Atlas</a>
      <a class="ed-accion" href="${hrefSesion()}">Cuaderno</a>
      <a class="ed-accion" href="${hrefProgreso()}">Mi progreso</a>`;
  return `<header class="ed-nav ed-nav-${variante}" data-ed-nav>
    <a class="ed-marca" href="${hrefAcademia()}" aria-label="Financial Academy: todas las asignaturas"><b>Financial</b><b>Academy</b></a>
    <nav class="ed-migas" aria-label="Estás en">${migasHtml(migas)}</nav>
    <nav class="ed-acciones" aria-label="Accesos">${accesos}</nav>
    <button type="button" class="ed-menu-boton" data-ed-menu aria-expanded="false" aria-controls="ed-menu"><span aria-hidden="true"></span>Menú</button>
    <div class="ed-menu" id="ed-menu" hidden>
      <p class="ed-menu-ruta">${migasHtml(migas)}</p>
      <nav aria-label="Accesos">${accesos}<a class="ed-accion" href="${hrefAcademia()}">Academia · todas las asignaturas</a></nav>
    </div>
  </header>`;
}

/** Sumario: el temario completo de la asignatura (temario.ts), con su buscador y tu dominio. */
export function sumarioEditorial(a: Asignatura, estado: EstadoEstudio, ultimo?: UltimoSitio): string {
  const continuar = ultimo
    ? `<a class="ed-sumario-continuar" href="${ultimo.href}"><small>Continuar donde lo dejaste</small>${escaparHtml(ultimo.titulo)} →</a>`
    : '';
  return `<div class="ed-sumario" data-capa-sumario hidden role="dialog" aria-modal="true" aria-labelledby="ed-sumario-t">
    <div class="ed-sumario-hoja" data-temario>
      <header>
        <p class="ed-volanta">${escaparHtml(a.nombre)} · ${a.temas.length} capítulos</p>
        <h2 id="ed-sumario-t">Sumario</h2>
        <button type="button" class="ed-cerrar" data-cerrar-sumario>Cerrar <span aria-hidden="true">×</span></button>
        <label class="ed-buscar"><span class="sr">Buscar en el sumario</span><input type="search" data-tm-buscar placeholder="Buscar: 3.2B, bancos, TAE, descuento…"></label>
        ${continuar}
      </header>
      <div class="ed-sumario-columnas">${a.temas.map((t, k) => `<section><p class="ed-sumario-cap"><span>${ROMANOS[k] ?? k + 1}</span>${escaparHtml(t.titulo)}</p>${temarioHtml(t, estado)}</section>`).join('')}</div>
      <p class="ed-sumario-vacio" data-tm-vacio hidden>Nada coincide con la búsqueda.</p>
    </div>
  </div>`;
}

/**
 * Comportamiento de una página editorial: abrir y cerrar el Sumario (modal, con el foco de vuelta
 * al botón), el menú del móvil, la barra que se compacta al bajar y la parte del capítulo que se
 * está leyendo. Devuelve la función que lo desmonta.
 */
export function montarEditorial(raiz: HTMLElement): () => void {
  const paradas: (() => void)[] = [];
  // Restos de una página anterior que no se desmontó bien: sin ellos, nada queda bloqueado.
  document.querySelectorAll<HTMLElement>('body > [data-capa-sumario]').forEach((c) => c.remove());
  document.documentElement.classList.remove('ed-sin-scroll');
  const escuchar = <K extends keyof WindowEventMap>(destino: Window | Document, tipo: K, fn: (e: WindowEventMap[K]) => void, opciones?: AddEventListenerOptions) => {
    destino.addEventListener(tipo, fn as EventListener, opciones);
    paradas.push(() => destino.removeEventListener(tipo, fn as EventListener, opciones));
  };

  // El Sumario es un diálogo modal: vive al nivel de <body> para poder dejar inerte todo lo demás.
  const capa = raiz.querySelector<HTMLElement>('[data-capa-sumario]');
  let inertes: HTMLElement[] = [];
  let volverA: HTMLElement | null = null;
  if (capa) {
    document.body.append(capa);
    const hoja = capa.querySelector<HTMLElement>('[data-temario]');
    if (hoja) conectarBuscadorTemario(hoja);
    paradas.push(() => capa.remove());
  }
  const abrirSumario = (desde: HTMLElement | null) => {
    if (!capa || !capa.hidden) return;
    volverA = desde;
    capa.hidden = false;
    document.documentElement.classList.add('ed-sin-scroll');
    // Ninguna capa de sumario se bloquea (si quedara una de otra página, tampoco).
    inertes = [...document.body.children].filter((el): el is HTMLElement => el !== capa && el instanceof HTMLElement && !el.inert && !el.matches('[data-capa-sumario]'));
    inertes.forEach((el) => { el.inert = true; });
    capa.inert = false;
    capa.querySelector<HTMLInputElement>('[data-tm-buscar]')?.focus();
  };
  const cerrarSumario = (devolverFoco = true) => {
    if (!capa || capa.hidden) return;
    capa.hidden = true;
    document.documentElement.classList.remove('ed-sin-scroll');
    inertes.forEach((el) => { el.inert = false; });
    inertes = [];
    if (devolverFoco) volverA?.focus();
  };
  paradas.push(() => cerrarSumario(false));

  const menu = raiz.querySelector<HTMLElement>('#ed-menu');
  const botonMenu = raiz.querySelector<HTMLButtonElement>('[data-ed-menu]');
  const cerrarMenu = () => {
    if (!menu || menu.hidden) return;
    menu.hidden = true;
    botonMenu?.setAttribute('aria-expanded', 'false');
  };

  // La raíz es el contenedor de la página, el mismo en todas las vistas: el manejador se quita al
  // salir. Si no, al navegar se acumulaban y uno antiguo dejaba inerte el Sumario nuevo.
  const alPulsar = (e: Event) => {
    const t = e.target as Element;
    const abre = t.closest<HTMLElement>('[data-sumario]');
    if (abre) {
      cerrarMenu();
      abrirSumario(abre);
    } else if (t.closest('[data-ed-menu]') && menu && botonMenu) {
      menu.hidden = !menu.hidden;
      botonMenu.setAttribute('aria-expanded', String(!menu.hidden));
    } else if (!t.closest('#ed-menu')) cerrarMenu();
  };
  raiz.addEventListener('click', alPulsar);
  paradas.push(() => raiz.removeEventListener('click', alPulsar));
  capa?.addEventListener('click', (e) => {
    const t = e.target as Element;
    // Un enlace del sumario navega; si es a la misma página, al menos la capa se cierra.
    if (t === capa || t.closest('[data-cerrar-sumario]')) cerrarSumario();
    else if (t.closest('a')) cerrarSumario(false);
  });
  escuchar(document, 'keydown', (e) => {
    if (e.key !== 'Escape') return;
    cerrarSumario();
    cerrarMenu();
  });

  // La barra superior se compacta al bajar; la del capítulo se pega justo debajo de ella.
  const nav = raiz.querySelector<HTMLElement>('[data-ed-nav]');
  if (nav) {
    const alBajar = () => nav.classList.toggle('compacta', scrollY > 60);
    escuchar(window, 'scroll', alBajar, { passive: true });
    alBajar();
    if (typeof ResizeObserver === 'function') {
      const medir = new ResizeObserver(() => raiz.style.setProperty('--ed-nav-alto', `${nav.offsetHeight}px`));
      medir.observe(nav, { box: 'border-box' });
      paradas.push(() => medir.disconnect());
    }
  }

  // Barra del capítulo: marca la parte que se está leyendo.
  const partes = [...raiz.querySelectorAll<HTMLElement>('[data-ed-parte]')];
  if (partes.length && typeof IntersectionObserver === 'function') {
    const enlaces = new Map([...raiz.querySelectorAll<HTMLAnchorElement>('[data-parte]')].map((a) => [a.dataset.parte!, a]));
    const obs = new IntersectionObserver((entradas) => {
      for (const en of entradas) {
        if (!en.isIntersecting) continue;
        enlaces.forEach((a) => a.removeAttribute('aria-current'));
        enlaces.get((en.target as HTMLElement).dataset.edParte!)?.setAttribute('aria-current', 'location');
      }
    }, { rootMargin: '-40% 0px -55% 0px' });
    partes.forEach((p) => obs.observe(p));
    paradas.push(() => obs.disconnect());
  }

  return () => paradas.forEach((p) => p());
}
