// Fotogramas de una escena del Tema 2 (revisión fotograma a fotograma).
// Uso: npm run dev  y luego  node scripts/fotogramas-escenas.mjs <id-escena> <carpeta> [t1 t2 …] [--ancho 720]
// Sin tiempos, captura un fotograma cada medio segundo. Requiere Playwright global (como verificar-chromium).
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
const raiz = execSync('npm root -g').toString().trim();
const { chromium } = createRequire(raiz + '/')(raiz + '/playwright');
const args = process.argv.slice(2);
const ancho = args.includes('--ancho') ? Number(args.splice(args.indexOf('--ancho'), 2)[1]) : 720;
const [id, carpeta = 'fotogramas', ...tiempos] = args;
mkdirSync(carpeta, { recursive: true });
const base = process.env.VISOR ?? 'http://127.0.0.1:5173/scripts/visor-escenas.html';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: ancho + 32, height: Math.round(ancho * 5 / 6) + 40 }, deviceScaleFactor: 1 });
const errores = [];
p.on('pageerror', (e) => errores.push(e.message));
p.on('console', (m) => { if (m.type() === 'error') errores.push(m.text()); });
let lista = tiempos.map(Number);
if (!lista.length) {
  await p.goto(`${base}?escena=${id}&t=0`);
  await p.waitForSelector('[data-listo]');
  const dur = await p.evaluate(async (id) => (await import('/src/ui/escenas/index.ts')).ESCENAS[id].duracion, id);
  lista = Array.from({ length: Math.floor(dur * 2) + 1 }, (_, k) => k / 2);
}
for (const t of lista) {
  await p.goto(`${base}?escena=${id}&t=${t}`);
  await p.waitForSelector('[data-listo]');
  await p.locator('.mo-marco').screenshot({ path: `${carpeta}/${id}-${String(t.toFixed(2)).padStart(6, '0')}.png` });
}
console.log(`${lista.length} fotogramas en ${carpeta}`, errores.length ? `\nERRORES: ${errores.join(' | ')}` : '');
await b.close();
