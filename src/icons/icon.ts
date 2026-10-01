import { GLYPHS, type GlyphName } from './glyphs.ts';

const POSICION_INSIGNIAS = [
  [95, 95],
  [95, 25],
] as const;

/** Icono compuesto: glifo principal en un círculo del color del concepto y hasta dos insignias blancas. */
export function iconoSvg(iconos: readonly GlyphName[], color: string): string {
  const [principal, ...insignias] = iconos;
  const glifo = principal ? GLYPHS[principal] : '';
  const extras = insignias
    .slice(0, POSICION_INSIGNIAS.length)
    .map((nombre, i) => {
      const [x, y] = POSICION_INSIGNIAS[i]!;
      return `<circle cx="${x}" cy="${y}" r="20" fill="#fff" stroke="#000" stroke-width="3"/><g transform="translate(${x - 13} ${y - 13}) scale(.41)" fill="none" stroke="#000" color="#000" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">${GLYPHS[nombre]}</g>`;
    })
    .join('');
  return `<svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="55" fill="#121212" stroke="${color}" stroke-width="3"/><g transform="translate(22 22) scale(1.19)" fill="none" stroke="${color}" color="${color}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">${glifo}</g>${extras}</svg>`;
}
