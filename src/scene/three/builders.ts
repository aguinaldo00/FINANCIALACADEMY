import {
  BoxGeometry,
  BufferGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  EdgesGeometry,
  Group,
  IcosahedronGeometry,
  InstancedMesh,
  LineBasicMaterial,
  LineSegments,
  type Material,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  type Object3D,
  PlaneGeometry,
  RingGeometry,
  SphereGeometry,
} from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { colorDominio } from '../../ui/format.ts';
import type { EdificioVisual, ModeloCiudad, ZonaVisual } from '../../world/cityModel.ts';
import { centroRect, pseudoAleatorio, type Rect } from '../../world/geometry.ts';
import { ALTO_BARRIO, ALTO_ZONA, PALETA } from './palette.ts';

/*
 * Construcción de la maqueta a partir del modelo visual. Solo crea objetos Three.js
 * (sin renderer ni DOM), así que se puede probar en Node.
 *
 * - Capa estática: base, calles, barrios, zonas y arbolado. No depende del progreso.
 * - Capa dinámica: edificios, calor del Atlas, marcadores "Estudia ya" y tráfico. Se rehace
 *   cuando cambia el progreso.
 */

export type DatosSeleccionables = { tipo: 'zona'; seccionId: string } | { tipo: 'edificio'; conceptoId: string };

const materiales = new Map<string, MeshStandardMaterial>();
/** Materiales mate compartidos por color. */
function mate(color: string, rugosidad = 0.85): MeshStandardMaterial {
  const clave = `${color}|${rugosidad}`;
  let m = materiales.get(clave);
  if (!m) {
    m = new MeshStandardMaterial({ color, roughness: rugosidad, metalness: 0 });
    materiales.set(clave, m);
  }
  return m;
}

const mezclar = (a: string, b: string, t: number) => `#${new Color(a).lerp(new Color(b), t).getHexString()}`;

function caja(ancho: number, alto: number, fondo: number, material: Material, sombras = true): Mesh {
  const malla = new Mesh(new BoxGeometry(ancho, alto, fondo), material);
  malla.castShadow = sombras;
  malla.receiveShadow = true;
  return malla;
}

function losa(r: Rect, alto: number, y: number, material: Material, redondeo = 0): Mesh {
  const geometria = redondeo > 0
    ? new RoundedBoxGeometry(r.ancho, alto, r.fondo, 2, Math.min(redondeo, alto / 2, r.ancho / 2, r.fondo / 2))
    : new BoxGeometry(r.ancho, alto, r.fondo);
  const malla = new Mesh(geometria, material);
  const c = centroRect(r);
  malla.position.set(c.x, y + alto / 2, c.z);
  malla.receiveShadow = true;
  return malla;
}

/* ------------------------------------------------------------------ capa estática */

export function construirCapaEstatica(m: ModeloCiudad): Group {
  const capa = new Group();
  capa.name = 'estatica';
  const margen = 6;
  const lado = m.lado + margen * 2;

  // Peana de madera con el borde claro: lectura inmediata de "maqueta".
  const peana = losa({ x: -lado / 2, z: -lado / 2, ancho: lado, fondo: lado }, 4, -4, mate(PALETA.baseMadera, 0.7), 0.6);
  const borde = losa({ x: -lado / 2 + 0.6, z: -lado / 2 + 0.6, ancho: lado - 1.2, fondo: lado - 1.2 }, 0.05, -0.05, mate(PALETA.baseBorde));
  const asfalto = losa({ x: -m.lado / 2, z: -m.lado / 2, ancho: m.lado, fondo: m.lado }, 0.02, -0.02, mate(PALETA.avenida, 0.95));
  peana.receiveShadow = false;
  capa.add(peana, borde, asfalto);

  for (const b of m.barrios) {
    const tinte = PALETA.barrios[b.indice % PALETA.barrios.length]!;
    const placa = losa(b.parcela, ALTO_BARRIO, 0, mate(mezclar(PALETA.calle, tinte, 0.35), 0.95));
    placa.name = `barrio-${b.grupoId}`;
    capa.add(placa);
  }

  for (const z of m.zonas) capa.add(construirZona(z, m));
  capa.add(construirArbolado(m));
  return capa;
}

function construirZona(z: ZonaVisual, m: ModeloCiudad): Group {
  const grupo = new Group();
  grupo.name = `zona-${z.seccionId}`;
  const barrio = m.barrios.find((b) => b.grupoId === z.grupoId);
  const tinte = PALETA.barrios[(barrio?.indice ?? 0) % PALETA.barrios.length]!;

  const plataforma = losa(z.parcela, ALTO_ZONA - ALTO_BARRIO, ALTO_BARRIO, mate(mezclar(PALETA.acera, tinte, 0.45), 0.9), 0.25);
  plataforma.userData = { tipo: 'zona', seccionId: z.seccionId } satisfies DatosSeleccionables;
  plataforma.name = 'plataforma';
  const cesped = losa(z.interior, 0.04, ALTO_ZONA, mate(mezclar(PALETA.cesped, tinte, 0.15), 1));
  cesped.userData = plataforma.userData;
  grupo.add(plataforma, cesped);
  return grupo;
}

function construirArbolado(m: ModeloCiudad): Group {
  const grupo = new Group();
  grupo.name = 'arbolado';
  const n = m.arboles.length;
  if (!n) return grupo;

  const troncos = new InstancedMesh(new CylinderGeometry(0.12, 0.16, 1, 6), mate(PALETA.tronco), n);
  const copas = new InstancedMesh(new IcosahedronGeometry(0.75, 0), new MeshStandardMaterial({ roughness: 0.9, flatShading: true }), n);
  const matriz = new Matrix4();
  m.arboles.forEach((a, i) => {
    const e = a.escala;
    matriz.makeScale(e, e, e).setPosition(a.posicion.x, ALTO_ZONA + 0.5 * e, a.posicion.z);
    troncos.setMatrixAt(i, matriz);
    matriz.makeScale(e, e * 1.25, e).setPosition(a.posicion.x, ALTO_ZONA + 1.45 * e, a.posicion.z);
    copas.setMatrixAt(i, matriz);
    copas.setColorAt(i, new Color(PALETA.copa[Math.floor(pseudoAleatorio(i, 5) * PALETA.copa.length)]!));
  });
  troncos.castShadow = copas.castShadow = true;
  copas.receiveShadow = true;
  grupo.add(troncos, copas);
  return grupo;
}

/* ------------------------------------------------------------------ edificios */

/** Fracción de la altura final que está levantada en cada fase. */
export const ALTURA_POR_FASE = { solar: 0, obra: 0.5, completo: 1 } as const;
const VENTANAS_ENCENDIDAS = { solar: 0, obra: 0.35, completo: 0.85 } as const;

export function construirEdificio(e: EdificioVisual): Group {
  const grupo = new Group();
  grupo.name = `edificio-${e.conceptoId}`;
  grupo.position.set(e.posicion.x, ALTO_ZONA, e.posicion.z);
  grupo.userData = { tipo: 'edificio', conceptoId: e.conceptoId } satisfies DatosSeleccionables;

  const w = e.huella;
  const H = e.alturaCompleta;
  const h = H * ALTURA_POR_FASE[e.fase];
  const fachada = mate(mezclar(PALETA.fachadaClara, e.color, 0.16), 0.8);

  // Anillo de dominio en el suelo: mismo código de color que la ciudad 2D y las fichas.
  const anillo = new Mesh(
    new RingGeometry(w * 0.72 + 0.25, w * 0.72 + 0.6, 4, 1),
    new MeshBasicMaterial({ color: e.dominio > 0 ? colorDominio(e.dominio) : PALETA.sinEstudiar }),
  );
  anillo.rotation.set(-Math.PI / 2, 0, Math.PI / 4);
  anillo.position.y = 0.06;
  anillo.name = 'anillo-dominio';
  grupo.add(anillo);

  // Cimentación: existe siempre, el solar está listo para construir.
  const cimiento = caja(w + 0.5, 0.3, w + 0.5, mate(e.fase === 'solar' ? PALETA.cimiento : PALETA.zocalo), false);
  cimiento.position.y = 0.15;
  grupo.add(cimiento);

  if (e.fase === 'solar') {
    // Volumen fantasma: se ve lo que se construirá al estudiar el concepto.
    const fantasma = new Mesh(
      new BoxGeometry(w, H, w),
      new MeshBasicMaterial({ color: PALETA.fantasma, transparent: true, opacity: 0.1, depthWrite: false }),
    );
    fantasma.position.y = 0.3 + H / 2;
    fantasma.name = 'fantasma';
    grupo.add(fantasma, aristas(w, H, PALETA.fantasma, 0.55, 0.3));
    return grupo;
  }

  const cuerpo = new Mesh(new RoundedBoxGeometry(w, h, w, 2, Math.min(0.22, w / 8)), fachada);
  cuerpo.position.y = 0.3 + h / 2;
  cuerpo.castShadow = cuerpo.receiveShadow = true;
  cuerpo.name = 'cuerpo';
  grupo.add(cuerpo);
  grupo.add(ventanas(e, w, h));

  if (e.fase === 'obra') {
    // Andamio con la silueta de lo que falta por construir.
    const andamio = aristas(w + 0.3, H - h, PALETA.andamio, 0.9, 0.3 + h);
    andamio.name = 'andamio';
    grupo.add(andamio);
    return grupo;
  }

  // Cornisa con el color del concepto y remate según el tejado de la portada.
  const cornisa = caja(w + 0.3, 0.35, w + 0.3, mate(e.color, 0.6));
  cornisa.position.y = 0.3 + h;
  grupo.add(cornisa);
  const remate = tejado(e, w);
  remate.position.y = 0.3 + h + 0.17;
  grupo.add(remate);
  return grupo;
}

function aristas(w: number, alto: number, color: string, opacidad: number, y: number): LineSegments {
  const geometria = new EdgesGeometry(new BoxGeometry(w, Math.max(alto, 0.01), w));
  const lineas = new LineSegments(geometria, new LineBasicMaterial({ color, transparent: opacidad < 1, opacity: opacidad }));
  lineas.position.y = y + alto / 2;
  return lineas;
}

const geometriaVentana = new BoxGeometry(0.42, 0.62, 0.06);

function ventanas(e: EdificioVisual, w: number, h: number): InstancedMesh {
  const filas = Math.max(0, Math.floor((h - 1.2) / 1.25));
  const columnas = Math.max(1, Math.floor((w - 0.6) / 0.95));
  const total = filas * columnas * 4;
  const malla = new InstancedMesh(geometriaVentana, new MeshBasicMaterial(), Math.max(total, 1));
  malla.count = total;
  malla.name = 'ventanas';
  const encendidas = VENTANAS_ENCENDIDAS[e.fase];
  const luz = new Color(PALETA.ventanaEncendida);
  const apagada = new Color(PALETA.ventanaApagada);
  const matriz = new Matrix4();
  const giro = new Matrix4();
  let i = 0;
  for (let cara = 0; cara < 4; cara++) {
    giro.makeRotationY((cara * Math.PI) / 2);
    for (let f = 0; f < filas; f++) {
      for (let c = 0; c < columnas; c++) {
        const x = (c - (columnas - 1) / 2) * 0.95;
        matriz.makeTranslation(x, 1.1 + f * 1.25, w / 2 + 0.02).premultiply(giro);
        malla.setMatrixAt(i, matriz);
        const semilla = e.conceptoId.length * 13 + cara * 7;
        malla.setColorAt(i, pseudoAleatorio(semilla + f, c) < encendidas ? luz : apagada);
        i++;
      }
    }
  }
  return malla;
}

function tejado(e: EdificioVisual, w: number): Group {
  const g = new Group();
  const pizarra = mate(PALETA.tejado, 0.7);
  switch (e.tejado) {
    case 'fronton':
    case 'granero': {
      const teja = e.tejado === 'granero' ? mate(PALETA.tejadoTeja, 0.75) : pizarra;
      const cubierta = new Mesh(new ConeGeometry(w * 0.72, w * 0.45, 4, 1), teja);
      cubierta.rotation.y = Math.PI / 4;
      cubierta.position.y = w * 0.225;
      cubierta.castShadow = true;
      g.add(cubierta);
      break;
    }
    case 'cupula': {
      const cupula = new Mesh(new SphereGeometry(w * 0.34, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), mate('#9fb3b0', 0.5));
      cupula.castShadow = true;
      g.add(cupula);
      break;
    }
    case 'bandera': {
      const mastil = caja(0.08, 2.4, 0.08, mate('#8a8a8a'));
      mastil.position.y = 1.2;
      const bandera = caja(1.1, 0.62, 0.04, mate(e.color, 0.6));
      bandera.geometry.translate(0.55, 0, 0);
      bandera.position.set(0.04, 2.05, 0);
      bandera.name = 'bandera';
      g.add(mastil, bandera);
      break;
    }
    case 'antena': {
      const mastil = caja(0.1, 2.8, 0.1, mate('#8a8a8a'));
      mastil.position.y = 1.4;
      const baliza = new Mesh(new SphereGeometry(0.16, 10, 8), new MeshBasicMaterial({ color: '#ff5a5a' }));
      baliza.position.y = 2.9;
      baliza.name = 'baliza';
      g.add(mastil, baliza);
      break;
    }
    case 'ruina': {
      // El prototipo dibuja la caja "mordida": esquina rota en la azotea.
      const resto = caja(w * 0.45, 0.7, w * 0.4, mate(PALETA.zocalo));
      resto.position.set(-w * 0.25, 0.35, -w * 0.28);
      g.add(resto);
      break;
    }
    case 'plano': {
      const maquinaria = caja(w * 0.36, 0.55, w * 0.3, mate('#b9b3aa'));
      maquinaria.position.set(w * 0.12, 0.28, -w * 0.1);
      g.add(maquinaria);
      break;
    }
  }
  return g;
}

/* ------------------------------------------------------------------ capa dinámica */

export interface RutaCoche {
  rect: Rect;
  /** Posición inicial en el recorrido (0–1) y vueltas por segundo. */
  inicio: number;
  velocidad: number;
}

export interface CapaDinamica {
  raiz: Group;
  edificios: Map<string, Group>;
  /** Superposición de color por zona para la lectura de Atlas. */
  calor: Mesh[];
  marcadores: Group[];
  coches: InstancedMesh | null;
  rutas: RutaCoche[];
}

export function construirCapaDinamica(m: ModeloCiudad): CapaDinamica {
  const raiz = new Group();
  raiz.name = 'dinamica';
  const edificios = new Map<string, Group>();
  for (const e of m.edificios) {
    const g = construirEdificio(e);
    edificios.set(e.conceptoId, g);
    raiz.add(g);
  }

  const calor = m.zonas.map((z) => {
    const c = centroRect(z.parcela);
    const plano = new Mesh(
      new PlaneGeometry(z.parcela.ancho, z.parcela.fondo),
      new MeshBasicMaterial({
        color: z.dominio > 0 ? colorDominio(z.dominio) : PALETA.sinEstudiar,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    );
    plano.rotation.x = -Math.PI / 2;
    plano.position.set(c.x, ALTO_ZONA + 0.08, c.z);
    plano.visible = false;
    plano.name = `calor-${z.seccionId}`;
    raiz.add(plano);
    return plano;
  });

  // "Estudia ya": un hito sobre las zonas prioritarias, visible también sin animación.
  const marcadores = m.zonas
    .filter((z) => z.prioridad !== null)
    .map((z) => {
      const g = new Group();
      g.name = `estudia-ya-${z.prioridad}`;
      const material = new MeshStandardMaterial({ color: PALETA.marcador, emissive: PALETA.marcador, emissiveIntensity: 0.35 });
      const punta = new Mesh(new ConeGeometry(0.7, 1.8, 4), material);
      punta.rotation.x = Math.PI;
      const cabeza = new Mesh(new SphereGeometry(0.75, 16, 12), material);
      cabeza.position.y = 1.2;
      punta.castShadow = cabeza.castShadow = true;
      g.add(punta, cabeza);
      const c = centroRect(z.parcela);
      const alto = Math.max(0, ...m.edificios.filter((e) => e.seccionId === z.seccionId).map((e) => e.alturaCompleta));
      g.scale.setScalar(0.8);
      g.position.set(c.x, ALTO_ZONA + alto + 5, c.z);
      g.userData = { baseY: g.position.y };
      raiz.add(g);
      return g;
    });

  // Tráfico: solo hay actividad en las zonas que ya has empezado a estudiar.
  const rutas: RutaCoche[] = [];
  for (const [k, z] of m.zonas.entries()) {
    if (z.dominio <= 0) continue;
    const cantidad = Math.max(1, Math.round(z.dominio * 3));
    for (let i = 0; i < cantidad; i++) {
      rutas.push({ rect: z.lote, inicio: (i / cantidad + pseudoAleatorio(k, i) * 0.2) % 1, velocidad: 0.012 + pseudoAleatorio(i, k) * 0.01 });
    }
  }
  let coches: InstancedMesh | null = null;
  if (rutas.length) {
    coches = new InstancedMesh(new RoundedBoxGeometry(0.95, 0.5, 0.5, 1, 0.12), new MeshStandardMaterial({ roughness: 0.5 }), rutas.length);
    rutas.forEach((_, i) => coches!.setColorAt(i, new Color(PALETA.coches[i % PALETA.coches.length]!)));
    coches.castShadow = true;
    coches.name = 'trafico';
    colocarCoches(coches, rutas, 0);
    raiz.add(coches);
  }

  return { raiz, edificios, calor, marcadores, coches, rutas };
}

const matrizCoche = new Matrix4();
const giroCoche = new Matrix4();

/** Coloca cada coche en su recorrido alrededor de la manzana en el instante `t` (segundos). */
export function colocarCoches(coches: InstancedMesh, rutas: RutaCoche[], t: number): void {
  rutas.forEach((ruta, i) => {
    const { rect } = ruta;
    const perimetro = 2 * (rect.ancho + rect.fondo);
    let d = (((ruta.inicio + t * ruta.velocidad) % 1) + 1) % 1 * perimetro;
    let x: number, z: number, angulo: number;
    if (d < rect.ancho) {
      x = rect.x + d; z = rect.z; angulo = 0;
    } else if ((d -= rect.ancho) < rect.fondo) {
      x = rect.x + rect.ancho; z = rect.z + d; angulo = -Math.PI / 2;
    } else if ((d -= rect.fondo) < rect.ancho) {
      x = rect.x + rect.ancho - d; z = rect.z + rect.fondo; angulo = Math.PI;
    } else {
      d -= rect.ancho;
      x = rect.x; z = rect.z + rect.fondo - d; angulo = Math.PI / 2;
    }
    giroCoche.makeRotationY(angulo);
    matrizCoche.makeTranslation(x, ALTO_BARRIO + 0.26, z).multiply(giroCoche);
    coches.setMatrixAt(i, matrizCoche);
  });
  coches.instanceMatrix.needsUpdate = true;
}

/** Libera geometrías y materiales no compartidos de un subárbol. */
export function liberar(objeto: Object3D): void {
  const compartidos = new Set<Material>(materiales.values());
  objeto.traverse((o) => {
    const malla = o as Partial<Mesh>;
    if (malla.geometry instanceof BufferGeometry && malla.geometry !== geometriaVentana) malla.geometry.dispose();
    const lista = Array.isArray(malla.material) ? malla.material : malla.material ? [malla.material] : [];
    for (const mat of lista) if (!compartidos.has(mat)) mat.dispose();
  });
}
