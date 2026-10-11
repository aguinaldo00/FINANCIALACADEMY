# Financial Academy

Web de estudio del ciclo de Administración y Finanzas. Vite + TypeScript + Three.js, sin framework.
Idioma de todo (interfaz, código, comentarios, commits y respuestas): español.

## Comandos
- `npm run dev` · desarrollo
- `npm run typecheck` · `npm test` · `npm run build` · las tres tienen que pasar antes de subir
- Comprobación visual en Chromium (WebGL por software):
  `npm run build && npx vite preview --port 4173 &` y luego `node scripts/verificar-chromium.mjs`

## Publicación
- La web se publica en GitHub Pages desde `main` (`.github/workflows/pages.yml`).
- **Rama única de trabajo: `claude/quirky-lovelace-79c6fm`**, en todas las conversaciones (aunque la sesión proponga otra).
  Desde ella se abre la PR hacia `main`; si la PR anterior ya está fusionada, se reinicia la rama desde `main` y se abre otra.
- Trabajo automático: al terminar un cambio y pasar las comprobaciones, Claude hace commit, push y
  abre o actualiza la PR sin esperar permiso. Si algo es ambiguo, decide lo más razonable y lo explica al final.
- **Claude fusiona sus PR** cuando pasan las comprobaciones (autorizado por el usuario el 11/10; el repositorio es público).
- Tras fusionar: esperar 2–3 minutos y recargar con Ctrl + F5.
- Previsualización: cada incremento con código se enseña en una URL de GitHub Pages que no pise producción
  (plan en `docs/plan-completo.md`, §12). Si no se puede de forma segura, se explica el bloqueo antes de tocar permisos.

## Normas del usuario
- No cambiar los datos ni la lógica académica (`src/content/`), no inventar contenido y no quitar funciones.
- Figma y Canva están permitidos como apoyo de diseño (preferencia: Figma, plan gratuito). No contratar servicios,
  activar facturación ni generar costes sin autorización.
- No cambiar la visibilidad del repositorio. No inventar el significado de «OMEC».
- Solo se pregunta cuando la duda cambia mucho el resultado; en lo demás se decide y se explica.
- Las imágenes de ejemplo que mande el usuario son referencia de composición, no de tipografía ni de botones.
- Un incremento pequeño por sesión y por PR, en el orden de `docs/plan-completo.md`; al terminar, parar y esperar.
- Nada de agentes en paralelo, auditorías completas nuevas ni capturas masivas: se reutiliza `docs/auditoria-tema2.md`.
- Enseñar solo las capturas necesarias del resultado al terminar.
- Respuestas breves y directas (modo «caveman lite»).
- Al final, explicar en lenguaje sencillo qué se ha hecho, qué se ha comprobado y qué no.

## Mapa
- `src/app/`: arranque, rutas (`router.ts`) y almacenamiento.
- `src/content/`: asignaturas (`academia.ts`) y temas (`temas/tema-01`, `tema-02`). Son datos: no tocar sin permiso.
- `src/ui/views/`: una vista por pantalla; el selector de mundos es `academiaView.ts`.
- `src/ui/intro/` y `src/scene/three/`: la intro del barco y las escenas 3D.
- `src/styles/`: `base.css` es el sistema visual (colores, tipos, botones); las demás hojas solo colocan.
- Identidad editorial (portada de la asignatura e índice del Tema 2): `src/ui/components/editorial.ts` y `src/styles/editorial.css`;
  el reproductor con expansión de las miniaturas de vídeo es `src/ui/components/reproductorExpandido.ts`. Estado en `docs/identidad-editorial.md`.
- Infografías del Tema 1 en dirección «Calcografía» (de momento solo el ICO): `src/ui/infografias/` y `src/styles/calcografia.css`;
  análisis y decisión en `docs/infografias-tema1.md`.
- `src/assets/fuentes/`: fuentes propias (Fraunces, IBM Plex, Barlow Condensed, Big Shoulders); no usar Google Fonts.
- `docs/plan-completo.md`: plan maestro (arquitectura, dependencias, orden de incrementos). Se lee al empezar cada sesión.
- `docs/`: decisiones y planes; las dudas abiertas van en `docs/decisiones-pendientes.md`.
- `docs/fuentes/`: análisis de los apuntes de cada tema (conceptos, fórmulas, errores típicos, orden de enseñanza). Son la referencia para contrastar `src/content/`; no se cargan solos, se leen cuando haga falta.

## Diseño
- Usar los tokens y botones de `base.css` (`--bg`, `--ink`, `--oro`, `.btn-principal`…); no inventar colores ni botones.
- El selector tiene identidad propia, "capítulos de un documental" (bloque `ac-` de `academia.css`).
- Todo debe funcionar en móvil, sin WebGL y con movimiento reducido.

## Errores ya vividos (no repetir)
- Si cambias la entrada, la intro o el selector, graba la carga fotograma a fotograma: ya ha habido destellos de pantallas que no tocaban.
- Las variables CSS de la intro llevan prefijo `--ib-`, para no chocar con las de la paleta (`--b`…).
- Todas las pruebas tienen que seguir pasando; no se desactiva ninguna para que pase.
