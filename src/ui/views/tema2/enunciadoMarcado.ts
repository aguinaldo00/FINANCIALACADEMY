/*
 * El enunciado redactado (el del examen) partido en trozos: texto normal, datos (cada uno con su
 * símbolo) y la pregunta (con el símbolo que se pide). Con esos trozos se pinta el enunciado con
 * colores del laboratorio, el de «Marca tú el enunciado» (los datos como botones sin color) y el del
 * simulacro (sin marcas).
 */
import { enunciadoExamen } from '../../../content/temas/tema-02/enunciados.ts';
import type { PeriodicidadEjercicio } from '../../../domain/tema2/generador.ts';
import { LABORATORIOS } from '../../../domain/tema2/laboratorio.ts';
import { escaparHtml } from '../../components/simbolos.ts';
import { claseSimbolo, formulaTexto } from '../../matematica/formula.ts';

export interface Trozo {
  texto: string;
  /** Símbolo del dato (si el trozo es un dato). */
  simbolo?: string;
}

export interface EnunciadoMarcado {
  /** Trozos en orden; la pregunta empieza en el trozo `pregunta` (o -1 si no hay «¿»). */
  trozos: Trozo[];
  pregunta: number;
  incognita: string;
  texto: string;
}

const escaparRegExp = (t: string) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const UNIDADES_TIEMPO = 'años?|semestres?|cuatrimestres?|trimestres?|meses|mes|días?';

/** Localiza cada dato en el enunciado redactado. Un número solo se marca entero (el 7 no dentro de 9.659,25). */
export function marcarEnunciado(id: string, datos: Readonly<Record<string, string>>, periodicidad?: PeriodicidadEjercicio): EnunciadoMarcado | null {
  const texto = enunciadoExamen(id, datos, periodicidad);
  const lab = LABORATORIOS[id];
  if (!texto || !lab) return null;
  const marcas: { desde: number; hasta: number; simbolo: string }[] = [];
  const libre = (a: number, b: number) => marcas.every((m) => b <= m.desde || a >= m.hasta);
  /** Marca la primera aparición libre de `patron` (si tiene un grupo, solo ese trozo). */
  const marcar = (patron: RegExp, simbolo: string): boolean => {
    for (const m of texto.matchAll(patron)) {
      const desde = m.index! + (m[1] !== undefined ? m[0].lastIndexOf(m[1]) : 0);
      const hasta = desde + (m[1] ?? m[0]).length;
      if (libre(desde, hasta)) { marcas.push({ desde, hasta, simbolo }); return true; }
    }
    return false;
  };
  for (const d of lab.datos) {
    const valor = datos[d.simbolo];
    if (!valor) continue;
    // n: el número con su unidad («7 años»); n en forma de fracción («45/360») se escribe como días.
    const cifra = d.simbolo === 'n' && valor.includes('/') ? valor.split('/')[0]! : valor;
    const unidad = d.simbolo === 'n' ? `(?:\\s(?:${UNIDADES_TIEMPO}))?` : '';
    // Sin «lookbehind» (Safari antiguo no lo entiende): lo de delante se captura y se salta con el grupo.
    if (marcar(new RegExp(`(?:^|[^\\d.,])(${escaparRegExp(cifra)}${unidad})(?![\\d]|[.,]\\d)`, 'g'), d.simbolo)) continue;
    // m también se escribe con palabras: «cada trimestre», «tipo mensual», «capitalización anual».
    if (d.simbolo === 'm') {
      marcar(/(?:capitalización|tipo) (anual|semestral|cuatrimestral|trimestral|mensual|diari[oa])/g, 'm')
        || marcar(/una vez al año|cada (?:semestre|cuatrimestre|trimestre|mes|día)/g, 'm');
    }
  }
  marcas.sort((a, b) => a.desde - b.desde);
  const inicioPregunta = texto.lastIndexOf('¿');
  const cortes = new Set([0, texto.length, ...marcas.flatMap((m) => [m.desde, m.hasta]), ...(inicioPregunta >= 0 ? [inicioPregunta] : [])]);
  const puntos = [...cortes].sort((a, b) => a - b);
  const trozos: Trozo[] = [];
  let pregunta = -1;
  for (let k = 0; k < puntos.length - 1; k++) {
    const desde = puntos[k]!;
    const hasta = puntos[k + 1]!;
    if (desde === inicioPregunta) pregunta = trozos.length;
    const m = marcas.find((x) => x.desde === desde);
    trozos.push({ texto: texto.slice(desde, hasta), ...(m ? { simbolo: m.simbolo } : {}) });
  }
  return { trozos, pregunta, incognita: lab.incognita.simbolo, texto };
}

/**
 * El enunciado redactado con cada dato marcado con el color de su símbolo, como en el cuaderno:
 * «… un capital final de [9.659,25 €] al cabo de [7 años] …». La pregunta, subrayada en el color de
 * lo que te piden.
 */
export function enunciadoColoreado(id: string, datos: Readonly<Record<string, string>>, periodicidad?: PeriodicidadEjercicio): string | null {
  const e = marcarEnunciado(id, datos, periodicidad);
  if (!e) return null;
  const html = e.trozos.map((t, k) => {
    const abre = k === e.pregunta ? `<span class="lab-marca-pide ${claseSimbolo(e.incognita)}" title="Te piden ${escaparHtml(formulaTexto(e.incognita))}">` : '';
    const cuerpo = t.simbolo ? `<span class="lab-marca ${claseSimbolo(t.simbolo)}" title="${escaparHtml(formulaTexto(t.simbolo))}">${escaparHtml(t.texto)}</span>` : escaparHtml(t.texto);
    return abre + cuerpo;
  }).join('');
  return e.pregunta >= 0 ? `${html}</span>` : html;
}
