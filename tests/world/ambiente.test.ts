import { describe, expect, it } from 'vitest';
import { ambienteDeHora, resolverAmbiente, sanearPreferencia, siguienteAmbiente } from '../../src/world/ambiente.ts';
import { AMBIENTES, mezclarPreajustes } from '../../src/scene/three/ambiente.ts';

describe('ambiente de la maqueta', () => {
  it('la hora local decide el ambiente por defecto', () => {
    expect(ambienteDeHora(7)).toBe('dia');
    expect(ambienteDeHora(18)).toBe('dia');
    expect(ambienteDeHora(19)).toBe('atardecer');
    expect(ambienteDeHora(20)).toBe('atardecer');
    expect(ambienteDeHora(21)).toBe('noche');
    expect(ambienteDeHora(3)).toBe('noche');
    expect(resolverAmbiente('auto', new Date(2026, 9, 2, 22))).toBe('noche');
    expect(resolverAmbiente('dia', new Date(2026, 9, 2, 22))).toBe('dia');
  });

  it('el botón recorre día → atardecer → noche → día', () => {
    expect(siguienteAmbiente('dia')).toBe('atardecer');
    expect(siguienteAmbiente('atardecer')).toBe('noche');
    expect(siguienteAmbiente('noche')).toBe('dia');
  });

  it('una preferencia guardada inválida vuelve a "según la hora"', () => {
    expect(sanearPreferencia('noche')).toBe('noche');
    expect(sanearPreferencia('mediodia')).toBe('auto');
    expect(sanearPreferencia(null)).toBe('auto');
    expect(sanearPreferencia(3)).toBe('auto');
  });

  it('la transición interpola números y colores y respeta los extremos', () => {
    const a = AMBIENTES.dia;
    const b = AMBIENTES.noche;
    expect(mezclarPreajustes(a, b, 0)).toEqual({ ...a });
    const fin = mezclarPreajustes(a, b, 1);
    expect(fin.niebla).toBe(b.niebla);
    expect(fin.sol_i).toBeCloseTo(b.sol_i);
    const medio = mezclarPreajustes(a, b, 0.5);
    expect(medio.noche).toBeCloseTo(0.5);
    expect(medio.sol_i).toBeCloseTo((a.sol_i + b.sol_i) / 2);
    expect(mezclarPreajustes(a, b, 7).noche).toBe(1);
  });
});
