import type { Tema } from '../schema.ts';
import { tema01 } from './tema-01/index.ts';
import { tema02 } from './tema-02/index.ts';

export interface TemaCatalogo {
  numero: number;
  titulo: string;
  descripcion: string;
  href: string;
}

/** Entradas de primer nivel. Cada tema conserva sus propias rutas y su propia presentación. */
export const TEMAS: TemaCatalogo[] = [
  {
    numero: tema01.meta.numero,
    titulo: tema01.meta.titulo,
    descripcion: 'El sistema financiero español, representado mediante La Ciudad del Dinero.',
    href: '#inicio',
  },
  {
    numero: tema02.numero,
    titulo: tema02.titulo,
    descripcion: 'Matemática financiera. Primera lección: capitalización compuesta.',
    href: '#tema/2',
  },
];

export const temaActivo: Tema = tema01;
