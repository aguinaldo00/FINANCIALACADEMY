import {
  BoxGeometry,
  Color,
  ConeGeometry,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  Quaternion,
  SphereGeometry,
  Vector3,
} from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { pseudoAleatorio } from '../../world/geometry.ts';

/*
 * El personaje jugable: versión 3D y peluda del dibujo del usuario. Cuerpo redondeado azul petróleo
 * cubierto de pelo (mechones instanciados), dos orejas (una negra y otra azul), cinta roja con el
 * lazo y las colas a un lado, ojos grandes y dos patas. Mira hacia +z. Mide unas 1,6 unidades.
 */

const PALETA_AVATAR = {
  pelo: '#174b61',
  peloClaro: '#2b6c87',
  negro: '#101418',
  cinta: '#e8424a',
  lazo: '#a50f2f',
  ojo: '#f7f4ee',
  pupila: '#0c2633',
} as const;

export interface PartesAvatar {
  raiz: Group;
  cuerpo: Group;
  pataIzquierda: Mesh;
  pataDerecha: Mesh;
  colas: Group;
}

const mat = (color: string, rugosidad = 0.9) => new MeshStandardMaterial({ color, roughness: rugosidad });

/** Mechones repartidos sobre una caja redondeada (w × h × d), orientados según la normal. */
function pelaje(w: number, h: number, d: number, cantidad: number): InstancedMesh {
  const mechon = new ConeGeometry(0.075, 0.13, 5).translate(0, 0.05, 0);
  const malla = new InstancedMesh(mechon, new MeshStandardMaterial({ roughness: 1 }), cantidad);
  const m = new Matrix4();
  const q = new Quaternion();
  const arriba = new Vector3(0, 1, 0);
  const color = new Color();
  const base = new Color(PALETA_AVATAR.pelo);
  const claro = new Color(PALETA_AVATAR.peloClaro);
  let i = 0;
  for (let k = 0; i < cantidad; k++) {
    // Dirección aleatoria determinista → punto de la superficie de una "caja suave" (superelipsoide).
    const u = pseudoAleatorio(k, 1) * 2 - 1;
    const t = pseudoAleatorio(k, 2) * Math.PI * 2;
    const r = Math.sqrt(1 - u * u);
    const dir = new Vector3(r * Math.cos(t), u, r * Math.sin(t));
    const e = 6;
    const escala = 1 / ((Math.abs(dir.x) ** e + Math.abs(dir.y) ** e + Math.abs(dir.z) ** e) ** (1 / e));
    const p = new Vector3(dir.x * escala * (w / 2), dir.y * escala * (h / 2), dir.z * escala * (d / 2));
    // Sin pelo en la cara (donde van los ojos y la cinta) ni bajo el cuerpo.
    if (p.z > d / 2 - 0.08 && Math.abs(p.x) < w * 0.42 && p.y > -h * 0.35 && p.y < h * 0.3) continue;
    if (p.y < -h / 2 + 0.05) continue;
    const normal = new Vector3(p.x / (w / 2) ** 2, p.y / (h / 2) ** 2, p.z / (d / 2) ** 2).normalize();
    // Los mechones caen un poco: el pelo pesa.
    normal.y -= 0.45;
    normal.normalize();
    q.setFromUnitVectors(arriba, normal);
    const largo = 0.6 + pseudoAleatorio(k, 3) * 0.5;
    m.compose(p, q, new Vector3(1, largo, 1));
    malla.setMatrixAt(i, m);
    malla.setColorAt(i, color.copy(base).lerp(claro, pseudoAleatorio(k, 4) * 0.7));
    i++;
  }
  malla.castShadow = true;
  malla.name = 'pelaje';
  return malla;
}

export function construirAvatar(): PartesAvatar {
  const raiz = new Group();
  raiz.name = 'avatar';
  const cuerpo = new Group();
  cuerpo.name = 'avatar-cuerpo';
  const W = 1.15;
  const H = 1.0;
  const D = 0.9;
  const yCuerpo = 0.42 + H / 2;
  cuerpo.position.y = yCuerpo;

  const nucleo = new Mesh(new RoundedBoxGeometry(W, H, D, 4, 0.32), mat(PALETA_AVATAR.pelo));
  nucleo.castShadow = true;
  cuerpo.add(nucleo, pelaje(W, H, D, 1700));

  // Orejas: la izquierda negra, la derecha azul (como en el dibujo).
  const oreja = (color: string, x: number, inclinacion: number) => {
    const o = new Mesh(new ConeGeometry(0.17, 0.42, 4), mat(color));
    o.position.set(x, H / 2 + 0.16, -0.05);
    o.rotation.set(0, Math.PI / 4, inclinacion);
    o.castShadow = true;
    return o;
  };
  cuerpo.add(oreja(PALETA_AVATAR.negro, -0.3, 0.12), oreja(PALETA_AVATAR.pelo, 0.32, -0.12));

  // Cinta roja alrededor de la cabeza, por encima del pelo.
  const cinta = new Mesh(new RoundedBoxGeometry(W + 0.32, 0.22, D + 0.32, 2, 0.1), mat(PALETA_AVATAR.cinta, 0.7));
  cinta.position.y = 0.16;
  cinta.castShadow = true;
  cuerpo.add(cinta);

  // Lazo y colas a la derecha: se mecen al caminar.
  const colas = new Group();
  colas.name = 'avatar-colas';
  colas.position.set(W / 2 + 0.15, 0.12, -0.1);
  const nudo = new Mesh(new SphereGeometry(0.17, 14, 10), mat(PALETA_AVATAR.lazo, 0.7));
  const cola1 = new Mesh(new BoxGeometry(0.1, 0.55, 0.3).translate(0, -0.27, 0), mat(PALETA_AVATAR.lazo, 0.7));
  cola1.rotation.set(0.35, 0, -0.35);
  const cola2 = new Mesh(new BoxGeometry(0.1, 0.45, 0.24).translate(0, -0.22, 0), mat(PALETA_AVATAR.lazo, 0.7));
  cola2.rotation.set(-0.3, 0, -0.55);
  for (const p of [nudo, cola1, cola2]) p.castShadow = true;
  colas.add(nudo, cola1, cola2);
  cuerpo.add(colas);

  // Ojos grandes bajo la cinta.
  for (const lado of [-1, 1]) {
    const ojo = new Mesh(new SphereGeometry(0.2, 18, 14), mat(PALETA_AVATAR.ojo, 0.35));
    ojo.scale.set(1, 1, 0.45);
    ojo.position.set(lado * 0.24, -0.12, D / 2 + 0.03);
    const pupila = new Mesh(new SphereGeometry(0.07, 12, 10), mat(PALETA_AVATAR.pupila, 0.3));
    pupila.position.set(lado * 0.2, -0.08, D / 2 + 0.11);
    cuerpo.add(ojo, pupila);
  }

  // Patas: la izquierda negra, la derecha azul.
  const pata = (color: string, x: number) => {
    const p = new Mesh(new BoxGeometry(0.2, 0.46, 0.24).translate(0, -0.23, 0), mat(color));
    p.position.set(x, 0.46, 0);
    p.castShadow = true;
    return p;
  };
  const pataIzquierda = pata(PALETA_AVATAR.negro, -0.26);
  const pataDerecha = pata(PALETA_AVATAR.pelo, 0.26);
  pataIzquierda.name = 'avatar-pata-izquierda';
  pataDerecha.name = 'avatar-pata-derecha';

  raiz.add(cuerpo, pataIzquierda, pataDerecha);
  return { raiz, cuerpo, pataIzquierda, pataDerecha, colas };
}

/**
 * Animación del personaje: balanceo al caminar (proporcional a la velocidad) y colas de la cinta
 * que se quedan atrás. Con movimiento reducido solo se desplaza, sin balanceo.
 */
export function animarAvatar(p: PartesAvatar, t: number, velocidad: number, reducido: boolean): void {
  const k = reducido ? 0 : Math.min(1, velocidad / 6);
  const fase = t * 11;
  p.pataIzquierda.rotation.x = Math.sin(fase) * 0.7 * k;
  p.pataDerecha.rotation.x = -Math.sin(fase) * 0.7 * k;
  p.cuerpo.position.y = 0.42 + 0.5 + Math.abs(Math.sin(fase)) * 0.09 * k;
  p.cuerpo.rotation.z = Math.sin(fase) * 0.06 * k;
  p.colas.rotation.x = reducido ? 0 : -0.6 * k + Math.sin(t * 6) * 0.15 * k;
}
