/*
 * Un color fijo por variable en toda la lección (señalización): C₀, Cₙ (y los capitales
 * intermedios C₁, C₂…), i, n e I. Paleta Okabe-Ito, apta para daltonismo. El color nunca es la
 * única pista: el símbolo sigue escrito, así que se lee igual en blanco y negro (como en el examen).
 */

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function escaparHtml(texto: string): string {
  return texto.replace(/[&<>"']/g, (c) => ESCAPES[c]!);
}

// Sin «lookbehind» (Safari anterior a 16.4 no lo entiende y rompería toda la página): el carácter
// previo a i, I o n se captura en `antes` y se devuelve tal cual.
const SIMBOLO = /(C(?:[₀-₉]+|ₙ)|ⁿ)|(^|[^\p{L}\p{N}])(iₘ|i|I|n)(?![\p{L}\p{N}])/gu;

function clase(simbolo: string): string {
  if (simbolo === 'C₀') return 's-c0';
  if (simbolo.startsWith('C')) return 's-cn';
  if (simbolo === 'I') return 's-I';
  if (simbolo === 'n' || simbolo === 'ⁿ') return 's-n';
  return 's-i';
}

/** Escapa el texto y envuelve cada símbolo en un `<span class="s s-…">`. Devuelve HTML seguro. */
export function colorearSimbolos(texto: string): string {
  const span = (s: string) => `<span class="s ${clase(s)}">${s}</span>`;
  return escaparHtml(texto).replace(SIMBOLO, (_m, c: string | undefined, antes: string, s: string) => (c ? span(c) : antes + span(s)));
}
