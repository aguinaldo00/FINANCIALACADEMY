import { describe, expect, it } from 'vitest';
import { calcularPro, simboloDeNombre } from '../../src/ui/components/hojaCalculo.ts';

describe('hoja de cálculo · modo Pro', () => {
  it('reconoce cada símbolo escrito de muchas formas, y distingue mayúsculas en las letras sueltas', () => {
    for (const n of ['C0', 'c0', 'C_0', 'Co', 'co', 'C₀']) expect(simboloDeNombre(n), n).toBe('C_0');
    for (const n of ['Cn', 'cn', 'C_n']) expect(simboloDeNombre(n), n).toBe('C_n');
    expect(simboloDeNombre('I')).toBe('I');
    expect(simboloDeNombre('i')).toBe('i');
    expect(simboloDeNombre('N')).toBe('N');
    expect(simboloDeNombre('n')).toBe('n');
    expect(simboloDeNombre('i12')).toBe('i_m');
    expect(simboloDeNombre('TIN')).toBe('J_m');
    expect(simboloDeNombre('tae')).toBe('TAE');
    expect(simboloDeNombre('x')).toBeNull();
  });

  it('calcula la fórmula del alumno con sus variables, aunque las escriba distinto en cada sitio', () => {
    const r = calcularPro([{ nombre: 'Cn', valor: '12.100' }, { nombre: 'n', valor: '3' }, { nombre: 'i', valor: '7 %' }], 'C0 = cn / (1 + n * i)');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.valor).toBeCloseTo(10000, 9);
    expect(r.clave).toBe('C_0');
    expect(r.sustitucion).toBe('C0 = (12.100) / (1 + (3) * (0,07))');
    // Compuesta, con potencia y nombres libres.
    const c = calcularPro([{ nombre: 'capital', valor: '1000' }, { nombre: 'tipo', valor: '0,05' }, { nombre: 'años', valor: '3' }], 'final = capital × (1 + tipo) ^ años');
    expect(c.ok && c.valor).toBeCloseTo(1157.625, 9);
  });

  it('dice qué falta o qué está mal, sin calcular', () => {
    const sinVariable = calcularPro([{ nombre: 'n', valor: '3' }], 'I = C0 * n * i');
    expect(!sinVariable.ok && sinVariable.error).toContain('«C0» no está entre tus variables');
    const repetida = calcularPro([{ nombre: 'C0', valor: '1' }, { nombre: 'c_0', valor: '2' }], 'x = C0');
    expect(!repetida.ok && repetida.error).toContain('son la misma variable');
    const dosIguales = calcularPro([{ nombre: 'a', valor: '1' }], 'x = a = a');
    expect(dosIguales.ok).toBe(false);
    const sinFormula = calcularPro([{ nombre: 'a', valor: '1' }], '');
    expect(!sinFormula.ok && sinFormula.error).toContain('Escribe la fórmula');
  });

  it('avisa de un tipo escrito sin % (7 en vez de 7 %)', () => {
    const r = calcularPro([{ nombre: 'C0', valor: '1000' }, { nombre: 'i', valor: '7' }, { nombre: 'n', valor: '1' }], 'I = C0 * n * i');
    expect(r.ok && r.avisos.join(' ')).toContain('%');
  });
});
