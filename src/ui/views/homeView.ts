import { hrefSeccion } from '../../app/router.ts';
import type { EstadoEstudio } from '../../app/store.ts';
import { dominioGlobal, dominioSeccion } from '../../domain/mastery.ts';
import { seccionesPrioritarias } from '../../domain/priority.ts';
import { iconoSvg } from '../../icons/icon.ts';
import { LEYENDA_GLIFOS } from '../../icons/legend.ts';
import { ciudadPixel } from '../../scene/pixelCity.ts';
import { anilloDominio } from '../components/ring.ts';
import { colorDominio, porcentaje } from '../format.ts';
import type { ContextoVista } from './context.ts';

export function pintarInicio(ctx: ContextoVista, estado: EstadoEstudio): void {
  const { tema, progreso } = estado;
  const dominioDe = (seccionId: string) => dominioSeccion(tema, progreso, seccionId);

  const estudiaYa = seccionesPrioritarias(tema, progreso)
    .map((s) => `<a href="${hrefSeccion(s.id)}"><b>${s.id}</b>${s.titulo}<span class="w">peso ${s.pesoExamen} % · dominio ${porcentaje(dominioDe(s.id))}</span></a>`)
    .join('');

  const tiles = tema.secciones
    .map((s) => {
      const d = dominioDe(s.id);
      const n = tema.conceptos.filter((c) => c.seccionId === s.id).length;
      return `<a class="tile rev" href="${hrefSeccion(s.id)}" style="border-color:${colorDominio(d)}"><span class="i">${s.id}</span><span class="n">${s.titulo}</span><span class="w">Peso ${s.pesoExamen} % · dominio ${porcentaje(d)} · ${n} conceptos</span></a>`;
    })
    .join('');

  const gramatica = LEYENDA_GLIFOS.map(([glifo, texto]) => `<div>${iconoSvg([glifo], '#fff')}<span>${texto}</span></div>`).join('');

  ctx.pagina.innerHTML = `<section class="hero"><span class="pill k">Tema ${tema.meta.numero} · ${tema.meta.titulo}</span><h1>La Ciudad<br>del <span>Dinero</span></h1><p>Cada entidad del sistema financiero es un edificio con su símbolo. Lee la ficha, pide que te lo expliquen de otra forma, desactiva la trampa del examen y compruébalo.</p></section>
 ${ciudadPixel(tema, progreso)}<p class="legend">Luces de cada edificio = tu dominio: <b style="color:#ff5a5a">rojo</b> flojo · <b style="color:#ffd23f">amarillo</b> regular · <b style="color:#4ade80">verde</b> dominado · apagado = sin estudiar. Pulsa un edificio para entrar.</p>
 <div class="dash rev"><div class="big">${anilloDominio(dominioGlobal(tema, progreso), 130)}</div><div><h3>📌 Estudia ya: lo que más pesa y menos dominas</h3><div class="ya">${estudiaYa}</div></div></div>
 <h2 class="h2 rev">Subpuntos del tema</h2><div class="tiles">${tiles}</div>
 <h2 class="h2 rev">Gramática visual</h2><div class="gram rev">${gramatica}</div>
 <p class="next">Fase 1 de 6. Próximas: esquemas interactivos, flashcards con repetición espaciada, ejercicios, simulador de examen y panel de predicción.</p>`;
  ctx.tituloMovil.textContent = tema.meta.ciudad;
}
