import { hrefAcademia, hrefAsignatura } from '../../app/router.ts';
import { ASIGNATURAS, type Asignatura, disponible } from '../../content/academia.ts';
import { medallonAsignatura } from '../views/academiaView.ts';

/*
 * Orientación global: migas "Financial Academy › Asignatura › Tema" en la barra superior (cada una
 * vuelve a su nivel sin perder nada: el progreso vive en el almacén) e índice de la academia para
 * el selector y las páginas de asignatura.
 */

export interface Miga {
  texto: string;
  href: string;
}

export function pintarMigas(nav: HTMLElement | null, migas: readonly Miga[]): void {
  if (!nav) return;
  nav.innerHTML = migas.map((m) => `<a href="${m.href}">${m.texto}</a><span class="mg-sep" aria-hidden="true">›</span>`).join('');
  nav.hidden = migas.length === 0;
}

/** Índice lateral en la academia: las asignaturas y, de las abiertas, sus temas. */
export function pintarRailAcademia(rail: HTMLElement, activa?: Asignatura): void {
  const filas = ASIGNATURAS.map((a) => {
    const abierta = disponible(a);
    const cab = abierta
      ? `<a class="sl ra-asig${a === activa ? ' on' : ''}" href="${hrefAsignatura(a.id)}" style="--c:${a.color}"><div class="top">${medallonAsignatura(a, 'ra-sello')}<span>${a.nombre}</span></div></a>`
      : `<div class="sl ra-asig ra-pendiente" style="--c:${a.color}"><div class="top">${medallonAsignatura(a, 'ra-sello')}<span>${a.nombre}</span><span class="pw">sin contenido</span></div></div>`;
    const temas = abierta ? a.temas.map((t) => `<a class="sl ra-tema" href="${t.href}"><div class="top"><span class="id">${t.numero}</span><span>${t.titulo}</span></div></a>`).join('') : '';
    return cab + temas;
  }).join('');
  rail.innerHTML = `<a class="brand" href="${hrefAcademia()}"><span class="ring tema-anillo" aria-hidden="true">FA</span><span><small class="brand-ante">Financial Academy</small><b>Asignaturas</b><small>Ciclo de Administración y Finanzas</small></span></a><div class="grp">Mundos</div>${filas}`;
}
