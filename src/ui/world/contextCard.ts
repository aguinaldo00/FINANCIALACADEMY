import { hrefConcepto, hrefSeccion } from '../../app/router.ts';
import type { ModeloCiudad } from '../../world/cityModel.ts';
import { buscarBarrio, buscarEdificio, buscarZona, type Foco } from '../../world/focus.ts';
import { colorDominio } from '../format.ts';
import { separarTitulo, TEXTO_FASE } from './worldPanel.ts';



/*
 * Ficha contextual: la información aparece porque el usuario la pide (pasa por encima o
 * selecciona). Vive fuera del mundo, en una esquina del visor; la ciudad queda limpia.
 * Orden de lectura: qué es → cuánto pesa → qué sé → dónde entrar.
 */

export type ModoFicha = 'vistazo' | 'seleccion';

function cifra(valor: string, unidad: string): string {
  return `<div class="ficha-cifra"><b>${valor}</b><span>${unidad}</span></div>`;
}

function dominio(valor: number, texto: string): string {
  return `<div class="ficha-cifra"><b>${Math.round(valor * 100)}<small>%</small></b><span><i class="ficha-muestra" style="background:${valor > 0 ? colorDominio(valor) : 'transparent'}"></i>${texto}</span></div>`;
}

export function fichaContextual(m: ModeloCiudad, foco: Foco, modo: ModoFicha): string {
  const pista = '<p class="ficha-pista">Pulsa para acercarte</p>';
  switch (foco.nivel) {
    case 'barrio': {
      const b = buscarBarrio(m, foco.grupoId);
      if (!b) return '';
      const [numero, nombre] = separarTitulo(b.titulo);
      const zonas = m.zonas.filter((z) => z.grupoId === b.grupoId);
      const total = zonas.reduce((s, z) => s + z.conceptoIds.length, 0);
      return `<p class="ficha-antetitulo">Barrio ${numero}</p><h3 class="ficha-titulo">${nombre}</h3>
 <div class="ficha-datos">${cifra(String(b.pesoExamen), '% del examen')}${cifra(String(total), 'conceptos')}${dominio(b.dominio, 'dominio')}</div>${modo === 'vistazo' ? pista : ''}`;
    }
    case 'zona': {
      const z = buscarZona(m, foco.seccionId);
      if (!z) return '';
      const antetitulo = z.prioridad === 1
        ? 'Siguiente recomendación de estudio'
        : z.prioridad
          ? `Recomendación de estudio · ${z.prioridad}`
          : `Zona ${z.seccionId}`;
      const accion = modo === 'seleccion'
        ? `<a class="ficha-accion" href="${hrefSeccion(z.seccionId)}">Estudiar la sección ${z.seccionId}</a>`
        : pista;
      return `<p class="ficha-antetitulo${z.prioridad ? ' llamada' : ''}">${antetitulo}</p><h3 class="ficha-titulo">${z.titulo}</h3>
 <div class="ficha-datos">${cifra(String(z.pesoExamen), '% del examen')}${cifra(String(z.conceptoIds.length), z.conceptoIds.length === 1 ? 'concepto' : 'conceptos')}${dominio(z.dominio, `dominio · ${z.estudiados} estudiados`)}</div>${accion}`;
    }
    case 'edificio': {
      const e = buscarEdificio(m, foco.conceptoId);
      if (!e) return '';
      const z = buscarZona(m, e.seccionId);
      const accion = modo === 'seleccion'
        ? `<a class="ficha-accion" href="${hrefConcepto(e.conceptoId)}">Estudiar el concepto</a>`
        : pista;
      return `<p class="ficha-antetitulo">Zona ${e.seccionId}${z ? ` · ${z.titulo}` : ''}</p><h3 class="ficha-titulo grande">${e.nombre}</h3>
 <div class="ficha-datos">${dominio(e.dominio, TEXTO_FASE[e.fase])}</div>${accion}`;
    }
    case 'ciudad':
      return '';
  }
}

