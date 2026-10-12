import { formatear } from '../../domain/tema2/expresion.ts';
import { convertirDuracion, mesesDe, nombreUnidad, unidad, type Convenio, type Unidad } from '../../domain/tema2/periodos.ts';
import type { Capitulo, Escena } from '../motion/reproductor.ts';
import { Capsula, Etiqueta, Guia, Regla, Rotulo } from '../motion/motivos.ts';
import { curvas, limitar, tramo } from '../motion/tiempo.ts';

/*
 * El calendario pequeño: la animación de pasar CUALQUIER unidad de tiempo a cualquier otra.
 * No es una escena fija sino una fábrica (mismo motor y mismo estilo que las otras 19): con la
 * cantidad, la unidad de partida, la de llegada y el convenio de días, monta la escena.
 *
 *   1. La pregunta y el calendario (12 meses; o los días del año comercial o civil).
 *   2. La cantidad de partida, como recortes de su unidad, y lo que mide en la unidad común.
 *   3. La unidad de llegada, en la fila de abajo, alineada con el mismo calendario.
 *   4. Se cuenta cuántas caben: la raya del final cae justo en un borde (número entero) o dentro de
 *      un recorte (1,5 cuatrimestres: la raya del cuatrimestre corta el semestre por la mitad).
 *   5. La regla: cantidad × lo que mide la de partida ÷ lo que mide la de llegada, pasando por la
 *      unidad que cabe en las dos (los meses; los días del año comercial; el año, si es civil).
 *
 * Las cifras salen de src/domain/tema2/periodos.ts.
 */

const X0 = 70;
const X1 = 650;
const Y_DE = 240;
const Y_CAL = 334;
const Y_A = 414;
const ALTO = 58;

/** Número para leer: sin decimales de sobra y con coma (1,5; 0,5342; 30). */
function num(v: number): string {
  const r = Number(v.toFixed(4));
  const dec = (String(r).split('.')[1] ?? '').length;
  return formatear(r, dec);
}

const MESES = ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

export interface PeticionConversion {
  cantidad: number;
  de: Unidad;
  a: Unidad;
  convenio: Convenio;
}

/** Ventana del calendario en meses: años enteros que contienen la cantidad y una unidad de cada fila. */
function ventanaMeses(p: PeticionConversion): number {
  const largo = p.cantidad * mesesDe(p.de, p.convenio);
  const necesario = Math.max(largo, mesesDe(p.de, p.convenio), mesesDe(p.a, p.convenio), 1e-9);
  return 12 * Math.max(1, Math.ceil(necesario / 12 - 1e-9));
}

/** Escenas que la animación puede dibujar con claridad (hasta 20 años de calendario). */
export function sePuedeDibujar(p: PeticionConversion): boolean {
  return Number.isFinite(p.cantidad) && p.cantidad > 0 && ventanaMeses(p) <= 240;
}

export function escenaConversion(p: PeticionConversion): Escena {
  const c = convertirDuracion(p.cantidad, p.de, p.a, p.convenio);
  const de = unidad(p.de);
  const a = unidad(p.a);
  const W = ventanaMeses(p);
  const pxMes = (X1 - X0) / W;
  const largoMeses = p.cantidad * mesesDe(p.de, p.convenio);
  const xFin = X0 + largoMeses * pxMes;
  const nombreDe = nombreUnidad(p.de, p.cantidad);
  const nombreA = nombreUnidad(p.a, c.resultado);
  const entero = Math.abs(c.resultado - Math.round(c.resultado)) < 1e-9;
  const comun = c.camino === 'meses' ? 'meses' : c.camino === 'dias' ? 'días' : 'años';
  // ¿La unidad ya es la medida común (meses por los meses, días por los días)? Entonces no se repite «1 mes = 1 mes».
  const esComun = (u: Unidad) => (c.camino === 'meses' && u === 'mes') || (c.camino === 'dias' && u === 'dia') || (c.camino === 'año' && u === 'año');
  const porAñoDe = de.porAño(p.convenio);
  const porAñoA = a.porAño(p.convenio);
  const fraccionAño = (m: number, cant = 1) => (m === 1 ? `${num(cant)} año${cant === 1 ? '' : 's'}` : `${num(cant)}/${m} de año`);
  const medida = (v: number) => (Math.abs(v - 1) < 1e-9 ? `1 ${comun.replace(/es$|s$/, '')}` : c.camino === 'año' && v < 1 ? `${num(v)} de año` : `${num(v)} ${comun}`);

  const intro = c.camino === 'meses'
    ? 'Lo vemos en el calendario: un año tiene 12 meses.'
    : c.camino === 'dias'
      ? 'Año comercial: 360 días, 12 meses de 30 días.'
      : 'Año civil: 365 días. Un mes civil no tiene un número fijo de días, así que se pasa por el año.';
  const capitulos: Capitulo[] = [
    { t: 0, texto: `¿Cuántos ${a.plural} hay en ${num(p.cantidad)} ${nombreDe}? ${intro}` },
    { t: 3.0, texto: c.camino === 'año' ? `Un ${de.singular} es ${fraccionAño(porAñoDe)}: ${num(p.cantidad)} ${nombreDe} son ${fraccionAño(porAñoDe, p.cantidad)}.` : `Un ${de.singular} mide ${medida(c.medidaDe)}: ${num(p.cantidad)} ${nombreDe} son ${medida(p.cantidad * c.medidaDe)}.` },
    { t: 6.8, texto: `Un ${a.singular} ${c.camino === 'año' ? `es ${fraccionAño(porAñoA)}` : `mide ${medida(c.medidaA)}`}. Debajo, el mismo calendario partido en ${a.plural}.` },
    { t: 9.8, texto: entero
      ? `Caben ${num(c.resultado)} ${nombreA} justos: la raya del final coincide con un borde.`
      : `Caben ${num(c.resultado)} ${nombreA}: la raya del final cae dentro de un ${a.singular}, así que no es un número entero.` },
    { t: 13.8, texto: c.camino === 'año' ? `La regla: ${num(p.cantidad)} ÷ ${porAñoDe} × ${porAñoA} = ${num(c.resultado)}. Se pasa por el año: lo que es de año la cantidad, por los ${a.plural} que caben en un año.` : `La regla: ${num(p.cantidad)} × ${num(c.medidaDe)} ÷ ${num(c.medidaA)} = ${num(c.resultado)}. Se pasa por los ${comun}, la medida que cabe en las dos unidades.` },
  ];

  return {
    id: `conversion-${p.de}-${p.a}-${num(p.cantidad)}-${p.convenio}`,
    titulo: `${num(p.cantidad)} ${nombreDe} en ${a.plural}`,
    duracion: 18.5,
    descripcion: `${num(p.cantidad)} ${nombreDe} = ${num(c.resultado)} ${nombreA}. ${c.camino === 'año' ? `Se pasa por el año: ${num(p.cantidad)} ÷ ${porAñoDe} × ${porAñoA}` : `Se pasa por los ${comun}: ${num(p.cantidad)} × ${num(c.medidaDe)} ÷ ${num(c.medidaA)}`} = ${num(c.resultado)}.${c.camino !== 'meses' ? ` Año ${p.convenio === 360 ? 'comercial (360 días)' : 'civil (365 días)'}.` : ''}`,
    capitulos,
    montar(l) {
      // Una fila de recortes de una unidad sobre la ventana del calendario. Si la unidad es demasiado
      // pequeña para dibujarla de una en una (días), la fila es una sola franja.
      const fila = (u: Unidad, clase: string) => {
        const ancho = mesesDe(u, p.convenio) * pxMes;
        const n = Math.round(W / mesesDe(u, p.convenio));
        const sueltos = ancho >= 9 && n <= 60;
        return {
          ancho,
          n,
          sueltos,
          contornos: sueltos ? Array.from({ length: n }, () => new Capsula(l, { clase, ancho: ancho - 4, relleno: 0.08 })) : [new Capsula(l, { clase, ancho: X1 - X0, relleno: 0.08 })],
          llenos: sueltos ? Array.from({ length: n }, () => new Capsula(l, { clase, ancho: ancho - 4, relleno: 0.42 })) : [new Capsula(l, { clase, ancho: X1 - X0, relleno: 0.42 })],
          // Cada trozo lleva su número para contarlos (1, 2, 3…; el último, la fracción que queda).
          numeros: sueltos && ancho >= 30 ? Array.from({ length: n }, () => new Rotulo(l, '', ancho >= 70 ? 'mo-cifra mo-cifra-peq' : 'mo-eje-texto', 'middle')) : [],
        };
      };
      const filaDe = fila(p.de, 's-n');
      const filaA = fila(p.a, 's-m');

      // El calendario: siempre los meses como referencia (con su inicial; si hay varios años, el año).
      // Con días se dice el convenio: meses de 30 días (comercial) o año de 365 (civil).
      const marcasCal = W;
      const etiquetaMes = (k: number): string | null => {
        if (k === W) return null;
        if (W <= 12) return MESES[k % 12]!;
        if (W <= 36) return k % 12 === 0 ? `año ${k / 12 + 1}` : k % 3 === 0 ? MESES[k % 12]! : null;
        return k % 12 === 0 ? `año ${k / 12 + 1}` : null;
      };
      const cal = new Regla(l, { x0: X0, x1: X1, y: Y_CAL, divisiones: marcasCal, clase: 'mo-cal', rotulo: etiquetaMes, tamRotulo: 17 });
      const etCal = new Rotulo(l, c.camino === 'meses' ? 'meses' : c.camino === 'dias' ? 'meses de 30 días · año de 360' : 'año civil: 365 días (los meses no miden igual)', 'mo-eje-unidad', 'start');

      const pregunta = new Rotulo(l, `${num(p.cantidad)} ${nombreDe} = ¿cuántos ${a.plural}?`, 'mo-rotulo-claro mo-gigante', 'middle');
      const etDe = new Rotulo(l, `${num(p.cantidad)} ${nombreDe}`, 'mo-cifra mo-cifra-peq s-n', 'start');
      const etMedidaDe = new Rotulo(l, `= ${c.camino === 'año' ? fraccionAño(porAñoDe, p.cantidad) : medida(p.cantidad * c.medidaDe)}`, 'mo-cifra mo-cifra-peq s-n', 'end');
      const etUnidadA = new Rotulo(l, `1 ${a.singular} = ${c.camino === 'año' ? fraccionAño(porAñoA) : medida(c.medidaA)}`, 'mo-cifra mo-cifra-peq s-m', 'start');
      const contador = new Rotulo(l, '', 'mo-cifra s-m', 'middle');
      const raya = new Guia(l, 'mo-guia s-n');
      const regla = new Etiqueta(l, c.camino === 'año' ? `\\frac{${num(p.cantidad)}}{${porAñoDe}} · ${porAñoA} = "${num(c.resultado)} ${nombreA}"` : `${num(p.cantidad)} · \\frac{${num(c.medidaDe)}}{${num(c.medidaA)}} = "${num(c.resultado)} ${nombreA}"`, 34);
      const etCamino = new Rotulo(l, c.camino === 'año' ? 'se pasa por el año' : `se pasa por los ${comun}`, 'mo-rotulo-claro', 'middle');

      // Coloca una fila: contornos de toda la ventana y, encima, lo lleno hasta `valor` (en unidades).
      const pintarFila = (f: ReturnType<typeof fila>, y: number, aparece: number, valor: number, opacidad = 1) => {
        if (f.sueltos) {
          f.contornos.forEach((cap, k) => {
            const q = limitar(aparece * f.n - k);
            cap.pintar(X0 + (k + 0.5) * f.ancho, y + ALTO / 2, ALTO * q, q * opacidad * 0.9);
          });
          f.llenos.forEach((cap, k) => {
            const lleno = limitar(valor - k);
            const w = (f.ancho - 4) * lleno;
            cap.pintar(X0 + k * f.ancho + 2 + w / 2, y + ALTO / 2, ALTO, lleno > 0.001 ? opacidad : 0, Math.max(0.001, w));
            const numero = f.numeros[k];
            if (numero) numero.pintar(X0 + (k + 0.5) * f.ancho, y + 8, lleno > 0.02 ? opacidad : 0, lleno > 0.999 ? String(k + 1) : num(lleno));
          });
        } else {
          f.contornos[0]!.pintar((X0 + X1) / 2, y + ALTO / 2, ALTO * aparece, aparece * opacidad * 0.9);
          const w = valor * f.ancho;
          f.llenos[0]!.pintar(X0 + w / 2, y + ALTO / 2, ALTO, w > 0.5 ? opacidad : 0, Math.max(0.001, w));
        }
      };

      return (t) => {
        l.camara(360, 300, 1);
        l.foco(360, 300, 360);
        // 1 · La pregunta y el calendario.
        pregunta.pintar(360, 92, tramo(t, 0.2, 0.8) * (1 - tramo(t, 13.8, 14.2)));
        cal.pintar(tramo(t, 0.8, 1.2), tramo(t, 0.9, 2.4, curvas.suave), 0);
        etCal.pintar(X0, Y_CAL - 22, tramo(t, 1.8, 2.3));

        // 2 · La cantidad de partida.
        pintarFila(filaDe, Y_DE - ALTO, tramo(t, 3.0, 4.0, curvas.suave), p.cantidad * tramo(t, 4.0, 5.4, curvas.suave));
        etDe.pintar(X0, Y_DE - ALTO - 20, tramo(t, 4.2, 4.7));
        etMedidaDe.pintar(X1, Y_DE - ALTO - 20, esComun(p.de) ? 0 : tramo(t, 5.2, 5.8));

        // 3 · La unidad de llegada, alineada con el mismo calendario.
        pintarFila(filaA, Y_A, tramo(t, 6.8, 8.0, curvas.suave), c.resultado * tramo(t, 10.0, 12.6, curvas.suave));
        etUnidadA.pintar(X0, Y_A + ALTO + 34, esComun(p.a) ? 0 : tramo(t, 7.8, 8.3));

        // 4 · Cuántas caben: la raya del final baja de una fila a la otra y se cuenta.
        raya.pintar(xFin, Y_DE - ALTO - 6, xFin, Y_A + ALTO + 6, tramo(t, 9.8, 10.4), 1);
        const medido = c.resultado * tramo(t, 10.0, 12.6, curvas.suave);
        contador.pintar(Math.min(X1 - 90, Math.max(X0 + 90, xFin)), Y_A + ALTO + 84, tramo(t, 10.0, 10.3), `${num(medido)} ${nombreUnidad(p.a, medido)}`);

        // 5 · La regla.
        regla.pintar(360, 92, tramo(t, 14.0, 14.6));
        etCamino.pintar(360, 138, tramo(t, 14.8, 15.3));
      };
    },
  };
}
