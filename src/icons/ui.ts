/*
 * Iconos propios de la interfaz: sustituyen a los emojis genéricos de botones, etiquetas y avisos.
 * Misma gramática que los glifos de DATA (`glyphs.ts`): trazos SVG originales en una caja 64×64,
 * puntas redondas, `currentColor`. Cada uno es un objeto de La ciudad del dinero (monedas, planos,
 * fachadas, farolas, sellos…), no un símbolo genérico.
 * Se pintan dentro de un medallón tipo moneda (disco oscuro, canto dorado con grafilas), como los
 * emblemas de los edificios del mapa; la variante `mini` es solo el trazo (✓/✗ en listas).
 */

export const ICONOS_UI = {
  /** Explícamelo de otra forma: una calle que se bifurca (otro camino hacia lo mismo). */
  otraForma: '<path d="M32 60V38"/><path d="M32 38 Q32 26 16 14"/><path d="M32 38 Q32 26 48 14"/><path d="M9 17 L16 13 L17 21"/><path d="M47 21 L48 13 L55 17"/>',
  /** Trampa de examen: anzuelo con una moneda de cebo (te la intentan colar). */
  trampa: '<path d="M44 4V38 A13 13 0 0 1 18 38V31"/><path d="M18 31 L11 38"/><circle cx="20" cy="14" r="9"/><path d="M20 23V31"/>',
  /** Compruébalo / correcto: sello de lacre con su visto y las cintas. */
  sello: '<circle cx="32" cy="28" r="20"/><path d="M23 28 L30 35 L42 22"/><path d="M22 45 L17 60 L25 56 L30 60 L32 48"/><path d="M42 45 L47 60 L39 56 L34 60 L32 48"/>',
  /** No es esa: moneda tachada. */
  tachado: '<circle cx="32" cy="32" r="23"/><path d="M22 22 L42 42M42 22 L22 42"/>',
  /** Visto (variante mini). */
  visto: '<path d="M12 34 L26 48 L52 18"/>',
  /** Aspa (variante mini). */
  aspa: '<path d="M16 16 L48 48M48 16 L16 48"/>',
  /** Esquema: plano de calles con dos manzanas y una flecha de recorrido. */
  plano: '<rect x="8" y="8" width="48" height="48" rx="5"/><path d="M8 28h48M30 8v48"/><path d="M37 43h13M45 37 L51 43 L45 49"/>',
  /** Flashcards: dos tarjetas en abanico, la de delante con €. */
  naipes: '<path d="M10 18 L30 13 L37 47 L17 52Z"/><rect x="30" y="10" width="26" height="38" rx="4"/><path d="M50 23 Q47 19 43 20 Q38 22 38 29 Q38 36 43 38 Q47 39 50 35M35 27h9M35 31h9"/>',
  /** Más preguntas: interrogante sobre una pila de monedas. */
  preguntas: '<path d="M22 14 Q22 4 32 4 Q42 4 42 13 Q42 20 32 23V28"/><path d="M32 34v.5"/><ellipse cx="32" cy="46" rx="17" ry="5"/><path d="M15 46v8 Q32 62 49 54v-8"/>',
  /** Escríbelo tú: plumilla de notario sobre la línea de firma. */
  pluma: '<path d="M44 6 L58 20 L30 48 L14 52 L18 36Z"/><path d="M18 36 L30 48"/><circle cx="37" cy="27" r="3"/><path d="M6 58h32"/>',
  /** Visualízalo / infografías: pantalla con una gráfica en movimiento. */
  proyector: '<rect x="6" y="8" width="52" height="34" rx="4"/><path d="M15 33 L26 23 L34 29 L46 16"/><path d="M40 16h6v6"/><path d="M24 58 L32 42 L40 58"/>',
  /** En la vida real: fachada de tienda con toldo (la economía de la calle). */
  calle: '<path d="M8 22 L14 8h36l6 14"/><path d="M8 22 Q12 29 16 22 Q20 29 24 22 Q28 29 32 22 Q36 29 40 22 Q44 29 48 22 Q52 29 56 22"/><path d="M12 27v29h40V27"/><path d="M27 56V39h10v17"/>',
  /** Estudiar hoy / frase de examen: diana con una moneda en el centro. */
  diana: '<circle cx="32" cy="32" r="25"/><circle cx="32" cy="32" r="15"/><circle cx="32" cy="32" r="5"/>',
  /** Predicción de examen: barras de cotización. */
  barras: '<path d="M6 56h52"/><path d="M14 56V36h8v20M28 56V24h8v32M42 56V10h8v46"/>',
  /** Simulacro: hoja de examen tipo test. */
  examen: '<rect x="12" y="5" width="40" height="54" rx="4"/><rect x="19" y="14" width="7" height="7"/><path d="M31 18h14"/><path d="M19 33 L22 36 L27 29"/><path d="M31 33h14"/><rect x="19" y="43" width="7" height="7"/><path d="M31 47h14"/>',
  /** Repaso: dos flechas en círculo alrededor de una moneda. */
  repaso: '<path d="M11 27 A22 22 0 0 1 49 18"/><path d="M50 7v11H39"/><path d="M53 37 A22 22 0 0 1 15 46"/><path d="M14 57V46h11"/><circle cx="32" cy="32" r="7"/>',
  /** Mi progreso: edificio que sube con su grúa (construir la ciudad). */
  progreso: '<path d="M4 58h56"/><rect x="8" y="30" width="20" height="28"/><path d="M14 38h8M14 47h8"/><path d="M40 58V8M30 10h28M40 18 L30 10M58 10v14"/><rect x="54" y="24" width="8" height="7"/>',
  /** Estudia ya: la farola encendida del mapa. */
  farol: '<path d="M32 60V26"/><path d="M24 60h16"/><path d="M22 26h20l-4-13H26Z"/><path d="M12 13 L6 9M52 13 L58 9M32 7V2"/>',
  /** Historia del proyecto: plano enrollado. */
  pergamino: '<path d="M18 8h32a6 6 0 0 1 0 12h-2v36H16a6 6 0 0 1 0-12h2Z"/><path d="M18 8a6 6 0 0 0 0 12h6"/><path d="M26 32h16M26 41h16"/>',
  /** Modo noche (repaso). */
  luna: '<path d="M42 8 A25 25 0 1 0 56 44 A20 20 0 1 1 42 8Z"/>',
  /** Modo día (aprender). */
  sol: '<circle cx="32" cy="32" r="11"/><path d="M32 5v9M32 50v9M5 32h9M50 32h9M13 13l6 6M45 45l6 6M51 13l-6 6M19 45l-6 6"/>',
  /** Error con seguridad: rayo sobre una moneda. */
  rayo: '<circle cx="32" cy="32" r="25"/><path d="M36 11 L22 35h11l-5 18 15-25H32Z"/>',
  /** Racha: llama de antorcha. */
  llama: '<path d="M32 60 C16 52 17 36 28 25 C28 33 33 36 34 36 C34 25 38 14 46 7 C44 20 53 27 50 42 C48 53 40 60 32 60Z"/>',
  /** Sabes más de lo que crees: bombilla con €. */
  bombilla: '<path d="M22 42 Q11 34 13 22 Q17 6 32 6 Q47 6 51 22 Q53 34 42 42V48H22Z"/><path d="M24 54h16M27 60h10"/><path d="M38 19 Q35 16 31 17 Q26 19 26 25 Q26 31 31 33 Q35 34 38 31M23 23h9M23 27h9"/>',
  /** Nada pendiente: moneda con destellos. */
  brillo: '<circle cx="27" cy="37" r="17"/><path d="M50 4v13M43 10h14M54 28v9M49 32h10"/>',
  /** Antes de leer / lo verás en la ficha: lupa sobre una moneda. */
  lupa: '<circle cx="26" cy="26" r="18"/><circle cx="26" cy="26" r="8"/><path d="M39 39 L58 58"/>',
  /** Recorrido: brújula con aguja. */
  brujula: '<circle cx="32" cy="32" r="25"/><path d="M32 13 L38 32 L32 51 L26 32Z"/><path d="M26 32h12"/>',
  /** Pasear: figura caminando. */
  paseante: '<circle cx="35" cy="9" r="6"/><path d="M33 18 L27 36 L33 46 L29 60M27 36 L19 58M31 24 L20 32M33 22 L44 30"/>',
  /** Controles del mapa (sin medallón). */
  ampliar: '<path d="M8 22V8h14M42 8h14v14M56 42v14H42M22 56H8V42"/>',
  cerrar: '<path d="M14 14 L50 50M50 14 L14 50"/>',
  parar: '<rect x="16" y="16" width="32" height="32" rx="4"/>',
  /** Modos de "otra forma": analogía cotidiana (porción), para un niño (globo), gemelo confuso. */
  analogia: '<path d="M8 12 Q32 2 56 12 L32 60Z"/><path d="M12 20 Q32 12 52 20"/><circle cx="29" cy="28" r="3"/><circle cx="37" cy="39" r="3"/>',
  nino: '<ellipse cx="32" cy="22" rx="15" ry="18"/><path d="M29 40h6l-3 4Z"/><path d="M32 44 Q25 51 32 55 Q39 59 32 63"/>',
  gemelos: '<path d="M4 58h56"/><path d="M8 58V22 L18 11 L28 22V58M36 58V22 L46 11 L56 22V58"/><path d="M14 31h8M14 42h8M42 31h8M42 42h8"/>',
} as const;

export type IconoUi = keyof typeof ICONOS_UI;

/** Controles del mapa: trazo simple, sin medallón. */
const SIN_MEDALLON = new Set<IconoUi>(['visto', 'aspa', 'ampliar', 'cerrar', 'parar']);

/**
 * Icono de interfaz (decorativo: el texto del botón o la etiqueta ya lo nombra).
 * `sello`: dentro del medallón tipo moneda (clase `iu-medallon`). `mini`: solo el trazo, del color del texto.
 */
export function iconoUi(nombre: IconoUi, variante: 'sello' | 'mini' = SIN_MEDALLON.has(nombre) ? 'mini' : 'sello'): string {
  const trazo = ICONOS_UI[nombre];
  if (variante === 'mini') return `<svg class="iu iu-mini iu-${nombre}" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><g class="iu-trazo">${trazo}</g></svg>`;
  return `<svg class="iu iu-medallon iu-${nombre}" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><circle class="iu-disco" cx="32" cy="32" r="30"/><circle class="iu-grafila" cx="32" cy="32" r="26.5"/><g class="iu-trazo" transform="translate(13 13) scale(.594)">${trazo}</g></svg>`;
}

/** Quita el emoji (y el espacio) del principio de una etiqueta de DATA: el icono lo pone la interfaz. */
export function sinEmoji(texto: string): string {
  return texto.replace(/^(?:[\p{Extended_Pictographic}\u{FE0F}\u{200D}]\s*)+/u, '').trim();
}

/** Icono de cada modo de "Explícamelo de otra forma", por las palabras de su etiqueta en DATA. */
export function iconoModo(etiqueta: string): IconoUi {
  const t = etiqueta.toLowerCase();
  if (t.includes('analog')) return 'analogia';
  if (t.includes('niño')) return 'nino';
  if (t.includes('esquema')) return 'plano';
  if (t.includes('gemelo')) return 'gemelos';
  if (t.includes('examen')) return 'diana';
  return 'otraForma';
}
