import { Group, type PerspectiveCamera, Sprite, SpriteMaterial, type Texture, TextureLoader, type Vector3 } from 'three';
import { nubeRealista, TEXTURAS_INTRO } from '../../ui/components/nubesRealistas.ts';
import { pseudoAleatorio } from '../../world/geometry.ts';

/*
 * Capa atmosférica del descenso de la intro: una franja de nubes realistas (la misma textura que
 * las nubes de la capa CSS) repartida sobre toda la ciudad. La cámara empieza por encima de la
 * franja y la atraviesa al bajar:
 *  - cada nube varía en escala, giro en su plano, altura y deriva (paralaje);
 *  - se disuelve al acercarse la cámara (sin "pop" de plano) y la capa entera se desvanece cuando
 *    la cámara queda por debajo;
 *  - sin escribir profundidad ni niebla: se integra sin artefactos con la maqueta.
 */

interface NubeAtmosferica {
  sprite: Sprite;
  base: number;
  ancho: number;
  deriva: number;
}

const cargador = new TextureLoader();
const texturas = new Map<string, Texture>();

function textura(variante: number, ancho: number): Texture | null {
  const url = nubeRealista(variante, ancho);
  if (!url) return null;
  let t = texturas.get(url);
  if (!t) {
    t = cargador.load(url);
    texturas.set(url, t);
  }
  return t;
}

export class CapaNubes {
  readonly raiz = new Group();
  private readonly nubes: NubeAtmosferica[] = [];
  private readonly suelo: number;

  /**
   * @param centro Centro de la ciudad (objetivo de la cámara).
   * @param radio Extensión horizontal de la capa.
   * @param suelo Altura (mundo) de la base de la franja; @param techo, de su cima.
   * @param paso Puntos de la trayectoria de la cámara (para poner algunas nubes en su camino).
   */
  constructor(centro: Vector3, radio: number, suelo: number, techo: number, paso: Vector3[]) {
    this.raiz.name = 'capa-nubes-descenso';
    this.suelo = suelo;
    const variantes = [...TEXTURAS_INTRO.lejanas, ...TEXTURAS_INTRO.cercanas];
    const total = 26;
    for (let i = 0; i < total; i++) {
      const [v, w] = variantes[i % variantes.length]!;
      const tex = textura(v, w);
      if (!tex) continue;
      const r1 = pseudoAleatorio(i, 71);
      const r2 = pseudoAleatorio(i, 73);
      const r3 = pseudoAleatorio(i, 79);
      let x: number;
      let z: number;
      let y: number;
      if (i < 7 && paso.length) {
        // Unas pocas en el camino de la cámara, algo por debajo y hacia la ciudad: primero se ven
        // venir (la cámara mira hacia abajo) y después se atraviesan.
        const p = paso[Math.min(paso.length - 1, Math.floor((i / 7) * paso.length))]!;
        x = p.x + (centro.x - p.x) * 0.08 + (r1 - 0.5) * 16;
        z = p.z + (centro.z - p.z) * 0.08 + (r2 - 0.5) * 16;
        y = Math.min(techo, Math.max(suelo, p.y - 3 - r3 * 9));
      } else {
        // El resto, repartidas por toda la ciudad: la capa es una franja, no un pasillo.
        const ang = r1 * Math.PI * 2;
        const dist = Math.sqrt(r2) * radio;
        x = centro.x + Math.cos(ang) * dist;
        z = centro.z + Math.sin(ang) * dist;
        y = suelo + r3 * (techo - suelo);
      }
      const ancho = (38 + pseudoAleatorio(i, 83) * 40) * (0.7 + pseudoAleatorio(i, 89) * 0.9);
      const material = new SpriteMaterial({ map: tex, transparent: true, depthWrite: false, fog: false, opacity: 0 });
      material.rotation = (pseudoAleatorio(i, 97) - 0.5) * 0.3;
      const sprite = new Sprite(material);
      sprite.position.set(x, y, z);
      sprite.scale.set(ancho, ancho / 2, 1);
      sprite.renderOrder = 7;
      this.raiz.add(sprite);
      this.nubes.push({ sprite, base: 0.78 + pseudoAleatorio(i, 101) * 0.22, ancho, deriva: 0.6 + pseudoAleatorio(i, 103) * 1.6 });
    }
  }

  /** Deriva, disolución por cercanía y desvanecimiento de la capa; `apagado` 0–1 la apaga entera. */
  actualizar(camara: PerspectiveCamera, dt: number, apagado: number): void {
    const camY = camara.position.y;
    // Por debajo de la franja la capa se desvanece; por encima, se ve entera.
    const capa = Math.min(1, Math.max(0, (camY - (this.suelo - 14)) / 18)) * (1 - apagado);
    for (const n of this.nubes) {
      n.sprite.position.x += n.deriva * dt;
      const d = camara.position.distanceTo(n.sprite.position);
      // Se disuelve al cruzarla: transparente pegada a la cámara, plena a partir de ~0,45 de su ancho.
      const cerca = Math.min(1, Math.max(0, (d - 4) / (n.ancho * 0.45)));
      (n.sprite.material as SpriteMaterial).opacity = n.base * cerca * capa;
    }
    this.raiz.visible = capa > 0.01;
  }

  liberar(): void {
    for (const n of this.nubes) (n.sprite.material as SpriteMaterial).dispose();
    this.raiz.removeFromParent();
  }
}
