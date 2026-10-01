import {
  ACESFilmicToneMapping,
  BufferGeometry,
  DirectionalLight,
  Float32BufferAttribute,
  type Group,
  HemisphereLight,
  LineBasicMaterial,
  LineLoop,
  type Mesh,
  type MeshBasicMaterial,
  type Object3D,
  PCFShadowMap,
  PerspectiveCamera,
  Raycaster,
  Scene,
  Spherical,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { FaseObra, ModeloCiudad } from '../../world/cityModel.ts';
import { buscarEdificio, buscarZona, encuadre, type Foco, rectFoco } from '../../world/focus.ts';
import type { Rect } from '../../world/geometry.ts';
import {
  ALTURA_POR_FASE,
  type CapaDinamica,
  colocarCoches,
  construirCapaDinamica,
  construirCapaEstatica,
  type DatosSeleccionables,
  liberar,
} from './builders.ts';
import { ALTO_ZONA, PALETA } from './palette.ts';

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
}

const FOV = 35;
const POLAR_MAQUETA: Record<Foco['nivel'], number> = { ciudad: 0.92, barrio: 0.88, zona: 0.85, edificio: 1.02 };
const POLAR_ATLAS = 0.06;
/** El encuadre usa la esfera que envuelve el foco; en planos amplios se puede apretar más. */
const APROXIMACION: Record<Foco['nivel'], number> = { ciudad: 0.78, barrio: 0.9, zona: 0.95, edificio: 1 };
const RANGO_FASE: Record<FaseObra, number> = { solar: 0, obra: 1, completo: 2 };

const suavizar = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const escalon = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export class Mundo3D {
  readonly lienzo: HTMLCanvasElement;
  private readonly renderer: WebGLRenderer;
  private readonly escena = new Scene();
  private readonly camara = new PerspectiveCamera(FOV, 1, 0.5, 1200);
  private readonly controles: OrbitControls;
  private readonly raycaster = new Raycaster();
  private readonly contorno: LineLoop;
  private modelo: ModeloCiudad;
  private estatica: Group;
  private dinamica: CapaDinamica;
  private transicion: Transicion | null = null;
  private crecimientos: { grupo: Object3D; inicio: number }[] = [];
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
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFShadowMap;
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

    this.contorno = new LineLoop(new BufferGeometry(), new LineBasicMaterial({ color: PALETA.seleccion }));
    this.contorno.visible = false;
    this.escena.add(this.contorno);

    this.controles = new OrbitControls(this.camara, this.lienzo);
    Object.assign(this.controles, {
      enableDamping: true,
      dampingFactor: 0.08,
      minDistance: 6,
      maxDistance: 520,
      minPolarAngle: 0.02,
      maxPolarAngle: 1.3,
      screenSpacePanning: false,
    });
    this.controles.addEventListener('start', () => (this.transicion = null));
    this.controles.addEventListener('change', () => (this.sucio = true));
    this.raycaster.params.Line = { threshold: 0.15 };
    this.escucharPuntero();

    // Encuadre inicial: toda la ciudad en tres cuartos.
    this.aplicarEncuadre({ nivel: 'ciudad' }, false);
  }

  private iluminar(lado: number): void {
    this.escena.add(new HemisphereLight('#fff4e2', '#5d4a38', 1.15));
    const sol = new DirectionalLight('#ffe1b5', 2.6);
    sol.position.set(lado * 0.45, lado * 0.8, lado * 0.3);
    sol.castShadow = true;
    sol.shadow.mapSize.set(2048, 2048);
    const s = sol.shadow.camera;
    s.left = s.bottom = -lado * 0.62;
    s.right = s.top = lado * 0.62;
    s.near = 1;
    s.far = lado * 2.5;
    sol.shadow.bias = -0.0004;
    sol.shadow.normalBias = 0.04;
    const relleno = new DirectionalLight('#c6d8ff', 0.45);
    relleno.position.set(-lado * 0.5, lado * 0.4, -lado * 0.6);
    this.escena.add(sol, relleno);
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

    if (!this.reducido) {
      const ahora = performance.now();
      for (const e of modelo.edificios) {
        const antes = anteriores.get(e.conceptoId);
        if (antes === undefined || RANGO_FASE[e.fase] <= RANGO_FASE[antes]) continue;
        const grupo = this.dinamica.edificios.get(e.conceptoId);
        if (!grupo) continue;
        grupo.scale.y = Math.max(0.05, ALTURA_POR_FASE[antes] / ALTURA_POR_FASE[e.fase]);
        this.crecimientos.push({ grupo, inicio: ahora });
      }
    }
    this.aplicarAtlas();
    this.sucio = true;
  }

  enfocar(foco: Foco, vista: VistaMundo, animar: boolean): void {
    this.vista = vista;
    this.aplicarEncuadre(foco, animar && !this.reducido);
    this.marcarContorno(foco);
    this.sucio = true;
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

  private anclaje(foco: Foco): Vector3 {
    if (foco.nivel === 'edificio') {
      const e = buscarEdificio(this.modelo, foco.conceptoId);
      if (e) return new Vector3(e.posicion.x, ALTO_ZONA + Math.max(e.alturaCompleta * ALTURA_POR_FASE[e.fase], 0.6) + 0.8, e.posicion.z);
    }
    if (foco.nivel === 'zona') {
      const z = buscarZona(this.modelo, foco.seccionId);
      if (z) return new Vector3(z.parcela.x + z.parcela.ancho / 2, ALTO_ZONA + 0.2, z.parcela.z + z.parcela.fondo / 2);
    }
    const r = rectFoco(this.modelo, foco);
    return new Vector3(r.x + r.ancho / 2, ALTO_ZONA, r.z + r.fondo / 2);
  }

  /* ------------------------------------------------------------ cámara */

  private aplicarEncuadre(foco: Foco, animar: boolean): void {
    const { centro, radio } = encuadre(this.modelo, foco);
    // En vertical (móvil) no se aprieta: la ciudad debe caber entera a lo ancho.
    const aproximacion = (this.camara.aspect || 1) >= 1 ? APROXIMACION[foco.nivel] : 1;
    const distancia = this.distanciaParaVer(radio) * aproximacion;

    const actual = new Spherical().setFromVector3(this.camara.position.clone().sub(this.controles.target));
    // El Atlas se lee como un mapa orientado; la maqueta conserva el giro del usuario.
    const theta = this.vista === 'atlas' ? 0 : actual.radius > 0 ? actual.theta : 0.7;
    const hacia = new Spherical(distancia, this.vista === 'atlas' ? POLAR_ATLAS : POLAR_MAQUETA[foco.nivel], theta);
    const haciaObjetivo = new Vector3(centro.x, centro.y, centro.z);

    if (!animar || actual.radius === 0) {
      this.transicion = null;
      this.colocarCamara(haciaObjetivo, hacia);
      return;
    }
    this.transicion = {
      inicio: performance.now(),
      duracion: 900,
      desdeObjetivo: this.controles.target.clone(),
      haciaObjetivo,
      desde: actual,
      hacia,
    };
  }

  /** Distancia a la que una esfera de `radio` cabe entera en pantalla con el aspecto actual. */
  private distanciaParaVer(radio: number): number {
    const medioFov = (FOV * Math.PI) / 360;
    const medioFovHorizontal = Math.atan(Math.tan(medioFov) * (this.camara.aspect || 1));
    return radio / Math.sin(Math.min(medioFov, medioFovHorizontal));
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
    const t = Math.min(1, (ahora - tr.inicio) / tr.duracion);
    const k = suavizar(t);
    const objetivo = tr.desdeObjetivo.clone().lerp(tr.haciaObjetivo, k);
    const s = new Spherical(
      tr.desde.radius + (tr.hacia.radius - tr.desde.radius) * k,
      tr.desde.phi + (tr.hacia.phi - tr.desde.phi) * k,
      tr.desde.theta + (tr.hacia.theta - tr.desde.theta) * k,
    );
    this.colocarCamara(objetivo, s);
    if (t >= 1) this.transicion = null;
    return true;
  }

  private marcarContorno(foco: Foco): void {
    let r: Rect | null = null;
    if (foco.nivel === 'barrio' || foco.nivel === 'zona') r = rectFoco(this.modelo, foco);
    if (foco.nivel === 'edificio') {
      const e = buscarEdificio(this.modelo, foco.conceptoId);
      if (e) {
        const l = e.huella + 1.3;
        r = { x: e.posicion.x - l / 2, z: e.posicion.z - l / 2, ancho: l, fondo: l };
      }
    }
    this.contorno.visible = Boolean(r);
    if (!r) return;
    const y = ALTO_ZONA + 0.12;
    this.contorno.geometry.dispose();
    this.contorno.geometry = new BufferGeometry().setAttribute(
      'position',
      new Float32BufferAttribute([r.x, y, r.z, r.x + r.ancho, y, r.z, r.x + r.ancho, y, r.z + r.fondo, r.x, y, r.z + r.fondo], 3),
    );
  }

  /** Cuanto más lejos o más cenital está la cámara, más se lee la ciudad como mapa de dominio. */
  private aplicarAtlas(): void {
    const distanciaCiudad = this.distanciaParaVer(encuadre(this.modelo, { nivel: 'ciudad' }).radio);
    const s = new Spherical().setFromVector3(this.camara.position.clone().sub(this.controles.target));
    const porDistancia = escalon(distanciaCiudad * 1.02, distanciaCiudad * 1.3, s.radius);
    const porAltura = escalon(0.5, 0.15, s.phi);
    this.atlas = Math.max(porDistancia, porAltura);
    for (const plano of this.dinamica.calor) {
      plano.visible = this.atlas > 0.01;
      (plano.material as MeshBasicMaterial).opacity = this.atlas * 0.72;
    }
  }

  /* ------------------------------------------------------------ bucle */

  private fotograma = (ahora: number): void => {
    this.raf = requestAnimationFrame(this.fotograma);
    let cambio = this.avanzarTransicion(ahora);
    cambio = this.controles.update() || cambio;
    cambio = this.animarCrecimientos(ahora) || cambio;
    if (!this.reducido) cambio = this.animarAmbiente(ahora / 1000) || cambio;
    if (!cambio && !this.sucio) return;
    this.aplicarAtlas();
    this.renderer.render(this.escena, this.camara);
    this.sucio = false;
    this.opciones.alFotograma();
  };

  private animarCrecimientos(ahora: number): boolean {
    if (!this.crecimientos.length) return false;
    this.crecimientos = this.crecimientos.filter(({ grupo, inicio }) => {
      const t = Math.min(1, (ahora - inicio) / 1400);
      const desde = grupo.userData.escalaInicial ?? (grupo.userData.escalaInicial = grupo.scale.y);
      grupo.scale.y = desde + (1 - desde) * (1 - (1 - t) ** 3);
      return t < 1;
    });
    return true;
  }

  /** Animaciones ambientales; todas desaparecen con prefers-reduced-motion. */
  private animarAmbiente(t: number): boolean {
    const { coches, rutas, marcadores, raiz } = this.dinamica;
    if (coches) colocarCoches(coches, rutas, t);
    for (const m of marcadores) m.position.y = m.userData.baseY + Math.sin(t * 1.6) * 0.45;
    raiz.traverse((o) => {
      if (o.name === 'bandera') o.rotation.y = Math.sin(t * 2.2 + o.id) * 0.3;
      else if (o.name === 'baliza') o.visible = Math.sin(t * 3) > -0.3;
    });
    return true;
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
      if ((impacto.object as Mesh).name.startsWith('calor-')) continue;
      for (let o: Object3D | null = impacto.object; o; o = o.parent) {
        const datos = o.userData as Partial<DatosSeleccionables>;
        if (datos.tipo === 'edificio' || datos.tipo === 'zona') return datos as DatosSeleccionables;
      }
    }
    return null;
  }
}
