import { hrefConcepto, hrefSeccion } from '../../app/router.ts';
import type { ModoExplicacion } from '../../content/schema.ts';
import type { NivelDominio } from '../../domain/mastery.ts';
import type { Historia, PasoHistoria } from '../../experiences/schema.ts';
import type { EntradaAtlas, VistaAtlas } from '../../world/atlas.ts';
import type { FaseObra } from '../../world/cityModel.ts';
import { codificarFoco, type Foco } from '../../world/focus.ts';
import { colorDominio, porcentaje } from '../format.ts';

/* Marcado HTML del mundo: barra de navegación, Atlas accesible y ficha del edificio enfocado. */

export const TEXTO_NIVEL: Record<NivelDominio, string> = {
  dominado: 'Dominado',
  regular: 'Regular',
  flojo: 'Flojo',
  'sin-estudiar': 'Sin estudiar',
};

export const TEXTO_FASE: Record<FaseObra, string> = {
  completo: 'Construido · dominado',
  obra: 'En obra · a medias',
  solar: 'Solar · sin estudiar',
};

export interface Miga {
  foco: Foco;
  etiqueta: string;
}

export interface EstadoBarra {
  migas: Miga[];
  puedeSubir: boolean;
  modo3d: boolean;
  /** null mientras se comprueba o se carga. */
  disponible3d: boolean | null;
  vistaAtlas: boolean;
}

/** Contenedor estable del mundo; la barra y el Atlas se repintan dentro. */
export function esqueletoMundo(): string {
  return `<div class="mundo-barra" data-mundo-barra></div>
 <div class="mundo-vista" data-mundo-vista hidden><div class="mundo-etiquetas" data-mundo-etiquetas aria-hidden="true"></div><div class="mundo-sobre" data-mundo-sobre aria-hidden="true" hidden></div></div>
 <p class="mundo-aviso" data-mundo-aviso role="status"></p>
 <div class="atlas" data-atlas></div>
 <p class="mundo-leyenda"><b>Cómo leer la ciudad:</b> la superficie de cada zona es su peso en el examen · edificio <b>construido</b> = dominado · <b>en obra</b> = a medias · <b>solar</b> = sin estudiar · <span class="mundo-pin">📌</span> = Estudia ya · el anillo del suelo usa los colores de dominio. Al alejarte, las zonas se tiñen con tu dominio (Atlas).</p>`;
}

export function barraMundo(e: EstadoBarra): string {
  const migas = e.migas
    .map((m, i) => {
      const actual = i === e.migas.length - 1;
      return `<li><button type="button" data-foco="${codificarFoco(m.foco)}"${actual ? ' aria-current="location"' : ''}>${m.etiqueta}</button></li>`;
    })
    .join('');
  const acciones = [
    e.puedeSubir ? '<button type="button" class="mb-btn" data-mundo-subir>⬆ Subir de nivel</button>' : '',
    e.modo3d && e.disponible3d
      ? `<button type="button" class="mb-btn" data-mundo-atlas aria-pressed="${e.vistaAtlas}">${e.vistaAtlas ? '🏙️ Ver maqueta' : '🗺️ Ver Atlas'}</button>`
      : '',
    e.disponible3d !== false
      ? `<button type="button" class="mb-btn" data-mundo-modo>${e.modo3d ? 'Ver ciudad 2D' : 'Ver ciudad 3D'}</button>`
      : '',
  ].join('');
  return `<nav aria-label="Nivel del mapa"><ol class="migas">${migas}</ol></nav><div class="mundo-acciones">${acciones}</div>`;
}

function estado(nivel: NivelDominio, fase: FaseObra | null): string {
  const texto = fase ? TEXTO_FASE[fase] : TEXTO_NIVEL[nivel];
  return `<span class="atlas-estado" data-nivel="${nivel}"><i style="background:${colorDominio(nivelValor(nivel))}"></i>${texto}</span>`;
}

/** Valor representativo de cada nivel, solo para elegir el color. */
const nivelValor = (n: NivelDominio) => ({ dominado: 1, regular: 0.5, flojo: 0.2, 'sin-estudiar': 0 })[n];

function cifras(e: { pesoExamen: number | null; dominio: number; total: number; estudiados: number }): string {
  const partes = [];
  if (e.pesoExamen !== null) partes.push(`${e.pesoExamen} % del examen`);
  partes.push(`dominio ${porcentaje(e.dominio)}`);
  if (e.total > 1) partes.push(`${e.estudiados}/${e.total} estudiados`);
  return partes.join(' · ');
}

function entrada(e: EntradaAtlas, pesoMaximo: number): string {
  const barra = e.pesoExamen !== null && pesoMaximo > 0
    ? `<span class="atlas-peso" aria-hidden="true"><i style="width:${((e.pesoExamen / pesoMaximo) * 100).toFixed(1)}%"></i></span>`
    : '';
  const prioridad = e.prioridad ? `<span class="atlas-prio">📌 Estudia ya ${e.prioridad}</span>` : '';
  const clave = e.clave ? `<span class="atlas-clave">${e.clave}</span>` : '';
  return `<li><button type="button" class="atlas-item" data-foco="${codificarFoco(e.foco)}" style="--c:${e.dominio > 0 ? colorDominio(e.dominio) : '#3a3a3a'}">
 <span class="atlas-nombre">${clave}${e.etiqueta}</span>${barra}
 <span class="atlas-cifras">${cifras(e)}</span>${estado(e.nivel, e.fase)}${prioridad}</button></li>`;
}

export function atlasHtml(v: VistaAtlas, historia: string): string {
  const pendientes = v.total - v.dominados;
  const resumen = [
    v.pesoExamen !== null ? `Peso en examen: <b>${v.pesoExamen} %</b>` : '',
    `Dominio: <b>${porcentaje(v.dominio)}</b>`,
    v.total > 1 ? `<b>${v.estudiados}</b> de ${v.total} conceptos estudiados · <b>${pendientes}</b> por dominar` : '',
  ].filter(Boolean).join(' · ');
  const ir = v.estudiarAhora ? `<a class="atlas-ir" href="${v.estudiarAhora.href}">${v.estudiarAhora.texto} →</a>` : '';
  const seccion = v.foco.nivel === 'edificio' && v.clave
    ? `<a class="atlas-ir sec" href="${hrefSeccion(v.clave)}">Ver la sección ${v.clave}</a>`
    : '';
  const lista = v.entradas.length
    ? `<ul class="atlas-lista">${v.entradas.map((e) => entrada(e, v.pesoMaximo)).join('')}</ul>`
    : '';
  return `<header class="atlas-cab"><div class="atlas-tit">${v.clave ? `<span class="pill k">${v.clave}</span>` : ''}<h3>${v.titulo}</h3>${estado(v.nivel, v.fase)}</div>
 <p class="atlas-datos">${resumen}</p><div class="atlas-ires">${ir}${seccion}</div></header>${lista}${historia}`;
}

/* ------------------------------------------------------------ microexperiencia */

function textoPaso(h: Historia, paso: PasoHistoria): string {
  const nombre = (id: string) => h.entidades.find((e) => e.id === id)?.etiqueta ?? '';
  switch (paso.tipo) {
    case 'presentacion':
      return 'Los elementos del esquema.';
    case 'flujo': {
      const f = h.flujos[paso.indice];
      if (!f) return '';
      if (f.tipo === 'contiene') return `${nombre(f.desde)} engloba a ${nombre(f.hacia)}.`;
      const simbolo = f.tipo === 'intercambio' ? '⇄' : '→';
      return `${nombre(f.desde)} ${simbolo} ${nombre(f.hacia)}${f.etiqueta ? ` (${f.etiqueta})` : ''}`;
    }
    case 'pregunta':
      return 'Ahora compruébalo con la pregunta del concepto.';
  }
}

/** Reproductor HTML de una historia: misma estructura que usará la escena 3D. */
export function historiaHtml(h: Historia, modos: ModoExplicacion[], indicePaso: number): string {
  const paso = h.pasos[indicePaso] ?? h.pasos[0]!;
  const activo = paso.tipo === 'flujo' ? h.flujos[paso.indice] : undefined;
  const resaltadas = new Set(activo ? [activo.desde, activo.hacia] : paso.tipo === 'presentacion' ? h.entidades.map((e) => e.id) : []);

  const cadena = h.entidades
    .map((e, i) => {
      const nodo = `<li class="h-ent${resaltadas.has(e.id) ? ' on' : ''}">${e.etiqueta}</li>`;
      const f = h.flujos[i];
      if (!f) return nodo;
      const simbolo = f.tipo === 'contiene' ? (f.desde === e.id ? '⊃' : '⊂') : f.tipo === 'intercambio' ? '⇄' : f.desde === e.id ? '→' : '←';
      const on = activo === f ? ' on' : '';
      return `${nodo}<li class="h-flu${on}" aria-hidden="true">${f.etiqueta ? `<small>${f.etiqueta}</small>` : ''}${simbolo}</li>`;
    })
    .join('');

  const final = paso.tipo === 'pregunta'
    ? ` <a href="${hrefConcepto(h.conceptoId)}">Ir a «Compruébalo» →</a>`
    : '';
  return `<section class="historia" aria-label="Historia visual">
 <h4>${modos[h.fuente.indice]?.etiqueta ?? 'Esquema'} · historia</h4>
 <ol class="h-cadena">${cadena}</ol>
 <p class="h-paso" aria-live="polite">Paso ${indicePaso + 1} de ${h.pasos.length}: ${textoPaso(h, paso)}${final}</p>
 <div class="h-ctrl"><button type="button" class="mb-btn" data-historia="-1"${indicePaso === 0 ? ' disabled' : ''}>← Anterior</button><button type="button" class="mb-btn" data-historia="1"${indicePaso >= h.pasos.length - 1 ? ' disabled' : ''}>Siguiente →</button></div>
</section>`;
}
