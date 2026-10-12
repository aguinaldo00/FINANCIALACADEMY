// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { montarEditorial } from '../../src/ui/components/editorial.ts';

/** Una página editorial mínima: barra con «Sumario» y la capa del sumario. */
const pagina = () => `<header data-ed-nav><button type="button" data-sumario>Sumario</button></header>
  <div data-capa-sumario hidden><div data-temario><input data-tm-buscar><button type="button" data-cerrar-sumario>Cerrar</button><a href="#x">Un tema</a></div></div>`;

describe('Sumario', () => {
  it('sigue funcionando después de navegar entre páginas (el contenedor de la página es el mismo)', () => {
    const raiz = document.createElement('main');
    document.body.append(raiz);
    // Tres páginas seguidas en el mismo contenedor, como hace la app al navegar.
    for (let k = 0; k < 3; k++) {
      raiz.innerHTML = pagina();
      const parar = montarEditorial(raiz);
      if (k < 2) { parar(); continue; }
      raiz.querySelector<HTMLButtonElement>('[data-sumario]')!.click();
      const capas = document.querySelectorAll<HTMLElement>('[data-capa-sumario]');
      expect(capas).toHaveLength(1);
      const capa = capas[0]!;
      expect(capa.hidden).toBe(false);
      expect(capa.inert).toBe(false);
      expect(raiz.inert).toBe(true);
      capa.querySelector<HTMLButtonElement>('[data-cerrar-sumario]')!.click();
      expect(capa.hidden).toBe(true);
      expect(raiz.inert).toBe(false);
      expect(document.documentElement.classList.contains('ed-sin-scroll')).toBe(false);
      parar();
    }
  });
});
