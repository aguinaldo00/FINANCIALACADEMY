/*
 * Tema 1 · Escena 4 · Quién vigila qué: la estructura de supervisión del sistema español.
 * Idea única: se supervisa el producto, no la oficina. De la ventanilla de un mismo banco salen un
 * depósito, un fondo de inversión y un seguro; cada supervisor los busca con su luz, aunque tenga
 * que cruzar la escena: Banco de España (entidades de crédito, EFC, EDE), CNMV (bolsa, ESI, IIC) y
 * DGSFP (aseguradoras y fondos de pensiones). Por encima del Banco de España, solo para las
 * entidades de crédito, el MUS del BCE.
 * Exactitud: definiciones de «bde», «cnmv», «dgsfp», «mus» y la infografía «supervisores»
 * (src/content/temas/tema-01). No se mezclan competencias: cada haz llega a un solo producto.
 */
import type { Escena } from '../../motion/reproductor.ts';
import { fijar, situar } from '../../motion/lienzo.ts';
import { claves, curvas, tramo } from '../../motion/tiempo.ts';
import { Palabra, prepararNoche, resplandor } from './nocturno.ts';

const LAMPARAS = 128;
const PRODUCTOS = 344;
const OFICINA = 360;

interface Supervisor { id: string; nombre: string; x: number; color: string; alcance: string; producto: number; inicio: number }

const SUPERVISORES: Supervisor[] = [
  { id: 'bde', nombre: 'Banco de España', x: 170, color: '#6fa9ea', alcance: 'entidades de crédito · EFC · EDE', producto: 360, inicio: 8.2 },
  { id: 'cnmv', nombre: 'CNMV', x: 360, color: '#5cc6c1', alcance: 'bolsa · ESI · IIC', producto: 510, inicio: 11.6 },
  { id: 'dgsfp', nombre: 'DGSFP', x: 550, color: '#a796e8', alcance: 'aseguradoras · fondos de pensiones', producto: 210, inicio: 15.0 },
];

export const escenaSupervision: Escena = {
  id: 'sf-supervision',
  ambiente: 'noche',
  titulo: 'Quién vigila qué: la supervisión en España',
  duracion: 22,
  descripcion: 'De la ventanilla de un banco salen un depósito, un fondo de inversión y un seguro. El Banco de España ilumina el depósito (entidades de crédito, EFC y EDE); la CNMV, el fondo (bolsa, ESI e IIC); la DGSFP, el seguro (aseguradoras y fondos de pensiones). Sobre el Banco de España, para las entidades de crédito, el MUS del BCE. Se supervisa el producto, no la oficina.',
  capitulos: [
    { t: 0, texto: 'En la oficina de un banco te pueden ofrecer productos muy distintos: un depósito, un fondo de inversión, un seguro.' },
    { t: 4.4, texto: '¿Quién los vigila? En España la supervisión va por el tipo de producto y de mercado, no por la oficina donde se vende.' },
    { t: 8.0, texto: 'El Banco de España supervisa las entidades de crédito —y con ellas los depósitos—, los EFC y las entidades de dinero electrónico.' },
    { t: 11.4, texto: 'La CNMV, los mercados de valores (bolsa), las empresas de servicios de inversión y las instituciones de inversión colectiva, como los fondos.' },
    { t: 14.8, texto: 'La DGSFP, adscrita al Ministerio de Economía, las compañías aseguradoras y los fondos de pensiones.' },
    { t: 18.2, texto: 'Y desde 2014, las entidades de crédito están además dentro del Mecanismo Único de Supervisión, liderado por el BCE.' },
  ],
  montar(l) {
    const luz = prepararNoche(l);
    const p = l.prefijo;
    l.defs.insertAdjacentHTML('beforeend', SUPERVISORES.map((s) => `<linearGradient id="${p}-haz-${s.id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s.color}" stop-opacity=".62"/><stop offset=".85" stop-color="${s.color}" stop-opacity=".12"/><stop offset="1" stop-color="${s.color}" stop-opacity="0"/></linearGradient>`).join(''));
    const haces = l.grupo({ class: 't1-haces' });

    // La oficina: fachada clásica con una ventanilla encendida.
    const oficina = l.grupo({ class: 't1-dibujo' });
    const brilloOficina = resplandor(l, luz.resplandor, oficina);
    l.el('path', { d: `M${OFICINA - 150} 470 L${OFICINA} 420 L${OFICINA + 150} 470 Z`, class: 't1-trazo', fill: 'none' }, oficina);
    [-120, -80, 80, 120].forEach((dx) => l.el('line', { x1: OFICINA + dx, x2: OFICINA + dx, y1: 476, y2: 548, class: 't1-trazo' }, oficina));
    l.el('line', { x1: OFICINA - 170, x2: OFICINA + 170, y1: 552, y2: 552, class: 't1-trazo' }, oficina);
    const ventanilla = l.el('rect', { x: OFICINA - 52, y: 494, width: 104, height: 40, class: 't1-ventana' }, oficina);

    // Tres productos que salen por la misma ventanilla.
    const productos = new Map<number, { g: SVGGElement; etiqueta: Palabra; nombre: string }>();
    const dibujo = (x: number, nombre: string, trazo: (g: SVGGElement) => void) => {
      const g = l.grupo({ class: 't1-dibujo t1-producto' });
      trazo(g);
      productos.set(x, { g, etiqueta: new Palabra(l, nombre, 't1-rotulo', l.frente), nombre });
    };
    dibujo(360, 'depósito', (g) => [0, 1, 2].forEach((k) => l.el('rect', { x: -16, y: 8 - k * 9, width: 32, height: 7, rx: 3.5, class: 't1-moneda-pila' }, g)));
    dibujo(510, 'fondo de inversión', (g) => {
      l.el('circle', { r: 17, class: 't1-trazo' }, g);
      l.el('path', { d: 'M0 0 V-17 M0 0 L15 8 M0 0 L-15 8', class: 't1-trazo-fino' }, g);
    });
    dibujo(210, 'seguro', (g) => l.el('path', { d: 'M-19 0 Q-19 -18 0 -18 Q19 -18 19 0 Q14 -5 9.5 0 Q5 -5 0 0 Q-5 -5 -9.5 0 Q-14 -5 -19 0 Z M0 0 V14 q0 5 -5 5', class: 't1-trazo', fill: 'none' }, g));

    // Los supervisores: lámparas arriba; su haz busca su producto aunque tenga que cruzar.
    const sup = SUPERVISORES.map((s) => {
      const lampara = l.grupo({ class: 't1-dibujo' });
      l.el('path', { d: `M${s.x - 16} ${LAMPARAS - 6} h32 l-6 -12 h-20 Z`, class: 't1-trazo', fill: 'none' }, lampara);
      const bombilla = l.el('circle', { cx: s.x, cy: LAMPARAS, r: 5, fill: s.color, class: 't1-bombilla' }, lampara);
      const haz = l.el('path', { fill: `url(#${p}-haz-${s.id})`, class: 't1-haz' }, haces);
      const halo = l.el('circle', { r: 0, fill: s.color, class: 't1-halo-producto' }, haces);
      return { s, lampara, bombilla, haz, halo, nombre: new Palabra(l, s.nombre, 't1-supervisor', l.frente), alcance: new Palabra(l, s.alcance, 't1-alcance', l.frente) };
    });

    // Capa europea: solo sobre el Banco de España (entidades de crédito).
    const europa = l.grupo({ class: 't1-dibujo' });
    l.el('circle', { cx: 170, cy: 30, r: 7, class: 't1-europa' }, europa);
    l.el('path', { d: 'M170 40 V104', class: 't1-trazo-fino t1-discontinuo', fill: 'none' }, europa);
    const bce = new Palabra(l, 'BCE · Mecanismo Único de Supervisión', 't1-alcance t1-europa-texto', l.frente, 'start');
    const lema = new Palabra(l, 'Se supervisa el producto, no la oficina.', 't1-palabra-final', l.frente);
    const en = (q: { x: number; y: number }) => l.aPantalla(q);

    return (t) => {
      l.camara(
        claves(t, [[0, 360], [4.0, 360], [18.0, 360], [19.0, 350]]),
        claves(t, [[0, 440], [3.8, 440], [5.4, 330], [18.0, 330], [19.0, 300]]),
        claves(t, [[0, 1.45], [3.8, 1.3], [5.4, 1.0], [18.0, 1.02], [19.0, 0.92]]),
      );
      l.foco(360, claves(t, [[0, 480], [5.4, 300]]), claves(t, [[0, 220], [5.4, 360]]));

      fijar(oficina, { opacity: tramo(t, 0.2, 1.4) });
      fijar(ventanilla, { 'fill-opacity': 0.08 + 0.8 * tramo(t, 1.0, 1.8) });
      fijar(brilloOficina, { cx: OFICINA, cy: 514, r: 110 * tramo(t, 1.0, 2.2) });

      // Salen los productos (uno tras otro) y esperan; al preguntar quién los vigila, laten.
      [...productos.entries()].forEach(([x, prod], k) => {
        const q = tramo(t, 1.8 + k * 0.45, 2.9 + k * 0.45, curvas.salida);
        const late = t > 4.6 && t < 8 ? 1 + 0.05 * Math.sin((t - 4.6) * 5 + k) : 1;
        situar(prod.g, OFICINA + (x - OFICINA) * q, 514 + (PRODUCTOS - 514) * q, late, tramo(t, 1.8 + k * 0.45, 2.2 + k * 0.45));
        const e = en({ x, y: PRODUCTOS + 44 });
        prod.etiqueta.pintar(e.x, e.y, tramo(t, 2.6 + k * 0.45, 3.4 + k * 0.45));
      });

      sup.forEach(({ s, lampara, bombilla, haz, halo, nombre, alcance }, k) => {
        fijar(lampara, { opacity: tramo(t, 4.6 + k * 0.3, 5.6 + k * 0.3) });
        const encendido = tramo(t, s.inicio, s.inicio + 0.9);
        fijar(bombilla, { r: (4 + 3 * encendido).toFixed(1), 'fill-opacity': 0.25 + 0.75 * encendido });
        // El haz baja desde la lámpara y se abre hasta el producto.
        const largo = tramo(t, s.inicio, s.inicio + 1.0, curvas.salida);
        const fx = s.x + (s.producto - s.x) * largo;
        const fy = LAMPARAS + (PRODUCTOS + 6 - LAMPARAS) * largo;
        const ancho = 6 + 40 * largo;
        fijar(haz, { d: `M${s.x - 6} ${LAMPARAS + 4} L${s.x + 6} ${LAMPARAS + 4} L${(fx + ancho).toFixed(1)} ${fy.toFixed(1)} L${(fx - ancho).toFixed(1)} ${fy.toFixed(1)} Z`, opacity: largo > 0 ? 0.9 : 0 });
        fijar(halo, { cx: s.producto, cy: PRODUCTOS, r: (46 * tramo(t, s.inicio + 0.8, s.inicio + 1.4)).toFixed(1), 'fill-opacity': 0.16 });
        const n = en({ x: s.x, y: LAMPARAS - 30 });
        nombre.pintar(n.x, n.y, tramo(t, 4.8 + k * 0.3, 5.6 + k * 0.3));
        const a = en({ x: s.x, y: LAMPARAS + 34 });
        alcance.pintar(a.x, a.y, tramo(t, s.inicio + 0.9, s.inicio + 1.7), 0, 3);
      });

      fijar(europa, { opacity: tramo(t, 18.4, 19.4) });
      const b = en({ x: 184, y: 34 });
      bce.pintar(b.x, b.y, tramo(t, 18.8, 19.6), 0, 3);
      lema.pintar(360, 588, tramo(t, 19.8, 20.8));
    };
  },
};
