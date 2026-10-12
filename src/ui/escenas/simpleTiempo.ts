import type { Escena } from '../motion/reproductor.ts';
import { Capsula, Etiqueta, Hueco, Llave, Pulso, Regla, Rotulo, Semilla } from '../motion/motivos.ts';
import { fijar } from '../motion/lienzo.ts';
import { claves, curvas, mezclar, tramo, ventana } from '../motion/tiempo.ts';

/*
 * Fórmula 5 · n = (Cₙ − C₀) / (i · C₀)   (caso práctico 13 del libro)
 * Hay que conseguir Cₙ − C₀ = 500 € de intereses y cada año la semilla da C₀ · i = 180 €. ¿Cuántas
 * cosechas caben? 2,78. La parte decimal también es tiempo: se amplía el año a 12 meses y el mes a
 * 30 días, como hace el libro: 2 años, 9 meses y 11 días.
 */

const ESCALA = 0.4; // px por euro en el depósito de intereses
const OBJETIVO = 500;
const COSECHA = 180;
const N = OBJETIVO / COSECHA; // 2,777…
const XD = 450; // depósito
const BASE_D = 262;
const AX0 = 70;
const AX1 = 470;
const Y_ANOS = 330;
const Y_MESES = 432;
const Y_DIAS = 534;

export const escenaTiempoSimple: Escena = {
  id: 'simple-tiempo',
  titulo: 'Tiempo en capitalización simple',
  duracion: 21.5,
  descripcion: '6.000 € al 3 % para llegar a 6.500 €. Hay que reunir 500 € con cosechas de 180 €: caben 2,78. Ampliando, 0,78 años son 9,36 meses y 0,36 meses son 10,8 días: 2 años, 9 meses y 11 días.',
  caso: { C_0: '6.000 €', C_n: '6.500 €', i: '3 %' },
  capitulos: [
    { t: 0, texto: 'Semilla $C_0$ = 6.000 € al $i$ = 3 % anual. Objetivo: $C_n$ = 6.500 €. ¿Cuánto tiempo?' },
    { t: 2.8, texto: 'Hay que reunir $C_n - C_0$ = 500 € de intereses.' },
    { t: 5.2, lectura: 7.55, texto: 'Cada año la semilla da $C_0 · i$ = 6.000 · 0,03 = 180 €.' },
    { t: 7.8, texto: '¿Cuántas cosechas caben? 500 / 180 = 2,78: dos años enteros y 0,78 de otro.' },
    { t: 11.4, texto: 'Los decimales también son tiempo: 0,78 años · 12 = 9,36 meses.' },
    { t: 14.6, lectura: 17.4, texto: 'Y 0,36 meses · 30 = 10,8 días, que se redondean a 11 (se cuentan meses de 30 días).' },
    { t: 17.6, texto: 'Tiempo: $n = \\frac{C_n - C_0}{i · C_0}$ = 2,78 años = 2 años, 9 meses y 11 días.' },
  ],
  montar(l) {
    const semilla = new Semilla(l);
    const etC0 = new Etiqueta(l, 'C_0 = "6.000 €"', 24, 'izquierda');
    const etTipo = new Etiqueta(l, 'i = "3 % anual"', 22, 'izquierda');
    const etCn = new Etiqueta(l, 'C_n = "6.500 €"', 22, 'izquierda');
    const deposito = new Hueco(l, 's-I');
    const etObj = new Etiqueta(l, 'C_n - C_0 = "500 €"', 20, 'centro');
    const pulso = new Pulso(l, 's-c0');
    const unidades = [0, 1, 2].map(() => new Capsula(l, { clase: 's-I', ancho: 90, relleno: 0.42 }));
    const etUnidades = [0, 1, 2].map((k) => new Rotulo(l, k < 2 ? '180 €' : '0,78 · 180 €', 'mo-cifra mo-cifra-peq s-I', 'start'));
    const etUnaCosecha = new Etiqueta(l, 'C_0 · i = "180 €"', 20, 'izquierda');
    const llaveDep = new Llave(l, 's-I');

    const anos = new Regla(l, { x0: AX0, x1: AX1, y: Y_ANOS, divisiones: 3, clase: 's-n', rotulo: (k) => String(k), tamRotulo: 18 });
    const etAnos = new Rotulo(l, 'años', 'mo-eje-unidad', 'start');
    const lecturaAnos = new Rotulo(l, '', 'mo-cifra s-n', 'start');
    const meses = new Regla(l, { x0: AX0, x1: AX1, y: Y_MESES, divisiones: 12, clase: 's-n', rotulo: (k) => (k % 3 === 0 ? String(k) : null), tamRotulo: 15 });
    const etMeses = new Rotulo(l, 'meses del 3.er año', 'mo-rotulo', 'start');
    const lecturaMeses = new Rotulo(l, '', 'mo-cifra s-n', 'start');
    const dias = new Regla(l, { x0: AX0, x1: AX1, y: Y_DIAS, divisiones: 30, clase: 's-n', rotulo: (k) => (k % 5 === 0 ? String(k) : null), tamRotulo: 14 });
    const etDias = new Rotulo(l, 'días del 10.º mes', 'mo-rotulo', 'start');
    const lecturaDias = new Rotulo(l, '', 'mo-cifra s-n', 'start');
    const lupa1 = l.el('path', { class: 'mo-lupa', fill: 'none' });
    const lupa2 = l.el('path', { class: 'mo-lupa', fill: 'none' });

    const formula = l.formula('n = \\frac{C_n - C_0}{i · C_0}', { x: 360, y: 96, tam: 44 });
    const resultado = l.formula('n = "2,78 años = 2 años, 9 meses y 11 días"', { x: 360, y: 182, tam: 22 });

    return (t) => {
      const cx = claves(t, [[0, 330], [18.6, 330]]);
      const cy = claves(t, [[0, 220], [7.8, 240], [11.4, 270], [12.4, 360], [14.6, 360], [15.6, 420], [17.6, 420], [18.6, 360]]);
      const z = claves(t, [[0, 1.12], [7.8, 1.08], [11.4, 1.0], [12.4, 1.1], [14.6, 1.1], [15.6, 1.1], [17.6, 1.1], [18.6, 0.96]]);
      l.camara(cx, cy, z);
      l.foco(claves(t, [[0, 220], [2.8, 520], [7.8, 400], [11.4, 360], [18, 360]]), claves(t, [[0, 220], [11.4, 330], [15, 420], [18.6, 340]]), 300);

      const salida = 1 - tramo(t, 17.2, 18.0);
      semilla.pintar(96, 120, tramo(t, 0.2, 0.9) * salida, mezclar(0.7, 1, tramo(t, 0.2, 0.9, curvas.muelle)));
      etC0.pintar(130, 112, tramo(t, 0.5, 1.1) * salida);
      etTipo.pintar(130, 148, tramo(t, 0.9, 1.5) * salida);
      etCn.pintar(130, 184, tramo(t, 1.3, 1.9) * salida);

      const alto = OBJETIVO * ESCALA;
      deposito.pintar(XD, BASE_D, alto, 96, tramo(t, 3.0, 3.8) * salida, 1 - tramo(t, 8.0, 8.4));
      llaveDep.vertical(BASE_D, BASE_D - alto, XD - 58, -12, 0);
      etObj.pintar(XD, BASE_D - alto - 18, tramo(t, 3.6, 4.2) * salida);

      // Cada año, una cosecha de 180 € sale de la semilla y cae en el depósito.
      const inicios = [5.6, 8.2, 9.4];
      unidades.forEach((u, k) => {
        const t0 = inicios[k]!;
        const parte = k < 2 ? 1 : N - 2;
        const altoU = COSECHA * ESCALA * parte;
        const base = BASE_D - k * COSECHA * ESCALA;
        const p = tramo(t, t0 + 0.6, t0 + 1.2, curvas.salida);
        u.pintar(XD, base, altoU * p, tramo(t, t0 + 0.55, t0 + 0.7) * salida, 90);
        etUnidades[k]!.pintar(XD + 58, base - altoU / 2 + 6, tramo(t, t0 + 1.0, t0 + 1.4) * salida * (k === 0 ? tramo(t, 7.9, 8.2) : 1));
      });
      const pv = tramo(t, 5.6, 6.2, curvas.suave);
      pulso.pintar({ x: mezclar(106, XD, pv), y: mezclar(120, BASE_D - 20, pv) - Math.sin(Math.PI * pv) * 60 }, ventana(t, 5.5, 6.3, 0.1));
      etUnaCosecha.pintar(XD + 58, BASE_D - 30, ventana(t, 6.2, 7.9));

      // Regla de años: avanza con cada cosecha hasta 2,78.
      const avanceAnos = claves(t, [[5.6, 0], [6.8, 1], [8.2, 1], [9.4, 2], [9.4, 2], [10.6, N]], curvas.suave);
      anos.pintar(tramo(t, 5.2, 6.0), tramo(t, 5.2, 6.0), avanceAnos);
      etAnos.pintar(AX1 + 20, Y_ANOS + 30, tramo(t, 5.6, 6.0));
      lecturaAnos.pintar(anos.x(N) - 18, Y_ANOS - 22, tramo(t, 10.4, 10.9), '2,78');

      // Lupa 1: la parte decimal del tercer año se amplía a 12 meses.
      const pL1 = tramo(t, 11.6, 12.4);
      fijar(lupa1, { d: `M${anos.x(2)} ${Y_ANOS + 12} L${AX0} ${Y_MESES - 14} M${anos.x(3)} ${Y_ANOS + 12} L${AX1} ${Y_MESES - 14}`, opacity: pL1 * 0.8 });
      meses.pintar(pL1, tramo(t, 12.0, 12.9), claves(t, [[12.9, 0], [14.0, 9.36]], curvas.suave));
      etMeses.pintar(AX1 + 20, Y_MESES + 5, tramo(t, 12.4, 12.9));
      lecturaMeses.pintar(meses.x(9.36) - 30, Y_MESES - 20, tramo(t, 13.8, 14.2), '9,36');

      // Lupa 2: la parte decimal del mes 10 se amplía a 30 días.
      const pL2 = tramo(t, 14.8, 15.6);
      fijar(lupa2, { d: `M${meses.x(9)} ${Y_MESES + 12} L${AX0} ${Y_DIAS - 14} M${meses.x(10)} ${Y_MESES + 12} L${AX1} ${Y_DIAS - 14}`, opacity: pL2 * 0.8 });
      dias.pintar(pL2, tramo(t, 15.2, 16.0), claves(t, [[16.0, 0], [16.9, 10.8]], curvas.suave));
      etDias.pintar(AX1 + 20, Y_DIAS + 5, tramo(t, 15.6, 16.0));
      lecturaDias.pintar(dias.x(10.8) - 26, Y_DIAS - 20, tramo(t, 16.8, 17.2), '10,8 ≈ 11');

      formula.opacidad(tramo(t, 17.8, 17.9));
      formula.construir(t, 17.9, {
        origenes: {
          n: l.aPantalla({ x: anos.x(N), y: Y_ANOS - 26 }),
          C_n: l.aPantalla({ x: XD - 40, y: BASE_D - alto - 24 }),
          C_0: [l.aPantalla({ x: XD + 10, y: BASE_D - alto - 24 }), l.aPantalla({ x: 150, y: 104 })],
          i: l.aPantalla({ x: 140, y: 140 }),
        },
      });
      resultado.opacidad(tramo(t, 19.3, 19.4));
      resultado.construir(t, 19.4, { escalon: 0.04 });
    };
  },
};
