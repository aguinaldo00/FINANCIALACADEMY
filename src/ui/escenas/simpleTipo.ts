import type { Escena } from '../motion/reproductor.ts';
import { Capsula, Eje, Etiqueta, Guia, Llave, Rotulo, suelo } from '../motion/motivos.ts';
import { arco, claves, curvas, tramo, ventana } from '../motion/tiempo.ts';

/*
 * Fórmula 4 · i = (Cₙ − C₀) / (n · C₀)
 * Se conocen la semilla y el montante. Lo que ha crecido (Cₙ − C₀) se reparte entre los n años y
 * una de esas cosechas se compara con la semilla: la proporción es el tipo.
 */

const TIPO = 0.07;
const N = 3;
const SUELO = 430;
const X0 = 150;
const PASO = 150;
const ALTO_C0 = 220;
const H = ALTO_C0 * TIPO;
const XF = X0 + N * PASO;
const ANCHO = 66;

export const escenaTipoSimple: Escena = {
  id: 'simple-tipo',
  titulo: 'Tipo de interés en capitalización simple',
  duracion: 19,
  descripcion: 'Con C₀ = 10.000 € y Cₙ = 12.100 € en 3 años, lo crecido (2.100 €) se reparte en 3 cosechas de 700 €; cada una es 0,07 de la semilla: i = (Cₙ − C₀) / (n · C₀) = 7 %.',
  capitulos: [
    { t: 0, texto: 'Conoces la semilla y el montante: $C_0$ = 10.000 € hoy y $C_n$ = 12.100 € a los 3 años. Falta el tipo.' },
    { t: 2.8, texto: 'Lo que ha crecido es la diferencia: $C_n - C_0$ = 2.100 €. Son los intereses $I$.' },
    { t: 6.2, texto: 'Repartido entre los $n$ = 3 años, cada año ha dado 2.100 / 3 = 700 €.' },
    { t: 9.4, texto: 'Una cosecha comparada con la semilla: 700 / 10.000 = 0,07. Esa proporción es el tipo.' },
    { t: 13.0, texto: 'Tipo de interés: $i = \\frac{C_n - C_0}{n · C_0}$. Sale en tanto por uno y en la unidad de $n$: 0,07 anual = 7 %.' },
  ],
  montar(l) {
    suelo(l, SUELO);
    const eje = new Eje(l, { x0: X0, paso: PASO, y: SUELO, periodos: N, periodos_rotulo: (k) => `año ${k}` });
    const c0 = new Capsula(l, { clase: 's-c0', ancho: ANCHO, relleno: 0.22 });
    const cn = new Capsula(l, { clase: 's-cn', ancho: ANCHO + 10, relleno: 0.4 });
    const fantasma = new Capsula(l, { clase: 's-c0', ancho: ANCHO, relleno: 0.4 });
    const crecido = new Capsula(l, { clase: 's-I', ancho: ANCHO, relleno: 0.45 });
    const trozos = Array.from({ length: N }, () => new Capsula(l, { clase: 's-I', ancho: ANCHO, relleno: 0.45 }));
    const llaveDif = new Llave(l, 's-I');
    const llaveTipo = new Llave(l, 's-i');
    const guia = new Guia(l, 'mo-guia s-c0');
    const etC0 = new Etiqueta(l, 'C_0 = "10.000 €"', 22);
    const etCn = new Etiqueta(l, 'C_n = "12.100 €"', 22);
    const etDif = new Etiqueta(l, 'C_n - C_0 = "2.100 €"', 20, 'derecha');
    const etTrozos = trozos.map(() => new Rotulo(l, '700 €', 'mo-cifra mo-cifra-peq s-I'));
    const etN = new Etiqueta(l, 'n = 3', 22);
    const etTipo = new Etiqueta(l, 'i = \\frac{700}{10.000} = "0,07"', 22, 'izquierda');

    const formula = l.formula('i = \\frac{C_n - C_0}{n · C_0}', { x: 360, y: 92, tam: 50 });
    const sust = l.formula('i = \\frac{12.100 - 10.000}{3 · 10.000} = "0,07 → 7 % anual"', { x: 360, y: 548, tam: 24 });

    return (t) => {
      const cx = claves(t, [[0, 375], [2.8, 375], [4.2, 470], [6.2, 470], [7.4, 375], [9.4, 375], [10.6, 330], [12.8, 330], [14.0, 375]]);
      const cy = claves(t, [[0, 330], [4.2, 290], [6.2, 290], [7.4, 340], [9.4, 340], [10.6, 290], [12.8, 290], [14.0, 262]]);
      const z = claves(t, [[0, 1.0], [2.8, 1.0], [4.2, 1.35], [6.2, 1.35], [7.4, 1.05], [9.4, 1.05], [10.6, 1.2], [12.8, 1.2], [14.0, 0.9]]);
      l.camara(cx, cy, z);
      l.foco(claves(t, [[0, 360], [4.2, 600], [7.4, 360], [10.6, 200], [14, 360]]), 300, 300);

      eje.pintar(tramo(t, 0, 0.8), 1);
      const altoN = ALTO_C0 * (1 + N * TIPO);
      const p0 = tramo(t, 0.2, 1.2, curvas.expo);
      c0.pintar(X0, SUELO, ALTO_C0, p0);
      cn.pintar(XF, SUELO, altoN, tramo(t, 0.6, 1.6, curvas.expo));
      etC0.pintar(X0, SUELO - ALTO_C0 - 22, tramo(t, 1.0, 1.6));
      etCn.pintar(XF, SUELO - altoN - 22, tramo(t, 1.2, 1.8) * (1 - 0.6 * tramo(t, 9.4, 10)));

      // La semilla se copia sobre la columna: lo que sobresale es lo crecido.
      const pCopia = tramo(t, 3.0, 4.4, curvas.suave);
      const posCopia = arco({ x: X0, y: SUELO }, { x: XF, y: SUELO }, pCopia, 0.18);
      fantasma.pintar(posCopia.x, posCopia.y, ALTO_C0, ventana(t, 3.0, 6.6, 0.3));
      guia.pintar(X0 + ANCHO / 2, SUELO - ALTO_C0, XF - ANCHO / 2, SUELO - ALTO_C0, tramo(t, 4.4, 5.0), 1 - tramo(t, 6.4, 6.8));
      const pDif = tramo(t, 4.6, 5.2);
      crecido.pintar(XF, SUELO - ALTO_C0, N * H, pDif * (1 - tramo(t, 6.9, 7.1)));
      const xr = XF - (ANCHO + 10) / 2 - 10;
      llaveDif.vertical(SUELO - ALTO_C0, SUELO - altoN, xr, -10, ventana(t, 4.8, 9.4));
      etDif.pintar(xr - 20, SUELO - ALTO_C0 - (N * H) / 2 + 7, ventana(t, 5.0, 9.4));

      // Lo crecido se reparte entre los n años.
      trozos.forEach((trozo, k) => {
        const p = tramo(t, 6.8 + k * 0.25, 8.0 + k * 0.25, curvas.suave);
        const desde = { x: XF, y: SUELO - ALTO_C0 - k * H };
        const hasta = { x: eje.x(k) + PASO / 2, y: SUELO };
        const q = arco(desde, hasta, p, 0.3);
        // El primero viaja después junto a la semilla para medirse con ella.
        const pMide = k === 0 ? tramo(t, 9.8, 11.0, curvas.suave) : 0;
        const medir = { x: X0 + ANCHO + 14, y: SUELO - ALTO_C0 + H };
        const r = k === 0 && pMide > 0 ? arco(q, medir, pMide, 0.2) : q;
        trozo.pintar(r.x, r.y, H, tramo(t, 6.9, 7.1), ANCHO);
        etTrozos[k]!.pintar(hasta.x, SUELO - H - 14, tramo(t, 8.0 + k * 0.25, 8.4 + k * 0.25) * (k === 0 ? 1 - tramo(t, 9.6, 9.9) : 1));
      });
      etN.pintar((eje.x(0) + eje.x(N)) / 2, SUELO + 70, ventana(t, 8.2, 13.0));
      llaveTipo.vertical(SUELO - ALTO_C0, SUELO - ALTO_C0 + H, X0 + ANCHO + 14 + ANCHO / 2 + 8, 10, tramo(t, 11.0, 11.5) * (1 - tramo(t, 13.6, 14.0)));
      etTipo.pintar(X0 + ANCHO * 2 + 40, SUELO - ALTO_C0 + 12, tramo(t, 11.2, 11.8) * (1 - tramo(t, 13.6, 14.0)));

      const centroDif = l.aPantalla({ x: xr - 120, y: SUELO - ALTO_C0 - 20 });
      formula.opacidad(tramo(t, 13.1, 13.2));
      formula.construir(t, 13.2, {
        origenes: {
          i: l.aPantalla({ x: X0 + ANCHO * 2 + 50, y: SUELO - ALTO_C0 + 4 }),
          C_n: centroDif,
          C_0: [centroDif, l.aPantalla({ x: X0, y: SUELO - ALTO_C0 - 30 })],
          n: l.aPantalla({ x: (eje.x(0) + eje.x(N)) / 2, y: SUELO + 62 }),
        },
        escalon: 0.14,
      });
      sust.opacidad(tramo(t, 15.4, 15.5));
      sust.construir(t, 15.5, { escalon: 0.04 });
    };
  },
};
