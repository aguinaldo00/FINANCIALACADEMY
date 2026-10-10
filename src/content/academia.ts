import type { IconoUi } from '../icons/ui.ts';
import { TEMAS, type TemaCatalogo } from './temas/index.ts';

/*
 * Financial Academy: las asignaturas del ciclo de Administración y Finanzas (selector de mundos).
 * Una asignatura es solo su identidad (nombre, icono, color) y su lista de temas registrados.
 * Su disponibilidad no se declara: se deriva de que tenga temas. Añadir una asignatura o un tema es
 * añadir una entrada aquí (o en el catálogo de temas); la navegación no cambia.
 */

export interface Asignatura {
  /** Segmento de la ruta `#a/<id>`. */
  id: string;
  nombre: string;
  icono: IconoUi;
  /**
   * Color de identidad (paleta categórica validada sobre fondo oscuro: cada par de mundos vecinos
   * en el selector, en escritorio y en móvil, se distingue también con daltonismo). Nunca va solo:
   * siempre acompaña al nombre y al icono.
   */
  color: string;
  temas: readonly TemaCatalogo[];
}

/** En el orden del ciclo. Solo Gestión Financiera tiene temas en el proyecto. */
export const ASIGNATURAS: readonly Asignatura[] = [
  { id: 'contabilidad', nombre: 'Contabilidad', icono: 'contabilidad', color: '#199e70', temas: [] },
  { id: 'gestion-logistica', nombre: 'Gestión Logística', icono: 'logistica', color: '#3987e5', temas: [] },
  { id: 'gestion-financiera', nombre: 'Gestión Financiera', icono: 'financiera', color: '#c98500', temas: TEMAS },
  { id: 'recursos-humanos', nombre: 'Recursos Humanos', icono: 'rrhh', color: '#9085e9', temas: [] },
  { id: 'ipe', nombre: 'IPE', icono: 'ipe', color: '#008300', temas: [] },
  { id: 'simulacion-empresarial', nombre: 'Simulación Empresarial', icono: 'simulacion', color: '#d55181', temas: [] },
];

/** Asignatura de Gestión Financiera: la de todos los temas actuales. */
export const ID_GESTION_FINANCIERA = 'gestion-financiera';

export const disponible = (a: Asignatura): boolean => a.temas.length > 0;

export const buscarAsignatura = (id: string): Asignatura | undefined => ASIGNATURAS.find((a) => a.id === id);

/** Etiqueta de cada experiencia de tema (cómo se estudia). */
export const NOMBRE_EXPERIENCIA: Readonly<Record<TemaCatalogo['experiencia'], string>> = {
  'ciudad-3d': 'Exploración 3D',
  leccion: 'Lección paso a paso',
};
