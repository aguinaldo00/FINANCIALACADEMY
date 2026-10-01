import type { Concepto, Tema } from '../content/schema.ts';
import type { Progreso } from '../domain/progress.ts';
import { type ResultadoRespuesta, responderPregunta } from '../domain/quiz.ts';
import { cargarProgreso, guardarProgreso } from '../persistence/progressRepository.ts';
import type { AlmacenClaveValor } from '../persistence/storage.ts';

/** Estado de la sesión: el tema activo y el progreso, con guardado delegado al repositorio. */
export class EstadoEstudio {
  readonly tema: Tema;
  private progresoActual: Progreso;
  private readonly almacen: AlmacenClaveValor | null;

  constructor(tema: Tema, almacen: AlmacenClaveValor | null) {
    this.tema = tema;
    this.almacen = almacen;
    this.progresoActual = cargarProgreso(almacen, tema.meta.numero);
  }

  get progreso(): Progreso {
    return this.progresoActual;
  }

  responder(concepto: Concepto, indiceElegido: number): ResultadoRespuesta {
    const resultado = responderPregunta(this.progresoActual, concepto, indiceElegido);
    this.progresoActual = resultado.progreso;
    if (resultado.debeGuardarse) guardarProgreso(this.almacen, this.tema.meta.numero, this.progresoActual);
    return resultado;
  }
}
