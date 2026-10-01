import { describe, expect, it } from 'vitest';
import { tema01 } from '../../src/content/temas/tema-01/index.ts';
import { modeloCiudad } from '../../src/world/cityModel.ts';
import { etiquetasDelNivel } from '../../src/world/labels.ts';

const m = modeloCiudad(tema01, { dominio: {}, intentos: {} });

describe('jerarquía de etiquetas sobre la maqueta', () => {
  it('la vista general solo rotula los barrios: sin zonas, cifras ni pines', () => {
    const f = etiquetasDelNivel(m, { nivel: 'ciudad' }, false);
    expect(f.map((x) => x.nivel)).toEqual(['barrio', 'barrio', 'barrio', 'barrio']);
    // En lectura de mapa (Atlas) se identifican las zonas.
    expect(etiquetasDelNivel(m, { nivel: 'ciudad' }, true)).toHaveLength(12);
  });

  it('el barrio identifica sus zonas; zona y edificio no tienen rótulos permanentes', () => {
    expect(etiquetasDelNivel(m, { nivel: 'barrio', grupoId: '4' }, false)).toHaveLength(3);
    expect(etiquetasDelNivel(m, { nivel: 'zona', seccionId: '4.2A' }, false)).toEqual([]);
    expect(etiquetasDelNivel(m, { nivel: 'zona', seccionId: '4.2A' }, true)).toEqual([]);
    expect(etiquetasDelNivel(m, { nivel: 'edificio', conceptoId: 'bde' }, false)).toEqual([]);
  });
});
