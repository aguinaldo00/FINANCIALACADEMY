import {
  AdditiveBlending,
  CanvasTexture,
  Color,
  Group,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  NoToneMapping,
  PerspectiveCamera,
  PlaneGeometry,
  Raycaster,
  RepeatWrapping,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  type Texture,
  TextureLoader,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import urlCielo from '../../assets/mundos/cielo.webp';
import urlIslaGf from '../../assets/mundos/isla-gestion-financiera.webp';
import urlMascarasGf from '../../assets/mundos/mascaras-gestion-financiera.webp';
import urlNiebla from '../../assets/mundos/niebla.webp';

/*
 * Selector de mundos en 2,5D: cada asignatura es una isla flotante pintada (imagen prerrenderizada,
 * recortada) colocada en un espacio 3D real por capas: cielo al fondo, bancos de niebla a distintas
 * profundidades y las islas en carrusel. La cámara se mueve con el puntero (y respira sola), así que
 * cada capa se desplaza a su ritmo (paralaje de verdad, no un efecto CSS).
 * Animado en el shader de la isla: ventanas que laten y algunas que se apagan y encienden, agua de
 * las cascadas que cae, bruma en su base; la elegida recibe la luz principal y las demás quedan
 * veladas por la atmósfera. Solo dibuja: qué asignaturas hay y si están abiertas lo deciden los datos.
 * Las asignaturas sin ilustración todavía solo muestran su rótulo y un halo de su color (sin inventar isla).
 */

export interface MundoEscena {
  id: string;
  color: string;
  abierta: boolean;
}

export interface OpcionesMundos {
  reducido: boolean;
  /** Se pulsa una isla que no es la elegida. */
  alElegir: (indice: number) => void;
  /** Se pulsa la isla elegida. */
  alEntrar: (indice: number) => void;
  /** Cada fotograma: dónde cae en pantalla el pie de cada isla (para los rótulos HTML). */
  alFotograma: (pies: { x: number; y: number; escala: number; delante: boolean }[]) => void;
}

/** Ilustraciones disponibles por asignatura: la isla recortada y sus máscaras (R ventanas, G agua). */
const ARTE: Readonly<Record<string, { isla: string; mascaras: string; cascadas: readonly [number, number][] }>> = {
  'gestion-financiera': {
    isla: urlIslaGf,
    mascaras: urlMascarasGf,
    // Pie de cada cascada en coordenadas de la imagen (u, v desde abajo): ahí brota la bruma.
    cascadas: [
      [0.21, 0.27],
      [0.785, 0.23],
    ],
  },
};

/** Lado de la isla elegida en unidades de escena. */
const LADO = 9;
const CIELO_ASPECTO = 1536 / 864;

const VERTICE = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const FRAGMENTO_ISLA = /* glsl */ `
uniform sampler2D uMapa;
uniform sampler2D uMasc;
uniform float uT;
uniform float uFoco;
uniform float uAnima;
uniform vec3 uBruma;
varying vec2 vUv;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float ruido(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
void main() {
  vec4 c = texture2D(uMapa, vUv);
  if (c.a < 0.004) discard;
  vec3 m = texture2D(uMasc, vUv).rgb;
  vec3 col = c.rgb;
  // Ventanas: cada celda late a su ritmo y unas pocas se apagan y vuelven a encenderse.
  vec2 celda = floor(vUv * vec2(150.0, 190.0));
  float h = hash(celda);
  float late = 0.5 + 0.5 * sin(uT * (0.5 + h * 1.8) + h * 40.0);
  float apagada = step(0.9, h) * step(0.62, fract(uT * 0.05 + h * 7.0));
  col *= 1.0 + m.r * uAnima * ((late - 0.5) * 0.35 - apagada * 0.6);
  // Agua: vetas estiradas que bajan.
  float vetas = ruido(vec2(vUv.x * 210.0, vUv.y * 9.0 + uT * 1.6)) * 0.65 + ruido(vec2(vUv.x * 420.0, vUv.y * 22.0 + uT * 2.6)) * 0.35;
  col = mix(col, col * (0.72 + vetas * 0.62) + vec3(0.05, 0.08, 0.1) * vetas, m.g * uAnima);
  // Atmósfera: lo que no está elegido se desatura y se funde con el cielo.
  float lum = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(mix(vec3(lum), col, 0.45), col, uFoco);
  col = mix(uBruma, col, 0.5 + 0.5 * uFoco);
  col *= 0.7 + 0.32 * uFoco;
  gl_FragColor = vec4(col, c.a);
  #include <colorspace_fragment>
}`;

/** Halo radial (la luz que recibe la isla elegida, por detrás). */
function texturaHalo(): CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,0.75)');
  g.addColorStop(0.4, 'rgba(255,255,255,0.22)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

interface Mundo {
  raiz: Group;
  /** Plano de la isla (con shader) y la bruma de sus cascadas; vacío si aún no hay ilustración. */
  cuerpo: Group;
  material: ShaderMaterial | null;
  brumas: { mesh: Mesh; fase: number }[];
  halo: MeshBasicMaterial;
  picado: Mesh;
  semilla: number;
  /** Altura del pie bajo el centro (en unidades de LADO). */
  pie: number;
}

interface Capa {
  mesh: Mesh;
  tex: Texture;
  vel: number;
}

export class EscenaMundos {
  readonly lienzo: HTMLCanvasElement;
  private readonly renderer: WebGLRenderer;
  private readonly escena = new Scene();
  private readonly camara = new PerspectiveCamera(35, 1, 0.1, 400);
  private readonly mundos3d: Mundo[] = [];
  private readonly capas: Capa[] = [];
  private readonly cielo: Mesh;
  private readonly texturas: Texture[] = [];
  private objetivo: number;
  private actual: number;
  private puntero = new Vector2();
  private punteroSuave = new Vector2();
  private raf = 0;
  private ultimo = 0;
  private contenedor: HTMLElement | null = null;
  private observador: ResizeObserver | null = null;
  private entrando: { indice: number; inicio: number; alAcabar: () => void } | null = null;
  private pulsado: { x: number; y: number } | null = null;
  private readonly bruma = new Color('#2a4466');
  private destruida = false;

  constructor(private readonly mundos: readonly MundoEscena[], inicial: number, private readonly op: OpcionesMundos) {
    this.objetivo = this.actual = inicial;
    this.renderer = new WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio || 1, 2));
    // La ilustración ya está "revelada": sin curva de tono encima.
    this.renderer.toneMapping = NoToneMapping;
    this.renderer.setClearColor('#081322', 1);
    this.lienzo = this.renderer.domElement;
    this.lienzo.className = 'ac-lienzo';
    this.cielo = new Mesh(new PlaneGeometry(1, 1), new MeshBasicMaterial({ color: '#ffffff', depthWrite: false }));
    this.cielo.position.z = -90;
    this.escena.add(this.cielo);
  }

  /** Carga las imágenes y empieza a animar. Rechaza si alguna no carga (queda el selector plano). */
  async montarEn(contenedor: HTMLElement): Promise<void> {
    const carga = new TextureLoader();
    const cargar = async (url: string, color = true) => {
      const t = await carga.loadAsync(url);
      if (color) t.colorSpace = SRGBColorSpace;
      t.minFilter = LinearFilter;
      t.generateMipmaps = false;
      this.texturas.push(t);
      return t;
    };
    const conArte = this.mundos.map((m) => ARTE[m.id]);
    const [cielo, niebla, ...islas] = await Promise.all([
      cargar(urlCielo),
      cargar(urlNiebla),
      ...conArte.flatMap((a) => (a ? [cargar(a.isla), cargar(a.mascaras, false)] : [])),
    ]);
    // Si se salió de la vista mientras cargaba, no se monta nada.
    if (this.destruida) {
      for (const t of this.texturas) t.dispose();
      return;
    }
    (this.cielo.material as MeshBasicMaterial).map = cielo!;
    this.construir(niebla!, islas);

    this.contenedor = contenedor;
    contenedor.prepend(this.lienzo);
    this.observador = new ResizeObserver(() => this.ajustar());
    this.observador.observe(contenedor);
    this.ajustar();
    contenedor.addEventListener('pointermove', this.alMover);
    contenedor.addEventListener('pointerdown', this.alBajar);
    contenedor.addEventListener('pointerup', this.alSoltar);
    this.ultimo = performance.now();
    this.raf = requestAnimationFrame(this.fotograma);
  }

  private construir(niebla: Texture, islas: Texture[]): void {
    const halo = texturaHalo();
    let k = 0;
    this.mundos.forEach((m, i) => {
      const arte = ARTE[m.id];
      const raiz = new Group();
      const cuerpo = new Group();
      raiz.add(cuerpo);
      const haloMat = new MeshBasicMaterial({ map: halo, color: m.color, transparent: true, depthWrite: false, blending: AdditiveBlending, opacity: 0 });
      const haloMesh = new Mesh(new PlaneGeometry(LADO * 1.7, LADO * 1.5), haloMat);
      haloMesh.position.set(0, LADO * 0.06, -0.6);
      raiz.add(haloMesh);
      const brumas: Mundo['brumas'] = [];
      let material: ShaderMaterial | null = null;
      let pie = 0.42;
      if (arte) {
        const mapa = islas[k++]!;
        const masc = islas[k++]!;
        material = new ShaderMaterial({
          uniforms: {
            uMapa: { value: mapa },
            uMasc: { value: masc },
            uT: { value: 0 },
            uFoco: { value: 1 },
            uAnima: { value: this.op.reducido ? 0 : 1 },
            uBruma: { value: this.bruma.clone() },
          },
          vertexShader: VERTICE,
          fragmentShader: FRAGMENTO_ISLA,
          transparent: true,
          depthWrite: false,
        });
        cuerpo.add(new Mesh(new PlaneGeometry(LADO, LADO), material));
        // Bruma que brota al pie de cada cascada (delante del plano, con su propio paralaje).
        arte.cascadas.forEach(([u, v], j) => {
          const t = niebla.clone();
          t.needsUpdate = true;
          const mat = new MeshBasicMaterial({ map: t, color: '#c9dcf2', transparent: true, depthWrite: false, opacity: 0 });
          const b = new Mesh(new PlaneGeometry(LADO * 0.34, LADO * 0.19), mat);
          b.position.set((u - 0.5) * LADO, (v - 0.5) * LADO, 0.35);
          cuerpo.add(b);
          brumas.push({ mesh: b, fase: j * 2.1 });
          this.texturas.push(t);
        });
        pie = 0.43;
      } else {
        // Sin ilustración todavía: solo su rótulo y un halo tenue de su color (no se inventa una isla).
        pie = 0.2;
      }
      // Volumen invisible para pulsar el mundo entero.
      const picado = new Mesh(new PlaneGeometry(LADO * 0.8, LADO * (arte ? 0.85 : 0.45)), new MeshBasicMaterial({ visible: false }));
      raiz.add(picado);
      this.escena.add(raiz);
      this.mundos3d.push({ raiz, cuerpo, material, brumas, halo: haloMat, picado, semilla: i * 1.7 + 0.4, pie });
    });

    // Bancos de niebla a varias profundidades: detrás de las islas, entre ellas y por delante.
    const capas: [z: number, y: number, ancho: number, opacidad: number, vel: number, tinte: string, franja: number][] = [
      [-40, -10, 150, 0.28, 0.0035, '#7d93b3', 0],
      [-14, -7.5, 90, 0.34, 0.006, '#9fb3cf', 0.5],
      [-3, -8.6, 70, 0.3, 0.01, '#b9c9de', 0.25],
      [7, -9.5, 54, 0.42, 0.017, '#d4deeb', 0],
    ];
    for (const [z, y, ancho, opacidad, vel, tinte, franja] of capas) {
      const t = niebla.clone();
      t.needsUpdate = true;
      t.wrapS = RepeatWrapping;
      t.repeat.set(1.4, 1);
      t.offset.set(Math.random() + franja, 0);
      const mesh = new Mesh(new PlaneGeometry(ancho, ancho * 0.2), new MeshBasicMaterial({ map: t, color: tinte, transparent: true, depthWrite: false, opacity: opacidad }));
      mesh.position.set(0, y, z);
      this.escena.add(mesh);
      this.capas.push({ mesh, tex: t, vel: this.op.reducido ? 0 : vel });
      this.texturas.push(t);
    }
    this.colocar(0);
  }

  seleccionar(indice: number): void {
    this.objetivo = Math.max(0, Math.min(this.mundos.length - 1, indice));
    if (this.op.reducido) this.actual = this.objetivo;
  }

  /** La cámara se acerca a la ciudad de la isla elegida y, al llegar, se avisa. */
  entrar(indice: number, alAcabar: () => void): void {
    if (this.op.reducido) return alAcabar();
    this.entrando = { indice, inicio: performance.now(), alAcabar };
  }

  destruir(): void {
    if (this.destruida) return;
    this.destruida = true;
    cancelAnimationFrame(this.raf);
    this.observador?.disconnect();
    if (this.contenedor) {
      this.contenedor.removeEventListener('pointermove', this.alMover);
      this.contenedor.removeEventListener('pointerdown', this.alBajar);
      this.contenedor.removeEventListener('pointerup', this.alSoltar);
    }
    this.escena.traverse((ob) => {
      const m = ob as Mesh;
      m.geometry?.dispose();
      const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
      for (const mm of mats) mm.dispose();
    });
    for (const t of this.texturas) t.dispose();
    this.renderer.dispose();
    this.lienzo.remove();
  }

  private vertical(): boolean {
    return this.camara.aspect < 0.85;
  }

  private distancia(): number {
    return this.vertical() ? 24 : 25;
  }

  private ajustar(): void {
    if (!this.contenedor) return;
    const { clientWidth: w, clientHeight: h } = this.contenedor;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camara.aspect = w / h;
    // En vertical la cámara abre el ángulo para que la isla elegida quepa de lado a lado.
    this.camara.fov = this.vertical() ? 52 : 34;
    this.camara.updateProjectionMatrix();
    // El cielo cubre siempre el encuadre (como background-size: cover), con margen para el paralaje.
    const dist = this.distancia() - this.cielo.position.z;
    const alto = 2 * dist * Math.tan((this.camara.fov * Math.PI) / 360) * 1.25;
    const ancho = alto * this.camara.aspect;
    this.cielo.scale.set(ancho, alto, 1);
    const mapa = (this.cielo.material as MeshBasicMaterial).map;
    if (mapa) {
      const a = ancho / alto;
      if (a > CIELO_ASPECTO) mapa.repeat.set(1, CIELO_ASPECTO / a);
      else mapa.repeat.set(a / CIELO_ASPECTO, 1);
      mapa.offset.set((1 - mapa.repeat.x) / 2, (1 - mapa.repeat.y) * 0.42);
    }
  }

  private espaciado(): number {
    return this.vertical() ? LADO * 0.78 : Math.min(LADO * 1.15, Math.max(LADO * 0.85, this.camara.aspect * 6));
  }

  /** Coloca los mundos según la posición (fraccionaria) del carrusel. */
  private colocar(t: number): void {
    const esp = this.espaciado();
    this.mundos3d.forEach((m, i) => {
      const d = i - this.actual;
      const ad = Math.abs(d);
      const x = Math.sign(d) * (ad < 1 ? ad * esp : esp + (ad - 1) * esp * 0.62);
      const flota = this.op.reducido ? 0 : Math.sin(t * 0.55 + m.semilla) * 0.18;
      const altura = Math.min(ad, 1) * (i % 2 ? 1.4 : 0.3);
      m.raiz.position.set(x, altura + flota, -Math.min(ad, 3) * 7.5);
      m.raiz.scale.setScalar(ad < 1 ? 1 - 0.35 * ad : Math.max(0.42, 0.65 - 0.1 * (ad - 1)));
      // Un balanceo mínimo: la isla no es un cartel quieto.
      m.cuerpo.rotation.z = this.op.reducido ? 0 : Math.sin(t * 0.37 + m.semilla) * 0.008;
      const foco = Math.max(0, 1 - ad);
      const abierta = this.mundos[i]!.abierta;
      m.halo.opacity = foco * (abierta ? 0.42 : 0.18);
      if (m.material) {
        m.material.uniforms.uT!.value = t;
        m.material.uniforms.uFoco!.value = foco;
      }
      for (const b of m.brumas) {
        const p = this.op.reducido ? 0.5 : 0.5 + 0.5 * Math.sin(t * 0.8 + b.fase);
        (b.mesh.material as MeshBasicMaterial).opacity = (0.3 + 0.25 * p) * (0.45 + 0.55 * foco);
        b.mesh.scale.set(1 + p * 0.12, 1 + p * 0.08, 1);
      }
    });
  }

  private fotograma = (ahora: number): void => {
    this.raf = requestAnimationFrame(this.fotograma);
    if (document.hidden) return;
    const dt = Math.min(0.05, (ahora - this.ultimo) / 1000);
    this.ultimo = ahora;
    const t = ahora / 1000;
    // Carrusel con inercia suave hacia el mundo elegido.
    this.actual += (this.objetivo - this.actual) * (this.op.reducido ? 1 : Math.min(1, dt * 4));
    if (Math.abs(this.objetivo - this.actual) < 0.001) this.actual = this.objetivo;
    this.colocar(t);
    for (const c of this.capas) c.tex.offset.x += c.vel * dt;

    // Cámara: el puntero la desplaza y, sin puntero, respira despacio; las capas se separan por profundidad.
    this.punteroSuave.lerp(this.puntero, Math.min(1, dt * 2.5));
    const respira = this.op.reducido ? 0 : 1;
    const vertical = this.vertical();
    const base = new Vector3(
      this.punteroSuave.x * 1.4 + Math.sin(t * 0.13) * 0.9 * respira,
      1.2 - this.punteroSuave.y * 0.7 + Math.sin(t * 0.17) * 0.35 * respira,
      this.distancia(),
    );
    // La isla elegida queda por encima del panel con su nombre.
    const mira = new Vector3(0, vertical ? -3.6 : -1.9, 0);
    if (this.entrando) {
      const k = Math.min(1, (ahora - this.entrando.inicio) / 800);
      const e = k * k * (3 - 2 * k);
      const isla = this.mundos3d[this.entrando.indice]!.raiz.position;
      // Hacia la plaza del banco (parte alta de la ilustración).
      const destino = isla.clone().add(new Vector3(0, LADO * 0.2, 0));
      base.lerp(destino.clone().add(new Vector3(0, 0.4, 7)), e);
      mira.lerp(destino, e);
      if (k >= 1) {
        const fin = this.entrando.alAcabar;
        this.entrando = null;
        fin();
      }
    }
    this.camara.position.copy(base);
    this.camara.lookAt(mira);
    // El cielo está "en el infinito": se queda en el eje de la mirada (sin paralaje), así que las
    // islas y la niebla se desplazan sobre él según su profundidad.
    const k = (base.z - this.cielo.position.z) / (base.z - mira.z);
    this.cielo.position.x = base.x + (mira.x - base.x) * k;
    this.cielo.position.y = base.y + (mira.y - base.y) * k;
    this.cielo.lookAt(base);
    this.renderer.render(this.escena, this.camara);

    // Pie de cada mundo en pantalla (para sus rótulos HTML).
    const w = this.lienzo.clientWidth;
    const h = this.lienzo.clientHeight;
    const pies = this.mundos3d.map((m) => {
      const p = m.raiz.position.clone().add(new Vector3(0, -m.pie * LADO * m.raiz.scale.y, 0)).project(this.camara);
      return { x: (p.x * 0.5 + 0.5) * w, y: (-p.y * 0.5 + 0.5) * h, escala: m.raiz.scale.x, delante: p.z < 1 };
    });
    this.op.alFotograma(pies);
  };

  private alMover = (e: PointerEvent): void => {
    if (this.op.reducido || e.pointerType === 'touch' || !this.contenedor) return;
    const r = this.contenedor.getBoundingClientRect();
    this.puntero.set(((e.clientX - r.left) / r.width - 0.5) * 2, ((e.clientY - r.top) / r.height - 0.5) * 2);
  };

  private alBajar = (e: PointerEvent): void => {
    if ((e.target as Element) !== this.lienzo) return;
    this.pulsado = { x: e.clientX, y: e.clientY };
  };

  private alSoltar = (e: PointerEvent): void => {
    const p = this.pulsado;
    this.pulsado = null;
    if (!p || (e.target as Element) !== this.lienzo) return;
    const dx = e.clientX - p.x;
    // Deslizar: mundo anterior o siguiente.
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(e.clientY - p.y)) {
      this.op.alElegir(Math.max(0, Math.min(this.mundos.length - 1, this.objetivo + (dx < 0 ? 1 : -1))));
      return;
    }
    if (Math.hypot(dx, e.clientY - p.y) > 8) return;
    // Pulsar un mundo: lo elige o, si ya lo es, entra.
    const r = this.lienzo.getBoundingClientRect();
    const rayo = new Raycaster();
    rayo.setFromCamera(new Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), this.camara);
    const toque = rayo.intersectObjects(this.mundos3d.map((m) => m.picado))[0];
    if (!toque) return;
    const indice = this.mundos3d.findIndex((m) => m.picado === toque.object);
    if (indice === this.objetivo) this.op.alEntrar(indice);
    else this.op.alElegir(indice);
  };
}
