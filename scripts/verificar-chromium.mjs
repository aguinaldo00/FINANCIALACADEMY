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
  ok('portada: el mapa es lo primero y ocupa la pantalla', await p.locator('.page > .mundo.portada:first-child').count() === 1 && (await p.locator('[data-mundo-vista]').boundingBox()).height >= 880);
  ok('portada: barra lateral retirada', (await p.locator('.rail').boundingBox()).x < 0);
  ok('portada: botón flotante del índice', await p.locator('#ib').isVisible());
  ok('portada: título de marca sobre el mapa', (await p.locator('.portada-marca .marca').getAttribute('aria-label')) === 'Gestión financiera: La ciudad del dinero');
  ok('índice: el grupo Estudio y examen va al final', JSON.stringify(await p.locator('#rail a').evaluateAll((as) => as.slice(-6).map((a) => a.getAttribute('href')))) === '["#sesion","#examen","#visual","#simulacro","#repaso","#progreso"]');
  await p.mouse.move(700, 500);
  await p.mouse.wheel(0, 800);
  await p.waitForFunction(() => document.querySelector('.rail').getBoundingClientRect().x >= 0, null, { timeout: 8000 }).catch(() => {});
  // Se comprueba el estado (la clase) y no la posición: con SwiftShader la transición CSS puede tardar.
  const trasScroll = await p.evaluate(() => ({ y: scrollY, hero: document.querySelector('.hero')?.className, retirada: document.body.classList.contains('portada-inmersiva'), rail: Math.round(document.querySelector('.rail').getBoundingClientRect().x) }));
  ok('portada: el scroll revela el tema y la barra lateral', trasScroll.hero?.includes('in') && !trasScroll.retirada, JSON.stringify(trasScroll));
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(800);
  const caja = await p.locator('[data-mundo-vista]').boundingBox();
  await p.mouse.click(caja.x + caja.width / 2, caja.y + caja.height / 2);
  await p.waitForTimeout(800);
  ok('portada: un clic entra en la exploración', await p.locator('.mundo.portada').count() === 0 && await p.locator('.mundo-barra').isVisible());
  // El clic abre la pantalla completa; al salir, el índice vuelve y el Atlas está disponible.
  const enCompleta = await p.evaluate(() => Boolean(document.fullscreenElement || document.querySelector('.mundo.en-pantalla-completa')));
  ok('portada: el clic abre la pantalla completa', enCompleta);
  if (enCompleta) await p.click('[data-mundo-completa]');
  await p.waitForFunction(() => !document.fullscreenElement && !document.querySelector('.mundo.en-pantalla-completa'), null, { timeout: 8000 }).catch(() => {});
  await p.waitForFunction(() => document.querySelector('.rail').getBoundingClientRect().x >= 0, null, { timeout: 8000 }).catch(() => {});
  ok('explorando: el índice vuelve a verse', (await p.locator('.rail').boundingBox()).x >= 0 && !(await p.locator('#ib').isVisible()));
  // Navegación: barrio → zona → edificio por el Atlas, y migas para volver.
  await p.click('.atlas-item[data-foco="barrio:4"]');
  await p.waitForTimeout(1600);
  ok('navegación: barrio con ficha', (await p.locator('.ficha:not([hidden])').textContent()).includes('Barrio 4'));
  await p.click('.atlas-item[data-foco="zona:4.2A"]');
  await p.waitForTimeout(1600);
  const nombres = await p.locator('.m-etq.edificio').allTextContents();
  ok('navegación: la zona rotula sus edificios', nombres.length === 8, nombres.join(' | '));
  await p.click('.atlas-item[data-foco="edificio:cajas"]');
  await p.waitForTimeout(1600);
  ok('navegación: edificio rotulado y destacado', (await p.locator('.m-etq.edificio:not(.tenue)').first().textContent()) === 'Cajas de ahorro');
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
  ok('navegación: migas devuelven a la ciudad', (await p.locator('.migas [aria-current]').textContent()) === 'La ciudad del dinero');
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
  const vista = await p.locator('[data-mundo-vista]').boundingBox();
  await p.mouse.click(vista.x + vista.width / 2, vista.y + vista.height / 2);
  await p.locator('[data-mundo-vista]').scrollIntoViewIfNeeded();
  await p.waitForTimeout(1200);
  const a = await p.evaluate(() => window.__dibujos());
  await p.waitForTimeout(3000);
  const b = await p.evaluate(() => window.__dibujos());
  ok('reduced motion: 0 redibujados en reposo', b - a === 0, `${b - a} en 3 s`);
  // El clic abrió la pantalla completa: se sale para usar el Atlas de debajo.
  if (await p.evaluate(() => Boolean(document.fullscreenElement || document.querySelector('.mundo.en-pantalla-completa')))) await p.click('[data-mundo-completa]');
  await p.waitForTimeout(500);
  await p.click('.atlas-item[data-foco="barrio:4"]');
  await p.waitForTimeout(300);
  ok('reduced motion: el cambio de nivel es inmediato', (await p.locator('.migas [aria-current]').textContent()).includes('Estructura'));
  await p.close();
}

// 5. Simulacro y repaso (escritorio y móvil)
for (const [ancho, alto, nombre] of [[1300, 900, 'escritorio'], [390, 844, 'móvil']]) {
  const p = await pagina({ viewport: { width: ancho, height: alto } });
  await p.goto('http://localhost:4173/#simulacro');
  await p.waitForSelector('[data-sim-empezar]');
  await p.click('.sim-op:has(input[value="10"])');
  await p.click('[data-sim-empezar]');
  for (let i = 0; i < 10; i++) {
    await p.waitForFunction((n) => document.querySelector('.sim-n b')?.textContent === String(n), i + 1);
    await p.locator('.opt').nth(i % 2).click();
    await p.locator(i % 3 ? '[data-conf="seguro"]' : '[data-conf="dudo"]').click();
  }
  await p.waitForSelector('[data-sim-nota]');
  const nota = await p.locator('[data-sim-nota]').textContent();
  ok(`simulacro (${nombre}): 10 preguntas y nota`, (await p.locator('.sim-correccion li').count()) === 10, `nota ${nota}`);
  ok(`simulacro (${nombre}): calibración por seguridad`, (await p.locator('.sim-cal .ex-fila').count()) === 2);
  ok(`simulacro (${nombre}): sin desbordamiento horizontal`, (await p.evaluate(() => document.documentElement.scrollWidth)) <= ancho);
  await p.screenshot({ path: `${SP}/ver-simulacro-${ancho}.png`, fullPage: false });
  await p.goto('http://localhost:4173/#repaso');
  await p.waitForSelector('[data-repaso]');
  const fallos = Number(await p.locator('.rep-tab[data-tab="fallos"] b').textContent());
  ok(`repaso (${nombre}): los fallos del simulacro están en el repaso`, fallos > 0, `${fallos} fallos`);
  await p.click('.rep-tab[data-tab="tarjetas"]');
  await p.click('[data-rep-girar]');
  await p.click('[data-rep-sabia="1"]');
  ok(`repaso (${nombre}): flashcard calificada`, (await p.locator('.fc-n').textContent()).startsWith('1 hechas'));
  ok(`repaso (${nombre}): sin desbordamiento horizontal`, (await p.evaluate(() => document.documentElement.scrollWidth)) <= ancho);
  await p.screenshot({ path: `${SP}/ver-repaso-${ancho}.png`, fullPage: false });
  await p.close();
}

// 7. Métodos de estudio: sesión de hoy, mi progreso, escríbelo tú y pretest
for (const [ancho, alto, nombre] of [[1300, 900, 'escritorio'], [390, 844, 'móvil']]) {
  const p = await pagina({ viewport: { width: ancho, height: alto } });
  await p.goto('http://localhost:4173/#sesion');
  await p.waitForSelector('[data-ses-empezar]');
  await p.click('.sim-op:has(input[value="10"])');
  await p.waitForSelector('[data-ses-empezar]');
  await p.click('[data-ses-empezar]');
  for (let i = 0; i < 10; i++) {
    if (await p.locator('[data-ses-girar]').count()) {
      await p.click('[data-ses-girar]');
      await p.click('[data-sabia="1"]');
      continue;
    }
    const opciones = p.locator('[data-ses-panel] .opt');
    await opciones.nth(i % (await opciones.count())).click();
    await p.click(['[data-conf="seguro"]', '[data-conf="dudo"]', '[data-conf="adivino"]'][i % 3]);
    await p.click('[data-ses-sig]');
  }
  ok(`sesión de hoy (${nombre}): completada`, (await p.locator('.ses-fin h2').textContent()).includes('de 10 bien'));
  ok(`sesión de hoy (${nombre}): sin desbordamiento horizontal`, (await p.evaluate(() => document.documentElement.scrollWidth)) <= ancho + 2);
  await p.goto('http://localhost:4173/#progreso');
  await p.waitForSelector('.prog-tiles');
  ok(`mi progreso (${nombre}): racha y memoria`, (await p.locator('.prog-tile').first().locator('b').textContent()) === '1' && (await p.locator('.prog-memoria i').count()) > 1);
  await p.screenshot({ path: `${SP}/ver-progreso-${ancho}.png` });
  await p.goto('http://localhost:4173/#s/4.2A');
  await p.waitForSelector('#c-fgd');
  await p.click('[data-pre="empezar"]');
  await p.locator('[data-pretest] .opt').first().click();
  ok(`pretest (${nombre}): corrige y orienta a la ficha`, (await p.locator('[data-pretest] .opt.ok').count()) === 1);
  await p.click('#c-fgd .ab.w');
  const oculta = await p.locator('#c-fgd .corta').evaluate((e) => getComputedStyle(e).filter.includes('blur'));
  await p.fill('#c-fgd .rec-texto', 'Garantiza los depósitos hasta 100.000 euros');
  await p.click('#c-fgd [data-rec="comparar"]');
  ok(`escríbelo tú (${nombre}): oculta la definición y compara`, oculta && (await p.locator('#c-fgd .rec-ideas li').count()) > 0);
  await p.close();
}

// 8. Infografías: galería y ficha (escritorio y móvil)
for (const [ancho, alto, nombre] of [[1300, 900, 'escritorio'], [390, 844, 'móvil']]) {
  const p = await pagina({ viewport: { width: ancho, height: alto } });
  await p.goto('http://localhost:4173/#visual');
  await p.waitForSelector('.ig');
  const n = await p.locator('.ig').count();
  const item = p.locator('#vis-ico');
  await item.scrollIntoViewIfNeeded();
  await item.locator('[data-ig="siguiente"]').click();
  const flechas = await item.locator('.ig-flecha.activo').count();
  // Ningún actor fuera del lienzo.
  const fuera = await p.evaluate(() => [...document.querySelectorAll('.ig-lienzo')].some((l) => { const b = l.getBoundingClientRect(); return [...l.querySelectorAll('.ig-actor')].some((a) => { const r = a.getBoundingClientRect(); return r.left < b.left - 1 || r.right > b.right + 1 || r.top < b.top - 1 || r.bottom > b.bottom + 1; }); }));
  ok(`infografías (${nombre}): ${n}, flechas animadas y actores dentro`, n >= 12 && flechas === 2 && !fuera, `flechas ${flechas} · fuera ${fuera}`);
  ok(`infografías (${nombre}): sin desbordamiento horizontal`, (await p.evaluate(() => document.documentElement.scrollWidth)) <= ancho + 2);
  await item.screenshot({ path: `${SP}/ver-infografia-${ancho}.png` });
  await p.close();
}

// 6. Paseo táctil
{
  const p = await pagina({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }, progreso);
  await p.goto('http://localhost:4173/');
  await p.waitForSelector('.mundo-lienzo', { timeout: 30000 });
  await p.waitForTimeout(2000);
  const vista = await p.locator('[data-mundo-vista]').boundingBox();
  await p.mouse.click(vista.x + vista.width / 2, vista.y + vista.height / 2);
  await p.waitForTimeout(800);
  if (await p.evaluate(() => Boolean(document.fullscreenElement || document.querySelector('.mundo.en-pantalla-completa')))) await p.click('[data-mundo-completa]');
  await p.waitForTimeout(500);
  ok('móvil: botón Pasear visible', await p.locator('[data-mundo-paseo]').isVisible());
  await p.click('[data-mundo-paseo]');
  await p.waitForTimeout(800);
  ok('móvil: joystick visible al pasear', await p.locator('[data-joy]').isVisible());
  const antes = await p.locator('.mundo-lienzo').screenshot();
  const joy = await p.locator('[data-joy]').boundingBox();
  const cx = joy.x + joy.width / 2;
  const cy = joy.y + joy.height / 2;
  await p.locator('[data-joy]').dispatchEvent('pointerdown', { pointerId: 7, clientX: cx, clientY: cy - 50, bubbles: true });
  await p.waitForTimeout(1500);
  await p.locator('[data-joy]').dispatchEvent('pointerup', { pointerId: 7, clientX: cx, clientY: cy - 50, bubbles: true });
  const despues = await p.locator('.mundo-lienzo').screenshot();
  ok('móvil: el joystick mueve al personaje', !antes.equals(despues));
  // Dos dedos: uno mantiene el joystick y el otro pulsa «Saltar» (salto caminando).
  const cdp = await p.context().newCDPSession(p);
  const sal = await p.locator('[data-paseo-saltar]').boundingBox();
  const dedoJoy = { x: cx, y: cy - 50, id: 1 };
  const dedoSalto = { x: sal.x + sal.width / 2, y: sal.y + sal.height / 2, id: 2 };
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [dedoJoy] });
  await p.waitForTimeout(500);
  const andando = await p.evaluate(() => document.querySelector('.mundo-lienzo').dataset.andando);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [dedoJoy, dedoSalto] });
  let enAire = '0';
  for (let i = 0; i < 20 && enAire !== '1'; i++) { await p.waitForTimeout(50); enAire = await p.evaluate(() => document.querySelector('.mundo-lienzo').dataset.enAire); }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  ok('móvil: salta mientras camina (dos dedos)', andando === '1' && enAire === '1', `andando ${andando} · en el aire ${enAire}`);
  await p.locator('[data-mundo-vista]').screenshot({ path: `${SP}/ver-joystick.png` });
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
