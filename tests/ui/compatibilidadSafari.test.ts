import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { colorearSimbolos } from '../../src/ui/components/simbolos.ts';
import { sustitucion } from '../../src/ui/components/hojaCalculo.ts';
import { marcarSiglasPregunta, siglasEn } from '../../src/ui/components/siglas.ts';

const ficheros = (dir: string): string[] => readdirSync(dir).flatMap((f) => { const r = join(dir, f); return statSync(r).isDirectory() ? ficheros(r) : /\.ts$/.test(f) ? [r] : []; });

describe('compatibilidad con Safari', () => {
  it('ninguna expresión regular usa «lookbehind» (Safari anterior a 16.4 deja la página en blanco)', () => {
    const conLookbehind = ficheros('src').filter((f) => /\(\?<[!=]/.test(readFileSync(f, 'utf8')));
    expect(conLookbehind).toEqual([]);
  });

  it('los símbolos se colorean igual sin «lookbehind»: solo letras sueltas, nunca dentro de palabras', () => {
    const html = colorearSimbolos('Cₙ = C₀ · (1 + i)ⁿ; interés n años, I total, iₘ');
    expect(html.match(/class="s [^"]+">[^<]+/g)!.map((m) => m.split('>')[1])).toEqual(['Cₙ', 'C₀', 'i', 'ⁿ', 'n', 'I', 'iₘ']);
    expect(html).toContain('interés');
    expect(colorearSimbolos('i,n')).toBe('<span class="s s-i">i</span>,<span class="s s-n">n</span>');
  });

  it('la sustitución cambia solo las variables enteras', () => {
    expect(sustitucion('C_n = C_0 * (1 + i)^n', { C_0: '1000', i: '0,05', n: '3' })).toBe('C_n = "1000" * (1 + "0,05")^"3"');
  });

  it('las siglas se detectan y marcan sin «lookbehind»', () => {
    expect(siglasEn('La CNMV y el BCE; no BCEX ni xBCE.')).toEqual(['CNMV', 'BCE']);
    const html = marcarSiglasPregunta('(SICAV o SII)…');
    expect(html.startsWith('(<abbr class="sg-q"')).toBe(true);
    expect(html).toContain('>SII</abbr>)…');
  });
});
