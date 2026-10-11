/*
 * Dirección artística «Calcografía» de las infografías del Tema 1: el lenguaje de los billetes y los
 * títulos de hoy (grabado, rosetas de guilloché, viñetas, cupones con trepado y banda holográfica),
 * luminoso y con color. Son piezas de dibujo en SVG (cadenas) que cada lámina compone a su manera.
 */

export type Punto = readonly [number, number];
export type Curva = readonly [Punto, Punto, Punto, Punto];

const f1 = (n: number) => n.toFixed(1);

/** Puntos de una curva de Bézier cúbica. */
export function bezier([a, b, c, d]: Curva, n = 48): Punto[] {
  const pts: Punto[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const k0 = (1 - t) ** 3, k1 = 3 * (1 - t) ** 2 * t, k2 = 3 * (1 - t) * t * t, k3 = t ** 3;
    pts.push([k0 * a[0] + k1 * b[0] + k2 * c[0] + k3 * d[0], k0 * a[1] + k1 * b[1] + k2 * c[1] + k3 * d[1]]);
  }
  return pts;
}

export const linea = (pts: readonly Punto[]) => 'M' + pts.map(([x, y]) => `${f1(x)} ${f1(y)}`).join(' L');

/** Atributo `d` de una curva cúbica. */
export const curvaD = ([a, b, c, d]: Curva) => `M${a[0]} ${a[1]} C${b[0]} ${b[1]}, ${c[0]} ${c[1]}, ${d[0]} ${d[1]}`;

/** Roseta de guilloché (epitrocoides superpuestas), como la de un billete. */
export function roseta(cx: number, cy: number, radio: number, clase: string, capas = 4, muestras = 720): string {
  let s = '';
  for (let c = 0; c < capas; c++) {
    const a = 96 - c * 9, b = 7 + c, d = 24 + c * 6;
    const escala = (radio / (a - b + d)) * (1 - c * 0.1);
    const pts: Punto[] = [];
    for (let i = 0; i <= muestras; i++) {
      const t = (i / muestras) * 2 * Math.PI * b;
      pts.push([cx + ((a - b) * Math.cos(t) + d * Math.cos(((a - b) / b) * t)) * escala, cy + ((a - b) * Math.sin(t) - d * Math.sin(((a - b) / b) * t)) * escala]);
    }
    s += `<path d="${linea(pts)}" class="${clase}" style="opacity:${(0.75 - c * 0.12).toFixed(2)}"/>`;
  }
  return s;
}

/** Cinta grabada: un haz de líneas paralelas que ondulan (el dinero que circula). `pathLength` permite dibujarla. */
export function cinta(curva: Curva, clase: string, hilos = 7, separacion = 2.6): string {
  const pts = bezier(curva, 60);
  let s = '';
  for (let k = 0; k < hilos; k++) {
    const off = (k - (hilos - 1) / 2) * separacion;
    const hilo = pts.map(([x, y], i) => {
      const j = Math.min(i, pts.length - 2);
      const dx = pts[j + 1]![0] - pts[j]![0], dy = pts[j + 1]![1] - pts[j]![1];
      const l = Math.hypot(dx, dy) || 1;
      const o = off * (1 + 0.35 * Math.sin(i / 5 + k * 0.7));
      return [x - (dy / l) * o, y + (dx / l) * o] as Punto;
    });
    s += `<path d="${linea(hilo)}" pathLength="1" class="lc-traza ${clase}"/>`;
  }
  // Destello que recorre la cinta mientras su paso está activo.
  s += `<path d="${linea(pts)}" pathLength="1" class="lc-destello ${clase}"/>`;
  return s;
}

/** Fachada neoclásica grabada: frontón, entablamento, columnas sombreadas a trazos y escalinata. */
export function fachada(cx: number, base: number, ancho: number, alto: number, rotulo = '', columnas = 6): string {
  const x0 = cx - ancho / 2, x1 = cx + ancho / 2, fr = alto * 0.26, top = base - alto;
  let s = `<path d="M${f1(x0 - 5)} ${f1(top + fr)} L${f1(cx)} ${f1(top)} L${f1(x1 + 5)} ${f1(top + fr)} Z" class="lc-g lc-g-fuerte"/>`;
  s += `<path d="M${f1(x0 + 12)} ${f1(top + fr - 4)} L${f1(cx)} ${f1(top + 8)} L${f1(x1 - 12)} ${f1(top + fr - 4)}" class="lc-g lc-g-fino"/>`;
  for (let i = 0; i < 3; i++) s += `<line x1="${f1(x0 - 3)}" x2="${f1(x1 + 3)}" y1="${f1(top + fr + 3 + i * 4)}" y2="${f1(top + fr + 3 + i * 4)}" class="lc-g ${i ? 'lc-g-fino' : ''}"/>`;
  const yt = top + fr + 14, yb = base - 11, paso = ancho / columnas;
  for (let c = 0; c < columnas; c++) {
    const xc = x0 + paso * (c + 0.5), r = paso * 0.26;
    s += `<path d="M${f1(xc - r)} ${f1(yt)} V${f1(yb)} M${f1(xc + r)} ${f1(yt)} V${f1(yb)}" class="lc-g"/>`;
    for (let h = 0; h < 3; h++) s += `<line x1="${f1(xc - r + 1.6 + h * 1.8)}" x2="${f1(xc - r + 1.6 + h * 1.8)}" y1="${f1(yt + 2)}" y2="${f1(yb - 2)}" class="lc-g lc-g-fino"/>`;
  }
  for (let i = 0; i < 3; i++) s += `<line x1="${f1(x0 - 6 - i * 5)}" x2="${f1(x1 + 6 + i * 5)}" y1="${f1(yb + 3 + i * 4)}" y2="${f1(yb + 3 + i * 4)}" class="lc-g"/>`;
  if (rotulo) s += `<text x="${f1(cx)}" y="${f1(top + fr - 7)}" text-anchor="middle" class="lc-rotulo-fachada" style="font-size:${f1(fr * 0.52)}px">${rotulo}</text>`;
  return s;
}

/** Viñeta ovalada con tinta de color y fondo rayado (la «ventana» de un billete). */
export function vineta(id: string, cx: number, cy: number, rx: number, ry: number, contenido: string, tinta: string): string {
  let rayas = '';
  for (let y = cy - ry; y < cy + ry; y += 5) rayas += `M${f1(cx - rx)} ${f1(y)} H${f1(cx + rx)} `;
  return `<clipPath id="${id}"><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/></clipPath>
<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" class="lc-vineta-fondo ${tinta}"/>
<g clip-path="url(#${id})"><path d="${rayas}" class="lc-rayado"/>${contenido}</g>
<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" class="lc-g lc-g-fuerte"/>
<ellipse cx="${cx}" cy="${cy}" rx="${rx + 6}" ry="${ry + 6}" class="lc-g lc-punteado"/>`;
}

/** Filacteria (cinta de los grabados) con texto: aquí, los dos papeles del ICO. */
export function filacteria(x: number, y: number, ancho: number, texto: string, tinta: string): string {
  const a = ancho / 2;
  return `<g class="lc-filacteria ${tinta}"><path d="M${f1(x - a)} ${f1(y - 14)} H${f1(x + a)} l12 14 l-12 14 H${f1(x - a)} l-12 -14 Z" class="lc-filacteria-cuerpo"/>
<text x="${f1(x)}" y="${f1(y + 4.5)}" text-anchor="middle" class="lc-caps">${texto}</text></g>`;
}

/** Banda holográfica de los billetes actuales: la frontera por la que el dinero sale hacia cada vía. */
export function bandaHolografica(id: string, x: number, y: number, w: number, h: number): string {
  const vertical = h > w;
  let rayas = '';
  const largo = vertical ? h : w;
  for (let k = 6; k < largo; k += 7) rayas += vertical ? `M${f1(x)} ${f1(y + k)} l${f1(w)} -5 ` : `M${f1(x + k)} ${f1(y)} l-5 ${f1(h)} `;
  return `<linearGradient id="${id}" x1="0" y1="0" x2="${vertical ? 0 : 1}" y2="${vertical ? 1 : 0}">
<stop offset="0" stop-color="#ffd36b"/><stop offset=".25" stop-color="#ff7aa8"/><stop offset=".5" stop-color="#8f7bff"/><stop offset=".75" stop-color="#5fe0d6"/><stop offset="1" stop-color="#ffd36b"/></linearGradient>
<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${id})" class="lc-holo"/><path d="${rayas}" class="lc-holo-rayas"/>`;
}
