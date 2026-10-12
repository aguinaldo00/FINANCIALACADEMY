import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('estilos del laboratorio', () => {
  it('no usan «.lab» a secas: esa clase también la lleva la etiqueta «En la vida real» del Tema 1', () => {
    const css = readFileSync(new URL('../../src/styles/laboratorio.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    expect(css.match(/(?<![\w-])\.lab(?![\w-]|\[data-laboratorio\])/g) ?? []).toEqual([]);
  });
});
