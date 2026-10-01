import type { EstadoEstudio } from '../../app/store.ts';
import { hrefInicio, hrefSeccion } from '../../app/router.ts';
import { dominioGlobal, dominioSeccion } from '../../domain/mastery.ts';
import { colorDominio } from '../format.ts';
import { anilloDominio } from './ring.ts';

/** Índice lateral: dominio global y una barra de dominio por sección. */
export function pintarRail(rail: HTMLElement, estado: EstadoEstudio, seccionActual: string | null): void {
  const { tema, progreso } = estado;
  const cabecera = `<a class="brand" href="${hrefInicio()}">${anilloDominio(dominioGlobal(tema, progreso))}<span><b>${tema.meta.ciudad}</b><small>Tema ${tema.meta.numero} · dominio global</small></span></a>`;
  const grupos = tema.grupos
    .map((g) => {
      const secciones = tema.secciones
        .filter((s) => s.grupoId === g.id)
        .map((s) => {
          const d = dominioSeccion(tema, progreso, s.id);
          return `<a class="sl${s.id === seccionActual ? ' on' : ''}" href="${hrefSeccion(s.id)}"><div class="top"><span class="id">${s.id}</span><span>${s.titulo}</span><span class="pw">${s.pesoExamen} %</span></div><div class="bar"><i style="width:${d * 100}%;background:${colorDominio(d)}"></i></div></a>`;
        })
        .join('');
      return `<div class="grp">${g.titulo}</div>${secciones}`;
    })
    .join('');
  rail.innerHTML = cabecera + grupos;
}
