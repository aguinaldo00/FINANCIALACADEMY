import { type NivelDominio, nivelDominio } from '../domain/mastery.ts';

const COLOR_NIVEL: Record<NivelDominio, string> = {
  dominado: '#4ade80',
  regular: '#ffd23f',
  flojo: '#ff5a5a',
  'sin-estudiar': '#3a3a3a',
};

/** Color "de calor" del dominio: verde, amarillo, rojo o apagado. */
export const colorDominio = (valor: number): string => COLOR_NIVEL[nivelDominio(valor)];

export const porcentaje = (valor: number): string => `${Math.round(valor * 100)} %`;

const AVISO_DATO = '⚠ dato del libro, puede haber cambiado';

/** Resalta el aviso de datos que pueden estar desactualizados (primera aparición, como el prototipo). */
export const resaltarAviso = (texto: string): string => texto.replace(AVISO_DATO, `<span class="warn">${AVISO_DATO}</span>`);
