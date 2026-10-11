// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { marcarSiglas } from '../../src/ui/components/siglas.ts';

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
