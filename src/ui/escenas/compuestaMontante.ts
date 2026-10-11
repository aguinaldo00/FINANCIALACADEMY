import type { Escena } from '../motion/reproductor.ts';
import { Capsula, Eje, Etiqueta, Guia, Pulso, Rotulo, Salto, suelo } from '../motion/motivos.ts';
import { arco, claves, curvas, mezclar, retener, tramo, ventana } from '../motion/tiempo.ts';

/*
 * Compuesta · Cₙ = C₀ · (1 + i)ⁿ
 * Misma semilla y mismo tipo que en simple, pero cada cosecha se vuelve a sembrar: el capital de
 * cada año es la base del siguiente. Se ve como una escalera de multiplicaciones por (1 + i); las
 * alturas de simple quedan como contornos para comparar.
 */

const C0 = 10_000;
const TIPO = 0.07;
const N = 3;
const SUELO = 452;
const X0 = 150;
const PASO = 150;
const ESC = 0.022; // px por euro
const ANCHO = 62;
const capital = (k: number) => C0 * (1 + TIPO) ** k;
const fmt = (v: number) => new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.round(v * 100) / 100);

export const escenaMontanteCompuesta: Escena = {
  id: 'compuesta-montante',
  titulo: 'Capital final en capitalización compuesta',
  duracion: 19.2,
  descripcion: 'Con 10.000 € al 7 % compuesto, cada año se multiplica el capital por 1,07: 10.700, 11.449 y 12.250,43 €. Tres multiplicaciones: Cₙ = C₀ · (1 + i)ⁿ. En simple serían 12.100 €.',
  caso: { C_0: '10.000 €', i: '7 %', n: '3' },
  capitulos: [
    { t: 0, texto: 'En compuesta, cada cosecha se vuelve a sembrar: el capital de cada año es la semilla del siguiente.' },
    { t: 2.6, lectura: 5.2, texto: 'Año 1: $C_1 = C_0 · (1 + i)$ = 10.000 · 1,07 = 10.700 €.' },
    { t: 5.4, lectura: 8, texto: 'Año 2: la cosecha se calcula sobre 10.700 €, no sobre 10.000: 749 €. $C_2$ = 11.449 €.' },
    { t: 8.2, lectura: 10.75, texto: 'Año 3: 11.449 · 1,07 = 12.250,43 €. Cada año se multiplica por $(1 + i)$.' },
    { t: 11, texto: 'Tres multiplicaciones por $(1 + i)$: $C_n = C_0 · (1 + i)^n$. El exponente cuenta los periodos.' },
    { t: 15.3, texto: 'En simple (contornos) serían 12.100 €. En compuesta, 12.250,43 €: el interés también produce interés.' },
  ],
  montar(l) {
    suelo(l, SUELO);
    const eje = new Eje(l, { x0: X0, paso: PASO, y: SUELO, periodos: N, unidad: 'años' });
    const simples = Array.from({ length: N + 1 }, () => new Capsula(l, { clase: 's-cn mo-contorno', ancho: ANCHO + 14, relleno: 0 }));
    const bases = Array.from({ length: N + 1 }, (_, k) => new Capsula(l, { clase: k === 0 ? 's-c0' : 's-cn', ancho: ANCHO, relleno: 0.2 }));
    const cosechas = Array.from({ length: N }, () => new Capsula(l, { clase: 's-I', ancho: ANCHO, relleno: 0.5 }));
    const pulsos = Array.from({ length: N }, () => new Pulso(l, 's-i'));
    const saltos = Array.from({ length: N }, () => new Salto(l, 's-i', '× 1,07'));
    const nivel = new Guia(l, 'mo-guia s-cn');
    const etiquetas = Array.from({ length: N + 1 }, (_, k) => new Etiqueta(l, k === 0 ? 'C_0' : `C_${k}`, 24));
    const valores = Array.from({ length: N + 1 }, (_, k) => new Rotulo(l, k === 0 ? '10.000 €' : `${fmt(capital(k))} €`, `mo-cifra mo-cifra-peq ${k === 0 ? 's-c0' : 's-cn'}`));
    const intereses = Array.from({ length: N }, (_, k) => new Rotulo(l, `+${fmt(capital(k) * TIPO)}`, 'mo-cifra mo-cifra-peq s-I', 'start'));
    // A la derecha de la última columna (ya libre): no tapa la cifra del año 2.
    const etSimple = new Rotulo(l, 'simple: 12.100 €', 'mo-rotulo', 'start');
    const etDiferencia = new Rotulo(l, `+${fmt(capital(N) - C0 * (1 + N * TIPO))} € más`, 'mo-cifra mo-cifra-peq s-I', 'start');

    const cadena = l.formula('C_3 = C_0 · (1 + i) · (1 + i) · (1 + i)', { x: 360, y: 84, tam: 30 });
    const formula = l.formula('C_n = C_0 · (1 + i)^n', { x: 360, y: 150, tam: 50 });
    const sust = l.formula('C_3 = 10.000 · 1,07^3 = "12.250,43 €"', { x: 360, y: 206, tam: 26 });

    return (tReal) => {
      // Retenciones: lo que acaba tarde termina mientras el resto espera (ver retener en tiempo.ts).
      const t = retener(tReal, 14.6, 0.7);
      const cx = claves(t, [[0, 220], [2.6, 220], [5.4, 300], [8.2, 380], [11.0, 380]]);
      const cy = claves(t, [[0, 330], [10.6, 330], [11.6, 200]]);
      const z = claves(t, [[0, 1.2], [2.6, 1.2], [5.4, 1.12], [8.2, 1.0], [11.0, 1.0], [11.6, 0.85]]);
      l.camara(cx, cy, z);
      l.foco(claves(t, [[0, 220], [5.4, 360], [8.2, 520], [11, 360]]), 330, 300);

      eje.pintar(tramo(t, 0, 0.8), 1, t < 11 ? Math.min(N, Math.floor(Math.max(0, t - 2.6) / 2.8) + (t > 2.6 ? 1 : 0)) : -1);
      bases[0]!.pintar(X0, SUELO, C0 * ESC, tramo(t, 0.3, 1.2, curvas.expo));
      etiquetas[0]!.pintar(X0, SUELO - C0 * ESC - 46, tramo(t, 0.8, 1.4));
      valores[0]!.pintar(X0, SUELO - C0 * ESC - 16, tramo(t, 1.0, 1.6));

      for (let k = 0; k < N; k++) {
        const t0 = 2.8 + k * 2.8;
        const xa = eje.x(k);
        const xb = eje.x(k + 1);
        const altoA = capital(k) * ESC;
        // Toda la columna anterior (no solo la semilla) produce la cosecha: el pulso sale de su cima.
        saltos[k]!.pintar({ x: xa + 10, y: SUELO - altoA - 8 }, { x: xb - 10, y: SUELO - capital(k + 1) * ESC - 8 }, tramo(t, t0, t0 + 0.9), 1, 40);
        const pc = tramo(t, t0 + 0.3, t0 + 1.5, curvas.suave);
        const pos = arco({ x: xa, y: SUELO }, { x: xb, y: SUELO }, pc, 0.0);
        bases[k + 1]!.pintar(pos.x, SUELO, altoA, tramo(t, t0 + 0.3, t0 + 0.5));
        const pg = tramo(t, t0 + 1.2, t0 + 2.0, curvas.muelle);
        cosechas[k]!.pintar(xb, SUELO - altoA, capital(k) * TIPO * ESC * pg, tramo(t, t0 + 1.2, t0 + 1.4) * (1 - tramo(t, t0 + 2.4, t0 + 2.8)));
        // Al cerrar el año, la cosecha pasa a formar parte del capital (se resiembra).
        if (t > t0 + 2.4) bases[k + 1]!.pintar(xb, SUELO, mezclar(altoA, capital(k + 1) * ESC, tramo(t, t0 + 2.4, t0 + 2.8)), 1);
        pulsos[k]!.pintar({ x: mezclar(xa, xb, tramo(t, t0 + 0.6, t0 + 1.3)), y: SUELO - mezclar(altoA, altoA, 0) - 6 - Math.sin(Math.PI * tramo(t, t0 + 0.6, t0 + 1.3)) * 30 }, ventana(t, t0 + 0.6, t0 + 1.4, 0.1));
        intereses[k]!.pintar(xb + ANCHO / 2 + 8, SUELO - altoA - 2, ventana(t, t0 + 1.6, t0 + 3.4));
        etiquetas[k + 1]!.pintar(xb, SUELO - capital(k + 1) * ESC - 46, tramo(t, t0 + 2.5, t0 + 3.0));
        valores[k + 1]!.pintar(xb, SUELO - capital(k + 1) * ESC - 16, tramo(t, t0 + 2.6, t0 + 3.1));
      }
      // Nivel del año anterior: la base ha cambiado.
      nivel.pintar(eje.x(1) - 40, SUELO - capital(1) * ESC, eje.x(2) + 40, SUELO - capital(1) * ESC, tramo(t, 5.6, 6.2), 1 - tramo(t, 8.0, 8.4));

      // Contornos de simple para comparar.
      const ps = tramo(t, 14.8, 15.6);
      simples.forEach((s, k) => s.pintar(eje.x(k), SUELO, (C0 + C0 * TIPO * k) * ESC, k === 0 ? 0 : ps));
      etSimple.pintar(eje.x(N) + ANCHO / 2 + 14, SUELO - (C0 * (1 + N * TIPO)) * ESC + 22, tramo(t, 15.4, 16.0));
      etDiferencia.pintar(eje.x(N) + ANCHO / 2 + 14, SUELO - (C0 * (1 + N * TIPO)) * ESC + 48, tramo(t, 15.8, 16.4));

      const origen = (k: number) => l.aPantalla({ x: (eje.x(k) + eje.x(k + 1)) / 2, y: SUELO - capital(k) * ESC - 56 });
      cadena.opacidad(tramo(t, 11.0, 11.1) * mezclar(1, 0.45, tramo(t, 12.8, 13.4)));
      cadena.construir(tReal, 11.1, {
        origenes: {
          C_3: l.aPantalla({ x: eje.x(3), y: SUELO - capital(3) * ESC - 50 }),
          C_0: l.aPantalla({ x: X0, y: SUELO - C0 * ESC - 50 }),
          i: [origen(0), origen(1), origen(2)],
        },
        escalon: 0.18,
      });
      const centro = (clave: string, vez = 0) => {
        const p = cadena.pieza(clave, vez);
        return p ? cadena.centro(p) : undefined;
      };
      formula.opacidad(tramo(t, 12.7, 12.8));
      formula.construir(tReal, 12.8, { origenes: { C_n: centro('C_3'), C_0: centro('C_0'), i: centro('i', 1), n: centro('i', 2) }, duracion: 1.2, resaltar: ['n'] });
      sust.opacidad(tramo(t, 14.0, 14.1));
      sust.construir(t, 14.1, { escalon: 0.05 });
    };
  },
};
