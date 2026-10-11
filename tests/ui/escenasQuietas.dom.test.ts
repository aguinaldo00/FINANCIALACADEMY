// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { formulaTexto, simbolosDe } from '../../src/ui/matematica/formula.ts';
import { LISTA_ESCENAS } from '../../src/ui/escenas/index.ts';
import { finCapitulo, pintarFotograma, textoConFormulas } from '../../src/ui/motion/reproductor.ts';

/*
 * Con movimiento reducido (y al saltar de capítulo) el reproductor enseña el último instante de cada
 * capítulo. Ese fotograma tiene que ser el capítulo terminado: lo que se ve medio segundo antes del
 * final y al final tiene que ser lo mismo (auditoría del Tema 2, §3.1, regla transversal 1).
 */

/**
 * Lo que el alumno lee en el fotograma: cada elemento con su texto, opacidad, posición y escala, con
 * la tolerancia de lo que mide (3 u en posiciones, 0,02 en escalas, 0,06 en opacidades). Se ignora el
 * ambiente vivo a propósito (la luz que deriva, el «hervor» de los trazos dibujados a mano y los
 * identificadores internos), que se mueve siempre sin cambiar el contenido.
 */
interface Pieza { firma: string; nums: [number, number][] }
const POSICION = ['x', 'y', 'cx', 'cy', 'r', 'width', 'height', 'stroke-dashoffset', 'font-size'];
const OPACIDAD = ['opacity', 'fill-opacity', 'stroke-opacity'];
const numeros = (texto: string) => (texto.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
function foto(contenedor: HTMLElement): Pieza[] {
  const piezas: Pieza[] = [];
  for (const el of contenedor.querySelectorAll('svg *')) {
    if (el.closest('defs, clipPath') || /url\(#[^)]*luz\)/.test(el.getAttribute('fill') ?? '')) continue;
    const nums: [number, number][] = [];
    for (const a of POSICION) { const v = el.getAttribute(a); if (v) nums.push([Number.parseFloat(v), 3]); }
    for (const a of OPACIDAD) { const v = el.getAttribute(a); if (v) nums.push([Number.parseFloat(v), 0.06]); }
    for (const [, fn, args] of (el.getAttribute('transform') ?? '').matchAll(/(\w+)\(([^)]*)\)/g)) {
      for (const v of numeros(args!)) nums.push([v, fn === 'scale' ? 0.02 : 3]);
    }
    const estilo = el.getAttribute('style') ?? '';
    for (const v of numeros(estilo)) nums.push([v, 0.06]);
    const texto = el.children.length ? '' : (el.textContent ?? '').trim();
    piezas.push({ firma: `${el.tagName}.${el.getAttribute('class') ?? ''}|${texto}|${estilo.replace(/-?\d+(?:\.\d+)?/g, '#')}`, nums });
  }
  return piezas;
}
/** Diferencias visibles entre dos fotos. */
function diferencias(a: Pieza[], b: Pieza[]): string[] {
  if (a.length !== b.length) return [`${a.length} piezas frente a ${b.length}`];
  const fuera: string[] = [];
  a.forEach((p, i) => {
    const q = b[i]!;
    const distinta = p.firma !== q.firma || p.nums.length !== q.nums.length || p.nums.some(([v, tol], j) => Math.abs(v - q.nums[j]![0]) > tol);
    if (distinta) fuera.push(p.firma === q.firma ? p.firma.slice(0, 50) : `${p.firma.slice(0, 40)} → ${q.firma.slice(0, 40)}`);
  });
  return fuera;
}

describe('fórmulas con subíndice numérico', () => {
  it('i_{12} se pinta como i con subíndice 12 y color de tipo', () => {
    expect(formulaTexto('i_{12} = 0,07 / 12')).toBe('i₁₂ = 0,07 / 12');
    expect(simbolosDe('i_{365}')).toEqual(['i_m']);
    // El subtítulo de simple-fraccionado (capítulo 3) antes dejaba «i_{12}» como texto invisible.
    const html = textoConFormulas('para meses $i_{12}$ = 0,07 / 12');
    expect(html).toContain('<sub>12</sub>');
    expect(html).not.toContain('fx-txt');
  });
});

/** Lo que se exige: los últimos 0,5 s de cada capítulo, quietos. */
const VENTANA = 0.5;

/** Capítulos que se mueven al final, en una escena. */
function capitulosQueSeMueven(escena: (typeof LISTA_ESCENAS)[number]): number[] {
  const malos: number[] = [];
  escena.capitulos.forEach((c, k) => {
    const fin = finCapitulo(escena, k);
    if (fin - c.t < 1) return;
    const a = document.createElement('div');
    const b = document.createElement('div');
    pintarFotograma(a, escena, fin - VENTANA);
    pintarFotograma(b, escena, fin);
    if (diferencias(foto(a), foto(b)).length) malos.push(k + 1);
  });
  return malos;
}

/*
 * Trinquete: estos capítulos todavía se mueven al final (medido el 12/10, incremento 2a). El
 * incremento 2b los corrige y los quita de aquí. La prueba falla si aparece uno nuevo y también si
 * uno ya está quieto y sigue en la lista, para que la lista solo pueda encoger.
 */
const PENDIENTES_2B: Record<string, number[]> = {
  'simple-intereses': [1, 2, 4],
  'simple-montante': [2, 3, 4],
  'simple-capital-inicial': [1, 2, 3, 4, 5],
  'simple-tipo': [1, 3, 4],
  'simple-tiempo': [2, 3, 4, 5, 6],
  'simple-fraccionado': [3, 4, 5],
  'compuesta-montante': [2, 3, 4, 5],
  'compuesta-intereses': [1, 2, 4, 5],
  'compuesta-capital-inicial': [2, 3, 4],
  'compuesta-tiempo': [3, 4],
  'compuesta-tipo': [3],
  'compuesta-equivalentes': [2, 3, 4],
  'compuesta-comparacion': [2, 3],
  'compuesta-tae': [2, 3, 4],
  'descuento-comercial': [3],
  'descuento-racional': [3],
  'descuento-remesa': [1, 2, 3, 4],
  'descuento-compuesto-racional': [3],
  'descuento-compuesto-comercial': [1, 2],
};

describe('cada capítulo termina quieto', () => {
  for (const escena of LISTA_ESCENAS) {
    it(escena.id, () => {
      expect(capitulosQueSeMueven(escena)).toEqual(PENDIENTES_2B[escena.id] ?? []);
    });
  }
});
