import type { Escena } from '../motion/reproductor.ts';
import { Capsula, Eje, Etiqueta, Grafico, Guia, Llave, Rotulo, Salto, suelo } from '../motion/motivos.ts';
import { fijar } from '../motion/lienzo.ts';
import { arco, claves, curvas, mezclar, tramo, ventana } from '../motion/tiempo.ts';

/*
 * Descuento: cobrar hoy lo que vence más adelante. El nominal (N, oro) está en el vencimiento; lo
 * que se recibe hoy es el efectivo (E, azul); lo que se queda el banco es el descuento (D, naranja).
 * Los descuentos son pequeños frente al nominal: cuando hace falta se amplían con una lupa
 * rotulada (×20), nunca se dibujan más grandes de lo que son.
 */

/* ------------------------------------------------------------------- descuento comercial simple */
export const escenaDescuentoComercial: Escena = {
  id: 'descuento-comercial',
  titulo: 'Descuento comercial simple',
  duracion: 15,
  descripcion: 'Pagaré de 6.000 € a 45 días al 5 %: el descuento comercial se calcula sobre el nominal, Dc = N · n · d = 37,50 €, y se reciben E = N · (1 − n · d) = 5.962,50 €.',
  caso: { N: '6.000 €', n: '45/360', d: '5 %' },
  capitulos: [
    { t: 0, texto: 'Tienes un pagaré de $N$ = 6.000 € que vence dentro de 45 días. Lo quieres cobrar hoy.' },
    { t: 3.0, texto: 'El banco te lo adelanta, pero se queda un descuento calculado sobre el nominal: $D_c = N · n · d$.' },
    { t: 6.2, texto: 'Con $d$ = 5 % anual y año comercial, $n$ = 45 / 360 = 0,125 años: $D_c$ = 6.000 · 0,125 · 0,05 = 37,50 €.' },
    { t: 10.0, texto: 'Lo que recibes hoy es el efectivo: $E = N - D_c = N · (1 - n · d)$ = 5.962,50 €.' },
  ],
  montar(l) {
    const SUELO = 480;
    const XH = 150;
    const XV = 560;
    const ESC = 0.045;
    const N = 6000;
    const DC = 37.5;
    const AMPL = 20;
    suelo(l, SUELO);
    const eje = new Eje(l, { x0: XH, paso: XV - XH, y: SUELO, periodos: 1, marcas: ['HOY', '45 DÍAS'] });
    const nominal = new Capsula(l, { clase: 's-cn', ancho: 70, relleno: 0.4 });
    const efectivo = new Capsula(l, { clase: 's-c0', ancho: 70, relleno: 0.4 });
    const lupaN = new Capsula(l, { clase: 's-cn', ancho: 150, relleno: 0.4 });
    const lupaD = new Capsula(l, { clase: 's-D', ancho: 150, relleno: 0.5 });
    const marco = l.el('rect', { class: 'mo-lupa-marco' });
    const rayos = l.el('path', { class: 'mo-lupa', fill: 'none' });
    const salto = new Salto(l, 's-c0', 'cobrar hoy');
    const etN = new Etiqueta(l, 'N = "6.000 €"', 24);
    const etLupa = new Rotulo(l, 'AMPLIADO ×20', 'mo-rotulo-claro', 'start');
    const etDc = new Etiqueta(l, 'D_c = "37,50 €"', 22, 'izquierda');
    const etE = new Etiqueta(l, 'E = "5.962,50 €"', 24);
    const formula = l.formula('D_c = N · n · d', { x: 360, y: 86, tam: 44 });
    const efectivoF = l.formula('E = N · (1 - n · d)', { x: 360, y: 156, tam: 32 });
    return (t) => {
      l.camara(360, 300, 1);
      l.foco(claves(t, [[0, 560], [6, 300], [10, 300]]), 300, 340);
      eje.pintar(tramo(t, 0, 0.8));
      const altoN = N * ESC;
      const pd = tramo(t, 10.2, 11.6, curvas.suave);
      nominal.pintar(XV, SUELO, altoN * tramo(t, 0.4, 1.2, curvas.expo), tramo(t, 0.4, 0.6) * (1 - 0.5 * pd));
      etN.pintar(XV, SUELO - altoN - 22, tramo(t, 1.0, 1.6));
      // Lupa: la parte de arriba de N, ampliada veinte veces.
      const pl = ventana(t, 6.4, 10.2, 0.4);
      const yTop = SUELO - altoN;
      const inX0 = 150;
      const inX1 = 380;
      const inY0 = 170;
      const inY1 = 330;
      fijar(marco, { x: inX0, y: inY0, width: inX1 - inX0, height: inY1 - inY0, opacity: pl });
      fijar(rayos, { d: `M${XV - 35} ${yTop} L${inX1} ${inY0} M${XV - 35} ${yTop + 8} L${inX1} ${inY1}`, opacity: pl });
      lupaN.pintar((inX0 + inX1) / 2, inY1, inY1 - inY0 - DC * ESC * AMPL, pl);
      lupaD.pintar((inX0 + inX1) / 2, inY0 + DC * ESC * AMPL, DC * ESC * AMPL * tramo(t, 7.4, 8.0), pl);
      etLupa.pintar(inX0, inY0 - 12, pl);
      etDc.pintar(inX0 + 8, inY0 + DC * ESC * AMPL + 26, pl * tramo(t, 7.8, 8.2));
      // El efectivo viaja a hoy.
      const pos = arco({ x: XV, y: SUELO }, { x: XH, y: SUELO }, pd, 0.16);
      efectivo.pintar(pos.x, pos.y, (N - DC) * ESC, tramo(t, 10.2, 10.4));
      salto.pintar({ x: XV - 40, y: SUELO - altoN - 50 }, { x: XH + 40, y: SUELO - altoN - 50 }, tramo(t, 10.0, 11.0), 1 - tramo(t, 12.0, 12.4), 40);
      etE.pintar(XH, SUELO - (N - DC) * ESC - 22, tramo(t, 11.4, 12.0));
      formula.opacidad(tramo(t, 3.4, 3.5));
      formula.construir(t, 3.5, { origenes: { D_c: { x: 420, y: 140 }, N: l.aPantalla({ x: XV, y: SUELO - altoN - 30 }), n: l.aPantalla({ x: XV, y: SUELO + 30 }), d: { x: 600, y: 180 } } });
      efectivoF.opacidad(tramo(t, 10.6, 10.7));
      efectivoF.construir(t, 10.7, { origenes: { E: l.aPantalla({ x: XH, y: SUELO - (N - DC) * ESC }), N: l.aPantalla({ x: XV, y: SUELO - altoN - 30 }) } });
    };
  },
};

/* -------------------------------------------------------------------- descuento racional simple */
export const escenaDescuentoRacional: Escena = {
  id: 'descuento-racional',
  titulo: 'Descuento racional simple',
  duracion: 15,
  descripcion: 'El descuento racional es la capitalización simple al revés: C₀ = Cₙ / (1 + n · i) y Dr = Cₙ − C₀ = Cₙ · n · i / (1 + n · i). Con el pagaré de 6.000 € a 45 días al 5 %, Dr = 37,27 €, menor que el comercial (37,50 €) porque su base es C₀.',
  caso: { C_n: '6.000 €', n: '45/360', i: '5 %' },
  capitulos: [
    { t: 0, texto: 'Descuento racional: es la capitalización simple al revés. Primero se busca $C_0 = \\frac{C_n}{1 + n · i}$.' },
    { t: 3.4, texto: 'El descuento es lo que separa los dos: $D_r = C_n - C_0 = C_0 · n · i$. Se calcula sobre el efectivo.' },
    { t: 7, lectura: 9.8, texto: 'Sustituyendo $C_0$: $D_r = \\frac{C_n · n · i}{1 + n · i}$.' },
    { t: 10.2, texto: 'Mismo pagaré (6.000 €, 45 días, 5 %): racional 37,27 €, comercial 37,50 €. El comercial es mayor: su base, $N$, es mayor que $C_0$.' },
  ],
  montar(l) {
    const SUELO = 480;
    const ESC = 0.034;
    const CN = 6000;
    const C0 = CN / (1 + (45 / 360) * 0.05);
    suelo(l, SUELO);
    const baseN = new Capsula(l, { clase: 's-cn', ancho: 80, relleno: 0.4 });
    const baseC0 = new Capsula(l, { clase: 's-c0', ancho: 80, relleno: 0.4 });
    const tasaN = new Salto(l, 's-i', '× n · d');
    const tasaC0 = new Salto(l, 's-i', '× n · i');
    const etN = new Etiqueta(l, 'N = C_n = "6.000 €"', 20);
    const etC0 = new Etiqueta(l, 'C_0 = "5.962,73 €"', 20);
    const chipDc = new Etiqueta(l, 'D_c = "37,50 €"', 22);
    const chipDr = new Etiqueta(l, 'D_r = "37,27 €"', 22);
    const rotN = new Rotulo(l, 'COMERCIAL · SOBRE N', 'mo-rotulo-claro', 'middle');
    const rotC0 = new Rotulo(l, 'RACIONAL · SOBRE C₀', 'mo-rotulo-claro', 'middle');
    const l1 = l.formula('C_0 = \\frac{C_n}{1 + n · i}', { x: 360, y: 92, tam: 34 });
    const l2 = l.formula('D_r = C_n - C_0 = C_0 · n · i', { x: 360, y: 172, tam: 30 });
    const l3 = l.formula('D_r = \\frac{C_n · n · i}{1 + n · i}', { x: 360, y: 128, tam: 44 });
    return (t) => {
      l.camara(360, 300, 1);
      l.foco(360, 300, 340);
      const comparar = tramo(t, 10.2, 11.0);
      // Primera parte: las dos columnas (C₀ hoy y Cₙ al vencimiento).
      const xC0 = mezclar(180, 450, comparar);
      const xN = mezclar(540, 230, comparar);
      baseC0.pintar(xC0, SUELO, C0 * ESC * tramo(t, 0.8, 1.6, curvas.expo), tramo(t, 0.8, 1.0));
      baseN.pintar(xN, SUELO, CN * ESC * tramo(t, 0.2, 1.0, curvas.expo), tramo(t, 0.2, 0.4));
      etN.pintar(xN, SUELO - CN * ESC - 22, tramo(t, 0.6, 1.2));
      etC0.pintar(xC0, SUELO - C0 * ESC - 22, tramo(t, 1.4, 2.0));
      chipDr.pintar(mezclar(360, xC0 + 120, comparar), mezclar(SUELO - (CN * ESC) / 2, SUELO - C0 * ESC + 40, comparar), tramo(t, 3.8, 4.4) * (1 - 0.2 * tramo(t, 7, 7.4)));
      tasaC0.pintar({ x: xC0 + 36, y: SUELO - C0 * ESC + 6 }, { x: xC0 + 104, y: SUELO - C0 * ESC + 22 }, tramo(t, 10.8, 11.6), 1, 26);
      tasaN.pintar({ x: xN + 36, y: SUELO - CN * ESC + 6 }, { x: xN + 104, y: SUELO - CN * ESC + 22 }, tramo(t, 11.0, 11.8), 1, 26);
      chipDc.pintar(xN + 120, SUELO - CN * ESC + 40, tramo(t, 11.6, 12.2));
      rotN.pintar(xN, SUELO + 34, tramo(t, 10.6, 11.2));
      rotC0.pintar(xC0, SUELO + 34, tramo(t, 10.6, 11.2));
      const c = (f: typeof l1, k: string, v = 0) => { const p = f.pieza(k, v); return p ? f.centro(p) : undefined; };
      const salida = 1 - tramo(t, 9.8, 10.2);
      l1.opacidad(tramo(t, 0.4, 0.5) * salida * mezclar(1, 0.45, tramo(t, 7.0, 7.4)));
      l1.construir(t, 0.5, { origenes: { C_0: l.aPantalla({ x: 180, y: SUELO - C0 * ESC - 30 }), C_n: l.aPantalla({ x: 540, y: SUELO - CN * ESC - 30 }) } });
      l2.opacidad(tramo(t, 3.6, 3.7) * salida * mezclar(1, 0.45, tramo(t, 7.0, 7.4)));
      l2.construir(t, 3.7, { origenes: { D_r: l.aPantalla({ x: 360, y: SUELO - (CN * ESC) / 2 }), C_n: c(l1, 'C_n'), C_0: [c(l1, 'C_0'), c(l1, 'C_0')] } });
      l3.opacidad(tramo(t, 7.3, 7.4) * mezclar(1, 0, tramo(t, 9.8, 10.2)) + tramo(t, 12.4, 12.8));
      l3.construir(t, 7.4, { origenes: { D_r: c(l2, 'D_r'), C_n: c(l2, 'C_n'), n: c(l2, 'n'), i: c(l2, 'i') } });
    };
  },
};

/* ------------------------------------------------- liquidación de una sola letra, paso a paso */
export const escenaRemesa: Escena = {
  id: 'remesa-una-letra',
  titulo: 'Valor líquido de un descuento',
  duracion: 14.5,
  descripcion: 'Ejercicio propuesto: pagaré de 6.000 € a 45 días al 5 %, comisión del 1 % con mínimo de 10 € y 3 € de correo. Cascada: 6.000 − 37,50 − 60 − 3 = 5.899,50 €.',
  capitulos: [
    { t: 0, lectura: 2.7, texto: 'Liquidar un descuento: del nominal se restan el descuento, las comisiones y los gastos.' },
    { t: 2.8, lectura: 5.3, texto: 'Pagaré de 6.000 € a 45 días al 5 %: el descuento comercial es 37,50 €.' },
    { t: 5.4, lectura: 7.95, texto: 'Comisión del 1 % con un mínimo de 10 €: el 1 % de 6.000 son 60 €, más que el mínimo, así que se cobran 60 €.' },
    { t: 8.4, lectura: 10.25, texto: 'Gastos de correo: 3 €.' },
    { t: 10.4, texto: 'Valor líquido = 6.000 − 37,50 − 60 − 3 = 5.899,50 €.' },
  ],
  montar(l) {
    const PISO = 5850;
    const TECHO = 6000;
    const Y0 = 480;
    const Y1 = 180;
    const y = (v: number) => mezclar(Y0, Y1, (v - PISO) / (TECHO - PISO));
    const pasos = [
      { nombre: 'NOMINAL', desde: PISO, hasta: 6000, clase: 's-cn', texto: '6.000 €' },
      { nombre: 'DESCUENTO', desde: 6000, hasta: 5962.5, clase: 's-D', texto: '− 37,50 €' },
      { nombre: 'COMISIÓN', desde: 5962.5, hasta: 5902.5, clase: 's-D', texto: '− 60 €' },
      { nombre: 'CORREO', desde: 5902.5, hasta: 5899.5, clase: 's-D', texto: '− 3 €' },
      { nombre: 'LÍQUIDO', desde: PISO, hasta: 5899.5, clase: 's-c0', texto: '5.899,50 €' },
    ];
    const X0 = 120;
    const PASO = 118;
    const inicios = [0.4, 3.0, 5.6, 8.6, 10.6];
    const barras = pasos.map((p) => new Capsula(l, { clase: p.clase, ancho: 76, relleno: 0.45 }));
    const guias = pasos.map(() => new Guia(l));
    const nombres = pasos.map((p) => new Rotulo(l, p.nombre, 'mo-eje-texto', 'middle'));
    const cifras = pasos.map((p) => new Rotulo(l, p.texto, `mo-cifra mo-cifra-peq ${p.clase}`, 'middle'));
    const corte = l.el('path', { class: 'mo-flecha', d: `M${X0 - 46} ${Y0 - 6} l10 -8 l10 8 l10 -8 M${X0 - 46} ${Y0 + 4} l10 -8 l10 8 l10 -8` });
    const etPiso = new Rotulo(l, 'el eje empieza en 5.850 €', 'mo-rotulo', 'start');
    const linea = l.el('line', { class: 'mo-grafico-eje', x1: X0 - 60, x2: X0 + 4 * PASO + 60, y1: Y0, y2: Y0 });
    const comision = l.formula('"1 %" · 6.000 = "60 €" > "10 €"', { x: 360, y: 96, tam: 26, tarjeta: true });
    const formula = l.formula('"Líquido" = N - D_c - "comisiones" - "gastos"', { x: 360, y: 96, tam: 28, tarjeta: true });
    return (t) => {
      l.camara(360, 320, 1);
      l.foco(360, 330, 360);
      fijar(linea, { opacity: tramo(t, 0, 0.6) });
      fijar(corte, { opacity: tramo(t, 0.6, 1.0) });
      etPiso.pintar(X0 - 50, Y0 + 62, tramo(t, 1.0, 1.6));
      pasos.forEach((p, k) => {
        const t0 = inicios[k]!;
        const x = X0 + k * PASO;
        const arriba = Math.max(p.desde, p.hasta);
        const abajo = Math.min(p.desde, p.hasta);
        const crece = tramo(t, t0, t0 + 0.7, curvas.salida);
        // Las restas «caen» desde el nivel anterior.
        barras[k]!.pintar(x, y(abajo), (y(abajo) - y(arriba)) * crece, tramo(t, t0, t0 + 0.15));
        if (k > 0 && k < 4) guias[k]!.pintar(x - PASO + 38, y(p.desde), x - 38, y(p.desde), tramo(t, t0 - 0.3, t0));
        if (k === 4) guias[k]!.pintar(x - PASO + 38, y(p.hasta), x - 38, y(p.hasta), tramo(t, t0 - 0.3, t0));
        nombres[k]!.pintar(x, Y0 + 30, tramo(t, t0, t0 + 0.4));
        cifras[k]!.pintar(x, y(arriba) - 16, tramo(t, t0 + 0.5, t0 + 0.9));
      });
      comision.opacidad(ventana(t, 5.8, 8.3));
      comision.construir(t, 5.9, { escalon: 0.05 });
      formula.opacidad(tramo(t, 10.8, 10.9));
      formula.construir(t, 10.9, { origenes: { N: l.aPantalla({ x: X0, y: y(6000) - 20 }), D_c: l.aPantalla({ x: X0 + PASO, y: y(6000) - 20 }) } });
    };
  },
};

/* ----------------------------------------------------------------- descuento compuesto racional */
export const escenaDescuentoCompuestoRacional: Escena = {
  id: 'descuento-compuesto-racional',
  titulo: 'Descuento compuesto racional',
  duracion: 14,
  descripcion: '12.500 € que vencen en 565 días al 4 %. n = 565 / 365 = 1,548 años; C₀ = 12.500 · 1,04^(−565/365) = 11.763,68 €; Dr = 736,32 €.',
  caso: { C_n: '12.500 €', n: '565/365', i: '4 %' },
  capitulos: [
    { t: 0, texto: '12.500 € que vencen dentro de 565 días, con descuento compuesto racional al 4 %.' },
    { t: 2.8, texto: 'En compuesta el tiempo va en años: $n$ = 565 / 365 = 1,548 años (año civil, como en el caso).' },
    { t: 5.6, lectura: 9.05, texto: 'Actualizar es dividir entre (1 + $i$) por cada año, también por la fracción: $C_0 = C_n · (1 + i)^{-n}$ = 11.763,68 €.' },
    { t: 9.4, texto: 'El descuento es la diferencia: $D_r = C_n · [1 - (1 + i)^{-n}]$ = 736,32 €.' },
  ],
  montar(l) {
    const N = 565 / 365;
    const CN = 12500;
    const valor = (x: number) => CN * 1.04 ** -(N - x);
    const g = new Grafico(l, { x0: 120, y0: 470, x1: 590, y1: 190, xmin: 0, xmax: N, ymin: 11500, ymax: 12650 });
    const curva = g.linea('mo-curva s-c0');
    const cn = new Capsula(l, { clase: 's-cn', ancho: 44, relleno: 0.4 });
    const c0 = new Capsula(l, { clase: 's-c0', ancho: 44, relleno: 0.4 });
    const dr = new Capsula(l, { clase: 's-D', ancho: 44, relleno: 0.5 });
    const guia = new Guia(l);
    const marcas = [0, 1, N].map((_, k) => new Rotulo(l, k === 0 ? 'HOY' : k === 1 ? '1 AÑO (365 D)' : '565 DÍAS', 'mo-eje-texto', 'middle'));
    const etN = new Rotulo(l, 'n = 565 / 365 = 1,548 años', 'mo-cifra mo-cifra-peq s-n', 'middle');
    const etCn = new Etiqueta(l, 'C_n = "12.500 €"', 20);
    const etC0 = new Etiqueta(l, 'C_0 = "11.763,68 €"', 20);
    const etDr = new Etiqueta(l, 'D_r = "736,32 €"', 20, 'izquierda');
    const aviso = new Rotulo(l, 'el eje vertical empieza en 11.500 €', 'mo-rotulo', 'start');
    const formula = l.formula('C_0 = C_n · (1 + i)^{-n}', { x: 360, y: 88, tam: 40 });
    const descuento = l.formula('D_r = C_n · [1 - (1 + i)^{-n}]', { x: 360, y: 150, tam: 30 });
    return (t) => {
      l.camara(360, 310, 1);
      l.foco(claves(t, [[0, 560], [5.6, 360]]), 330, 340);
      g.pintar(tramo(t, 0, 0.8));
      marcas.forEach((m, k) => m.pintar(g.px([0, 1, N][k]!), g.op.y0 + 30, tramo(t, 0.4, 1.0)));
      aviso.pintar(g.op.x0, g.op.y0 + 62, tramo(t, 1.0, 1.4));
      cn.pintar(g.px(N), g.op.y0, (g.op.y0 - g.py(CN)) * tramo(t, 0.4, 1.2, curvas.expo), tramo(t, 0.4, 0.6));
      etCn.pintar(g.px(N) - 20, g.py(CN) - 20, tramo(t, 1.0, 1.6));
      etN.pintar(360, g.op.y0 + 96, ventana(t, 3.0, 9.4));
      // La curva de actualización se recorre de derecha a izquierda (hacia hoy).
      const pc = tramo(t, 5.8, 7.6, curvas.lineal);
      fijar(curva, { d: g.camino((x) => valor(N - x), 0, N, pc, 60, (v) => g.py(v)), transform: `translate(${g.px(N) + g.px(0)} 0) scale(-1 1)`, opacity: tramo(t, 5.8, 5.9) });
      c0.pintar(g.px(0), g.op.y0, (g.op.y0 - g.py(valor(0))) * tramo(t, 7.4, 8.0, curvas.salida), tramo(t, 7.4, 7.5));
      etC0.pintar(g.px(0) + 30, g.py(valor(0)) - 20, tramo(t, 7.8, 8.4));
      guia.pintar(g.px(0), g.py(CN), g.px(N), g.py(CN), tramo(t, 9.6, 10.2));
      dr.pintar(g.px(0), g.py(valor(0)), g.py(valor(0)) - g.py(CN), tramo(t, 10.0, 10.4));
      etDr.pintar(g.px(0) + 32, (g.py(valor(0)) + g.py(CN)) / 2 + 6, tramo(t, 10.2, 10.8));
      formula.opacidad(tramo(t, 6.0, 6.1));
      formula.construir(t, 6.1, { origenes: { C_0: l.aPantalla({ x: g.px(0), y: g.py(valor(0)) - 26 }), C_n: l.aPantalla({ x: g.px(N), y: g.py(CN) - 26 }), n: l.aPantalla({ x: 360, y: g.op.y0 + 90 }) } });
      descuento.opacidad(tramo(t, 9.8, 9.9));
      descuento.construir(t, 9.9, { origenes: { D_r: l.aPantalla({ x: g.px(0) + 60, y: (g.py(valor(0)) + g.py(CN)) / 2 }) } });
    };
  },
};

/* ---------------------------------------------------------------- descuento compuesto comercial */
export const escenaDescuentoCompuestoComercial: Escena = {
  id: 'descuento-compuesto-comercial',
  titulo: 'Descuento compuesto comercial',
  duracion: 14,
  descripcion: 'Un efecto de 2.000 € a 6 años al 5 %. Cada año hacia atrás se multiplica por 0,95: E = 2.000 · 0,95⁶ = 1.470,18 € y Dc = 529,82 €. Con descuento simple serían 1.400 €.',
  caso: { N: '2.000 €', n: '6', d: '5 %' },
  capitulos: [
    { t: 0, lectura: 2.5, texto: 'Un efecto de 2.000 € a 6 años, con descuento compuesto comercial al 5 %.' },
    { t: 2.6, lectura: 6.5, texto: 'Cada año hacia atrás se quita el 5 % de lo que queda: se multiplica por $(1 - d)$ = 0,95.' },
    { t: 6.6, texto: 'Seis años: $E = N · (1 - d)^n$ = 2.000 · 0,95⁶ = 1.470,18 €.' },
    { t: 9.8, texto: 'El descuento total: $D_c = N · [1 - (1 - d)^n]$ = 529,82 €. (Con descuento simple serían 600 €: contornos).' },
  ],
  montar(l) {
    const NOM = 2000;
    const D = 0.05;
    const N = 6;
    const SUELO = 480;
    const X0 = 120;
    const PASO = 76;
    const ESC = 0.14;
    const v = (k: number) => NOM * (1 - D) ** k; // k años antes del vencimiento
    suelo(l, SUELO);
    const eje = new Eje(l, { x0: X0, paso: PASO, y: SUELO, periodos: N, marcas: ['HOY', '1', '2', '3', '4', '5', '6 AÑOS'] });
    const simples = Array.from({ length: N + 1 }, () => new Capsula(l, { clase: 's-c0', ancho: 48, relleno: 0 }));
    const columnas = Array.from({ length: N + 1 }, (_, k) => new Capsula(l, { clase: k === 0 ? 's-cn' : 's-c0', ancho: 42, relleno: k === 0 || k === N ? 0.45 : 0.3 }));
    const quitas = Array.from({ length: N }, () => new Capsula(l, { clase: 's-D', ancho: 42, relleno: 0.5 }));
    const saltos = Array.from({ length: N }, () => new Salto(l, 's-D', '×0,95'));
    const etN = new Etiqueta(l, 'N = "2.000 €"', 20);
    const etE = new Etiqueta(l, 'E = "1.470,18 €"', 20);
    const llaveD = new Llave(l, 's-D');
    const formula = l.formula('E = N · (1 - d)^n', { x: 360, y: 88, tam: 44 });
    // El importe va en la misma línea que la fórmula del descuento (suelto, se pisaba con las flechas).
    const descuento = l.formula('D_c = N · [1 - (1 - d)^n] = "529,82 €"', { x: 318, y: 156, tam: 24 });
    const etD = new Etiqueta(l, 'D_c', 22, 'derecha');
    return (t) => {
      const xDe = (k: number) => eje.x(N - k);
      l.camara(360, claves(t, [[0, 330], [9.6, 330], [10.4, 310]]), 1);
      l.foco(claves(t, [[0, 560], [6, 300]]), 330, 340);
      eje.pintar(tramo(t, 0, 0.8));
      columnas.forEach((c, k) => {
        const t0 = k === 0 ? 0.4 : 2.8 + (k - 1) * 0.6;
        c.pintar(xDe(k), SUELO, v(k) * ESC * tramo(t, t0, t0 + 0.5, curvas.salida), tramo(t, t0, t0 + 0.1) * (k > 0 && k < N ? mezclar(1, 0.6, tramo(t, 6.6, 7)) : 1));
        if (k > 0) {
          quitas[k - 1]!.pintar(xDe(k - 1), SUELO - v(k) * ESC, (v(k - 1) - v(k)) * ESC, ventana(t, t0 - 0.2, t0 + 0.9, 0.2));
          saltos[k - 1]!.pintar({ x: xDe(k - 1) - 6, y: SUELO - v(k - 1) * ESC - 8 }, { x: xDe(k) + 6, y: SUELO - v(k) * ESC - 8 }, tramo(t, t0 - 0.3, t0 + 0.2), 1 - 0.5 * tramo(t, 6.6, 7), 22);
        }
      });
      simples.forEach((s, k) => s.pintar(xDe(k), SUELO, (NOM - NOM * D * k) * ESC, k === 0 ? 0 : tramo(t, 10.6, 11.2)));
      etN.pintar(xDe(0), SUELO - NOM * ESC - 46, tramo(t, 0.8, 1.4));
      // Bajo el eje, junto a HOY: encima se pisaba con la primera flecha de ×0,95.
      etE.pintar(xDe(N), SUELO + 58, tramo(t, 6.8, 7.4));
      const xl = xDe(N) - 32;
      llaveD.vertical(SUELO - v(N) * ESC, SUELO - NOM * ESC, xl, -10, tramo(t, 10.0, 10.5));
      etD.pintar(xl - 18, SUELO - ((v(N) + NOM) / 2) * ESC + 8, tramo(t, 10.3, 10.8));
      formula.opacidad(tramo(t, 6.8, 6.9));
      formula.construir(t, 6.9, { origenes: { E: l.aPantalla({ x: xDe(N), y: SUELO + 50 }), N: l.aPantalla({ x: xDe(0), y: SUELO - NOM * ESC - 54 }), d: l.aPantalla({ x: xDe(1), y: SUELO - v(1) * ESC - 40 }), n: l.aPantalla({ x: 360, y: SUELO + 30 }) } });
      descuento.opacidad(tramo(t, 10.0, 10.1));
      descuento.construir(t, 10.1, { origenes: { D_c: l.aPantalla({ x: X0, y: SUELO - NOM * ESC - 40 }) } });
    };
  },
};
