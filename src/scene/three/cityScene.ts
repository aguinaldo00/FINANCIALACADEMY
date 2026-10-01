import {
  ACESFilmicToneMapping,
  BoxGeometry,
  CanvasTexture,
  DirectionalLight,
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
  construirCapaDinamica,
  construirCapaEstatica,
  type DatosSeleccionables,
  datosArquitectura,
  liberar,
} from './builders.ts';
import { unir } from './materials.ts';
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

const FOV = 32;
const POLAR_MAQUETA: Record<Foco['nivel'], number> = { ciudad: 0.9, barrio: 0.86, zona: 0.88, edificio: 1.0 };
const POLAR_ATLAS = 0.06;
/** Fracción del lienzo (en coordenadas normalizadas) que ocupa el foco al encuadrarlo. */
const OCUPACION: Record<Foco['nivel'], number> = { ciudad: 0.97, barrio: 0.9, zona: 0.86, edificio: 0.78 };
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
  private focoActual: Foco = { nivel: 'ciudad' };
  private distanciaCiudad = 0;
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

  enfocar(foco: Foco, vista: VistaMundo, animar: boolean): void {
    this.vista = vista;
    this.focoActual = foco;
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
      const hito = this.dinamica.marcadores.find((m) => m.userData.seccionId === foco.seccionId);
      if (hito) return new Vector3(hito.position.x, hito.userData.baseY + 1.9, hito.position.z);
      if (z) return new Vector3(z.parcela.x + z.parcela.ancho / 2, this.cimaZona(z.seccionId) + 1.2, z.parcela.z + z.parcela.fondo / 2);
    }
    if (foco.nivel === 'barrio') {
      // Señal de distrito en la esquina del barrio más alejada de la vista inicial.
      const b = buscarBarrio(this.modelo, foco.grupoId);
      if (b) return new Vector3(b.parcela.x + 1.5, NIVEL.acera + 0.4, b.parcela.z + 1.5);
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
        return e ? { r: encoger(e.lote, -1.2), alto: this.cimaEdificio(e.conceptoId) } : { r: rectFoco(this.modelo, foco), alto: 4 };
      }
    }
  }

  /**
   * Distancia mínima a la que el volumen del foco cabe en el lienzo con esta orientación: se
   * proyectan sus esquinas reales en vez de usar una esfera envolvente (que dejaba la ciudad
   * pequeña y rodeada de vacío).
   */
  private distanciaAjustada(foco: Foco, objetivo: Vector3, phi: number, theta: number): number {
    const { r, alto } = this.volumenFoco(foco);
    const esquinas: Vector3[] = [];
    for (const x of [r.x, r.x + r.ancho]) for (const z of [r.z, r.z + r.fondo]) for (const y of [NIVEL.peana, alto]) esquinas.push(new Vector3(x, y, z));
    this.sonda.aspect = this.camara.aspect || 1;
    this.sonda.updateProjectionMatrix();
    const limite = OCUPACION[foco.nivel];
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
    return new Vector3(r.x + r.ancho / 2, foco.nivel === 'ciudad' ? 0 : alto * 0.3, r.z + r.fondo / 2);
  }

  private aplicarEncuadre(foco: Foco, animar: boolean): void {
    const actual = new Spherical().setFromVector3(this.camara.position.clone().sub(this.controles.target));
    // El Atlas se lee como un mapa orientado; la maqueta conserva el giro del usuario.
    const theta = this.vista === 'atlas' ? 0 : this.girado ? actual.theta : this.thetaInicial();
    // En vertical, algo más cenital: la ciudad gana altura en pantalla.
    const vertical = (this.camara.aspect || 1) < 0.9;
    const phi = this.vista === 'atlas' ? POLAR_ATLAS : POLAR_MAQUETA[foco.nivel] * (vertical ? 0.85 : 1);
    const haciaObjetivo = this.objetivoFoco(foco);
    const hacia = new Spherical(this.distanciaAjustada(foco, haciaObjetivo, phi, theta), phi, theta);

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
      this.distanciaCiudad = this.distanciaAjustada(foco, this.objetivoFoco(foco), POLAR_MAQUETA.ciudad, this.thetaInicial());
    }
    const s = new Spherical().setFromVector3(this.camara.position.clone().sub(this.controles.target));
    const porDistancia = escalon(this.distanciaCiudad * 1.15, this.distanciaCiudad * 1.5, s.radius);
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
    cambio = this.controles.update() || cambio;
    cambio = this.animarCrecimientos(ahora) || cambio;
    if (!this.reducido) cambio = this.animarAmbiente(ahora / 1000) || cambio;
    if (!cambio && !this.sucio) return;
    this.ajustarProfundidad();
    this.aplicarAtlas();
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
    return true;
  }

  /**
   * Animaciones ambientales con significado: tráfico (zonas en estudio) y el vaivén del hito
   * "Estudia ya". Nada parpadea. Todas desaparecen con prefers-reduced-motion.
   */
  private animarAmbiente(t: number): boolean {
    const { coches, rutas, marcadores } = this.dinamica;
    if (coches) colocarCoches(coches, rutas, t);
    for (const m of marcadores) m.position.y = m.userData.baseY + Math.sin(t * 1.2) * 0.25;
    return Boolean(coches || marcadores.length);
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
      if (!impacto.object.visible || impacto.object.name.startsWith('calor-')) continue;
      for (let o: Object3D | null = impacto.object; o; o = o.parent) {
        const datos = o.userData as Partial<DatosSeleccionables>;
        if (datos.tipo === 'edificio' || datos.tipo === 'zona') return datos as DatosSeleccionables;
      }
    }
    return null;
  }
}
