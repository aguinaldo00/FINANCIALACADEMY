import { describe, expect, it } from 'vitest';
import { FORMULAS_TEMA2 } from '../../src/content/temas/tema-02/formulas.ts';
import { comprobar, esperado, LABORATORIOS, leerDato, mostrar } from '../../src/domain/tema2/laboratorio.ts';
import { formatear } from '../../src/domain/tema2/expresion.ts';
import { LISTA_ESCENAS } from '../../src/ui/escenas/index.ts';
import { simbolosDe } from '../../src/ui/matematica/formula.ts';

const lab = (id: string) => LABORATORIOS[id]!;

describe('laboratorio de cada fórmula', () => {
  it('cada laboratorio usa los símbolos de su fórmula y calcula su incógnita', () => {
    for (const f of FORMULAS_TEMA2) {
      const l = LABORATORIOS[f.id];
      if (!f.calcula) { expect(l, f.id).toBeUndefined(); continue; }
      expect(l, f.id).toBeDefined();
      expect(l!.incognita.simbolo).toBe(f.calcula);
      const enFormula = simbolosDe(f.expresion);
      for (const d of l!.datos) expect(enFormula, `${f.id}: ${d.simbolo}`).toContain(d.simbolo);
    }
  });

  it('da los resultados de los casos del libro', () => {
    expect(mostrar(esperado(lab('simple-capital-inicial'), { C_n: 3000, n: 3, i: 0.07 })!, 'euros')).toBe('2.479,34 €');
    expect(mostrar(esperado(lab('compuesta-montante'), { C_0: 4500, i: 0.03, n: 7 })!, 'euros')).toBe('5.534,43 €');
    expect(mostrar(esperado(lab('compuesta-intereses'), { C_0: 4500, i: 0.03, n: 7 })!, 'euros')).toBe('1.034,43 €');
    expect(mostrar(esperado(lab('compuesta-capital-inicial'), { C_n: 9000, i: 0.07, n: 8 })!, 'euros')).toBe('5.238,08 €');
    expect(mostrar(esperado(lab('compuesta-tiempo'), { C_0: 30000, C_n: 35000, i: 0.1 })!, 'tiempo')).toBe('1,62');
    expect(mostrar(esperado(lab('compuesta-equivalentes'), { i: 0.1, m: 12 })!, 'tipo')).toBe('0,7974 %');
    expect(mostrar(esperado(lab('compuesta-tae'), { J_m: 0.12, m: 12 })!, 'tipo')).toBe('12,6825 %');
    expect(mostrar(esperado(lab('simple-tiempo'), { C_0: 6000, C_n: 6500, i: 0.03 })!, 'tiempo')).toBe('2,78');
    expect(esperado(lab('simple-montante'), { C_0: 1000, n: 2 })).toBeNull();
  });

  it('lee los datos sin corregirlos en silencio', () => {
    expect(leerDato('7 %', 'tipo')).toEqual({ ok: true, valor: 0.07 });
    expect(leerDato('3.000 €', 'euros')).toEqual({ ok: true, valor: 3000 });
    expect(leerDato('195/365', 'tiempo')).toMatchObject({ ok: true });
    const siete = leerDato('7', 'tipo');
    expect(siete).toMatchObject({ ok: true, valor: 7 });
    if (siete.ok === true) expect(siete.aviso).toContain('%');
    expect(leerDato('', 'euros')).toEqual({ ok: 'vacio' });
  });

  it('comprueba con la tolerancia de cada magnitud y avisa si el tipo está en %', () => {
    const l = lab('compuesta-equivalentes');
    const x = esperado(l, { i: 0.1, m: 12 })!;
    expect(comprobar('0,007974', l, x).bien).toBe(true);
    expect(comprobar('0,7974 %', l, x).bien).toBe(true);
    expect(comprobar('0,7974', l, x).mensaje).toContain('en %');
    expect(comprobar('0,8333 %', l, x).bien).toBe(false);
    const c0 = lab('simple-capital-inicial');
    expect(comprobar('2.479,34', c0, 3000 / 1.21).bien).toBe(true);
    expect(comprobar('2479,3', c0, 3000 / 1.21).bien).toBe(false);
  });

  it('el caso de cada animación es el mismo ejercicio que resuelve su laboratorio y da lo que pinta la escena', () => {
    const conCaso = LISTA_ESCENAS.filter((e) => e.caso);
    expect(conCaso.length).toBe(Object.keys(LABORATORIOS).length);
    for (const e of conCaso) {
      const l = LABORATORIOS[e.id]!;
      expect(Object.keys(e.caso!).sort(), e.id).toEqual(l.datos.map((d) => d.simbolo).sort());
      const valores: Record<string, number> = {};
      for (const d of l.datos) {
        const lectura = leerDato(e.caso![d.simbolo]!, d.magnitud);
        expect(lectura.ok, `${e.id}: ${d.simbolo}`).toBe(true);
        if (lectura.ok === true) { expect(lectura.aviso, `${e.id}: ${d.simbolo}`).toBeUndefined(); valores[d.simbolo] = lectura.valor; }
      }
      const x = esperado(l, valores)!;
      // El resultado aparece en lo que cuenta la escena, con la precisión que ella usa.
      const candidatos = l.incognita.magnitud === 'tipo'
        ? [formatear(x * 100, 4), formatear(x * 100, 2), formatear(x * 100, 0), formatear(x, 6)]
        : [formatear(x, 2), formatear(x, 0)];
      const texto = [e.descripcion, ...e.capitulos.map((c) => c.texto)].join(' ');
      expect(candidatos.some((c) => texto.includes(c)), `${e.id}: ${candidatos.join(' / ')}`).toBe(true);
    }
  });
});
