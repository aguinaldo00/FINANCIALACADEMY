import type { Escena } from '../motion/reproductor.ts';
import { Capsula, Eje, Etiqueta, Llave, Rotulo, suelo } from '../motion/motivos.ts';
import { arco, claves, curvas, mezclar, retener, tramo, ventana } from '../motion/tiempo.ts';

/*
 * Fórmula 2 · Cₙ = C₀ · (1 + n · i)
 * La semilla sale de la tierra y viaja al final del tiempo; las n cosechas se apilan encima.
 * La columna es el montante: C₀ + I. Como cada cosecha es C₀ · i, C₀ aparece en los dos sumandos
 * y sale factor común. La deducción se escribe paso a paso con las piezas de la línea anterior.
 */

const TIPO = 0.07;
const N = 3;
const SUELO = 400;
const X0 = 170;
const PASO = 140;
const ALTO_C0 = 220;
const H = ALTO_C0 * TIPO;
const XF = X0 + N * PASO;
const ANCHO_COL = 70;

export const escenaMontanteSimple: Escena = {
  id: 'simple-montante',
  titulo: 'Capital final o montante en capitalización simple',
  duracion: 19.5,
  descripcion: 'La semilla de 10.000 € y las tres cosechas de 700 € forman una columna de 12.100 €: Cₙ = C₀ + I = C₀ · (1 + n · i).',
  capitulos: [
    { t: 0, texto: 'El montante $C_n$ es todo lo que hay al final: la semilla $C_0$ más las cosechas, $I$.' },
    { t: 2.6, texto: 'La semilla sale de la tierra y las cosechas se apilan encima: $C_n = C_0 + I$ = 12.100 €.' },
    { t: 7.7, texto: 'Cada cosecha es $C_0 · i$, así que las $n$ cosechas son $I = C_0 · n · i$.' },
    { t: 11.3, lectura: 14.25, texto: '$C_0$ está en los dos sumandos: sale factor común y queda $C_n = C_0 · (1 + n · i)$.' },
    { t: 14.9, texto: 'Con los datos: $C_n$ = 10.000 · (1 + 3 · 0,07) = 10.000 · 1,21 = 12.100 €.' },
  ],
  montar(l) {
    suelo(l, SUELO);
    const eje = new Eje(l, { x0: X0, paso: PASO, y: SUELO, periodos: N, periodos_rotulo: (k) => `año ${k}` });
    // El montante es un papel de oro detrás de la pila (se dibuja antes para quedar debajo).
    const contorno = new Capsula(l, { clase: 's-cn', ancho: ANCHO_COL + 12, relleno: 0.4 });
    const semilla = new Capsula(l, { clase: 's-c0', ancho: ANCHO_COL - 8, relleno: 0.2 });
    const cosechas = Array.from({ length: N }, () => new Capsula(l, { clase: 's-I', ancho: PASO, relleno: 0.4 }));
    const llaveC0 = new Llave(l, 's-c0');
    const llaveI = new Llave(l, 's-I');
    const etCn = new Etiqueta(l, 'C_n = "12.100 €"', 26);
    const etC0 = new Etiqueta(l, 'C_0', 28, 'derecha');
    const etI = new Etiqueta(l, 'I', 28, 'derecha');
    const etI2 = new Etiqueta(l, 'C_0 · n · i', 22, 'derecha');
    const etSemilla = new Rotulo(l, '10.000 €', 'mo-cifra mo-cifra-peq s-c0', 'end');
    const etCosecha = new Rotulo(l, '3 · 700 €', 'mo-cifra mo-cifra-peq s-I', 'end');

    const l1 = l.formula('C_n = C_0 + I', { x: 40, y: 110, tam: 32, alinear: 'izquierda' });
    const l2 = l.formula('C_n = C_0 + C_0 · n · i', { x: 40, y: 170, tam: 32, alinear: 'izquierda' });
    const l3 = l.formula('C_n = C_0 · (1 + n · i)', { x: 40, y: 234, tam: 40, alinear: 'izquierda' });
    const sust = l.formula('C_n = 10.000 · (1 + 3 · 0,07) = "12.100 €"', { x: 360, y: 560, tam: 26 });

    return (tReal) => {
      // Retenciones: lo que acaba tarde termina mientras el resto espera (ver retener en tiempo.ts).
      const t1 = retener(tReal, 6.8, 0.9);
      const t = retener(t1, 9.8, 0.6);
      const cx = claves(t, [[0, 380], [2.6, 380], [5.0, 400], [6.0, 470], [12.6, 470], [13.6, 400]]);
      const cy = claves(t, [[0, 420], [2.6, 420], [5.0, 300], [6.0, 280], [12.6, 280], [13.6, 312]]);
      const z = claves(t, [[0, 0.9], [2.6, 0.9], [5.0, 1.0], [6.0, 1.12], [12.6, 1.12], [13.6, 1.0]]);
      l.camara(cx, cy, z);
      l.foco(claves(t, [[0, 360], [5, 560], [9.6, 300], [13.4, 360]]), claves(t, [[0, 320], [5, 220], [13.4, 360]]), 300);

      const aparece = tramo(t, 0, 0.6);
      eje.pintar(1, aparece);

      // La semilla: de colgar bajo tierra en el año 0 a estar de pie al final del año 3.
      const pSube = tramo(t, 2.7, 4.6, curvas.suave);
      const desde = { x: X0, y: SUELO + 12 + ALTO_C0 };
      const hasta = { x: XF, y: SUELO };
      const pos = arco(desde, hasta, pSube, 0.12);
      semilla.pintar(pos.x, pos.y, ALTO_C0, aparece);

      // Las cosechas dejan su año y se apilan encima de la semilla.
      cosechas.forEach((c, k) => {
        const p = tramo(t, 3.3 + k * 0.3, 4.9 + k * 0.3, curvas.suave);
        const origen = { x: eje.x(k) + PASO / 2, y: SUELO };
        const destino = { x: XF, y: SUELO - ALTO_C0 - k * H };
        const q = arco(origen, destino, p, 0.25);
        const resalte = 1 + 0.5 * ventana(t, 7.4 + k * 0.4, 8.0 + k * 0.4, 0.2);
        c.pintar(q.x, q.y, H * resalte, aparece, mezclar(PASO - 6, ANCHO_COL - 8, p));
      });

      // El montante: contorno de oro y su valor.
      const pCol = tramo(t, 5.0, 5.6);
      contorno.pintar(XF, SUELO + 6, ALTO_C0 + N * H + 12, pCol);
      etCn.pintar(XF, SUELO - ALTO_C0 - N * H - 30, tramo(t, 5.2, 5.8));
      const xl = XF - ANCHO_COL / 2 - 12;
      llaveC0.vertical(SUELO, SUELO - ALTO_C0, xl, -14, tramo(t, 5.3, 5.8));
      llaveI.vertical(SUELO - ALTO_C0, SUELO - ALTO_C0 - N * H, xl, -10, tramo(t, 5.3, 5.8));
      etC0.pintar(xl - 24, SUELO - ALTO_C0 / 2 + 6, tramo(t, 5.4, 6.0));
      etSemilla.pintar(xl - 24, SUELO - ALTO_C0 / 2 + 34, tramo(t, 5.6, 6.2));
      const cambio = tramo(t, 7.0, 7.6);
      etI.pintar(xl - 22, SUELO - ALTO_C0 - (N * H) / 2 + 9, tramo(t, 5.4, 6.0) * (1 - cambio));
      etI2.pintar(xl - 22, SUELO - ALTO_C0 - (N * H) / 2 + 8, cambio);
      etCosecha.pintar(xl - 22, SUELO - ALTO_C0 - (N * H) / 2 - 22, tramo(t, 7.6, 8.2));

      // La deducción, línea a línea: cada línea se construye con las piezas de la anterior.
      const centro = (f: typeof l1, clave: string, vez = 0) => {
        const p = f.pieza(clave, vez);
        return p ? f.centro(p) : undefined;
      };
      l1.opacidad(mezclar(1, 0.42, tramo(t, 8.6, 9.2)) * tramo(t, 5.7, 5.8));
      l1.construir(tReal, 5.8, {
        origenes: {
          C_n: l.aPantalla({ x: XF - 40, y: SUELO - ALTO_C0 - N * H - 38 }),
          C_0: l.aPantalla({ x: xl - 34, y: SUELO - ALTO_C0 / 2 }),
          I: l.aPantalla({ x: xl - 30, y: SUELO - ALTO_C0 - (N * H) / 2 }),
        },
      });
      l2.opacidad(mezclar(1, 0.42, tramo(t, 10.6, 11.2)) * tramo(t, 8.3, 8.4));
      const desdeI = centro(l1, 'I');
      l2.construir(t1, 8.4, { origenes: { C_n: centro(l1, 'C_n'), C_0: [centro(l1, 'C_0'), desdeI], n: desdeI, i: desdeI } });
      l3.opacidad(tramo(t, 10.3, 10.4));
      l3.construir(t, 10.4, { origenes: { C_n: centro(l2, 'C_n'), C_0: centro(l2, 'C_0', 1), n: centro(l2, 'n'), i: centro(l2, 'i') }, duracion: 1.3, resaltar: ['C_0'] });
      sust.opacidad(tramo(t, 13.7, 13.8));
      sust.construir(t, 13.8, { escalon: 0.05 });
    };
  },
};
