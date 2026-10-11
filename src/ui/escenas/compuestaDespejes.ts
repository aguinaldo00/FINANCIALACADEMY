import type { Escena } from '../motion/reproductor.ts';
import { Capsula, Eje, Etiqueta, Grafico, Guia, Llave, Rotulo, Salto, suelo } from '../motion/motivos.ts';
import { fijar } from '../motion/lienzo.ts';
import { claves, curvas, mezclar, retener, tramo, ventana } from '../motion/tiempo.ts';

const fmt = (v: number, d = 2) => new Intl.NumberFormat('de-DE', { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);

/*
 * Compuesta · I = Cₙ − C₀ = C₀ · [(1 + i)ⁿ − 1]   (caso práctico 15: 4.500 € al 3 % durante 7 años)
 * Siete escalones de × 1,03 llevan la semilla a 5.534,43 €. Medido en semillas, el montante es el
 * factor (1 + i)ⁿ = 1,2299 y los intereses son lo que pasa de 1: 0,2299 semillas.
 */
export const escenaInteresesCompuesta: Escena = {
  id: 'compuesta-intereses',
  titulo: 'Intereses totales en capitalización compuesta',
  duracion: 16.8,
  descripcion: 'Caso práctico 15: 4.500 € al 3 % durante 7 años llegan a 5.534,43 €. Los intereses son 1.034,43 €: I = Cₙ − C₀ = C₀ · [(1 + i)ⁿ − 1].',
  capitulos: [
    { t: 0, texto: 'Caso práctico 15: 4.500 € al 3 % de interés compuesto durante 7 años.' },
    { t: 3.0, texto: 'Siete multiplicaciones por 1,03: $C_n$ = 4.500 · 1,03⁷ = 5.534,43 €.' },
    { t: 6.0, texto: 'Los intereses son lo que hay por encima de la semilla: $I = C_n - C_0$ = 1.034,43 €.' },
    { t: 9, lectura: 12.1, texto: 'Medido en semillas, el montante es $(1 + i)^n$ = 1,2299; los intereses, lo que pasa de 1: 0,2299.' },
    { t: 12.2, texto: 'Por eso $I = C_0 · [(1 + i)^n - 1]$: el factor de capitalización menos la semilla.' },
  ],
  montar(l) {
    const C0 = 4500;
    const TIPO = 0.03;
    const N = 7;
    const SUELO = 470;
    const X0 = 110;
    const PASO = 66;
    const ESC = 0.05;
    const ANCHO = 40;
    const cap = (k: number) => C0 * (1 + TIPO) ** k;
    suelo(l, SUELO);
    const eje = new Eje(l, { x0: X0, paso: PASO, y: SUELO, periodos: N, unidad: 'años' });
    const columnas = Array.from({ length: N + 1 }, (_, k) => new Capsula(l, { clase: k === 0 ? 's-c0' : 's-cn', ancho: ANCHO, relleno: 0.4 }));
    const semillaFinal = new Capsula(l, { clase: 's-c0', ancho: ANCHO, relleno: 0.3 });
    const interes = new Capsula(l, { clase: 's-I', ancho: ANCHO, relleno: 0.5 });
    const guia = new Guia(l, 'mo-guia s-c0');
    const llave1 = new Llave(l, 's-c0');
    const llave2 = new Llave(l, 's-I');
    const saltos = Array.from({ length: N }, (_, k) => new Salto(l, 's-i', k === 0 ? '×1,03' : ''));
    const etC0 = new Etiqueta(l, 'C_0 = "4.500 €"', 20);
    const etCn = new Etiqueta(l, 'C_n = "5.534,43 €"', 22);
    const etI = new Etiqueta(l, 'I = "1.034,43 €"', 20, 'derecha');
    const etUno = new Rotulo(l, '1 semilla', 'mo-cifra mo-cifra-peq s-c0', 'end');
    const etFactor = new Etiqueta(l, '(1 + i)^n = "1,2299"', 20, 'derecha');
    const etResto = new Etiqueta(l, '(1 + i)^n - 1 = "0,2299"', 18, 'derecha');

    const l1 = l.formula('I = C_n - C_0', { x: 360, y: 70, tam: 32 });
    const l2 = l.formula('I = C_0 · (1 + i)^n - C_0', { x: 360, y: 126, tam: 32 });
    const l3 = l.formula('I = C_0 · [(1 + i)^n - 1]', { x: 360, y: 190, tam: 42 });

    return (t) => {
      const xN = X0 + N * PASO;
      l.camara(claves(t, [[0, 360], [6, 360], [7.4, 470], [12, 470], [13.2, 360]]), claves(t, [[0, 340], [6, 340], [7.4, 330], [12, 330], [13.2, 230]]), claves(t, [[0, 1.0], [6, 1.0], [7.4, 1.5], [12, 1.5], [13.2, 0.9]]));
      l.foco(claves(t, [[0, 140], [3, 400], [6, 560], [13, 360]]), 320, 300);
      eje.pintar(tramo(t, 0, 0.8));
      columnas.forEach((c, k) => {
        const t0 = k === 0 ? 0.3 : 3.0 + (k - 1) * 0.36;
        c.pintar(eje.x(k), SUELO, cap(k) * ESC * tramo(t, t0, t0 + 0.5, curvas.salida), tramo(t, t0, t0 + 0.2) * (k > 0 && k < N ? 1 - 0.55 * tramo(t, 6, 6.6) : 1));
        if (k > 0) saltos[k - 1]!.pintar({ x: eje.x(k - 1) + 6, y: SUELO - cap(k - 1) * ESC - 6 }, { x: eje.x(k) - 6, y: SUELO - cap(k) * ESC - 6 }, tramo(t, t0 - 0.05, t0 + 0.45), 1 - tramo(t, 6, 6.6), 22);
      });
      etC0.pintar(X0, SUELO - C0 * ESC - 18, tramo(t, 0.8, 1.4) * (1 - tramo(t, 6, 6.4)));
      etCn.pintar(xN - 30, SUELO - cap(N) * ESC - 20, tramo(t, 5.4, 5.8));

      // La semilla se superpone a la última columna: lo que sobresale son los intereses.
      const pS = tramo(t, 6.2, 7.2, curvas.suave);
      semillaFinal.pintar(mezclar(X0, xN, pS), SUELO, C0 * ESC, ventana(t, 6.2, 18, 0.3));
      guia.pintar(X0, SUELO - C0 * ESC, xN, SUELO - C0 * ESC, tramo(t, 6.4, 7.2), 1 - tramo(t, 9.0, 9.4));
      interes.pintar(xN, SUELO - C0 * ESC, (cap(N) - C0) * ESC, tramo(t, 7.2, 7.6));
      const xl = xN - ANCHO / 2 - 10;
      llave1.vertical(SUELO, SUELO - C0 * ESC, xl, -12, tramo(t, 9.2, 9.7));
      llave2.vertical(SUELO - C0 * ESC, SUELO - cap(N) * ESC, xl, -10, tramo(t, 7.4, 7.9));
      etI.pintar(xl - 20, SUELO - C0 * ESC - ((cap(N) - C0) * ESC) / 2 + 6, tramo(t, 7.6, 8.1) * (1 - tramo(t, 9.0, 9.4)));
      etResto.pintar(xl - 20, SUELO - C0 * ESC - ((cap(N) - C0) * ESC) / 2 + 6, tramo(t, 9.6, 10.1));
      etUno.pintar(xl - 20, SUELO - (C0 * ESC) / 2 + 6, tramo(t, 9.3, 9.8));
      etFactor.pintar(xN + 90, SUELO - cap(N) * ESC - 44, tramo(t, 10.2, 10.8) * (1 - tramo(t, 12.2, 12.6)));

      l1.opacidad(tramo(t, 12.3, 12.4) * mezclar(1, 0.45, tramo(t, 13.2, 13.6)));
      l1.construir(t, 12.4, { origenes: { I: l.aPantalla({ x: xl - 80, y: SUELO - C0 * ESC - 30 }), C_n: l.aPantalla({ x: xN - 30, y: SUELO - cap(N) * ESC - 26 }), C_0: l.aPantalla({ x: xl - 60, y: SUELO - (C0 * ESC) / 2 }) } });
      const c = (f: typeof l1, k: string, v = 0) => { const p = f.pieza(k, v); return p ? f.centro(p) : undefined; };
      l2.opacidad(tramo(t, 13.1, 13.2) * mezclar(1, 0.45, tramo(t, 14.2, 14.6)));
      l2.construir(t, 13.2, { origenes: { I: c(l1, 'I'), C_0: [c(l1, 'C_n'), c(l1, 'C_0')], i: c(l1, 'C_n'), n: c(l1, 'C_n') } });
      l3.opacidad(tramo(t, 14.1, 14.2));
      l3.construir(t, 14.2, { origenes: { I: c(l2, 'I'), C_0: [c(l2, 'C_0', 1)], i: c(l2, 'i'), n: c(l2, 'n') }, resaltar: ['C_0'] });
    };
  },
};

/*
 * Compuesta · C₀ = Cₙ · (1 + i)⁻ⁿ   (caso del libro: 9.000 € a 8 años al 7 %)
 * Se viaja hacia atrás: cada año es una división entre (1 + i). Ocho divisiones son multiplicar por
 * (1 + i)⁻⁸. La escalera desciende de derecha a izquierda.
 */
export const escenaCapitalInicialCompuesta: Escena = {
  id: 'compuesta-capital-inicial',
  titulo: 'Capital inicial en capitalización compuesta',
  duracion: 17.7,
  descripcion: '9.000 € a 8 años al 7 % compuesto: cada año hacia atrás se divide entre 1,07. Tras ocho divisiones queda C₀ = 9.000 · 1,07⁻⁸ = 5.238,08 €.',
  capitulos: [
    { t: 0, texto: 'Conoces el final: $C_n$ = 9.000 € a 8 años, al 7 % compuesto. ¿Cuánto se invirtió?' },
    { t: 2.8, lectura: 5.45, texto: 'Un año hacia atrás es dividir entre $(1 + i)$: 9.000 / 1,07 = 8.411,21 €.' },
    { t: 5.6, lectura: 9.45, texto: 'Ocho años hacia atrás: ocho divisiones entre 1,07, cada una sobre lo que quedaba.' },
    { t: 9.6, texto: 'Dividir $n$ veces entre $(1 + i)$ es multiplicar por $(1 + i)^{-n}$: $C_0 = C_n · (1 + i)^{-n}$.' },
    { t: 13.7, texto: '$C_0$ = 9.000 · 1,07⁻⁸ = 5.238,08 €. Intereses: 9.000 − 5.238,08 = 3.761,92 €.' },
  ],
  montar(l) {
    const CN = 9000;
    const TIPO = 0.07;
    const N = 8;
    const SUELO = 470;
    const X0 = 96;
    const PASO = 64;
    const ESC = 0.03;
    const ANCHO = 38;
    const atras = (k: number) => CN / (1 + TIPO) ** k; // k años antes del final
    suelo(l, SUELO);
    const eje = new Eje(l, { x0: X0, paso: PASO, y: SUELO, periodos: N, unidad: 'años' });
    const columnas = Array.from({ length: N + 1 }, (_, k) => new Capsula(l, { clase: k === 0 ? 's-cn' : k === N ? 's-c0' : 's-c0', ancho: ANCHO, relleno: 0.4 }));
    const saltos = Array.from({ length: N }, (_, k) => new Salto(l, 's-i', k === 0 ? '÷1,07' : ''));
    const etCn = new Etiqueta(l, 'C_n = "9.000 €"', 22);
    const etPrimera = new Rotulo(l, `${fmt(atras(1))} €`, 'mo-cifra mo-cifra-peq s-c0');
    const etC0 = new Etiqueta(l, 'C_0 = "5.238,08 €"', 22);
    const etCuenta = new Rotulo(l, '', 'mo-cifra s-n', 'middle');
    const formula = l.formula('C_0 = C_n · (1 + i)^{-n}', { x: 360, y: 92, tam: 46 });
    const alt = l.formula('C_0 = \\frac{C_n}{(1 + i)^n}', { x: 360, y: 176, tam: 30 });
    const sust = l.formula('C_0 = 9.000 · 1,07^{-8} = "5.238,08 €"', { x: 360, y: 562, tam: 24 });

    return (tReal) => {
      // Retenciones: lo que acaba tarde termina mientras el resto espera (ver retener en tiempo.ts).
      const t = retener(tReal, 13, 0.7);
      const xDe = (k: number) => eje.x(N - k); // k años antes del final
      l.camara(claves(t, [[0, 520], [2.8, 520], [5.6, 420], [9.4, 300], [10, 360]]), claves(t, [[0, 340], [9.4, 340], [10.2, 300]]), claves(t, [[0, 1.4], [2.8, 1.4], [5.6, 1.15], [9.4, 1.0], [10.2, 0.95]]));
      l.foco(claves(t, [[0, 600], [5.6, 420], [9.6, 140], [11, 360]]), 330, 300);
      eje.pintar(1, tramo(t, 0, 0.6));
      columnas.forEach((c, k) => {
        // Columna k: valor k años antes del final (k = 0 es Cₙ).
        const t0 = k === 0 ? 0.2 : k === 1 ? 3.2 : 5.8 + (k - 2) * 0.55;
        const p = tramo(t, t0, t0 + 0.6, curvas.salida);
        c.pintar(xDe(k), SUELO, atras(k) * ESC * mezclar(k ? 1.07 : 0.6, 1, p), tramo(t, t0, t0 + 0.2) * (k > 1 && k < N ? 1 - 0.4 * tramo(t, 9.6, 10) : 1));
        if (k > 0) saltos[k - 1]!.pintar({ x: xDe(k - 1) - 6, y: SUELO - atras(k - 1) * ESC - 6 }, { x: xDe(k) + 6, y: SUELO - atras(k) * ESC - 6 }, tramo(t, t0 - 0.3, t0 + 0.2), 1 - 0.6 * tramo(t, 9.6, 10), 26);
      });
      etCn.pintar(xDe(0), SUELO - CN * ESC - 22, tramo(t, 0.6, 1.2));
      etPrimera.pintar(xDe(1), SUELO - atras(1) * ESC - 40, ventana(t, 3.6, 5.8));
      const cuenta = Math.max(0, Math.min(N, t < 3.2 ? 0 : t < 5.8 ? 1 : 2 + Math.floor((t - 5.8) / 0.55)));
      etCuenta.pintar(360, 560, ventana(t, 3.4, 9.8), `${cuenta} ${cuenta === 1 ? 'división' : 'divisiones'} entre 1,07`);
      etC0.pintar(xDe(N), SUELO - atras(N) * ESC - 22, tramo(t, 9.6, 10.2));

      formula.opacidad(tramo(t, 9.8, 9.9));
      formula.construir(tReal, 9.9, {
        origenes: { C_0: l.aPantalla({ x: xDe(N), y: SUELO - atras(N) * ESC - 30 }), C_n: l.aPantalla({ x: xDe(0), y: SUELO - CN * ESC - 30 }), i: l.aPantalla({ x: xDe(3), y: SUELO - atras(3) * ESC - 40 }), n: { x: 360, y: 552 } },
        resaltar: ['n'],
      });
      alt.opacidad(tramo(t, 11.6, 11.7) * 0.75);
      alt.construir(tReal, 11.7, { escalon: 0.05 });
      sust.opacidad(tramo(t, 13.2, 13.3));
      sust.construir(t, 13.3, { escalon: 0.04 });
    };
  },
};

/*
 * Compuesta · n = log(Cₙ / C₀) / log(1 + i)   (caso práctico 17: 30.000 € → 35.000 € al 10 %)
 * La meta es crecer 1,1667 veces y cada año multiplica por 1,1. En una escala normal los escalones
 * crecen; con logaritmos, multiplicar se convierte en sumar y todos los escalones miden lo mismo.
 * Entonces basta dividir alturas: 1,62 escalones.
 */
export const escenaTiempoCompuesta: Escena = {
  id: 'compuesta-tiempo',
  titulo: 'Tiempo en capitalización compuesta',
  duracion: 18.7,
  descripcion: 'Caso práctico 17: 30.000 € al 10 % hasta 35.000 €. En escala logarítmica cada año sube log 1,1; la meta está a log 1,1667: n = 1,62 años = 1 año, 7 meses y 13 días.',
  capitulos: [
    { t: 0, texto: 'Caso práctico 17: 30.000 € al 10 % compuesto hasta 35.000 €. Hay que crecer 35.000 / 30.000 = 1,1667 veces.' },
    { t: 3, texto: 'Cada año multiplica por 1,1: tras un año, ×1,1; tras dos, ×1,21. La meta queda entre los dos.' },
    { t: 6.6, lectura: 9.6, texto: 'Con logaritmos, multiplicar se convierte en sumar: cada año sube lo mismo, log 1,1.' },
    { t: 10, texto: '¿Cuántos escalones de log 1,1 caben hasta log 1,1667? $n = \\frac{log(C_n / C_0)}{log(1 + i)}$ = 1,62.' },
    { t: 14.5, texto: '1,62 años = 1 año, 7 meses y 13 días (0,62 · 12 = 7,44 meses; 0,44 · 30 = 13 días).' },
  ],
  montar(l) {
    const META = 35000 / 30000;
    const n = Math.log10(META) / Math.log10(1.1);
    const g = new Grafico(l, { x0: 120, y0: 470, x1: 600, y1: 150, xmin: 0, xmax: 2.25, ymin: 1, ymax: 1.24 });
    const curva = g.linea('mo-curva s-cn');
    const meta = g.linea('mo-curva-fina');
    const escalones = Array.from({ length: 2 }, () => g.linea('mo-curva s-i'));
    const puntos = Array.from({ length: 3 }, () => l.el('circle', { r: 7, class: 'mo-punto s-cn' }, g.g));
    const corte = l.el('circle', { r: 8, class: 'mo-punto s-n' }, g.g);
    const bajada = g.linea('mo-curva-fina');
    const etMeta = new Etiqueta(l, '\\frac{C_n}{C_0} = "1,1667"', 20, 'izquierda');
    const etPuntos = ['×1', '×1,1', '×1,21'].map((txt) => new Rotulo(l, txt, 'mo-cifra mo-cifra-peq', 'start'));
    const etEscala = new Rotulo(l, '', 'mo-rotulo-claro', 'start');
    const etPaso = new Rotulo(l, 'log 1,1 = 0,0414', 'mo-cifra mo-cifra-peq s-i', 'start');
    const etAltura = new Rotulo(l, 'log 1,1667 = 0,0669', 'mo-cifra mo-cifra-peq s-cn', 'start');
    const etN = new Rotulo(l, 'n = 1,62', 'mo-cifra s-n', 'middle');
    const marcas = [0, 1, 2].map((k) => new Rotulo(l, `${k} ${k === 1 ? 'año' : 'años'}`, 'mo-eje-texto', 'middle'));
    const formula = l.formula('n = \\frac{log(C_n / C_0)}{log(1 + i)}', { x: 360, y: 92, tam: 40 });
    const sust = l.formula('n = \\frac{log 1,1667}{log 1,1} = "1,62 años"', { x: 360, y: 548, tam: 24 });

    return (tReal) => {
      // Retenciones: lo que acaba tarde termina mientras el resto espera (ver retener en tiempo.ts).
      const t = retener(tReal, 13.8, 0.7);
      l.camara(360, claves(t, [[0, 300], [10, 300], [11, 330]]), claves(t, [[0, 1], [10, 1], [11, 0.92]]));
      l.foco(360, 320, 320);
      // Mezcla de escala normal (0) a logarítmica (1): las alturas de los escalones se igualan.
      const lg = tramo(t, 6.8, 8.6, curvas.suave);
      const mapa = (y: number) => {
        const lineal = g.py(y);
        const logaritmica = mezclar(g.op.y0, g.op.y1, Math.log(y) / Math.log(1.24));
        return mezclar(lineal, logaritmica, lg);
      };
      g.pintar(tramo(t, 0, 0.8));
      const valor = (x: number) => 1.1 ** x;
      fijar(curva, { d: g.camino(valor, 0, 2.25, tramo(t, 3.0, 5.6, curvas.lineal), 90, mapa), opacity: tramo(t, 3.0, 3.2) });
      fijar(meta, { d: `M${g.px(0)} ${mapa(META)} L${g.px(2.25)} ${mapa(META)}`, opacity: tramo(t, 1.0, 1.6) });
      etMeta.pintar(g.px(2.25) - 140, mapa(META) - 16, tramo(t, 1.2, 1.8));
      [0, 1, 2].forEach((k) => {
        const visible = k === 0 ? tramo(t, 3.0, 3.3) : tramo(t, 3.0 + k * 1.2, 3.3 + k * 1.2);
        fijar(puntos[k]!, { cx: g.px(k), cy: mapa(valor(k)), opacity: visible });
        etPuntos[k]!.pintar(g.px(k) + 12, mapa(valor(k)) - 12, visible * (1 - tramo(t, 9.6, 10)));
        marcas[k]!.pintar(g.px(k), g.op.y0 + 30, tramo(t, 0.4, 1.0));
      });
      // Escalones de un año: verticales rosas de igual altura en escala logarítmica.
      escalones.forEach((e, k) => {
        fijar(e, { d: `M${g.px(k + 1)} ${mapa(valor(k))} L${g.px(k + 1)} ${mapa(valor(k + 1))}`, opacity: tramo(t, 8.6 + k * 0.4, 9.0 + k * 0.4) });
      });
      etEscala.pintar(g.op.x0 + 14, g.op.y1 + 26, ventana(t, 6.8, 13.6), lg > 0.5 ? 'ESCALA LOGARÍTMICA' : 'ESCALA NORMAL');
      etPaso.pintar(g.px(1) + 10, (mapa(1) + mapa(1.1)) / 2 + 8, ventana(t, 9.0, 13.6));
      etAltura.pintar(g.px(0) + 10, mapa(META) + 30, ventana(t, 10.4, 13.6));
      // Donde la curva corta la meta: n.
      const pc = tramo(t, 10.8, 11.6);
      fijar(corte, { cx: g.px(n), cy: mapa(META), opacity: pc });
      fijar(bajada, { d: `M${g.px(n)} ${mapa(META)} L${g.px(n)} ${g.op.y0}`, opacity: pc });
      formula.opacidad(tramo(t, 10.4, 10.5));
      formula.construir(tReal, 10.5, { origenes: { n: l.aPantalla({ x: g.px(n), y: g.op.y0 + 50 }), C_n: l.aPantalla({ x: g.px(2.25) - 110, y: mapa(META) - 20 }), C_0: l.aPantalla({ x: g.px(2.25) - 110, y: mapa(META) - 10 }), i: l.aPantalla({ x: g.px(1) + 40, y: mapa(1.05) }) } });
      sust.opacidad(tramo(t, 12.4, 12.5));
      sust.construir(t, 12.5, { escalon: 0.04 });
      if (t >= 13.8) etN.pintar(g.px(n), g.op.y0 + 58, 1, '1 año, 7 meses y 13 días');
      else etN.pintar(g.px(n), g.op.y0 + 58, tramo(t, 11.2, 11.8), 'n = 1,62');
    };
  },
};

/*
 * Compuesta · i = (Cₙ / C₀)^(1/n) − 1   (50.000 € → 52.000 € en 6 años)
 * El crecimiento total, ×1,04, se reparte en 6 factores iguales. En escala logarítmica son 6
 * escalones iguales; cada uno es ×1,006558. Repartir un producto en partes iguales es la raíz.
 */
export const escenaTipoCompuesta: Escena = {
  id: 'compuesta-tipo',
  titulo: 'Tipo de interés en capitalización compuesta',
  duracion: 15,
  descripcion: '50.000 € se convierten en 52.000 € en 6 años: el factor total 1,04 se reparte en 6 factores iguales de 1,006558. i = (Cₙ / C₀)^(1/n) − 1 = 0,006558.',
  capitulos: [
    { t: 0, texto: '50.000 € se convierten en 52.000 € en 6 años, en compuesta. Han crecido 52.000 / 50.000 = 1,04 veces.' },
    { t: 3.2, texto: 'Ese 1,04 es el producto de 6 factores iguales: $(1 + i)^6$ = 1,04.' },
    { t: 6.6, lectura: 9.65, texto: 'Repartir un producto en partes iguales es hacer la raíz: 1 + $i$ = 1,04^(1/6) = 1,006558.' },
    { t: 10.2, texto: '$i = (\\frac{C_n}{C_0})^{1/n} - 1$ = 0,006558, un 0,66 % anual. Raíz de índice $n$, no cuadrada.' },
  ],
  montar(l) {
    const N = 6;
    const X0 = 140;
    const X1 = 580;
    const Y0 = 420;
    const ALTO = 250; // altura de log 1,04
    const barra = new Capsula(l, { clase: 's-cn', ancho: 70, relleno: 0.4 });
    const trozos = Array.from({ length: N }, () => new Capsula(l, { clase: 's-i', ancho: 70, relleno: 0.4 }));
    const saltos = Array.from({ length: N }, () => new Salto(l, 's-i', '×1,006558'));
    const etTotal = new Rotulo(l, '×1,04', 'mo-cifra s-cn', 'start');
    const etPartes = new Rotulo(l, 'ESCALA LOGARÍTMICA · 6 escalones iguales', 'mo-rotulo-claro', 'start');
    const etIgual = new Rotulo(l, '(1 + i)⁶ = 1,04', 'mo-cifra mo-cifra-peq s-i', 'start');
    const etRaiz = new Rotulo(l, '1 + i = 1,04^(1/6) = 1,006558', 'mo-cifra mo-cifra-peq s-i', 'start');
    const eje = new Eje(l, { x0: X0, paso: (X1 - X0) / N, y: Y0, periodos: N, unidad: 'años' });
    const formula = l.formula('i = (\\frac{C_n}{C_0})^{1/n} - 1', { x: 360, y: 100, tam: 42 });
    const sust = l.formula('i = 1,04^{1/6} - 1 = "0,006558"', { x: 360, y: 528, tam: 24 });
    return (t) => {
      l.camara(360, claves(t, [[0, 300], [10, 300], [11, 312]]), claves(t, [[0, 1], [10, 1], [11, 0.94]]));
      l.foco(360, 300, 320);
      eje.pintar(tramo(t, 0, 0.8));
      // La barra del crecimiento total (en escala logarítmica) a la derecha.
      barra.pintar(X1 + 70, Y0, ALTO * tramo(t, 0.6, 1.6, curvas.expo), tramo(t, 0.6, 0.8));
      etTotal.pintar(X1 + 40, Y0 - ALTO - 14, tramo(t, 1.2, 1.8));
      etPartes.pintar(X0, Y0 - ALTO - 30, ventana(t, 3.4, 10.0));
      trozos.forEach((tr, k) => {
        const t0 = 3.6 + k * 0.4;
        const p = tramo(t, t0, t0 + 0.8, curvas.suave);
        const xk = X0 + ((k + 0.5) * (X1 - X0)) / N;
        const baseFin = Y0 - (k * ALTO) / N;
        const x = mezclar(X1 + 70, xk, p);
        tr.pintar(x, mezclar(Y0 - (k * ALTO) / N, baseFin, p), ALTO / N, tramo(t, t0, t0 + 0.2), 48);
        saltos[k]!.pintar({ x: X0 + (k * (X1 - X0)) / N + 8, y: baseFin + 4 }, { x: X0 + ((k + 1) * (X1 - X0)) / N - 8, y: baseFin - ALTO / N + 4 }, tramo(t, 7.2 + k * 0.25, 7.8 + k * 0.25), 1, 18, k === 0 ? '×1,006558' : '');
      });
      etIgual.pintar(X0, Y0 + 66, ventana(t, 5.4, 10.4));
      etRaiz.pintar(X0, Y0 + 96, tramo(t, 7.4, 8.0));
      formula.opacidad(tramo(t, 10.3, 10.4));
      formula.construir(t, 10.4, { origenes: { C_n: l.aPantalla({ x: X1 + 70, y: Y0 - ALTO - 20 }), C_0: l.aPantalla({ x: X1 + 70, y: Y0 }), n: l.aPantalla({ x: X0 + 200, y: Y0 + 30 }), i: l.aPantalla({ x: X0 + 40, y: Y0 + 90 }) } });
      sust.opacidad(tramo(t, 12.0, 12.1));
      sust.construir(t, 12.1, { escalon: 0.04 });
    };
  },
};
