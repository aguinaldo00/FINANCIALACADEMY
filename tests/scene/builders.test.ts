import type { Group, Mesh } from 'three';
import { describe, expect, it } from 'vitest';
import { tema01 } from '../../src/content/temas/tema-01/index.ts';
import { construirCapaDinamica, construirCapaEstatica } from '../../src/scene/three/builders.ts';
import { modeloCiudad } from '../../src/world/cityModel.ts';

const m = modeloCiudad(tema01, { dominio: { bde: 1, bancos: 0.5 }, intentos: {} });
const nombres = (g: Group) => {
  const n: string[] = [];
  g.traverse((o) => n.push(o.name));
  return n;
};

describe('maqueta Three.js (sin renderer)', () => {
  const capa = construirCapaDinamica(m);

  it('un grupo seleccionable por concepto', () => {
    expect(capa.edificios.size).toBe(45);
    for (const [id, g] of capa.edificios) expect(g.userData).toEqual({ tipo: 'edificio', conceptoId: id });
  });

  it('la geometría refleja la fase: solar, en obra o construido', () => {
    expect(nombres(capa.edificios.get('mur')!)).toContain('fantasma');
    expect(nombres(capa.edificios.get('mur')!)).not.toContain('cuerpo');
    expect(nombres(capa.edificios.get('bancos')!)).toContain('andamio');
    const bde = nombres(capa.edificios.get('bde')!);
    expect(bde).toContain('cuerpo');
    expect(bde).not.toContain('andamio');
  });

  it('el edificio en obra es más bajo que construido', () => {
    const alto = (id: string) => (capa.edificios.get(id)!.getObjectByName('cuerpo') as Mesh).position.y;
    const completo = construirCapaDinamica(modeloCiudad(tema01, { dominio: { bancos: 1 }, intentos: {} }));
    expect(alto('bancos')).toBeLessThan((completo.edificios.get('bancos')!.getObjectByName('cuerpo') as Mesh).position.y);
  });

  it('hitos "Estudia ya", calor del Atlas y tráfico solo donde hay estudio', () => {
    expect(capa.marcadores).toHaveLength(3);
    expect(capa.calor).toHaveLength(12);
    expect(capa.rutas.length).toBeGreaterThan(0);
    expect(construirCapaDinamica(modeloCiudad(tema01, { dominio: {}, intentos: {} })).coches).toBeNull();
  });

  it('las zonas de la capa estática son seleccionables', () => {
    const zonas: string[] = [];
    construirCapaEstatica(m).traverse((o) => {
      if (o.userData.tipo === 'zona' && o.name === 'plataforma') zonas.push(o.userData.seccionId);
    });
    expect(zonas).toEqual(tema01.secciones.map((s) => s.id));
  });
});
