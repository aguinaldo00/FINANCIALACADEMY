import {
  calcularCapitalizacionCompuesta,
  formatearEuros,
  formatearPorcentaje,
  formatearTasaDecimal,
} from '../../domain/capitalizacionCompuesta.ts';
import type { ProyeccionCapitalizacion } from '../../domain/capitalizacionCompuesta.ts';
import { crearEtapasCapitalizacion } from '../../experiences/capitalizacionCompuesta.ts';
import type { EtapaCapitalizacion } from '../../experiences/capitalizacionCompuesta.ts';
import {
  ESCENARIO_CAPITALIZACION_COMPUESTA,
  FORMULA_CAPITAL_FINAL,
  FORMULA_INTERESES_TOTALES,
  FORMULA_INTERESES_TOTALES_FACTOR,
} from '../../content/temas/tema-02/index.ts';
import { colorearSimbolos } from './simbolos.ts';

const DURACION_ETAPA_MS = 5_000;
const ANCHO_GRAFICO = 720;
const ALTO_GRAFICO = 330;
const X_INICIAL = 82;
const X_FINAL = 690;
const Y_EJE_TIEMPO = 286;
const Y_INICIAL = 238;
const ALTURA_CAPITAL = 174;

interface PuntoGrafico {
  x: number;
  y: number;
  capitalCentimos: number;
  numeroPeriodo: number;
}

interface LecturaEtapa {
  titulo: string;
  ecuaciones: string[];
  explicacion: string;
  notaTitulo: string;
  nota: string;
}

const SUBINDICES: Record<string, string> = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
  '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
};

const SUPERINDICES: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
};

function subindice(numero: number): string {
  return String(numero).replace(/[0-9]/g, (digito) => SUBINDICES[digito] ?? digito);
}

function superindice(numero: number): string {
  return String(numero).replace(/[0-9]/g, (digito) => SUPERINDICES[digito] ?? digito);
}

function capitalSimbolo(numeroPeriodo: number): string {
  return `C${subindice(numeroPeriodo)}`;
}

function numeroCapitalConocido(etapa: EtapaCapitalizacion, modelo: ProyeccionCapitalizacion): number {
  if (etapa.tipo === 'regla') return 0;
  if (etapa.tipo === 'interes-del-periodo') return etapa.indicePeriodo;
  if (etapa.tipo === 'capital-al-cierre') return etapa.indicePeriodo + 1;
  return modelo.numeroPeriodos;
}

function nombreEtapa(etapa: EtapaCapitalizacion): string {
  if (etapa.tipo === 'regla') return 'La regla';
  if (etapa.tipo === 'interes-del-periodo') return `Año ${etapa.indicePeriodo + 1} · interés`;
  if (etapa.tipo === 'capital-al-cierre') return `Año ${etapa.indicePeriodo + 1} · cierre`;
  if (etapa.tipo === 'formula-general') return 'Fórmula general';
  return 'Intereses totales';
}

function lecturaEtapa(etapa: EtapaCapitalizacion, modelo: ProyeccionCapitalizacion): LecturaEtapa {
  if (etapa.tipo === 'regla') {
    return {
      titulo: 'La base cambia en cada periodo',
      ecuaciones: ['capital vigente → interés → nuevo capital'],
      explicacion: 'En capitalización compuesta, los intereses se incorporan al capital. En los periodos siguientes, la tasa se aplica sobre ese capital actualizado.',
      notaTitulo: 'La diferencia clave',
      nota: 'En la capitalización simple se calcula el interés sobre C₀ en cada periodo. En la compuesta, el interés acumulado también genera intereses.',
    };
  }

  if (etapa.tipo === 'interes-del-periodo') {
    const periodo = modelo.periodos[etapa.indicePeriodo]!;
    const simboloBase = capitalSimbolo(etapa.indicePeriodo);
    return {
      titulo: `Primero se calcula el interés del año ${periodo.numeroPeriodo}`,
      ecuaciones: [
        `${simboloBase} × i = ${formatearEuros(periodo.capitalInicialCentimos)} × ${formatearTasaDecimal(modelo.tasaAnualPuntosBase)} = ${formatearEuros(periodo.interesGeneradoCentimos)}`,
      ],
      explicacion: `El tipo i se aplica al capital que hay al inicio de este periodo: ${formatearEuros(periodo.capitalInicialCentimos)}. Este interés todavía no se ha incorporado al capital.`,
      notaTitulo: `Base del año ${periodo.numeroPeriodo}`,
      nota: `${simboloBase} es el capital vigente al empezar el periodo. ${formatearPorcentaje(modelo.tasaAnualPuntosBase)} anual equivale a i = ${formatearTasaDecimal(modelo.tasaAnualPuntosBase)}.`,
    };
  }

  if (etapa.tipo === 'capital-al-cierre') {
    const periodo = modelo.periodos[etapa.indicePeriodo]!;
    const simboloAnterior = capitalSimbolo(etapa.indicePeriodo);
    const simboloActual = capitalSimbolo(periodo.numeroPeriodo);
    const ecuacionDesarrollada = `${simboloActual} = ${simboloAnterior} + (${simboloAnterior} × i) = ${formatearEuros(periodo.capitalInicialCentimos)} + ${formatearEuros(periodo.interesGeneradoCentimos)} = ${formatearEuros(periodo.capitalFinalCentimos)}`;
    const ecuaciones = [ecuacionDesarrollada];

    if (periodo.numeroPeriodo === 1) {
      ecuaciones.push(`${simboloActual} = C₀ × (1 + i)`);
    } else {
      ecuaciones.push(`${simboloActual} = ${simboloAnterior} × (1 + i) = C₀ × (1 + i)${superindice(periodo.numeroPeriodo)}`);
    }

    return {
      titulo: `El interés se incorpora al cierre del año ${periodo.numeroPeriodo}`,
      ecuaciones,
      explicacion: periodo.numeroPeriodo < modelo.numeroPeriodos
        ? `El nuevo capital, ${formatearEuros(periodo.capitalFinalCentimos)}, pasa a ser la base sobre la que se calculará el interés del año siguiente.`
        : `Al terminar los ${modelo.numeroPeriodos} años, el capital acumulado es ${formatearEuros(periodo.capitalFinalCentimos)}.`,
      notaTitulo: 'Qué acaba de cambiar',
      nota: `${formatearEuros(periodo.interesGeneradoCentimos)} se ha sumado al capital. El siguiente cálculo parte del nuevo ${simboloActual}.`,
    };
  }

  if (etapa.tipo === 'formula-general') {
    const sustitucion = `${formatearEuros(modelo.capitalInicialCentimos)} × (1 + ${formatearTasaDecimal(modelo.tasaAnualPuntosBase)})${superindice(modelo.numeroPeriodos)} = ${formatearEurosSinRedondeo(modelo)} € ≈ ${formatearEuros(modelo.capitalFinalCentimos)}`;
    return {
      titulo: 'El patrón se convierte en una fórmula',
      ecuaciones: [
        `C₁ = C₀ × (1 + i)`,
        `C₂ = C₁ × (1 + i) = C₀ × (1 + i)²`,
        FORMULA_CAPITAL_FINAL,
        sustitucion,
      ],
      explicacion: 'Cada periodo vuelve a multiplicar el capital por (1+i). Después de n periodos, ese factor se ha aplicado n veces.',
      notaTitulo: 'Lectura de la fórmula',
      nota: `C₀ es el capital inicial · i es el tipo por periodo · n es el número de periodos · Cₙ es el capital final o montante.`,
    };
  }

  const interesTotalCentimos = modelo.capitalFinalCentimos - modelo.capitalInicialCentimos;
  return {
    titulo: 'El interés total es la diferencia',
    ecuaciones: [
      `I = Cₙ − C₀ = ${formatearEuros(modelo.capitalFinalCentimos)} − ${formatearEuros(modelo.capitalInicialCentimos)} = ${formatearEuros(interesTotalCentimos)}`,
      FORMULA_INTERESES_TOTALES,
      FORMULA_INTERESES_TOTALES_FACTOR,
    ],
    explicacion: 'I representa los intereses totales de la operación: el capital final menos el capital inicial.',
    notaTitulo: 'Resultado del ejemplo',
    nota: `En ${modelo.numeroPeriodos} años, el capital aumenta en ${formatearEuros(interesTotalCentimos)}. I nombra el total acumulado, no el interés de un año concreto.`,
  };
}

/** Lo que se pide hacer en papel antes de ver el cálculo de la etapa (modo cuaderno). */
function retoEtapa(etapa: EtapaCapitalizacion, modelo: ProyeccionCapitalizacion): string | null {
  if (etapa.tipo === 'regla') return null;
  if (etapa.tipo === 'interes-del-periodo') {
    return `Calcula en tu cuaderno el interés del año ${etapa.indicePeriodo + 1}: ${capitalSimbolo(etapa.indicePeriodo)} × i.`;
  }
  if (etapa.tipo === 'capital-al-cierre') {
    return `¿Cuánto vale ${capitalSimbolo(etapa.indicePeriodo + 1)}? Suma a ${capitalSimbolo(etapa.indicePeriodo)} el interés que acabas de calcular.`;
  }
  if (etapa.tipo === 'formula-general') {
    return `Escribe la fórmula general y sustituye C₀ = ${formatearEuros(modelo.capitalInicialCentimos)}, i = ${formatearTasaDecimal(modelo.tasaAnualPuntosBase)} y n = ${modelo.numeroPeriodos}. ¿Te da lo mismo que el C${subindice(modelo.numeroPeriodos)} que llevas?`;
  }
  return 'Calcula los intereses totales I de toda la operación.';
}

function formatearEurosSinRedondeo(modelo: ProyeccionCapitalizacion): string {
  const capitalInicial = modelo.capitalInicialCentimos / 100;
  const tasa = modelo.tasaAnualPuntosBase / 10_000;
  const exacto = capitalInicial * (1 + tasa) ** modelo.numeroPeriodos;
  return new Intl.NumberFormat('de-DE', { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(exacto);
}

function puntosGrafico(modelo: ProyeccionCapitalizacion): PuntoGrafico[] {
  const diferencia = modelo.capitalFinalCentimos - modelo.capitalInicialCentimos;
  const escala = Math.max(diferencia * 1.12, modelo.capitalInicialCentimos * 0.05, 100);
  const maximoPeriodo = Math.max(1, modelo.numeroPeriodos);
  const capitales = [modelo.capitalInicialCentimos, ...modelo.periodos.map((periodo) => periodo.capitalFinalCentimos)];
  return capitales.map((capitalCentimos, numeroPeriodo) => ({
    x: X_INICIAL + (X_FINAL - X_INICIAL) * numeroPeriodo / maximoPeriodo,
    y: Y_INICIAL - (capitalCentimos - modelo.capitalInicialCentimos) / escala * ALTURA_CAPITAL,
    capitalCentimos,
    numeroPeriodo,
  }));
}

function tramoCurvo(origen: PuntoGrafico, destino: PuntoGrafico): string {
  const distanciaX = destino.x - origen.x;
  const distanciaY = destino.y - origen.y;
  const controlUnoX = origen.x + distanciaX * 0.42;
  const controlDosX = origen.x + distanciaX * 0.72;
  const controlUnoY = origen.y + distanciaY * 0.05;
  const controlDosY = destino.y - distanciaY * 0.08;
  return `M ${origen.x.toFixed(2)} ${origen.y.toFixed(2)} C ${controlUnoX.toFixed(2)} ${controlUnoY.toFixed(2)}, ${controlDosX.toFixed(2)} ${controlDosY.toFixed(2)}, ${destino.x.toFixed(2)} ${destino.y.toFixed(2)}`;
}

function graficoCapital(modelo: ProyeccionCapitalizacion, etapa: EtapaCapitalizacion, ocultarNuevo = false): string {
  const puntos = puntosGrafico(modelo);
  const conocido = numeroCapitalConocido(etapa, modelo);
  const enGeneracion = etapa.tipo === 'interes-del-periodo';
  const indiceActivo = enGeneracion ? etapa.indicePeriodo : etapa.tipo === 'capital-al-cierre' ? etapa.indicePeriodo : -1;
  const xBase = X_INICIAL;
  const yBase = Y_INICIAL;
  const trazos = puntos.slice(1, conocido + 1).map((destino, indice) => {
    const origen = puntos[indice]!;
    const periodoActual = destino.numeroPeriodo === indiceActivo + 1 && etapa.tipo === 'capital-al-cierre';
    return `<path class="mat-tramo${periodoActual ? ' mat-tramo-actual' : ''}" d="${tramoCurvo(origen, destino)}" pathLength="240" aria-hidden="true"></path>`;
  }).join('');

  let interesEnCurso = '';
  if (enGeneracion) {
    const origen = puntos[etapa.indicePeriodo]!;
    const destino = puntos[etapa.indicePeriodo + 1]!;
    const periodo = modelo.periodos[etapa.indicePeriodo]!;
    const puntoMedioY = (origen.y + destino.y) / 2;
    interesEnCurso = `<path class="mat-prevision" d="${tramoCurvo(origen, destino)}" pathLength="240" aria-hidden="true"></path>
      <line class="mat-interes-delta" x1="${destino.x.toFixed(2)}" y1="${origen.y.toFixed(2)}" x2="${destino.x.toFixed(2)}" y2="${destino.y.toFixed(2)}" aria-hidden="true"></line>
      <line class="mat-interes-tope" x1="${(destino.x - 5).toFixed(2)}" y1="${origen.y.toFixed(2)}" x2="${(destino.x + 5).toFixed(2)}" y2="${origen.y.toFixed(2)}" aria-hidden="true"></line>
      <line class="mat-interes-tope" x1="${(destino.x - 5).toFixed(2)}" y1="${destino.y.toFixed(2)}" x2="${(destino.x + 5).toFixed(2)}" y2="${destino.y.toFixed(2)}" aria-hidden="true"></line>
      <circle class="mat-nodo-previsto" cx="${destino.x.toFixed(2)}" cy="${destino.y.toFixed(2)}" r="6" aria-hidden="true"></circle>
      <text class="mat-etiqueta-delta" x="${(destino.x - 10).toFixed(2)}" y="${puntoMedioY.toFixed(2)}" text-anchor="end">+${ocultarNuevo ? '?' : formatearEuros(periodo.interesGeneradoCentimos)}</text>`;
  }

  const nodos = puntos.slice(0, conocido + 1).map((punto, indice) => {
    const ancla = indice === puntos.length - 1 ? 'end' : 'start';
    const textoX = indice === puntos.length - 1 ? punto.x - 9 : punto.x + 9;
    const textoY = indice === 0 ? punto.y + 23 : punto.y - 12;
    const simbolo = capitalSimbolo(indice);
    const oculto = ocultarNuevo && etapa.tipo === 'capital-al-cierre' && indice === conocido;
    return `<g class="mat-punto${indice === conocido && etapa.tipo === 'capital-al-cierre' ? ' mat-punto-actual' : ''}">
      <circle cx="${punto.x.toFixed(2)}" cy="${punto.y.toFixed(2)}" r="5.5" aria-hidden="true"></circle>
      <text class="mat-etiqueta-punto" x="${textoX.toFixed(2)}" y="${textoY.toFixed(2)}" text-anchor="${ancla}">${simbolo} · ${oculto ? '?' : formatearEuros(punto.capitalCentimos)}</text>
    </g>`;
  }).join('');

  const marcasTiempo = puntos.map((punto) => `<g class="mat-marca-tiempo">
    <line x1="${punto.x.toFixed(2)}" y1="${Y_EJE_TIEMPO}" x2="${punto.x.toFixed(2)}" y2="${Y_EJE_TIEMPO + 5}" aria-hidden="true"></line>
    <text x="${punto.x.toFixed(2)}" y="${Y_EJE_TIEMPO + 22}" text-anchor="middle">${punto.numeroPeriodo}</text>
  </g>`).join('');

  const ariaEtapa = ocultarNuevo
    ? ', el último valor está oculto hasta que lo calcules'
    : etapa.tipo === 'interes-del-periodo'
    ? `, interés del año ${etapa.indicePeriodo + 1} de ${formatearEuros(modelo.periodos[etapa.indicePeriodo]!.interesGeneradoCentimos)} pendiente de sumarse`
    : '';

  return `<svg class="mat-grafico" viewBox="0 0 ${ANCHO_GRAFICO} ${ALTO_GRAFICO}" role="img" aria-label="Gráfico de capital frente al tiempo. Se muestran ${conocido + 1} capitales conocidos${ariaEtapa}.">
    <text class="mat-titulo-eje" x="${X_INICIAL}" y="19">Capital (€)</text>
    <line class="mat-eje-grafico" x1="${xBase}" y1="45" x2="${xBase}" y2="${Y_EJE_TIEMPO}" aria-hidden="true"></line>
    <line class="mat-eje-grafico" x1="${xBase}" y1="${Y_EJE_TIEMPO}" x2="${X_FINAL}" y2="${Y_EJE_TIEMPO}" aria-hidden="true"></line>
    <line class="mat-referencia-inicial" x1="${xBase}" y1="${yBase}" x2="${X_FINAL}" y2="${yBase}" aria-hidden="true"></line>
    <text class="mat-referencia-etiqueta" x="${xBase - 11}" y="${yBase + 4}" text-anchor="end">C₀</text>
    ${marcasTiempo}
    <text class="mat-titulo-tiempo" x="${X_FINAL}" y="${Y_EJE_TIEMPO + 42}" text-anchor="end">Tiempo (años)</text>
    ${trazos}
    ${interesEnCurso}
    ${nodos}
  </svg>`;
}

function etiquetaEtapa(indice: number, etapas: readonly EtapaCapitalizacion[]): string {
  const etapa = etapas[indice]!;
  return `<button type="button" class="mat-paso" data-mat-etapa="${indice}" aria-label="Ir a la etapa ${indice + 1}: ${nombreEtapa(etapa)}">${nombreEtapa(etapa)}</button>`;
}

/** Gráfico de capital-tiempo y desarrollo matemático coordinados por una misma etapa. */
export function montarCapitalizacionCompuesta(contenedor: HTMLElement): () => void {
  const modelo = calcularCapitalizacionCompuesta(ESCENARIO_CAPITALIZACION_COMPUESTA);
  const etapas = crearEtapasCapitalizacion(modelo);
  const movimientoReducido = typeof matchMedia === 'function'
    ? matchMedia('(prefers-reduced-motion: reduce)')
    : null;
  let indiceEtapa = 0;
  let reproduciendo = false;
  /** Modo cuaderno: cada cálculo se oculta hasta que el alumno lo ha intentado en papel. */
  let modoCuaderno = true;
  const reveladas = new Set<number>();
  let temporizador: number | undefined;

  contenedor.innerHTML = `<section class="mat-experiencia" aria-label="Lección visual de capitalización compuesta">
    <div class="mat-principio">
      <p class="mat-ceja">LA IDEA</p>
      <p>El interés se acumula al capital y pasa a producir nuevos intereses.</p>
    </div>
    <div class="mat-parametros" aria-label="Datos de la operación">
      <p><span>Capital inicial · <span class="s s-c0">C₀</span></span><strong>${formatearEuros(modelo.capitalInicialCentimos)}</strong></p>
      <p><span>Tipo anual · <span class="s s-i">i</span></span><strong>${formatearPorcentaje(modelo.tasaAnualPuntosBase)} <small>(${formatearTasaDecimal(modelo.tasaAnualPuntosBase)})</small></strong></p>
      <p><span>Duración · <span class="s s-n">n</span></span><strong>${modelo.numeroPeriodos} años</strong></p>
    </div>
    <div class="mat-aula">
      <figure class="mat-grafico-panel">
        <div class="mat-grafico-cabecera"><strong>El capital a lo largo del tiempo</strong><span>Un punto por cada cierre anual</span></div>
        <div data-mat-visual></div>
        <figcaption data-mat-leyenda></figcaption>
      </figure>
      <section class="mat-relato" aria-live="polite" aria-atomic="true">
        <p class="mat-contador" data-mat-contador></p>
        <h3 data-mat-titulo></h3>
        <div class="mat-reto" data-mat-reto hidden>
          <p class="mat-reto-texto"><b>Tu turno.</b> <span data-mat-reto-texto></span></p>
          <button type="button" class="ab o" data-mat-accion="revelar">Ya lo tengo: ver el cálculo</button>
        </div>
        <div class="mat-ecuaciones" data-mat-ecuaciones></div>
        <p class="mat-explicacion" data-mat-explicacion></p>
        <aside class="mat-nota-etapa" data-mat-nota><strong data-mat-nota-titulo></strong><p data-mat-nota-texto></p></aside>
      </section>
    </div>
    <div class="mat-controles" role="group" aria-label="Controles de la explicación">
      <button type="button" class="ab" data-mat-accion="anterior">← Anterior</button>
      <button type="button" class="ab o" data-mat-accion="reproducir" aria-pressed="false">Reproducir</button>
      <button type="button" class="ab" data-mat-accion="siguiente">Siguiente →</button>
      <button type="button" class="ab" data-mat-accion="reiniciar">Volver al inicio</button>
      <button type="button" class="ab mat-cuaderno" data-mat-accion="cuaderno" aria-pressed="true">Modo cuaderno: sí</button>
    </div>
    <nav class="mat-etapas" aria-label="Apartados de la explicación" data-mat-etapas></nav>
    <p class="mat-redondeo">Para enseñar cada año, aquí se redondea cada cierre a céntimos. En el examen aplica la fórmula directa y redondea solo el resultado.</p>
    <p class="mat-redondeo">Modo cuaderno: cada cálculo se oculta hasta que lo hayas hecho en papel. Si lo desactivas, se ve todo y puedes reproducirlo seguido.</p>
    <p class="mat-reducido" hidden data-mat-reducido>Movimiento reducido: avanza manualmente para ver cada paso del cálculo.</p>
  </section>`;

  const etapasNav = contenedor.querySelector<HTMLElement>('[data-mat-etapas]')!;
  const visual = contenedor.querySelector<HTMLElement>('[data-mat-visual]')!;
  const anterior = contenedor.querySelector<HTMLButtonElement>('[data-mat-accion="anterior"]')!;
  const siguiente = contenedor.querySelector<HTMLButtonElement>('[data-mat-accion="siguiente"]')!;
  const reproducir = contenedor.querySelector<HTMLButtonElement>('[data-mat-accion="reproducir"]')!;
  const avisoReducido = contenedor.querySelector<HTMLElement>('[data-mat-reducido]')!;
  etapasNav.innerHTML = etapas.map((_, indice) => etiquetaEtapa(indice, etapas)).join('');

  function renderizar(): void {
    const etapa = etapas[indiceEtapa]!;
    const lectura = lecturaEtapa(etapa, modelo);
    const esFinal = etapa.tipo === 'formula-general' || etapa.tipo === 'intereses-totales';
    const reto = retoEtapa(etapa, modelo);
    const oculta = modoCuaderno && reto !== null && !reveladas.has(indiceEtapa);
    visual.innerHTML = graficoCapital(modelo, etapa, oculta);
    const cajaReto = contenedor.querySelector<HTMLElement>('[data-mat-reto]')!;
    cajaReto.hidden = !oculta;
    contenedor.querySelector<HTMLElement>('[data-mat-reto-texto]')!.innerHTML = oculta && reto ? colorearSimbolos(reto) : '';
    for (const selector of ['[data-mat-ecuaciones]', '[data-mat-explicacion]', '[data-mat-nota]']) {
      contenedor.querySelector<HTMLElement>(selector)!.hidden = oculta;
    }
    contenedor.querySelector<HTMLElement>('[data-mat-contador]')!.textContent =
      `PASO ${String(indiceEtapa + 1).padStart(2, '0')} / ${String(etapas.length).padStart(2, '0')}`;
    contenedor.querySelector<HTMLElement>('[data-mat-titulo]')!.textContent = lectura.titulo;
    contenedor.querySelector<HTMLElement>('[data-mat-ecuaciones]')!.innerHTML = lectura.ecuaciones
      .map((_, indice) => `<p class="mat-ecuacion${indice === lectura.ecuaciones.length - 1 && esFinal ? ' mat-ecuacion-final' : ''}"></p>`)
      .join('');
    contenedor.querySelectorAll<HTMLElement>('[data-mat-ecuaciones] .mat-ecuacion').forEach((elemento, indice) => {
      elemento.innerHTML = colorearSimbolos(lectura.ecuaciones[indice]!);
    });
    contenedor.querySelector<HTMLElement>('[data-mat-explicacion]')!.textContent = lectura.explicacion;
    contenedor.querySelector<HTMLElement>('[data-mat-nota-titulo]')!.textContent = lectura.notaTitulo;
    contenedor.querySelector<HTMLElement>('[data-mat-nota-texto]')!.textContent = lectura.nota;

    const leyenda = contenedor.querySelector<HTMLElement>('[data-mat-leyenda]')!;
    leyenda.textContent = etapa.tipo === 'interes-del-periodo'
      ? `El tramo discontinuo anticipa el cierre; el incremento señalado es el interés generado en este periodo.`
      : `La línea se construye con el capital de inicio y los importes al cierre de cada periodo.`;

    etapasNav.querySelectorAll<HTMLButtonElement>('[data-mat-etapa]').forEach((boton) => {
      const activo = Number(boton.dataset.matEtapa) === indiceEtapa;
      boton.classList.toggle('activo', activo);
      if (activo) boton.setAttribute('aria-current', 'step');
      else boton.removeAttribute('aria-current');
    });
    anterior.disabled = indiceEtapa === 0;
    siguiente.disabled = indiceEtapa === etapas.length - 1;
    reproducir.textContent = reproduciendo ? 'Pausar' : 'Reproducir';
    reproducir.setAttribute('aria-pressed', String(reproduciendo));
    // En modo cuaderno el ritmo lo marca el alumno: no hay reproducción automática.
    reproducir.hidden = Boolean(movimientoReducido?.matches) || modoCuaderno;
    const cuaderno = contenedor.querySelector<HTMLButtonElement>('[data-mat-accion="cuaderno"]')!;
    cuaderno.textContent = `Modo cuaderno: ${modoCuaderno ? 'sí' : 'no'}`;
    cuaderno.setAttribute('aria-pressed', String(modoCuaderno));
    avisoReducido.hidden = !movimientoReducido?.matches;
  }

  function detener(): void {
    if (temporizador !== undefined) window.clearTimeout(temporizador);
    temporizador = undefined;
    reproduciendo = false;
  }

  function seleccionar(indice: number): void {
    detener();
    indiceEtapa = Math.max(0, Math.min(etapas.length - 1, indice));
    renderizar();
  }

  function avanzar(): void {
    temporizador = undefined;
    if (!reproduciendo || !contenedor.isConnected) {
      detener();
      return;
    }
    if (indiceEtapa === etapas.length - 1) {
      detener();
      renderizar();
      return;
    }
    indiceEtapa++;
    if (indiceEtapa === etapas.length - 1) reproduciendo = false;
    renderizar();
    if (reproduciendo) temporizador = window.setTimeout(avanzar, DURACION_ETAPA_MS);
  }

  function alternarReproduccion(): void {
    if (movimientoReducido?.matches) return;
    if (reproduciendo) {
      detener();
      renderizar();
      return;
    }
    if (indiceEtapa === etapas.length - 1) indiceEtapa = 0;
    reproduciendo = true;
    renderizar();
    temporizador = window.setTimeout(avanzar, DURACION_ETAPA_MS);
  }

  function alPulsar(evento: Event): void {
    const boton = evento.target instanceof Element
      ? evento.target.closest<HTMLButtonElement>('[data-mat-accion], [data-mat-etapa]')
      : null;
    if (!boton || boton.disabled) return;
    if (boton.dataset.matEtapa !== undefined) {
      seleccionar(Number(boton.dataset.matEtapa));
      return;
    }
    switch (boton.dataset.matAccion) {
      case 'anterior': seleccionar(indiceEtapa - 1); break;
      case 'siguiente': seleccionar(indiceEtapa + 1); break;
      case 'reiniciar': seleccionar(0); break;
      case 'reproducir': alternarReproduccion(); break;
      case 'revelar': reveladas.add(indiceEtapa); renderizar(); break;
      case 'cuaderno':
        detener();
        modoCuaderno = !modoCuaderno;
        renderizar();
        break;
    }
  }

  function alCambiarMovimiento(): void {
    if (movimientoReducido?.matches) detener();
    renderizar();
  }

  contenedor.addEventListener('click', alPulsar);
  movimientoReducido?.addEventListener('change', alCambiarMovimiento);
  renderizar();

  return () => {
    detener();
    contenedor.removeEventListener('click', alPulsar);
    movimientoReducido?.removeEventListener('change', alCambiarMovimiento);
  };
}
