import { describe, expect, it } from 'vitest';
import { desgloseDias, diasEntre, fechaDescuento, generarRemesa, liquidarRemesa, REMESA_EJEMPLO, sumarDias } from '../../src/domain/tema2/remesa.ts';

describe('remesa de efectos', () => {
  it('liquida el ejemplo de la explicación letra a letra', () => {
    const L = liquidarRemesa(REMESA_EJEMPLO.letras, REMESA_EJEMPLO.condiciones);
    expect(L.lineas.map((x) => x.descuento)).toEqual([6.67, 5.56, 125]);
    expect(L.lineas.map((x) => x.comision)).toEqual([12, 10, 30]);
    expect(L.lineas[1]!.minimoAplicado).toBe(true);
    expect([L.nominal, L.descuento, L.comision, L.gastos, L.liquido]).toEqual([5000, 137.23, 52, 9, 4801.77]);
  });

  it('coincide con el ejemplo de la fórmula 17 (una sola letra)', () => {
    const L = liquidarRemesa([{ nominal: 6000, dias: 45 }], { d: 0.05, base: 360, comision: 0.01, minimo: 10, gastos: 3 });
    expect(L.liquido).toBe(5899.5);
  });

  it('genera remesas de tres plazos distintos, con una letra que paga el mínimo', () => {
    for (let s = 1; s <= 300; s++) {
      const { letras, condiciones } = generarRemesa(s);
      expect(letras).toHaveLength(3);
      expect(letras[0]!.dias).toBeLessThan(letras[1]!.dias);
      expect(letras[1]!.dias).toBeLessThan(letras[2]!.dias);
      expect(letras[2]!.dias).toBeLessThanOrEqual(330);
      expect(liquidarRemesa(letras, condiciones).lineas[0]!.minimoAplicado).toBe(true);
      expect(generarRemesa(s)).toEqual(generarRemesa(s));
    }
  });

  it('cuenta los días entre fechas como en el examen', () => {
    const desde = { dia: 10, mes: 3, anio: 2026 };
    const hasta = { dia: 19, mes: 4, anio: 2026 };
    expect(diasEntre(desde, hasta)).toBe(40);
    expect(desgloseDias(desde, hasta)).toEqual([{ mes: 'marzo', dias: 21 }, { mes: 'abril', dias: 19 }]);
    for (let s = 1; s <= 200; s++) {
      const f = fechaDescuento(s);
      for (const n of [20, 45, 150, 330]) {
        const v = sumarDias(f, n);
        expect(diasEntre(f, v)).toBe(n);
        expect(desgloseDias(f, v).reduce((a, p) => a + p.dias, 0)).toBe(n);
      }
    }
  });
});
