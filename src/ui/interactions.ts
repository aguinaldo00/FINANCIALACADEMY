import type { EstadoEstudio } from '../app/store.ts';
import { dominioConcepto } from '../domain/mastery.ts';
import { actualizarEtiquetaDominio } from './components/conceptCard.ts';
import { pintarOtraForma, pintarPregunta } from './components/conceptPanels.ts';
import { pintarRail } from './components/rail.ts';
import type { ContextoVista } from './views/context.ts';

/** Delegación de clics de las fichas: otra forma (cicla modos), trampa y compruébalo. */
export function conectarFichas(ctx: ContextoVista, estado: EstadoEstudio): void {
  ctx.pagina.addEventListener('click', (e) => {
    const boton = (e.target as Element).closest<HTMLElement>('.ab');
    if (!boton) return;
    const ficha = boton.closest<HTMLElement>('.cc');
    const concepto = estado.tema.conceptos.find((c) => c.id === ficha?.dataset.id);
    const accion = boton.dataset.a;
    const panel = ficha?.querySelector<HTMLElement>(`.pn.${accion}`);
    if (!ficha || !concepto || !panel) return;

    if (accion === 'o') {
      const totalModos = estado.tema.modos.length;
      const abierto = boton.getAttribute('aria-expanded') === 'true';
      const actual = Number(ficha.dataset.mo || 0);
      const indice = abierto ? (actual + 1) % totalModos : actual;
      ficha.dataset.mo = String(indice);
      pintarOtraForma(panel, concepto, estado.tema.modos, indice);
      panel.hidden = false;
      boton.setAttribute('aria-expanded', 'true');
      boton.textContent = `🔄 Otra forma (${indice + 1}/${totalModos})`;
      return;
    }

    const abierto = !panel.hidden;
    panel.hidden = abierto;
    boton.setAttribute('aria-expanded', String(!abierto));
    if (accion === 'q' && !abierto) {
      pintarPregunta(panel, concepto, (indiceElegido) => {
        const { correcta } = estado.responder(concepto, indiceElegido);
        if (correcta) {
          actualizarEtiquetaDominio(ficha, dominioConcepto(estado.progreso, concepto.id));
          pintarRail(ctx.rail, estado, ficha.closest<HTMLElement>('[data-sec]')?.dataset.sec ?? null);
        }
        return correcta;
      });
    }
  });
}

let observador: IntersectionObserver | undefined;

/** Animación de aparición de los elementos `.rev` al entrar en pantalla. */
export function activarAparicion(): void {
  observador?.disconnect();
  observador = new IntersectionObserver(
    (entradas) => {
      for (const entrada of entradas) {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('in');
          observador?.unobserve(entrada.target);
        }
      }
    },
    { rootMargin: '0px 0px -6% 0px' },
  );
  document.querySelectorAll('.rev:not(.in)').forEach((el) => observador?.observe(el));
}

/** Menú lateral en móvil: se abre con el botón y se cierra al pulsar fuera o en un enlace. */
export function conectarMenuMovil(botonMenu: HTMLElement, rail: HTMLElement): void {
  botonMenu.onclick = (e) => {
    e.stopPropagation();
    document.body.classList.toggle('menu');
  };
  document.addEventListener('click', (e) => {
    const destino = e.target as Element;
    if (document.body.classList.contains('menu') && (!rail.contains(destino) || destino.closest('a'))) {
      document.body.classList.remove('menu');
    }
  });
}
