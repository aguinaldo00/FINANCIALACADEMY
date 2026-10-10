import { hrefExamen, hrefProgreso, hrefRepaso, hrefSesion, hrefSimulacro, hrefVisual } from '../../app/router.ts';
import type { EstadoEstudio } from '../../app/store.ts';
import type { EstadoPractica } from '../../app/practiceStore.ts';
import { type Asignatura, NOMBRE_EXPERIENCIA } from '../../content/academia.ts';
import type { TemaCatalogo } from '../../content/temas/index.ts';
import { dominioGlobal } from '../../domain/mastery.ts';
import { type IconoUi, iconoUi } from '../../icons/ui.ts';
import { conectarBuscadorTemario, temarioHtml } from '../components/temario.ts';
import { porcentaje } from '../format.ts';
import { medallonAsignatura, type UltimoSitio } from './academiaView.ts';
import type { ContextoVista } from './context.ts';

/*
 * Página de una asignatura: sus temas como puertas (cada uno con su propia experiencia) y el temario
 * completo para ir directo a cualquier apartado sin pasar por la exploración visual. Las
 * herramientas de estudio del Tema 1 (los botones redondeados de siempre) tienen aquí su fila.
 */

const ICONO_EXPERIENCIA: Readonly<Record<TemaCatalogo['experiencia'], IconoUi>> = {
  'ciudad-3d': 'calle',
  leccion: 'proyector',
};

function puerta(t: TemaCatalogo, estado: EstadoEstudio, color: string): string {
  // El dominio solo existe para el tema que lo registra (Tema 1); nunca se inventa para los demás.
  const dominio = t.numero === estado.tema.meta.numero ? `<span class="as-dom">Tu dominio: <b>${porcentaje(dominioGlobal(estado.tema, estado.progreso))}</b></span>` : '';
  return `<a class="as-puerta as-${t.experiencia}" href="${t.href}" style="--c:${color}">
    <span class="as-escena" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
    <span class="as-tema">Tema ${t.numero}</span>
    <span class="as-titulo">${t.titulo}</span>
    <span class="as-desc">${t.descripcion}</span>
    <span class="as-pie"><span class="pill">${iconoUi(ICONO_EXPERIENCIA[t.experiencia])} ${NOMBRE_EXPERIENCIA[t.experiencia]}</span>${dominio}<span class="as-ir">Entrar →</span></span>
  </a>`;
}

/** Herramientas de estudio y examen del Tema 1 (dependen de su ampliación). */
function herramientas(estado: EstadoEstudio, practica: EstadoPractica | undefined): string {
  const { tema } = estado;
  if (!tema.ampliacion?.bloques.length) return '';
  const n = practica?.pendientes() ?? 0;
  const boton = (href: string, clase: string, icono: IconoUi, texto: string, extra = '') => `<a class="ab ${clase}" href="${href}">${iconoUi(icono)} ${texto}${extra}</a>`;
  return `<section class="as-herramientas rev" aria-labelledby="as-h-t"><h2 class="h2" id="as-h-t">Estudio y examen <small>· Tema ${tema.meta.numero}</small></h2>
    <div class="acts">${boton(hrefSesion(), 'q', 'diana', 'Estudiar hoy')}${boton(hrefExamen(), 'o', 'barras', 'Predicción de examen')}${tema.ampliacion.infografias?.length ? boton(hrefVisual(), 'v', 'proyector', 'Infografías') : ''}${boton(hrefSimulacro(), 'e', 'examen', 'Simulacro')}${boton(hrefRepaso(), 'f', 'repaso', 'Repaso', n ? ` <span class="as-insignia" aria-label="${n} pendientes">${n}</span>` : '')}${boton(hrefProgreso(), 'p', 'progreso', 'Mi progreso')}</div></section>`;
}

export function pintarAsignatura(ctx: ContextoVista, a: Asignatura, estado: EstadoEstudio, practica?: EstadoPractica, ultimo?: UltimoSitio): void {
  const continuar = ultimo ? `<a class="as-continuar" href="${ultimo.href}">Continuar donde lo dejaste: <b>${ultimo.titulo}</b> →</a>` : '';
  ctx.pagina.innerHTML = `<div class="asignatura" style="--c:${a.color}">
  <header class="as-cab rev">${medallonAsignatura(a, 'as-sello')}<div><p class="as-ante">Asignatura</p><h1>${a.nombre}</h1><p>${a.temas.length} ${a.temas.length === 1 ? 'tema' : 'temas'}. Cada uno se estudia a su manera; el temario de abajo lleva directo a cualquier apartado.</p>${continuar}</div></header>
  <section class="as-temas rev" aria-label="Temas">${a.temas.map((t) => puerta(t, estado, a.color)).join('')}</section>
  ${herramientas(estado, practica)}
  <section class="as-temario rev" aria-labelledby="as-t-t" data-temario>
    <div class="as-temario-cab"><h2 class="h2" id="as-t-t">Temario</h2>
      <label class="as-buscar">${iconoUi('lupa')}<input type="search" data-tm-buscar placeholder="Buscar un apartado o concepto (p. ej. 3.2B, bancos, TAE…)" aria-label="Buscar en el temario"></label></div>
    ${a.temas.map((t) => temarioHtml(t, estado)).join('')}
    <p class="as-vacio" data-tm-vacio hidden>Nada coincide con la búsqueda.</p>
  </section>
</div>`;
  ctx.tituloMovil.textContent = a.nombre;
  conectarBuscadorTemario(ctx.pagina.querySelector<HTMLElement>('[data-temario]')!);
}
