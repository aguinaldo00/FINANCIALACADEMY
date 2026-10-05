import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { tema01 } from '../../src/content/temas/tema-01/index.ts';
import { ICONOS_UI, iconoModo, iconoUi, sinEmoji } from '../../src/icons/ui.ts';

/** Emoji (con presentación de emoji); las flechas tipográficas de los esquemas (▶ → ⇄) no cuentan. */
const EMOJI = /\p{Emoji_Presentation}|\p{Extended_Pictographic}\uFE0F/u;

function archivos(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const r = join(dir, n);
    return statSync(r).isDirectory() ? archivos(r) : r.endsWith('.ts') ? [r] : [];
  });
}

describe('iconos propios de la interfaz', () => {
  it('cada icono es un SVG decorativo dentro de su medallón', () => {
    for (const nombre of Object.keys(ICONOS_UI) as (keyof typeof ICONOS_UI)[]) {
      const svg = iconoUi(nombre);
      expect(svg).toMatch(/^<svg class="iu [^"]+" viewBox="0 0 64 64" aria-hidden="true"/);
      expect(svg).not.toMatch(EMOJI);
    }
    expect(iconoUi('trampa')).toContain('iu-disco');
    expect(iconoUi('visto')).toContain('iu-mini');
  });

  it('las etiquetas de los modos pierden el emoji y reciben un icono propio', () => {
    const iconos = tema01.modos.map((m) => iconoModo(m.etiqueta));
    expect(iconos).toEqual(['analogia', 'nino', 'plano', 'gemelos', 'diana']);
    for (const m of tema01.modos) expect(sinEmoji(m.etiqueta)).not.toMatch(EMOJI);
    expect(sinEmoji('🗺️ Esquema visual')).toBe('Esquema visual');
  });

  it('la interfaz no usa emojis (solo los iconos propios)', () => {
    const con = archivos('src/ui').filter((f) => EMOJI.test(readFileSync(f, 'utf8')));
    expect(con).toEqual([]);
  });
});
