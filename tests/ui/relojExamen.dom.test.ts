// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { faseReloj, formatoReloj, htmlRelojExamen, montarRelojExamen } from '../../src/ui/components/relojExamen.ts';

describe('reloj del examen real', () => {
  afterEach(() => vi.useRealTimers());

  it('escribe minutos y segundos, y el tiempo de más con +', () => {
    expect(formatoReloj(600)).toBe('10:00');
    expect(formatoReloj(67)).toBe('1:07');
    expect(formatoReloj(-23)).toBe('+0:23');
  });

  it('avisa en el último minuto y al agotarse', () => {
    expect(faseReloj(61)).toBe('normal');
    expect(faseReloj(60)).toBe('ultimo');
    expect(faseReloj(0)).toBe('agotado');
    // Aviso suave al pasar la mitad (12 s).
    expect(faseReloj(300, 600)).toBe('mitad');
    expect(faseReloj(285, 600)).toBe('normal');
  });

  it('cuenta hacia atrás desde la hora de inicio y se para al comprobar', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-17T10:00:00Z'));
    const raiz = document.createElement('div');
    raiz.innerHTML = htmlRelojExamen();
    const reloj = montarRelojExamen(raiz, () => {});
    const caja = raiz.querySelector<HTMLElement>('[data-lab-reloj]')!;
    const cifra = raiz.querySelector('[data-lab-reloj-cifra]')!;
    expect(caja.hidden).toBe(true);
    reloj.mostrar(Date.now(), 10);
    expect(caja.hidden).toBe(false);
    expect(cifra.textContent).toBe('10:00');
    vi.advanceTimersByTime(9 * 60_000 + 30_000);
    expect(cifra.textContent).toBe('0:30');
    expect(caja.dataset.fase).toBe('ultimo');
    vi.advanceTimersByTime(45_000);
    expect(caja.dataset.fase).toBe('agotado');
    reloj.parar();
    expect(caja.dataset.fase).toBe('parado');
    expect(cifra.textContent).toBe('10:15');
    reloj.ocultar();
    expect(caja.hidden).toBe(true);
    reloj.desmontar();
  });
});
