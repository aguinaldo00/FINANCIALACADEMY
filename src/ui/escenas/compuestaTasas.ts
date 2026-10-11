import type { Escena } from '../motion/reproductor.ts';
import { Capsula, Etiqueta, Grafico, Rotulo, Salto } from '../motion/motivos.ts';
import { fijar } from '../motion/lienzo.ts';
import { claves, curvas, mezclar, tramo, ventana } from '../motion/tiempo.ts';

/*
 * Tantos equivalentes en compuesta · 1 + i = (1 + iₘ)ᵐ   (caso práctico 19: 10 % anual)
 * Dos caminos llegan al mismo sitio: un salto anual de ×1,10 o doce saltos mensuales de
 * ×1,007974. El camino de dividir (10 % / 12) se pasa de largo: en compuesta no se divide.
 */
export const escenaEquivalentes: Escena = {
  id: 'compuesta-equivalentes',
  titulo: 'Tantos equivalentes en capitalización compuesta',
  duracion: 17,
  descripcion: 'Caso práctico 19: un salto anual de ×1,10 y doce saltos mensuales de ×1,007974 llegan al mismo capital. Dividir 10 % / 12 llega a 1,1047, más lejos: iₘ = (1 + i)^(1/m) − 1.',
  capitulos: [
    { t: 0, texto: 'Caso práctico 19: tipo anual del 10 %. ¿Qué tipo mensual es equivalente en compuesta?' },
    { t: 2.8, texto: 'Un salto anual: cada euro se convierte en 1,10 €.' },
    { t: 5.2, texto: 'Doce saltos mensuales tienen que llegar al mismo sitio: $1 + i = (1 + i_m)^{12}$.' },
    { t: 9.0, texto: 'Por eso $i_m = (1 + i)^{1/m} - 1$: $i_{12}$ = 1,10^(1/12) − 1 = 0,7974 % al mes.' },
    { t: 12.4, texto: 'Dividir 10 % / 12 = 0,8333 % se pasa: llega a 1,1047. En compuesta el tipo no se divide.' },
  ],
  montar(l) {
    const g = new Grafico(l, { x0: 100, y0: 470, x1: 620, y1: 170, xmin: 0, xmax: 12, ymin: 1, ymax: 1.115 });
    const anual = new Salto(l, 's-i', '×1,10');
    const mensuales = Array.from({ length: 12 }, () => new Salto(l, 's-i', ''));
    const malos = g.linea('mo-curva-fina');
    const meta = g.linea('mo-curva-fina');
    const pInicio = l.el('circle', { r: 8, class: 'mo-punto s-c0' }, g.g);
    const pFin = l.el('circle', { r: 9, class: 'mo-punto s-cn' }, g.g);
    const pMalo = l.el('circle', { r: 7, class: 'mo-punto s-D' }, g.g);
    const marcas = [0, 3, 6, 9, 12].map((k) => new Rotulo(l, k === 12 ? '1 año' : `${k} m`, 'mo-eje-texto', 'middle'));
    const etAnual = new Rotulo(l, 'UN SALTO DE ×1,10', 'mo-rotulo-claro', 'middle');
    const etMes = new Rotulo(l, 'DOCE SALTOS DE ×1,007974', 'mo-rotulo-claro', 'middle');
    const etMalo = new Rotulo(l, '×1,008333 doce veces = 1,1047', 'mo-cifra mo-cifra-peq s-D', 'end');
    const etFin = new Rotulo(l, '1,10', 'mo-cifra s-cn', 'start');
    const formula = l.formula('1 + i = (1 + i_m)^m', { x: 360, y: 90, tam: 42 });
    const despeje = l.formula('i_m = (1 + i)^{1/m} - 1', { x: 360, y: 548, tam: 28 });
    return (t) => {
      l.camara(360, claves(t, [[0, 310], [12, 310], [13, 320]]), claves(t, [[0, 1], [12, 1], [13, 0.96]]));
      l.foco(360, 330, 340);
      g.pintar(tramo(t, 0, 0.8));
      marcas.forEach((m, k) => m.pintar(g.px([0, 3, 6, 9, 12][k]!), g.op.y0 + 30, tramo(t, 0.3, 0.9)));
      fijar(pInicio, { cx: g.px(0), cy: g.py(1), opacity: tramo(t, 0.4, 0.8) });
      // Camino anual: un único arco grande.
      anual.pintar({ x: g.px(0) + 6, y: g.py(1) - 6 }, { x: g.px(12) - 6, y: g.py(1.1) - 6 }, tramo(t, 3.0, 4.2), 1 - 0.5 * tramo(t, 5.2, 5.6), 150);
      etAnual.pintar(g.px(6), g.py(1.1) - 160, ventana(t, 3.2, 5.6));
      fijar(pFin, { cx: g.px(12), cy: g.py(1.1), opacity: tramo(t, 4.0, 4.3) });
      etFin.pintar(g.px(12) + 14, g.py(1.1) + 6, tramo(t, 4.2, 4.6));
      fijar(meta, { d: `M${g.px(0)} ${g.py(1.1)} L${g.px(12)} ${g.py(1.1)}`, opacity: tramo(t, 4.4, 5.0) });
      // Doce saltos mensuales equivalentes: llegan justo a 1,10.
      const im = 1.1 ** (1 / 12);
      mensuales.forEach((s, k) => {
        const t0 = 5.6 + k * 0.22;
        s.pintar({ x: g.px(k) + 3, y: g.py(im ** k) - 3 }, { x: g.px(k + 1) - 3, y: g.py(im ** (k + 1)) - 3 }, tramo(t, t0, t0 + 0.35), 1, 16);
      });
      etMes.pintar(g.px(6), g.py(im ** 6) + 70, ventana(t, 6.0, 12.2));
      // Camino equivocado: 10 % / 12 en compuesta.
      const malo = 1 + 0.1 / 12;
      const pm = tramo(t, 12.6, 14.0, curvas.lineal);
      fijar(malos, { d: g.camino((x) => malo ** x, 0, 12, pm, 48), opacity: tramo(t, 12.6, 12.8) });
      fijar(pMalo, { cx: g.px(12), cy: g.py(malo ** 12), opacity: tramo(t, 13.9, 14.2) });
      etMalo.pintar(g.px(12) - 12, g.py(malo ** 12) - 18, tramo(t, 14.0, 14.5));
      formula.opacidad(tramo(t, 7.4, 7.5));
      formula.construir(t, 7.5, { origenes: { i: [l.aPantalla({ x: g.px(6), y: g.py(1.1) - 150 })], i_m: l.aPantalla({ x: g.px(6), y: g.py(im ** 6) + 60 }), m: l.aPantalla({ x: g.px(11), y: g.py(im ** 11) }) } });
      despeje.opacidad(tramo(t, 9.2, 9.3));
      despeje.construir(t, 9.3, { escalon: 0.05 });
    };
  },
};

/*
 * Simple frente a compuesta: recta y curva con el mismo capital y el mismo tipo. Se cortan en
 * n = 1: antes del año la recta (simple) va por encima; después, la curva (compuesta).
 * La gráfica usa un tipo alto (40 %) solo para que se vea la forma; las cifras reales son las del
 * caso práctico 20 (5.000 € al 3 % durante 195 días).
 */
export const escenaComparacion: Escena = {
  id: 'compuesta-comparacion',
  titulo: 'Simple frente a compuesta según el plazo',
  duracion: 16.5,
  descripcion: 'La recta de simple y la curva de compuesta se cortan en n = 1. Con menos de un año, simple da más (caso práctico 20: 5.080,14 € frente a 5.079,59 €); con más de un año, compuesta.',
  capitulos: [
    { t: 0, texto: 'Mismo capital y mismo tipo: ¿qué da más, simple o compuesta? Depende del plazo.' },
    { t: 2.8, texto: 'Simple crece en línea recta, $C_0 · (1 + n · i)$; compuesta, en curva, $C_0 · (1 + i)^n$.' },
    { t: 6.4, texto: 'Antes del año la recta va por encima: con menos de un año, simple da más.' },
    { t: 9.4, texto: 'En $n$ = 1 dan lo mismo. Después gana la compuesta, y la diferencia crece cada año.' },
    { t: 12.4, texto: 'Caso práctico 20: 5.000 € al 3 % durante 195 días. Simple: 5.080,14 €. Compuesta: 5.079,59 €.' },
  ],
  montar(l) {
    const I = 0.4;
    const g = new Grafico(l, { x0: 110, y0: 470, x1: 610, y1: 150, xmin: 0, xmax: 2.2, ymin: 1, ymax: 2.1 });
    const recta = g.linea('mo-curva s-c0');
    const curva = g.linea('mo-curva s-cn');
    const corte = l.el('circle', { r: 8, class: 'mo-punto s-n' }, g.g);
    const zona = l.el('rect', { class: 'mo-zona s-c0' }, g.g);
    const zona2 = l.el('rect', { class: 'mo-zona s-cn' }, g.g);
    const marcas = [0, 0.5, 1, 1.5, 2].map((k) => new Rotulo(l, k === 1 ? '1 año' : String(k).replace('.', ','), 'mo-eje-texto', 'middle'));
    const etRecta = new Etiqueta(l, 'C_0 · (1 + n · i)', 20, 'izquierda');
    const etCurva = new Etiqueta(l, 'C_0 · (1 + i)^n', 20, 'izquierda');
    const etAntes = new Rotulo(l, 'SIMPLE DA MÁS', 'mo-rotulo-claro', 'middle');
    const etDespues = new Rotulo(l, 'COMPUESTA DA MÁS', 'mo-rotulo-claro', 'middle');
    const aviso = new Rotulo(l, 'Gráfica con un tipo del 40 % para que se vea la forma', 'mo-rotulo', 'start');
    const caso1 = l.formula('C_n "simple" = "5.080,14 €"', { x: 360, y: 84, tam: 28 });
    const caso2 = l.formula('C_n "compuesta" = "5.079,59 €"', { x: 360, y: 134, tam: 28 });
    return (t) => {
      const zoom = tramo(t, 6.4, 7.4) * (1 - tramo(t, 9.2, 10.2));
      l.camara(mezclar(360, g.px(0.5), zoom), mezclar(310, g.py(1.25), zoom), mezclar(1, 2.1, zoom));
      l.foco(360, 320, 340);
      g.pintar(tramo(t, 0, 0.8));
      marcas.forEach((m, k) => m.pintar(g.px([0, 0.5, 1, 1.5, 2][k]!), g.op.y0 + 30, tramo(t, 0.3, 0.9) * (1 - zoom)));
      fijar(recta, { d: g.camino((x) => 1 + x * I, 0, 2.2, tramo(t, 3.0, 4.6, curvas.lineal), 2), opacity: tramo(t, 3.0, 3.1) });
      fijar(curva, { d: g.camino((x) => (1 + I) ** x, 0, 2.2, tramo(t, 4.2, 5.8, curvas.lineal)), opacity: tramo(t, 4.2, 4.3) });
      etRecta.pintar(g.px(2.2) - 150, g.py(1 + 2.2 * I) + 34, tramo(t, 4.2, 4.8) * (1 - zoom));
      etCurva.pintar(g.px(1.75) - 170, g.py(1.4 ** 1.75) - 26, tramo(t, 5.6, 6.2) * (1 - zoom));
      fijar(zona, { x: g.px(0), y: g.op.y1, width: g.px(1) - g.px(0), height: g.op.y0 - g.op.y1, opacity: ventana(t, 6.6, 9.6) * 0.18 });
      fijar(zona2, { x: g.px(1), y: g.op.y1, width: g.px(2.2) - g.px(1), height: g.op.y0 - g.op.y1, opacity: tramo(t, 10.2, 10.8) * 0.16 });
      etAntes.pintar(g.px(0.5), g.py(1.33), ventana(t, 7.0, 9.6) * zoom, undefined);
      etDespues.pintar(g.px(1.65), g.py(1.12), tramo(t, 10.4, 11.0));
      fijar(corte, { cx: g.px(1), cy: g.py(1 + I), opacity: tramo(t, 9.6, 10.0) });
      aviso.pintar(g.op.x0, g.op.y0 + 70, tramo(t, 3.4, 4.0) * (1 - zoom));
      caso1.opacidad(tramo(t, 12.6, 12.7));
      caso1.construir(t, 12.7, { origenes: { C_n: l.aPantalla({ x: g.px(0.5), y: g.py(1.2) }) } });
      caso2.opacidad(tramo(t, 13.4, 13.5));
      caso2.construir(t, 13.5, { origenes: { C_n: l.aPantalla({ x: g.px(0.5), y: g.py(1.18) }) } });
    };
  },
};

/*
 * TIN y TAE · TAE = (1 + Jₘ / m)ᵐ − 1   (caso práctico 24: 10.000 € al 12 % TIN mensual)
 * El TIN se reparte entre las m capitalizaciones; al acumularse, lo que rinde de verdad en un año
 * es la TAE. Con una comisión de reembolso, la TAE real baja: 10,99 %.
 */
export const escenaTae: Escena = {
  id: 'compuesta-tae',
  titulo: 'TIN y TAE',
  duracion: 17,
  descripcion: 'Caso práctico 24: TIN del 12 % con capitalización mensual: 1 % al mes durante 12 meses lleva 10.000 € a 11.268,25 € (TAE 12,68 %). Con una comisión de reembolso del 1,5 % se reciben 11.099,23 €: TAE real 10,99 %.',
  capitulos: [
    { t: 0, texto: 'El TIN ($J_m$) es un tipo nominal anual: se reparte entre las $m$ capitalizaciones del año.' },
    { t: 3.0, texto: 'TIN del 12 % con capitalización mensual: $i_m = \\frac{J_m}{m}$ = 12 % / 12 = 1 % al mes.' },
    { t: 5.8, texto: 'Doce capitalizaciones del 1 %: 10.000 € se convierten en 11.268,25 €.' },
    { t: 9.4, texto: 'Lo que rinde de verdad en un año es la TAE: $TAE = (1 + \\frac{J_m}{m})^m - 1$ = 12,68 %.' },
    { t: 12.6, texto: 'Caso práctico 24: con una comisión de reembolso del 1,5 % recibes 11.099,23 €. TAE real: 10,99 %.' },
  ],
  montar(l) {
    const C0 = 10_000;
    const X0 = 110;
    const PASO = 38;
    const BASE = 470;
    const ESC = 0.019;
    const cap = (k: number) => C0 * 1.01 ** k;
    const tin = new Capsula(l, { clase: 's-i', ancho: 300, relleno: 0.4 });
    const trozosTin = Array.from({ length: 12 }, () => new Capsula(l, { clase: 's-i', ancho: 22, relleno: 0.4 }));
    const etTin = new Etiqueta(l, 'J_m = "12 %"', 26);
    const etIm = new Etiqueta(l, 'i_m = "1 % al mes"', 20, 'izquierda');
    const columnas = Array.from({ length: 13 }, (_, k) => new Capsula(l, { clase: k === 0 ? 's-c0' : 's-cn', ancho: 26, relleno: k === 0 || k === 12 ? 0.4 : 0.2 }));
    const comision = new Capsula(l, { clase: 's-D', ancho: 26, relleno: 0.5 });
    const etFinal = new Rotulo(l, '11.268,25 €', 'mo-cifra mo-cifra-peq s-cn', 'end');
    const etComision = new Rotulo(l, 'tras la comisión: 11.099,23 €', 'mo-cifra mo-cifra-peq s-D', 'end');
    const etInicio = new Rotulo(l, '10.000 €', 'mo-cifra mo-cifra-peq s-c0', 'start');
    const formula = l.formula('TAE = (1 + \\frac{J_m}{m})^m - 1', { x: 360, y: 92, tam: 40 });
    const sust = l.formula('TAE = 1,01^{12} - 1 = "12,68 %"', { x: 360, y: 168, tam: 26 });
    const real = l.formula('TAE "real" = \\frac{11.099,23}{10.000} - 1 = "10,99 %"', { x: 360, y: 168, tam: 24 });
    return (t) => {
      l.camara(360, 300, 1);
      l.foco(360, 300, 340);
      // El TIN, una tira rosa que se corta en 12.
      const corte = tramo(t, 3.2, 4.2, curvas.suave);
      const fuera = 1 - tramo(t, 5.6, 6.0);
      tin.pintar(360, 240, 34, tramo(t, 0.3, 0.8) * (1 - tramo(t, 3.1, 3.2)), 300);
      trozosTin.forEach((tr, k) => {
        const x = mezclar(210 + 25 * (k + 0.5), 210 + 27 * (k + 0.5) - 12, corte);
        tr.pintar(x, 240, 34, tramo(t, 3.1, 3.2) * fuera, mezclar(25, 20, corte));
      });
      etTin.pintar(360, 190, tramo(t, 0.6, 1.2) * fuera);
      etIm.pintar(530, 230, tramo(t, 4.0, 4.6) * fuera);
      // Doce capitalizaciones: cada mes, ×1,01 sobre lo que hay.
      columnas.forEach((c, k) => {
        const t0 = k === 0 ? 5.8 : 6.0 + k * 0.24;
        c.pintar(X0 + k * PASO, BASE, cap(k) * ESC * tramo(t, t0, t0 + 0.4, curvas.salida), tramo(t, t0, t0 + 0.1) * (k > 0 && k < 12 ? mezclar(1, 0.55, tramo(t, 9.4, 9.8)) : 1));
      });
      etInicio.pintar(X0 - 10, BASE + 30, tramo(t, 6.0, 6.4));
      etFinal.pintar(X0 + 12 * PASO + 20, BASE - cap(12) * ESC - 16, tramo(t, 9.0, 9.4) * (1 - tramo(t, 12.8, 13.2)));
      const pc = tramo(t, 13.0, 13.8);
      comision.pintar(X0 + 12 * PASO, BASE - cap(12) * ESC * (1 - 0.015 * pc), cap(12) * ESC * 0.015 * pc, pc);
      etComision.pintar(X0 + 12 * PASO + 20, BASE - cap(12) * ESC - 16, tramo(t, 13.4, 13.9));
      formula.opacidad(tramo(t, 9.6, 9.7));
      formula.construir(t, 9.7, { origenes: { TAE: l.aPantalla({ x: X0 + 12 * PASO, y: BASE - cap(12) * ESC - 20 }), J_m: { x: 360, y: 190 }, m: { x: 360, y: 240 } } });
      sust.opacidad(tramo(t, 11.0, 11.1) * (1 - tramo(t, 12.6, 12.9)));
      sust.construir(t, 11.1, { escalon: 0.04 });
      real.opacidad(tramo(t, 14.2, 14.3));
      real.construir(t, 14.3, { escalon: 0.04 });
    };
  },
};
