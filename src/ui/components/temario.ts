import { hrefConcepto, hrefSeccion, hrefTema2 } from '../../app/router.ts';
import type { EstadoEstudio } from '../../app/store.ts';
import type { TemaCatalogo } from '../../content/temas/index.ts';
import { LECCIONES_TEMA2, PARTES_LECCION } from '../../content/temas/tema-02/index.ts';
import { dominioConcepto, dominioSeccion } from '../../domain/mastery.ts';
import { colorBloque } from '../blockColors.ts';
import { colorDominio, porcentaje } from '../format.ts';

/*
 * Temario estructurado de una asignatura: cada tema aporta su árbol a partir de SUS datos (el
 * Tema 1, de grupos, secciones y conceptos; el Tema 2, de su lección y sus partes). Es la otra
 * forma de llegar a cualquier contenido sin pasar por la exploración visual: mismos ids, mismas
 * rutas y el mismo dominio que la ciudad. Un tema nuevo solo tiene que registrar su árbol aquí.
 */

export interface NodoTemario {
  /** Identificador visible (numeración de DATA: "3.2B", "01"…). */
  id: string;
  titulo: string;
  href: string;
  /** Texto secundario (peso en el examen, subtítulo…). */
  detalle?: string;
  /** Dominio del alumno (0–1), si el tema lo registra. Nunca se confunde con el peso. */
  dominio?: number;
  /** Color de su grupo (identidad, como en el mapa). */
  color?: string;
  hijos?: NodoTemario[];
}

type ArbolTema = (estado: EstadoEstudio) => NodoTemario[];

/** Árbol de cada tema, por su número. */
const ARBOLES: Readonly<Record<number, ArbolTema>> = {
  1: ({ tema, progreso }) =>
    tema.grupos.map((g, gi) => {
      const secciones = tema.secciones.filter((s) => s.grupoId === g.id);
      const [numero, ...resto] = g.titulo.split(' · ');
      return {
        id: numero ?? g.id,
        titulo: resto.join(' · ') || g.titulo,
        href: secciones[0] ? hrefSeccion(secciones[0].id) : '#inicio',
        detalle: `${secciones.reduce((s, x) => s + x.pesoExamen, 0)} % del examen`,
        color: colorBloque(gi),
        hijos: secciones.map((s) => ({
          id: s.id,
          titulo: s.titulo,
          href: hrefSeccion(s.id),
          detalle: `${s.pesoExamen} % del examen`,
          dominio: dominioSeccion(tema, progreso, s.id),
          color: colorBloque(gi),
          hijos: tema.conceptos
            .filter((c) => c.seccionId === s.id)
            .map((c) => ({ id: '', titulo: c.nombre, href: hrefConcepto(c.id), dominio: dominioConcepto(progreso, c.id), color: colorBloque(gi) })),
        })),
      };
    }),
  2: () =>
    LECCIONES_TEMA2.map((l) => ({
      id: '',
      titulo: l.titulo,
      href: hrefTema2(l.id),
      detalle: l.subtitulo,
      hijos: PARTES_LECCION.map((p, i) => ({ id: String(i + 1).padStart(2, '0'), titulo: p.titulo, href: hrefTema2(l.id, p.id), detalle: p.subtitulo })),
    })),
};

export function arbolDelTema(numero: number, estado: EstadoEstudio): NodoTemario[] {
  return ARBOLES[numero]?.(estado) ?? [];
}

const barra = (d: number | undefined): string =>
  d === undefined ? '' : `<span class="tm-dom" title="Tu dominio: ${porcentaje(d)}" aria-label="Tu dominio: ${porcentaje(d)}"><i style="width:${Math.round(d * 100)}%;background:${colorDominio(d)}"></i></span>`;

function fila(n: NodoTemario, nivel: number): string {
  const texto = `${n.id ? `<b class="tm-id">${n.id}</b>` : ''}<span class="tm-tit">${n.titulo}</span>${n.detalle ? `<small class="tm-det">${n.detalle}</small>` : ''}${barra(n.dominio)}`;
  const enlace = `<a class="tm-fila tm-n${nivel}" href="${n.href}" data-buscar="${`${n.id} ${n.titulo}`.toLowerCase()}"${n.color ? ` style="--c:${n.color}"` : ''}>${texto}</a>`;
  if (!n.hijos?.length) return `<li>${enlace}</li>`;
  // Los conceptos (último nivel) quedan plegados: el temario se lee por apartados.
  const plegado = n.hijos.every((h) => !h.hijos?.length) && nivel >= 1;
  const hijos = `<ul class="tm-hijos">${n.hijos.map((h) => fila(h, nivel + 1)).join('')}</ul>`;
  return plegado
    ? `<li><details class="tm-plegable"><summary>${enlace}<span class="tm-mas" aria-hidden="true">${n.hijos.length} conceptos</span></summary>${hijos}</details></li>`
    : `<li>${enlace}${hijos}</li>`;
}

/** Temario de un tema del catálogo (bloque plegable con su árbol completo). */
export function temarioHtml(tema: TemaCatalogo, estado: EstadoEstudio): string {
  const nodos = arbolDelTema(tema.numero, estado);
  return `<details class="tm-tema" open><summary><span class="tm-num">Tema ${tema.numero}</span><span class="tm-nombre">${tema.titulo}</span></summary><ul class="tm-raiz">${nodos.map((n) => fila(n, 0)).join('')}</ul></details>`;
}

/** Buscador del temario: filtra por número o nombre y abre lo que coincide. */
export function conectarBuscadorTemario(raiz: HTMLElement): void {
  const campo = raiz.querySelector<HTMLInputElement>('[data-tm-buscar]');
  const aviso = raiz.querySelector<HTMLElement>('[data-tm-vacio]');
  if (!campo) return;
  const normalizar = (t: string) => t.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
  campo.addEventListener('input', () => {
    const q = normalizar(campo.value);
    let hay = 0;
    for (const li of raiz.querySelectorAll<HTMLLIElement>('.tm-raiz li')) {
      const propio = normalizar(li.querySelector<HTMLElement>(':scope > a, :scope > details > summary > a')?.dataset.buscar ?? '');
      const coincide = !q || propio.includes(q) || [...li.querySelectorAll<HTMLElement>('a[data-buscar]')].some((a) => normalizar(a.dataset.buscar ?? '').includes(q));
      li.hidden = !coincide;
      if (coincide && q) hay++;
      const det = li.querySelector<HTMLDetailsElement>(':scope > details');
      if (det) det.open = Boolean(q) && coincide;
    }
    for (const t of raiz.querySelectorAll<HTMLDetailsElement>('.tm-tema')) t.open = true;
    if (aviso) aviso.hidden = !q || hay > 0;
  });
}
