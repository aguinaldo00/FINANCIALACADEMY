import { describe, expect, it } from 'vitest';
import { tema01 } from '../../src/content/temas/tema-01/index.ts';
import { modeloCiudad } from '../../src/world/cityModel.ts';
import { etiquetasDelNivel } from '../../src/world/labels.ts';

const m = modeloCiudad(tema01, { dominio: {}, intentos: {} });

describe('jerarquía de etiquetas sobre la maqueta', () => {
  it('la ciudad rotula barrios e hitos "Estudia ya", no las 12 zonas', () => {
    const f = etiquetasDelNivel(m, { nivel: 'ciudad' }, false);
    expect(f.filter((x) => x.nivel === 'barrio')).toHaveLength(4);
    expect(f.filter((x) => x.nivel === 'zona')).toHaveLength(3);
    expect(etiquetasDelNivel(m, { nivel: 'ciudad' }, true)).toHaveLength(12);
  });

  it('una zona no rotula sus edificios salvo en lectura de mapa', () => {
    expect(etiquetasDelNivel(m, { nivel: 'zona', seccionId: '4.2A' }, false)).toEqual([]);
    expect(etiquetasDelNivel(m, { nivel: 'zona', seccionId: '4.2A' }, true)).toHaveLength(8);
    expect(etiquetasDelNivel(m, { nivel: 'edificio', conceptoId: 'bde' }, false)).toEqual([{ nivel: 'edificio', conceptoId: 'bde' }]);
  });
});
