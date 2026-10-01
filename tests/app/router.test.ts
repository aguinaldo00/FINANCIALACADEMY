import { describe, expect, it } from 'vitest';
import { resolverRuta } from '../../src/app/router.ts';
import { tema01 } from '../../src/content/temas/tema-01/index.ts';

describe('rutas hash', () => {
  it('sin hash o #inicio va al inicio', () => {
    expect(resolverRuta('', tema01)).toEqual({ vista: 'inicio', scrollArriba: true });
    expect(resolverRuta('#inicio', tema01)).toEqual({ vista: 'inicio', scrollArriba: true });
  });

  it('#s/<id> abre la sección', () => {
    expect(resolverRuta('#s/3.2A', tema01)).toEqual({ vista: 'seccion', seccionId: '3.2A', conceptoFoco: null, scrollArriba: true });
  });

  it('#c/<id> abre la sección del concepto y lo enfoca sin volver arriba', () => {
    expect(resolverRuta('#c/fgd', tema01)).toEqual({ vista: 'seccion', seccionId: '4.2A', conceptoFoco: 'fgd', scrollArriba: false });
  });

  it('ids desconocidos llevan al inicio', () => {
    expect(resolverRuta('#s/9.9', tema01)).toEqual({ vista: 'inicio', scrollArriba: true });
    expect(resolverRuta('#c/nada', tema01)).toEqual({ vista: 'inicio', scrollArriba: false });
    expect(resolverRuta('#otra', tema01)).toEqual({ vista: 'inicio', scrollArriba: true });
  });
});
