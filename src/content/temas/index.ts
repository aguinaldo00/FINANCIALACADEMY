import type { Tema } from '../schema.ts';
import { tema01 } from './tema-01/index.ts';
import { tema02 } from './tema-02/index.ts';

/**
 * Cómo se estudia el tema. Cada tema conserva su propia vista y sus rutas; esto solo lo declara
 * (etiqueta e icono en el selector y en la página de la asignatura). No impone un renderer común.
 */
export type ExperienciaTema = 'ciudad-3d' | 'leccion';

export interface TemaCatalogo {
  numero: number;
  titulo: string;
  descripcion: string;
  href: string;
  experiencia: ExperienciaTema;
}

/** Entradas de primer nivel. Cada tema conserva sus propias rutas y su propia presentación. */
export const TEMAS: TemaCatalogo[] = [
  {
    numero: tema01.meta.numero,
    titulo: tema01.meta.titulo,
    descripcion: 'El sistema financiero español, representado mediante La Ciudad del Dinero.',
    href: '#inicio',
    experiencia: 'ciudad-3d',
  },
  {
    numero: tema02.numero,
    titulo: tema02.titulo,
    descripcion: 'Capitalización compuesta: los símbolos, un ejemplo paso a paso, errores típicos y práctica en papel.',
    href: '#tema/2',
    experiencia: 'leccion',
  },
];

export const temaActivo: Tema = tema01;
