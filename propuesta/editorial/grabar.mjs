// Graba una escena en MP4 (H.264) fotograma a fotograma y saca una hoja de fotogramas.
// Uso: npm run dev  y luego  node propuesta/editorial/grabar.mjs <salida.mp4> [escena] [fps]
import { createRequire } from 'node:module';
import { execSync, spawn } from 'node:child_process';
const raiz = execSync('npm root -g').toString().trim();
const { chromium } = createRequire(raiz + '/')(raiz + '/playwright');
const [salida = 'referencia.mp4', escena = 'referencia-simple', fps = '30'] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 720, height: 696 }, deviceScaleFactor: 2 });
const errores = [];
p.on('pageerror', (e) => errores.push(e.message));
await p.goto(`http://127.0.0.1:5173/propuesta/editorial/grabar.html?escena=${escena}`);
await p.waitForSelector('[data-listo]');
await p.waitForTimeout(800);
const dur = await p.evaluate(() => window.__duracion);
const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', fps, '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-crf', '20', '-movflags', '+faststart', salida], { stdio: ['pipe', 'inherit', 'inherit'] });
const total = Math.round(dur * Number(fps)) + Number(fps); // un segundo final quieto
const cuadro = p.locator('#cuadro');
for (let i = 0; i < total; i++) {
  await p.evaluate((t) => window.__pintar(t), Math.min(dur, i / Number(fps)));
  const img = await cuadro.screenshot({ type: 'jpeg', quality: 93 });
  if (!ff.stdin.write(img)) await new Promise((r) => ff.stdin.once('drain', r));
}
ff.stdin.end();
await new Promise((r) => ff.on('close', r));
await b.close();
console.log('vídeo:', salida, `${total} fotogramas`, errores.length ? `ERRORES: ${errores.join(' | ')}` : 'sin errores');
