import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  PointsMaterial,
  MirroredRepeatWrapping,
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
import urlBarco from '../../assets/intro/barco.webp';
import urlCielo from '../../assets/intro/cielo-tormenta.webp';
import urlIsla from '../../assets/mundos/isla-gestion-financiera.webp';
import urlNiebla from '../../assets/mundos/niebla.webp';

/*
 * Intro del barco: un galeón de velas oscuras cruza una tormenta de nubes hacia un resplandor dorado.
 * Capas (de lejos a cerca): cielo del remolino (pegado a la cámara, con un giro diferencial en el
 * shader), la isla de Gestión Financiera apenas visible en la bruma junto al sol (el destino), bancos
 * de nubes a varias profundidades, el barco (balanceo, banderas que ondean, faroles que titilan),
 * papeles que vuelan girando en 3D, motas de polvo, ráfagas de viento y rayos ocasionales.
 * Al final la cámara avanza hacia la luz y el resplandor llena la pantalla: ahí se pasa al selector.
 * Las imágenes son ilustraciones; papeles, motas, ráfagas y rayos se generan por código.
 */

export type CalidadIntro = 'alta' | 'baja';

export interface OpcionesIntroBarco {
  calidad: CalidadIntro;
  /** Cada fotograma: dónde está el sol en pantalla (0–1) y cuánta luz lo cubre todo (0–1). */
  alFotograma: (sol: { x: number; y: number }, luz: number, t: number) => void;
  /** El guion ha llegado al blanco de la luz: el selector puede aparecer debajo. */
  alDeslumbrar: () => void;
}

/** Instantes del guion, en segundos. */
export const GUION_BARCO = {
  /** El barco termina de entrar por la derecha. */
  entrada: 3.2,
  /** La luz empieza a crecer y la cámara a avanzar. */
  avance: 7.2,
  /** La luz cubre la pantalla. */
  deslumbre: 10.6,
} as const;

/** El sol en la imagen del cielo (u, v desde abajo). */
const SOL = new Vector2(0.32, 0.58);
const CIELO_ASPECTO = 2;
const BARCO_ASPECTO = 1536 / 1024;

const VERTICE = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const FRAG_CIELO = /* glsl */ `
uniform sampler2D uCielo;
uniform vec2 uSol;
uniform vec2 uRecorte;
uniform vec2 uDesp;
uniform float uT;
uniform float uZoom;
uniform float uLuz;
uniform float uFlash;
uniform vec2 uFlashPos;
varying vec2 vUv;
void main() {
  vec2 uv = uDesp + vUv * uRecorte;
  uv = uSol + (uv - uSol) / uZoom;
  // Remolino: lo cercano al sol gira más deprisa que lo lejano (rotación diferencial, no rígida).
  vec2 d = uv - uSol;
  d.x *= 2.0;
  float r = length(d);
  // Se apaga hacia los bordes para no sacar la imagen de su marco.
  float a = uT * 0.028 / (0.12 + r * 2.6) * smoothstep(0.95, 0.35, r);
  float s = sin(a), c = cos(a);
  d = mat2(c, s, -s, c) * d;
  d.x *= 0.5;
  vec3 col = texture2D(uCielo, uSol + d).rgb;
  // Rayo: ilumina por dentro las nubes cercanas (más donde la nube ya es clara).
  vec2 pf = (vUv - uFlashPos) * vec2(1.6, 1.0);
  float lum = dot(col, vec3(0.299, 0.587, 0.114));
  col += vec3(0.55, 0.68, 1.0) * uFlash * smoothstep(0.42, 0.0, length(pf)) * (0.25 + lum * 1.4);
  // La luz del horizonte crece alrededor del sol.
  col += vec3(1.0, 0.72, 0.38) * uLuz * exp(-r * r * (9.0 / (0.25 + uLuz * 2.5)));
  // Viñeta suave.
  vec2 v = vUv - 0.5;
  col *= 1.0 - dot(v, v) * 0.55;
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;

const FRAG_BARCO = /* glsl */ `
uniform sampler2D uMapa;
uniform float uT;
uniform float uBruma;
uniform float uFlash;
uniform float uLuz;
uniform vec3 uTinte;
varying vec2 vUv;
void main() {
  vec2 uv = vUv;
  // Banderas (arriba a la derecha): ondean, más hacia la punta libre.
  float bandera = smoothstep(0.69, 0.79, vUv.x) * smoothstep(0.5, 0.6, vUv.y);
  uv.y += bandera * sin(vUv.x * 26.0 - uT * 4.6) * 0.016 * (vUv.x - 0.69) * 3.2;
  // Velas: un leve respirar con el viento.
  float vela = smoothstep(0.34, 0.5, vUv.y) * (1.0 - bandera);
  uv.x += vela * sin(vUv.y * 8.0 + uT * 1.5) * 0.0022;
  vec4 c = texture2D(uMapa, uv);
  if (c.a < 0.02) discard;
  // Faroles y ventanas de popa: titilan (cada zona a su ritmo).
  float lum = dot(c.rgb, vec3(0.299, 0.587, 0.114));
  float calido = smoothstep(0.22, 0.45, c.r - c.b) * smoothstep(0.55, 0.85, lum);
  float n = sin(uT * 6.3 + vUv.x * 37.0) * sin(uT * 2.9 + vUv.y * 23.0);
  vec3 col = c.rgb * (1.0 + calido * n * 0.16);
  // Luz de la tormenta y del sol sobre el casco.
  col += vec3(0.4, 0.5, 0.8) * uFlash * 0.18 * (1.0 - lum);
  col += vec3(1.0, 0.7, 0.35) * uLuz * 0.12;
  col = mix(col, uTinte, uBruma);
  gl_FragColor = vec4(col, c.a);
  #include <colorspace_fragment>
}`;

const azar = (semilla: number) => {
  let s = semilla >>> 0 || 1;
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
};
const suave = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Papeles de oficina financiera (líneas de texto, barras o un gráfico circular), dibujados a mano. */
function texturaPapel(tipo: number, semilla: number): CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 164;
  const x = c.getContext('2d');
  if (!x) return null;
  const r = azar(semilla);
  x.fillStyle = '#efe6d2';
  x.fillRect(0, 0, 128, 164);
  // Borde ligeramente tostado.
  const g = x.createRadialGradient(64, 82, 40, 64, 82, 110);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(120,80,30,0.35)');
  x.fillStyle = g;
  x.fillRect(0, 0, 128, 164);
  x.fillStyle = 'rgba(60,50,40,0.75)';
  x.fillRect(14, 14, 60, 6);
  x.fillStyle = 'rgba(60,50,40,0.4)';
  for (let i = 0; i < 4; i++) x.fillRect(14, 28 + i * 8, 100 - r() * 30, 3);
  if (tipo === 0) {
    for (let i = 0; i < 9; i++) x.fillRect(14, 66 + i * 9, 100 - r() * 40, 3);
  } else if (tipo === 1) {
    for (let i = 0; i < 6; i++) {
      const h = 14 + r() * 50;
      x.fillStyle = i === 4 ? 'rgba(170,110,30,0.7)' : 'rgba(60,70,90,0.55)';
      x.fillRect(18 + i * 16, 146 - h, 10, h);
    }
  } else {
    let a = -Math.PI / 2;
    const tonos = ['rgba(60,70,90,0.6)', 'rgba(170,110,30,0.65)', 'rgba(120,110,95,0.5)'];
    [0.45, 0.33, 0.22].forEach((p, i) => {
      x.beginPath();
      x.moveTo(64, 108);
      x.arc(64, 108, 34, a, a + p * Math.PI * 2);
      x.closePath();
      x.fillStyle = tonos[i]!;
      x.fill();
      a += p * Math.PI * 2;
    });
  }
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

/** Rayo ramificado (desplazamiento del punto medio), nuevo en cada descarga. */
function dibujarRayo(lienzo: HTMLCanvasElement, semilla: number): void {
  const x = lienzo.getContext('2d');
  if (!x) return;
  const r = azar(semilla);
  x.clearRect(0, 0, lienzo.width, lienzo.height);
  const tramo = (x0: number, y0: number, x1: number, y1: number, desv: number, nivel: number, ancho: number) => {
    const pts: [number, number][] = [[x0, y0], [x1, y1]];
    let d = desv;
    for (let k = 0; k < 6; k++) {
      for (let i = pts.length - 1; i > 0; i--) {
        const [ax, ay] = pts[i - 1]!;
        const [bx, by] = pts[i]!;
        pts.splice(i, 0, [(ax + bx) / 2 + (r() - 0.5) * d, (ay + by) / 2 + (r() - 0.5) * d * 0.3]);
      }
      d *= 0.55;
    }
    x.lineWidth = ancho;
    x.beginPath();
    pts.forEach(([px, py], i) => (i ? x.lineTo(px, py) : x.moveTo(px, py)));
    x.stroke();
    if (nivel < 2)
      for (let b = 0; b < 2; b++) {
        const p = pts[Math.floor(pts.length * (0.25 + r() * 0.5))]!;
        tramo(p[0], p[1], p[0] + (r() - 0.3) * 120, p[1] + 60 + r() * 120, desv * 0.5, nivel + 1, ancho * 0.55);
      }
  };
  x.strokeStyle = 'rgba(220,232,255,0.95)';
  x.shadowColor = 'rgba(140,170,255,0.9)';
  x.shadowBlur = 14;
  x.lineCap = 'round';
  tramo(lienzo.width * (0.3 + r() * 0.4), 0, lienzo.width * (0.3 + r() * 0.4), lienzo.height * (0.7 + r() * 0.25), 160, 0, 3.2);
}

function texturaRadial(colores: [number, string][]): CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const x = c.getContext('2d');
  if (!x) return null;
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  for (const [p, col] of colores) g.addColorStop(p, col);
  x.fillStyle = g;
  x.fillRect(0, 0, 64, 64);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

/** Ráfaga: una línea fina que nace y se apaga a lo largo. */
function texturaRafaga(): CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 8;
  const x = c.getContext('2d');
  if (!x) return null;
  const g = x.createLinearGradient(0, 0, 256, 0);
  g.addColorStop(0, 'rgba(255,230,190,0)');
  g.addColorStop(0.7, 'rgba(255,230,190,0.9)');
  g.addColorStop(1, 'rgba(255,230,190,0)');
  x.fillStyle = g;
  x.fillRect(0, 3, 256, 2);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

interface Papel {
  mesh: Mesh;
  vel: Vector3;
  giro: Vector3;
  fase: number;
}
interface Nube {
  mesh: Mesh;
  tex: Texture;
  vel: number;
}
interface Rafaga {
  mesh: Mesh;
  espera: number;
  vel: number;
}

export class EscenaIntroBarco {
  readonly lienzo: HTMLCanvasElement;
  private readonly renderer: WebGLRenderer;
  private readonly escena = new Scene();
  private readonly camara = new PerspectiveCamera(40, 1, 0.1, 200);
  private readonly texturas: Texture[] = [];
  private cielo: Mesh | null = null;
  private matCielo: ShaderMaterial | null = null;
  private barco: Mesh | null = null;
  private matBarco: ShaderMaterial | null = null;
  private isla: Mesh | null = null;
  private readonly nubes: Nube[] = [];
  private readonly papeles: Papel[] = [];
  private readonly rafagas: Rafaga[] = [];
  private motas: Points | null = null;
  private velMotas: Float32Array | null = null;
  private rayo: Mesh | null = null;
  private lienzoRayo: HTMLCanvasElement | null = null;
  private proximoRayo = 2.3;
  private rayoInicio = -10;
  private readonly rnd = azar(7);
  private raf = 0;
  private ultimo = 0;
  private tiempo = 0;
  private acelerar = 1;
  private deslumbrado = false;
  private contenedor: HTMLElement | null = null;
  private observador: ResizeObserver | null = null;
  private destruida = false;
  private puntero = new Vector2();
  private punteroSuave = new Vector2();
  private muestras: number[] = [];
  private ajustes = 0;

  constructor(private readonly op: OpcionesIntroBarco) {
    const baja = op.calidad === 'baja';
    this.renderer = new WebGLRenderer({ antialias: !baja, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio || 1, baja ? 1.25 : 1.75));
    this.renderer.setClearColor('#120c1c', 1);
    this.lienzo = this.renderer.domElement;
    this.lienzo.className = 'ib-lienzo';
  }

  async montarEn(contenedor: HTMLElement): Promise<void> {
    const carga = new TextureLoader();
    const cargar = async (url: string) => {
      const t = await carga.loadAsync(url);
      t.colorSpace = SRGBColorSpace;
      t.anisotropy = 4;
      this.texturas.push(t);
      return t;
    };
    const [cielo, barco, niebla, isla] = await Promise.all([cargar(urlCielo), cargar(urlBarco), cargar(urlNiebla), cargar(urlIsla)]);
    // El giro del remolino nunca debe estirar el borde de la imagen.
    cielo.wrapS = cielo.wrapT = MirroredRepeatWrapping;
    if (this.destruida) {
      for (const t of this.texturas) t.dispose();
      return;
    }
    this.construir(cielo, barco, niebla, isla);
    this.contenedor = contenedor;
    contenedor.prepend(this.lienzo);
    this.observador = new ResizeObserver(() => this.ajustar());
    this.observador.observe(contenedor);
    this.ajustar();
    contenedor.addEventListener('pointermove', this.alMover);
    this.ultimo = performance.now();
    this.raf = requestAnimationFrame(this.fotograma);
  }

  /** Salto: el guion corre deprisa hasta el deslumbre (la transición no se corta, se abrevia). */
  saltar(): void {
    if (this.tiempo < GUION_BARCO.avance) this.tiempo = GUION_BARCO.avance;
    this.acelerar = 3.2;
  }

  destruir(): void {
    if (this.destruida) return;
    this.destruida = true;
    cancelAnimationFrame(this.raf);
    this.observador?.disconnect();
    this.contenedor?.removeEventListener('pointermove', this.alMover);
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

  private construir(cielo: Texture, barco: Texture, niebla: Texture, isla: Texture): void {
    const baja = this.op.calidad === 'baja';
    const r = this.rnd;

    // Cielo: hijo de la cámara (está "en el infinito"); el recorte tipo cover lo hace el shader.
    this.matCielo = new ShaderMaterial({
      uniforms: {
        uCielo: { value: cielo },
        uSol: { value: SOL.clone() },
        uRecorte: { value: new Vector2(1, 1) },
        uDesp: { value: new Vector2(0, 0) },
        uT: { value: 0 },
        uZoom: { value: 1 },
        uLuz: { value: 0 },
        uFlash: { value: 0 },
        uFlashPos: { value: new Vector2(0.78, 0.8) },
      },
      vertexShader: VERTICE,
      fragmentShader: FRAG_CIELO,
      depthWrite: false,
    });
    this.cielo = new Mesh(new PlaneGeometry(1, 1), this.matCielo);
    this.cielo.position.z = -100;
    this.cielo.renderOrder = -10;
    this.camara.add(this.cielo);
    this.escena.add(this.camara);

    // El destino: la isla de Gestión Financiera, casi disuelta en la bruma junto al sol.
    this.isla = new Mesh(new PlaneGeometry(6, 6), new MeshBasicMaterial({ map: isla, color: '#d9a679', transparent: true, depthWrite: false, opacity: 0 }));
    this.escena.add(this.isla);

    // Rayo (detrás del barco, arriba a la derecha).
    if (typeof document !== 'undefined') {
      this.lienzoRayo = document.createElement('canvas');
      this.lienzoRayo.width = 256;
      this.lienzoRayo.height = 512;
      const t = new CanvasTexture(this.lienzoRayo);
      t.colorSpace = SRGBColorSpace;
      this.texturas.push(t);
      this.rayo = new Mesh(new PlaneGeometry(9, 18), new MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, blending: AdditiveBlending, opacity: 0 }));
      this.escena.add(this.rayo);
    }

    // Bancos de nubes, siempre por debajo del sol: [z, y, ancho, alto, opacidad, velocidad, tinte, desfase].
    // Cada uno a su ritmo; los dos más cercanos tapan el casco (el barco navega dentro de las nubes).
    const capas: [number, number, number, number, number, number, string, number][] = [
      [-30, -9.5, 120, 10, 0.5, 0.004, '#5b4f7d', 0.1],
      [-16, -7.3, 80, 7, 0.55, 0.007, '#6d5a7e', 0.45],
      [-6, -5.4, 52, 5, 0.65, 0.012, '#8b6a78', 0.7],
      [-0.6, -3.6, 30, 4, 0.8, 0.02, '#c08a72', 0.2],
      [0.8, -3.5, 28, 3.2, 0.9, 0.03, '#d39a72', 0.55],
      [4, -2.6, 26, 2.2, 0.6, 0.05, '#7d6680', 0.9],
    ];
    for (const [z, y, ancho, alto, opacidad, vel, tinte, desfase] of baja ? capas.filter((_, i) => i !== 1 && i !== 5) : capas) {
      const t = niebla.clone();
      t.needsUpdate = true;
      t.wrapS = RepeatWrapping;
      t.repeat.set(1.2, 1);
      t.offset.set(desfase, 0);
      const mesh = new Mesh(new PlaneGeometry(ancho, alto), new MeshBasicMaterial({ map: t, color: tinte, transparent: true, depthWrite: false, opacity: opacidad }));
      mesh.position.set(0, y, z);
      this.escena.add(mesh);
      this.nubes.push({ mesh, tex: t, vel });
      this.texturas.push(t);
    }

    // El barco: entre las nubes de detrás (z < 0) y las de delante (z > 0), con el casco hundido en ellas.
    this.matBarco = new ShaderMaterial({
      uniforms: {
        uMapa: { value: barco },
        uT: { value: 0 },
        uBruma: { value: 0 },
        uFlash: { value: 0 },
        uLuz: { value: 0 },
        uTinte: { value: new Color('#f3c68a') },
      },
      vertexShader: VERTICE,
      fragmentShader: FRAG_BARCO,
      transparent: true,
      depthWrite: false,
    });
    this.barco = new Mesh(new PlaneGeometry(BARCO_ASPECTO, 1), this.matBarco);
    this.escena.add(this.barco);

    // Papeles: tamaños, profundidades, velocidades y giros distintos; cada uno renace con otros valores.
    const texPapeles = [0, 1, 2].map((tipo) => texturaPapel(tipo, 31 + tipo * 17));
    for (const t of texPapeles) if (t) this.texturas.push(t);
    const nPapeles = baja ? 7 : 15;
    for (let i = 0; i < nPapeles; i++) {
      const mesh = new Mesh(new PlaneGeometry(0.34, 0.44), new MeshBasicMaterial({ map: texPapeles[i % 3], side: DoubleSide, transparent: true, depthWrite: false }));
      const p: Papel = { mesh, vel: new Vector3(), giro: new Vector3(), fase: r() * 10 };
      this.renacerPapel(p, true);
      this.escena.add(mesh);
      this.papeles.push(p);
    }

    // Motas de polvo y brasas.
    const n = baja ? 90 : 260;
    const pos = new Float32Array(n * 3);
    this.velMotas = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (r() - 0.5) * 30;
      pos[i * 3 + 1] = (r() - 0.5) * 14;
      pos[i * 3 + 2] = -8 + r() * 14;
      this.velMotas[i] = 0.5 + r() * 2.2;
    }
    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(pos, 3));
    const texMota = texturaRadial([
      [0, 'rgba(255,236,200,1)'],
      [0.4, 'rgba(255,200,130,0.5)'],
      [1, 'rgba(255,180,90,0)'],
    ]);
    if (texMota) this.texturas.push(texMota);
    this.motas = new Points(geo, new PointsMaterial({ map: texMota, size: 0.09, sizeAttenuation: true, transparent: true, depthWrite: false, blending: AdditiveBlending, opacity: 0.8 }));
    this.escena.add(this.motas);

    // Ráfagas de viento: pocas, finas, a destiempo.
    const texRafaga = texturaRafaga();
    if (texRafaga) this.texturas.push(texRafaga);
    for (let i = 0; i < (baja ? 2 : 5); i++) {
      const mesh = new Mesh(new PlaneGeometry(7, 0.05), new MeshBasicMaterial({ map: texRafaga, transparent: true, depthWrite: false, blending: AdditiveBlending, opacity: 0 }));
      this.escena.add(mesh);
      this.rafagas.push({ mesh, espera: 0.6 + r() * 4, vel: 0 });
    }
  }

  private renacerPapel(p: Papel, alInicio = false): void {
    const r = this.rnd;
    const z = -6 + r() * 11;
    // Lo cercano pasa más rápido (paralaje) y algo más translúcido (como desenfocado).
    const cerca = suave(-6, 5, z);
    const ancho = this.anchoVisible(z);
    p.mesh.position.set(alInicio ? (r() - 0.5) * ancho : ancho * 0.6 + r() * 2, (r() - 0.4) * this.altoVisible(z) * 0.8, z);
    p.vel.set(-(1.1 + r() * 1.4) * (0.6 + cerca * 1.4), (r() - 0.5) * 0.35, 0);
    p.giro.set((r() - 0.5) * 3.4, (r() - 0.5) * 3.4, (r() - 0.5) * 2);
    p.mesh.scale.setScalar(0.7 + r() * 0.7);
    const mat = p.mesh.material as MeshBasicMaterial;
    mat.opacity = 0.95 - cerca * 0.35;
    mat.color.set(cerca > 0.5 ? '#ffe2b8' : '#b79f9a');
  }

  private altoVisible(z: number): number {
    return 2 * (this.camara.position.z - z) * Math.tan((this.camara.fov * Math.PI) / 360);
  }
  private anchoVisible(z: number): number {
    return this.altoVisible(z) * this.camara.aspect;
  }

  private vertical(): boolean {
    return this.camara.aspect < 0.85;
  }

  private ajustar(): void {
    if (!this.contenedor) return;
    const { clientWidth: w, clientHeight: h } = this.contenedor;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camara.aspect = w / h;
    this.camara.fov = this.vertical() ? 62 : 40;
    this.camara.updateProjectionMatrix();
    if (!this.cielo || !this.matCielo) return;
    // El plano del cielo cubre la vista a su distancia; el shader recorta la imagen como "cover".
    const alto = 2 * 100 * Math.tan((this.camara.fov * Math.PI) / 360) * 1.04;
    this.cielo.scale.set(alto * this.camara.aspect, alto, 1);
    const a = this.camara.aspect;
    const recorte = this.matCielo.uniforms.uRecorte!.value as Vector2;
    const desp = this.matCielo.uniforms.uDesp!.value as Vector2;
    if (a > CIELO_ASPECTO) recorte.set(1, CIELO_ASPECTO / a);
    else recorte.set(a / CIELO_ASPECTO, 1);
    // En vertical el encuadre se centra entre el sol y el barco.
    const centroX = this.vertical() ? 0.4 : 0.5;
    desp.set(Math.min(1 - recorte.x, Math.max(0, centroX - recorte.x / 2)), (1 - recorte.y) * 0.5);
  }

  private fotograma = (ahora: number): void => {
    this.raf = requestAnimationFrame(this.fotograma);
    if (document.hidden) {
      this.ultimo = ahora;
      return;
    }
    // Tiempo real (el guion no se ralentiza en equipos lentos; solo se ve a menos fotogramas).
    const dt = Math.min(0.25, (ahora - this.ultimo) / 1000);
    this.ultimo = ahora;
    this.tiempo += dt * this.acelerar;
    this.adaptarCalidad(dt);
    const t = this.tiempo;
    const { entrada, avance, deslumbre } = GUION_BARCO;
    const vertical = this.vertical();

    // Avance hacia la luz (0 → 1) y luz que lo cubre todo.
    const k = suave(avance, deslumbre, t);
    const luz = suave(avance - 1.2, deslumbre, t);

    // Cámara: respira, sigue un poco al puntero y, al final, avanza hacia el sol.
    this.punteroSuave.lerp(this.puntero, Math.min(1, dt * 2));
    this.camara.position.set(
      Math.sin(t * 0.21) * 0.12 + this.punteroSuave.x * 0.25,
      Math.sin(t * 0.33) * 0.07 - this.punteroSuave.y * 0.15,
      10 - k * k * 7,
    );
    this.camara.rotation.z = Math.sin(t * 0.27) * 0.006;

    // Dónde está el sol en el mundo: lo marca la imagen del cielo; se coloca la isla bajo él.
    const solPantalla = this.solEnPantalla();
    if (this.matCielo) {
      const u = this.matCielo.uniforms;
      u.uT!.value = t;
      u.uZoom!.value = 1 + k * k * 1.6;
      u.uLuz!.value = luz * 1.6;
    }

    // Barco: entra por la derecha, cabecea y avanza; al final se aleja hacia el sol y se funde.
    if (this.barco && this.matBarco) {
      const anchoMundo = vertical ? 4.8 : 6.4;
      const entra = 1 - Math.pow(1 - Math.min(1, t / entrada), 3);
      const x0 = vertical ? 0.15 : 2.4;
      const baseX = x0 + (1 - entra) * (vertical ? 4 : 7) - Math.max(0, t - entrada) * 0.07;
      const baseY = vertical ? -0.9 : -0.55;
      const destino = this.puntoBajoSol(-22);
      const xs = baseX + (destino.x - baseX) * k;
      const ys = baseY + Math.sin(t * 0.9) * 0.06 + Math.sin(t * 0.37 + 1) * 0.04 + (destino.y - 0.5 - baseY) * k;
      const zs = -22 * k * k;
      this.barco.position.set(xs, ys, zs);
      this.barco.rotation.z = Math.sin(t * 0.62 + 1) * 0.022 + Math.sin(t * 0.23) * 0.01;
      this.barco.scale.setScalar(anchoMundo / BARCO_ASPECTO);
      const u = this.matBarco.uniforms;
      u.uT!.value = t;
      u.uBruma!.value = suave(0.3, 1, k) * 0.85;
      u.uLuz!.value = luz;
    }

    if (this.isla) {
      const p = this.puntoBajoSol(-40);
      this.isla.position.set(p.x, p.y - 1.4, -40);
      (this.isla.material as MeshBasicMaterial).opacity = suave(3.5, 8, t) * 0.5 * (1 - suave(0.7, 1, k));
    }

    // Nubes: cada banco se desliza a su ritmo (las cercanas más deprisa: el barco avanza).
    for (const n of this.nubes) n.tex.offset.x -= n.vel * dt * (1 + k * 3);

    // Papeles.
    for (const p of this.papeles) {
      const m = p.mesh;
      m.position.x += p.vel.x * dt * (1 + k * 2);
      m.position.y += (p.vel.y + Math.sin(t * 1.3 + p.fase) * 0.35) * dt;
      m.rotation.x += p.giro.x * dt;
      m.rotation.y += p.giro.y * dt;
      m.rotation.z += p.giro.z * dt;
      if (m.position.x < -this.anchoVisible(m.position.z) * 0.62 || m.position.z > this.camara.position.z - 0.5) this.renacerPapel(p);
    }

    // Motas: viento hacia la izquierda con una turbulencia suave.
    if (this.motas && this.velMotas) {
      const pos = this.motas.geometry.getAttribute('position') as BufferAttribute;
      for (let i = 0; i < pos.count; i++) {
        let x = pos.getX(i) - this.velMotas[i]! * dt * (1 + k * 2.5);
        const y = pos.getY(i) + Math.sin(t * 0.8 + i) * dt * 0.15;
        if (x < -16) x = 16;
        pos.setXY(i, x, y);
      }
      pos.needsUpdate = true;
    }

    // Ráfagas.
    for (const f of this.rafagas) {
      const m = f.mesh;
      const mat = m.material as MeshBasicMaterial;
      if (f.espera > 0) {
        f.espera -= dt;
        mat.opacity = 0;
        if (f.espera <= 0) {
          const z = -5 + this.rnd() * 8;
          m.position.set(this.anchoVisible(z) * 0.7, (this.rnd() - 0.45) * this.altoVisible(z) * 0.6, z);
          m.rotation.z = 0.04 + this.rnd() * 0.08;
          f.vel = 7 + this.rnd() * 6;
        }
        continue;
      }
      m.position.x -= f.vel * dt;
      const ancho = this.anchoVisible(m.position.z);
      const recorrido = 1 - (m.position.x + ancho * 0.7) / (ancho * 1.4);
      mat.opacity = Math.sin(Math.min(1, Math.max(0, recorrido)) * Math.PI) * 0.35;
      if (m.position.x < -ancho * 0.7) f.espera = 1.5 + this.rnd() * 4.5;
    }

    // Rayos: ocasionales, breves (dos pulsos) y nunca durante el deslumbre.
    let flash = 0;
    if (t > this.proximoRayo && k < 0.12) {
      this.rayoInicio = t;
      this.proximoRayo = t + 3.2 + this.rnd() * 3.5;
      if (this.lienzoRayo && this.rayo) {
        dibujarRayo(this.lienzoRayo, Math.floor(this.rnd() * 1e6));
        (this.rayo.material as MeshBasicMaterial).map!.needsUpdate = true;
        const z = -26;
        this.rayo.position.set(this.anchoVisible(z) * (0.12 + this.rnd() * 0.3), this.altoVisible(z) * 0.18, z);
      }
    }
    const dr = t - this.rayoInicio;
    if (dr >= 0 && dr < 0.45) flash = dr < 0.07 ? 1 : dr < 0.12 ? 0.25 : dr < 0.2 ? 0.85 : Math.max(0, 1 - (dr - 0.2) / 0.25) * 0.6;
    if (this.rayo) (this.rayo.material as MeshBasicMaterial).opacity = flash * 0.9;
    if (this.matCielo) {
      this.matCielo.uniforms.uFlash!.value = flash * 0.55;
      if (this.rayo) {
        const p = this.rayo.position.clone().project(this.camara);
        (this.matCielo.uniforms.uFlashPos!.value as Vector2).set(p.x * 0.5 + 0.5, Math.min(0.95, p.y * 0.5 + 0.5));
      }
    }
    if (this.matBarco) this.matBarco.uniforms.uFlash!.value = flash;

    this.renderer.render(this.escena, this.camara);
    this.op.alFotograma(solPantalla, luz, t);
    if (!this.deslumbrado && t >= deslumbre) {
      this.deslumbrado = true;
      this.op.alDeslumbrar();
    }
  };

  /** Si en los primeros segundos va a menos de ~28 fps, baja la resolución de dibujo (una vez o dos). */
  private adaptarCalidad(dt: number): void {
    if (this.ajustes >= 2) return;
    this.muestras.push(dt);
    if (this.muestras.length < 45) return;
    const media = this.muestras.reduce((a, b) => a + b, 0) / this.muestras.length;
    this.muestras = [];
    if (media > 1 / 28) {
      this.ajustes++;
      this.renderer.setPixelRatio(Math.max(0.6, this.renderer.getPixelRatio() * 0.7));
      this.ajustar();
    } else this.ajustes = 2;
  }

  /** Posición del sol en pantalla (0–1, y desde arriba), según el recorte del cielo. */
  private solEnPantalla(): { x: number; y: number } {
    if (!this.matCielo) return { x: 0.3, y: 0.4 };
    const recorte = this.matCielo.uniforms.uRecorte!.value as Vector2;
    const desp = this.matCielo.uniforms.uDesp!.value as Vector2;
    return { x: (SOL.x - desp.x) / recorte.x, y: 1 - (SOL.y - desp.y) / recorte.y };
  }

  /** Punto del mundo, a la profundidad z, que cae sobre el sol en pantalla. */
  private puntoBajoSol(z: number): Vector3 {
    const s = this.solEnPantalla();
    const v = new Vector3(s.x * 2 - 1, -(s.y * 2 - 1), 0.5).unproject(this.camara);
    const dir = v.sub(this.camara.position).normalize();
    return this.camara.position.clone().add(dir.multiplyScalar((this.camara.position.z - z) / -dir.z));
  }

  private alMover = (e: PointerEvent): void => {
    if (e.pointerType === 'touch' || !this.contenedor) return;
    const r = this.contenedor.getBoundingClientRect();
    this.puntero.set(((e.clientX - r.left) / r.width - 0.5) * 2, ((e.clientY - r.top) / r.height - 0.5) * 2);
  };
}
