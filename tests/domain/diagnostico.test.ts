import { describe, expect, it } from 'vitest';
import { diagnosticar } from '../../src/domain/tema2/diagnostico.ts';
import { LABORATORIOS } from '../../src/domain/tema2/laboratorio.ts';
import { preguntasSimulacro } from '../../src/ui/views/tema2/simulacro.ts';

const lab = LABORATORIOS['simple-intereses']!;
const datos = { C_0: '10.000 €', n: '3', i: '7 %' };

describe('diagnóstico de fallos del Tema 2', () => {
  it('bien → sin fallo; lectura y elección mandan sobre el resultado', () => {
    expect(diagnosticar({ lecturaBien: true, formulaBien: true, resultado: '2.100 €' }, lab, datos)).toBeNull();
    expect(diagnosticar({ lecturaBien: false, formulaBien: true, resultado: '5 €' }, lab, datos)).toBe('lectura');
    expect(diagnosticar({ lecturaBien: true, formulaBien: false, resultado: '5 €' }, lab, datos)).toBe('eleccion');
    expect(diagnosticar({ lecturaBien: true, formulaBien: true, resultado: '2.000 €' }, lab, datos)).toBe('calculo');
  });

  it('días sin pasar a fracción de año → unidades', () => {
    // 45 días al 5 %: usar n = 45 en vez de 45/360.
    const d = { C_0: '6.000 €', n: '45/360', i: '5 %' };
    expect(diagnosticar({ lecturaBien: true, formulaBien: true, resultado: '13.500 €' }, lab, d)).toBe('unidades');
  });
});

describe('simulacro del Tema 2', () => {
  it('mezcla las tres partes, sin repetir fórmula, y la misma semilla da los mismos ejercicios', () => {
    const a = preguntasSimulacro(1234, 6, false);
    expect(a).toHaveLength(6);
    expect(new Set(a.map((p) => p.formula)).size).toBe(6);
    expect(new Set(a.map((p) => p.formula.split('-')[0]))).toEqual(new Set(['simple', 'compuesta', 'descuento']));
    expect(preguntasSimulacro(1234, 6, false)).toEqual(a);
  });
});
