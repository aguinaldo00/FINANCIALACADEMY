// Verificación de la portada en Chromium real (WebGL por SwiftShader).
// Uso: npm run build && npx vite preview --port 4173 &  node scripts/verificar-chromium.mjs [carpeta-capturas]
// Requiere Playwright instalado globalmente (no es dependencia del proyecto).
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
const raizGlobal = execSync('npm root -g').toString().trim();
const { chromium } = createRequire(raizGlobal + '/')(raizGlobal + '/playwright');
const SP = process.argv[2] ?? 'capturas';
mkdirSync(SP, { recursive: true });
const GL = ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'];
const resultados = [];
const ok = (nombre, cond, extra = '') => { resultados.push(`${cond ? 'PASA ' : 'FALLA'} ${nombre}${extra ? ' — ' + extra : ''}`); };
const errores = [];
const browser = await chromium.launch({ args: GL });
async function pagina(opts, init) {
  const p = await browser.newPage(opts);
  p.on('pageerror', (e) => errores.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error' && !/CERT|fonts\.g/.test(m.text())) errores.push(m.text()); });
  await p.addInitScript(init ?? (() => {}));
  return p;
}
const progreso = () => {
  localStorage.setItem('cdd-t1', JSON.stringify({ dom: { bde: 1, bancos: 0.5, cnmv: 1 }, tries: {} }));
  localStorage.setItem('financial-academy:entrada', '"vista"');
};

// 1. Escritorio
{
  const p = await pagina({ viewport: { width: 1400, height: 1000 } }, progreso);
  await p.goto('http://localhost:4173/');
  await p.waitForSelector('.mundo-lienzo', { timeout: 30000 });
  await p.waitForTimeout(2500);
  ok('escritorio: lienzo 3D montado', await p.locator('.mundo-lienzo').count() === 1);
  ok('escritorio: ciudad 2D oculta con 3D activo', !(await p.locator('.skyline').isVisible()));
  const rotulos = await p.locator('.m-etq').allTextContents();
  ok('escritorio: solo los 4 barrios rotulados', rotulos.length === 4, rotulos.join(' | '));
  ok('escritorio: sin porcentajes ni pines en el mundo', !rotulos.join('').includes('%') && !(await p.locator('.mundo-vista').textContent()).includes('📌'));
  // Navegación: barrio → zona → edificio por el Atlas, y migas para volver.
  await p.click('.atlas-item[data-foco="barrio:4"]');
  await p.waitForTimeout(1600);
  ok('navegación: barrio con ficha', (await p.locator('.ficha:not([hidden])').textContent()).includes('Barrio 4'));
  await p.click('.atlas-item[data-foco="zona:4.2A"]');
  await p.waitForTimeout(1600);
  ok('navegación: zona sin rótulos permanentes', await p.locator('.m-etq').count() === 0);
  await p.click('.atlas-item[data-foco="edificio:cajas"]');
  await p.waitForTimeout(1600);
  ok('navegación: edificio con acción de estudio', (await p.locator('.ficha .ficha-accion').getAttribute('href')) === '#c/cajas');
  await p.locator('[data-mundo-vista]').screenshot({ path: `${SP}/ver-edificio.png` });
  // Estudiar: entrar al concepto, acertar a la primera y volver al mapa.
  await p.click('.ficha .ficha-accion');
  await p.waitForSelector('#c-cajas');
  await p.click('#c-cajas .ab.q');
  // Se responde en orden: el primer acierto deja dominio 1 (a la primera) o 0,5 (tras fallar).
  const n = await p.locator('#c-cajas .opt').count();
  for (let i = 0; i < n; i++) { await p.locator('#c-cajas .opt').nth(i).click(); if (await p.locator('#c-cajas .opt.ok').count()) break; }
  const dominio = await p.locator('#c-cajas .dm').textContent();
  await p.evaluate(() => { location.hash = '#inicio'; });
  await p.waitForSelector('.mundo-lienzo', { timeout: 20000 });
  await p.waitForTimeout(2500);
  ok('vuelta al mapa: se abre en el edificio estudiado', (await p.locator('.migas [aria-current]').textContent()) === 'Cajas de ahorro');
  const estado = await p.locator('.atlas-estado').first().textContent();
  ok('vuelta al mapa: el edificio cambia de estado', !estado.includes('En proyecto'), `${dominio} → ${estado}`);
  await p.locator('[data-mundo-vista]').screenshot({ path: `${SP}/ver-vuelta.png` });
  // Subir al mapa con Escape y migas.
  await p.locator('.migas button').first().click();
  await p.waitForTimeout(1500);
  ok('navegación: migas devuelven a la ciudad', (await p.locator('.migas [aria-current]').textContent()) === 'La Ciudad del Dinero');
  await p.click('[data-mundo-atlas]');
  await p.waitForTimeout(1800);
  ok('Atlas: vista cenital rotula las 12 zonas', await p.locator('.m-etq').count() === 12);
  await p.locator('[data-mundo-vista]').screenshot({ path: `${SP}/ver-atlas.png` });
  await p.close();
}

// 2. Móvil
{
  const p = await pagina({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, progreso);
  await p.goto('http://localhost:4173/');
  await p.waitForSelector('.mundo-lienzo', { timeout: 30000 });
  await p.waitForTimeout(2500);
  const anchoPagina = await p.evaluate(() => document.documentElement.scrollWidth);
  ok('móvil: sin desbordamiento horizontal', anchoPagina <= 390, `${anchoPagina}px`);
  ok('móvil: rótulos de barrio compactos', await p.locator('.m-etq .m-largo').first().evaluate((e) => getComputedStyle(e).display === 'none'));
  await p.locator('[data-mundo-vista]').scrollIntoViewIfNeeded();
  await p.locator('[data-mundo-vista]').screenshot({ path: `${SP}/ver-movil.png` });
  await p.close();
}

// 3. Movimiento reducido (sin marca de entrada vista)
{
  const p = await pagina({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' }, () => {
    let c = 0; window.__dibujos = () => c;
    const gc = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (...a) {
      const ctx = gc.apply(this, a);
      if (ctx && ctx.clear && !ctx.__p) { const cl = ctx.clear.bind(ctx); ctx.clear = (m) => { c++; return cl(m); }; ctx.__p = 1; }
      return ctx;
    };
  });
  await p.goto('http://localhost:4173/');
  await p.waitForSelector('.mundo-lienzo', { timeout: 30000 });
  await p.waitForTimeout(2500);
  ok('reduced motion: sin entrada cinematográfica', await p.locator('.entrada').count() === 0);
  await p.locator('[data-mundo-vista]').scrollIntoViewIfNeeded();
  await p.waitForTimeout(1200);
  const a = await p.evaluate(() => window.__dibujos());
  await p.waitForTimeout(3000);
  const b = await p.evaluate(() => window.__dibujos());
  ok('reduced motion: 0 redibujados en reposo', b - a === 0, `${b - a} en 3 s`);
  await p.click('.atlas-item[data-foco="barrio:4"]');
  await p.waitForTimeout(300);
  ok('reduced motion: el cambio de nivel es inmediato', (await p.locator('.migas [aria-current]').textContent()).includes('Estructura'));
  await p.close();
}

// 4. Sin WebGL
{
  const p = await pagina({ viewport: { width: 1200, height: 900 } }, () => { HTMLCanvasElement.prototype.getContext = () => null; });
  await p.goto('http://localhost:4173/');
  await p.waitForTimeout(2000);
  ok('sin WebGL: aviso y ciudad 2D', (await p.locator('[data-mundo-aviso]').textContent()).includes('2D') && await p.locator('.skyline').isVisible());
  await p.click('.atlas-item[data-foco="barrio:4"]');
  await p.click('.atlas-item[data-foco="zona:4.2A"]');
  ok('sin WebGL: el Atlas navega', (await p.locator('.atlas-item').count()) === 8);
  await p.close();
}

ok('sin errores de consola ni de página', errores.length === 0, errores.slice(0, 3).join(' / '));
console.log(resultados.join('\n'));
process.exitCode = resultados.some((r) => r.startsWith('FALLA')) ? 1 : 0;
await browser.close();
