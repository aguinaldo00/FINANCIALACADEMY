import type { Escena } from '../motion/reproductor.ts';
import { Capsula, Etiqueta, Regla, Rotulo } from '../motion/motivos.ts';
import { fijar } from '../motion/lienzo.ts';
import { claves, curvas, mezclar, tramo, ventana } from '../motion/tiempo.ts';

/*
 * Fórmula 6 · iₘ = i / m   e   I = C₀ · iₘ · n · m
 * Si el año se parte en m trozos, en simple la cosecha anual se reparte a partes iguales y el tipo
 * también: es proporcional. En n años hay n · m periodos: el tiempo se cuenta en la unidad de iₘ.
 * Al juntar las 36 cosechas mensuales sale la misma franja que con años: 2.100 €.
 */

const C0 = 10_000;
const TIPO = 0.07;
const X0 = 120;
const ANO = 480; // ancho de un año en el mundo
const Y = 380;
const ESC = 0.08; // px por euro
const ALTO = C0 * TIPO * ESC; // cosecha de un año
const Y_TIPO = 236;
const GAP = 5;

export const escenaFraccionadoSimple: Escena = {
  id: 'simple-fraccionado',
  titulo: 'Fraccionamiento del año en capitalización simple',
  duracion: 21,
  descripcion: 'Una cosecha anual de 700 € (10.000 € al 7 %) se reparte en m partes iguales y el tipo también: iₘ = i / m. En 3 años hay 36 meses; las 36 cosechas de 58,33 € suman 2.100 €, como con años: I = C₀ · iₘ · n · m.',
  capitulos: [
    { t: 0, texto: 'Con $C_0$ = 10.000 € al $i$ = 7 % anual, la cosecha de un año es $C_0 · i$ = 700 €.' },
    { t: 2.8, texto: 'Si el año se divide en $m$ partes, la cosecha se reparte a partes iguales: $m$ = 2, 4, 12.' },
    { t: 7.2, lectura: 10.4, texto: 'El tipo se reparte igual. En simple es proporcional: $i_m = \\frac{i}{m}$, y para meses $i_{12}$ = 0,07 / 12.' },
    { t: 10.6, texto: 'En $n$ = 3 años hay $n · m$ = 36 meses: el tiempo se cuenta en la unidad del tipo.' },
    { t: 14, lectura: 17.4, texto: '$I = C_0 · i_m · n · m$ = 10.000 · (0,07 / 12) · 36 = 2.100 €. Lo mismo que contando en años.' },
    { t: 17.6, texto: 'Con días, $m$ = 360 si el año es comercial y 365 si es civil. Lo dice el enunciado.' },
  ],
  montar(l) {
    const etC0 = new Etiqueta(l, 'C_0 = "10.000 €"', 22, 'izquierda');
    const barraTipo = Array.from({ length: 12 }, () => l.el('rect', { class: 'mo-tipo-trozo s-i', height: 12, rx: 3 }));
    const etTipo = new Etiqueta(l, 'i = "0,07 anual"', 22, 'izquierda');
    const etTipoM = new Etiqueta(l, 'i_m = \\frac{i}{m}', 26, 'izquierda');
    const etTipo12 = new Rotulo(l, '', 'mo-cifra mo-cifra-peq s-i', 'start');
    const reglasAno = [1, 2, 4, 12].map((d) => new Regla(l, { x0: X0, x1: X0 + ANO, y: Y, divisiones: d, clase: 's-m', rotulo: () => null }));
    const etAno = new Rotulo(l, '1 año', 'mo-eje-unidad', 'middle');
    const bloques = Array.from({ length: 36 }, () => new Capsula(l, { clase: 's-I', ancho: 10, relleno: 0.42 }));
    const etBloque = new Rotulo(l, '', 'mo-cifra mo-cifra-peq s-I', 'middle');
    const etM = new Etiqueta(l, 'm = 2', 26, 'izquierda');
    const tres = new Regla(l, { x0: X0, x1: X0 + 3 * ANO, y: Y, divisiones: 36, clase: 's-n', rotulo: (k) => (k % 12 === 0 ? `${k / 12}` : null), tamRotulo: 46 });
    const etAnos = new Rotulo(l, 'años', 'mo-eje-unidad mo-gigante', 'start');
    const etNm = new Etiqueta(l, 'n · m = 3 · 12 = 36', 66, 'centro');
    const franja = new Capsula(l, { clase: 's-I', ancho: 3 * ANO, relleno: 0.32 });
    const etI = new Etiqueta(l, 'I = "2.100 €"', 64);

    const formula = l.formula('I = C_0 · i_m · n · m', { x: 360, y: 96, tam: 50 });
    const sust = l.formula('I = 10.000 · \\frac{0,07}{12} · 3 · 12 = "2.100 €"', { x: 360, y: 170, tam: 24 });
    const dias1 = l.formula('m = 360', { x: 220, y: 500, tam: 30 });
    const dias2 = l.formula('m = 365', { x: 500, y: 500, tam: 30 });
    const rot1 = new Rotulo(l, 'año comercial', 'mo-rotulo', 'middle', l.frente);
    const rot2 = new Rotulo(l, 'año civil', 'mo-rotulo', 'middle', l.frente);

    return (t) => {
      // Primero un año de cerca; después se aleja hasta ver los tres años.
      const zo = tramo(t, 10.8, 12.4, curvas.suave);
      const cx = mezclar(360, X0 + 1.5 * ANO, zo);
      const cy = claves(t, [[0, 320], [10.8, 320], [12.4, 260], [14, 260], [15, 200]]);
      const z = mezclar(1, 1 / 3.15, zo);
      l.camara(cx, cy, z);
      l.foco(360, claves(t, [[0, 320], [7, 260], [10.8, 330], [14, 360]]), 320);

      const fueraCerca = 1 - tramo(t, 10.4, 10.9);
      etC0.pintar(X0, 132, tramo(t, 0.2, 0.8) * fueraCerca);
      // m vigente: 1 → 2 → 4 → 12 (cada cambio se reparte la cosecha).
      const m = t < 3.0 ? 1 : t < 4.4 ? 2 : t < 5.8 ? 4 : 12;
      const pCorte = t < 3.0 ? 1 : tramo(t, m === 2 ? 3.0 : m === 4 ? 4.4 : 5.8, (m === 2 ? 3.0 : m === 4 ? 4.4 : 5.8) + 0.8, curvas.salida);
      reglasAno.forEach((r) => r.pintar((r.op.divisiones === m ? 1 : 0) * tramo(t, 0, 0.6) * fueraCerca, 1, 0));
      etAno.pintar(X0 + ANO / 2, Y + 40, tramo(t, 0.3, 0.9) * fueraCerca);
      etM.pintar(X0 + ANO + 20, Y - 12, tramo(t, 3.0, 3.4) * fueraCerca);
      etM.formula.piezas.at(-1)!.texto!.textContent = String(m);

      // Bloques: en el año visto de cerca, m bloques; luego, 36 en tres años.
      const crecer = tramo(t, 0.4, 1.4, curvas.expo);
      const mesesTres = tramo(t, 12.0, 13.6, curvas.lineal);
      const fusion = tramo(t, 14.2, 15.0);
      bloques.forEach((b, k) => {
        let x: number;
        let w: number;
        let op: number;
        if (t < 10.9) {
          const ancho = ANO / m;
          const visible = k < m;
          const sep = GAP * pCorte;
          w = ancho - (m > 1 ? sep : 0);
          x = X0 + ancho * (k + 0.5);
          op = visible ? 1 : 0;
          b.pintar(x, Y, ALTO * crecer, op, Math.max(2, w));
          return;
        }
        // Vista de tres años: los meses aparecen en oleada y al final se funden en una franja.
        const ancho = ANO / 12;
        x = X0 + ancho * (k + 0.5);
        w = mezclar(ancho - GAP * 2, ancho + 1, fusion);
        op = (k < 12 ? 1 : tramo(mesesTres * 36, k - 1, k)) * (1 - tramo(t, 14.9, 15.1));
        b.pintar(x, Y, ALTO, op, w);
      });
      const textoBloque = m === 1 ? '700 €' : m === 2 ? '350 € cada mitad' : m === 4 ? '175 € cada trimestre' : '58,33 € cada mes';
      etBloque.pintar(X0 + ANO / 2, Y - ALTO - 18, (t < 2.8 ? tramo(t, 1.2, 1.7) : tramo(t, m === 2 ? 3.4 : m === 4 ? 4.8 : 6.2, (m === 2 ? 3.4 : m === 4 ? 4.8 : 6.2) + 0.4)) * fueraCerca, textoBloque);

      // El tipo: una barra rosa que se parte exactamente igual.
      const anchoTipo = ANO;
      barraTipo.forEach((r, k) => {
        const mm = t < 7.4 ? m : 12;
        const ancho = anchoTipo / mm;
        const visible = k < mm;
        const resalte = k === 0 && t > 8.6;
        fijar(r, {
          x: X0 + ancho * k + (mm > 1 ? 2 : 0),
          y: Y_TIPO - 6,
          width: Math.max(1, ancho - (mm > 1 ? 4 : 0)),
          opacity: (visible ? 1 : 0) * tramo(t, 7.4, 8.0) * fueraCerca * (resalte || t <= 8.6 ? 1 : 0.35),
        });
      });
      etTipo.pintar(X0, Y_TIPO - 26, tramo(t, 7.5, 8.1) * fueraCerca);
      etTipoM.pintar(X0 + ANO - 110, Y_TIPO - 22, tramo(t, 8.2, 8.8) * fueraCerca);
      etTipo12.pintar(X0, Y_TIPO + 34, tramo(t, 8.8, 9.4) * fueraCerca, 'i₁₂ = 0,07 / 12 = 0,005833 por mes');

      // Tres años en meses: n · m periodos.
      const pTres = tramo(t, 11.6, 12.4);
      tres.pintar(pTres, tramo(t, 11.6, 12.6), claves(t, [[12.0, 0], [13.6, 36]], curvas.lineal));
      etAnos.pintar(X0 + 3 * ANO + 50, Y + 130, pTres);
      etNm.pintar(X0 + 1.5 * ANO, Y + 250, ventana(t, 12.6, 15.6));

      franja.pintar(X0 + 1.5 * ANO, Y, ALTO, tramo(t, 14.8, 15.1));
      etI.pintar(X0 + 1.5 * ANO, Y - ALTO - 50, tramo(t, 15.0, 15.6) * (1 - tramo(t, 17.4, 17.8)));

      formula.opacidad(tramo(t, 14.2, 14.3));
      formula.construir(t, 14.3, {
        origenes: {
          I: l.aPantalla({ x: X0 + 1.5 * ANO, y: Y - ALTO - 70 }),
          C_0: { x: 120, y: 60 },
          i_m: { x: 300, y: 60 },
          n: l.aPantalla({ x: X0 + 1.5 * ANO - 200, y: Y + 230 }),
          m: l.aPantalla({ x: X0 + 1.5 * ANO + 60, y: Y + 230 }),
        },
      });
      sust.opacidad(tramo(t, 15.8, 15.9) * mezclar(1, 0.6, tramo(t, 17.6, 18.0)));
      sust.construir(t, 15.9, { escalon: 0.04 });
      dias1.opacidad(tramo(t, 17.9, 18.0));
      dias1.construir(t, 18.0, { escalon: 0.05 });
      dias2.opacidad(tramo(t, 18.5, 18.6));
      dias2.construir(t, 18.6, { escalon: 0.05 });
      rot1.pintar(220, 532, tramo(t, 18.3, 18.8));
      rot2.pintar(500, 532, tramo(t, 18.9, 19.4));
    };
  },
};
