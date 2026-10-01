/** Subconjunto de Storage que usamos; permite inyectar un doble en los tests. */
export interface AlmacenClaveValor {
  getItem(clave: string): string | null;
  setItem(clave: string, valor: string): void;
}

/** localStorage puede no existir o lanzar (modo privado, datos bloqueados). */
export function almacenNavegador(): AlmacenClaveValor | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export function leerJson(almacen: AlmacenClaveValor | null, clave: string): unknown {
  if (!almacen) return undefined;
  try {
    const crudo = almacen.getItem(clave);
    return crudo == null ? undefined : JSON.parse(crudo);
  } catch {
    return undefined;
  }
}

export function escribirJson(almacen: AlmacenClaveValor | null, clave: string, valor: unknown): void {
  if (!almacen) return;
  try {
    almacen.setItem(clave, JSON.stringify(valor));
  } catch {
    /* sin espacio o bloqueado: el progreso sigue en memoria */
  }
}
