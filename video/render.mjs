// Renderiza el vídeo: Chromium fotograma a fotograma -> ffmpeg (H.264).
// Uso: node video/render.mjs [salida.mp4] [fps]
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = require('playwright');
const aquí = path.dirname(fileURLToPath(import.meta.url));
const salida = process.argv[2] || path.join(aquí, 'sistema-financiero.mp4');
const fps = Number(process.argv[3] || 30);
const nav = await chromium.launch({ args: ['--allow-file-access-from-files'] });
const pag = await nav.newPage({ viewport: { width: 1280, height: 720 } });
await pag.goto(pathToFileURL(path.join(aquí, 'index.html')).href);
await pag.waitForFunction('window.listo === true');
await pag.evaluate('document.fonts.ready');
const dur = await pag.evaluate('window.DUR');
const ff = spawn('ffmpeg', ['-y', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', salida], { stdio: ['pipe', 'inherit', 'inherit'] });
const n = dur * fps;
for (let i = 0; i < n; i++) {
  await pag.evaluate((t) => window.frame(t), i / fps);
  if (!ff.stdin.write(await pag.screenshot({ type: 'jpeg', quality: 92 }))) await new Promise((r) => ff.stdin.once('drain', r));
  if (process.env.FOTO && Math.abs(i / fps - Number(process.env.FOTO)) < 1 / fps) await pag.screenshot({ path: `${aquí}/foto.png` });
}
ff.stdin.end();
await new Promise((r) => ff.on('close', r));
await nav.close();
console.log('listo:', salida);
