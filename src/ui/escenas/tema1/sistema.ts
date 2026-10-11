/*
 * Tema 1 · Escena 1 · El sistema financiero: del que le sobra al que le falta.
 * Idea única: el sistema financiero tiende puentes para que el ahorro de quien tiene superávit
 * llegue a quien tiene déficit y lo invierte. Dos orillas separadas por un vacío; tres puentes
 * (instrumentos, mercados, intermediarios); el dinero los cruza y enciende el edificio en obras.
 * Textos: definición, esquema y frase de «sf» (src/content/temas/tema-01).
 */
import type { Escena } from '../../motion/reproductor.ts';
import { fijar } from '../../motion/lienzo.ts';
import { claves, tramo } from '../../motion/tiempo.ts';
import { bezier2, Corriente, encadenar, Palabra, prepararNoche, recta, resplandor, Trazado } from './nocturno.ts';

const SUELO = 420;
const BORDE_IZQ = 250;
const BORDE_DER = 470;
const OBRA = 600;

export const escenaSistemaFinanciero: Escena = {
  id: 'sf-sistema',
  ambiente: 'noche',
  titulo: 'El sistema financiero: del que le sobra al que le falta',
  duracion: 19.5,
  descripcion: 'A la izquierda, una casa con dinero de sobra (superávit); a la derecha, un edificio en obras sin dinero (déficit). Tres puentes —instrumentos, mercados e intermediarios— cruzan el vacío; el ahorro pasa por ellos y enciende el edificio: el sistema financiero canaliza el ahorro hacia la inversión.',
  capitulos: [
    { t: 0, texto: 'Hay unidades económicas a las que les sobra dinero: tienen superávit. Son los ahorradores, normalmente las familias.' },
    { t: 3.6, texto: 'A otras les falta para invertir: tienen déficit. Son las empresas y el sector público.' },
    { t: 7.2, texto: 'Entre unas y otras, el sistema financiero tiende puentes: instrumentos, mercados e intermediarios.' },
    { t: 11.2, texto: 'Por ellos el ahorro cruza y se convierte en inversión.' },
    { t: 15.4, texto: 'Sistema financiero = instituciones, medios y mercados cuyo objetivo es canalizar el ahorro a la inversión.' },
  ],
  montar(l) {
    const luz = prepararNoche(l);
    const fondo = l.grupo({ class: 't1-capa-lejos' });
    const delante = l.grupo();

    // Horizonte con un vacío en medio: las dos orillas no se tocan.
    l.el('rect', { x: -400, y: SUELO, width: BORDE_IZQ + 400, height: 160, fill: luz.tierra }, fondo);
    l.el('rect', { x: BORDE_DER, y: SUELO, width: 700, height: 160, fill: luz.tierra }, fondo);
    l.el('line', { x1: -400, x2: BORDE_IZQ, y1: SUELO, y2: SUELO, class: 't1-horizonte' }, fondo);
    l.el('line', { x1: BORDE_DER, x2: 1100, y1: SUELO, y2: SUELO, class: 't1-horizonte' }, fondo);
    // El vacío: una grieta que se abre hacia abajo y se pierde en la oscuridad.
    const vacio = l.el('path', { d: `M${BORDE_IZQ} ${SUELO} L${BORDE_IZQ + 30} ${SUELO + 170} L${BORDE_DER - 30} ${SUELO + 170} L${BORDE_DER} ${SUELO} Z`, fill: luz.vacio }, fondo);

    // La casa (superávit): dibujo a línea con una ventana que se enciende.
    const casa = l.grupo({ class: 't1-dibujo' }, delante);
    const brilloCasa = resplandor(l, luz.resplandor, casa);
    l.el('path', { d: `M80 ${SUELO} V350 H170 V${SUELO}`, class: 't1-trazo' }, casa);
    l.el('path', { d: 'M70 352 L125 312 L180 352', class: 't1-trazo' }, casa);
    const ventanaCasa = l.el('rect', { x: 96, y: 366, width: 26, height: 24, class: 't1-ventana' }, casa);
    l.el('rect', { x: 136, y: 382, width: 20, height: 38, class: 't1-trazo-fino' }, casa);
    const pila = [0, 1, 2, 3, 4, 5].map((k) => l.el('rect', { x: 196, y: SUELO - 9 - k * 9, width: 34, height: 7, rx: 3.5, class: 't1-moneda-pila' }, delante));

    // La obra (déficit): andamio que se dibuja y ventanas que se encienden cuando llega el dinero.
    const obra = l.grupo({ class: 't1-dibujo' }, delante);
    const postes = [0, 1, 2, 3].map((k) => l.el('line', { x1: OBRA - 60 + k * 40, x2: OBRA - 60 + k * 40, y1: SUELO, y2: SUELO, class: 't1-trazo' }, obra));
    const pisos = [0, 1, 2, 3, 4].map((k) => l.el('line', { x1: OBRA - 60, x2: OBRA - 60, y1: SUELO - 34 - k * 34, y2: SUELO - 34 - k * 34, class: 't1-trazo-fino' }, obra));
    const ventanas: SVGRectElement[] = [];
    for (let piso = 0; piso < 5; piso++) for (let c = 0; c < 3; c++) ventanas.push(l.el('rect', { x: OBRA - 52 + c * 40, y: SUELO - 30 - piso * 34, width: 24, height: 22, class: 't1-ventana' }, obra));
    const grua = l.el('path', { d: `M${OBRA + 80} ${SUELO} V230 M${OBRA + 80} 238 H${OBRA - 40} M${OBRA + 80} 238 H${OBRA + 120} M${OBRA - 20} 238 V262`, class: 't1-trazo-fino', fill: 'none' }, obra);
    const brilloObra = resplandor(l, luz.resplandor, obra);

    // Tres puentes a distinta profundidad: el más lejano, más alto, más fino y más tenue.
    const nombres = ['intermediarios', 'mercados', 'instrumentos'];
    const puentes = nombres.map((_, k) => {
      const ancla = SUELO - 14 - k * 26;
      const arco = bezier2({ x: BORDE_IZQ - 6 + k * 12, y: ancla }, { x: 360, y: ancla - 74 - k * 10 }, { x: BORDE_DER + 6 - k * 12, y: ancla });
      return { arco, trazado: new Trazado(l, arco, `t1-puente t1-puente-${k}`, delante), cima: arco(0.5) };
    });
    const rotulos = nombres.map((n) => new Palabra(l, n, 't1-rotulo', delante));

    // El dinero: de la pila de la casa, por cada puente, hasta la obra.
    const corrientes = puentes.map((p, k) => {
      const desde = { x: 213, y: SUELO - 60 };
      const hasta = { x: OBRA - 20, y: SUELO - 90 + k * 14 };
      const camino = new Trazado(l, encadenar(recta(desde, p.arco(0)), p.arco, recta(p.arco(1), hasta)), 't1-camino', delante);
      return { camino, monedas: new Corriente(l, camino, luz.moneda, 10, delante) };
    });

    const superavit = new Palabra(l, 'superávit', 't1-palabra-grande t1-verde', l.frente);
    const deficit = new Palabra(l, 'déficit', 't1-palabra-grande t1-coral', l.frente);
    const familias = new Palabra(l, 'familias', 't1-rotulo', l.frente);
    const empresas = new Palabra(l, 'empresas · sector público', 't1-rotulo', l.frente);
    const ahorro = new Palabra(l, 'ahorro', 't1-palabra-final', l.frente);
    const inversion = new Palabra(l, 'inversión', 't1-palabra-final', l.frente);
    const flecha = l.el('path', { class: 't1-flecha-final', fill: 'none' }, l.frente);

    return (t) => {
      l.camara(
        claves(t, [[0, 150], [3.4, 168], [5.0, 575], [7.0, 575], [8.8, 360], [15.4, 360]]),
        claves(t, [[0, 372], [3.4, 372], [5.0, 352], [7.0, 352], [8.8, 345], [15.4, 330]]),
        claves(t, [[0, 1.75], [3.4, 1.75], [5.0, 1.55], [7.0, 1.55], [8.8, 1.0], [15.4, 0.98]]),
      );
      l.foco(claves(t, [[0, 130], [4.5, 580], [8.5, 360]]), claves(t, [[0, 380], [8.5, 340]]), claves(t, [[0, 200], [8.5, 340]]));

      // 1 · La casa y su ahorro.
      const pCasa = tramo(t, 0.2, 1.2);
      fijar(casa, { opacity: pCasa });
      fijar(ventanaCasa, { 'fill-opacity': 0.15 + 0.85 * tramo(t, 0.8, 1.6) });
      fijar(brilloCasa, { cx: 109, cy: 378, r: 90 * tramo(t, 0.8, 2.0) });
      // La pila crece y, cuando el dinero sale, baja.
      const salen = tramo(t, 11.4, 15.0, (p) => p);
      pila.forEach((m, k) => fijar(m, { opacity: tramo(t, 1.2 + k * 0.28, 1.5 + k * 0.28) * (k < 6 - Math.round(salen * 4) ? 1 : 0) }));
      const ps = tramo(t, 1.0, 2.0);
      superavit.pintar(l.aPantalla({ x: 150, y: 290 }).x, l.aPantalla({ x: 150, y: 290 }).y, ps, tramo(t, 3.6, 4.4));
      familias.pintar(l.aPantalla({ x: 125, y: 452 }).x, l.aPantalla({ x: 125, y: 452 }).y, tramo(t, 1.4, 2.4), tramo(t, 3.6, 4.4));

      // 2 · La obra, a oscuras.
      postes.forEach((p, k) => fijar(p, { y2: SUELO - 175 * tramo(t, 3.8 + k * 0.15, 4.8 + k * 0.15) }));
      pisos.forEach((p, k) => fijar(p, { x2: OBRA - 60 + 120 * tramo(t, 4.4 + k * 0.12, 5.2 + k * 0.12) }));
      fijar(grua, { opacity: tramo(t, 5.0, 5.8) });
      const pd = tramo(t, 5.0, 6.0);
      deficit.pintar(l.aPantalla({ x: 590, y: 236 }).x, l.aPantalla({ x: 590, y: 236 }).y, pd, tramo(t, 7.2, 8.0));
      empresas.pintar(l.aPantalla({ x: 590, y: 452 }).x, l.aPantalla({ x: 590, y: 452 }).y, tramo(t, 5.4, 6.4), tramo(t, 7.2, 8.0));

      // 3 · El vacío y los puentes.
      fijar(vacio, { opacity: tramo(t, 7.4, 8.6) });
      puentes.forEach((p, k) => {
        p.trazado.pintar(tramo(t, 8.6 + k * 0.55, 9.8 + k * 0.55), 1);
        const c = l.aPantalla({ x: p.cima.x, y: p.cima.y - 14 });
        rotulos[k]!.pintar(c.x, c.y, tramo(t, 9.3 + k * 0.55, 10.1 + k * 0.55), tramo(t, 15.4, 16.2));
      });

      // 4 · El ahorro cruza y enciende la obra.
      let llegadas = 0;
      corrientes.forEach((c, k) => {
        c.camino.pintar(tramo(t, 11.2 + k * 0.3, 12.2 + k * 0.3), 0.5);
        llegadas += c.monedas.pintar(t, 11.4 + k * 0.3, 14.6, 1.9, 0.42);
      });
      const encendidas = Math.min(ventanas.length, Math.round(llegadas * 0.6));
      ventanas.forEach((v, k) => fijar(v, { 'fill-opacity': k < encendidas ? 0.95 : 0.06 }));
      fijar(brilloObra, { cx: OBRA, cy: SUELO - 90, r: 150 * tramo(t, 12.4, 15.5) });

      // 5 · Ahorro → inversión.
      const pf = tramo(t, 15.6, 16.6);
      const a = l.aPantalla({ x: 150, y: 270 });
      const b = l.aPantalla({ x: 590, y: 200 });
      ahorro.pintar(a.x, a.y, pf);
      inversion.pintar(b.x, b.y, tramo(t, 16.4, 17.4));
      const f = tramo(t, 16.0, 17.2);
      fijar(flecha, { d: `M${a.x + 54} ${a.y - 8} Q ${(a.x + b.x) / 2} ${Math.min(a.y, b.y) - 70} ${b.x - 70} ${b.y - 8}`, 'stroke-dasharray': '600 600', 'stroke-dashoffset': (600 * (1 - f)).toFixed(0), opacity: f > 0 ? 1 : 0 });
    };
  },
};
