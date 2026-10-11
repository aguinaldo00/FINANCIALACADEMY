// Comprueba que la maqueta editorial se puede montar sobre la web actual sin perder nada.
// Uso: npm run dev  y luego  node propuesta/editorial/comprobar.mjs
//
//  1. Cada enlace de la portada actual (#a/gestion-financiera) y del índice actual (#tema/2) existe
//     también en la maqueta (página + sumario).
//  2. Sin errores en la consola; sin desbordamiento horizontal a 390 px.
//  3. Sumario: se abre, recibe el foco, el buscador filtra, Esc lo cierra y el foco vuelve.
//     Menú del móvil: se abre y se cierra con Esc.
//  4. Movimiento reducido: el reproductor no arranca solo y enseña la composición completa.
//  5. Contraste de los textos clave (WCAG AA).
//  6. El selector de mundos, la Ciudad del Dinero, el Atlas y el progreso no tienen cambios en git.
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';

const raizNpm = execSync('npm root -g').toString().trim();
const { chromium } = createRequire(raizNpm + '/')(raizNpm + '/playwright');
const BASE = 'http://127.0.0.1:5173';
const ULTIMO = { 'gestion-financiera': { href: '#tema/2/f/simple-montante', titulo: 'Capital final o montante' } };

let fallos = 0;
const ok = (bien, texto) => {
  if (!bien) fallos++;
  console.log(`${bien ? '  ✔' : '  ✘'} ${texto}`);
};

const navegador = await chromium.launch();
async function contexto(opciones = {}) {
  const c = await navegador.newContext(opciones);
  // Mismo almacenamiento en la web y en la maqueta: sin intro y con un «último sitio» guardado.
  await c.addInitScript((ultimo) => {
    localStorage.setItem('financial-academy:intro-barco', 'vista');
    localStorage.setItem('financial-academy:ultimo', JSON.stringify(ultimo));
  }, ULTIMO);
  return c;
}
async function abrir(c, ruta, esperar) {
  const p = await c.newPage();
  const errores = [];
  p.on('pageerror', (e) => errores.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') errores.push(m.text()); });
  await p.goto(BASE + ruta);
  await p.waitForSelector(esperar, { timeout: 20000 });
  await p.waitForTimeout(800);
  return { p, errores };
}

/** Enlaces internos (#…) de la web real, dentro de la página y del índice lateral. */
const enlacesWeb = (p) => p.evaluate(() => [...new Set([...document.querySelectorAll('#page a[href^="#"], #rail a[href^="#"]')].map((a) => a.getAttribute('href')))]);
/** Enlaces de la maqueta, traducidos a rutas de la web (los ?pantalla= son las pantallas que sustituyen). */
const enlacesMaqueta = (p) => p.evaluate(() => {
  const equivalente = { portada: '#a/gestion-financiera', indice: '#tema/2' };
  return [...new Set([...document.querySelectorAll('#propuesta a[href]')].map((a) => {
    const u = new URL(a.href);
    const pantalla = u.searchParams.get('pantalla');
    return u.pathname === '/' ? u.hash : pantalla ? equivalente[pantalla] ?? '' : '';
  }).filter(Boolean))];
});

const c = await contexto({ viewport: { width: 1440, height: 900 } });

console.log('\n1 · Funciones y enlaces que se conservan');
for (const [ruta, esperar, pantalla] of [['/#a/gestion-financiera', '#page .asignatura', 'portada'], ['/#tema/2', '#page [data-miniatura]', 'indice']]) {
  const web = await abrir(c, ruta, esperar);
  const deLaWeb = await enlacesWeb(web.p);
  const buscadorWeb = await web.p.locator('#page [data-tm-buscar]').count();
  await web.p.close();
  const maq = await abrir(c, `/propuesta/editorial/?pantalla=${pantalla}&quieto`, '[data-listo]');
  const deLaMaqueta = new Set(await enlacesMaqueta(maq.p));
  const faltan = deLaWeb.filter((h) => !deLaMaqueta.has(h));
  ok(faltan.length === 0, `${ruta}: ${deLaWeb.length} enlaces en la web, ${faltan.length} sin equivalente en la maqueta${faltan.length ? ` → ${faltan.join(', ')}` : ''}`);
  if (buscadorWeb) ok(await maq.p.locator('[data-capa-sumario] [data-tm-buscar]').count() === 1, `${ruta}: el buscador del temario sigue (en el sumario)`);
  ok(web.errores.length === 0 && maq.errores.length === 0, `${ruta}: sin errores de consola (web ${web.errores.length}, maqueta ${maq.errores.length})${[...web.errores, ...maq.errores].map((e) => `\n      ${e}`).join('')}`);
  if (pantalla === 'portada') {
    ok(await maq.p.locator(`a.ed-boton[href="/${ULTIMO['gestion-financiera'].href}"]`).count() === 1, 'portada: «Continuar donde lo dejaste» usa el último sitio guardado (el mismo dato que la web)');
    ok(await maq.p.locator('.tm-dom').count() > 0, 'sumario: muestra el dominio de cada apartado (progreso real)');
  } else {
    const fichas = await maq.p.locator('a.ed-f').count();
    ok(fichas === 19, `índice: ${fichas} fichas de fórmula (19 en el contenido)`);
    const fases = await maq.p.evaluate(() => ['datos', 'elegir', 'practica'].every((f) => ['simple', 'compuesta', 'descuento'].every((b) => document.querySelector(`a[href="/#tema/2/${b}/${f}"]`))));
    ok(fases, 'índice: las fases B, C y D de las tres partes están enlazadas');
    ok(await maq.p.locator('.mo').count() >= 1, 'índice: la animación se reproduce con el motor del proyecto (montarReproductor)');
  }
  await maq.p.close();
}

console.log('\n2 · Sumario y menú');
{
  const { p } = await abrir(c, '/propuesta/editorial/?pantalla=portada&quieto', '[data-listo]');
  const boton = p.locator('.ed-acciones [data-sumario]');
  await boton.click();
  const capa = p.locator('[data-capa-sumario]');
  ok(await capa.isVisible(), 'el botón «Sumario» abre la capa');
  ok(await p.evaluate(() => document.activeElement?.matches('[data-tm-buscar]')), 'el foco pasa al buscador');
  const total = await p.locator('.ed-sumario .tm-fila').count();
  await p.keyboard.type('TAE');
  await p.waitForTimeout(150);
  const visibles = await p.locator('.ed-sumario .tm-fila:visible').allTextContents();
  ok(visibles.length > 0 && visibles.length < total && visibles.some((t) => t.includes('TAE')), `el buscador filtra: «TAE» deja ${visibles.length} de ${total} filas`);
  await p.keyboard.press('Escape');
  ok(await capa.isHidden(), 'Esc cierra el sumario');
  ok(await p.evaluate(() => document.activeElement?.matches('.ed-acciones [data-sumario]')), 'el foco vuelve al botón que lo abrió');
  await p.close();
}
const movil = await contexto({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
{
  const { p } = await abrir(movil, '/propuesta/editorial/?pantalla=portada&quieto', '[data-listo]');
  await p.click('[data-menu]');
  ok(await p.locator('#ed-menu').isVisible() && (await p.getAttribute('[data-menu]', 'aria-expanded')) === 'true', 'móvil: el botón «Menú» abre los accesos');
  await p.keyboard.press('Escape');
  ok(await p.locator('#ed-menu').isHidden(), 'móvil: Esc cierra el menú');
  await p.close();
}

console.log('\n3 · Móvil (390 px)');
for (const pantalla of ['portada', 'indice', 'animacion']) {
  const { p, errores } = await abrir(movil, `/propuesta/editorial/?pantalla=${pantalla}&quieto`, '[data-listo]');
  const ancho = await p.evaluate(() => document.documentElement.scrollWidth);
  ok(ancho <= 390 && errores.length === 0, `${pantalla}: ancho ${ancho} px, ${errores.length} errores`);
  await p.close();
}

console.log('\n4 · Movimiento reducido');
{
  const r = await contexto({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const { p } = await abrir(r, '/propuesta/editorial/?pantalla=indice', '[data-listo]');
  await p.waitForTimeout(1500);
  const estado = await p.evaluate(() => {
    const mo = document.querySelector('.ed-t2-pantalla .mo');
    return { reproduce: mo?.classList.contains('mo-reproduciendo'), completa: mo?.classList.contains('mo-terminada') };
  });
  ok(!estado.reproduce && estado.completa, 'el reproductor no arranca solo y enseña la composición completa');
  await r.close();
}

console.log('\n5 · Contraste (AA: 4,5 texto normal; 3 texto grande)');
const MUESTRAS = {
  portada: ['.ed-cap-1 .ed-cap-texto>p:not(.ed-volanta)', '.ed-datos dt', '.ed-cap-2 .ed-cap-texto>p:not(.ed-volanta)', '.ed-cap-2 .ed-datos dt', '.ed-leyenda-foto', '.ed-cuaderno-lista span', '.ed-atlas-texto p:not(.ed-volanta):not(.ed-nota-pie)', '.ed-nota-pie', '.ed-capitulos .ed-volanta'],
  sumario: ['.ed-sumario .tm-tit', '.ed-sumario .tm-det', '.ed-sumario .tm-mas', '.ed-sumario-cap span'],
  indice: ['.ed-t2-apertura .ed-entradilla', '.ed-ruta small:not(.ed-ruta-aqui)', '.ed-contenido-tit small', '.ed-f-ver', '.ed-rama', '.ed-parte-cab blockquote', '.ed-barra-fases li:not(.on) a', '.ed-margen li', '.mo-sub', '.ed-parte-practica>span'],
};
for (const [pantalla, selectores] of Object.entries(MUESTRAS)) {
  const ruta = pantalla === 'sumario' ? 'portada&sumario' : pantalla;
  const { p } = await abrir(c, `/propuesta/editorial/?pantalla=${ruta}&quieto`, '[data-listo]');
  const medidas = await p.evaluate((selectores) => {
    const leer = (s) => {
      const m = s.match(/^color\(srgb ([^)]+)\)$/);
      if (m) {
        const [r, g, b, , a] = m[1].split(/\s+/);
        return [Number(r) * 255, Number(g) * 255, Number(b) * 255, a === undefined ? 1 : Number(a)];
      }
      const n = (s.match(/[\d.]+/g) ?? []).map(Number);
      return [n[0] ?? 0, n[1] ?? 0, n[2] ?? 0, n[3] ?? 1];
    };
    const sobre = (arriba, abajo) => [0, 1, 2].map((k) => arriba[k] * arriba[3] + abajo[k] * (1 - arriba[3])).concat(1);
    const fondo = (el) => {
      const capas = [];
      for (let e = el; e; e = e.parentElement) {
        const c = leer(getComputedStyle(e).backgroundColor);
        if (c[3] > 0) capas.push(c);
        if (c[3] >= 1) break;
      }
      return capas.reverse().reduce((abajo, arriba) => sobre(arriba, abajo), [255, 255, 255, 1]);
    };
    const lum = ([r, g, b]) => {
      const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    return selectores.map((s) => {
      const el = document.querySelector(s);
      if (!el) return { s, falta: true };
      const cs = getComputedStyle(el);
      const bg = fondo(el);
      const tinta = sobre(leer(cs.color), bg);
      const [l1, l2] = [lum(tinta), lum(bg)].sort((a, b) => b - a);
      const tam = parseFloat(cs.fontSize);
      const grande = tam >= 24 || (tam >= 18.66 && Number(cs.fontWeight) >= 700);
      return { s, ratio: (l1 + 0.05) / (l2 + 0.05), grande, tam };
    });
  }, selectores);
  for (const m of medidas) {
    if (m.falta) { ok(false, `${pantalla}: no encuentro ${m.s}`); continue; }
    ok(m.ratio >= (m.grande ? 3 : 4.5), `${pantalla}: ${m.s} · ${m.ratio.toFixed(2)}:1${m.grande ? ' (grande)' : ''} · ${Math.round(m.tam)} px`);
  }
  await p.close();
}

console.log('\n6 · Lo que no se toca');
const PROTEGIDO = [
  'src/ui/views/academiaView.ts', 'src/styles/academia.css', 'src/scene/three/', 'src/ui/world/', 'src/ui/intro/',
  'src/ui/views/homeView.ts', 'src/app/store.ts', 'src/app/practiceStore.ts', 'src/persistence/', 'src/domain/mastery.ts', 'src/content/temas/tema-01/',
];
const cambios = execSync(`git status --porcelain -- ${PROTEGIDO.join(' ')}`).toString().trim();
ok(cambios === '', `selector de mundos, Ciudad del Dinero, Atlas, intro, progreso y Tema 1 sin cambios${cambios ? `:\n${cambios}` : ''}`);

await navegador.close();
console.log(fallos ? `\n${fallos} comprobaciones fallan.` : '\nTodo correcto.');
process.exit(fallos ? 1 : 0);
