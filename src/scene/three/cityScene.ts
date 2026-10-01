import {
  ACESFilmicToneMapping,
  BoxGeometry,
  CanvasTexture,
  DirectionalLight,
  Fog,
  type Group,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  type Object3D,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Raycaster,
  Scene,
  Spherical,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { FaseObra, ModeloCiudad } from '../../world/cityModel.ts';
import { buscarBarrio, buscarEdificio, buscarZona, type Foco, rectFoco } from '../../world/focus.ts';
import { encoger, type Rect } from '../../world/geometry.ts';
import { CONSTRUIDO_POR_FASE, type DatosArquitectura } from './architecture.ts';
import {
  type CapaDinamica,
  colocarCoches,
  colocarEnRecorrido,
  construirCapaDinamica,
  construirCapaEstatica,
  type DatosSeleccionables,
  datosArquitectura,
  liberar,
} from './builders.ts';
import { unir } from './materials.ts';
import { animarAvatar, construirAvatar, type PartesAvatar } from './avatar.ts';
import {
  avanzarPaseo,
  edificioCercano,
  type EntradaPaseo,
  type EstadoPaseo,
  obstaculosDe,
  puntoDeSalida,
} from '../../world/paseo.ts';
import { NIVEL, PALETA } from './palette.ts';

/*
 * Renderer de la Ciudad del Dinero. Solo dibuja el modelo visual y avisa de lo que el usuario
 * toca; no conoce rutas, textos ni lógica de aprendizaje (eso vive en la UI y el dominio).
 */

export type VistaMundo = 'maqueta' | 'atlas';

export interface OpcionesMundo3D {
  movimientoReducido: boolean;
  /** Clic (o toque) sobre una zona o un edificio. */
  alSeleccionar(seleccion: DatosSeleccionables): void;
  alSobrevolar(seleccion: DatosSeleccionables | null): void;
  /** Tras cada fotograma en el que algo se ha movido (para recolocar etiquetas HTML). */
  alFotograma(): void;
  alPerderContexto(): void;
  /** Paseo: el personaje se acerca a un edificio (o se aleja de todos: null). */
  alAcercarse?(conceptoId: string | null): void;
}

export interface PuntoPantalla {
  x: number;
  y: number;
  visible: boolean;
}

interface Transicion {
  inicio: number;
  duracion: number;
  desdeObjetivo: Vector3;
  haciaObjetivo: Vector3;
  desde: Spherical;
  hacia: Spherical;
  fovDesde: number;
  fovHacia: number;
  desplazamientoDesde: number;
  desplazamientoHacia: number;
  /** Elevación extra a mitad de recorrido: la cámara "vuela" entre lugares alejados. */
  arco: number;
}

/**
 * Cámara como lenguaje: cada nivel tiene su óptica.
 * - Ciudad: tres cuartos, objetivo normal.
 * - Mapa (Atlas): cenital y orientado.
 * - Barrio: isométrica de teleobjetivo (perspectiva casi plana, como un plano axonométrico).
 * - Zona: más baja, se entra en las calles.
 * - Edificio: cámara arquitectónica frente a la fachada principal, angular y cerca.
 */
const OPTICA: Record<Foco['nivel'], { phi: number; fov: number; ocupacion: number }> = {
  ciudad: { phi: 0.9, fov: 30, ocupacion: 0.97 },
  barrio: { phi: 0.955, fov: 17, ocupacion: 0.92 },
  zona: { phi: 1.0, fov: 30, ocupacion: 0.9 },
  edificio: { phi: 0.9, fov: 38, ocupacion: 0.72 },
};
const FOV = OPTICA.ciudad.fov;
const POLAR_ATLAS = 0.06;
const FOV_ATLAS = 26;
const POLAR_MAQUETA = { ciudad: OPTICA.ciudad.phi };
/** La fachada principal mira a su calle; la cámara arquitectónica se sitúa delante, algo de lado. */
const THETA_FACHADA: Record<string, number> = { sur: 0, este: Math.PI / 2, norte: Math.PI, oeste: -Math.PI / 2 };
/**
 * Composición asimétrica: con la ficha abierta en la esquina izquierda, el sujeto se desplaza a la
 * derecha (fracción del ancho del lienzo). Solo en pantallas apaisadas.
 */
const DESPLAZAMIENTO: Record<Foco['nivel'], number> = { ciudad: 0, barrio: 0.1, zona: 0.13, edificio: 0.15 };
const RANGO_FASE: Record<FaseObra, number> = { solar: 0, obra: 1, completo: 2 };
const MARGEN_PEANA = 3;
/** Giro inicial: tres cuartos poco diagonal, para que la ciudad llene el lienzo apaisado. */
const THETA_INICIAL = 0.4;

const suavizar = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const escalon = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export class Mundo3D {
  readonly lienzo: HTMLCanvasElement;
  private readonly renderer: WebGLRenderer;
  private readonly escena = new Scene();
  private readonly camara = new PerspectiveCamera(FOV, 1, 1, 1200);
  /** Cámara auxiliar para calcular encuadres sin mover la real. */
  private readonly sonda = new PerspectiveCamera(FOV, 1, 1, 1200);
  private readonly controles: OrbitControls;
  private readonly raycaster = new Raycaster();
  private readonly contorno = new Mesh(undefined, new MeshBasicMaterial({ color: PALETA.seleccion }));
  private modelo: ModeloCiudad;
  private estatica: Group;
  private dinamica: CapaDinamica;
  private transicion: Transicion | null = null;
  private crecimientos: { datos: DatosArquitectura; desde: number; inicio: number }[] = [];
  /** Edificios que se levantan durante la entrada cinematográfica. */
  private apariciones: { grupo: Object3D; inicio: number }[] = [];
  private finEntrada: (() => void) | null = null;
  private focoActual: Foco = { nivel: 'ciudad' };
  private distanciaCiudad = 0;
  private desplazamiento = 0;
  /** Edificios retirados para no tapar el edificio enfocado (vista en corte). */
  private ocultos = new Set<Object3D>();
  private sombrasSucias = true;
  /** Paseo con el personaje (null si no se está paseando). */
  private paseo: EstadoPaseo | null = null;
  private avatar: PartesAvatar | null = null;
  private entradaPaseo: EntradaPaseo = { x: 0, y: 0 };
  private ultimoPaseo = 0;
  private cercano: string | null = null;
  private posicionPaseo: { x: number; z: number } | null = null;
  /** El usuario ya ha girado la cámara: se respeta su orientación. */
  private girado = false;
  private contenedor: HTMLElement | null = null;
  private observador: ResizeObserver | null = null;
  private visibilidad: IntersectionObserver | null = null;
  private raf = 0;
  private sucio = true;
  private vista: VistaMundo = 'maqueta';
  private atlas = 0;
  private pulsado: { x: number; y: number } | null = null;
  private reducido: boolean;

  constructor(modelo: ModeloCiudad, private readonly opciones: OpcionesMundo3D) {
    this.modelo = modelo;
    this.reducido = opciones.movimientoReducido;
    this.renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio || 1, 2));
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.92;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFShadowMap;
    // La luz del sol es fija: el mapa de sombras solo se recalcula cuando cambia la escena
    // (estudio, crecimiento, entrada, vista en corte), nunca al mover la cámara.
    this.renderer.shadowMap.autoUpdate = false;
    // Los edificios en obra se recortan con un plano por edificio.
    this.renderer.localClippingEnabled = true;
    this.lienzo = this.renderer.domElement;
    this.lienzo.className = 'mundo-lienzo';
    this.lienzo.setAttribute('role', 'img');
    this.lienzo.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      this.opciones.alPerderContexto();
    });

    this.iluminar(modelo.lado);
    this.estatica = construirCapaEstatica(modelo);
    this.dinamica = construirCapaDinamica(modelo);
    this.escena.add(this.estatica, this.dinamica.raiz);
    this.sombraDeContacto(modelo.lado + MARGEN_PEANA * 2);

    this.contorno.visible = false;
    this.contorno.name = 'contorno-seleccion';
    this.escena.add(this.contorno);

    this.controles = new OrbitControls(this.camara, this.lienzo);
    Object.assign(this.controles, {
      enableDamping: true,
      dampingFactor: 0.08,
      minDistance: 5,
      maxDistance: 600,
      minPolarAngle: 0.02,
      maxPolarAngle: 1.3,
      screenSpacePanning: false,
    });
    this.controles.addEventListener('start', () => {
      this.transicion = null;
      this.girado = true;
    });
    this.controles.addEventListener('change', () => (this.sucio = true));
    this.escucharPuntero();

    // Encuadre inicial: toda la ciudad en tres cuartos.
    this.aplicarEncuadre({ nivel: 'ciudad' }, false);
  }

  private iluminar(lado: number): void {
    // Luz de estudio suave (reflejos en vidrio y metal) + sol de tarde que dibuja los volúmenes.
    const pmrem = new PMREMGenerator(this.renderer);
    this.escena.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.escena.environmentIntensity = 0.3;
    pmrem.dispose();
    this.escena.add(new HemisphereLight('#fff1dc', '#4a3c30', 0.4));
    // Profundidad atmosférica: lo lejano se funde con el fondo del visor.
    this.escena.fog = new Fog('#2a2521', 200, 600);
    // Sol bajo desde la izquierda de la vista inicial: fachadas con luz y sombra, sombras largas visibles.
    const sol = new DirectionalLight('#ffd9a8', 3.3);
    sol.position.set(-lado * 0.55, lado * 0.62, lado * 0.62);
    sol.castShadow = true;
    sol.shadow.mapSize.set(2048, 2048);
    const s = sol.shadow.camera;
    s.left = s.bottom = -lado * 0.6;
    s.right = s.top = lado * 0.6;
    s.near = lado * 0.3;
    s.far = lado * 2.2;
    sol.shadow.bias = -0.0003;
    sol.shadow.normalBias = 0.03;
    sol.shadow.radius = 3;
    const relleno = new DirectionalLight('#c9dcff', 0.5);
    relleno.position.set(lado * 0.7, lado * 0.3, -lado * 0.2);
    this.escena.add(sol, relleno);
  }

  /** Sombra difusa bajo la peana: la maqueta se apoya sobre algo. */
  private sombraDeContacto(lado: number): void {
    if (typeof document === 'undefined') return;
    const lienzo = document.createElement('canvas');
    lienzo.width = lienzo.height = 128;
    const ctx = lienzo.getContext('2d');
    if (!ctx) return;
    const g = ctx.createRadialGradient(64, 64, 20, 64, 64, 64);
    g.addColorStop(0, 'rgba(0,0,0,0.6)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    const sombra = new Mesh(
      new PlaneGeometry(lado * 1.7, lado * 1.7),
      new MeshBasicMaterial({ map: new CanvasTexture(lienzo), transparent: true, depthWrite: false }),
    );
    sombra.rotation.x = -Math.PI / 2;
    sombra.position.y = NIVEL.peana - 3.05;
    sombra.name = 'sombra-contacto';
    this.escena.add(sombra);
  }

  /* ------------------------------------------------------------ ciclo de vida */

  montarEn(contenedor: HTMLElement): void {
    this.contenedor = contenedor;
    contenedor.prepend(this.lienzo);
    this.observador?.disconnect();
    this.observador = new ResizeObserver(() => this.ajustarTamano());
    this.observador.observe(contenedor);
    this.ajustarTamano();
    // Fuera de pantalla no se dibuja nada.
    this.visibilidad?.disconnect();
    this.visibilidad = new IntersectionObserver(([entrada]) => {
      if (entrada?.isIntersecting) this.arrancar();
      else this.parar();
    });
    this.visibilidad.observe(contenedor);
    this.arrancar();
  }

  desmontar(): void {
    this.parar();
    this.observador?.disconnect();
    this.observador = null;
    this.visibilidad?.disconnect();
    this.visibilidad = null;
    this.lienzo.remove();
    this.contenedor = null;
  }

  destruir(): void {
    this.desmontar();
    this.controles.dispose();
    liberar(this.estatica);
    liberar(this.dinamica.raiz);
    this.renderer.dispose();
  }

  /**
   * Control de cámara del usuario. En la portada está desactivado: la rueda y el gesto táctil
   * desplazan la página (hacia el bloque del tema) en lugar de mover la cámara.
   */
  set exploracion(activa: boolean) {
    this.controles.enabled = activa;
    this.lienzo.style.touchAction = activa ? 'none' : 'pan-y';
  }

  set movimientoReducido(valor: boolean) {
    this.reducido = valor;
    this.sucio = true;
  }

  private arrancar(): void {
    if (!this.raf) {
      this.sucio = true;
      this.raf = requestAnimationFrame(this.fotograma);
    }
  }

  private parar(): void {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  private ajustarTamano(): void {
    if (!this.contenedor) return;
    const { clientWidth: w, clientHeight: h } = this.contenedor;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camara.aspect = w / h;
    this.camara.updateProjectionMatrix();
    this.distanciaCiudad = 0;
    // Al cambiar el tamaño (girar el móvil, redimensionar) se reencuadra lo que se estaba viendo.
    if (!this.transicion) this.aplicarEncuadre(this.focoActual, false);
    this.sucio = true;
  }

  /* ------------------------------------------------------------ estado */

  /** Aplica un modelo nuevo (p. ej. tras estudiar). Los edificios que suben de fase crecen. */
  actualizar(modelo: ModeloCiudad): void {
    const anteriores = new Map(this.modelo.edificios.map((e) => [e.conceptoId, e.fase]));
    this.modelo = modelo;
    this.escena.remove(this.dinamica.raiz);
    liberar(this.dinamica.raiz);
    this.dinamica = construirCapaDinamica(modelo);
    this.escena.add(this.dinamica.raiz);
    this.ocultos = new Set();
    this.sombrasSucias = true;
    this.ajustarSenales();

    if (!this.reducido) {
      const ahora = performance.now();
      for (const e of modelo.edificios) {
        const antes = anteriores.get(e.conceptoId);
        if (antes === undefined || RANGO_FASE[e.fase] <= RANGO_FASE[antes]) continue;
        const datos = datosArquitectura(this.dinamica.edificios.get(e.conceptoId)!);
        if (!datos) continue;
        // Se construye desde donde estaba: el plano de corte sube hasta la fase nueva.
        const desde = NIVEL.lote + datos.principal.h * CONSTRUIDO_POR_FASE[antes];
        datos.fijarCorte(desde);
        this.crecimientos.push({ datos, desde, inicio: ahora });
      }
    }
    this.aplicarAtlas();
    this.sucio = true;
  }

  /**
   * Entrada de la primera visita: la cámara desciende sobre la peana mientras los barrios se
   * levantan uno tras otro. Devuelve una función para saltarla (deja la escena en su estado final).
   */
  entrada(alTerminar: () => void): () => void {
    const ahora = performance.now();
    const foco: Foco = { nivel: 'ciudad' };
    this.focoActual = foco;
    this.vista = 'maqueta';
    this.contorno.visible = false;
    const objetivo = this.objetivoFoco(foco);
    const theta = this.thetaInicial();
    const final = new Spherical(this.distanciaAjustada(foco, objetivo, OPTICA.ciudad.phi, theta, OPTICA.ciudad.fov), OPTICA.ciudad.phi, theta);
    const inicio = new Spherical(final.radius * 2.3, 0.2, theta - 0.85);
    this.camara.fov = 24;
    this.fijarDesplazamiento(0);
    this.colocarCamara(objetivo, inicio);
    this.transicion = {
      inicio: ahora + 700, duracion: 5600, desdeObjetivo: objetivo.clone(), haciaObjetivo: objetivo,
      desde: inicio, hacia: final, fovDesde: 24, fovHacia: OPTICA.ciudad.fov, desplazamientoDesde: 0, desplazamientoHacia: 0, arco: 0,
    };
    const orden = new Map(this.modelo.barrios.map((b, i) => [b.grupoId, i]));
    this.apariciones = this.modelo.edificios.map((e, k) => {
      const grupo = this.dinamica.edificios.get(e.conceptoId)!;
      grupo.scale.y = 0.0001;
      return { grupo, inicio: ahora + 1700 + (orden.get(e.grupoId) ?? 0) * 750 + (k % 7) * 110 };
    });
    let terminado = false;
    const terminar = () => {
      if (terminado) return;
      terminado = true;
      this.finEntrada = null;
      alTerminar();
    };
    this.finEntrada = terminar;
    this.sucio = true;
    return () => {
      for (const a of this.apariciones) a.grupo.scale.y = 1;
      this.apariciones = [];
      this.sombrasSucias = true;
      this.transicion = null;
      this.camara.fov = OPTICA.ciudad.fov;
      this.camara.updateProjectionMatrix();
      this.colocarCamara(objetivo, final);
      terminar();
    };
  }

  /**
   * Vista en corte: en el plano de edificio se retiran los edificios que se interponen entre la
   * cámara y el foco (como las paredes en un juego de gestión). Se restauran al cambiar de foco.
   */
  private despejarVista(): void {
    const nuevos = new Set<Object3D>();
    const foco = this.focoActual;
    let objetivo: Object3D | undefined;
    let puntos: Vector3[] = [];
    if (this.paseo) {
      // Paseando: nada tapa al personaje.
      const { x, z } = this.paseo.posicion;
      puntos = [new Vector3(x, 0.9, z), new Vector3(x, 1.6, z), new Vector3(x, 0.3, z)];
    } else if (foco.nivel === 'edificio') {
      objetivo = this.dinamica.edificios.get(foco.conceptoId);
      const e = buscarEdificio(this.modelo, foco.conceptoId);
      if (objetivo && e) {
        const cima = this.cimaEdificio(e.conceptoId);
        puntos = [
          new Vector3(e.posicion.x, cima * 0.5, e.posicion.z),
          new Vector3(e.posicion.x, cima * 0.15, e.posicion.z),
          new Vector3(e.lote.x, cima * 0.4, e.lote.z),
          new Vector3(e.lote.x + e.lote.ancho, cima * 0.4, e.lote.z + e.lote.fondo),
          new Vector3(e.lote.x + e.lote.ancho, cima * 0.4, e.lote.z),
          new Vector3(e.lote.x, cima * 0.4, e.lote.z + e.lote.fondo),
        ];
      }
    }
    if (puntos.length) {
      const origen = this.camara.position;
      const candidatos = [...this.dinamica.edificios.values()].filter((g) => g !== objetivo);
      for (const p of puntos) {
        const dir = p.clone().sub(origen);
        const distancia = dir.length();
        this.raycaster.set(origen, dir.normalize());
        this.raycaster.far = distancia - 0.5;
        for (const impacto of this.raycaster.intersectObjects(candidatos, true)) {
          for (let o: Object3D | null = impacto.object; o; o = o.parent) {
            if (o.userData.tipo === 'edificio') {
              nuevos.add(o);
              break;
            }
          }
        }
      }
      this.raycaster.far = Infinity;
    }
    const cambia = nuevos.size !== this.ocultos.size || [...nuevos].some((g) => !this.ocultos.has(g));
    for (const g of this.ocultos) if (!nuevos.has(g)) g.visible = true;
    for (const g of nuevos) g.visible = false;
    this.ocultos = nuevos;
    if (cambia) this.sombrasSucias = true;
  }

  /** Las columnas de luz orientan a escala de ciudad y barrio; de cerca solo queda el halo. */
  private ajustarSenales(): void {
    const lejos = this.focoActual.nivel === 'ciudad' || this.focoActual.nivel === 'barrio';
    for (const g of this.dinamica.senales) {
      const columna = g.getObjectByName('senal-columna');
      if (columna) columna.visible = lejos;
    }
  }

  private animarApariciones(ahora: number): boolean {
    if (!this.apariciones.length) {
      if (this.finEntrada && !this.transicion) this.finEntrada();
      return false;
    }
    this.apariciones = this.apariciones.filter(({ grupo, inicio }) => {
      const t = Math.min(1, Math.max(0, (ahora - inicio) / 950));
      grupo.scale.y = Math.max(0.0001, 1 - (1 - t) ** 3);
      return t < 1;
    });
    this.sombrasSucias = true;
    return true;
  }

  enfocar(foco: Foco, vista: VistaMundo, animar: boolean): void {
    if (this.paseo) {
      this.posicionPaseo = { ...this.paseo.posicion };
      this.paseo = null;
      if (this.avatar) this.escena.remove(this.avatar.raiz);
      Object.assign(this.controles, { enablePan: true, minDistance: 5, maxDistance: 600, maxPolarAngle: 1.3 });
      this.sombrasSucias = true;
    }
    this.vista = vista;
    this.focoActual = foco;
    this.ajustarSenales();
    this.aplicarEncuadre(foco, animar && !this.reducido);
    this.marcarContorno(foco);
    this.sucio = true;
  }

  /* ------------------------------------------------------------ paseo */

  get paseando(): boolean {
    return this.paseo !== null;
  }

  /**
   * Paseo en tercera persona: aparece el personaje (donde se dejó, o en una plaza) y la cámara lo
   * sigue. El usuario puede girarla alrededor de él; el teclado lo mueve (ver `fijarEntradaPaseo`).
   */
  iniciarPaseo(): void {
    if (this.paseo) return;
    this.avatar ??= construirAvatar();
    const inicio = this.posicionPaseo ?? puntoDeSalida(this.modelo);
    const giro = this.girado ? new Spherical().setFromVector3(this.camara.position.clone().sub(this.controles.target)).theta : 0.35;
    // Al aparecer mira a la cámara: se presenta antes de echar a andar.
    this.paseo = { posicion: { ...inicio }, rumbo: giro, velocidad: 0 };
    this.avatar.raiz.position.set(inicio.x, this.sueloEn(inicio.x, inicio.z), inicio.z);
    this.avatar.raiz.rotation.y = this.paseo.rumbo;
    this.escena.add(this.avatar.raiz);
    this.contorno.visible = false;
    this.vista = 'maqueta';
    Object.assign(this.controles, { enablePan: false, minDistance: 4, maxDistance: 40, maxPolarAngle: 1.35 });
    this.exploracion = true;
    const objetivo = new Vector3(inicio.x, 1.1, inicio.z);
    const hacia = new Spherical(11, 1.1, giro);
    this.camara.fov = 42;
    this.fijarDesplazamiento(0);
    this.transicion = null;
    this.colocarCamara(objetivo, hacia);
    this.ultimoPaseo = performance.now();
    this.cercano = null;
    this.sombrasSucias = true;
  }

  terminarPaseo(): void {
    if (!this.paseo) return;
    this.posicionPaseo = { ...this.paseo.posicion };
    this.paseo = null;
    this.entradaPaseo = { x: 0, y: 0 };
    if (this.avatar) this.escena.remove(this.avatar.raiz);
    Object.assign(this.controles, { enablePan: true, minDistance: 5, maxDistance: 600, maxPolarAngle: 1.3 });
    this.cercano = null;
    this.opciones.alAcercarse?.(null);
    this.sombrasSucias = true;
    this.aplicarEncuadre(this.focoActual, !this.reducido);
  }

  /** Dirección pedida por el teclado: x = derecha, y = adelante (cada una −1, 0 o 1). */
  fijarEntradaPaseo(entrada: EntradaPaseo): void {
    this.entradaPaseo = entrada;
    if (entrada.x || entrada.y) this.arrancar();
  }

  /** Altura del suelo: aceras y manzanas están algo por encima de la calzada. */
  private sueloEn(x: number, z: number): number {
    return this.modelo.zonas.some((zona) => {
      const r = zona.parcela;
      return x >= r.x && x <= r.x + r.ancho && z >= r.z && z <= r.z + r.fondo;
    })
      ? NIVEL.lote
      : NIVEL.calle;
  }

  private avanzarPaseoFotograma(ahora: number): boolean {
    const paseo = this.paseo;
    const avatar = this.avatar;
    if (!paseo || !avatar) return false;
    const dt = Math.min(0.05, (ahora - this.ultimoPaseo) / 1000);
    this.ultimoPaseo = ahora;
    if (!paseo.velocidad && !this.entradaPaseo.x && !this.entradaPaseo.y) return false;
    const angulo = new Spherical().setFromVector3(this.camara.position.clone().sub(this.controles.target)).theta;
    const lado = this.modelo.lado;
    const nuevo = avanzarPaseo(paseo, this.entradaPaseo, angulo, dt, obstaculosDe(this.modelo), { x: -lado / 2, z: -lado / 2, ancho: lado, fondo: lado });
    const dx = nuevo.posicion.x - paseo.posicion.x;
    const dz = nuevo.posicion.z - paseo.posicion.z;
    this.paseo = nuevo;
    // La cámara acompaña al personaje conservando su giro.
    this.camara.position.x += dx;
    this.camara.position.z += dz;
    this.controles.target.x += dx;
    this.controles.target.z += dz;
    const y = this.sueloEn(nuevo.posicion.x, nuevo.posicion.z);
    avatar.raiz.position.set(nuevo.posicion.x, avatar.raiz.position.y + (y - avatar.raiz.position.y) * Math.min(1, dt * 14), nuevo.posicion.z);
    avatar.raiz.rotation.y = nuevo.rumbo;
    animarAvatar(avatar, ahora / 1000, nuevo.velocidad, this.reducido);
    const cerca = edificioCercano(nuevo.posicion, obstaculosDe(this.modelo));
    if (cerca !== this.cercano) {
      this.cercano = cerca;
      this.opciones.alAcercarse?.(cerca);
    }
    this.sombrasSucias = true;
    return true;
  }

  /** 0 = maqueta, 1 = lectura de mapa (vista cenital o cámara muy alejada). */
  get factorAtlas(): number {
    return this.atlas;
  }

  /** Posición en pantalla (px CSS, relativa al lienzo) del punto de anclaje de un foco. */
  proyectarFoco(foco: Foco): PuntoPantalla {
    const p = this.anclaje(foco);
    p.project(this.camara);
    const w = this.lienzo.clientWidth;
    const h = this.lienzo.clientHeight;
    const visible = p.z > -1 && p.z < 1 && Math.abs(p.x) <= 1.05 && Math.abs(p.y) <= 1.05;
    return { x: ((p.x + 1) / 2) * w, y: ((1 - p.y) / 2) * h, visible };
  }

  private cimaEdificio(conceptoId: string): number {
    const g = this.dinamica.edificios.get(conceptoId);
    return (g && datosArquitectura(g)?.cima) ?? NIVEL.lote;
  }

  private cimaZona(seccionId: string): number {
    const z = buscarZona(this.modelo, seccionId);
    return Math.max(NIVEL.lote, ...(z?.conceptoIds ?? []).map((id) => this.cimaEdificio(id)));
  }

  private anclaje(foco: Foco): Vector3 {
    if (foco.nivel === 'edificio') {
      const e = buscarEdificio(this.modelo, foco.conceptoId);
      if (e) return new Vector3(e.posicion.x, this.cimaEdificio(e.conceptoId) + 0.9, e.posicion.z);
    }
    if (foco.nivel === 'zona') {
      const z = buscarZona(this.modelo, foco.seccionId);
      if (z) return new Vector3(z.parcela.x + z.parcela.ancho / 2, this.cimaZona(z.seccionId) + 1.2, z.parcela.z + z.parcela.fondo / 2);
    }
    if (foco.nivel === 'barrio') {
      // Nombre de distrito "escrito" en el centro del barrio, como en un plano.
      const b = buscarBarrio(this.modelo, foco.grupoId);
      if (b) return new Vector3(b.parcela.x + b.parcela.ancho / 2, NIVEL.acera + 0.4, b.parcela.z + b.parcela.fondo / 2);
    }
    const r = rectFoco(this.modelo, foco);
    return new Vector3(r.x + r.ancho / 2, NIVEL.lote, r.z + r.fondo / 2);
  }

  /* ------------------------------------------------------------ cámara */

  /** Rectángulo y altura que hay que ver enteros para cada foco. */
  private volumenFoco(foco: Foco): { r: Rect; alto: number } {
    switch (foco.nivel) {
      case 'ciudad':
        return { r: encoger(rectFoco(this.modelo, foco), -MARGEN_PEANA), alto: 6 };
      case 'barrio': {
        const b = buscarBarrio(this.modelo, foco.grupoId);
        return { r: rectFoco(this.modelo, foco), alto: b ? Math.max(...b.seccionIds.map((id) => this.cimaZona(id))) * 0.6 : 4 };
      }
      case 'zona':
        return { r: rectFoco(this.modelo, foco), alto: this.cimaZona(foco.seccionId) * 0.8 };
      case 'edificio': {
        const e = buscarEdificio(this.modelo, foco.conceptoId);
        return e ? { r: encoger(e.lote, -0.6), alto: this.cimaEdificio(e.conceptoId) } : { r: rectFoco(this.modelo, foco), alto: 4 };
      }
    }
  }

  /**
   * Distancia mínima a la que el volumen del foco cabe en el lienzo con esta orientación: se
   * proyectan sus esquinas reales en vez de usar una esfera envolvente (que dejaba la ciudad
   * pequeña y rodeada de vacío).
   */
  private distanciaAjustada(foco: Foco, objetivo: Vector3, phi: number, theta: number, fov = OPTICA[foco.nivel].fov): number {
    const { r, alto } = this.volumenFoco(foco);
    const esquinas: Vector3[] = [];
    for (const x of [r.x, r.x + r.ancho]) for (const z of [r.z, r.z + r.fondo]) for (const y of [NIVEL.peana, alto]) esquinas.push(new Vector3(x, y, z));
    this.sonda.aspect = this.camara.aspect || 1;
    this.sonda.fov = fov;
    this.sonda.updateProjectionMatrix();
    const limite = OPTICA[foco.nivel].ocupacion;
    const cabe = (d: number) => {
      this.sonda.position.setFromSpherical(new Spherical(d, phi, theta)).add(objetivo);
      this.sonda.lookAt(objetivo);
      this.sonda.updateMatrixWorld();
      return esquinas.every((p) => {
        const q = p.clone().project(this.sonda);
        return q.z < 1 && Math.abs(q.x) <= limite && Math.abs(q.y) <= limite;
      });
    };
    let [cerca, lejos] = [2, 2000];
    for (let i = 0; i < 28; i++) {
      const medio = (cerca + lejos) / 2;
      if (cabe(medio)) lejos = medio;
      else cerca = medio;
    }
    return lejos;
  }

  /** En vertical (móvil) la vista es casi frontal: el cuadrado de la ciudad aprovecha el ancho. */
  private thetaInicial(): number {
    return (this.camara.aspect || 1) < 0.9 ? 0.1 : THETA_INICIAL;
  }

  private objetivoFoco(foco: Foco): Vector3 {
    const { r, alto } = this.volumenFoco(foco);
    const y = foco.nivel === 'ciudad' ? 0 : foco.nivel === 'edificio' ? alto * 0.42 : alto * 0.3;
    return new Vector3(r.x + r.ancho / 2, y, r.z + r.fondo / 2);
  }

  private aplicarEncuadre(foco: Foco, animar: boolean, duracion = 1100): void {
    const actual = new Spherical().setFromVector3(this.camara.position.clone().sub(this.controles.target));
    const optica = OPTICA[foco.nivel];
    const vertical = (this.camara.aspect || 1) < 0.9;
    let theta = this.girado && actual.radius > 0 ? actual.theta : this.thetaInicial();
    let phi = optica.phi * (vertical && foco.nivel === 'ciudad' ? 0.85 : 1);
    let fov = optica.fov;
    if (this.vista === 'atlas') {
      // El Atlas se lee como un mapa orientado.
      theta = 0;
      phi = POLAR_ATLAS;
      fov = FOV_ATLAS;
    } else if (foco.nivel === 'edificio') {
      const e = buscarEdificio(this.modelo, foco.conceptoId);
      if (e) theta = THETA_FACHADA[e.frente]! + 0.42;
    }
    const haciaObjetivo = this.objetivoFoco(foco);
    const hacia = new Spherical(this.distanciaAjustada(foco, haciaObjetivo, phi, theta, fov), phi, theta);
    const desplazamiento = this.vista === 'atlas' || (this.camara.aspect || 1) < 1.1 ? 0 : DESPLAZAMIENTO[foco.nivel];

    if (!animar || actual.radius === 0) {
      this.transicion = null;
      this.camara.fov = fov;
      this.fijarDesplazamiento(desplazamiento);
      this.colocarCamara(haciaObjetivo, hacia);
      return;
    }
    // Giro por el camino corto.
    let dTheta = hacia.theta - actual.theta;
    dTheta = Math.atan2(Math.sin(dTheta), Math.cos(dTheta));
    hacia.theta = actual.theta + dTheta;
    const recorrido = this.controles.target.distanceTo(haciaObjetivo);
    this.transicion = {
      inicio: performance.now(),
      duracion,
      desdeObjetivo: this.controles.target.clone(),
      haciaObjetivo,
      desde: actual,
      hacia,
      fovDesde: this.camara.fov,
      fovHacia: fov,
      desplazamientoDesde: this.desplazamiento,
      desplazamientoHacia: desplazamiento,
      arco: Math.min(70, recorrido * 0.35),
    };
  }

  /** Desplaza el centro óptico (en fracción del ancho) y actualiza la proyección. */
  private fijarDesplazamiento(fraccion: number): void {
    this.desplazamiento = fraccion;
    const w = this.lienzo.clientWidth || 1;
    const h = this.lienzo.clientHeight || 1;
    if (fraccion) this.camara.setViewOffset(w, h, -fraccion * w, 0, w, h);
    else this.camara.clearViewOffset();
    this.camara.updateProjectionMatrix();
  }

  private colocarCamara(objetivo: Vector3, s: Spherical): void {
    this.controles.target.copy(objetivo);
    this.camara.position.setFromSpherical(s).add(objetivo);
    this.camara.lookAt(objetivo);
    this.sucio = true;
  }

  private avanzarTransicion(ahora: number): boolean {
    const tr = this.transicion;
    if (!tr) return false;
    const t = Math.min(1, Math.max(0, (ahora - tr.inicio) / tr.duracion));
    const k = suavizar(t);
    const objetivo = tr.desdeObjetivo.clone().lerp(tr.haciaObjetivo, k);
    const s = new Spherical(
      tr.desde.radius + (tr.hacia.radius - tr.desde.radius) * k + Math.sin(Math.PI * k) * tr.arco,
      tr.desde.phi + (tr.hacia.phi - tr.desde.phi) * k,
      tr.desde.theta + (tr.hacia.theta - tr.desde.theta) * k,
    );
    this.camara.fov = tr.fovDesde + (tr.fovHacia - tr.fovDesde) * k;
    this.fijarDesplazamiento(tr.desplazamientoDesde + (tr.desplazamientoHacia - tr.desplazamientoDesde) * k);
    this.colocarCamara(objetivo, s);
    if (t >= 1) this.transicion = null;
    return true;
  }

  /** Marco blanco a ras de suelo alrededor del lote, la zona o el barrio enfocado. */
  private marcarContorno(foco: Foco): void {
    let r: Rect | null = null;
    if (foco.nivel === 'barrio' || foco.nivel === 'zona') r = encoger(rectFoco(this.modelo, foco), -0.35);
    if (foco.nivel === 'edificio') {
      const e = buscarEdificio(this.modelo, foco.conceptoId);
      if (e) r = encoger(e.lote, -0.3);
    }
    this.contorno.visible = Boolean(r);
    if (!r) return;
    const y = foco.nivel === 'barrio' ? NIVEL.calle + 0.02 : NIVEL.acera + 0.06;
    const g = 0.18;
    const piezas = [
      new BoxGeometry(r.ancho, 0.06, g).translate(r.x + r.ancho / 2, y, r.z),
      new BoxGeometry(r.ancho, 0.06, g).translate(r.x + r.ancho / 2, y, r.z + r.fondo),
      new BoxGeometry(g, 0.06, r.fondo).translate(r.x, y, r.z + r.fondo / 2),
      new BoxGeometry(g, 0.06, r.fondo).translate(r.x + r.ancho, y, r.z + r.fondo / 2),
    ];
    this.contorno.geometry.dispose();
    this.contorno.geometry = unir(piezas)!;
  }

  /** Cuanto más lejos o más cenital está la cámara, más se lee la ciudad como mapa de dominio. */
  private aplicarAtlas(): void {
    if (!this.distanciaCiudad) {
      const foco: Foco = { nivel: 'ciudad' };
      this.distanciaCiudad = this.distanciaAjustada(foco, this.objetivoFoco(foco), POLAR_MAQUETA.ciudad, this.thetaInicial(), OPTICA.ciudad.fov);
    }
    const s = new Spherical().setFromVector3(this.camara.position.clone().sub(this.controles.target));
    // Alejarse más allá de la vista general convierte la ciudad en mapa (solo con óptica normal:
    // el teleobjetivo del barrio también aleja la cámara y no debe activarlo).
    const optica = Math.abs(this.camara.fov - OPTICA.ciudad.fov) < 1;
    const porDistancia = optica ? escalon(this.distanciaCiudad * 1.15, this.distanciaCiudad * 1.5, s.radius) : 0;
    const porAltura = escalon(0.45, 0.15, s.phi);
    this.atlas = Math.max(porDistancia, porAltura);
    for (const plano of this.dinamica.calor) {
      plano.visible = this.atlas > 0.01;
      (plano.material as MeshBasicMaterial).opacity = this.atlas * 0.62;
    }
  }

  /**
   * Plano cercano y lejano ajustados a la distancia real: con un plano cercano fijo y pequeño la
   * precisión de profundidad no alcanzaba a separar superficies próximas (parpadeo al orbitar).
   */
  private ajustarProfundidad(): void {
    const d = this.camara.position.distanceTo(this.controles.target);
    if (this.escena.fog instanceof Fog) {
      this.escena.fog.near = d * 0.95;
      this.escena.fog.far = d * 2.8;
    }
    const near = Math.min(40, Math.max(0.2, d * 0.04));
    const far = d * 3 + this.modelo.lado * 2;
    if (Math.abs(near - this.camara.near) / this.camara.near > 0.05 || Math.abs(far - this.camara.far) / this.camara.far > 0.05) {
      this.camara.near = near;
      this.camara.far = far;
      this.camara.updateProjectionMatrix();
    }
  }

  /* ------------------------------------------------------------ bucle */

  private fotograma = (ahora: number): void => {
    this.raf = requestAnimationFrame(this.fotograma);
    let cambio = this.avanzarTransicion(ahora);
    cambio = this.avanzarPaseoFotograma(ahora) || cambio;
    cambio = this.controles.update() || cambio;
    cambio = this.animarCrecimientos(ahora) || cambio;
    cambio = this.animarApariciones(ahora) || cambio;
    if (!this.reducido) cambio = this.animarAmbiente(ahora / 1000) || cambio;
    if (!cambio && !this.sucio) return;
    this.despejarVista();
    this.ajustarProfundidad();
    this.aplicarAtlas();
    if (this.sombrasSucias) {
      this.renderer.shadowMap.needsUpdate = true;
      this.sombrasSucias = false;
    }
    this.renderer.render(this.escena, this.camara);
    this.sucio = false;
    this.opciones.alFotograma();
  };

  private animarCrecimientos(ahora: number): boolean {
    if (!this.crecimientos.length) return false;
    this.crecimientos = this.crecimientos.filter(({ datos, desde, inicio }) => {
      const t = Math.min(1, (ahora - inicio) / 1600);
      const k = 1 - (1 - t) ** 3;
      datos.fijarCorte(desde + (datos.corteFase - desde) * k);
      return t < 1;
    });
    this.sombrasSucias = true;
    return true;
  }

  /**
   * Animaciones ambientales con significado: tráfico y peatones de las zonas que se estudian. La
   * columna de "Estudia ya" es luz quieta. Nada parpadea. Todo desaparece con prefers-reduced-motion.
   */
  private animarAmbiente(t: number): boolean {
    const { coches, rutas, peatones, rutasPeatones } = this.dinamica;
    if (coches) colocarCoches(coches, rutas, t);
    if (peatones) colocarEnRecorrido(peatones, rutasPeatones, t, NIVEL.acera);
    return Boolean(coches || peatones);
  }

  /* ------------------------------------------------------------ puntero */

  private escucharPuntero(): void {
    const l = this.lienzo;
    l.addEventListener('pointerdown', (e) => (this.pulsado = { x: e.clientX, y: e.clientY }));
    l.addEventListener('pointerup', (e) => {
      const p = this.pulsado;
      this.pulsado = null;
      // Si ha arrastrado, era un giro de cámara, no un clic.
      if (!p || Math.hypot(e.clientX - p.x, e.clientY - p.y) > 6) return;
      const seleccion = this.tocar(e);
      if (seleccion) this.opciones.alSeleccionar(seleccion);
    });
    let pendiente = false;
    l.addEventListener('pointermove', (e) => {
      if (pendiente || e.buttons) return;
      pendiente = true;
      requestAnimationFrame(() => {
        pendiente = false;
        const s = this.tocar(e);
        l.style.cursor = s ? 'pointer' : '';
        this.opciones.alSobrevolar(s);
      });
    });
    l.addEventListener('pointerleave', () => this.opciones.alSobrevolar(null));
  }

  private tocar(e: PointerEvent): DatosSeleccionables | null {
    const caja = this.lienzo.getBoundingClientRect();
    const ndc = new Vector2(((e.clientX - caja.left) / caja.width) * 2 - 1, -((e.clientY - caja.top) / caja.height) * 2 + 1);
    this.raycaster.setFromCamera(ndc, this.camara);
    const impactos = this.raycaster.intersectObjects([this.dinamica.raiz, this.estatica], true);
    for (const impacto of impactos) {
      if (!impacto.object.visible || impacto.object.name.startsWith('calor-') || impacto.object.name.startsWith('senal-')) continue;
      let oculto = false;
      for (let o: Object3D | null = impacto.object; o; o = o.parent) if (!o.visible) oculto = true;
      if (oculto) continue;
      for (let o: Object3D | null = impacto.object; o; o = o.parent) {
        const datos = o.userData as Partial<DatosSeleccionables>;
        if (datos.tipo === 'edificio' || datos.tipo === 'zona') return datos as DatosSeleccionables;
      }
    }
    return null;
  }
}
