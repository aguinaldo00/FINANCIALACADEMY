// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { formulaTexto, simbolosDe } from '../../src/ui/matematica/formula.ts';
import { UNIDADES } from '../../src/domain/tema2/periodos.ts';
import { escenaConversion } from '../../src/ui/escenas/conversionPeriodos.ts';
import { escenaConversionTipo } from '../../src/ui/escenas/conversionTipos.ts';
import { LISTA_ESCENAS } from '../../src/ui/escenas/index.ts';
import { Lienzo } from '../../src/ui/motion/lienzo.ts';
import { avanzar, type Escena, finCapitulo, PAUSA_LECTURA, textoConFormulas } from '../../src/ui/motion/reproductor.ts';

/*
 * Con movimiento reducido (y al saltar de capítulo) el reproductor enseña el instante de lectura de
 * cada capítulo, y al reproducir se detiene ahí a leer. Ese fotograma tiene que ser el capítulo
 * terminado y quieto (auditoría del Tema 2, §3.1, regla transversal 1).
 */

/**
 * Lo que el alumno lee en el fotograma: cada elemento con su texto, opacidad, posición y escala, con
 * la tolerancia de lo que mide (3 u en posiciones, 0,02 en escalas, 8° en giros —el balanceo de las hojas—, 0,06 en
 * opacidades). Se ignora el ambiente vivo a propósito (la luz que deriva, el «hervor» de los trazos
 * dibujados a mano, los bucles marcados con data-vivo y los identificadores internos), que se
 * mueve siempre sin cambiar el contenido.
 */
interface Pieza { firma: string; nums: [number, number][]; visible: boolean }
const POSICION = ['x', 'y', 'cx', 'cy', 'r', 'width', 'height', 'stroke-dashoffset', 'font-size'];
const OPACIDAD = ['opacity', 'fill-opacity', 'stroke-opacity'];
const numeros = (texto: string) => (texto.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
/** Si el elemento se ve: ni él ni sus antecesores están ocultos, transparentes o aplastados a cero. */
function seVe(el: Element): boolean {
  if (!['text', 'path', 'rect', 'circle', 'line', 'ellipse', 'polygon', 'polyline'].includes(el.tagName.toLowerCase())) return false;
  let opacidad = 1;
  for (let n: Element | null = el; n && n.tagName.toLowerCase() !== 'svg'; n = n.parentElement) {
    if (n.getAttribute('visibility') === 'hidden') return false;
    const o = n.getAttribute('opacity');
    if (o) opacidad *= Number.parseFloat(o);
    const escala = /scale\(([-\d.]+)/.exec(n.getAttribute('transform') ?? '');
    if (escala && Math.abs(Number(escala[1])) < 0.05) return false;
  }
  return opacidad > 0.3;
}

function foto(contenedor: HTMLElement): Pieza[] {
  const piezas: Pieza[] = [];
  for (const el of contenedor.querySelectorAll('svg *')) {
    if (el.closest('defs, clipPath, [data-vivo]') || /url\(#[^)]*luz\)/.test(el.getAttribute('fill') ?? '')) continue;
    const nums: [number, number][] = [];
    for (const a of POSICION) { const v = el.getAttribute(a); if (v) nums.push([Number.parseFloat(v), 3]); }
    for (const a of OPACIDAD) { const v = el.getAttribute(a); if (v) nums.push([Number.parseFloat(v), 0.06]); }
    for (const [, fn, args] of (el.getAttribute('transform') ?? '').matchAll(/(\w+)\(([^)]*)\)/g)) {
      for (const v of numeros(args!)) nums.push([v, fn === 'scale' ? 0.02 : fn === 'rotate' ? 8 : 3]);
    }
    const estilo = el.getAttribute('style') ?? '';
    for (const v of numeros(estilo)) nums.push([v, 0.06]);
    const texto = el.children.length ? '' : (el.textContent ?? '').trim();
    piezas.push({ firma: `${el.tagName}.${el.getAttribute('class') ?? ''}|${texto}|${estilo.replace(/-?\d+(?:\.\d+)?/g, '#')}`, nums, visible: seVe(el) });
  }
  return piezas;
}
/** Lo que se ve en la foto `despues` y no en `antes` (lo que aparece). */
function aparecen(antes: Pieza[], despues: Pieza[]): string[] {
  if (antes.length !== despues.length) return [`${antes.length} piezas frente a ${despues.length}`];
  return despues.flatMap((p, i) => (p.visible && !antes[i]!.visible ? [p.firma.slice(0, 50)] : []));
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

/** Monta la escena una vez y devuelve una cámara de fotos: lo que se lee en el instante t. */
function camaraDe(escena: Escena): (t: number) => Pieza[] {
  const contenedor = document.createElement('div');
  const lienzo = new Lienzo(escena.titulo, escena.ambiente);
  contenedor.append(lienzo.svg);
  const pintar = escena.montar(lienzo);
  return (t) => {
    lienzo.instante = t;
    pintar(t);
    return foto(contenedor);
  };
}

/** Problemas del instante de lectura de un capítulo (vacío si está bien). */
function problemasDeLectura(escena: Escena, fotoEn: (t: number) => Pieza[], k: number, lectura = finCapitulo(escena, k)): string[] {
  const c = escena.capitulos[k]!;
  const corte = escena.capitulos[k + 1]?.t ?? escena.duracion;
  if (lectura < c.t || lectura > corte) return [`lectura ${lectura} fuera del capítulo`];
  const enLectura = fotoEn(lectura);
  const problemas = diferencias(fotoEn(lectura - 0.1), enLectura).map((d) => `se mueve: ${d}`);
  // Lo que el capítulo enseña después de la lectura se perdería con movimiento reducido. Se admite
  // lo que nace en los últimos 0,15 s: es el adelanto del capítulo siguiente.
  const limite = corte - 0.15;
  if (limite > lectura) problemas.push(...aparecen(enLectura, fotoEn(limite)).map((d) => `aparece después: ${d}`));
  return problemas;
}

describe('cada capítulo tiene un instante de lectura completo y quieto', () => {
  for (const escena of LISTA_ESCENAS) {
    it(escena.id, () => {
      const fotoEn = camaraDe(escena);
      const malos = escena.capitulos.flatMap((c, k) => {
        const p = problemasDeLectura(escena, fotoEn, k);
        return p.length ? [`cap. ${k + 1} (${c.t} s, lectura ${finCapitulo(escena, k)} s): ${p.slice(0, 2).join(' · ')}`] : [];
      });
      expect(malos).toEqual([]);
    });
  }
});

describe('el calendario de equivalencias: cualquier unidad a cualquier otra, con capítulos completos y quietos', () => {
  // Todas las parejas de unidades (con días, los dos convenios) y cantidades enteras y con decimales.
  const parejas = UNIDADES.flatMap((de) => UNIDADES.filter((a) => a.id !== de.id).flatMap((a) => {
    const conDias = de.id === 'dia' || a.id === 'dia';
    const cantidad = de.id === 'dia' ? 195 : de.id === 'mes' ? 9 : de.id === 'año' ? 2.5 : 1;
    return (conDias ? [360, 365] as const : [360] as const).map((convenio) => ({ cantidad, de: de.id, a: a.id, convenio }));
  }));
  it(`son ${parejas.length} parejas`, () => expect(parejas.length).toBe(40));
  for (const p of parejas) {
    it(`${p.cantidad} ${p.de} → ${p.a} (${p.convenio})`, () => {
      const escena = escenaConversion(p);
      const fotoEn = camaraDe(escena);
      const malos = escena.capitulos.flatMap((_, k) => {
        const problemas = problemasDeLectura(escena, fotoEn, k);
        return problemas.length ? [`cap. ${k + 1}: ${problemas.slice(0, 2).join(' · ')}`] : [];
      });
      expect(malos).toEqual([]);
    });
  }
});

describe('tipos de interés de cualquier unidad a cualquier otra, en simple y en compuesta: capítulos completos y quietos', () => {
  const casos = (['simple', 'compuesta'] as const).flatMap((regimen) => UNIDADES.flatMap((de) => UNIDADES.filter((a) => a.id !== de.id).flatMap((a) => {
    const conDias = de.id === 'dia' || a.id === 'dia';
    // Un tipo razonable para cada unidad (un 5 % diario compuesto no se puede dibujar ni existe en el tema).
    const tipo = de.id === 'dia' ? 0.0001 : de.id === 'mes' ? 0.01 : 0.04;
    return (conDias ? [360, 365] as const : [360] as const).map((convenio) => ({ tipo, de: de.id, a: a.id, regimen, convenio }));
  })));
  it(`son ${casos.length} casos`, () => expect(casos.length).toBe(80));
  for (const p of casos) {
    it(`${p.regimen}: ${p.de} → ${p.a} (${p.convenio})`, () => {
      const escena = escenaConversionTipo(p);
      const fotoEn = camaraDe(escena);
      const malos = escena.capitulos.flatMap((_, k) => {
        const problemas = problemasDeLectura(escena, fotoEn, k);
        return problemas.length ? [`cap. ${k + 1}: ${problemas.slice(0, 2).join(' · ')}`] : [];
      });
      expect(malos).toEqual([]);
    });
  }
});

describe('el reproductor se detiene a leer', () => {
  const escena = LISTA_ESCENAS[0]!;
  it(`se para ${PAUSA_LECTURA} s en el instante de lectura y luego sigue`, () => {
    const lectura = finCapitulo(escena, 0);
    let estado = avanzar(escena, lectura - 0.05, 0, 0.1);
    expect(estado).toEqual({ t: lectura, espera: PAUSA_LECTURA });
    for (let i = 0; i < 5; i++) estado = avanzar(escena, estado.t, estado.espera, 0.1);
    expect(estado.t).toBe(lectura);
    estado = avanzar(escena, estado.t, estado.espera, 0.1);
    estado = avanzar(escena, estado.t, estado.espera, 0.1);
    expect(estado.t).toBeGreaterThan(lectura);
  });
});
