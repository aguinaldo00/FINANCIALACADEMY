/*
 * Tema 1 · Escena 2 · Las funciones del sistema financiero.
 * Idea única: hay una función esencial —canalizar el ahorro— y seis que la sostienen. El dinero
 * fluye por un cauce y la cámara lo acompaña en un travelling; en cada estación, una función con su
 * gesto: la lupa que estudia el proyecto, el depósito que se llena, el intercambio de los pagos, la
 * bifurcación hacia el mejor destino, la onda que se calma y el faro que vigila. Al final, las
 * iniciales forman la regla del contenido: «Ve A Pagar A Este Vendedor».
 * Textos: definición y esquema de «funciones» (src/content/temas/tema-01).
 */
import type { Escena } from '../../motion/reproductor.ts';
import { fijar, situar } from '../../motion/lienzo.ts';
import { claves, limitar, tramo } from '../../motion/tiempo.ts';
import { Corriente, inicialAparte, Palabra, prepararNoche, type Ruta, Trazado } from './nocturno.ts';

const Y = 300;
const LARGO = 1520;
const ESTACIONES = [260, 470, 680, 890, 1100, 1310];
const NOMBRES = ['Viabilidad', 'Ahorro', 'Pagos', 'Asignación', 'Estabilidad', 'Vigilancia'];
const LLEGADA = ESTACIONES.map((_, k) => 4.8 + k * 1.95);

/** El cauce: una línea casi recta con una ondulación muy leve. */
const cauce: Ruta = (u) => ({ x: u * LARGO, y: Y + Math.sin(u * Math.PI * 3) * 10 });

export const escenaFuncionesSistema: Escena = {
  id: 'sf-funciones',
  ambiente: 'noche',
  titulo: 'Las funciones del sistema financiero',
  duracion: 20.5,
  descripcion: 'Un cauce de dinero cruza la pantalla: la función esencial es canalizar el ahorro. A lo largo del cauce, seis estaciones: viabilidad, ahorro, pagos, asignación, estabilidad y vigilancia. Sus iniciales forman «Ve A Pagar A Este Vendedor».',
  capitulos: [
    { t: 0, texto: 'Función esencial: canalizar los recursos de las unidades con superávit hacia las unidades con déficit.' },
    { t: 4.4, texto: 'Además, analiza la viabilidad de los proyectos y fomenta el ahorro.' },
    { t: 8.3, texto: 'Sustenta el sistema de pagos y asigna los recursos de forma eficiente.' },
    { t: 12.2, texto: 'Contribuye a la estabilidad monetaria y financiera y vela por las instituciones.' },
    { t: 16.2, texto: 'Viabilidad · Ahorro · Pagos · Asignación · Estabilidad · Vigilancia → «Ve A Pagar A Este Vendedor».' },
  ],
  montar(l) {
    const luz = prepararNoche(l);
    const linea = new Trazado(l, cauce, 't1-cauce', l.mundo, 120);
    const monedas = new Corriente(l, linea, luz.moneda, 64, l.mundo, 7);
    const estaciones = ESTACIONES.map((x) => {
      const g = l.grupo({ class: 't1-dibujo' });
      l.el('circle', { cx: x, cy: cauce(x / LARGO).y, r: 5, class: 't1-hito' }, g);
      return g;
    });
    const palabras = NOMBRES.map((n) => new Palabra(l, n, 't1-palabra-estacion', l.mundo));
    palabras.forEach((p) => inicialAparte(p.texto));

    // 1 · Viabilidad: la lupa recorre el proyecto antes de que llegue el dinero.
    const proyecto = l.el('path', { d: `M${ESTACIONES[0]! - 22} ${Y + 92} v-30 h18 v-14 h26 v44 Z`, class: 't1-trazo-fino', fill: 'none' });
    const lupa = l.grupo({ class: 't1-dibujo' });
    l.el('circle', { r: 16, class: 't1-trazo' }, lupa);
    l.el('line', { x1: 11, y1: 11, x2: 24, y2: 24, class: 't1-trazo' }, lupa);
    // 2 · Ahorro: un depósito bajo el cauce que se llena.
    const deposito = l.el('path', { d: `M${ESTACIONES[1]! - 34} ${Y + 40} v42 h68 v-42`, class: 't1-trazo', fill: 'none' });
    const nivel = l.el('rect', { x: ESTACIONES[1]! - 32, width: 64, y: Y + 80, height: 0, class: 't1-oro-relleno' });
    // 3 · Pagos: dos puntos que se intercambian dinero por arcos opuestos.
    const pagoA = l.el('circle', { r: 6, class: 't1-oro-relleno' });
    const pagoB = l.el('circle', { r: 6, class: 't1-oro-relleno' });
    const arcosPago = l.el('path', { d: `M${ESTACIONES[2]! - 40} ${Y - 70} Q ${ESTACIONES[2]} ${Y - 112} ${ESTACIONES[2]! + 40} ${Y - 70} Q ${ESTACIONES[2]} ${Y - 28} ${ESTACIONES[2]! - 40} ${Y - 70}`, class: 't1-trazo-fino', fill: 'none' });
    // 4 · Asignación: el cauce se abre y el dinero elige el destino más productivo.
    const xa = ESTACIONES[3]!;
    const ramaBuena = new Trazado(l, (u) => ({ x: xa + u * 70, y: cauce(xa / LARGO).y + u * 64 }), 't1-trazo', l.mundo);
    const ramaFloja = new Trazado(l, (u) => ({ x: xa + u * 70, y: cauce(xa / LARGO).y + u * 120 }), 't1-trazo-fino', l.mundo);
    const destinoBueno = l.el('circle', { cx: xa + 76, cy: cauce(xa / LARGO).y + 68, r: 9, class: 't1-destino' });
    const destinoFlojo = l.el('circle', { cx: xa + 76, cy: cauce(xa / LARGO).y + 124, r: 9, class: 't1-destino t1-destino-flojo' });
    const repartoBueno = new Corriente(l, ramaBuena, luz.moneda, 8, l.mundo, 6);
    // 5 · Estabilidad: una onda sobre el cauce que se va calmando.
    const onda = l.el('path', { class: 't1-trazo', fill: 'none' });
    // 6 · Vigilancia: un faro cuyo haz barre el cauce.
    const xf = ESTACIONES[5]!;
    const faro = l.el('path', { d: `M${xf - 8} ${Y - 40} L${xf - 5} ${Y - 112} H${xf + 5} L${xf + 8} ${Y - 40} Z M${xf - 9} ${Y - 112} h18 v-8 h-18 Z`, class: 't1-trazo', fill: 'none' });
    const haz = l.el('path', { fill: luz.haz, class: 't1-haz' });

    const esencial = new Palabra(l, 'canalizar', 't1-palabra-final', l.frente);
    const regla = ['Ve', 'A', 'Pagar', 'A', 'Este', 'Vendedor'].map((p) => new Palabra(l, p, 't1-regla', l.frente, 'start'));
    regla.forEach((p) => inicialAparte(p.texto));
    const anchos = [34, 22, 70, 22, 52, 112];

    return (t) => {
      const camX = claves(t, [[0, 120], [2.5, 170], ...LLEGADA.map((s, k) => [s, ESTACIONES[k]!] as [number, number]), [16.2, ESTACIONES[5]!], [17.6, 760]]);
      const z = claves(t, [[0, 1.5], [3.8, 1.35], [4.8, 1.25], [16.2, 1.25], [17.6, 0.46]]);
      l.camara(camX, claves(t, [[0, Y], [16.2, Y], [17.6, Y + 30]]), z);
      l.foco(360, 290, 300);

      const dibujado = tramo(t, 0.3, 17.0, (p) => p) * 1.02;
      linea.pintar(dibujado);
      monedas.pintar(t, 0.8, 20, 7.5, 0.3, 1, dibujado);

      // La función esencial, primero a lo grande; luego se retira para dejar sitio a las demás.
      const pe = tramo(t, 1.0, 2.0);
      esencial.pintar(360, 150, pe, tramo(t, 3.9, 4.5));

      ESTACIONES.forEach((x, k) => {
        const llega = LLEGADA[k]!;
        const p = tramo(t, llega - 0.5, llega + 0.3);
        fijar(estaciones[k]!, { opacity: p });
        const arriba = k % 2 === 0;
        const final = tramo(t, 16.2, 17.4);
        palabras[k]!.pintar(x, cauce(x / LARGO).y + (arriba ? -132 : 150) + final * (arriba ? -40 : 40), p, 0, 8);
        // En el plano general, la inicial se enciende.
        fijar(palabras[k]!.texto, { class: final > 0.5 ? 't1-palabra-estacion t1-inicial' : 't1-palabra-estacion' });
      });

      // Gestos de cada función, cuando la cámara llega a su estación.
      const v = tramo(t, LLEGADA[0]! - 0.4, LLEGADA[0]! + 1.4);
      fijar(proyecto, { opacity: tramo(t, LLEGADA[0]! - 0.6, LLEGADA[0]!) });
      situar(lupa, ESTACIONES[0]! - 18 + Math.sin(v * Math.PI * 2) * 24, Y + 66, 1, tramo(t, LLEGADA[0]! - 0.4, LLEGADA[0]!));

      fijar(deposito, { opacity: tramo(t, LLEGADA[1]! - 0.6, LLEGADA[1]!) });
      const lleno = tramo(t, LLEGADA[1]!, LLEGADA[1]! + 1.6);
      fijar(nivel, { y: (Y + 80 - 36 * lleno).toFixed(1), height: (36 * lleno).toFixed(1), opacity: lleno > 0 ? 0.85 : 0 });

      const pp = tramo(t, LLEGADA[2]! - 0.5, LLEGADA[2]!);
      fijar(arcosPago, { opacity: pp * 0.8 });
      const ciclo = limitar((t - LLEGADA[2]!) / 1.4);
      const xp = ESTACIONES[2]!;
      const yArriba = Y - 70 - Math.sin(ciclo * Math.PI) * 42;
      const yAbajo = Y - 70 + Math.sin(ciclo * Math.PI) * 42;
      fijar(pagoA, { cx: (xp - 40 + 80 * ciclo).toFixed(1), cy: yArriba.toFixed(1), opacity: pp });
      fijar(pagoB, { cx: (xp + 40 - 80 * ciclo).toFixed(1), cy: yAbajo.toFixed(1), opacity: pp });

      const pa = tramo(t, LLEGADA[3]! - 0.5, LLEGADA[3]!);
      ramaBuena.pintar(pa);
      ramaFloja.pintar(pa, 0.45);
      fijar(destinoBueno, { opacity: pa, class: t > LLEGADA[3]! + 0.6 ? 't1-destino t1-destino-elegido' : 't1-destino' });
      fijar(destinoFlojo, { opacity: pa * 0.6 });
      repartoBueno.pintar(t, LLEGADA[3]!, 20, 0.8, 0.28);

      const xs = ESTACIONES[4]!;
      const calma = tramo(t, LLEGADA[4]!, LLEGADA[4]! + 1.8);
      const amp = 34 * (1 - calma);
      let d = '';
      for (let k = 0; k <= 40; k++) {
        const x = xs - 80 + k * 4;
        d += `${k ? 'L' : 'M'}${x} ${(cauce(x / LARGO).y - 50 + Math.sin(k * 0.6 + t * 6) * amp * Math.sin((k / 40) * Math.PI)).toFixed(1)} `;
      }
      fijar(onda, { d, opacity: tramo(t, LLEGADA[4]! - 0.6, LLEGADA[4]!) });

      const pf = tramo(t, LLEGADA[5]! - 0.6, LLEGADA[5]!);
      fijar(faro, { opacity: pf });
      const giro = Math.sin((t - LLEGADA[5]!) * 1.6) * 0.7 + 1.57;
      const largo = 260;
      const ax = xf + Math.cos(giro - 0.16) * largo;
      const ay = Y - 116 + Math.sin(giro - 0.16) * largo;
      const bx = xf + Math.cos(giro + 0.16) * largo;
      const by = Y - 116 + Math.sin(giro + 0.16) * largo;
      fijar(haz, { d: `M${xf} ${Y - 116} L${ax.toFixed(1)} ${ay.toFixed(1)} L${bx.toFixed(1)} ${by.toFixed(1)} Z`, opacity: pf * 0.8 });

      // La regla para recordarlas, palabra a palabra.
      let x = 360 - anchos.reduce((s, a) => s + a + 12, 0) / 2;
      regla.forEach((p, k) => {
        p.pintar(x, 540, tramo(t, 17.4 + k * 0.32, 18.0 + k * 0.32), 0, 4);
        x += anchos[k]! + 12;
      });
    };
  },
};
