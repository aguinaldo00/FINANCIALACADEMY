import { hrefSeccion } from '../../app/router.ts';
import type { Tema } from '../../content/schema.ts';
import { dominioGlobal, dominioSeccion } from '../../domain/mastery.ts';
import type { Progreso } from '../../domain/progress.ts';
import { seccionesPrioritarias } from '../../domain/priority.ts';
import { colorBloque } from '../blockColors.ts';
import { porcentaje } from '../format.ts';

/*
 * "El tema, de principio a fin": cómo se reparte el examen, en un gráfico circular de dos anillos.
 *   - Interior: los apartados, con su ángulo = su peso en el examen y el color de su barrio.
 *   - Exterior: los subpuntos, cada uno dentro del arco de su apartado; su ángulo = su peso y el
 *     relleno radial = tu dominio (vacío = sin estudiar, lleno = dominado).
 * Sin rótulos dentro de las porciones (nada se solapa): la leyenda de al lado tiene todos los
 * valores en texto y enlaza con cada sección. Pasar o enfocar una porción o una fila resalta las
 * dos. No añade datos: ordena los que ya están (secciones, pesos de DATA y tu progreso).
 */

const C = 160;
const ANILLO_INT = [64, 100] as const;
const ANILLO_EXT = [106, 152] as const;
/** Separación entre porciones (px, en el radio medio de cada anillo). */
const HUECO = 2;
/** Por debajo de este ángulo el número del apartado no cabe dentro de su porción. */
const MIN_ROTULO = 20;

export interface Porcion {
  id: string;
  /** Grados, desde arriba y en el sentido de las agujas del reloj. */
  desde: number;
  hasta: number;
}

/** Reparte 360° entre los pesos (en orden), empezando arriba. */
export function repartir(items: readonly { id: string; peso: number }[]): Porcion[] {
  const total = items.reduce((s, x) => s + x.peso, 0) || 1;
  let a = 0;
  return items.map((x) => {
    const desde = a;
    a += (x.peso / total) * 360;
    return { id: x.id, desde, hasta: a };
  });
}

const punto = (r: number, grados: number): string => {
  const rad = ((grados - 90) * Math.PI) / 180;
  return `${(C + r * Math.cos(rad)).toFixed(2)} ${(C + r * Math.sin(rad)).toFixed(2)}`;
};

/** Sector de corona entre r0 y r1, con el hueco restado a cada lado. */
function sector(r0: number, r1: number, desde: number, hasta: number): string {
  const pad = ((HUECO / 2 / ((r0 + r1) / 2)) * 180) / Math.PI;
  const a0 = desde + pad;
  const a1 = Math.max(a0 + 0.2, hasta - pad);
  const grande = a1 - a0 > 180 ? 1 : 0;
  return `M${punto(r1, a0)}A${r1} ${r1} 0 ${grande} 1 ${punto(r1, a1)}L${punto(r0, a1)}A${r0} ${r0} 0 ${grande} 0 ${punto(r0, a0)}Z`;
}

export function lineaTemporal(tema: Tema, progreso: Progreso): string {
  const siguiente = seccionesPrioritarias(tema, progreso, 1)[0]?.id;
  const grupos = tema.grupos.map((g, gi) => {
    const secciones = tema.secciones.filter((s) => s.grupoId === g.id);
    const [numero, ...resto] = g.titulo.split(' · ');
    return {
      g,
      color: colorBloque(gi),
      numero: numero ?? String(gi + 1),
      nombre: resto.join(' · ') || g.titulo,
      peso: secciones.reduce((s, x) => s + x.pesoExamen, 0),
      secciones,
    };
  });
  const arcosGrupo = repartir(grupos.map((x) => ({ id: x.g.id, peso: x.peso })));
  const arcosSeccion = repartir(tema.secciones.map((s) => ({ id: s.id, peso: s.pesoExamen })));
  const arco = new Map(arcosSeccion.map((a) => [a.id, a]));

  const interior = grupos
    .map((x, gi) => {
      const a = arcosGrupo[gi]!;
      const medio = (a.desde + a.hasta) / 2;
      const [rx, ry] = punto((ANILLO_INT[0] + ANILLO_INT[1]) / 2, medio).split(' ');
      const rotulo = a.hasta - a.desde >= MIN_ROTULO ? `<text x="${rx}" y="${ry}" class="tl-rot">${x.numero}</text>` : '';
      return `<g class="tl-grupo" data-g="${x.g.id}" style="--c:${x.color}"><title>${x.numero} · ${x.nombre}: ${x.peso} % del examen</title><path d="${sector(ANILLO_INT[0], ANILLO_INT[1], a.desde, a.hasta)}"/>${rotulo}</g>`;
    })
    .join('');

  const exterior = grupos
    .flatMap((x) =>
      x.secciones.map((s) => {
        const a = arco.get(s.id)!;
        const d = dominioSeccion(tema, progreso, s.id);
        const estado = d > 0 ? `dominio ${porcentaje(d)}` : 'sin estudiar';
        const lleno = d > 0 ? `<path class="tl-dom" d="${sector(ANILLO_EXT[0], ANILLO_EXT[0] + (ANILLO_EXT[1] - ANILLO_EXT[0]) * Math.min(1, d), a.desde, a.hasta)}"/>` : '';
        const etiqueta = `${s.id} ${s.titulo}: ${s.pesoExamen} % del examen, ${estado}${s.id === siguiente ? ', siguiente recomendación' : ''}`;
        return `<a class="tl-seg${s.id === siguiente ? ' siguiente' : ''}" href="${hrefSeccion(s.id)}" data-s="${s.id}" data-g="${x.g.id}" style="--c:${x.color}" aria-label="${etiqueta}"><title>${etiqueta}</title><path class="tl-base" d="${sector(ANILLO_EXT[0], ANILLO_EXT[1], a.desde, a.hasta)}"/>${lleno}</a>`;
      }),
    )
    .join('');

  const centro = `<text x="${C}" y="${C - 16}" class="tl-c1">Tu dominio</text><text x="${C}" y="${C + 14}" class="tl-c2">${porcentaje(dominioGlobal(tema, progreso))}</text><text x="${C}" y="${C + 34}" class="tl-c3">del tema</text>`;
  const grafico = `<svg class="tl-grafico" viewBox="0 0 320 320" role="group" aria-label="Reparto del examen: ${grupos.map((x) => `${x.numero} ${x.nombre} ${x.peso} %`).join(', ')}">${interior}${exterior}${centro}</svg>`;

  const leyenda = grupos
    .map((x) => {
      const paradas = x.secciones
        .map((s) => {
          const d = dominioSeccion(tema, progreso, s.id);
          const estado = d > 0 ? `dominio ${porcentaje(d)}` : 'sin estudiar';
          return `<li><a class="tl-parada${s.id === siguiente ? ' siguiente' : ''}" href="${hrefSeccion(s.id)}" data-s="${s.id}" data-g="${x.g.id}"><b>${s.id}</b><span class="tl-nombre">${s.titulo}</span><small>${s.pesoExamen} % · ${estado}</small></a></li>`;
        })
        .join('');
      return `<li class="tl-apartado" data-g="${x.g.id}" style="--c:${x.color}"><div class="tl-cab"><span class="tl-num">${x.numero}</span><span class="tl-tit">${x.nombre}</span><span class="tl-peso">${x.peso} % del examen</span></div><ol class="tl-paradas">${paradas}</ol></li>`;
    })
    .join('');

  return `<section class="tl rev" aria-labelledby="tl-t"><div class="tl-encabezado"><h2 class="h2" id="tl-t">El tema, de principio a fin</h2><p>Cómo se reparte el examen entre los ${grupos.length} apartados (anillo interior) y sus ${tema.secciones.length} subpuntos (anillo exterior). El tamaño de cada porción es lo que pesa en el examen y su relleno, tu dominio.</p></div><div class="tl-cuerpo"><div class="tl-figura">${grafico}</div><ol class="tl-leyenda">${leyenda}</ol></div></section>`;
}

/** Resalta a la vez la porción y la fila de la leyenda que se señalan (ratón o teclado). */
export function conectarLineaTemporal(seccion: HTMLElement | null): void {
  if (!seccion) return;
  const marcar = (e: Event) => {
    const objetivo = (e.target as Element).closest<HTMLElement>('[data-s], [data-g]');
    const s = objetivo?.dataset.s;
    const g = objetivo?.dataset.g;
    for (const el of seccion.querySelectorAll<HTMLElement | SVGElement>('.activo')) el.classList.remove('activo');
    seccion.classList.toggle('resaltando', Boolean(s || g));
    if (s) for (const el of seccion.querySelectorAll(`[data-s="${s}"]`)) el.classList.add('activo');
    // El apartado entero solo se resalta al señalar el apartado (no un subpunto suyo).
    if (g && !s) for (const el of seccion.querySelectorAll(`[data-g="${g}"]`)) el.classList.add('activo');
    if (g && s) for (const el of seccion.querySelectorAll(`.tl-grupo[data-g="${g}"], .tl-apartado[data-g="${g}"]`)) el.classList.add('activo');
  };
  const soltar = () => {
    seccion.classList.remove('resaltando');
    for (const el of seccion.querySelectorAll('.activo')) el.classList.remove('activo');
  };
  seccion.addEventListener('pointerover', marcar);
  seccion.addEventListener('focusin', marcar);
  seccion.addEventListener('pointerleave', soltar);
  seccion.addEventListener('focusout', soltar);
}
