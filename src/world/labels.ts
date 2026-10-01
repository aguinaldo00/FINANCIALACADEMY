import type { ModeloCiudad } from './cityModel.ts';
import type { Foco } from './focus.ts';

/**
 * Qué se rotula sobre la maqueta. El mundo no es una infografía: la geometría comunica la
 * jerarquía y la ficha contextual da los datos cuando se piden.
 * - Ciudad: solo los barrios, discretos (en lectura de mapa, las zonas).
 * - Barrio: sus zonas.
 * - Zona y edificio: nada permanente; el nombre está en la ficha.
 */
export function etiquetasDelNivel(m: ModeloCiudad, foco: Foco, modoMapa: boolean): Foco[] {
  switch (foco.nivel) {
    case 'ciudad':
      return modoMapa
        ? m.zonas.map((z): Foco => ({ nivel: 'zona', seccionId: z.seccionId }))
        : m.barrios.map((b): Foco => ({ nivel: 'barrio', grupoId: b.grupoId }));
    case 'barrio':
      return m.zonas.filter((z) => z.grupoId === foco.grupoId).map((z): Foco => ({ nivel: 'zona', seccionId: z.seccionId }));
    case 'zona':
    case 'edificio':
      return [];
  }
}
