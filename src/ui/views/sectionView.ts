import { hrefInicio, hrefSeccion } from '../../app/router.ts';
import type { EstadoEstudio } from '../../app/store.ts';
import { dominioSeccion } from '../../domain/mastery.ts';
import { fichaConcepto } from '../components/conceptCard.ts';
import { colorDominio, porcentaje } from '../format.ts';
import type { ContextoVista } from './context.ts';

export function pintarSeccion(ctx: ContextoVista, estado: EstadoEstudio, seccionId: string, conceptoFoco: string | null): void {
  const { tema, progreso } = estado;
  const i = tema.secciones.findIndex((s) => s.id === seccionId);
  const s = tema.secciones[i];
  if (!s) return;
  const anterior = tema.secciones[i - 1];
  const siguiente = tema.secciones[i + 1];
  const conceptos = tema.conceptos.filter((c) => c.seccionId === seccionId);
  const d = dominioSeccion(tema, progreso, seccionId);

  const enlaceAnterior = anterior
    ? `<a href="${hrefSeccion(anterior.id)}"><small>← Anterior</small><b>${anterior.id} ${anterior.titulo}</b></a>`
    : `<a href="${hrefInicio()}"><small>←</small><b>Inicio</b></a>`;
  const enlaceSiguiente = siguiente
    ? `<a href="${hrefSeccion(siguiente.id)}"><small>Siguiente →</small><b>${siguiente.id} ${siguiente.titulo}</b></a>`
    : `<a href="${hrefInicio()}"><small>Fin del tema →</small><b>Inicio</b></a>`;

  ctx.pagina.innerHTML = `<div data-sec="${seccionId}"><header class="sh"><div class="kick"><span class="pill k">${s.id}</span><span class="pill">Peso estimado en examen: ${s.pesoExamen} %</span><span class="pill" style="border-color:${colorDominio(d)}">Dominio ${porcentaje(d)}</span></div><h1>${s.titulo}</h1><p>${s.descripcion}</p></header>
 ${conceptos.map((c) => fichaConcepto(c, progreso)).join('')}
 <nav class="pager">${enlaceAnterior}${enlaceSiguiente}</nav></div>`;
  ctx.tituloMovil.textContent = `${s.id} · ${s.titulo}`;

  if (conceptoFoco) {
    const ficha = document.getElementById(`c-${conceptoFoco}`);
    if (ficha) {
      ficha.classList.add('in');
      setTimeout(() => ficha.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
    }
  }
}
