// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest';
import { CLAVE_INTRO_BARCO, introBarcoPendiente } from '../../src/ui/intro/introBarco.ts';

describe('intro del barco: cuándo se reproduce sola', () => {
  beforeEach(() => localStorage.clear());

  it('la primera vez sí', () => {
    expect(introBarcoPendiente(false)).toBe(true);
  });

  it('una vez vista, no se repite al volver al inicio', () => {
    localStorage.setItem(CLAVE_INTRO_BARCO, 'vista');
    expect(introBarcoPendiente(false)).toBe(false);
  });

  it('con movimiento reducido nunca se reproduce sola', () => {
    expect(introBarcoPendiente(true)).toBe(false);
  });
});
