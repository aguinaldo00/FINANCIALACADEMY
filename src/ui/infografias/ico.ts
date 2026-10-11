/*
 * Infografía del ICO en dirección «Calcografía» (primera lámina; las otras 11 siguen con el dibujo
 * genérico hasta que esta se apruebe). Los textos salen de los datos de la infografía `ico`
 * (src/content/temas/tema-01/infografias.ts); solo se añaden dos glosas de lenguaje sencillo
 * comprobadas: «se financia» = emite bonos que compran inversores, y «garantía explícita» = si el ICO
 * no pagara sus deudas, pagaría el Estado (RD 706/1999, art. 24).
 *
 * Se mantiene el contrato del componente genérico: figura `.ig`, actores `.ig-actor[data-actor]` con
 * `.activo`, texto `.ig-texto` («Paso n de m.») y los mismos controles.
 */
import type { Infografia } from '../../content/schema.ts';
import { iconoUi } from '../../icons/ui.ts';
import { marcarSiglas } from '../components/siglas.ts';
import { bandaHolografica, cinta, type Curva, curvaD, fachada, filacteria, roseta, vineta } from './calcografia.ts';

type Ancla = 'start' | 'middle' | 'end';
type Rotulo = readonly [number, number, Ancla];
type Caja = readonly [number, number, number, number];

interface Composicion {
  w: number;
  h: number;
  mercados: readonly [number, number];
  estado: readonly [number, number];
  ovalo: readonly [number, number];
  /** Nombre y glosa de mercados y Estado; en móvil la glosa va en dos líneas. */
  nombres: { mercados: Rotulo; estado: Rotulo };
  glosas: { mercados: Rotulo; estado: Rotulo };
  partir: boolean;
  ico: readonly [number, number];
  roseta: number;
  disco: number;
  edificio: readonly [number, number];
  papelBanco: readonly [number, number, number];
  papelAgencia: readonly [number, number, number];
  financia: Curva;
  fondos: Curva;
  vias: readonly [Curva, Curva, Curva];
  bono: readonly [number, number, number];
  garantia: Curva;
  rotuloGarantia: Rotulo;
  notas: { financia: Rotulo; fondos: Rotulo; v1: Rotulo | null; v2: Rotulo | null };
  holo: Caja;
  cupones: readonly [Caja, Caja, Caja];
  interlinea: number;
  leyenda: Rotulo | null;
}

/** Escritorio: placa a la izquierda, banda holográfica y los tres cupones (vías) a la derecha. */
const HORIZONTAL: Composicion = {
  w: 1000, h: 620,
  // Todo es simétrico respecto a y = 310, el centro del ICO y del cupón central.
  mercados: [130, 164], estado: [130, 456], ovalo: [96, 66],
  nombres: { mercados: [130, 262, 'middle'], estado: [130, 554, 'middle'] },
  glosas: { mercados: [130, 282, 'middle'], estado: [130, 574, 'middle'] },
  partir: false,
  ico: [404, 310], roseta: 140, disco: 100, edificio: [136, 114],
  papelBanco: [404, 170, 180], papelAgencia: [404, 450, 290],
  financia: [[226, 174], [268, 174], [300, 222], [332, 244]],
  fondos: [[226, 446], [268, 446], [300, 398], [332, 376]],
  vias: [
    [[475, 239], [580, 158], [630, 110], [702, 107]],
    [[504, 310], [600, 310], [650, 310], [702, 310]],
    [[475, 381], [580, 462], [630, 510], [702, 513]],
  ],
  bono: [282, 201, -10],
  garantia: [[190, 398], [206, 338], [248, 264], [268, 222]],
  rotuloGarantia: [22, 318, 'start'],
  // Las vías 1 y 2 ya se nombran en sus cupones: no se repiten sobre las cintas.
  notas: { financia: [300, 146, 'middle'], fondos: [300, 486, 'middle'], v1: null, v2: null },
  holo: [678, 14, 10, 592],
  cupones: [[700, 14, 286, 186], [700, 217, 286, 186], [700, 420, 286, 186]],
  interlinea: 20,
  leyenda: [340, 607, 'middle'],
};

/** Móvil: mercados arriba, el ICO en el centro, el Estado debajo y los tres cupones apilados. */
const VERTICAL: Composicion = {
  w: 440, h: 1372,
  mercados: [86, 86], estado: [86, 724], ovalo: [64, 48],
  nombres: { mercados: [166, 78, 'start'], estado: [166, 716, 'start'] },
  glosas: { mercados: [166, 102, 'start'], estado: [166, 740, 'start'] },
  partir: true,
  ico: [220, 470], roseta: 140, disco: 98, edificio: [132, 110],
  papelBanco: [220, 318, 200], papelAgencia: [220, 624, 290],
  financia: [[86, 134], [86, 200], [120, 300], [158, 380]],
  fondos: [[100, 676], [112, 620], [140, 584], [160, 560]],
  vias: [
    [[290, 404], [380, 380], [392, 560], [392, 786]],
    [[318, 470], [400, 470], [408, 600], [408, 786]],
    [[290, 536], [390, 560], [424, 640], [424, 786]],
  ],
  bono: [90, 190, -8],
  garantia: [[34, 676], [14, 520], [18, 300], [56, 210]],
  rotuloGarantia: [140, 172, 'start'],
  notas: { financia: [130, 262, 'start'], fondos: [124, 660, 'start'], v1: null, v2: null },
  holo: [20, 788, 400, 8],
  cupones: [[20, 806, 400, 176], [20, 994, 400, 176], [20, 1182, 400, 176]],
  interlinea: 22,
  leyenda: null,
};

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const t = (x: number, y: number, texto: string, clase: string, ancla: Ancla = 'start') =>
  `<text x="${x}" y="${y}" text-anchor="${ancla}" class="${clase}">${esc(texto)}</text>`;
const rot = ([x, y, a]: Rotulo, texto: string, clase: string) => t(x, y, texto, clase, a);

/** Bolsa: fachada con un friso que es una línea de cotización. */
function bolsa(cx: number, base: number): string {
  let s = fachada(cx, base, 132, 92, '', 5);
  const pts: string[] = [];
  for (let i = 0; i < 11; i++) pts.push(`${(cx - 46 + i * 9.2).toFixed(1)} ${(base - 79 + 6 * Math.sin(i * 1.3) - i * 1.4).toFixed(1)}`);
  s += `<path d="M${pts.join(' L')}" class="lc-tinta-oro lc-trazo-color"/>`;
  return s;
}

/** Palacio del Estado: fachada con cúpula y bandera. */
function palacio(cx: number, base: number): string {
  const top = base - 72;
  let s = fachada(cx, base, 150, 72, '', 7);
  s += `<path d="M${cx - 34} ${top + 3} A34 31 0 0 1 ${cx + 34} ${top + 3}" class="lc-g lc-g-fuerte"/>`;
  for (let i = 1; i < 5; i++) s += `<path d="M${(cx - 34 + i * 13.6).toFixed(1)} ${top + 3} Q${cx} ${top - 26} ${(cx - 34 + i * 13.6).toFixed(1)} ${top + 3}" class="lc-g lc-g-fino"/>`;
  s += `<path d="M${cx} ${top - 28} V${top - 46}" class="lc-g"/><path d="M${cx} ${top - 46} l15 4 l-15 4 Z" class="lc-relleno-violeta"/>`;
  return s;
}

/** Contenido de cada viñeta de cupón, dibujado en una caja de 104 × 88. */
const VINETAS = {
  banco: `<g class="lc-riesgo">${fachada(28, 80, 46, 52, '', 4).replace(/lc-g/g, 'lc-r')}</g>`,
  pyme: `<path d="M60 42 C66 36 72 36 78 42" class="lc-tinta-cobre lc-trazo-color"/><path d="M76 40 l3 3 l-4 1" class="lc-tinta-cobre lc-trazo-color"/>
<path d="M70 56 h30 l-3 -8 h-24 Z M70 56 q3.75 5 7.5 0 q3.75 5 7.5 0 q3.75 5 7.5 0 q3.75 5 7.5 0 M72 58 v22 h26 v-22 M81 80 v-11 h8 v11" class="lc-p"/>`,
  proyecto: `<path d="M14 82 V14 M4 20 H86 M14 14 L30 20 M74 20 V36 M69 36 h10 M2 82 H100" class="lc-p"/>
<path d="M44 82 V44 H86 V82 M44 56 H86 M44 68 H86 M58 44 V82 M72 44 V82" class="lc-p lc-p-fino"/>`,
  icoRiesgo: `<g transform="translate(84 84) scale(.32)"><g class="lc-riesgo">${fachada(0, 0, 70, 78, 'ICO', 4).replace(/lc-g/g, 'lc-r').replace('lc-rotulo-fachada', 'lc-rotulo-riesgo')}</g></g>`,
  ayudas: `<path d="M4 80 V52 L22 38 L40 52 V80 M14 80 v-13 h10 v13 M0 54 L22 34 L44 54" class="lc-tinta-violeta lc-trazo-color"/>
<path d="M50 70 H96 L90 80 H56 Z M56 70 V58 H67 V70 M71 70 V53 H82 V70" class="lc-tinta-violeta lc-trazo-color"/>`,
  brote: `<path d="M84 34 V12 M84 22 q-12 -2 -12 -13 q12 0 12 13 M84 16 q10 -2 11 -12 q-11 0 -11 12" class="lc-tinta-violeta lc-trazo-color" transform="translate(-30 0)"/>`,
  sinRiesgo: `<g class="lc-riesgo"><rect x="78" y="6" width="22" height="22" class="lc-r lc-r-hueco"/><path d="M74 32 L104 2" class="lc-r"/></g>`,
};

interface DatosCupon {
  num: string;
  titulo: string;
  tinta: string;
  vineta: string;
  nombres: string[];
  flujo: string;
  riesgo: string;
}

function cupon([x, y, w, h]: Caja, d: DatosCupon, interlinea: number): string {
  let trepado = '';
  for (let yy = y + 8; yy < y + h; yy += 10) trepado += `<circle cx="${x}" cy="${yy}" r="2.4" class="lc-trepado"/>`;
  return `<g class="lc-cupon ${d.tinta}">
<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" class="lc-cupon-papel"/>
<rect x="${x + 6}" y="${y + 6}" width="${w - 12}" height="${h - 12}" class="lc-cupon-marco"/>${trepado}
<rect x="${x + 6}" y="${y + 6}" width="${w - 12}" height="30" class="lc-cupon-cabecera"/>
${roseta(x + w - 22, y + 21, 11, 'lc-cupon-roseta', 2, 240)}
<text x="${x + 20}" y="${y + 31}" text-anchor="middle" class="lc-cupon-num">${d.num}</text>
<text x="${x + 38}" y="${y + 26}" class="lc-caps lc-cupon-titulo">${esc(d.titulo)}</text>
<g transform="translate(${x + 12} ${y + 42})" class="lc-cupon-vineta">${d.vineta}</g>
${d.nombres.map((n, i) => t(x + 124, y + 66 + i * interlinea, n, 'lc-cupon-nombre')).join('')}
${t(x + 14, y + h - 36, d.flujo, 'lc-cupon-flujo')}
<g class="lc-riesgo">${t(x + 14, y + h - 14, d.riesgo, 'lc-caps lc-cupon-riesgo')}</g>
</g>`;
}

/** Parte un nombre largo en dos líneas por el espacio más cercano a la mitad. */
function partir(texto: string, maximo = 16): string[] {
  if (texto.length <= maximo) return [texto];
  const espacios = [...texto.matchAll(/ /g)].map((m) => m.index!);
  if (!espacios.length) return [texto];
  const corte = espacios.reduce((a, b) => (Math.abs(b - texto.length / 2) < Math.abs(a - texto.length / 2) ? b : a));
  return [texto.slice(0, corte), texto.slice(corte + 1)];
}

/** Envuelve un dibujo como actor del contrato común (para destacar y para las pruebas). */
const actor = (id: string, contenido: string) => `<g class="ig-actor" data-actor="${id}">${contenido}</g>`;

function dibujo(info: Infografia, c: Composicion, p: string): string {
  const nombre = (id: string) => info.actores.find((a) => a.id === id)?.etiqueta ?? id;
  const flujo = (n: number) => info.flujos[n]?.etiqueta ?? '';
  const [ix, iy] = c.ico;
  const [mx, my] = c.mercados;
  const [ex, ey] = c.estado;
  const [rx, ry] = c.ovalo;
  // Glosa en una línea (escritorio) o en dos (móvil).
  const glosa = ([x, y, a]: Rotulo, partes: string[]) =>
    c.partir ? partes.map((l, i) => t(x, y + i * 20, l, 'lc-glosa', a)).join('') : t(x, y, partes.join(' '), 'lc-glosa', a);
  let rayasPlaca = '';
  for (let y = 0; y < c.h; y += 3) rayasPlaca += `M0 ${y} H${c.w} `;

  // Fondo: placa luminosa con varios tonos (no un grabado de un solo color) y una luz detrás del ICO.
  let s = `<defs>
<linearGradient id="${p}-placa" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#24337f"/><stop offset=".48" stop-color="#3b2a7c"/><stop offset="1" stop-color="#11596a"/></linearGradient>
<radialGradient id="${p}-luz" cx="${(ix / c.w).toFixed(3)}" cy="${(iy / c.h).toFixed(3)}" r="${(0.75 * c.roseta / Math.min(c.w, c.h) * 2).toFixed(3)}"><stop offset="0" stop-color="#ffdca6" stop-opacity=".42"/><stop offset=".55" stop-color="#ff9f7a" stop-opacity=".12"/><stop offset="1" stop-color="#ff9f7a" stop-opacity="0"/></radialGradient>
<clipPath id="${p}-sup"><rect x="0" y="0" width="${c.w}" height="${iy}"/></clipPath><clipPath id="${p}-inf"><rect x="0" y="${iy}" width="${c.w}" height="${c.h}"/></clipPath>
<radialGradient id="${p}-agua"><stop offset="0" stop-color="#cbb8ff" stop-opacity=".9"/><stop offset=".7" stop-color="#a796e8" stop-opacity=".25"/><stop offset="1" stop-color="#a796e8" stop-opacity="0"/></radialGradient>
</defs>
<rect width="${c.w}" height="${c.h}" rx="14" fill="url(#${p}-placa)"/><rect width="${c.w}" height="${c.h}" rx="14" fill="url(#${p}-luz)"/>
<path d="${rayasPlaca}" class="lc-rayas-placa"/>
<rect x="6" y="6" width="${c.w - 12}" height="${c.h - 12}" rx="10" class="lc-g lc-g-fino"/>`;

  // ---- Paso 1: de dónde sale el dinero del ICO ----
  let e1 = '';
  e1 += actor('estado', vineta(`${p}-ov-e`, ex, ey, rx, ry, `<g transform="translate(${ex} ${ey}) scale(${(rx / 96).toFixed(3)})">${palacio(0, 41)}</g>`, 'lc-tinta-violeta') +
    rot(c.nombres.estado, nombre('estado'), 'lc-nombre') + glosa(c.glosas.estado, ['respalda sus deudas', 'y le asigna fondos']));
  e1 += actor('mercados', vineta(`${p}-ov-m`, mx, my, rx, ry, `<g transform="translate(${mx} ${my}) scale(${(rx / 96).toFixed(3)})">${bolsa(0, 40)}</g>`, 'lc-tinta-oro') +
    rot(c.nombres.mercados, nombre('mercados'), 'lc-nombre') + glosa(c.glosas.mercados, ['inversores que compran', 'bonos del ICO']));
  // El ICO: una roseta de dos tintas (cobre arriba = banco público; violeta abajo = agencia del Estado).
  e1 += actor('ico', `<g clip-path="url(#${p}-sup)">${roseta(ix, iy, c.roseta, 'lc-roseta lc-tinta-cobre')}</g><g clip-path="url(#${p}-inf)">${roseta(ix, iy, c.roseta, 'lc-roseta lc-tinta-violeta')}</g>
<circle cx="${ix}" cy="${iy}" r="${c.disco}" class="lc-disco"/><circle cx="${ix}" cy="${iy}" r="${c.disco - 6}" class="lc-g lc-g-fino"/>
${fachada(ix, iy + c.edificio[1] * 0.4, c.edificio[0], c.edificio[1], 'ICO', 6)}
${t(ix, iy + c.edificio[1] * 0.4 + 30, 'Instituto de Crédito Oficial', 'lc-caps lc-caps-claro', 'middle')}`);
  e1 += cinta(c.financia, 'lc-tinta-oro');
  e1 += rot(c.notas.financia, flujo(0), 'lc-nota lc-tinta-oro');
  // El bono del ICO lleva la marca de agua del Estado: la garantía explícita.
  const [bx, by, bg] = c.bono;
  e1 += `<path d="${curvaD(c.garantia)}" class="lc-garantia"/>`;
  e1 += `<g transform="translate(${bx} ${by}) rotate(${bg})"><g class="lc-bono"><rect x="-36" y="-21" width="72" height="42" class="lc-bono-papel"/><rect x="-32" y="-17" width="64" height="34" class="lc-bono-marco"/>
<text x="-4" y="-3" text-anchor="middle" class="lc-caps lc-bono-texto">bono ICO</text><circle cx="18" cy="8" r="17" fill="url(#${p}-agua)"/>
<path d="M8 14 h20 M10 14 v-7 h16 v7 M12 7 l6 -5 l6 5" class="lc-tinta-violeta lc-trazo-color"/></g></g>`;
  const [gx, gy, ga] = c.rotuloGarantia;
  e1 += t(gx, gy, flujo(1), 'lc-nota lc-tinta-violeta', ga) + t(gx, gy + 19, 'si el ICO no pagara sus deudas,', 'lc-glosa', ga) + t(gx, gy + 37, 'pagaría el Estado', 'lc-glosa', ga);
  if (c.leyenda) e1 += rot(c.leyenda, 'entidad pública empresarial · agencia financiera del Estado', 'lc-caps lc-leyenda');
  s += `<g class="lc-e" data-e="1">${e1}</g>`;

  // La banda holográfica: frontera por la que el dinero sale hacia las tres vías.
  s += `<g class="lc-e" data-e="2">${bandaHolografica(`${p}-holo`, ...c.holo)}</g>`;

  // ---- Paso 2: vía 1 · líneas de mediación (riesgo del banco) ----
  const [riesgo1] = flujo(3).split(' · ').slice(1);
  let e2 = filacteria(...c.papelBanco, 'como banco público', 'lc-tinta-cobre');
  e2 += cinta(c.vias[0], 'lc-tinta-cobre');
  if (c.notas.v1) e2 += rot(c.notas.v1, flujo(2), 'lc-nota lc-tinta-cobre');
  e2 += cupon(c.cupones[0], {
    num: '1', titulo: 'Vía 1 · línea de mediación', tinta: 'lc-cupon-cobre',
    vineta: actor('banco', VINETAS.banco) + actor('pyme', VINETAS.pyme),
    nombres: [nombre('banco'), `→ ${nombre('pyme')}`], flujo: flujo(3).split(' · ')[0] ?? '', riesgo: riesgo1 ?? '',
  }, c.interlinea);
  s += `<g class="lc-e" data-e="2">${e2}</g>`;

  // ---- Paso 3: vía 2 · financiación directa (riesgo del ICO) ----
  const [directa, riesgo2] = flujo(4).split(' · ');
  let e3 = cinta(c.vias[1], 'lc-tinta-turquesa');
  if (c.notas.v2) e3 += rot(c.notas.v2, directa ?? '', 'lc-nota lc-tinta-turquesa');
  e3 += cupon(c.cupones[1], {
    num: '2', titulo: 'Vía 2 · financiación directa', tinta: 'lc-cupon-turquesa',
    vineta: actor('proyecto', VINETAS.proyecto) + VINETAS.icoRiesgo,
    nombres: partir(nombre('proyecto')), flujo: directa ?? '', riesgo: riesgo2 ?? '',
  }, c.interlinea);
  s += `<g class="lc-e" data-e="3">${e3}</g>`;

  // ---- Paso 4: agencia financiera del Estado (el ICO no asume el riesgo) ----
  let e4 = filacteria(...c.papelAgencia, 'como agencia financiera del Estado', 'lc-tinta-violeta');
  e4 += cinta(c.fondos, 'lc-tinta-violeta') + rot(c.notas.fondos, flujo(5), 'lc-nota lc-tinta-violeta');
  e4 += cinta(c.vias[2], 'lc-tinta-violeta');
  e4 += cupon(c.cupones[2], {
    num: '3', titulo: 'Vía 3 · agencia del Estado', tinta: 'lc-cupon-violeta',
    vineta: actor('ayudas', VINETAS.ayudas + VINETAS.brote) + VINETAS.sinRiesgo,
    nombres: partir(nombre('ayudas')), flujo: flujo(6), riesgo: 'el riesgo es del Estado, no del ICO',
  }, c.interlinea);
  s += `<g class="lc-e" data-e="4">${e4}</g>`;

  // ---- Paso 5: para el examen. Se marcan a la vez los tres cupones según quién asume el riesgo ----
  s += `<g class="lc-e" data-e="5">${c.cupones.map(([x, y, w, h], i) => `<rect x="${x - 3}" y="${y - 3}" width="${w + 6}" height="${h + 6}" rx="5" class="lc-repaso ${i === 2 ? 'lc-repaso-no' : ''}"/>`).join('')}</g>`;
  return s;
}

const reducido = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const SEGUNDOS_POR_PASO = 6;

/** Monta la lámina del ICO con los mismos controles que el componente genérico. */
export function montarLaminaIco(contenedor: HTMLElement, info: Infografia): () => void {
  let paso = 0;
  let reproduciendo = false;
  let temporizador: ReturnType<typeof setTimeout> | undefined;
  const total = info.pasos.length;
  const prefijo = `lc-${Math.random().toString(36).slice(2, 8)}`;
  contenedor.innerHTML = `<figure class="ig lc" data-ig="${info.id}"><figcaption class="ig-titulo lc-titulo">${iconoUi('proyector')} ${info.titulo}</figcaption>
<div class="lc-lienzo"><svg class="lc-svg" role="img" aria-label="${esc(info.titulo)}"></svg></div>
<div class="lc-pie"><p class="lc-num" aria-hidden="true">Nº <span></span></p><p class="ig-texto lc-texto" aria-live="polite"></p></div><div class="ig-siglas"></div>
<div class="ig-ctrl"><button type="button" class="fc-btn" data-ig="anterior">← Anterior</button><span class="ig-puntos">${info.pasos.map((_, i) => `<button type="button" class="ig-punto" data-ig-paso="${i}" aria-label="Paso ${i + 1}"></button>`).join('')}</span><button type="button" class="fc-btn" data-ig="siguiente">Siguiente →</button><button type="button" class="fc-btn ig-play" data-ig="play" aria-pressed="false">▶ Reproducir</button></div></figure>`;
  const figura = contenedor.querySelector<HTMLElement>('.lc')!;
  const svg = contenedor.querySelector<SVGSVGElement>('.lc-svg')!;
  const texto = contenedor.querySelector<HTMLElement>('.lc-texto')!;
  const num = contenedor.querySelector<HTMLElement>('.lc-num span')!;
  const play = contenedor.querySelector<HTMLButtonElement>('[data-ig="play"]')!;
  const movil = typeof matchMedia === 'function' ? matchMedia('(max-width: 700px)') : null;

  const montarDibujo = () => {
    const c = movil?.matches ? VERTICAL : HORIZONTAL;
    svg.setAttribute('viewBox', `0 0 ${c.w} ${c.h}`);
    svg.innerHTML = dibujo(info, c, prefijo);
    figura.dataset.composicion = c === VERTICAL ? 'vertical' : 'horizontal';
  };

  const pintar = () => {
    const p = info.pasos[paso]!;
    figura.classList.toggle('lc-quieto', reducido());
    // Lo de pasos anteriores sigue visible y legible; lo del paso actual se dibuja.
    for (const g of svg.querySelectorAll<SVGGElement>('.lc-e')) {
      const e = Number(g.dataset.e);
      g.classList.toggle('lc-visto', e <= paso + 1);
      g.classList.toggle('lc-actual', e === paso + 1 || (paso === total - 1 && e < total));
    }
    for (const a of svg.querySelectorAll<SVGGElement>('.ig-actor')) a.classList.toggle('activo', p.actores.includes(a.dataset.actor!));
    texto.innerHTML = `<b>Paso ${paso + 1} de ${total}.</b> ${p.texto}`;
    const siglas = contenedor.querySelector<HTMLElement>('.ig-siglas')!;
    siglas.replaceChildren();
    marcarSiglas(texto, siglas, 1);
    num.textContent = `${String(paso + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
    contenedor.querySelectorAll<HTMLButtonElement>('.ig-punto').forEach((b, i) => b.classList.toggle('on', i === paso));
    contenedor.querySelector<HTMLButtonElement>('[data-ig="anterior"]')!.disabled = paso === 0;
    contenedor.querySelector<HTMLButtonElement>('[data-ig="siguiente"]')!.disabled = paso === total - 1;
  };

  const ir = (n: number) => {
    paso = Math.max(0, Math.min(total - 1, n));
    pintar();
  };
  const parar = () => {
    reproduciendo = false;
    if (temporizador) clearTimeout(temporizador);
    play.textContent = '▶ Reproducir';
    play.setAttribute('aria-pressed', 'false');
  };
  const avanzarSolo = () => {
    if (!reproduciendo || !contenedor.isConnected || paso >= total - 1) return parar();
    ir(paso + 1);
    temporizador = setTimeout(avanzarSolo, SEGUNDOS_POR_PASO * 1000);
  };
  contenedor.querySelector<HTMLButtonElement>('[data-ig="anterior"]')!.onclick = () => {
    parar();
    ir(paso - 1);
  };
  contenedor.querySelector<HTMLButtonElement>('[data-ig="siguiente"]')!.onclick = () => {
    parar();
    ir(paso + 1);
  };
  contenedor.querySelectorAll<HTMLButtonElement>('[data-ig-paso]').forEach((b) => {
    b.onclick = () => {
      parar();
      ir(Number(b.dataset.igPaso));
    };
  });
  play.onclick = () => {
    if (reproduciendo) return parar();
    reproduciendo = true;
    play.textContent = '⏸ Pausa';
    play.setAttribute('aria-pressed', 'true');
    if (paso >= total - 1) ir(0);
    temporizador = setTimeout(avanzarSolo, SEGUNDOS_POR_PASO * 1000);
  };

  // En móvil la composición es vertical; al cruzar el umbral se vuelve a dibujar en el mismo paso.
  const alCambiar = () => {
    montarDibujo();
    pintar();
  };
  movil?.addEventListener?.('change', alCambiar);
  montarDibujo();
  pintar();
  return () => {
    parar();
    movil?.removeEventListener?.('change', alCambiar);
  };
}
