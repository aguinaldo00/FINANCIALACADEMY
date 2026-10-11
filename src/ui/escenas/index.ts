import type { Escena } from '../motion/reproductor.ts';
import { escenaCapitalInicialCompuesta, escenaInteresesCompuesta, escenaTiempoCompuesta, escenaTipoCompuesta } from './compuestaDespejes.ts';
import { escenaMontanteCompuesta } from './compuestaMontante.ts';
import { escenaComparacion, escenaEquivalentes, escenaTae } from './compuestaTasas.ts';
import {
  escenaDescuentoComercial,
  escenaDescuentoCompuestoComercial,
  escenaDescuentoCompuestoRacional,
  escenaDescuentoRacional,
  escenaRemesa,
} from './descuento.ts';
import { escenaCapitalInicialSimple } from './simpleCapitalInicial.ts';
import { escenaFraccionadoSimple } from './simpleFraccionado.ts';
import { escenaInteresesSimple } from './simpleIntereses.ts';
import { escenaMontanteSimple } from './simpleMontante.ts';
import { escenaTiempoSimple } from './simpleTiempo.ts';
import { escenaTipoSimple } from './simpleTipo.ts';

/** Todas las escenas del Tema 2, por id. Cada fórmula del índice apunta a una de ellas. */
export const LISTA_ESCENAS: readonly Escena[] = [
  escenaInteresesSimple,
  escenaMontanteSimple,
  escenaCapitalInicialSimple,
  escenaTipoSimple,
  escenaTiempoSimple,
  escenaFraccionadoSimple,
  escenaMontanteCompuesta,
  escenaInteresesCompuesta,
  escenaCapitalInicialCompuesta,
  escenaTiempoCompuesta,
  escenaTipoCompuesta,
  escenaEquivalentes,
  escenaComparacion,
  escenaTae,
  escenaDescuentoComercial,
  escenaDescuentoRacional,
  escenaRemesa,
  escenaDescuentoCompuestoRacional,
  escenaDescuentoCompuestoComercial,
];

export const ESCENAS: Readonly<Record<string, Escena>> = Object.fromEntries(LISTA_ESCENAS.map((e) => [e.id, e]));
