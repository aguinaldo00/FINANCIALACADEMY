import { describe, expect, it } from 'vitest';
import { hrefFase, hrefFormula, hrefTema2, resolverRuta } from '../../src/app/router.ts';
import { tema01 } from '../../src/content/temas/tema-01/index.ts';

describe('rutas hash', () => {
  it('sin hash se entra por el selector de asignaturas; #temas es Gestión Financiera; #inicio, la portada del tema 1', () => {
    expect(resolverRuta('', tema01)).toEqual({ vista: 'academia', scrollArriba: true });
    expect(resolverRuta('#academia', tema01)).toEqual({ vista: 'academia', scrollArriba: true });
    expect(resolverRuta('#temas', tema01)).toEqual({ vista: 'asignatura', asignaturaId: 'gestion-financiera', scrollArriba: true });
    expect(resolverRuta('#a/gestion-financiera', tema01)).toEqual({ vista: 'asignatura', asignaturaId: 'gestion-financiera', scrollArriba: true });
    // Una asignatura desconocida vuelve al selector.
    expect(resolverRuta('#a/astrologia', tema01)).toEqual({ vista: 'academia', scrollArriba: true });
    expect(resolverRuta('#inicio', tema01)).toEqual({ vista: 'inicio', scrollArriba: true });
  });

  it('#tema/2: índice, bloque, ficha de fórmula y fases; lo desconocido cae en el índice', () => {
    const t2 = (pantalla: unknown, scrollArriba = true) => ({ vista: 'tema2', pantalla, scrollArriba });
    expect(resolverRuta('#tema/2', tema01)).toEqual(t2({ tipo: 'indice', bloque: null }));
    expect(resolverRuta('#tema/2/simple', tema01)).toEqual(t2({ tipo: 'indice', bloque: 'simple' }, false));
    expect(resolverRuta('#tema/2/simple/formulas', tema01)).toEqual(t2({ tipo: 'indice', bloque: 'simple' }, false));
    expect(resolverRuta('#tema/2/f/simple-intereses', tema01)).toEqual(t2({ tipo: 'formula', id: 'simple-intereses' }));
    expect(resolverRuta('#tema/2/f/no-existe', tema01)).toEqual(t2({ tipo: 'indice', bloque: null }));
    expect(resolverRuta('#tema/2/descuento/datos', tema01)).toEqual(t2({ tipo: 'fase', bloque: 'descuento', fase: 'datos' }));
    expect(resolverRuta('#tema/2/simple/elegir#t2-ej-s-juana', tema01)).toEqual(t2({ tipo: 'fase', bloque: 'simple', fase: 'elegir' }, false));
    expect(resolverRuta('#tema/2/otra', tema01)).toEqual(t2({ tipo: 'indice', bloque: null }));
    expect(hrefTema2()).toBe('#tema/2');
    expect(hrefFormula('compuesta-tae')).toBe('#tema/2/f/compuesta-tae');
    expect(hrefFase('compuesta', 'practica')).toBe('#tema/2/compuesta/practica');
    expect(hrefFase('compuesta', 'formulas')).toBe('#tema/2/compuesta');
  });

  it('los enlaces de la lección anterior de compuesta llevan a su sitio en el tema rehecho', () => {
    const t2 = (pantalla: unknown, scrollArriba: boolean) => ({ vista: 'tema2', pantalla, scrollArriba });
    expect(resolverRuta('#tema/2/capitalizacion-compuesta', tema01)).toEqual(t2({ tipo: 'indice', bloque: 'compuesta' }, false));
    expect(resolverRuta('#tema/2/capitalizacion-compuesta/simbolos', tema01)).toEqual(t2({ tipo: 'indice', bloque: 'compuesta' }, false));
    expect(resolverRuta('#tema/2/capitalizacion-compuesta/papel', tema01)).toEqual(t2({ tipo: 'fase', bloque: 'compuesta', fase: 'practica' }, true));
    expect(resolverRuta('#tema/2/capitalizacion-compuesta/reconocer', tema01)).toEqual(t2({ tipo: 'fase', bloque: 'compuesta', fase: 'elegir' }, true));
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
    expect(resolverRuta('#glosario', tema01)).toEqual({ vista: 'glosario', scrollArriba: true });
  });

  it('ids desconocidos llevan al inicio', () => {
    expect(resolverRuta('#s/9.9', tema01)).toEqual({ vista: 'inicio', scrollArriba: true });
    expect(resolverRuta('#c/nada', tema01)).toEqual({ vista: 'inicio', scrollArriba: false });
    expect(resolverRuta('#otra', tema01)).toEqual({ vista: 'inicio', scrollArriba: true });
  });
});
