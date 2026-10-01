import type { ModeloCiudad } from './cityModel.ts';
import type { Foco } from './focus.ts';

/**
 * Qué se rotula sobre la maqueta en cada nivel. Pocas etiquetas y jerarquizadas: la ciudad debe
 * verse, y el Atlas HTML ya lo lista todo.
 * - Ciudad: los barrios y los hitos "Estudia ya". En lectura de mapa (Atlas), todas las zonas.
 * - Barrio: sus zonas.
 * - Zona: nada fijo (el nombre del edificio aparece al pasar por encima).
 * - Edificio: solo él.
 */
export function etiquetasDelNivel(m: ModeloCiudad, foco: Foco, modoMapa: boolean): Foco[] {
  const zona = (seccionId: string): Foco => ({ nivel: 'zona', seccionId });
  switch (foco.nivel) {
    case 'ciudad':
      return modoMapa
        ? m.zonas.map((z) => zona(z.seccionId))
        : [
            ...m.barrios.map((b): Foco => ({ nivel: 'barrio', grupoId: b.grupoId })),
            ...m.zonas.filter((z) => z.prioridad !== null).map((z) => zona(z.seccionId)),
          ];
    case 'barrio':
      return m.zonas.filter((z) => z.grupoId === foco.grupoId).map((z) => zona(z.seccionId));
    case 'zona':
      return modoMapa ? m.edificios.filter((e) => e.seccionId === foco.seccionId).map((e): Foco => ({ nivel: 'edificio', conceptoId: e.conceptoId })) : [];
    case 'edificio':
      return [foco];
  }
}
