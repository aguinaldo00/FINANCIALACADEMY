import type { Escena } from '../../motion/reproductor.ts';
import { escenaDosCaminos } from './caminos.ts';
import { escenaFuncionesSistema } from './funciones.ts';
import { escenaSistemaFinanciero } from './sistema.ts';
import { escenaSupervision } from './supervision.ts';

/**
 * Escenas del Tema 1 (capítulo I, ambiente «noche»): una idea por escena, en el orden en que se
 * estudian. Sustituyen al vídeo de cajas y nodos.
 */
export const LISTA_ESCENAS_TEMA1: readonly Escena[] = [escenaSistemaFinanciero, escenaFuncionesSistema, escenaDosCaminos, escenaSupervision];

export const ESCENAS_TEMA1: Readonly<Record<string, Escena>> = Object.fromEntries(LISTA_ESCENAS_TEMA1.map((e) => [e.id, e]));
