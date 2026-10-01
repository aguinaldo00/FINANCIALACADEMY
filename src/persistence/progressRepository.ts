import type { Progreso } from '../domain/progress.ts';
import { claveLegacy, desdeLegacy, fusionarProgreso, sanearProgreso } from './migrations.ts';
import { type AlmacenClaveValor, escribirJson, leerJson } from './storage.ts';

export const CLAVE_PROGRESO = 'financial-academy:progreso';
export const VERSION_PROGRESO = 2;

interface DocumentoProgreso {
  version: typeof VERSION_PROGRESO;
  temas: Record<string, Progreso>;
}

function leerDocumento(almacen: AlmacenClaveValor | null): DocumentoProgreso {
  const crudo = leerJson(almacen, CLAVE_PROGRESO) as Partial<DocumentoProgreso> | undefined;
  const temas: Record<string, Progreso> = {};
  if (crudo && crudo.version === VERSION_PROGRESO && crudo.temas && typeof crudo.temas === 'object') {
    for (const [numero, progreso] of Object.entries(crudo.temas)) temas[numero] = sanearProgreso(progreso);
  }
  return { version: VERSION_PROGRESO, temas };
}

/**
 * Carga el progreso del tema e incorpora el del prototipo (`cdd-t<n>`) si existe en este origen.
 * La clave legacy no se borra.
 */
export function cargarProgreso(almacen: AlmacenClaveValor | null, numeroTema: number): Progreso {
  const actual = leerDocumento(almacen).temas[numeroTema] ?? sanearProgreso(undefined);
  const legacy = desdeLegacy(leerJson(almacen, claveLegacy(numeroTema)));
  return legacy ? fusionarProgreso(actual, legacy) : actual;
}

export function guardarProgreso(almacen: AlmacenClaveValor | null, numeroTema: number, progreso: Progreso): void {
  const documento = leerDocumento(almacen);
  documento.temas[numeroTema] = progreso;
  escribirJson(almacen, CLAVE_PROGRESO, documento);
}
