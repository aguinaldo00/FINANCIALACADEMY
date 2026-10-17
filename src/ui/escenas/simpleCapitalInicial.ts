import type { Escena } from '../motion/reproductor.ts';
import { Capsula, Eje, Etiqueta, Guia, Hueco, Llave, Rotulo, suelo } from '../motion/motivos.ts';
import { claves, curvas, mezclar, retener, tramo, ventana } from '../motion/tiempo.ts';
import { fijar } from '../motion/lienzo.ts';

/*
 * Fórmula 3 · C₀ = Cₙ / (1 + n · i)
 * Se conoce el final y se viaja hacia atrás. Por cada euro invertido hay 1 + n · i euros al final,
 * así que la columna mide 1,21 veces el capital inicial. Dividir deshace multiplicar: el factor
 * cruza el igual y pasa abajo. La parte azul vuelve al año 0 y llena el hueco del capital inicial.
 */

const TIPO = 0.07;
const N = 3;
const SUELO = 420;
const X0 = 150;
const PASO = 150;
const ALTO_C0 = 220;
const H = ALTO_C0 * TIPO;
const XF = X0 + N * PASO;
const ANCHO = 66;

export const escenaCapitalInicialSimple: Escena = {
  id: 'simple-capital-inicial',
  titulo: 'Capital inicial en capitalización simple',
  duracion: 18.1,
  descripcion: 'Se conoce el montante de 12.100 € a 3 años al 7 %. Cada euro invertido se convierte en 1,21 €; al dividir entre 1 + n · i se recupera el capital inicial de 10.000 € en el año 0.',
  caso: { C_n: '12.100 €', n: '3', i: '7 %' },
  capitulos: [
    { t: 0, texto: 'Ahora conoces el final: $C_n$ = 12.100 € dentro de $n$ = 3 años, al $i$ = 7 % anual.' },
    { t: 2.8, lectura: 4.9, texto: '¿Cuánto hubo que invertir? Hay que volver al año 0, donde está la incógnita, $C_0$.' },
    { t: 5.6, texto: 'Cada euro invertido hoy se convierte al final en 1 + $n · i$ = 1 + 3 · 0,07 = 1,21 euros.' },
    { t: 9, texto: 'Así que $C_n = C_0 · (1 + n · i)$. Para dejar $C_0$ solo, el factor $(1 + n · i)$ que multiplica pasa al otro lado dividiendo.' },
    { t: 13.2, texto: '$C_0$ = 12.100 / 1,21 = 10.000 €: el capital inicial vuelve al año 0.' },
  ],
  montar(l) {
    suelo(l, SUELO);
    const eje = new Eje(l, { x0: X0, paso: PASO, y: SUELO, periodos: N, unidad: 'años' });
    const hueco = new Hueco(l, 's-c0');
    const flechas = l.grupo({ class: 'mo-flechas s-n', 'data-vivo': '' }); // bucle: los chevrones recorren el camino sin parar
    const chevrones = Array.from({ length: 5 }, () => l.el('path', { d: 'M8 -9 L0 0 L8 9', class: 'mo-flecha' }, flechas));
    const columna = new Capsula(l, { clase: 's-cn', ancho: ANCHO + 10, relleno: 0.4 });
    const parteC0 = new Capsula(l, { clase: 's-c0', ancho: ANCHO, relleno: 0.22 });
    const parteI = new Capsula(l, { clase: 's-I', ancho: ANCHO, relleno: 0.4 });
    const corte = new Guia(l, 'mo-guia s-c0');
    const llave1 = new Llave(l, 's-c0');
    const llave2 = new Llave(l, 's-I');
    const etCn = new Etiqueta(l, 'C_n = "12.100 €"', 26);
    const et1 = new Rotulo(l, '1', 'mo-cifra s-c0', 'end');
    const et1b = new Rotulo(l, 'euro invertido', 'mo-rotulo', 'end');
    const et2 = new Etiqueta(l, 'n · i = "0,21"', 20, 'derecha');
    const etTotal = new Etiqueta(l, '1 + n · i = "1,21"', 24, 'derecha');
    const etC0 = new Etiqueta(l, 'C_0 = "10.000 €"', 26);

    const l1 = l.formula('C_n = C_0 · (1 + n · i)', { x: 360, y: 64, tam: 30 });
    const l2 = l.formula('C_0 = \\frac{C_n}{1 + n · i}', { x: 360, y: 158, tam: 42 });
    const sust = l.formula('C_0 = \\frac{12.100}{1 + 3 · 0,07} = "10.000 €"', { x: 360, y: 548, tam: 26 });

    return (tReal) => {
      // Retenciones: lo que acaba tarde termina mientras el resto espera (ver retener en tiempo.ts).
      const t = retener(tReal, 12.6, 0.6);
      const cx = claves(t, [[0, XF - 40], [2.8, XF - 40], [4.8, 350], [5.6, 470], [9.0, 470], [10.0, 380]]);
      const cy = claves(t, [[0, 300], [2.8, 300], [4.8, 330], [5.6, 300], [9.0, 300], [10.0, 190]]);
      const z = claves(t, [[0, 1.25], [2.8, 1.25], [4.8, 1.0], [5.6, 1.15], [9.0, 1.15], [10.0, 0.8]]);
      l.camara(cx, cy, z);
      l.foco(claves(t, [[0, 560], [3, 560], [4.8, 200], [5.6, 520], [12.6, 520], [14, 300]]), 300, 300);

      eje.pintar(tramo(t, 0, 0.8), 1, t < 2.8 ? 3 : t < 5.6 ? 0 : -1);
      const alto = ALTO_C0 * (1 + N * TIPO);
      const pCol = tramo(t, 0.2, 1.2, curvas.expo);
      // La columna de oro se convierte en sus dos partes al medirla.
      const pDivide = tramo(t, 6.0, 7.0);
      columna.pintar(XF, SUELO, alto * mezclar(0.6, 1, pCol), pCol * (1 - 0.75 * pDivide));
      etCn.pintar(XF, SUELO - alto - 26, tramo(t, 0.8, 1.4));

      // Viaje hacia atrás: chevrones que van del final al origen.
      const pViaje = ventana(t, 3.0, 5.4, 0.4);
      chevrones.forEach((c, k) => {
        const fase = ((t * 0.9 + k / chevrones.length) % 1);
        const x = mezclar(XF - 30, X0 + 30, fase);
        fijar(c, { transform: `translate(${x} ${SUELO - 36})`, opacity: pViaje * Math.sin(Math.PI * fase) });
      });
      const pVuelve = tramo(t, 12.9, 14.4, curvas.suave);
      // El hueco del año 0 se ve mientras se viaja hacia él; al acercarse la cámara a la columna quedaría cortado.
      hueco.pintar(X0, SUELO, ALTO_C0, ANCHO + 6, tramo(t, 3.6, 4.4) * (1 - tramo(t, 5.6, 6.0)), 1 - tramo(t, 9.0, 9.6));

      // Medida por euro invertido: la parte azul (1) y la verde (n · i = 0,21).
      const xC0 = mezclar(XF, X0, pVuelve);
      parteC0.pintar(xC0, SUELO, ALTO_C0 * mezclar(0.96, 1, pDivide), pDivide);
      parteI.pintar(XF, SUELO - ALTO_C0, N * H, pDivide * (1 - 0.6 * pVuelve));
      corte.pintar(XF - 60, SUELO - ALTO_C0, XF + 60, SUELO - ALTO_C0, tramo(t, 5.8, 6.4), 1 - tramo(t, 12.6, 13.0));
      const xr = XF - ANCHO / 2 - 14;
      llave1.vertical(SUELO, SUELO - ALTO_C0, xr, -14, ventana(t, 6.6, 12.8));
      llave2.vertical(SUELO - ALTO_C0, SUELO - alto, xr, -10, ventana(t, 7.2, 12.8));
      et1.pintar(xr - 24, SUELO - ALTO_C0 / 2 + 8, ventana(t, 6.8, 12.8));
      et1b.pintar(xr - 24, SUELO - ALTO_C0 / 2 + 32, ventana(t, 7.0, 12.8) * 0.9);
      et2.pintar(xr - 20, SUELO - ALTO_C0 - (N * H) / 2 + 7, ventana(t, 7.4, 12.8));
      // Se retira cuando llega la fórmula despejada (ocuparía su sitio).
      etTotal.pintar(xr - 20, SUELO - alto - 62, ventana(t, 8.0, 10.6));

      // El factor cruza el igual.
      const centro = (f: typeof l1, clave: string, vez = 0) => {
        const p = f.pieza(clave, vez);
        return p ? f.centro(p) : undefined;
      };
      l1.opacidad(tramo(t, 9.1, 9.2) * mezclar(1, 0.42, tramo(t, 10.8, 11.4)));
      l1.construir(t, 9.2, {
        origenes: {
          C_n: l.aPantalla({ x: XF - 40, y: SUELO - alto - 34 }),
          C_0: l.aPantalla({ x: X0, y: SUELO - ALTO_C0 / 2 }),
          n: l.aPantalla({ x: xr - 100, y: SUELO - alto - 30 }),
          i: l.aPantalla({ x: xr - 70, y: SUELO - alto - 30 }),
        },
      });
      l2.opacidad(tramo(t, 10.5, 10.6));
      l2.construir(tReal, 10.6, { origenes: { C_0: centro(l1, 'C_0'), C_n: centro(l1, 'C_n'), n: centro(l1, 'n'), i: centro(l1, 'i') }, duracion: 1.3 });

      etC0.pintar(X0, SUELO - ALTO_C0 - 28, tramo(t, 14.2, 14.8));
      sust.opacidad(tramo(t, 14.3, 14.4));
      sust.construir(t, 14.4, { escalon: 0.04 });
    };
  },
};
