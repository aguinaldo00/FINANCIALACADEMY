import { hrefAsignatura } from '../../app/router.ts';
import { ASIGNATURAS, type Asignatura, disponible, NOMBRE_EXPERIENCIA } from '../../content/academia.ts';
import { ICONOS_UI } from '../../icons/ui.ts';
import type { ContextoVista } from './context.ts';

/*
 * Selector de mundos: la entrada de Financial Academy. Cada asignatura es un medallón con su icono
 * propio y su color de identidad; las que tienen temas se abren, las demás aparecen atenuadas como
 * "todavía sin contenido" (estado derivado de los datos, nunca declarado a mano).
 * Movimiento: los medallones flotan, siguen al puntero con paralaje y, al entrar, el elegido se
 * acerca a la cámara antes de cambiar de vista. Con movimiento reducido, nada de eso.
 */

/** Último sitio visitado de cada asignatura ("Continuar donde lo dejaste"). */
export interface UltimoSitio {
  href: string;
  titulo: string;
}

/** Medallón grande de una asignatura (misma gramática que los iconos de la interfaz). */
export function medallonAsignatura(a: Asignatura, clase = 'ac-sello'): string {
  return `<svg class="${clase}" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><circle class="ac-disco" cx="32" cy="32" r="30"/><circle class="ac-grafila" cx="32" cy="32" r="26.5"/><g class="ac-trazo" transform="translate(14 14) scale(.5625)">${ICONOS_UI[a.icono]}</g></svg>`;
}

function mundo(a: Asignatura, i: number, ultimo: UltimoSitio | null): string {
  const abierta = disponible(a);
  const estado = abierta ? `${a.temas.length} ${a.temas.length === 1 ? 'tema' : 'temas'}` : 'Todavía sin contenido';
  const temas = abierta
    ? `<ul class="ac-temas">${a.temas.map((t) => `<li><b>Tema ${t.numero}</b> ${t.titulo}<small>${NOMBRE_EXPERIENCIA[t.experiencia]}</small></li>`).join('')}</ul>`
    : '';
  const cuerpo = `<span class="ac-halo" aria-hidden="true"></span>${medallonAsignatura(a)}<span class="ac-nombre">${a.nombre}</span><span class="ac-estado">${estado}</span>`;
  const puerta = abierta
    ? `<a class="ac-puerta" href="${hrefAsignatura(a.id)}" data-entrar aria-label="${a.nombre}: ${estado}. Entrar">${cuerpo}</a>`
    : `<div class="ac-puerta" aria-disabled="true" role="group" aria-label="${a.nombre}: todavía sin contenido">${cuerpo}</div>`;
  const continuar = abierta && ultimo ? `<a class="ac-continuar" href="${ultimo.href}">Continuar: <b>${ultimo.titulo}</b> →</a>` : '';
  return `<li class="ac-mundo ${abierta ? 'abierta' : 'pendiente'}" style="--c:${a.color};--i:${i}">${puerta}${temas || continuar ? `<div class="ac-detalle">${temas}${continuar}</div>` : ''}</li>`;
}

export function pintarAcademia(ctx: ContextoVista, ultimo: Readonly<Record<string, UltimoSitio>> = {}): () => void {
  const abiertas = ASIGNATURAS.filter(disponible).length;
  ctx.pagina.innerHTML = `<div class="academia" data-academia>
  <div class="ac-fondo" aria-hidden="true"><i class="ac-orbita o1"></i><i class="ac-orbita o2"></i><i class="ac-orbita o3"></i></div>
  <header class="ac-cab">
    <p class="ac-ante">Financial Academy</p>
    <h1>Elige un mundo</h1>
    <p class="ac-lema">Ciclo de Administración y Finanzas · ${ASIGNATURAS.length} asignaturas · ${abiertas} ${abiertas === 1 ? 'abierta' : 'abiertas'}</p>
  </header>
  <ul class="ac-mundos" aria-label="Asignaturas">${ASIGNATURAS.map((a, i) => mundo(a, i, ultimo[a.id] ?? null)).join('')}</ul>
</div>`;
  ctx.tituloMovil.textContent = 'Financial Academy';

  const raiz = ctx.pagina.querySelector<HTMLElement>('[data-academia]')!;
  const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let raf = 0;
  // Paralaje: el puntero inclina levemente el conjunto (cada medallón se mueve según su fila).
  const mover = (e: PointerEvent) => {
    if (reducido || e.pointerType === 'touch') return;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const r = raiz.getBoundingClientRect();
      raiz.style.setProperty('--px', (((e.clientX - r.left) / r.width - 0.5) * 2).toFixed(3));
      raiz.style.setProperty('--py', (((e.clientY - r.top) / r.height - 0.5) * 2).toFixed(3));
    });
  };
  raiz.addEventListener('pointermove', mover);
  // Entrada: el mundo elegido se acerca a la cámara y después se cambia de vista.
  let temporizador = 0;
  const entrar = (e: MouseEvent) => {
    const enlace = (e.target as Element).closest<HTMLAnchorElement>('a[data-entrar]');
    if (!enlace || reducido || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    enlace.closest('.ac-mundo')?.classList.add('entrando');
    raiz.classList.add('saliendo');
    temporizador = window.setTimeout(() => (location.hash = enlace.getAttribute('href') ?? ''), 520);
  };
  raiz.addEventListener('click', entrar);
  return () => {
    cancelAnimationFrame(raf);
    clearTimeout(temporizador);
  };
}
