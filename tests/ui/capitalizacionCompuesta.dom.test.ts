// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { montarCapitalizacionCompuesta } from '../../src/ui/components/capitalizacionCompuesta.ts';

function prepararMovimiento(reducido: boolean): void {
  vi.stubGlobal('matchMedia', () => ({
    matches: reducido,
    media: '(prefers-reduced-motion: reduce)',
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
}

describe('lección visual de capitalización compuesta', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  it('presenta la regla y relaciona el interés de cada periodo con el gráfico', () => {
    prepararMovimiento(false);
    const contenedor = document.createElement('div');
    document.body.append(contenedor);
    const desmontar = montarCapitalizacionCompuesta(contenedor);

    expect(contenedor.querySelector('[data-mat-titulo]')!.textContent).toContain('La base cambia');
    expect(contenedor.querySelector('.mat-grafico')).not.toBeNull();
    expect(contenedor.querySelector('.mat-grafico')!.getAttribute('aria-label')).toContain('1 capitales conocidos');
    expect(contenedor.querySelector('[data-mat-nota-texto]')!.textContent).toContain('capitalización simple');
    expect(contenedor.querySelector('.mat-barra')).toBeNull();

    contenedor.querySelector<HTMLButtonElement>('[data-mat-accion="siguiente"]')!.click();
    expect(contenedor.querySelector('[data-mat-titulo]')!.textContent).toContain('interés del año 1');
    expect(contenedor.querySelector('[data-mat-ecuaciones]')!.textContent).toContain('C₀ × i');
    expect(contenedor.querySelector('[data-mat-ecuaciones]')!.textContent).toContain('50,00');
    expect(contenedor.querySelector('.mat-prevision')).not.toBeNull();
    expect(contenedor.querySelector('.mat-interes-delta')).not.toBeNull();

    contenedor.querySelector<HTMLButtonElement>('[data-mat-accion="siguiente"]')!.click();
    expect(contenedor.querySelector('[data-mat-titulo]')!.textContent).toContain('cierre del año 1');
    expect(contenedor.querySelector('[data-mat-ecuaciones]')!.textContent).toContain('C₁');
    expect(contenedor.querySelector('[data-mat-ecuaciones]')!.textContent).toContain('1.050,00');
    expect(contenedor.querySelectorAll('.mat-punto')).toHaveLength(2);
    desmontar();
  });

  it('reproduce, pausa y reinicia la secuencia didáctica', () => {
    vi.useFakeTimers();
    prepararMovimiento(false);
    const contenedor = document.createElement('div');
    document.body.append(contenedor);
    const desmontar = montarCapitalizacionCompuesta(contenedor);
    const play = contenedor.querySelector<HTMLButtonElement>('[data-mat-accion="reproducir"]')!;
    play.click();
    expect(play.textContent).toBe('Pausar');
    vi.advanceTimersByTime(5_000);
    expect(contenedor.querySelector('[data-mat-titulo]')!.textContent).toContain('interés del año 1');
    play.click();
    expect(play.textContent).toBe('Reproducir');
    vi.advanceTimersByTime(10_000);
    expect(contenedor.querySelector('[data-mat-titulo]')!.textContent).toContain('interés del año 1');
    contenedor.querySelector<HTMLButtonElement>('[data-mat-accion="reiniciar"]')!.click();
    expect(contenedor.querySelector('[data-mat-titulo]')!.textContent).toContain('La base cambia');
    desmontar();
  });

  it('deriva la fórmula del capital final y el interés total desde el mismo cálculo', () => {
    prepararMovimiento(false);
    const contenedor = document.createElement('div');
    document.body.append(contenedor);
    const desmontar = montarCapitalizacionCompuesta(contenedor);

    contenedor.querySelector<HTMLButtonElement>('[data-mat-etapa="7"]')!.click();
    expect(contenedor.querySelector('[data-mat-titulo]')!.textContent).toContain('fórmula');
    expect(contenedor.querySelector('[data-mat-ecuaciones]')!.textContent).toContain('Cₙ = C₀ × (1+i)ⁿ');
    expect(contenedor.querySelector('[data-mat-ecuaciones]')!.textContent?.replace(/\u00a0/g, ' '))
      .toContain('1.157,625 € ≈ 1.157,63 €');

    contenedor.querySelector<HTMLButtonElement>('[data-mat-etapa="8"]')!.click();
    expect(contenedor.querySelector('[data-mat-titulo]')!.textContent).toContain('interés total');
    expect(contenedor.querySelector('[data-mat-ecuaciones]')!.textContent).toContain('I = Cₙ − C₀');
    expect(contenedor.querySelector('[data-mat-ecuaciones]')!.textContent).toContain('157,63');
    desmontar();
  });

  it('permite recorrer manualmente y respeta prefers-reduced-motion', () => {
    prepararMovimiento(true);
    const contenedor = document.createElement('div');
    document.body.append(contenedor);
    const desmontar = montarCapitalizacionCompuesta(contenedor);
    expect(contenedor.querySelector<HTMLButtonElement>('[data-mat-accion="reproducir"]')!.hidden).toBe(true);
    expect(contenedor.querySelector<HTMLElement>('[data-mat-reducido]')!.hidden).toBe(false);
    contenedor.querySelector<HTMLButtonElement>('[data-mat-accion="siguiente"]')!.click();
    expect(contenedor.querySelector('[data-mat-titulo]')!.textContent).toContain('interés del año 1');
    desmontar();
  });
});

describe('modo cuaderno (predecir antes de ver)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  it('oculta cada cálculo, también en el gráfico, hasta que se pide verlo', () => {
    prepararMovimiento(false);
    const contenedor = document.createElement('div');
    document.body.append(contenedor);
    montarCapitalizacionCompuesta(contenedor);
    const q = <T extends HTMLElement>(s: string) => contenedor.querySelector<T>(s)!;

    // La regla no tiene nada que calcular.
    expect(q('[data-mat-reto]').hidden).toBe(true);
    // En modo cuaderno no hay reproducción automática: el ritmo lo marca el alumno.
    expect(q('[data-mat-accion="reproducir"]').hidden).toBe(true);

    q<HTMLButtonElement>('[data-mat-accion="siguiente"]').click();
    expect(q('[data-mat-reto]').hidden).toBe(false);
    expect(q('[data-mat-reto-texto]').textContent).toContain('interés del año 1');
    expect(q('[data-mat-ecuaciones]').hidden).toBe(true);
    expect(q('.mat-etiqueta-delta').textContent).toBe('+?');

    q<HTMLButtonElement>('[data-mat-accion="revelar"]').click();
    expect(q('[data-mat-reto]').hidden).toBe(true);
    expect(q('[data-mat-ecuaciones]').hidden).toBe(false);
    expect(q('.mat-etiqueta-delta').textContent).toContain('50,00');
    // Los símbolos llevan su color fijo.
    expect(q('[data-mat-ecuaciones] .s-c0').textContent).toBe('C₀');

    // Al volver a una etapa ya hecha, sigue visible.
    q<HTMLButtonElement>('[data-mat-accion="anterior"]').click();
    q<HTMLButtonElement>('[data-mat-accion="siguiente"]').click();
    expect(q('[data-mat-ecuaciones]').hidden).toBe(false);
  });

  it('sin modo cuaderno se ve todo y se puede reproducir', () => {
    prepararMovimiento(false);
    const contenedor = document.createElement('div');
    document.body.append(contenedor);
    montarCapitalizacionCompuesta(contenedor);
    const q = <T extends HTMLElement>(s: string) => contenedor.querySelector<T>(s)!;
    q<HTMLButtonElement>('[data-mat-accion="cuaderno"]').click();
    expect(q('[data-mat-accion="cuaderno"]').getAttribute('aria-pressed')).toBe('false');
    expect(q('[data-mat-accion="reproducir"]').hidden).toBe(false);
    q<HTMLButtonElement>('[data-mat-accion="siguiente"]').click();
    expect(q('[data-mat-reto]').hidden).toBe(true);
    expect(q('[data-mat-ecuaciones]').hidden).toBe(false);
  });
});
