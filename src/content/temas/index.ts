import type { Tema } from '../schema.ts';
import { tema01 } from './tema-01/index.ts';

export const TEMAS: Tema[] = [tema01];

export const temaActivo: Tema = tema01;
