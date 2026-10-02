import type { Tema } from '../content/schema.ts';
import {
  calificarTarjeta,
  fechaDe,
  type Practica,
  registrarAcierto,
  registrarFallo,
  registrarSimulacro,
  tarjetasPendientes,
} from '../domain/practice.ts';
import { cargarPractica, guardarPractica } from '../persistence/practiceRepository.ts';
import type { AlmacenClaveValor } from '../persistence/storage.ts';
import { tarjetasDe } from '../ui/components/conceptPanels.ts';

/**
 * Estado de la práctica del tema (repaso de fallos, flashcards espaciadas y simulacros), junto al
 * de estudio. Cada cambio se guarda y avisa a quien escuche (p. ej. la insignia del índice).
 */
export class EstadoPractica {
  private actual: Practica;
  private readonly oyentes = new Set<() => void>();

  constructor(
    readonly tema: Tema,
    private readonly almacen: AlmacenClaveValor | null,
    private readonly hoy: () => string = () => fechaDe(new Date()),
  ) {
    this.actual = cargarPractica(almacen, tema.meta.numero);
  }

  get practica(): Practica {
    return this.actual;
  }

  get fecha(): string {
    return this.hoy();
  }

  escuchar(fn: () => void): () => void {
    this.oyentes.add(fn);
    return () => this.oyentes.delete(fn);
  }

  /** Resultado de responder una pregunta de cualquier sitio: alimenta el repaso. */
  responder(idPregunta: string, correcta: boolean): void {
    this.cambiar(correcta ? registrarAcierto(this.actual, idPregunta) : registrarFallo(this.actual, idPregunta, this.hoy()));
  }

  calificar(idTarjeta: string, sabia: boolean): void {
    this.cambiar(calificarTarjeta(this.actual, idTarjeta, sabia, this.hoy()));
  }

  simulacro(aciertos: number, total: number): void {
    this.cambiar(registrarSimulacro(this.actual, { fecha: this.hoy(), aciertos, total }));
  }

  /** Ids de todas las tarjetas del tema, en el orden de los conceptos. */
  idsTarjetas(): string[] {
    return this.tema.conceptos.flatMap((c) => tarjetasDe(c, this.tema).map((t) => t.id));
  }

  tarjetasDeHoy(): string[] {
    return tarjetasPendientes(this.idsTarjetas(), this.actual, this.hoy());
  }

  /** Lo pendiente de repasar hoy: preguntas falladas + tarjetas que tocan. */
  pendientes(): number {
    return Object.keys(this.actual.fallos).length + this.tarjetasDeHoy().length;
  }

  private cambiar(nueva: Practica): void {
    if (nueva === this.actual) return;
    this.actual = nueva;
    guardarPractica(this.almacen, this.tema.meta.numero, nueva);
    for (const fn of this.oyentes) fn();
  }
}
