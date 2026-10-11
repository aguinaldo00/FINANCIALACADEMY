/*
 * Tema 1 · Escena 3 · Intermediación directa e indirecta: dos caminos para el dinero.
 * Idea única: el ahorro llega a la empresa por arriba, en un solo tramo y cara a cara, o por abajo,
 * en dos tramos y con el banco en medio. El recorrido del dinero es el protagonista: la cámara lo
 * acompaña por cada camino y al final los dos quedan encendidos, uno junto al otro.
 * Textos: definiciones de «directa», «indirecta» e «intermediario» (src/content/temas/tema-01).
 */
import type { Escena } from '../../motion/reproductor.ts';
import { fijar, situar } from '../../motion/lienzo.ts';
import { claves, curvas, tramo } from '../../motion/tiempo.ts';
import { bezier2, Corriente, Palabra, prepararNoche, resplandor, Trazado } from './nocturno.ts';

const AHORRADOR = { x: 92, y: 300 };
const EMPRESA = { x: 628, y: 300 };
const BANCO = { x: 360, y: 470 };

export const escenaDosCaminos: Escena = {
  id: 'sf-caminos',
  ambiente: 'noche',
  titulo: 'Intermediación directa e indirecta: dos caminos para el dinero',
  duracion: 22,
  descripcion: 'Un ahorrador a la izquierda y una empresa a la derecha. Por arriba, el dinero va directo a la empresa y vuelve un título (bono o acción): se conocen y el ahorrador asume el riesgo. Por abajo, el dinero entra en el banco como depósito y sale como préstamo: ahorrador y empresa no tienen contacto y el banco garantiza la devolución.',
  capitulos: [
    { t: 0, texto: 'El ahorro puede llegar a la empresa por dos caminos.' },
    { t: 3.4, texto: 'Directo: la empresa emite instrumentos financieros —bonos, acciones— y el ahorrador los compra.' },
    { t: 8.0, texto: 'Aquí el ahorrador sabe a quién financia y asume el riesgo.' },
    { t: 11.2, texto: 'Indirecto: el ahorrador ingresa su excedente en el banco…' },
    { t: 14.6, texto: '…y el banco lo hace llegar a la empresa. Ahorrador y empresa no tienen contacto entre ellos.' },
    { t: 18.2, texto: 'Un tramo y cara a cara, o dos tramos con un intermediario en medio que le garantiza al ahorrador que recuperará su dinero.' },
  ],
  montar(l) {
    const luz = prepararNoche(l);
    l.el('line', { x1: -300, x2: 1020, y1: 560, y2: 560, class: 't1-horizonte' });

    // Los dos caminos, primero como un rastro tenue.
    const arriba = bezier2({ x: 118, y: 270 }, { x: 360, y: 96 }, { x: 600, y: 270 });
    const depositoRuta = bezier2({ x: 112, y: 330 }, { x: 170, y: 470 }, { x: 318, y: 468 });
    const prestamoRuta = bezier2({ x: 402, y: 468 }, { x: 552, y: 470 }, { x: 606, y: 330 });
    const rastroArriba = new Trazado(l, arriba, 't1-rastro');
    const rastroDep = new Trazado(l, depositoRuta, 't1-rastro');
    const rastroPre = new Trazado(l, prestamoRuta, 't1-rastro');
    const directa = new Trazado(l, arriba, 't1-ruta t1-ruta-directa');
    const deposito = new Trazado(l, depositoRuta, 't1-ruta t1-ruta-indirecta');
    const prestamo = new Trazado(l, prestamoRuta, 't1-ruta t1-ruta-indirecta');
    const monedasDirecta = new Corriente(l, directa, luz.moneda, 9);
    const monedasDeposito = new Corriente(l, deposito, luz.moneda, 9);
    const monedasPrestamo = new Corriente(l, prestamo, luz.moneda, 9);

    // El título que vuelve por el camino directo (la obligación de la empresa, el derecho del ahorrador).
    const bono = l.grupo({ class: 't1-dibujo' });
    l.el('rect', { x: -15, y: -11, width: 30, height: 22, rx: 2, class: 't1-titulo-valor' }, bono);
    l.el('line', { x1: -8, x2: 8, y1: -3, y2: -3, class: 't1-trazo-fino' }, bono);
    l.el('line', { x1: -8, x2: 4, y1: 3, y2: 3, class: 't1-trazo-fino' }, bono);

    // Miradas: por arriba se ven; por abajo, cada uno solo ve al banco.
    const mirada = l.el('line', { x1: AHORRADOR.x + 22, y1: 262, x2: EMPRESA.x - 30, y2: 262, class: 't1-mirada' });
    const miradaAB = l.el('line', { x1: AHORRADOR.x + 14, y1: 330, x2: BANCO.x - 46, y2: BANCO.y - 30, class: 't1-mirada' });
    const miradaEB = l.el('line', { x1: EMPRESA.x - 20, y1: 330, x2: BANCO.x + 46, y2: BANCO.y - 30, class: 't1-mirada' });

    // El ahorrador, la empresa y el banco, dibujados a línea.
    const ahorrador = l.grupo({ class: 't1-dibujo' });
    const brilloA = resplandor(l, luz.resplandor, ahorrador);
    l.el('circle', { cx: AHORRADOR.x, cy: 262, r: 13, class: 't1-trazo' }, ahorrador);
    l.el('path', { d: `M${AHORRADOR.x - 28} 330 Q ${AHORRADOR.x} 270 ${AHORRADOR.x + 28} 330`, class: 't1-trazo', fill: 'none' }, ahorrador);
    const empresa = l.grupo({ class: 't1-dibujo' });
    const brilloE = resplandor(l, luz.resplandor, empresa);
    l.el('path', { d: `M${EMPRESA.x - 36} 330 V280 l18 -14 v14 l18 -14 v14 l18 -14 v14 l18 -14 V330 Z`, class: 't1-trazo', fill: 'none' }, empresa);
    const ventanasE = [0, 1, 2].map((k) => l.el('rect', { x: EMPRESA.x - 26 + k * 20, y: 296, width: 12, height: 14, class: 't1-ventana' }, empresa));
    const banco = l.grupo({ class: 't1-dibujo' });
    const brilloB = resplandor(l, luz.resplandor, banco);
    l.el('path', { d: `M${BANCO.x - 48} ${BANCO.y - 34} L${BANCO.x} ${BANCO.y - 62} L${BANCO.x + 48} ${BANCO.y - 34} Z`, class: 't1-trazo', fill: 'none' }, banco);
    [-34, -12, 12, 34].forEach((dx) => l.el('line', { x1: BANCO.x + dx, x2: BANCO.x + dx, y1: BANCO.y - 30, y2: BANCO.y + 22, class: 't1-trazo' }, banco));
    l.el('line', { x1: BANCO.x - 52, x2: BANCO.x + 52, y1: BANCO.y + 26, y2: BANCO.y + 26, class: 't1-trazo' }, banco);
    const columnasLuz = l.el('rect', { x: BANCO.x - 30, y: BANCO.y - 28, width: 60, height: 48, class: 't1-ventana' }, banco);

    // Riesgo (directa: lo lleva el ahorrador) y garantía (indirecta: la da el banco).
    const riesgo = l.grupo({ class: 't1-dibujo' });
    l.el('path', { d: 'M-12 12 L-8 -6 H8 L12 12 Z M-4 -6 a4 4 0 0 1 8 0', class: 't1-coral-trazo', fill: 'none' }, riesgo);
    const garantia = l.grupo({ class: 't1-dibujo' });
    l.el('path', { d: 'M0 -14 L12 -9 V0 C12 8 6 13 0 15 C-6 13 -12 8 -12 0 V-9 Z', class: 't1-verde-trazo', fill: 'none' }, garantia);

    const r = {
      ahorrador: new Palabra(l, 'ahorrador', 't1-rotulo', l.frente),
      empresa: new Palabra(l, 'empresa', 't1-rotulo', l.frente),
      banco: new Palabra(l, 'banco', 't1-rotulo', l.frente),
      directa: new Palabra(l, 'directa', 't1-palabra-grande t1-rosa', l.frente),
      indirecta: new Palabra(l, 'indirecta', 't1-palabra-grande t1-azul', l.frente),
      bono: new Palabra(l, 'bono · acción', 't1-rotulo', l.frente),
      deposito: new Palabra(l, 'depósito', 't1-rotulo', l.frente),
      prestamo: new Palabra(l, 'préstamo', 't1-rotulo', l.frente),
      riesgo: new Palabra(l, 'riesgo', 't1-rotulo t1-coral', l.frente),
      garantia: new Palabra(l, 'garantía', 't1-rotulo t1-verde', l.frente),
      unTramo: new Palabra(l, 'directa · un tramo, cara a cara', 't1-rotulo-final t1-rosa', l.frente),
      dosTramos: new Palabra(l, 'indirecta · dos tramos, sin contacto', 't1-rotulo-final t1-azul', l.frente),
    };
    const en = (p: { x: number; y: number }) => l.aPantalla(p);

    return (t) => {
      // La cámara acompaña al dinero: arriba, de vuelta al plano general, abajo, y otra vez general.
      l.camara(
        claves(t, [[0, 360], [3.4, 360], [4.6, 250], [7.0, 470], [8.4, 360], [11.0, 360], [12.0, 220], [14.4, 330], [15.6, 470], [17.6, 500], [18.6, 360]]),
        claves(t, [[0, 330], [3.4, 330], [4.6, 230], [7.0, 230], [8.4, 320], [11.0, 320], [12.0, 410], [14.4, 420], [15.6, 410], [17.6, 400], [18.6, 330]]),
        claves(t, [[0, 1.0], [3.4, 1.0], [4.6, 1.3], [7.0, 1.3], [8.4, 1.0], [11.0, 1.0], [12.0, 1.3], [17.6, 1.3], [18.6, 0.98]]),
      );
      l.foco(claves(t, [[0, 360], [4.6, 300], [8.4, 360], [12.0, 250], [15.6, 470], [18.6, 360]]), claves(t, [[0, 320], [4.6, 200], [8.4, 320], [12.0, 430], [18.6, 330]]), 300);

      const pi = tramo(t, 0.2, 1.4);
      fijar(ahorrador, { opacity: pi });
      fijar(empresa, { opacity: tramo(t, 0.6, 1.8) });
      fijar(brilloA, { cx: AHORRADOR.x, cy: 290, r: 70 * pi });
      r.ahorrador.pintar(en({ x: AHORRADOR.x, y: 360 }).x, en({ x: AHORRADOR.x, y: 360 }).y, tramo(t, 0.6, 1.6));
      r.empresa.pintar(en({ x: EMPRESA.x, y: 360 }).x, en({ x: EMPRESA.x, y: 360 }).y, tramo(t, 1.0, 2.0));
      rastroArriba.pintar(tramo(t, 1.6, 3.0), 0.5);
      rastroDep.pintar(tramo(t, 2.0, 3.0), 0.5);
      rastroPre.pintar(tramo(t, 2.4, 3.4), 0.5);

      // Camino directo: el dinero va; el título vuelve.
      directa.pintar(tramo(t, 3.6, 5.2, curvas.lineal));
      monedasDirecta.pintar(t, 3.9, 6.0, 2.0, 0.34);
      const cimaD = en({ x: 360, y: 150 });
      r.directa.pintar(cimaD.x, cimaD.y - 22, tramo(t, 3.6, 4.6), tramo(t, 18.4, 18.9));
      const vuelta = tramo(t, 6.2, 7.8, curvas.suave);
      const pb = arriba(1 - vuelta);
      situar(bono, pb.x, pb.y - 16, 1, tramo(t, 6.0, 6.3) * (1 - tramo(t, 7.8, 8.2)));
      const eb = en({ x: pb.x, y: pb.y - 44 });
      r.bono.pintar(eb.x, eb.y, tramo(t, 6.1, 6.6), tramo(t, 7.8, 8.2));
      ventanasE.forEach((v, k) => fijar(v, { 'fill-opacity': 0.08 + 0.87 * Math.max(tramo(t, 5.4 + k * 0.3, 5.8 + k * 0.3), tramo(t, 16.4 + k * 0.3, 16.8 + k * 0.3)) }));
      fijar(brilloE, { cx: EMPRESA.x, cy: 300, r: 80 * tramo(t, 5.4, 6.6) });

      // Se conocen; el riesgo es del ahorrador.
      const pm = tramo(t, 8.3, 9.3);
      fijar(mirada, { opacity: pm * (1 - 0.75 * tramo(t, 14.8, 15.6)) });
      const pr = tramo(t, 9.0, 9.8, curvas.muelle);
      situar(riesgo, AHORRADOR.x - 62, 352 - (1 - pr) * 40, 1, tramo(t, 9.0, 9.3));
      const er = en({ x: AHORRADOR.x - 62, y: 384 });
      r.riesgo.pintar(er.x, er.y, tramo(t, 9.3, 10.0));

      // Camino indirecto: depósito al banco, préstamo a la empresa.
      fijar(banco, { opacity: tramo(t, 11.2, 12.2) });
      fijar(columnasLuz, { 'fill-opacity': 0.06 + 0.6 * tramo(t, 13.0, 14.0) });
      fijar(brilloB, { cx: BANCO.x, cy: BANCO.y - 10, r: 110 * tramo(t, 13.0, 14.2) });
      const eBanco = en({ x: BANCO.x, y: BANCO.y + 52 });
      r.banco.pintar(eBanco.x, eBanco.y, tramo(t, 11.6, 12.4));
      deposito.pintar(tramo(t, 11.4, 12.8, curvas.lineal));
      monedasDeposito.pintar(t, 11.7, 13.6, 1.6, 0.3);
      const eDep = en(depositoRuta(0.55));
      r.deposito.pintar(eDep.x, eDep.y + 30, tramo(t, 12.0, 12.8));
      prestamo.pintar(tramo(t, 14.8, 16.2, curvas.lineal));
      monedasPrestamo.pintar(t, 15.1, 17.0, 1.6, 0.3);
      const ePre = en(prestamoRuta(0.45));
      r.prestamo.pintar(ePre.x, ePre.y + 30, tramo(t, 15.2, 16.0));
      fijar(miradaAB, { opacity: tramo(t, 15.4, 16.2) });
      fijar(miradaEB, { opacity: tramo(t, 15.6, 16.4) });

      // La diferencia, con los dos caminos encendidos a la vez.
      const pg = tramo(t, 18.6, 19.6, curvas.muelle);
      situar(garantia, BANCO.x + 74, BANCO.y - 6 - (1 - pg) * 30, 1, tramo(t, 18.6, 18.9));
      const eg = en({ x: BANCO.x + 74, y: BANCO.y + 30 });
      r.garantia.pintar(eg.x, eg.y, tramo(t, 18.9, 19.6));
      const e1 = en({ x: 360, y: 128 });
      r.unTramo.pintar(e1.x, e1.y + 8, tramo(t, 18.8, 19.8));
      const e2 = en({ x: 360, y: 548 });
      r.dosTramos.pintar(e2.x, e2.y, tramo(t, 19.2, 20.2));
      const eI = en({ x: 220, y: 520 });
      r.indirecta.pintar(eI.x, eI.y, tramo(t, 11.4, 12.4), tramo(t, 18.4, 18.9));
      // Al final, el dinero vuelve a correr por los dos caminos a la vez.
      if (t > 19) {
        monedasDirecta.pintar(t, 19.0, 30, 2.0, 0.5, 0.9);
        monedasDeposito.pintar(t, 19.2, 30, 1.6, 0.5, 0.9);
        monedasPrestamo.pintar(t, 20.0, 30, 1.6, 0.5, 0.9);
      }
    };
  },
};
