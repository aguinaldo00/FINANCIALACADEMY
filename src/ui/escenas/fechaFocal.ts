import type { Escena } from '../motion/reproductor.ts';
import { Rotulo } from '../motion/motivos.ts';
import { fijar } from '../motion/lienzo.ts';
import { curvas, tramo, ventana } from '../motion/tiempo.ts';
import { FOCAL_EJEMPLO, valorEnFocal } from '../../domain/tema2/equivalencia.ts';

/*
 * Equivalencia de capitales en una fecha focal X (como en los ejercicios del libro): tres letras con
 * vencimientos distintos. La que vence 40 días antes de X viaja hacia delante (se capitaliza); las que
 * vencen 300 y 50 días después viajan hacia atrás (se descuentan). Ya en X, se suman. Cada letra es una
 * barra sobre el eje de días, de altura proporcional a su importe. Las cifras salen de valorEnFocal
 * (src/domain/tema2/equivalencia.ts).
 */
const { capitales, focal, metodo, tipo, base } = FOCAL_EJEMPLO;
const R = valorEnFocal(capitales, focal, metodo, tipo, base);
const eur = (v: number) => `${new Intl.NumberFormat('de-DE', { minimumFractionDigits: Number.isInteger(v) ? 0 : 2, maximumFractionDigits: 2 }).format(v)} €`;
const pctTipo = `${tipo * 100} %`;
const antes = R.lineas.filter((l) => l.sentido === 'delante');
const despues = R.lineas.filter((l) => l.sentido === 'atras');

export const escenaFechaFocal: Escena = {
  id: 'fecha-focal',
  titulo: 'Llevar varias letras a una fecha focal',
  duracion: 24,
  descripcion: `Tres letras con vencimientos distintos se llevan a la misma fecha X. La que vence ${antes.map((l) => l.dias).join(' y ')} días antes de X se capitaliza; las que vencen ${despues.map((l) => l.dias).join(' y ')} días después se descuentan. En X suman ${eur(R.total)}.`,
  capitulos: [
    { t: 0, texto: `Tres letras (${capitales.map((c) => eur(c.nominal)).join(', ')}), cada una con su vencimiento. Así no se pueden sumar: cada euro está en una fecha distinta.` },
    { t: 3.2, texto: 'Se elige una fecha focal X (la del enunciado: hoy, la de un pago o la de la letra nueva). Todo se lleva a esa fecha.' },
    { t: 6.4, texto: `Cada letra tiene su propio tiempo: los días entre su vencimiento y X. Aquí ${R.lineas.map((l) => `${l.dias} días ${l.sentido === 'delante' ? 'antes' : 'después'}`).join(', ')}.` },
    { t: 10.4, texto: `La que vence antes de X va hacia delante: se capitaliza, $C · (1 + t · i)$ al ${pctTipo}. ${eur(antes[0]!.nominal)} → ${eur(antes[0]!.valor)}.` },
    { t: 14.6, texto: `Las que vencen después de X van hacia atrás: se descuentan, $N · (1 - t · d)$. ${despues.map((l) => `${eur(l.nominal)} → ${eur(l.valor)}`).join(' y ')}.` },
    { t: 19.8, texto: `Ya están todas en X: ahora sí se suman. ${R.lineas.map((l) => eur(l.valor)).join(' + ')} = ${eur(R.total)}.` },
  ],
  montar(l) {
    const MAX = Math.max(...capitales.map((c) => c.vence)) + 20;
    const x = (dias: number) => 70 + (600 * dias) / MAX;
    const EJE = 410;
    const ESCALA = 0.04;
    const xf = x(focal);
    // Ya en X, las barras quedan juntas, en el orden en que llegan.
    const llegada = [xf - 66, xf + 66, xf];
    const eje = l.el('line', { class: 'mo-grafico-eje', x1: 50, x2: 690, y1: EJE, y2: EJE });
    const etHoy = new Rotulo(l, 'días →', 'mo-rotulo', 'end');
    const linFocal = l.el('line', { class: 'mo-guia', x1: xf, x2: xf, y1: 150, y2: EJE + 6 });
    const etFocal = new Rotulo(l, 'X · fecha focal', 'mo-eje-texto on', 'middle');
    const filas = R.lineas.map((ln, k) => ({
      barra: l.el('rect', { class: 'rem-barra s-cn', width: 24, rx: 3 }),
      nombre: new Rotulo(l, `Letra ${k + 1}`, 'mo-eje-texto on', 'middle'),
      importe: new Rotulo(l, '', `mo-cifra mo-cifra-peq ${ln.sentido === 'delante' ? 's-cn' : 's-c0'}`, 'middle'),
      tramoLinea: l.el('line', { class: 'mo-guia', y1: EJE + 66 + k * 30, y2: EJE + 66 + k * 30, x1: Math.min(x(ln.vence), xf), x2: Math.min(x(ln.vence), xf) }),
      tramoTexto: new Rotulo(l, `${ln.sentido === 'delante' ? '' : '← '}${ln.dias} días${ln.sentido === 'delante' ? ' →' : ''}`, 'mo-cifra mo-cifra-peq s-n', 'middle'),
    }));
    const fxDelante = l.formula('C · (1 + t · i)', { x: 360, y: 80, tam: 32 });
    const fxAtras = l.formula('N · (1 - t · d)', { x: 360, y: 80, tam: 32 });
    const total = new Rotulo(l, `En X: ${eur(R.total)}`, 'mo-cifra s-cn', 'middle');

    return (t) => {
      l.camara(360, 300, 1);
      l.foco(360, 300, 360);
      fijar(eje, { opacity: tramo(t, 0, 0.5) });
      etHoy.pintar(690, EJE + 46, tramo(t, 0.2, 0.6));
      fijar(linFocal, { opacity: tramo(t, 3.4, 4.0) });
      etFocal.pintar(xf, 138, tramo(t, 3.6, 4.2));
      R.lineas.forEach((ln, k) => {
        const f = filas[k]!;
        const t0 = 0.4 + k * 0.5;
        // Viaje: la de antes en el capítulo 4; las de después en el 5.
        const tv = ln.sentido === 'delante' ? 10.8 : 15.0 + (k % 2) * 0.4;
        const p = tramo(t, tv, tv + 1.6, curvas.suave);
        const xc = x(ln.vence) + (llegada[k]! - x(ln.vence)) * p;
        const alto = (ln.nominal + (ln.valor - ln.nominal) * p) * ESCALA;
        const op = tramo(t, t0, t0 + 0.4);
        fijar(f.barra, { x: xc - 12, y: EJE - alto, height: alto, opacity: op });
        f.nombre.pintar(xc, EJE + 22, op);
        // Mientras viaja, sin cifra; al llegar, su valor en X.
        f.importe.pintar(xc, EJE - alto - 10, p <= 0 ? op : tramo(t, tv + 1.6, tv + 2.0), p >= 1 ? eur(ln.valor) : eur(ln.nominal));
        // El tramo de días entre el vencimiento y X.
        const pt = tramo(t, 6.6 + k * 0.6, 7.4 + k * 0.6, curvas.suave);
        const a = Math.min(x(ln.vence), xf);
        const b = Math.max(x(ln.vence), xf);
        fijar(f.tramoLinea, { x1: a, x2: a + (b - a) * pt, opacity: pt > 0 ? 1 : 0 });
        f.tramoTexto.pintar((a + b) / 2, EJE + 60 + k * 30, tramo(t, 7.2 + k * 0.6, 7.6 + k * 0.6));
      });
      fxDelante.opacidad(ventana(t, 10.5, 14.9, 0.3));
      fxDelante.construir(t, 10.6, { escalon: 0.06 });
      fxAtras.opacidad(ventana(t, 14.9, 20.1, 0.3));
      fxAtras.construir(t, 15.0, { escalon: 0.06 });
      total.pintar(xf, 80, tramo(t, 20.1, 20.6));
    };
  },
};
