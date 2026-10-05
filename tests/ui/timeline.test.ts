import { describe, expect, it } from 'vitest';
import { tema01 } from '../../src/content/temas/tema-01/index.ts';
import { progresoVacio } from '../../src/domain/progress.ts';
import { lineaTemporal, repartir } from '../../src/ui/components/timeline.ts';

describe('"El tema, de principio a fin" (gráfico circular)', () => {
  const grupos = tema01.grupos.map((g) => ({ id: g.id, peso: tema01.secciones.filter((s) => s.grupoId === g.id).reduce((s, x) => s + x.pesoExamen, 0) }));
  const arcosGrupo = repartir(grupos);
  const arcosSeccion = repartir(tema01.secciones.map((s) => ({ id: s.id, peso: s.pesoExamen })));

  it('los ángulos de cada anillo suman 360° sin huecos', () => {
    for (const arcos of [arcosGrupo, arcosSeccion]) {
      expect(arcos[0]!.desde).toBe(0);
      expect(arcos.at(-1)!.hasta).toBeCloseTo(360, 6);
      for (let i = 1; i < arcos.length; i++) expect(arcos[i]!.desde).toBeCloseTo(arcos[i - 1]!.hasta, 6);
    }
  });

  it('cada subpunto cae dentro del arco de su apartado', () => {
    for (const s of tema01.secciones) {
      const a = arcosSeccion.find((x) => x.id === s.id)!;
      const g = arcosGrupo.find((x) => x.id === s.grupoId)!;
      expect(a.desde).toBeGreaterThanOrEqual(g.desde - 1e-6);
      expect(a.hasta).toBeLessThanOrEqual(g.hasta + 1e-6);
    }
  });

  it('una porción y una fila de leyenda por subpunto; una sola recomendación', () => {
    const html = lineaTemporal(tema01, progresoVacio());
    const n = tema01.secciones.length;
    expect(html.match(/class="tl-seg/g)).toHaveLength(n);
    expect(html.match(/class="tl-parada[ "]/g)).toHaveLength(n);
    expect(html.match(/class="tl-grupo"/g)).toHaveLength(tema01.grupos.length);
    expect(html.match(/tl-seg siguiente/g)).toHaveLength(1);
    expect(html.match(/tl-parada siguiente/g)).toHaveLength(1);
  });
});
