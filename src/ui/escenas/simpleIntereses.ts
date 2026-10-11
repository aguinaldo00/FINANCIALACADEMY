import type { Escena } from '../motion/reproductor.ts';
import { Capsula, Eje, Etiqueta, Guia, Llave, Pulso, puntoTrazo, Rotulo, suelo, Trazo, eur } from '../motion/motivos.ts';
import { claves, curvas, mezclar, tramo, ventana } from '../motion/tiempo.ts';

/*
 * Fórmula 1 · I = C₀ · n · i
 * La semilla (C₀) vive bajo tierra; el tipo i es la parte de la semilla que se cosecha cada año.
 * Cada cosecha nace de una raíz que sale SIEMPRE de la semilla: en simple, la base no cambia.
 * Las n cosechas, iguales, se juntan en una franja de alto C₀ · i y ancho n: su área es I.
 */

const C0 = 10_000;
const TIPO = 0.07;
const N = 3;
const SUELO = 330;
const X0 = 170;
const PASO = 140;
const ALTO_C0 = 220;
const ALTO_COSECHA = ALTO_C0 * TIPO;

export const escenaInteresesSimple: Escena = {
  id: 'simple-intereses',
  titulo: 'Intereses totales en capitalización simple',
  duracion: 19.5,
  descripcion: 'Una semilla de 10.000 € da cada año una cosecha de 700 €, siempre calculada sobre la semilla. Tres cosechas iguales forman 2.100 € de intereses: I = C₀ · n · i.',
  capitulos: [
    { t: 0, texto: 'La semilla es el capital inicial: $C_0$ = 10.000 €. Es lo que se invierte hoy.' },
    { t: 2.6, texto: 'El tipo $i$ = 7 % anual marca la parte de la semilla que se cosecha cada año: 0,07 de $C_0$.' },
    { t: 5.4, texto: 'Año 1: la raíz sale de la semilla y da una cosecha de $C_0 · i$ = 10.000 · 0,07 = 700 €.' },
    { t: 8.4, texto: 'Años 2 y 3: las raíces vuelven a salir de la misma semilla. Por eso todas las cosechas miden 700 €.' },
    { t: 11.6, texto: 'Las $n$ = 3 cosechas juntas forman una franja de alto $C_0 · i$ y ancho $n$: los intereses totales.' },
    { t: 14.6, texto: 'Intereses totales en capitalización simple: $I = C_0 · n · i$ = 10.000 · 3 · 0,07 = 2.100 €.' },
  ],
  montar(l) {
    suelo(l, SUELO);
    const eje = new Eje(l, { x0: X0, paso: PASO, y: SUELO, periodos: N, periodos_rotulo: (k) => `año ${k}` });
    const raices = Array.from({ length: N }, () => new Trazo(l, 'mo-raiz s-c0'));
    const semilla = new Capsula(l, { clase: 's-c0', ancho: 66, relleno: 0.2 });
    const tajada = new Capsula(l, { clase: 's-i', ancho: 66, relleno: 0.55 });
    const pulsos = Array.from({ length: N }, () => new Pulso(l, 's-i'));
    const cosechas = Array.from({ length: N }, () => new Capsula(l, { clase: 's-I', ancho: 74, relleno: 0.4 }));
    const igual = new Guia(l, 'mo-guia s-I');
    const franja = new Capsula(l, { clase: 's-I', ancho: 0, relleno: 0.32 });
    const llaveN = new Llave(l, 's-n');
    const llaveAlto = new Llave(l, 's-i');
    const llaveTipo = new Llave(l, 's-i');

    const etC0 = new Etiqueta(l, 'C_0', 34);
    const valorC0 = new Rotulo(l, '', 'mo-cifra');
    const etTipo = new Etiqueta(l, 'i = "7 %"', 22, 'izquierda');
    const etTipo2 = new Rotulo(l, '0,07 de la semilla', 'mo-rotulo', 'start');
    const etCosechas = cosechas.map(() => new Rotulo(l, '700 €', 'mo-cifra mo-cifra-peq s-I'));
    const etBase = cosechas.map(() => new Etiqueta(l, 'C_0 · i', 18));
    const etN = new Etiqueta(l, 'n = 3', 24);
    const etAlto = new Etiqueta(l, 'C_0 · i', 20, 'izquierda');
    const etI = new Etiqueta(l, 'I', 30);
    const valorI = new Rotulo(l, '', 'mo-cifra s-I', 'start');

    const formula = l.formula('I = C_0 · n · i', { x: 360, y: 92, tam: 58 });
    const sustitucion = l.formula('I = 10.000 · 3 · 0,07 = "2.100 €"', { x: 360, y: 148, tam: 28 });

    return (t) => {
      // Cámara: de la semilla al campo, de cerca a las cosechas y atrás para la composición final.
      const cx = claves(t, [[0, 172], [2.6, 172], [4.6, 236], [6.6, 300], [8.6, 330], [11.4, 380], [12.4, 420], [14.4, 420], [15.6, 380]]);
      const cy = claves(t, [[0, 430], [2.6, 430], [4.6, 380], [6.6, 355], [11.4, 350], [12.4, 300], [14.4, 300], [15.6, 380]]);
      const z = claves(t, [[0, 1.5], [2.6, 1.55], [4.6, 1.8], [6.6, 1.4], [8.6, 1.22], [11.4, 1.2], [12.4, 1.3], [14.4, 1.3], [15.6, 1.06]]);
      l.camara(cx, cy, z);
      l.foco(360, claves(t, [[0, 330], [14.4, 330], [15.6, 260]]), claves(t, [[0, 220], [6, 300], [15.6, 340]]));

      // Semilla: emerge bajo tierra.
      const pSem = tramo(t, 0.2, 1.4, curvas.expo);
      semilla.pintar(X0, SUELO + 12, -ALTO_C0 * mezclar(0.55, 1, pSem), pSem);
      const enEtiqueta = l.aPantalla({ x: X0 - 70, y: SUELO + 120 });
      etC0.pintar(X0 - 76, SUELO + 104, tramo(t, 0.8, 1.6));
      valorC0.pintar(X0 - 76, SUELO + 136, tramo(t, 1.0, 1.8), `${eur(C0)} €`);

      // El tipo: la tajada superior de la semilla (7 % de su altura), que se separa un poco.
      // Reaparece (tenue) cada vez que nace una cosecha: siempre se corta de la misma semilla.
      const pTaj = tramo(t, 2.8, 3.8, curvas.salida);
      const sube = tramo(t, 4.2, 5.2) * 10 * (1 - tramo(t, 5.6, 6.2));
      const destello = Math.max(...[8.7, 9.6].map((t0) => ventana(t, t0 - 0.1, t0 + 0.9, 0.25)));
      tajada.pintar(X0, SUELO + 12 - sube, -ALTO_COSECHA, Math.max(pTaj * (1 - tramo(t, 6.4, 7.0)), destello * 0.9));
      llaveTipo.vertical(SUELO + 12, SUELO + 12 + ALTO_COSECHA, X0 + 40, 12, ventana(t, 3.1, 5.6));
      etTipo.pintar(X0 + 60, SUELO + 26, ventana(t, 3.2, 5.6));
      etTipo2.pintar(X0 + 60, SUELO + 50, ventana(t, 3.6, 5.6));

      // Eje del tiempo y raíces desde la semilla.
      eje.pintar(tramo(t, 5.3, 6.4), 1, t > 5.4 && t < 11.6 ? Math.min(N, 1 + Math.floor((t - 5.4) / 1.6)) : -1);
      const inicios = [6.0, 8.7, 9.6];
      cosechas.forEach((cosecha, k) => {
        const xk = eje.x(k) + PASO / 2;
        const t0 = inicios[k]!;
        const pRaiz = tramo(t, t0, t0 + 0.9);
        raices[k]!.pintar({ x: X0 + 26, y: SUELO + 22 }, { x: xk, y: SUELO + 2 }, pRaiz, 1 - 0.55 * tramo(t, 12.0, 13.0));
        pulsos[k]!.pintar(puntoTrazo(raices[k]!, tramo(t, t0, t0 + 0.9, curvas.lineal)), ventana(t, t0, t0 + 1.0, 0.15));
        // Brota desde el suelo; en la fusión se ensancha hasta ocupar su año.
        const pBrota = tramo(t, t0 + 0.6, t0 + 1.5, curvas.muelle);
        const pFunde = tramo(t, 11.8, 12.8);
        const ancho = mezclar(74, PASO, pFunde);
        cosecha.pintar(xk, SUELO, ALTO_COSECHA * pBrota, tramo(t, t0 + 0.6, t0 + 0.9) * (1 - tramo(t, 12.6, 12.9)), ancho);
        const op = tramo(t, t0 + 1.3, t0 + 1.8) * (1 - tramo(t, 11.6, 12.0));
        etCosechas[k]!.pintar(xk, SUELO - ALTO_COSECHA - 14, op);
        etBase[k]!.pintar(xk, SUELO - ALTO_COSECHA - 40, op * 0.9 * (k === 0 ? 1 : tramo(t, t0 + 1.5, t0 + 2.0)));
      });
      igual.pintar(eje.x(0) + 20, SUELO - ALTO_COSECHA, eje.x(N) - 20, SUELO - ALTO_COSECHA, tramo(t, 10.8, 11.5), 1 - tramo(t, 11.6, 12.0));

      // La franja de intereses: alto C₀·i y ancho n.
      const pFranja = tramo(t, 12.5, 12.9);
      franja.pintar((eje.x(0) + eje.x(N)) / 2, SUELO, ALTO_COSECHA, pFranja, eje.x(N) - eje.x(0));
      llaveN.horizontal(eje.x(0), eje.x(N), SUELO - ALTO_COSECHA - 10, -16, tramo(t, 12.6, 13.2));
      etN.pintar((eje.x(0) + eje.x(N)) / 2, SUELO - ALTO_COSECHA - 36, tramo(t, 12.8, 13.4));
      llaveAlto.vertical(SUELO - ALTO_COSECHA, SUELO, eje.x(N) + 8, 12, tramo(t, 12.9, 13.4));
      etAlto.pintar(eje.x(N) + 26, SUELO - 2, tramo(t, 13.0, 13.5));
      etI.pintar((eje.x(0) + eje.x(N)) / 2 - 46, SUELO - 86, ventana(t, 13.2, 15.6, 0.5));
      valorI.pintar((eje.x(0) + eje.x(N)) / 2 - 26, SUELO - 78, ventana(t, 13.3, 15.6, 0.5), `= ${eur(C0 * N * TIPO)} €`);

      // La fórmula se arma con piezas que vienen de la escena.
      const origenes = {
        I: l.aPantalla({ x: (eje.x(0) + eje.x(N)) / 2 - 46, y: SUELO - 96 }),
        C_0: enEtiqueta,
        n: l.aPantalla({ x: (eje.x(0) + eje.x(N)) / 2, y: SUELO - ALTO_COSECHA - 44 }),
        i: l.aPantalla({ x: eje.x(N) + 60, y: SUELO - 10 }),
      };
      formula.opacidad(tramo(t, 14.6, 14.8));
      formula.construir(t, 14.7, { origenes, escalon: 0.16 });
      sustitucion.opacidad(tramo(t, 16.4, 17.2));
      sustitucion.construir(t, 16.3, { escalon: 0.05 });
    };
  },
};
