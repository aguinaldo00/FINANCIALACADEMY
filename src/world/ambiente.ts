/*
 * Ambiente de la maqueta (día, atardecer o noche): la parte pura, sin Three.js, para que la
 * interfaz pueda usarla sin descargar el motor 3D. Los preajustes de luz están en
 * scene/three/ambiente.ts.
 */

export type Ambiente = 'dia' | 'atardecer' | 'noche';
export type PreferenciaAmbiente = Ambiente | 'auto';

export const AMBIENTES_ORDEN: readonly Ambiente[] = ['dia', 'atardecer', 'noche'];

export const NOMBRE_AMBIENTE: Record<Ambiente, string> = { dia: 'Día', atardecer: 'Atardecer', noche: 'Noche' };
export const ICONO_AMBIENTE: Record<Ambiente, string> = { dia: '☀️', atardecer: '🌇', noche: '🌙' };

/** Ambiente según la hora local: día de 7 a 19, atardecer de 19 a 21, noche el resto. */
export function ambienteDeHora(hora: number): Ambiente {
  if (hora >= 7 && hora < 19) return 'dia';
  if (hora >= 19 && hora < 21) return 'atardecer';
  return 'noche';
}

export function resolverAmbiente(pref: PreferenciaAmbiente, ahora: Date = new Date()): Ambiente {
  return pref === 'auto' ? ambienteDeHora(ahora.getHours()) : pref;
}

/** Siguiente en el ciclo del botón: día → atardecer → noche → día. */
export function siguienteAmbiente(a: Ambiente): Ambiente {
  return AMBIENTES_ORDEN[(AMBIENTES_ORDEN.indexOf(a) + 1) % AMBIENTES_ORDEN.length]!;
}

export function sanearPreferencia(valor: unknown): PreferenciaAmbiente {
  return valor === 'dia' || valor === 'atardecer' || valor === 'noche' ? valor : 'auto';
}
