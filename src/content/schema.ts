import type { GlyphName } from '../icons/glyphs.ts';

export interface TemaMeta {
  numero: number;
  titulo: string;
  ciudad: string;
  fuente: string;
}

export interface Grupo {
  id: string;
  titulo: string;
}

export interface Seccion {
  id: string;
  grupoId: string;
  titulo: string;
  /** Peso estimado en examen, en puntos porcentuales. */
  pesoExamen: number;
  descripcion: string;
}

/** Cada modo corresponde, por posición, a una entrada de `Concepto.explicaciones`. */
export interface ModoExplicacion {
  etiqueta: string;
  formato: 'texto' | 'esquema';
}

export interface Pregunta {
  enunciado: string;
  opciones: string[];
  indiceCorrecta: number;
  explicacion: string;
}

export interface Concepto {
  id: string;
  seccionId: string;
  nombre: string;
  /** El primero es el glifo principal; los siguientes, insignias (máximo 2 se dibujan). */
  iconos: [GlyphName, ...GlyphName[]];
  color: string;
  /** HTML de confianza (puede contener <b>). */
  definicion: string;
  ejemploReal: string;
  explicaciones: string[];
  trampaExamen: string;
  pregunta: Pregunta;
}

export type TipoTejado = 'fronton' | 'bandera' | 'ruina' | 'granero' | 'cupula' | 'antena' | 'plano';

export interface EdificioCiudad {
  conceptoId: string;
  altura: number;
  tejado: TipoTejado;
}

export interface Tema {
  meta: TemaMeta;
  grupos: Grupo[];
  secciones: Seccion[];
  modos: ModoExplicacion[];
  conceptos: Concepto[];
  ciudad: { edificios: EdificioCiudad[] };
}
