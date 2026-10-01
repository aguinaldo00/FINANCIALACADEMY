import { describe, expect, it } from 'vitest';
import { desdeLegacy, fusionarProgreso, sanearProgreso } from '../../src/persistence/migrations.ts';
import { CLAVE_PROGRESO, cargarProgreso, guardarProgreso } from '../../src/persistence/progressRepository.ts';
import type { AlmacenClaveValor } from '../../src/persistence/storage.ts';

function almacenEnMemoria(inicial: Record<string, string> = {}): AlmacenClaveValor & { datos: Map<string, string> } {
  const datos = new Map(Object.entries(inicial));
  return { datos, getItem: (k) => datos.get(k) ?? null, setItem: (k, v) => void datos.set(k, v) };
}

const LEGACY = JSON.stringify({ dom: { sf: 1, bce: 0.5 }, tries: { mur: 2 } });

describe('migración desde cdd-t1', () => {
  it('convierte el formato legacy', () => {
    expect(desdeLegacy(JSON.parse(LEGACY))).toEqual({ dominio: { sf: 1, bce: 0.5 }, intentos: { mur: 2 } });
  });

  it('descarta valores corruptos', () => {
    expect(desdeLegacy({ dom: { a: 2, b: 'x', c: 0.5, d: -1 }, tries: { e: 1.5, f: 3 } })).toEqual({
      dominio: { c: 0.5 },
      intentos: { f: 3 },
    });
    expect(desdeLegacy(null)).toBeNull();
    expect(desdeLegacy([1, 2])).toBeNull();
    expect(sanearProgreso('basura')).toEqual({ dominio: {}, intentos: {} });
  });

  it('la fusión conserva el máximo dominio y es idempotente', () => {
    const actual = { dominio: { sf: 0.5, cajas: 1 }, intentos: { mur: 0 } };
    const legacy = { dominio: { sf: 1, bce: 0.5 }, intentos: { mur: 2, ico: 1 } };
    const una = fusionarProgreso(actual, legacy);
    expect(una).toEqual({ dominio: { sf: 1, cajas: 1, bce: 0.5 }, intentos: { mur: 0, ico: 1 } });
    expect(fusionarProgreso(una, legacy)).toEqual(una);
  });
});

describe('repositorio de progreso', () => {
  it('carga el progreso legacy cuando no hay progreso nuevo', () => {
    const almacen = almacenEnMemoria({ 'cdd-t1': LEGACY });
    expect(cargarProgreso(almacen, 1)).toEqual({ dominio: { sf: 1, bce: 0.5 }, intentos: { mur: 2 } });
  });

  it('no borra ni modifica la clave legacy', () => {
    const almacen = almacenEnMemoria({ 'cdd-t1': LEGACY });
    guardarProgreso(almacen, 1, cargarProgreso(almacen, 1));
    expect(almacen.datos.get('cdd-t1')).toBe(LEGACY);
  });

  it('guarda en formato versionado y lo recupera', () => {
    const almacen = almacenEnMemoria();
    guardarProgreso(almacen, 1, { dominio: { sf: 1 }, intentos: {} });
    expect(JSON.parse(almacen.datos.get(CLAVE_PROGRESO)!)).toEqual({ version: 2, temas: { 1: { dominio: { sf: 1 }, intentos: {} } } });
    expect(cargarProgreso(almacen, 1)).toEqual({ dominio: { sf: 1 }, intentos: {} });
  });

  it('incorpora una clave legacy añadida después (importación manual)', () => {
    const almacen = almacenEnMemoria();
    guardarProgreso(almacen, 1, { dominio: { cajas: 1 }, intentos: {} });
    almacen.setItem('cdd-t1', LEGACY);
    expect(cargarProgreso(almacen, 1).dominio).toEqual({ cajas: 1, sf: 1, bce: 0.5 });
  });

  it('separa el progreso por tema', () => {
    const almacen = almacenEnMemoria();
    guardarProgreso(almacen, 1, { dominio: { sf: 1 }, intentos: {} });
    guardarProgreso(almacen, 2, { dominio: { x: 0.5 }, intentos: {} });
    expect(cargarProgreso(almacen, 1).dominio).toEqual({ sf: 1 });
    expect(cargarProgreso(almacen, 2).dominio).toEqual({ x: 0.5 });
  });

  it('tolera JSON roto, almacén ausente y almacén que lanza', () => {
    expect(cargarProgreso(almacenEnMemoria({ [CLAVE_PROGRESO]: '{roto', 'cdd-t1': 'tampoco' }), 1)).toEqual({ dominio: {}, intentos: {} });
    expect(cargarProgreso(null, 1)).toEqual({ dominio: {}, intentos: {} });
    const roto: AlmacenClaveValor = { getItem: () => { throw new Error('bloqueado'); }, setItem: () => { throw new Error('lleno'); } };
    expect(cargarProgreso(roto, 1)).toEqual({ dominio: {}, intentos: {} });
    expect(() => guardarProgreso(roto, 1, { dominio: {}, intentos: {} })).not.toThrow();
  });
});
