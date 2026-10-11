/*
 * Fórmula 1 · Capitalización simple, I = C₀ · n · i (animación de referencia de la identidad editorial)
 *
 * Guion (27 s, seis capítulos):
 *  1. El capital inicial cae sobre el papel y brota: C₀ = 10.000 €.
 *  2. El tipo: la parte del bloque que se cosecha cada año (0,07 de su altura, a escala real).
 *  3. Año 1: una flecha sale del bloque y da una cosecha de 700 €.
 *  4. Años 2 y 3: las flechas vuelven a salir del MISMO bloque; las tres cosechas son iguales.
 *  5. Las tres etiquetas se juntan: I = 3 · 700 = 2.100 €, con n = 3 marcado bajo los años.
 *  6. La fórmula se arma con piezas de la escena y cada símbolo baja a su significado.
 *
 * Rigor: la tajada rosa mide el 7 % del bloque; los tres árboles y las tres etiquetas son idénticos
 * porque en simple cada cosecha se calcula sobre C₀. Las cifras salen del cálculo (10.000 · 0,07).
 */
import type { Escena } from '../motion/reproductor.ts';
import { fijar, situar } from '../motion/lienzo.ts';
import { Llave, Rotulo, suelo } from '../motion/motivos.ts';
import { claves, curvas, mezclar, tramo, ventana } from '../motion/tiempo.ts';
import { Arbol, Bloque, cinta, Etiqueta, Flecha, Nota, Planta } from '../motion/piezas.ts';

const C0 = 10_000;
const TIPO = 0.07;
const COSECHA = C0 * TIPO;
const SUELO = 430;
const BX = 58;
const BY = 312;
const BW = 118;
const BH = 118;
const LIMITES = [220, 360, 500, 640];
const centro = (k: number) => (LIMITES[k]! + LIMITES[k + 1]!) / 2;
const eur = (v: number) => new Intl.NumberFormat('de-DE').format(v);

export const escenaInteresesSimple: Escena = {
  id: 'simple-intereses',
  titulo: 'Intereses totales en capitalización simple',
  duracion: 27,
  descripcion: 'Un capital de 10.000 € al 7 % anual da cada año una cosecha de 700 €, siempre calculada sobre el mismo capital. En 3 años, 2.100 € de intereses: I = C₀ · n · i.',
  capitulos: [
    { t: 0, texto: 'Esto es el capital inicial, $C_0$: 10.000 € que se invierten hoy.' },
    { t: 3.2, lectura: 5.95, texto: 'El tipo, $i$ = 7 % anual, dice qué parte del capital se cosecha cada año: 0,07 de $C_0$.' },
    { t: 6.6, texto: 'Año 1: la cosecha es $C_0 · i$ = 10.000 · 0,07 = 700 €.' },
    { t: 10.6, texto: 'Años 2 y 3: cada cosecha se calcula otra vez sobre el mismo $C_0$. Por eso todas valen 700 €.' },
    { t: 15.2, texto: 'En $n$ = 3 años se juntan tres cosechas iguales: 3 · 700 = 2.100 € de intereses.' },
    { t: 19.2, texto: 'Intereses totales en capitalización simple: $I = C_0 · n · i$.' },
  ],
  montar(l) {
    suelo(l, SUELO);
    // Raíces del capital (bajo tierra): se dibujan al brotar.
    const raices = [
      `M${BX + 40} ${BY + BH + 4} C ${BX + 30} ${BY + BH + 40}, ${BX + 10} ${BY + BH + 60}, ${BX - 10} ${BY + BH + 90}`,
      `M${BX + 60} ${BY + BH + 4} C ${BX + 64} ${BY + BH + 50}, ${BX + 52} ${BY + BH + 80}, ${BX + 70} ${BY + BH + 120}`,
      `M${BX + 82} ${BY + BH + 4} C ${BX + 100} ${BY + BH + 36}, ${BX + 120} ${BY + BH + 52}, ${BX + 150} ${BY + BH + 70}`,
    ].map((d) => l.el('path', { d, class: 'ref-raiz', fill: 'none' }));

    const eje = l.el('path', { class: 'ref-eje', fill: 'none' });
    const marcas = LIMITES.map((x) => l.el('line', { x1: x, x2: x, y1: SUELO - 7, y2: SUELO + 7, class: 'ref-marca' }));
    const anos = [0, 1, 2].map((k) => new Rotulo(l, `AÑO ${k + 1}`, 'ref-ano'));
    const arboles = [0, 1, 2].map((k) => new Arbol(l, centro(k), SUELO));
    const bloque = new Bloque(l, BX, BY, BW, BH, 's-c0');
    const planta = new Planta(l, BX + BW / 2 + 9, BY - 8, 112);
    l.formula('C_0', { x: BX + BW / 2, y: BY + 58, tam: 46, padre: bloque.g, tarjeta: false });
    l.texto('10.000 €', { x: BX + BW / 2, y: BY + 92, class: 'ref-bloque-cifra', 'text-anchor': 'middle' }, bloque.g);

    // El tipo: etiqueta rosa pegada en la esquina del bloque.
    const etTipo = new Etiqueta(l, '', 118, 42, 's-i');
    l.formula('i = "7 % anual"', { x: 0, y: 8, tam: 20, padre: etTipo.g, tarjeta: false });
    cinta(l, etTipo.g, 44, -18, 30, 18);
    const notaTipo = new Nota(l, ['← 0,07 de C₀,', 'lo que se cosecha'], BX + BW + 30, BY + 12, 150, 'ref-nota ref-nota-peq', 19);

    const flechas = [0, 1, 2].map(() => new Flecha(l));
    const pulsos = [0, 1, 2].map(() => l.el('circle', { r: 5, class: 'ref-pulso s-i' }));
    const cosechas = [0, 1, 2].map(() => {
      const e = new Etiqueta(l, `+${eur(COSECHA)} €`, 82, 30, 's-I');
      return e;
    });
    const cuenta = new Nota(l, ['10.000 · 0,07 = 700 €'], 238, 262, 176, 'ref-nota ref-nota-cuenta');
    const notaMismo = new Nota(l, ['Cada año se calcula el 7 %', 'sobre el mismo capital inicial.'], 430, 104, 240, 'ref-nota');
    const flechaNota = new Flecha(l, 'ref-flecha ref-flecha-nota');

    const llaveN = new Llave(l, 's-n');
    const etN = l.grupo({ class: 'ref-n' });
    l.formula('n = 3', { x: 0, y: 0, tam: 24, padre: etN, tarjeta: false });
    const etN2 = new Rotulo(l, 'periodos (años)', 'ref-sub', 'middle');

    const total = new Etiqueta(l, '', 210, 64, 's-I ref-total');
    l.formula('I = "2.100 €"', { x: 0, y: 12, tam: 34, padre: total.g, tarjeta: false });
    const notaTotal = new Nota(l, ['3 · 700 €'], 604, 496, 90, 'ref-nota ref-nota-peq');

    // La fórmula final, con cada símbolo unido a su significado.
    const formula = l.formula('I = C_0 · n · i', { x: 360, y: 82, tam: 70 });
    const significados = ['Intereses|totales', 'Capital|inicial', 'Periodos|(años)', 'Tipo por|periodo'];
    const guias = significados.map(() => l.el('line', { class: 'ref-guia-fx' }, l.frente));
    const textos = significados.map((s) => {
      const g = l.grupo({ class: 'ref-significado' }, l.frente);
      s.split('|').forEach((linea, k) => l.texto(linea, { y: k * 15, 'text-anchor': 'middle' }, g));
      return g;
    });
    const sustitucion = new Etiqueta(l, '', 300, 44, 'ref-papel-blanco', 'ref-etiqueta-texto', l.frente);
    l.formula('I = 10.000 · 3 · 0,07 = "2.100 €"', { x: 0, y: 8, tam: 22, padre: sustitucion.g, tarjeta: false });

    return (t) => {
      // Cámara: del bloque de cerca al campo entero; al final, plano general para la fórmula. La
      // etiqueta del tipo (x ≈ 10–130) queda siempre dentro del encuadre desde que aparece.
      const cx = claves(t, [[0, 118], [3.2, 120], [4.4, 150], [5.8, 160], [7.0, 262], [10.4, 262], [11.6, 330], [15.0, 330], [16.2, 352]]);
      const cy = claves(t, [[0, 352], [3.2, 345], [4.4, 318], [5.8, 318], [7.0, 345], [10.4, 345], [11.6, 330], [15.0, 330], [16.2, 330], [19.2, 330], [20.4, 318]]);
      const z = claves(t, [[0, 2.0], [3.2, 2.0], [4.4, 1.8], [5.8, 1.8], [7.0, 1.35], [10.4, 1.35], [11.6, 1.06], [15.0, 1.06], [16.2, 1.0]]);
      l.camara(cx, cy, z);
      l.foco(claves(t, [[0, 360], [7, 330], [16, 360]]), claves(t, [[0, 330], [19, 300]]), claves(t, [[0, 260], [16, 360]]));

      // 1 · el capital cae y brota.
      const resalte = Math.max(...[7.2, 10.9, 12.7].map((t0) => ventana(t, t0, t0 + 0.6, 0.2)));
      bloque.pintar(t, 0.25, tramo(t, 3.5, 4.1), TIPO, resalte);
      raices.forEach((r, k) => fijar(r, { 'stroke-dasharray': '160 160', 'stroke-dashoffset': 160 * (1 - tramo(t, 1.0 + k * 0.12, 1.9 + k * 0.12)) }));
      planta.pintar(t, 1.2, 1.9);

      // 2 · el tipo.
      const pTipo = tramo(t, 3.9, 4.35, curvas.lineal);
      // La etiqueta del tipo queda pegada en la esquina del bloque.
      etTipo.pintar(BX + 12, BY - 30, pTipo, -8, 1 - 0.3 * tramo(t, 15.2, 15.8));
      notaTipo.pintar(tramo(t, 4.9, 6.0, curvas.lineal), 1 - tramo(t, 6.4, 6.8));

      // Eje del tiempo.
      const pEje = tramo(t, 6.7, 7.7);
      fijar(eje, { d: `M${LIMITES[0]! - 24} ${SUELO} L${mezclar(LIMITES[0]! - 24, LIMITES[3]! + 30, pEje)} ${SUELO}`, opacity: pEje > 0 ? 1 : 0 });
      marcas.forEach((m, k) => fijar(m, { opacity: pEje > 0 && pEje * (LIMITES[3]! - LIMITES[0]! + 54) + LIMITES[0]! - 24 >= LIMITES[k]! ? 1 : 0 }));
      anos.forEach((a, k) => a.pintar(centro(k), SUELO + 26, tramo(t, 7.2 + k * 0.15, 7.6 + k * 0.15)));

      // 3 y 4 · las tres cosechas, siempre desde el mismo bloque.
      const origen = { x: BX + BW / 2 + 22, y: BY - 70 };
      const inicios = [7.4, 10.9, 12.7];
      [0, 1, 2].forEach((k) => {
        const t0 = inicios[k]!;
        const destino = { x: centro(k) - 6, y: SUELO - 118 };
        const pf = tramo(t, t0, t0 + 0.9, curvas.suave);
        const cabeza = flechas[k]!.pintar(origen, destino, 70 + k * 18, pf, 1 - 0.45 * tramo(t, 15.2, 16));
        fijar(pulsos[k]!, { cx: cabeza.x, cy: cabeza.y, opacity: ventana(t, t0, t0 + 0.95, 0.12) });
        arboles[k]!.pintar(t, t0 + 0.7);
        // La etiqueta de cada cosecha cae junto a su árbol y, al final, viaja al total.
        const pCae = tramo(t, t0 + 1.8, t0 + 2.2, curvas.lineal);
        const pJunta = tramo(t, 16.1 + k * 0.28, 17.0 + k * 0.28, curvas.suave);
        const xf = 586;
        const yf = 540;
        const x = mezclar(centro(k), xf, pJunta);
        // Viajan por un arco alto (por encima de las demás) y se funden al llegar al total.
        const y = mezclar(SUELO - 28, yf, pJunta) - Math.sin(Math.PI * pJunta) * (120 - k * 20);
        cosechas[k]!.pintar(x, y, pCae, k === 1 ? 2 : -2, 1 - tramo(t, 16.92 + k * 0.28, 17.05 + k * 0.28));
      });
      cuenta.pintar(tramo(t, 9.6, 10.6, curvas.lineal), 1 - tramo(t, 10.8, 11.2));
      notaMismo.pintar(tramo(t, 13.4, 15.0, curvas.lineal), 1 - tramo(t, 17.4, 18.0));
      flechaNota.pintar({ x: 424, y: 108 }, { x: BX + BW / 2 + 26, y: BY - 82 }, 26, tramo(t, 14.6, 15.3), 1 - tramo(t, 17.4, 18.0));

      // 5 · n = 3 y el total.
      llaveN.horizontal(LIMITES[0]!, LIMITES[3]!, SUELO + 44, 16, tramo(t, 15.4, 15.9));
      situar(etN, 430, SUELO + 84, 1, tramo(t, 15.7, 16.1));
      etN2.pintar(430, SUELO + 104, tramo(t, 15.8, 16.2));
      total.pintar(586, 540, tramo(t, 17.5, 17.95, curvas.lineal), -3);
      notaTotal.pintar(tramo(t, 17.9, 18.5, curvas.lineal));

      // 6 · la fórmula, con piezas que vienen de la escena.
      formula.opacidad(tramo(t, 19.3, 19.4));
      formula.construir(t, 19.4, {
        origenes: {
          I: l.aPantalla({ x: 560, y: 540 }),
          C_0: l.aPantalla({ x: BX + BW / 2, y: BY + 44 }),
          n: l.aPantalla({ x: 418, y: SUELO + 78 }),
          i: l.aPantalla({ x: BX - 30, y: BY - 108 }),
        },
        duracion: 1.15,
        escalon: 0.2,
      });
      ['I', 'C_0', 'n', 'i'].forEach((clave, k) => {
        const p = formula.pieza(clave);
        if (!p) return;
        const c = formula.centro(p);
        const q = tramo(t, 21.3 + k * 0.25, 21.8 + k * 0.25);
        // Las guías alternan de largo para que los significados no se pisen.
        const y0 = c.y + 34;
        const largo = k % 2 ? 40 : 14;
        fijar(guias[k]!, { x1: c.x, x2: c.x, y1: y0, y2: y0 + largo * q, opacity: q > 0 ? 1 : 0 });
        situar(textos[k]!, c.x, y0 + largo + 16, 1, tramo(t, 21.6 + k * 0.25, 22.0 + k * 0.25));
      });
      sustitucion.pintar(196, 548, tramo(t, 23.4, 23.8, curvas.lineal), -2);
    };
  },
};
