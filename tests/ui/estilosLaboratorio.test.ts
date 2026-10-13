import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('estilos del laboratorio', () => {
  it('no usan «.lab» a secas: esa clase también la lleva la etiqueta «En la vida real» del Tema 1', () => {
    const css = readFileSync(new URL('../../src/styles/laboratorio.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    expect(css.match(/(?<![\w-])\.lab(?![\w-]|\[data-laboratorio\])/g) ?? []).toEqual([]);
  });

  it('deja que el Cuadro de mando use el scroll de la página, no barras internas en móvil', () => {
    const css = readFileSync(new URL('../../src/styles/laboratorio.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    expect(css).not.toMatch(/\.lab-(?:cuaderno|centro|calculadora|escena)[^{]*\{[^}]*overflow(?:-[xy])?\s*:\s*(?:auto|scroll)/);
    expect(css).not.toMatch(/\.hoja-(?:guia|sust)[^{]*\{[^}]*overflow(?:-[xy])?\s*:\s*(?:auto|scroll)/);
    expect(css).not.toMatch(/\.cal-resultado[^{]*\{[^}]*overflow(?:-[xy])?\s*:\s*(?:auto|scroll)/);
  });
});
