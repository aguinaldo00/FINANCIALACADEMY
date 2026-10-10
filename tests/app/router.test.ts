import { describe, expect, it } from 'vitest';
import { hrefTema2, resolverRuta } from '../../src/app/router.ts';
import { tema01 } from '../../src/content/temas/tema-01/index.ts';

describe('rutas hash', () => {
  it('sin hash se entra por el índice de temas; #inicio es la portada del tema 1', () => {
    expect(resolverRuta('', tema01)).toEqual({ vista: 'temas', scrollArriba: true });
    expect(resolverRuta('#temas', tema01)).toEqual({ vista: 'temas', scrollArriba: true });
    expect(resolverRuta('#inicio', tema01)).toEqual({ vista: 'inicio', scrollArriba: true });
  });

  it('#tema/2 con lección y parte; lo desconocido cae en la portada del tema 2', () => {
    expect(resolverRuta('#tema/2', tema01)).toEqual({ vista: 'tema2', leccion: null, parte: null, scrollArriba: true });
    expect(resolverRuta('#tema/2/capitalizacion-compuesta', tema01))
      .toEqual({ vista: 'tema2', leccion: 'capitalizacion-compuesta', parte: null, scrollArriba: true });
    expect(resolverRuta('#tema/2/capitalizacion-compuesta/papel', tema01))
      .toEqual({ vista: 'tema2', leccion: 'capitalizacion-compuesta', parte: 'papel', scrollArriba: false });
    expect(resolverRuta('#tema/2/capitalizacion-compuesta/nada', tema01))
      .toEqual({ vista: 'tema2', leccion: 'capitalizacion-compuesta', parte: null, scrollArriba: true });
    expect(resolverRuta('#tema/2/otra', tema01)).toEqual({ vista: 'tema2', leccion: null, parte: null, scrollArriba: true });
    expect(hrefTema2('capitalizacion-compuesta', 'errores')).toBe('#tema/2/capitalizacion-compuesta/errores');
  });

  it('#s/<id> abre la sección', () => {
    expect(resolverRuta('#s/3.2A', tema01)).toEqual({ vista: 'seccion', seccionId: '3.2A', conceptoFoco: null, scrollArriba: true });
  });

  it('#c/<id> abre la sección del concepto y lo enfoca sin volver arriba', () => {
    expect(resolverRuta('#c/fgd', tema01)).toEqual({ vista: 'seccion', seccionId: '4.2A', conceptoFoco: 'fgd', scrollArriba: false });
  });

  it('#examen abre la predicción de examen', () => {
    expect(resolverRuta('#examen', tema01)).toEqual({ vista: 'examen', scrollArriba: true });
    expect(resolverRuta('#examen', { ...tema01, ampliacion: undefined })).toEqual({ vista: 'inicio', scrollArriba: true });
    expect(resolverRuta('#simulacro', tema01)).toEqual({ vista: 'simulacro', scrollArriba: true });
    expect(resolverRuta('#repaso', tema01)).toEqual({ vista: 'repaso', scrollArriba: true });
    expect(resolverRuta('#repaso', { ...tema01, ampliacion: undefined })).toEqual({ vista: 'inicio', scrollArriba: true });
    expect(resolverRuta('#repaso/bde', tema01)).toEqual({ vista: 'repaso', conceptoId: 'bde', scrollArriba: true });
    expect(resolverRuta('#repaso/nada', tema01)).toEqual({ vista: 'inicio', scrollArriba: true });
    expect(resolverRuta('#visual', tema01)).toEqual({ vista: 'visual', scrollArriba: true });
  });

  it('ids desconocidos llevan al inicio', () => {
    expect(resolverRuta('#s/9.9', tema01)).toEqual({ vista: 'inicio', scrollArriba: true });
    expect(resolverRuta('#c/nada', tema01)).toEqual({ vista: 'inicio', scrollArriba: false });
    expect(resolverRuta('#otra', tema01)).toEqual({ vista: 'inicio', scrollArriba: true });
  });
});
