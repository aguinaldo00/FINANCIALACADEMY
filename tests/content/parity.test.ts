import { describe, expect, it } from 'vitest';
import { tema01 } from '../../src/content/temas/tema-01/index.ts';
import { validarTema } from '../../src/content/validate.ts';
import { GLYPHS } from '../../src/icons/glyphs.ts';
import { LEYENDA_GLIFOS } from '../../src/icons/legend.ts';
import { ciudadLegacy, htmlLegacy, motorLegacy } from '../helpers/legacy.ts';

const { DATA, G } = motorLegacy();

describe('paridad de contenido con el prototipo', () => {
  it('conserva los metadatos', () => {
    expect(tema01.meta).toEqual({
      numero: DATA.meta.tema,
      titulo: DATA.meta.titulo,
      ciudad: DATA.meta.ciudad,
      fuente: DATA.meta.fuente,
    });
  });

  it('conserva grupos y secciones en el mismo orden', () => {
    expect(tema01.grupos).toEqual(DATA.grupos.map((g) => ({ id: g.id, titulo: g.t })));
    expect(tema01.secciones).toEqual(
      DATA.secciones.map((s) => ({ id: s.id, grupoId: s.g, titulo: s.t, pesoExamen: s.p, descripcion: s.d })),
    );
  });

  it('conserva los modos y solo el tercero se pinta como esquema', () => {
    expect(tema01.modos.map((m) => m.etiqueta)).toEqual(DATA.modos);
    expect(tema01.modos.map((m) => m.formato)).toEqual(['texto', 'texto', 'esquema', 'texto', 'texto']);
  });

  it('conserva cada concepto literalmente', () => {
    expect(tema01.conceptos).toHaveLength(DATA.conceptos.length);
    tema01.conceptos.forEach((c, i) => {
      const l = DATA.conceptos[i]!;
      expect(c).toEqual({
        id: l.id,
        seccionId: l.s,
        nombre: l.n,
        iconos: l.ic,
        color: l.col,
        definicion: l.c,
        ejemploReal: l.e,
        explicaciones: l.o,
        trampaExamen: l.t,
        pregunta: { enunciado: l.q[0], opciones: l.q[1], indiceCorrecta: l.q[2], explicacion: l.q[3] },
      });
    });
  });

  it('conserva los glifos SVG', () => {
    expect({ ...GLYPHS }).toEqual(G);
  });

  it('conserva la disposición de la portada', () => {
    const ROOF: Record<string, string> = { ped: 'fronton', flag: 'bandera', ruin: 'ruina', barn: 'granero', dome: 'cupula', ant: 'antena', flat: 'plano' };
    expect(tema01.ciudad.edificios).toEqual(
      ciudadLegacy.ids.map((id, i) => ({ conceptoId: id, altura: ciudadLegacy.alturas[i], tejado: ROOF[ciudadLegacy.tejados[i]!] })),
    );
  });

  it('conserva la leyenda de la gramática visual', () => {
    for (const [glifo, texto] of LEYENDA_GLIFOS) expect(htmlLegacy).toContain(`['${glifo}','${texto}']`);
  });

  it('el tema es coherente', () => {
    expect(validarTema(tema01)).toEqual([]);
  });
});
