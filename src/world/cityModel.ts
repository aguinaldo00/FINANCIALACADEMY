import type { TipoTejado, Tema } from '../content/schema.ts';
import { dominioConcepto, dominioSeccion, type NivelDominio, nivelDominio } from '../domain/mastery.ts';
import { seccionesPrioritarias } from '../domain/priority.ts';
import type { Progreso } from '../domain/progress.ts';
import { centroRect, encoger, particionar, pseudoAleatorio, type Punto, type Rect } from './geometry.ts';

/*
 * Modelo visual derivado: traduce contenido + progreso a una ciudad. Es puro (sin Three.js ni DOM)
 * y lo consumen tanto el renderer 3D como el Atlas HTML.
 *
 * Reglas de significado (no mezclar):
 * - Superficie de barrios y zonas = peso real en examen (`Seccion.pesoExamen`).
 * - Estado de cada edificio (solar / en obra / construido) = dominio del concepto.
 * - Altura: solo los 12 edificios emblemáticos de la portada tienen altura propia (dato de
 *   `tema.ciudad`); el resto comparten una altura estándar que no codifica nada.
 */

/** Fase de construcción de un edificio, derivada del nivel de dominio existente. */
export type FaseObra = 'solar' | 'obra' | 'completo';

export function faseObra(nivel: NivelDominio): FaseObra {
  if (nivel === 'sin-estudiar') return 'solar';
  if (nivel === 'dominado') return 'completo';
  return 'obra';
}

export interface BarrioVisual {
  grupoId: string;
  titulo: string;
  indice: number;
  /** Parcela del barrio en el treemap (área ∝ peso). */
  rect: Rect;
  /** Zona edificable del barrio, ya descontadas las avenidas. */
  parcela: Rect;
  pesoExamen: number;
  /** Dominio medio de sus secciones ponderado por peso (misma regla que el dominio global). */
  dominio: number;
  nivel: NivelDominio;
  seccionIds: string[];
}

export interface ZonaVisual {
  seccionId: string;
  grupoId: string;
  titulo: string;
  /** Lote del treemap (área ∝ peso dentro del barrio). */
  lote: Rect;
  /** Plataforma de la zona, sin las calles. */
  parcela: Rect;
  /** Espacio donde se colocan los edificios. */
  interior: Rect;
  pesoExamen: number;
  dominio: number;
  nivel: NivelDominio;
  /** Puesto en "Estudia ya" (1, 2, 3) o null si no está entre las prioritarias. */
  prioridad: number | null;
  /** Posición (1…n) en el orden completo de prioridad de estudio. */
  ordenEstudio: number;
  conceptoIds: string[];
  estudiados: number;
  dominados: number;
}

export interface EdificioVisual {
  conceptoId: string;
  seccionId: string;
  grupoId: string;
  nombre: string;
  color: string;
  posicion: Punto;
  huella: number;
  /** Altura cuando está construido del todo. */
  alturaCompleta: number;
  tejado: TipoTejado;
  /** Uno de los edificios de la portada original. */
  emblematico: boolean;
  dominio: number;
  nivel: NivelDominio;
  fase: FaseObra;
}

export interface ArbolVisual {
  posicion: Punto;
  escala: number;
}

export interface ModeloCiudad {
  lado: number;
  barrios: BarrioVisual[];
  zonas: ZonaVisual[];
  edificios: EdificioVisual[];
  arboles: ArbolVisual[];
}

export const LADO_CIUDAD = 120;
export const AVENIDA = 5;
export const CALLE = 2.6;
const ACERA = 1.3;
export const ALTURA_ESTANDAR = 6;
/** La portada muestra 3 secciones en "Estudia ya" (valor por defecto de `seccionesPrioritarias`). */
export const PUESTOS_ESTUDIA_YA = 3;
/** Las alturas de la portada están en píxeles del SVG (50–80). */
const PIXELES_POR_UNIDAD = 6;

export function modeloCiudad(tema: Tema, progreso: Progreso): ModeloCiudad {
  const lado = LADO_CIUDAD;
  // Mismo criterio que "Estudia ya" de la portada, aplicado a todas las secciones.
  const ordenEstudio = seccionesPrioritarias(tema, progreso, tema.secciones.length).map((s) => s.id);
  const emblematicos = new Map(tema.ciudad.edificios.map((e) => [e.conceptoId, e]));

  const pesoGrupo = (grupoId: string) =>
    tema.secciones.filter((s) => s.grupoId === grupoId).reduce((suma, s) => suma + s.pesoExamen, 0);
  const rectsBarrio = particionar(
    tema.grupos.map((g) => ({ id: g.id, peso: pesoGrupo(g.id) })),
    { x: -lado / 2, z: -lado / 2, ancho: lado, fondo: lado },
  );

  const barrios: BarrioVisual[] = [];
  const zonas: ZonaVisual[] = [];
  const edificios: EdificioVisual[] = [];
  const arboles: ArbolVisual[] = [];

  tema.grupos.forEach((g, indice) => {
    const rect = rectsBarrio.get(g.id)!;
    const parcela = encoger(rect, AVENIDA / 2);
    const secciones = tema.secciones.filter((s) => s.grupoId === g.id);
    const pesoExamen = pesoGrupo(g.id);
    const dominio = pesoExamen > 0
      ? secciones.reduce((suma, s) => suma + dominioSeccion(tema, progreso, s.id) * s.pesoExamen, 0) / pesoExamen
      : 0;
    barrios.push({
      grupoId: g.id,
      titulo: g.titulo,
      indice,
      rect,
      parcela,
      pesoExamen,
      dominio,
      nivel: nivelDominio(dominio),
      seccionIds: secciones.map((s) => s.id),
    });

    const lotes = particionar(secciones.map((s) => ({ id: s.id, peso: s.pesoExamen })), parcela);
    for (const s of secciones) {
      const lote = lotes.get(s.id)!;
      const parcelaZona = encoger(lote, CALLE / 2);
      const interior = encoger(parcelaZona, ACERA);
      const conceptos = tema.conceptos.filter((c) => c.seccionId === s.id);
      const dominioZona = dominioSeccion(tema, progreso, s.id);
      const posiciones = repartirEdificios(interior, conceptos.length);

      conceptos.forEach((c, k) => {
        const d = dominioConcepto(progreso, c.id);
        const nivel = nivelDominio(d);
        const emblema = emblematicos.get(c.id);
        const { posicion, huella } = posiciones[k]!;
        edificios.push({
          conceptoId: c.id,
          seccionId: s.id,
          grupoId: g.id,
          nombre: c.nombre,
          color: c.color,
          posicion,
          huella,
          alturaCompleta: emblema ? emblema.altura / PIXELES_POR_UNIDAD : ALTURA_ESTANDAR,
          tejado: emblema ? emblema.tejado : 'plano',
          emblematico: Boolean(emblema),
          dominio: d,
          nivel,
          fase: faseObra(nivel),
        });
      });

      arboles.push(...plantarArboles(interior, posiciones, zonas.length));

      const orden = ordenEstudio.indexOf(s.id) + 1;
      zonas.push({
        seccionId: s.id,
        grupoId: g.id,
        titulo: s.titulo,
        lote,
        parcela: parcelaZona,
        interior,
        pesoExamen: s.pesoExamen,
        dominio: dominioZona,
        nivel: nivelDominio(dominioZona),
        prioridad: orden > 0 && orden <= PUESTOS_ESTUDIA_YA ? orden : null,
        ordenEstudio: orden,
        conceptoIds: conceptos.map((c) => c.id),
        estudiados: conceptos.filter((c) => dominioConcepto(progreso, c.id) > 0).length,
        dominados: conceptos.filter((c) => nivelDominio(dominioConcepto(progreso, c.id)) === 'dominado').length,
      });
    }
  });

  return { lado, barrios, zonas, edificios, arboles };
}

interface Hueco {
  posicion: Punto;
  huella: number;
}

/** Cuadrícula que se adapta a la forma de la zona; un edificio por concepto, en orden. */
export function repartirEdificios(interior: Rect, cantidad: number): Hueco[] {
  if (cantidad <= 0) return [];
  const proporcion = interior.ancho / Math.max(interior.fondo, 0.001);
  const columnas = Math.min(cantidad, Math.max(1, Math.round(Math.sqrt(cantidad * proporcion))));
  const filas = Math.ceil(cantidad / columnas);
  const celdaX = interior.ancho / columnas;
  const celdaZ = interior.fondo / filas;
  const huella = Math.min(6.5, Math.max(2.4, Math.min(celdaX, celdaZ) * 0.58));

  const huecos: Hueco[] = [];
  for (let i = 0; i < cantidad; i++) {
    const fila = Math.floor(i / columnas);
    // La última fila, si queda incompleta, se centra.
    const enFila = fila === filas - 1 ? cantidad - fila * columnas : columnas;
    const columna = i % columnas;
    const desplazamiento = ((columnas - enFila) * celdaX) / 2;
    huecos.push({
      posicion: { x: interior.x + desplazamiento + celdaX * (columna + 0.5), z: interior.z + celdaZ * (fila + 0.5) },
      huella,
    });
  }
  return huecos;
}

/** Arbolado determinista en los huecos libres de la zona. */
function plantarArboles(interior: Rect, edificios: Hueco[], semilla: number): ArbolVisual[] {
  const arboles: ArbolVisual[] = [];
  const paso = 2.4;
  for (let x = interior.x + paso / 2, i = 0; x < interior.x + interior.ancho; x += paso, i++) {
    for (let z = interior.z + paso / 2, j = 0; z < interior.z + interior.fondo; z += paso, j++) {
      if (pseudoAleatorio(semilla * 97 + i, j) > 0.26) continue;
      const libre = edificios.every(
        (e) => Math.max(Math.abs(e.posicion.x - x), Math.abs(e.posicion.z - z)) > e.huella / 2 + 1.4,
      );
      if (!libre) continue;
      const jx = (pseudoAleatorio(i, j + semilla) - 0.5) * 0.8;
      const jz = (pseudoAleatorio(j, i + semilla) - 0.5) * 0.8;
      arboles.push({ posicion: { x: x + jx, z: z + jz }, escala: 0.75 + pseudoAleatorio(i + semilla, j * 3) * 0.5 });
    }
  }
  return arboles;
}

export const centroZona = (z: ZonaVisual): Punto => centroRect(z.parcela);
