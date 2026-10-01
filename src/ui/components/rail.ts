import type { EstadoEstudio } from '../../app/store.ts';
import { hrefExamen, hrefInicio, hrefSeccion } from '../../app/router.ts';
import { dominioGlobal, dominioSeccion } from '../../domain/mastery.ts';
import { colorDominio } from '../format.ts';
import { MARCA } from './brandTitle.ts';
import { anilloDominio } from './ring.ts';

/** Índice lateral: dominio global y una barra de dominio por sección. */
export function pintarRail(rail: HTMLElement, estado: EstadoEstudio, seccionActual: string | null): void {
  const { tema, progreso } = estado;
  const cabecera = `<a class="brand" href="${hrefInicio()}">${anilloDominio(dominioGlobal(tema, progreso))}<span><small class="brand-ante">${MARCA.asignatura}</small><b>${MARCA.ciudad}</b><small>Tema ${tema.meta.numero} · dominio global</small></span></a>`;
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
  const examen = tema.ampliacion?.bloques.length
    ? `<div class="grp">Examen</div><a class="sl exn${seccionActual === 'examen' ? ' on' : ''}" href="${hrefExamen()}"><div class="top"><span class="id">📊</span><span>Predicción de examen</span></div><small class="ex-sub">Qué es más probable que caiga</small></a>`
    : '';
  rail.innerHTML = cabecera + grupos + examen;
}
