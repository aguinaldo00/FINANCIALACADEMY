// @vitest-environment happy-dom
import { beforeAll, describe, expect, it } from 'vitest';
import { iniciarApp } from '../../src/app/app.ts';
import { tema01 } from '../../src/content/temas/tema-01/index.ts';

beforeAll(() => {
  globalThis.IntersectionObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof IntersectionObserver;
  window.scrollTo = () => {};
  localStorage.clear();
  document.body.innerHTML = `<nav class="rail" id="rail"></nav><main><div class="topbar"><button id="mb">Índice</button><span id="mt"></span></div><div class="page" id="page"></div></main>`;
  location.hash = '#inicio';
  iniciarApp(tema01);
});

describe('portada sin WebGL', () => {
  it('no activa la portada inmersiva: el bloque del tema sigue primero y la barra lateral visible', () => {
    const pagina = document.getElementById('page')!;
    expect(pagina.firstElementChild?.classList.contains('hero')).toBe(true);
    expect(document.querySelector('.mundo.portada')).toBeNull();
    expect(document.body.classList.contains('portada-inmersiva')).toBe(false);
  });

  it('el bloque del tema aparece con animación al hacer scroll', () => {
    expect(document.querySelector('.hero')!.classList.contains('rev')).toBe(true);
  });

  it('la intro está disponible sin dejar texto auxiliar detrás del índice', () => {
    const pista = document.querySelector('.portada-pista')!;
    expect(pista.querySelector('.ver-intro')?.textContent).toContain('Ver la intro');
    expect(pista.textContent).not.toContain('Pulsa la ciudad para explorarla');
    expect(pista.textContent).not.toContain('Desliza para ver el tema');
  });
});
