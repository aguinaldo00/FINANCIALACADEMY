import { Box3 } from 'three';
import { describe, expect, it } from 'vitest';
import { tema01 } from '../../src/content/temas/tema-01/index.ts';
import { animarAvatar, construirAvatar } from '../../src/scene/three/avatar.ts';
import { modeloCiudad } from '../../src/world/cityModel.ts';
import {
  avanzarPaseo,
  distanciaARect,
  edificioCercano,
  type EstadoPaseo,
  obstaculosDe,
  puntoDeSalida,
  RADIO_PERSONAJE,
  VELOCIDAD_MAXIMA,
} from '../../src/world/paseo.ts';

const m = modeloCiudad(tema01, { dominio: {}, intentos: {} });
const LIMITES = { x: -m.lado / 2, z: -m.lado / 2, ancho: m.lado, fondo: m.lado };
const obstaculos = obstaculosDe(m);
const quieto = (x: number, z: number): EstadoPaseo => ({ posicion: { x, z }, rumbo: 0, velocidad: 0 });

/** Simula `segundos` con la tecla pulsada, con la cámara mirando al norte (theta = 0). */
function caminar(estado: EstadoPaseo, entrada: { x: number; y: number }, segundos: number, obs = obstaculos): EstadoPaseo {
  let e = estado;
  for (let t = 0; t < segundos; t += 1 / 60) e = avanzarPaseo(e, entrada, 0, 1 / 60, obs, LIMITES);
  return e;
}

describe('paseo con el personaje', () => {
  it('aparece en un espacio libre, fuera de cualquier edificio', () => {
    const p = puntoDeSalida(m);
    for (const o of obstaculos) expect(distanciaARect(p, o.rect)).toBeGreaterThan(0);
  });

  it('W avanza alejándose de la cámara; D va a la derecha', () => {
    const libre = { x: 0, z: 0 };
    const adelante = caminar(quieto(libre.x, libre.z), { x: 0, y: 1 }, 0.3, []);
    expect(adelante.posicion.z).toBeLessThan(0);
    const derecha = caminar(quieto(0, 0), { x: 1, y: 0 }, 0.3, []);
    expect(derecha.posicion.x).toBeGreaterThan(0);
  });

  it('acelera hasta un máximo y frena al soltar', () => {
    const lanzado = caminar(quieto(0, 0), { x: 0, y: 1 }, 1, []);
    expect(lanzado.velocidad).toBe(VELOCIDAD_MAXIMA);
    expect(caminar(lanzado, { x: 0, y: 0 }, 1, []).velocidad).toBe(0);
  });

  it('no atraviesa edificios ni sale de la ciudad', () => {
    const muro = { conceptoId: 'x', rect: { x: -5, z: -3, ancho: 10, fondo: 1 } };
    const tras = caminar(quieto(0, 0), { x: 0, y: 1 }, 3, [muro]);
    expect(tras.posicion.z).toBeGreaterThanOrEqual(-2 + RADIO_PERSONAJE - 1e-6);
    const fuera = caminar(quieto(0, 0), { x: 1, y: 0 }, 20, []);
    expect(fuera.posicion.x).toBeLessThanOrEqual(m.lado / 2 - RADIO_PERSONAJE + 1e-6);
  });

  it('se desliza a lo largo de una fachada en diagonal', () => {
    const muro = { conceptoId: 'x', rect: { x: -50, z: -3, ancho: 100, fondo: 1 } };
    const tras = caminar(quieto(0, 0), { x: 1, y: 1 }, 2, [muro]);
    expect(tras.posicion.x).toBeGreaterThan(3);
  });

  it('detecta el edificio cercano para mostrar su ficha', () => {
    const e = m.edificios.find((x) => x.conceptoId === 'bde')!;
    const junto = { x: e.lote.x - 1, z: e.lote.z + e.lote.fondo / 2 };
    expect(edificioCercano(junto, obstaculos)).toBe('bde');
    expect(edificioCercano({ x: 999, z: 999 }, obstaculos)).toBeNull();
  });

  it('el personaje: cuerpo peludo, orejas, cinta con lazo, ojos y patas, a escala de la ciudad', () => {
    const a = construirAvatar();
    const caja = new Box3().setFromObject(a.raiz);
    expect(caja.max.y - caja.min.y).toBeGreaterThan(1.4);
    expect(caja.max.y - caja.min.y).toBeLessThan(2.2);
    expect(a.raiz.getObjectByName('pelaje')).toBeDefined();
    animarAvatar(a, 1, VELOCIDAD_MAXIMA, false);
    expect(a.pataIzquierda.rotation.x).not.toBe(0);
    animarAvatar(a, 1, VELOCIDAD_MAXIMA, true);
    expect(Math.abs(a.pataIzquierda.rotation.x)).toBe(0);
  });
});
