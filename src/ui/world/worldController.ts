import { MARCA, tituloMarca } from '../components/brandTitle.ts';
import { hrefConcepto } from '../../app/router.ts';
import type { EstadoEstudio } from '../../app/store.ts';
import { historiaDeConcepto } from '../../experiences/registry.ts';
import { type AlmacenClaveValor, escribirJson, leerJson } from '../../persistence/storage.ts';
import type { DatosSeleccionables } from '../../scene/three/builders.ts';
import type { Mundo3D } from '../../scene/three/cityScene.ts';
import { webglDisponible } from '../../scene/webgl.ts';
import { vistaAtlas } from '../../world/atlas.ts';
import { type ModeloCiudad, modeloCiudad } from '../../world/cityModel.ts';
import { etiquetasDelNivel } from '../../world/labels.ts';
import {
  buscarBarrio,
  buscarEdificio,
  buscarZona,
  cadenaFoco,
  codificarFoco,
  decodificarFoco,
  FOCO_CIUDAD,
  type Foco,
  focoPadre,
  focoValido,
  igualFoco,
} from '../../world/focus.ts';
import { alCambiarMovimiento, movimientoReducido } from '../motion.ts';
import { fichaContextual } from './contextCard.ts';
import { atlasHtml, barraMundo, esqueletoMundo, historiaHtml, type Miga, separarTitulo } from './worldPanel.ts';

/** Preferencia de vista de cada usuario (comodidad local, no es progreso). */
export const CLAVE_VISTA = 'financial-academy:vista';
/** Zoom con la rueda fuera de pantalla completa (comodidad local). */
export const CLAVE_ZOOM = 'financial-academy:zoom-rueda';
/** La entrada cinematográfica solo se muestra completa la primera vez. */
export const CLAVE_ENTRADA = 'financial-academy:entrada';

/**
 * Orquesta el mundo de la portada: un único foco compartido por la cámara 3D, las etiquetas
 * flotantes y el Atlas HTML. El renderer Three.js se carga bajo demanda y se reutiliza entre
 * visitas a la portada; si no hay WebGL, el Atlas y la ciudad 2D siguen funcionando.
 */
export class ControladorMundo {
  private foco: Foco = FOCO_CIUDAD;
  private vistaAtlas = false;
  private modo3d: boolean;
  private disponible3d: boolean | null = null;
  private mundo: Mundo3D | null = null;
  private modelo: ModeloCiudad;
  private raiz: HTMLElement | null = null;
  private pasoHistoria = 0;
  private reducido = movimientoReducido();
  private etiquetas: { foco: Foco; el: HTMLElement }[] = [];
  private modoMapa = false;
  /** Lo que el puntero está señalando ahora mismo (ficha de vistazo). */
  private vistazo: Foco | null = null;
  /** Si la entrada cinematográfica está en curso, la salta y la cierra. */
  private cerrarEntrada: (() => void) | null = null;
  /**
   * Portada (landing): el mapa a pantalla completa, sin interfaz. Un clic pasa a la exploración;
   * el scroll revela el bloque del tema y la barra lateral.
   */
  private enPortada = false;
  /** Paseo con el personaje (teclado). */
  private paseando = false;
  private cercano: string | null = null;
  private teclas = new Set<string>();
  private alTecladoPaseo: ((e: KeyboardEvent) => void) | null = null;
  private ultimoEspacio = 0;
  /** El mapa está en pantalla completa (API nativa o capa de reserva). */
  private pantallaCompleta = false;
  private zoomRueda: boolean;
  private pistaZoomMostrada = false;
  private observadorPortada: IntersectionObserver | null = null;
  /** El mapa ocupa la mayor parte de la pantalla (≥ 55 % visible). */
  private mapaDomina = false;

  constructor(
    private readonly estado: EstadoEstudio,
    private readonly almacen: AlmacenClaveValor | null,
  ) {
    this.modo3d = leerJson(almacen, CLAVE_VISTA) !== '2d';
    this.zoomRueda = leerJson(almacen, CLAVE_ZOOM) === true;
    document.addEventListener('fullscreenchange', () => {
      const nativa = Boolean(this.raiz && document.fullscreenElement === this.raiz);
      if (!nativa && !this.raiz?.classList.contains('pantalla-completa')) this.fijarPantallaCompleta(false);
    });
    this.modelo = modeloCiudad(estado.tema, estado.progreso);
    alCambiarMovimiento((reducido) => {
      this.reducido = reducido;
      if (this.mundo) this.mundo.movimientoReducido = reducido;
    });
  }

  /** Recuerda el último lugar visitado para volver a él al regresar al mapa. */
  recordar(foco: Foco): void {
    if (!igualFoco(foco, this.foco)) this.pasoHistoria = 0;
    this.foco = foco;
  }

  montar(raiz: HTMLElement): void {
    this.raiz = raiz;
    this.modelo = modeloCiudad(this.estado.tema, this.estado.progreso);
    if (!focoValido(this.modelo, this.foco)) this.foco = FOCO_CIUDAD;
    raiz.innerHTML = esqueletoMundo();
    raiz.addEventListener('click', (e) => this.alPulsar(e));
    raiz.addEventListener('keydown', (e) => {
      // Capa de reserva (sin API nativa): Esc sale de la pantalla completa.
      if (e.key === 'Escape' && raiz.classList.contains('pantalla-completa') && !this.paseando) {
        e.preventDefault();
        void this.salirPantallaCompleta();
        return;
      }
      if (this.paseando) return;
      if (e.key === 'Escape' && this.subir()) e.preventDefault();
    });
    this.pintarPanel();
    void this.prepararVista();
  }

  desmontar(): void {
    // Salir a mitad de la entrada la da por vista: no deja escuchadores ni edificios a medio levantar.
    this.cerrarEntrada?.();
    this.detenerPaseo(false);
    if (this.pantallaCompleta) void this.salirPantallaCompleta();
    this.observadorPortada?.disconnect();
    this.observadorPortada = null;
    this.mapaDomina = false;
    document.body.classList.remove('portada-inmersiva');
    this.mundo?.desmontar();
    this.raiz = null;
    this.etiquetas = [];
  }

  /* ------------------------------------------------------------ vista 3D / 2D */

  private async prepararVista(): Promise<void> {
    const raiz = this.raiz;
    if (!raiz) return;
    if (!this.modo3d) return this.mostrar2d('');
    this.disponible3d ??= webglDisponible();
    if (!this.disponible3d) return this.mostrar2d('La vista 3D no está disponible en este navegador: se muestra la ciudad 2D.');

    this.aviso('Cargando la ciudad 3D…');
    let mundo: Mundo3D;
    try {
      if (this.mundo) this.mundo.actualizar(this.modelo);
      else this.mundo = await this.crearMundo();
      mundo = this.mundo;
    } catch (error) {
      console.error('No se pudo iniciar la vista 3D', error);
      this.disponible3d = false;
      if (this.raiz === raiz) this.mostrar2d('No se pudo iniciar la vista 3D: se muestra la ciudad 2D.');
      return;
    }
    // El usuario puede haber salido de la portada o cambiado a 2D mientras cargaba.
    if (this.raiz !== raiz || !this.modo3d) return;

    const vista = this.el('[data-mundo-vista]');
    vista.hidden = false;
    this.alternarCiudad2d(false);
    mundo.lienzo.setAttribute('aria-label', `Maqueta 3D de ${MARCA.ciudad}. El Atlas de abajo ofrece la misma navegación en texto.`);
    // Con la ciudad 3D funcionando, el mundo pasa a ser lo primero de la portada. Se vuelve a la
    // portada (landing) cuando se llega a la vista general; desde un lugar estudiado, a explorar.
    raiz.parentElement?.prepend(raiz);
    this.fijarPortada(this.foco.nivel === 'ciudad' && !this.vistaAtlas);
    this.vigilarInmersion(vista);
    this.aplicarZoom();
    mundo.montarEn(vista);
    mundo.enfocar(this.foco, this.vistaAtlas ? 'atlas' : 'maqueta', false);
    this.aviso('');
    this.pintarPanel();
    if (this.foco.nivel === 'ciudad' && !this.vistaAtlas && !this.reducido && leerJson(this.almacen, CLAVE_ENTRADA) !== 'vista') {
      this.iniciarEntrada(vista, mundo);
    }
  }

  /**
   * Primera visita: negro → identidad → la ciudad aparece y la cámara desciende → los barrios se
   * levantan → "Estudiar es construirla" → navegación. Se salta con el botón, Escape o un toque.
   */
  private iniciarEntrada(vista: HTMLElement, mundo: Mundo3D): void {
    const capa = document.createElement('div');
    capa.className = 'entrada';
    capa.innerHTML = `<div class="entrada-marca">${tituloMarca('entrada')}</div><p class="entrada-lema">Estudiar es construirla</p><button type="button" class="entrada-saltar">Saltar</button>`;
    vista.append(capa);
    vista.classList.add('en-entrada');
    let cerrada = false;
    const cerrar = () => {
      if (cerrada) return;
      cerrada = true;
      escribirJson(this.almacen, CLAVE_ENTRADA, 'vista');
      capa.remove();
      vista.classList.remove('en-entrada');
      document.removeEventListener('keydown', alTeclado);
      this.cerrarEntrada = null;
    };
    const saltar = mundo.entrada(() => {
      capa.classList.add('lema');
      setTimeout(cerrar, 2600);
    });
    const saltarYCerrar = () => {
      saltar();
      cerrar();
    };
    this.cerrarEntrada = saltarYCerrar;
    const alTeclado = (e: KeyboardEvent) => {
      if (e.key === 'Escape') saltarYCerrar();
    };
    document.addEventListener('keydown', alTeclado);
    capa.querySelector('button')!.addEventListener('click', saltarYCerrar);
    capa.addEventListener('pointerdown', (e) => {
      if (!(e.target as Element).closest('button')) saltarYCerrar();
    });
    setTimeout(() => capa.classList.add('abierta'), 1300);
  }

  private async crearMundo(): Promise<Mundo3D> {
    // Three.js va en un fragmento aparte: la portada 2D no lo descarga.
    const { Mundo3D } = await import('../../scene/three/cityScene.ts');
    return new Mundo3D(this.modelo, {
      movimientoReducido: this.reducido,
      alSeleccionar: (s) => this.alSeleccionar(s),
      alSobrevolar: (s) => this.alSobrevolar(s),
      alFotograma: () => this.colocarEtiquetas(),
      alAcercarse: (id) => {
        this.cercano = id;
        this.pintarFicha();
      },
      alPerderContexto: () => {
        this.disponible3d = false;
        this.mundo?.destruir();
        this.mundo = null;
        this.mostrar2d('La vista 3D se ha detenido: se muestra la ciudad 2D.');
      },
    });
  }

  private mostrar2d(mensaje: string): void {
    if (!this.raiz) return;
    this.mundo?.desmontar();
    this.el('[data-mundo-vista]').hidden = true;
    this.alternarCiudad2d(true);
    this.aviso(mensaje);
    this.pintarPanel();
  }

  /** La ciudad pixel art sigue siendo la alternativa 2D: se oculta solo con la 3D funcionando. */
  private alternarCiudad2d(visible: boolean): void {
    const pagina = this.raiz?.parentElement;
    for (const el of pagina?.querySelectorAll<HTMLElement>('.skyline, .legend') ?? []) el.hidden = !visible;
  }

  private aviso(texto: string): void {
    const el = this.raiz?.querySelector<HTMLElement>('[data-mundo-aviso]');
    if (el) {
      el.textContent = texto;
      el.hidden = !texto;
    }
  }

  private get activo3d(): boolean {
    return Boolean(this.mundo && this.modo3d && this.disponible3d && this.raiz);
  }

  /* ------------------------------------------------------------ paseo */

  private empezarPaseo(): void {
    if (!this.activo3d || this.paseando) return;
    if (this.enPortada) this.fijarPortada(false);
    this.vistaAtlas = false;
    this.paseando = true;
    this.mundo!.iniciarPaseo();
    this.raiz?.classList.add('paseando');
    // El foco no puede quedarse en el botón: el espacio lo volvería a pulsar.
    (document.activeElement as HTMLElement | null)?.blur?.();
    const direccion = () => {
      const t = this.teclas;
      const x = (t.has('d') || t.has('arrowright') ? 1 : 0) - (t.has('a') || t.has('arrowleft') ? 1 : 0);
      const y = (t.has('w') || t.has('arrowup') ? 1 : 0) - (t.has('s') || t.has('arrowdown') ? 1 : 0);
      this.mundo?.fijarEntradaPaseo({ x, y });
    };
    const MOVER = new Set(['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright']);
    this.alTecladoPaseo = (e: KeyboardEvent) => {
      const destino = e.target as Element | null;
      if (destino?.closest('input, textarea, select, [contenteditable="true"]')) return;
      const tecla = e.key.toLowerCase();
      if (e.type === 'keydown' && tecla === 'escape') {
        e.preventDefault();
        this.detenerPaseo(true);
        return;
      }
      if (e.type === 'keydown' && (tecla === 'e' || tecla === 'enter') && this.cercano) {
        e.preventDefault();
        location.hash = hrefConcepto(this.cercano);
        return;
      }
      if (tecla === ' ' || e.code === 'Space') {
        // Espacio salta; dos espacios seguidos (menos de 280 ms), dash.
        e.preventDefault();
        if (e.type === 'keydown' && !e.repeat) {
          const ahora = performance.now();
          if (ahora - this.ultimoEspacio < 280) {
            this.mundo?.dashear();
            this.ultimoEspacio = 0;
          } else {
            this.mundo?.saltar();
            this.ultimoEspacio = ahora;
          }
        }
        return;
      }
      if (!MOVER.has(tecla)) return;
      e.preventDefault();
      if (e.type === 'keydown') this.teclas.add(tecla);
      else this.teclas.delete(tecla);
      direccion();
    };
    window.addEventListener('keydown', this.alTecladoPaseo);
    window.addEventListener('keyup', this.alTecladoPaseo);
    window.addEventListener('blur', this.soltarTeclas);
    this.pintarPanel();
  }

  private soltarTeclas = () => {
    this.teclas.clear();
    this.mundo?.fijarEntradaPaseo({ x: 0, y: 0 });
  };

  /** Termina el paseo; `reencuadrar` devuelve la cámara al foco (no hace falta si se va a enfocar otro). */
  private detenerPaseo(reencuadrar: boolean): void {
    if (!this.paseando) return;
    this.paseando = false;
    this.cercano = null;
    this.soltarTeclas();
    if (this.alTecladoPaseo) {
      window.removeEventListener('keydown', this.alTecladoPaseo);
      window.removeEventListener('keyup', this.alTecladoPaseo);
      this.alTecladoPaseo = null;
    }
    window.removeEventListener('blur', this.soltarTeclas);
    this.raiz?.classList.remove('paseando');
    if (reencuadrar) this.mundo?.terminarPaseo();
    if (this.raiz) this.pintarPanel();
  }

  /* ------------------------------------------------------------ pantalla completa y zoom */

  /** Pantalla completa del mapa: API nativa si el navegador la permite; si no, capa fija. */
  private async entrarPantallaCompleta(): Promise<void> {
    const raiz = this.raiz;
    if (!raiz || !this.activo3d) return;
    if (this.enPortada) this.fijarPortada(false);
    let nativa = false;
    try {
      if (raiz.requestFullscreen) {
        await raiz.requestFullscreen();
        nativa = document.fullscreenElement === raiz;
      }
    } catch {
      nativa = false;
    }
    if (!nativa) raiz.classList.add('pantalla-completa');
    this.fijarPantallaCompleta(true);
  }

  private async salirPantallaCompleta(): Promise<void> {
    this.raiz?.classList.remove('pantalla-completa');
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {
        /* ya no estaba en pantalla completa */
      }
    }
    this.fijarPantallaCompleta(false);
  }

  private fijarPantallaCompleta(activa: boolean): void {
    if (this.pantallaCompleta === activa) return;
    this.pantallaCompleta = activa;
    this.raiz?.classList.toggle('en-pantalla-completa', activa);
    this.aplicarZoom();
    if (this.raiz) this.pintarPanel();
  }

  /** La rueda hace zoom en pantalla completa o con el interruptor; si no, desplaza la página. */
  private aplicarZoom(): void {
    if (this.mundo) this.mundo.zoom = this.pantallaCompleta || this.zoomRueda;
  }

  private fijarPortada(activa: boolean): void {
    this.enPortada = activa;
    this.raiz?.classList.toggle('portada', activa);
    if (this.mundo) this.mundo.exploracion = !activa;
    this.actualizarInmersion();
  }

  /**
   * Regla única del índice lateral: solo se retira en la portada (sin explorar) mientras el mapa
   * domina la pantalla. Explorando, al bajar por la página o fuera de la portada, siempre se ve.
   */
  private actualizarInmersion(): void {
    const retirar = Boolean(this.raiz) && this.enPortada && this.mapaDomina;
    document.body.classList.toggle('portada-inmersiva', retirar);
    if (!retirar) document.body.classList.remove('menu');
  }

  /** Mientras el mapa domina la pantalla, la barra lateral se retira y el mundo ocupa todo el ancho. */
  private vigilarInmersion(vista: HTMLElement): void {
    // Cualquier clic (no arrastre) sobre el mapa de la portada entra en la exploración.
    if (!vista.dataset.portadaLista) {
      vista.dataset.portadaLista = '1';
      let inicio: { x: number; y: number } | null = null;
      vista.addEventListener('pointerdown', (e) => (inicio = { x: e.clientX, y: e.clientY }));
      // Zoom puntual con Ctrl/⌘ + rueda cuando el zoom libre está desactivado.
      vista.addEventListener(
        'wheel',
        (e) => {
          if (this.enPortada || !this.activo3d || this.pantallaCompleta || this.zoomRueda) return;
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            this.mundo!.zoomPuntual(e.deltaY);
          } else if (!this.pistaZoomMostrada) {
            this.pistaZoomMostrada = true;
            const pista = this.raiz?.querySelector<HTMLElement>('[data-pista-zoom]');
            if (pista) {
              pista.hidden = false;
              setTimeout(() => (pista.hidden = true), 2600);
            }
          }
        },
        { passive: false },
      );
      vista.addEventListener('pointerup', (e) => {
        if (this.enPortada && inicio && Math.hypot(e.clientX - inicio.x, e.clientY - inicio.y) <= 6 && !(e.target as Element).closest('.entrada')) {
          // Clic en el mapa de la portada: pantalla completa y exploración.
          void this.entrarPantallaCompleta();
        }
        inicio = null;
      });
    }
    this.observadorPortada?.disconnect();
    this.observadorPortada = new IntersectionObserver(
      ([e]) => {
        this.mapaDomina = Boolean(e && e.intersectionRatio >= 0.55);
        this.actualizarInmersion();
      },
      { threshold: [0, 0.55, 1] },
    );
    this.observadorPortada.observe(vista);
  }

  /* ------------------------------------------------------------ navegación */

  private enfocar(foco: Foco): void {
    if (this.enPortada) this.fijarPortada(false);
    if (this.paseando) this.detenerPaseo(false);
    if (!igualFoco(foco, this.foco)) this.pasoHistoria = 0;
    this.foco = foco;
    this.pintarPanel();
    if (this.activo3d) this.mundo!.enfocar(foco, this.vistaAtlas ? 'atlas' : 'maqueta', true);
  }

  private subir(): boolean {
    const padre = focoPadre(this.modelo, this.foco);
    if (!padre) return false;
    this.enfocar(padre);
    return true;
  }

  private alSeleccionar(s: DatosSeleccionables): void {
    // En la portada, el primer clic solo entra en la ciudad (lo gestiona `vigilarInmersion`).
    if (this.enPortada) return;
    // Paseando, un clic en un edificio muestra su ficha sin sacar del paseo.
    if (this.paseando) {
      if (s.tipo === 'edificio') {
        this.cercano = s.conceptoId;
        this.pintarFicha();
      }
      return;
    }
    if (s.tipo === 'edificio') {
      const foco: Foco = { nivel: 'edificio', conceptoId: s.conceptoId };
      // Segundo toque sobre el edificio ya enfocado: entrar al concepto.
      if (igualFoco(foco, this.foco)) location.hash = hrefConcepto(s.conceptoId);
      else this.enfocar(foco);
    } else {
      this.enfocar({ nivel: 'zona', seccionId: s.seccionId });
    }
  }

  private alSobrevolar(s: DatosSeleccionables | null): void {
    const foco: Foco | null = s?.tipo === 'edificio'
      ? { nivel: 'edificio', conceptoId: s.conceptoId }
      : s?.tipo === 'zona'
        ? { nivel: 'zona', seccionId: s.seccionId }
        : null;
    if ((foco && this.vistazo && igualFoco(foco, this.vistazo)) || (!foco && !this.vistazo)) return;
    this.vistazo = foco;
    this.pintarFicha();
    if (!this.paseando) this.pintarEtiquetas();
  }

  /**
   * Ficha contextual en una esquina del visor: lo que se señala (vistazo) o, si no, lo que está
   * seleccionado. En la vista general sin nada señalado no hay ficha: solo la ciudad.
   */
  private pintarFicha(): void {
    const el = this.raiz?.querySelector<HTMLElement>('[data-mundo-ficha]');
    if (!el) return;
    if (this.paseando) {
      const html = this.cercano ? fichaContextual(this.modelo, { nivel: 'edificio', conceptoId: this.cercano }, 'seleccion') + '<p class="ficha-pista">Pulsa E para entrar</p>' : '';
      el.innerHTML = html;
      el.hidden = !html;
      el.classList.remove('vistazo');
      el.removeAttribute('aria-hidden');
      return;
    }
    const vistazo = this.vistazo && !igualFoco(this.vistazo, this.foco) ? this.vistazo : null;
    const html = vistazo
      ? fichaContextual(this.modelo, vistazo, 'vistazo')
      : this.foco.nivel !== 'ciudad'
        ? fichaContextual(this.modelo, this.foco, 'seleccion')
        : '';
    el.innerHTML = html;
    el.hidden = !html;
    el.classList.toggle('vistazo', Boolean(vistazo));
    if (vistazo) el.setAttribute('aria-hidden', 'true');
    else el.removeAttribute('aria-hidden');
  }

  private alPulsar(e: Event): void {
    const objetivo = (e.target as Element).closest<HTMLButtonElement>('button');
    if (!objetivo || objetivo.disabled) return;
    const { dataset } = objetivo;
    if (dataset.foco) {
      const foco = decodificarFoco(this.modelo, dataset.foco);
      if (foco) this.enfocar(foco);
    } else if ('mundoSubir' in dataset) {
      this.subir();
    } else if ('mundoAtlas' in dataset) {
      this.vistaAtlas = !this.vistaAtlas;
      this.pintarPanel();
      if (this.activo3d) this.mundo!.enfocar(this.foco, this.vistaAtlas ? 'atlas' : 'maqueta', true);
    } else if ('mundoCompleta' in dataset) {
      if (this.pantallaCompleta) void this.salirPantallaCompleta();
      else void this.entrarPantallaCompleta();
    } else if ('mundoZoom' in dataset) {
      this.zoomRueda = !this.zoomRueda;
      escribirJson(this.almacen, CLAVE_ZOOM, this.zoomRueda);
      this.aplicarZoom();
      this.pintarPanel();
    } else if ('mundoPaseo' in dataset) {
      if (this.paseando) this.detenerPaseo(true);
      else this.empezarPaseo();
    } else if ('mundoModo' in dataset) {
      this.modo3d = !this.modo3d;
      escribirJson(this.almacen, CLAVE_VISTA, this.modo3d ? '3d' : '2d');
      if (this.modo3d) void this.prepararVista();
      else this.mostrar2d('');
    } else if (dataset.historia) {
      this.pasoHistoria = Math.max(0, this.pasoHistoria + Number(dataset.historia));
      this.pintarPanel();
      this.raiz?.querySelector<HTMLButtonElement>(`[data-historia="${dataset.historia}"]:not(:disabled)`)?.focus();
    }
  }

  /* ------------------------------------------------------------ pintado */

  private etiquetaFoco(f: Foco): string {
    switch (f.nivel) {
      case 'ciudad':
        return MARCA.ciudad;
      case 'barrio':
        return buscarBarrio(this.modelo, f.grupoId)?.titulo ?? '';
      case 'zona': {
        const z = buscarZona(this.modelo, f.seccionId);
        return z ? `${z.seccionId} ${z.titulo}` : '';
      }
      case 'edificio':
        return buscarEdificio(this.modelo, f.conceptoId)?.nombre ?? '';
    }
  }

  private pintarPanel(): void {
    if (!this.raiz) return;
    const migas: Miga[] = cadenaFoco(this.modelo, this.foco).map((foco) => ({ foco, etiqueta: this.etiquetaFoco(foco) }));
    this.el('[data-mundo-barra]').innerHTML = barraMundo({
      migas,
      puedeSubir: this.foco.nivel !== 'ciudad',
      modo3d: this.modo3d,
      disponible3d: this.disponible3d,
      vistaAtlas: this.vistaAtlas,
      paseando: this.paseando,
      pantallaCompleta: this.pantallaCompleta,
      zoomRueda: this.zoomRueda,
    });

    let historia = '';
    if (this.foco.nivel === 'edificio') {
      const h = historiaDeConcepto(this.estado.tema, this.foco.conceptoId);
      if (h) {
        this.pasoHistoria = Math.min(this.pasoHistoria, h.pasos.length - 1);
        historia = historiaHtml(h, this.estado.tema.modos, this.pasoHistoria);
      }
    }
    this.el('[data-atlas]').innerHTML = atlasHtml(vistaAtlas(this.modelo, this.foco), historia);
    this.pintarEtiquetas();
    this.pintarFicha();
  }

  /** Etiquetas flotantes del nivel actual (ver `etiquetasDelNivel`). */
  private pintarEtiquetas(): void {
    const capa = this.raiz?.querySelector<HTMLElement>('[data-mundo-etiquetas]');
    if (!capa) return;
    const f = this.foco;
    this.modoMapa = this.vistaAtlas || (this.mundo?.factorAtlas ?? 0) > 0.5;
    capa.innerHTML = '';
    const focos = etiquetasDelNivel(this.modelo, f, this.modoMapa);
    // El edificio que señala el puntero lleva siempre su nombre, en cualquier nivel.
    const v = this.vistazo;
    if (v?.nivel === 'edificio' && !focos.some((x) => igualFoco(x, v))) focos.push(v);
    this.etiquetas = focos.map((foco) => {
      const el = document.createElement('button');
      el.type = 'button';
      el.tabIndex = -1;
      el.className = 'm-etq';
      el.dataset.foco = codificarFoco(foco);
      if (foco.nivel === 'barrio') {
        // Rótulo de barrio: discreto, como el nombre de un distrito en un plano. Sin cifras.
        const b = buscarBarrio(this.modelo, foco.grupoId)!;
        const [numero, nombre] = separarTitulo(b.titulo);
        el.classList.add('barrio');
        el.innerHTML = `<span class="m-num">${numero}</span><span class="m-largo">${nombre}</span>`;
        el.setAttribute('aria-label', b.titulo);
      } else if (foco.nivel === 'zona') {
        const z = buscarZona(this.modelo, foco.seccionId)!;
        el.innerHTML = `<span class="m-num">${z.seccionId}</span><span class="m-largo">${z.titulo}</span>`;
      } else if (foco.nivel === 'edificio') {
        el.textContent = buscarEdificio(this.modelo, foco.conceptoId)!.nombre;
        el.classList.add('edificio');
        if (f.nivel === 'edificio') el.classList.toggle('tenue', !igualFoco(foco, f));
        if (v && igualFoco(foco, v)) el.classList.add('sobrevuelo');
      }
      capa.append(el);
      return { foco, el };
    });
    this.colocarEtiquetas();
  }

  private colocarEtiquetas(): void {
    if (!this.activo3d) return;
    // Al alejarse, la ciudad pasa a leerse como mapa y cambian las etiquetas.
    if ((this.vistaAtlas || this.mundo!.factorAtlas > 0.5) !== this.modoMapa) return this.pintarEtiquetas();
    // Se colocan de arriba abajo y, si una pisa a otra ya colocada, baja lo justo para no taparla.
    const colocadas: { x0: number; x1: number; y0: number; y1: number }[] = [];
    const puntos = this.etiquetas
      .map(({ foco, el }) => ({ el, p: this.mundo!.proyectarFoco(foco) }))
      .sort((a, b) => a.p.y - b.p.y);
    for (const { el, p } of puntos) {
      el.hidden = !p.visible;
      if (!p.visible) continue;
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      let y = Math.round(p.y);
      const x = Math.round(p.x);
      for (const c of colocadas) {
        if (x - w / 2 < c.x1 && x + w / 2 > c.x0 && y - h < c.y1 && y > c.y0) y = Math.round(c.y1 + h + 4);
      }
      colocadas.push({ x0: x - w / 2, x1: x + w / 2, y0: y - h, y1: y });
      // Píxeles enteros: sin temblor de las etiquetas al mover la cámara.
      el.style.transform = `translate(-50%, -100%) translate(${x}px, ${y}px)`;
    }
  }

  private el(selector: string): HTMLElement {
    return this.raiz!.querySelector<HTMLElement>(selector)!;
  }
}
