import type { Tema } from '../content/schema.ts';

export type Ruta =
  | { vista: 'inicio'; scrollArriba: boolean }
  | { vista: 'examen'; scrollArriba: boolean }
  | { vista: 'seccion'; seccionId: string; conceptoFoco: string | null; scrollArriba: boolean };

/**
 * Rutas del prototipo: `#inicio`, `#s/<sección>`, `#c/<concepto>`; y `#examen` (predicción de
 * examen), solo si el tema tiene ampliación con bloques.
 * Un id desconocido lleva al inicio. Con `#c/…` no se vuelve arriba porque se hace scroll al concepto.
 */
export function resolverRuta(hash: string, tema: Tema): Ruta {
  const h = (hash || '#inicio').slice(1);
  const scrollArriba = !h.startsWith('c/');

  if (h === 'examen' && tema.ampliacion?.bloques.length) return { vista: 'examen', scrollArriba };
  if (h.startsWith('s/')) {
    const id = h.slice(2);
    if (tema.secciones.some((s) => s.id === id)) return { vista: 'seccion', seccionId: id, conceptoFoco: null, scrollArriba };
  } else if (h.startsWith('c/')) {
    const concepto = tema.conceptos.find((c) => c.id === h.slice(2));
    if (concepto) return { vista: 'seccion', seccionId: concepto.seccionId, conceptoFoco: concepto.id, scrollArriba };
  }
  return { vista: 'inicio', scrollArriba };
}

export const hrefInicio = () => '#inicio';
export const hrefSeccion = (seccionId: string) => `#s/${seccionId}`;
export const hrefConcepto = (conceptoId: string) => `#c/${conceptoId}`;
export const hrefExamen = () => '#examen';
