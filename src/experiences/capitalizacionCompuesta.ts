import type { ProyeccionCapitalizacion } from '../domain/capitalizacionCompuesta.ts';

export type EtapaCapitalizacion =
  | { tipo: 'regla'; }
  | { tipo: 'interes-del-periodo'; indicePeriodo: number }
  | { tipo: 'capital-al-cierre'; indicePeriodo: number }
  | { tipo: 'formula-general' }
  | { tipo: 'intereses-totales' };

/**
 * Sigue la construcción que explica el tema: se presenta la regla, se calcula
 * el interés sobre la base vigente, se incorpora y se generaliza el patrón.
 */
export function crearEtapasCapitalizacion(_modelo: ProyeccionCapitalizacion): EtapaCapitalizacion[] {
  const etapas: EtapaCapitalizacion[] = [{ tipo: 'regla' }];
  _modelo.periodos.forEach((_, indicePeriodo) => {
    etapas.push({ tipo: 'interes-del-periodo', indicePeriodo });
    etapas.push({ tipo: 'capital-al-cierre', indicePeriodo });
  });
  etapas.push({ tipo: 'formula-general' }, { tipo: 'intereses-totales' });
  return etapas;
}
