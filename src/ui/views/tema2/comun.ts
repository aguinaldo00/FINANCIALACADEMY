import { hrefBloqueTema2, hrefFase, hrefFormula, hrefLetras } from '../../../app/router.ts';
import { BLOQUES, type BloqueId } from '../../../content/temas/tema-02/formulas.ts';
import { FASES_TEMA2, type FaseTema2 } from '../../../content/temas/tema-02/index.ts';
import { colorearSimbolos, escaparHtml } from '../../components/simbolos.ts';
import { formulaHtml } from '../../matematica/formula.ts';

/** Texto con fórmulas entre $…$ (y los símbolos sueltos coloreados). Devuelve HTML seguro. */
export function textoT2(texto: string): string {
  return texto
    .split(/(\$[^$]+\$)/g)
    .map((trozo) => (trozo.startsWith('$') ? formulaHtml(trozo.slice(1, -1), 'fx-linea') : colorearSimbolos(trozo)))
    .join('');
}

export const bloque = (id: BloqueId) => BLOQUES.find((b) => b.id === id)!;

/** Leyenda de colores: un color por papel, el mismo en el índice, las animaciones y los ejercicios. */
export function leyendaColores(): string {
  const papeles: [string, string, string][] = [
    ['C_0', 'E', 'lo que vale hoy'],
    ['C_n', 'N', 'lo que vale al final'],
    ['I', '', 'lo que crece'],
    ['D', '', 'lo que se resta al cobrar antes'],
    ['i', 'd', 'tipos (tasas)'],
    ['n', '', 'tiempo'],
    ['m', '', 'partes del año'],
  ];
  return `<ul class="t2-leyenda" aria-label="Colores de los símbolos">${papeles.map(([a, b, texto]) =>
    `<li>${formulaHtml(a)}${b ? formulaHtml(b) : ''}<span>${texto}</span></li>`).join('')}</ul>`;
}

/** Recorrido A → D del tema; marca la fase actual. */
export function recorridoFases(bloqueId: BloqueId | null, actual: FaseTema2 | null, enLetras = false): string {
  const letras = bloqueId === 'descuento'
    ? `<li class="t2-recorrido-extra${enLetras ? ' on' : ''}"><a href="${hrefLetras()}"${enLetras ? ' aria-current="step"' : ''}><b>+</b><span>Varias letras<small>Remesas y fecha focal, como en el examen</small></span></a></li>`
    : '';
  return `<ol class="t2-recorrido" aria-label="Fases del tema">${FASES_TEMA2.map((f) => {
    const href = bloqueId ? hrefFase(bloqueId, f.id) : f.id === 'formulas' ? '#tema/2' : hrefFase('simple', f.id);
    const on = f.id === actual;
    return `<li${on ? ' class="on"' : ''}><a href="${href}"${on ? ' aria-current="step"' : ''}><b>${f.letra}</b><span>${escaparHtml(f.titulo)}<small>${escaparHtml(f.subtitulo)}</small></span></a></li>`;
  }).join('')}${letras}</ol>`;
}

/** Pestañas de bloque (simple, compuesta, descuento) para una fase. */
export function pestanasBloque(actual: BloqueId, fase: FaseTema2): string {
  return `<nav class="t2-pestanas" aria-label="Bloques del tema">${BLOQUES.map((b) => {
    const on = b.id === actual;
    return `<a href="${hrefFase(b.id, fase)}"${on ? ' aria-current="page" class="on"' : ''}>${escaparHtml(b.titulo)}</a>`;
  }).join('')}</nav>`;
}

export { formulaHtml, hrefBloqueTema2, hrefFormula, escaparHtml };
