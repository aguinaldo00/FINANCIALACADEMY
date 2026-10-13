import { hrefConcepto } from '../../app/router.ts';
import type { ContextoVista } from './context.ts';

const REFERENCIAS = [
  { titulo: 'Dinero electrónico', norma: 'Ley 21/2011, de 26 de julio, de dinero electrónico', detalle: 'Marco legal de la emisión de dinero electrónico.', conceptos: [{ id: 'ede', nombre: 'Entidades de dinero electrónico' }], url: 'https://www.boe.es/eli/es/l/2011/07/26/21/con' },
  { titulo: 'Servicios de pago', norma: 'Real Decreto-ley 19/2018, de 23 de noviembre, de servicios de pago y otras medidas urgentes en materia financiera', detalle: 'Marco legal de los servicios de pago y de sus entidades prestadoras.', conceptos: [{ id: 'estructura-b', nombre: 'Estructura del sistema' }], url: 'https://www.boe.es/eli/es/rdl/2018/11/23/19/con' },
  { titulo: 'Establecimientos financieros de crédito', norma: 'Ley 5/2015, de 27 de abril, de fomento de la financiación empresarial', detalle: 'Incluye el régimen de los establecimientos financieros de crédito.', conceptos: [{ id: 'efc', nombre: 'EFC' }], url: 'https://www.boe.es/eli/es/l/2015/04/27/5/con' },
  { titulo: 'Garantía de depósitos', norma: 'Real Decreto-ley 16/2011, de 14 de octubre, por el que se crea el Fondo de Garantía de Depósitos de Entidades de Crédito', detalle: 'Regula el Fondo de Garantía de Depósitos de Entidades de Crédito.', conceptos: [{ id: 'fgd', nombre: 'Fondo de Garantía de Depósitos' }], url: 'https://www.boe.es/eli/es/rdl/2011/10/14/16/con' },
  { titulo: 'Banco de España', norma: 'Ley 13/1994, de 1 de junio, de autonomía del Banco de España', detalle: 'Establece el marco de autonomía y funciones del Banco de España.', conceptos: [{ id: 'bde', nombre: 'Banco de España' }], url: 'https://www.boe.es/eli/es/l/1994/06/01/13/con' },
  { titulo: 'Sociedades de garantía recíproca', norma: 'Ley 1/1994, de 11 de marzo, sobre el régimen jurídico de las sociedades de garantía recíproca', detalle: 'Regula las sociedades que avalan a sus socios partícipes.', conceptos: [{ id: 'sgr', nombre: 'SGR' }], url: 'https://www.boe.es/eli/es/l/1994/03/11/1/con' },
] as const;

/** Consulta legal voluntaria, separada del material, las preguntas y los botones de estudio. */
export function pintarNormativa(ctx: ContextoVista): void {
  ctx.tituloMovil.textContent = 'Normativa';
  const tarjetas = REFERENCIAS.map((r) =>
    '<article class="nr-card">' +
      '<p class="nr-area">' + r.titulo + '</p>' +
      '<h2>' + r.norma + '</h2>' +
      '<p>' + r.detalle + '</p>' +
      '<div class="nr-links">' +
        '<a href="' + r.url + '" target="_blank" rel="noopener noreferrer">Consultar en el BOE <span aria-hidden="true">↗</span></a>' +
        r.conceptos.map((c) => '<a href="' + hrefConcepto(c.id) + '">Concepto relacionado: ' + c.nombre + ' <span aria-hidden="true">→</span></a>').join('') +
      '</div>' +
    '</article>'
  ).join('');
  ctx.pagina.innerHTML =
    '<div class="nr">' +
      '<header class="nr-hero">' +
        '<p class="nr-kicker">Información · consulta opcional</p>' +
        '<h1>Referencias normativas</h1>' +
        '<p>Reúno aquí las leyes relacionadas con algunos conceptos de la plataforma. Es material de consulta: no forma parte de las fichas ni de las preguntas de estudio.</p>' +
        '<p class="nr-nota">Los textos oficiales y sus versiones consolidadas están publicados en el BOE. Abre cada referencia si necesitas consultar el articulado.</p>' +
      '</header>' +
      '<div class="nr-grid">' + tarjetas + '</div>' +
      '<footer class="nr-footer">Financial Academy · Referencias para ampliar, fuera del recorrido de estudio.</footer>' +
    '</div>';
}
