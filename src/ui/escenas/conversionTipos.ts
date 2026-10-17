import { formatear } from '../../domain/tema2/expresion.ts';
import { convertirTipo, unidad, type Convenio, type Regimen, type Unidad } from '../../domain/tema2/periodos.ts';
import type { Capitulo, Escena } from '../motion/reproductor.ts';
import { Capsula, Etiqueta, Guia, Regla, Rotulo } from '../motion/motivos.ts';
import { curvas, tramo } from '../motion/tiempo.ts';

/*
 * Pasar un TIPO de interés de una unidad de tiempo a otra (cualquiera a cualquiera), en simple o en
 * compuesta. Es una fábrica de escenas, como el calendario de duraciones: con el tipo, las dos
 * unidades, el régimen y el convenio de días, monta la animación.
 *
 * La idea que se ve es la definición del temario: dos tipos son equivalentes si llevan el mismo
 * capital al mismo sitio en el mismo tiempo. Se sigue 1 € durante un año sobre el calendario:
 *   1. La pregunta y el calendario.
 *   2. La escalera del tipo de partida: un peldaño por periodo. En simple todos suben lo mismo
 *      (el interés de cada periodo se calcula sobre el mismo euro); en compuesta cada uno sube más que el anterior.
 *   3. La meta: donde acaba esa escalera al cabo del año.
 *   4. La escalera del tipo buscado, con sus periodos, tiene que llegar a la misma meta: de ahí sale
 *      el tipo (repartir en simple; raíz en compuesta).
 *   5. En compuesta, lo que pasaría repartiendo en proporción: no llega a la meta (o se pasa). En
 *      simple, por qué repartir sí es exacto.
 */

const X0 = 90;
const X1 = 650;
const Y_BASE = 430;
const Y_TOPE = 236;
const MESES = ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

/** Número sin decimales de sobra (hasta `max`). */
function num(v: number, max = 4): string {
  const r = Number(v.toFixed(max));
  return formatear(r, (String(r).split('.')[1] ?? '').length);
}
const pct = (v: number) => `${num(v * 100, 4)} %`;

export interface PeticionTipo {
  tipo: number;
  de: Unidad;
  a: Unidad;
  regimen: Regimen;
  convenio: Convenio;
}

/** Tipos que la animación dibuja con claridad: positivos y con un crecimiento anual razonable. */
export function sePuedeDibujarTipo(p: PeticionTipo): boolean {
  if (!(p.tipo > 0) || !Number.isFinite(p.tipo)) return false;
  const c = convertirTipo(p.tipo, p.de, p.a, p.regimen, p.convenio);
  return c.factorAño < 10;
}

export function escenaConversionTipo(p: PeticionTipo): Escena {
  const c = convertirTipo(p.tipo, p.de, p.a, p.regimen, p.convenio);
  const de = unidad(p.de);
  const a = unidad(p.a);
  const compuesta = p.regimen === 'compuesta';
  // Factor al final de cada periodo (empieza en 1 €).
  const factores = (i: number, m: number) => Array.from({ length: Math.round(m) + 1 }, (_, k) => (compuesta ? (1 + i) ** k : 1 + k * i));
  const fDe = factores(p.tipo, c.mDe);
  const fA = factores(c.resultado, c.mA);
  const fProp = factores(c.proporcional, c.mA);
  const finalProp = fProp.at(-1)!;
  const maximo = Math.max(c.factorAño, finalProp);
  const y = (f: number) => Y_BASE - ((f - 1) / (maximo - 1)) * (Y_BASE - Y_TOPE);
  const sub = (m: number) => `i_{${m}}`;
  const iDe = c.mDe === 1 ? 'i' : sub(c.mDe);
  const iA = c.mA === 1 ? 'i' : sub(c.mA);
  const pocos = (m: number) => m <= 12;
  const seQuedaCorto = finalProp < c.factorAño;

  /** Escalera: el valor es constante durante el periodo y sube al cerrarlo. `q` (0–1) dibuja hasta ahí. */
  const escalera = (f: number[], q: number): string => {
    const m = f.length - 1;
    const hasta = q * m;
    const paso = (X1 - X0) / m;
    let d = `M${X0} ${y(f[0]!).toFixed(1)}`;
    for (let k = 1; k <= m; k++) {
      if (hasta <= k - 1) break;
      const xFin = X0 + Math.min(k, hasta) * paso;
      d += ` H${xFin.toFixed(1)}`;
      if (hasta >= k) d += ` V${y(f[k]!).toFixed(1)}`;
    }
    return d;
  };

  const regimenTexto = compuesta ? 'en compuesta' : 'en simple';
  const capitulos: Capitulo[] = [
    { t: 0, texto: `¿Qué tipo ${a.adjetivo} equivale a un ${pct(p.tipo)} ${de.adjetivo}, ${regimenTexto}? Equivalentes: llevan el mismo capital al mismo sitio en el mismo tiempo. Seguimos 1 € durante un año.` },
    { t: 3.2, texto: compuesta
      ? `En compuesta, cada ${de.singular} multiplica lo que hay por ${num(1 + p.tipo, 6)}: cada peldaño sube más que el anterior. En un año: ${num(1 + p.tipo, 6)}^${c.mDe} = ${num(c.factorAño)}.`
      : `En simple, cada ${de.singular} da un ${pct(p.tipo)} del mismo euro inicial: todos los peldaños suben igual. En un año: 1 + ${c.mDe} · ${num(p.tipo, 6)} = ${num(c.factorAño)}.` },
    { t: 7.4, texto: `Esa es la meta: ${num(c.factorAño)} € al cabo del año. El tipo ${a.adjetivo} tiene que llegar al mismo sitio en ${c.mA} ${c.mA === 1 ? a.singular : a.plural}: ${compuesta ? `$(1 + ${iA})^{${c.mA}} = (1 + ${iDe})^{${c.mDe}}$` : `$${iA} · ${c.mA} = ${iDe} · ${c.mDe}$`}.` },
    { t: 11.0, texto: compuesta
      ? `En compuesta, $(1 + ${iA})^{${c.mA}}$ = ${num(c.factorAño)}: ${c.mA === 1 ? 'basta restar 1' : `se despeja con la raíz de índice ${c.mA}`}. $${iA}$ = ${pct(c.resultado)} ${a.adjetivo}.`
      : `En simple basta repartir lo que crece en el año: ${num(c.factorAño - 1, 6)} entre ${c.mA}. $${iA}$ = ${pct(c.resultado)} ${a.adjetivo}.` },
    { t: 15.0, texto: compuesta
      ? (Math.abs(finalProp - c.factorAño) < 1e-12
        ? 'Aquí repartir en proporción coincide, porque es el mismo periodo.'
        : `Repartir en proporción daría ${pct(c.proporcional)}: en compuesta ${seQuedaCorto ? 'no llega' : 'se pasa'} (${num(finalProp)} en vez de ${num(c.factorAño)}). Por eso en compuesta no se divide.`)
      : `En simple repartir en proporción es exacto: el interés de cada periodo se calcula sobre el mismo capital. ${pct(p.tipo)} · ${num(c.mDe)}/${num(c.mA)} = ${pct(c.resultado)}.` },
  ];

  return {
    id: `tipo-${p.regimen}-${p.de}-${p.a}-${num(p.tipo, 6)}-${p.convenio}`,
    titulo: `${pct(p.tipo)} ${de.adjetivo} en ${a.adjetivo} (${regimenTexto})`,
    duracion: 19,
    descripcion: `${pct(p.tipo)} ${de.adjetivo} equivale a ${pct(c.resultado)} ${a.adjetivo} ${regimenTexto}: los dos llevan 1 € a ${num(c.factorAño)} € en un año. ${compuesta ? `(1 + ${num(p.tipo, 6)})^${c.mDe} = (1 + i)^${c.mA}.` : `${num(p.tipo, 6)} · ${c.mDe} = i · ${c.mA}.`}`,
    capitulos,
    montar(l) {
      const pregunta = new Rotulo(l, `${pct(p.tipo)} ${de.adjetivo} = ¿qué tipo ${a.adjetivo}?`, 'mo-rotulo-claro mo-gigante', 'middle');
      const etRegimen = new Rotulo(l, regimenTexto, 'mo-eje-unidad', 'middle');

      // El euro de partida y el calendario del año.
      const euro = new Capsula(l, { clase: 's-c0', ancho: X1 - X0, relleno: 0.3 });
      const etEuro = new Rotulo(l, '1 €', 'mo-cifra mo-cifra-peq s-c0', 'start');
      const cal = new Regla(l, { x0: X0, x1: X1, y: Y_BASE + 74, divisiones: 12, clase: 'mo-cal', rotulo: (k) => (k < 12 ? MESES[k]! : null), tamRotulo: 14 });
      const etAño = new Rotulo(l, p.de === 'dia' || p.a === 'dia' ? `un año (${p.convenio === 360 ? 'comercial, 360 días' : 'civil, 365 días'})` : 'un año', 'mo-eje-unidad', 'end');

      // Las escaleras: la de partida, la meta, la buscada y (en compuesta) la del reparto en proporción.
      const caminoDe = l.el('path', { class: 'mo-curva s-n', fill: 'none' });
      const caminoA = l.el('path', { class: 'mo-curva s-m', fill: 'none' });
      const caminoProp = l.el('path', { class: 'mo-curva mo-curva-error', fill: 'none' });
      const marcasDe = pocos(c.mDe) ? Array.from({ length: Math.round(c.mDe) }, () => new Rotulo(l, '', 'mo-rotulo', 'middle')) : [];
      const etPaso = new Rotulo(l, compuesta ? `× ${num(1 + p.tipo, 6)} cada ${de.singular}` : `+ ${num(p.tipo, 6)} cada ${de.singular}`, 'mo-cifra mo-cifra-peq s-n', 'start');
      const meta = new Guia(l, 'mo-guia s-cn');
      const etMeta = new Rotulo(l, `meta: ${num(c.factorAño)} €`, 'mo-cifra mo-cifra-peq s-cn', 'end');
      const etA = new Etiqueta(l, `${iA} = "${pct(c.resultado)}"`, 24, 'izquierda');
      const etProp = new Rotulo(l, `en proporción: ${pct(c.proporcional)} → ${num(finalProp)} €`, 'mo-rotulo', 'end');

      const regla = new Etiqueta(l, compuesta
        ? `${iA} = (1 + ${num(p.tipo, 6)})^{${c.mDe}/${c.mA}} - 1 = "${pct(c.resultado)}"`
        : `${iA} = ${num(p.tipo, 6)} · \\frac{${c.mDe}}{${c.mA}} = "${pct(c.resultado)}"`, 28);

      const fijarCamino = (el: SVGPathElement, d: string, opacidad: number) => {
        el.setAttribute('d', d);
        el.setAttribute('opacity', opacidad <= 0.001 ? '0' : String(opacidad));
      };

      return (t) => {
        l.camara(360, 300, 1);
        l.foco(380, 330, 380);
        // 1 · La pregunta, el euro y el año.
        pregunta.pintar(360, 78, tramo(t, 0.2, 0.8) * (1 - tramo(t, 15.0, 15.4)));
        etRegimen.pintar(360, 116, tramo(t, 0.6, 1.1));
        euro.pintar((X0 + X1) / 2, Y_BASE + 46, 46 * tramo(t, 0.9, 1.6, curvas.salida), tramo(t, 0.9, 1.2));
        etEuro.pintar(X0 - 2, Y_BASE + 32, tramo(t, 1.4, 1.9));
        cal.pintar(tramo(t, 1.2, 1.6), tramo(t, 1.3, 2.5), 0);
        etAño.pintar(X1, Y_BASE + 118, tramo(t, 2.0, 2.5));

        // 2 · La escalera de partida.
        const qDe = tramo(t, 3.4, 6.2, curvas.suave);
        fijarCamino(caminoDe, escalera(fDe, qDe), qDe > 0 ? 1 : 0);
        etPaso.pintar(X0 + 8, y(fDe[1] ?? 1) - 18, tramo(t, 3.6, 4.1) * (1 - tramo(t, 7.5, 7.8)));
        marcasDe.forEach((r, k) => {
          const xm = X0 + ((k + 1) * (X1 - X0)) / c.mDe;
          r.pintar(xm, y(fDe[k + 1]!) - 12, tramo(t, 3.4 + (2.8 * (k + 1)) / c.mDe, 3.7 + (2.8 * (k + 1)) / c.mDe) * (1 - tramo(t, 11.0, 11.3)), num(fDe[k + 1]!));
        });

        // 3 · La meta.
        meta.pintar(X0, y(c.factorAño), X1 + 10, y(c.factorAño), tramo(t, 7.4, 8.4), 1);
        etMeta.pintar(X1 + 10, y(c.factorAño) - 12, tramo(t, 8.0, 8.5));

        // 4 · La escalera buscada llega a la misma meta.
        const qA = tramo(t, 11.2, 13.6, curvas.suave);
        fijarCamino(caminoA, escalera(fA, qA), qA > 0 ? 1 : 0);
        etA.pintar(X0 + 20, Y_TOPE - 30, tramo(t, 13.4, 13.9));

        // 5 · En compuesta, el reparto en proporción no llega (o se pasa); la regla.
        const qP = compuesta ? tramo(t, 15.2, 16.8, curvas.suave) : 0;
        fijarCamino(caminoProp, escalera(fProp, qP), qP > 0 ? 0.9 : 0);
        etProp.pintar(X1, y(finalProp) + (seQuedaCorto ? 26 : -26), compuesta ? tramo(t, 16.6, 17.0) : 0);
        regla.pintar(360, 92, tramo(t, 15.4, 16.0));
      };
    },
  };
}
