import { defineConfig } from 'vitest/config';

/*
 * Política de seguridad de contenido (CSP) de la web publicada. GitHub Pages no deja poner cabeceras,
 * así que va como <meta> en el index.html compilado (en desarrollo no: Vite necesita su conexión de
 * recarga). Solo se carga lo que viene de la propia web: ningún script ni recurso de otros sitios,
 * nada de plugins (object-src) y cualquier petición http:// se sube a https://. Los estilos en línea
 * se permiten porque las vistas colocan piezas con style="…".
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "media-src 'self' blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  'upgrade-insecure-requests',
].join('; ');

export default defineConfig({
  plugins: [
    {
      name: 'politica-seguridad',
      apply: 'build',
      transformIndexHtml: (html) => html.replace('<meta charset="utf-8">', `<meta charset="utf-8">\n<meta http-equiv="Content-Security-Policy" content="${CSP}">\n<meta name="referrer" content="strict-origin-when-cross-origin">`),
    },
  ],
  // Rutas relativas: el build funciona servido desde cualquier subcarpeta.
  base: './',
  build: {
    // Three.js (~580 kB) va en un fragmento aparte que solo se descarga si hay WebGL y vista 3D.
    chunkSizeWarningLimit: 650,
  },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
