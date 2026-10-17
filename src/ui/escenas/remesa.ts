import type { Escena } from '../motion/reproductor.ts';
import { Rotulo } from '../motion/motivos.ts';
import { fijar } from '../motion/lienzo.ts';
import { curvas, tramo, ventana } from '../motion/tiempo.ts';
import { liquidarRemesa, REMESA_EJEMPLO } from '../../domain/tema2/remesa.ts';

/*
 * Remesa de tres letras (como en los ejercicios de examen): se llevan al banco el mismo día y cada
 * una vence en una fecha distinta, a 40, 50 y 300 días. Cada letra es una fila: su barra va de HOY a
 * su vencimiento, a escala de días. Después cada una se descuenta con su propio plazo (n = días/360),
 * se le cobra su comisión (con mínimo) y sus gastos, y al final se suma todo. Las cifras salen de
 * liquidarRemesa (src/domain/tema2/remesa.ts), no se escriben a mano.
 */
const { letras, condiciones } = REMESA_EJEMPLO;
const L = liquidarRemesa(letras, condiciones);
const eur = (v: number) => `${new Intl.NumberFormat('de-DE', { minimumFractionDigits: Number.isInteger(v) ? 0 : 2, maximumFractionDigits: 2 }).format(v)} €`;
const MAX_DIAS = Math.max(...letras.map((l) => l.dias));

export const escenaRemesaTres: Escena = {
  id: 'remesa-tres-letras',
  titulo: 'Una remesa de tres letras',
  duracion: 23,
  descripcion: `Tres letras descontadas el mismo día que vencen a ${letras.map((l) => l.dias).join(', ')} días. Cada una tiene su propio plazo (n = días / 360), su descuento, su comisión y sus gastos. Valor líquido = ${eur(L.nominal)} − ${eur(L.descuento)} − ${eur(L.comision)} − ${eur(L.gastos)} = ${eur(L.liquido)}.`,
  capitulos: [
    { t: 0, texto: `Una remesa: la empresa lleva hoy al banco tres letras (${letras.map((l) => eur(l.nominal)).join(', ')}). Cada una vence en una fecha distinta.` },
    { t: 3.4, texto: `El tiempo de cada letra son los días que faltan desde hoy, el día del descuento, hasta su vencimiento: ${letras.map((l) => l.dias).join(', ')} días.` },
    { t: 7.4, texto: `Cada letra tiene su propio $n$. Con año comercial: $n$ = ${letras.map((l) => `${l.dias}/360`).join(', ')}. No se suman los días.` },
    { t: 11.2, texto: `Cada letra se descuenta por separado, $D_c = N · n · d$ al ${condiciones.d * 100} %: ${L.lineas.map((x) => eur(x.descuento)).join(', ')}. Cuanto más tarda en vencer, más se queda el banco.` },
    { t: 15.4, lectura: 18.9, texto: `Comisión del ${condiciones.comision * 100} % con un mínimo de ${eur(condiciones.minimo)}, letra a letra: ${L.lineas.map((x) => eur(x.comision)).join(', ')}${L.lineas.some((x) => x.minimoAplicado) ? ' (la pequeña no llega al mínimo: se cobra el mínimo)' : ''}. Y ${eur(condiciones.gastos)} de correo por letra.` },
    { t: 19.4, texto: `Al final se suma todo. Valor líquido = nominales − descuentos − comisiones − gastos = ${eur(L.nominal)} − ${eur(L.descuento)} − ${eur(L.comision)} − ${eur(L.gastos)} = ${eur(L.liquido)}.` },
  ],
  montar(l) {
    const X0 = 190;
    const X1 = 640;
    const x = (dias: number) => X0 + ((X1 - X0) * dias) / MAX_DIAS;
    const FILAS = [240, 340, 440];
    const EJE = 510;
    const eje = l.el('line', { class: 'mo-grafico-eje', x1: X0, x2: X1 + 30, y1: EJE, y2: EJE });
    const hoy = l.el('line', { class: 'mo-guia', x1: X0, x2: X0, y1: FILAS[0]! - 40, y2: EJE });
    const etHoy = new Rotulo(l, 'HOY', 'mo-eje-texto on', 'middle');
    const etHoy2 = new Rotulo(l, 'día del descuento', 'mo-rotulo', 'middle');
    const etDias = new Rotulo(l, 'días hasta el vencimiento →', 'mo-rotulo', 'end');
    const filas = L.lineas.map((ln, k) => ({
      nombre: new Rotulo(l, `Letra ${k + 1}`, 'mo-eje-texto on', 'end'),
      nominal: new Rotulo(l, eur(ln.nominal), 'mo-cifra mo-cifra-peq s-cn', 'end'),
      barra: l.el('rect', { class: 'rem-barra s-n', height: 26, y: FILAS[k]! - 20, x: X0, rx: 4 }),
      fin: l.el('line', { class: 'mo-guia', x1: x(ln.dias), x2: x(ln.dias), y1: FILAS[k]! + 8, y2: EJE }),
      // Las letras cortas escriben a la derecha de su barra; la larga, dentro.
      dentro: x(ln.dias) > X1 - 200,
      linea1: new Rotulo(l, '', 'mo-cifra mo-cifra-peq', x(ln.dias) > X1 - 200 ? 'end' : 'start'),
      linea2: new Rotulo(l, '', 'mo-cifra mo-cifra-peq s-D', x(ln.dias) > X1 - 200 ? 'end' : 'start'),
    }));
    const formulaDc = l.formula('D_c = N · n · d', { x: 360, y: 96, tam: 34 });
    const final = l.formula(`"Líquido" = ${eur(L.nominal).replace(' €', '')} - ${eur(L.descuento).replace(' €', '')} - ${eur(L.comision).replace(' €', '')} - ${eur(L.gastos).replace(' €', '')} = "${eur(L.liquido)}"`, { x: 360, y: 96, tam: 26 });
    const sumas = new Rotulo(l, '', 'mo-rotulo-claro', 'middle');

    return (t) => {
      l.camara(360, 300, 1);
      l.foco(360, 300, 360);
      fijar(eje, { opacity: tramo(t, 0, 0.5) });
      fijar(hoy, { opacity: tramo(t, 0.2, 0.7) });
      etHoy.pintar(X0, EJE + 28, tramo(t, 0.3, 0.8));
      etHoy2.pintar(X0, EJE + 50, tramo(t, 3.5, 4.0));
      etDias.pintar(X1 + 30, EJE + 28, tramo(t, 3.6, 4.1));
      L.lineas.forEach((ln, k) => {
        const f = filas[k]!;
        const y = FILAS[k]!;
        const t0 = 0.6 + k * 0.5;
        f.nombre.pintar(X0 - 16, y - 8, tramo(t, t0, t0 + 0.4));
        f.nominal.pintar(X0 - 16, y + 16, tramo(t, t0 + 0.2, t0 + 0.6));
        // 2 · la barra crece de HOY al vencimiento.
        const tb = 3.6 + k * 0.6;
        const p = tramo(t, tb, tb + 1.1, curvas.suave);
        fijar(f.barra, { width: Math.max(0.01, (x(ln.dias) - X0) * p), opacity: p > 0 ? 1 : 0 });
        fijar(f.fin, { opacity: tramo(t, tb + 1.0, tb + 1.3) });
        const xt = f.dentro ? x(ln.dias) - 10 : x(ln.dias) + 12;
        // Primera línea: días → n → descuento.
        const texto1 = t < 7.6 ? `${ln.dias} días` : t < 11.4 ? `n = ${ln.dias}/360` : `Dc = ${eur(ln.descuento)}`;
        const aparece1 = t < 7.6 ? tramo(t, tb + 1.0, tb + 1.4) : t < 11.4 ? tramo(t, 7.6 + k * 0.4, 8.0 + k * 0.4) : tramo(t, 11.6 + k * 0.5, 12.0 + k * 0.5);
        f.linea1.pintar(xt, y + 3, aparece1, texto1);
        // Segunda línea: comisión y gastos.
        f.linea2.pintar(xt, y + 34, tramo(t, 15.6 + k * 0.5, 16.0 + k * 0.5), `comisión ${eur(ln.comision)}${ln.minimoAplicado ? ' (mín.)' : ''} · correo ${eur(ln.gastos)}`);
      });
      formulaDc.opacidad(ventana(t, 11.3, 19.3, 0.3));
      formulaDc.construir(t, 11.4, { escalon: 0.06 });
      sumas.pintar(360, 160, ventana(t, 17.6, 19.3, 0.3), `Descuentos ${eur(L.descuento)} · comisiones ${eur(L.comision)} · gastos ${eur(L.gastos)}`);
      final.opacidad(tramo(t, 19.5, 19.6));
      final.construir(t, 19.6, { escalon: 0.04 });
    };
  },
};
