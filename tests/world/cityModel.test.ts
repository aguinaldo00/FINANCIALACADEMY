import { describe, expect, it } from 'vitest';
import { tema01 } from '../../src/content/temas/tema-01/index.ts';
import { dominioGlobal } from '../../src/domain/mastery.ts';
import { seccionesPrioritarias } from '../../src/domain/priority.ts';
import type { Progreso } from '../../src/domain/progress.ts';
import { vistaAtlas } from '../../src/world/atlas.ts';
import { ALTURA_ESTANDAR, faseObra, modeloCiudad } from '../../src/world/cityModel.ts';
import { areaRect } from '../../src/world/geometry.ts';

const progreso: Progreso = { dominio: { sf: 1, bancos: 0.5, bde: 1, cajas: 0.25 }, intentos: {} };
const m = modeloCiudad(tema01, progreso);

describe('modelo visual de la ciudad', () => {
  it('un barrio por grupo, una zona por sección y un edificio por concepto', () => {
    expect(m.barrios.map((b) => b.grupoId)).toEqual(tema01.grupos.map((g) => g.id));
    expect(m.zonas.map((z) => z.seccionId)).toEqual(tema01.secciones.map((s) => s.id));
    expect(m.edificios.map((e) => e.conceptoId)).toEqual(tema01.conceptos.map((c) => c.id));
  });

  it('la superficie representa el peso real en examen', () => {
    const ciudad = m.lado * m.lado;
    const pesoTotal = tema01.secciones.reduce((s, x) => s + x.pesoExamen, 0);
    for (const b of m.barrios) {
      expect(b.pesoExamen).toBe(tema01.secciones.filter((s) => s.grupoId === b.grupoId).reduce((s, x) => s + x.pesoExamen, 0));
      expect(areaRect(b.rect) / ciudad).toBeCloseTo(b.pesoExamen / pesoTotal, 6);
      for (const z of m.zonas.filter((z) => z.grupoId === b.grupoId)) {
        expect(areaRect(z.lote) / areaRect(b.parcela)).toBeCloseTo(z.pesoExamen / b.pesoExamen, 6);
      }
    }
  });

  it('el estado de cada edificio sale del dominio (solo los niveles existentes)', () => {
    const fase = (id: string) => m.edificios.find((e) => e.conceptoId === id)!.fase;
    expect(fase('sf')).toBe('completo');
    expect(fase('bancos')).toBe('obra');
    expect(fase('cajas')).toBe('obra');
    expect(fase('mur')).toBe('solar');
    expect(faseObra('dominado')).toBe('completo');
    expect(faseObra('sin-estudiar')).toBe('solar');
  });

  it('solo los edificios de la portada tienen altura y tejado propios', () => {
    for (const e of m.edificios) {
      const portada = tema01.ciudad.edificios.find((x) => x.conceptoId === e.conceptoId);
      expect(e.emblematico).toBe(Boolean(portada));
      expect(e.tejado).toBe(portada ? portada.tejado : 'plano');
      if (!portada) expect(e.alturaCompleta).toBe(ALTURA_ESTANDAR);
    }
    const bce = m.edificios.find((e) => e.conceptoId === 'bce')!;
    const bde = m.edificios.find((e) => e.conceptoId === 'bde')!;
    expect(bce.alturaCompleta).toBeGreaterThan(bde.alturaCompleta);
  });

  it('los edificios quedan dentro de su zona y el arbolado no los pisa', () => {
    for (const e of m.edificios) {
      const z = m.zonas.find((z) => z.seccionId === e.seccionId)!.interior;
      expect(e.posicion.x).toBeGreaterThanOrEqual(z.x);
      expect(e.posicion.x).toBeLessThanOrEqual(z.x + z.ancho);
      expect(e.posicion.z).toBeGreaterThanOrEqual(z.z);
      expect(e.posicion.z).toBeLessThanOrEqual(z.z + z.fondo);
    }
    for (const a of m.arboles) {
      for (const e of m.edificios) {
        expect(Math.max(Math.abs(a.posicion.x - e.posicion.x), Math.abs(a.posicion.z - e.posicion.z))).toBeGreaterThan(e.huella / 2);
      }
    }
  });

  it('las prioridades coinciden con "Estudia ya" de la portada', () => {
    const ya = seccionesPrioritarias(tema01, progreso).map((s) => s.id);
    const marcadas = m.zonas.filter((z) => z.prioridad).sort((a, b) => a.prioridad! - b.prioridad!).map((z) => z.seccionId);
    expect(marcadas).toEqual(ya);
  });

  it('es determinista', () => {
    expect(modeloCiudad(tema01, progreso)).toEqual(m);
  });

  it('el dominio de la ciudad en el Atlas es el dominio global', () => {
    expect(vistaAtlas(m, { nivel: 'ciudad' }).dominio).toBeCloseTo(dominioGlobal(tema01, progreso), 10);
  });
});
