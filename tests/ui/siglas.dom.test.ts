// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { marcarSiglas } from '../../src/ui/components/siglas.ts';
import { marcarSiglasPregunta, siglasProtegidas } from '../../src/ui/components/siglas.ts';
import { pintarPreguntaConConfianza } from '../../src/ui/components/conceptPanels.ts';

describe('siglas explicables', () => {
  it('marca solo la primera aparición, con su explicación accesible', () => {
    const raiz = document.createElement('div');
    raiz.innerHTML = '<p>El SEBC incluye al BCE. Otra vez el SEBC.</p><button>SEBC en un botón</button>';
    const n = marcarSiglas(raiz);
    const botones = [...raiz.querySelectorAll<HTMLButtonElement>('button.sigla')];
    expect(botones.map((b) => b.textContent)).toEqual(['SEBC', 'BCE']);
    expect(n).toBe(2);
    expect(raiz.querySelector('p')!.textContent).toBe('El SEBC incluye al BCE. Otra vez el SEBC.');
    const pop = raiz.querySelector<HTMLElement>(`#${botones[0]!.getAttribute('popovertarget')}`)!;
    expect(pop.hasAttribute('popover')).toBe(true);
    expect(pop.textContent).toContain('Sistema Europeo de Bancos Centrales');
    expect(raiz.querySelector(`#${botones[0]!.getAttribute('aria-describedby')}`)).not.toBeNull();
  });

  it('las siglas distinguen mayúsculas y los términos no; no toca botones ni enlaces', () => {
    const raiz = document.createElement('div');
    raiz.innerHTML = '<p>Ice cream. La Garantía explícita del Estado.</p><a href="#">ICO</a>';
    marcarSiglas(raiz);
    expect([...raiz.querySelectorAll('button.sigla')].map((b) => b.textContent)).toEqual(['Garantía explícita']);
  });

  it('no vuelve a marcar lo ya marcado', () => {
    const raiz = document.createElement('div');
    raiz.innerHTML = '<p>La CNMV vigila la bolsa.</p>';
    marcarSiglas(raiz);
    expect(marcarSiglas(raiz)).toBe(0);
    expect(raiz.querySelectorAll('button.sigla')).toHaveLength(1);
  });
});

describe('siglas en preguntas tipo test', () => {
  it('marca las siglas del texto, no las de las etiquetas ni dentro de palabras', () => {
    const html = marcarSiglasPregunta('<b class="DGSFP">¿Quién?</b> La DGSFP, no la CNMV ni BCEX.');
    expect(html).toContain('<b class="DGSFP">');
    expect(html).toContain('<abbr class="sg-q" title="Dirección General de Seguros y Fondos de Pensiones">DGSFP</abbr>');
    expect(html).toContain('title="Comisión Nacional del Mercado de Valores">CNMV</abbr>');
    expect(html).toContain('BCEX.');
  });

  it('no revela las siglas cuyo significado es la propia pregunta', () => {
    expect(siglasProtegidas('¿Qué significa SEBC?', ['Sistema Europeo del Banco Central', 'Sistema Europeo de Bancos Centrales'])).toEqual(new Set(['SEBC']));
    expect(siglasProtegidas('¿Quién supervisa las aseguradoras?', ['CNMV', 'DGSFP', 'Banco de España'])).toEqual(new Set());
  });

  it('en el repaso, "¿Quién supervisa las aseguradoras?" deja ver qué es la DGSFP', () => {
    const panel = document.createElement('div');
    pintarPreguntaConConfianza(panel, { enunciado: '¿Quién supervisa las aseguradoras?', opciones: ['CNMV', 'DGSFP', 'Banco de España'], indiceCorrecta: 1, explicacion: '' }, () => {});
    const boton = panel.querySelector<HTMLButtonElement>('[data-siglas]')!;
    expect(panel.querySelector('p b')!.textContent).toBe('¿Quién supervisa las aseguradoras?');
    expect(panel.querySelectorAll('.opt abbr.sg-q')).toHaveLength(2);
    boton.click();
    expect(panel.classList.contains('siglas-vistas')).toBe(true);
    expect(boton.getAttribute('aria-pressed')).toBe('true');
  });
});
