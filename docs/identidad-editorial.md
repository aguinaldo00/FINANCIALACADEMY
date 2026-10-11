# Identidad editorial · qué está aplicado y dónde

Dirección aprobada: *Cinematic Editorial / Interactive Documentary / Knowledge Atlas*.
Ya no hay maqueta aparte: la propuesta (`propuesta/editorial/`) se ha llevado a la aplicación y se ha
borrado. Lo que se ve en la web es lo que hay en `src/`.

## Dónde se aplica (y dónde no)

| Ruta | Pantalla | Estado |
|---|---|---|
| `#a/gestion-financiera` | Portada de la asignatura + Sumario | **Identidad editorial** (`asignaturaView.ts`) |
| `#tema/2` y `#tema/2/<parte>` | Índice del Tema 2 | **Identidad editorial** (`tema2/indice.ts`) |
| `#tema/2/f/<fórmula>` | Ficha de cada fórmula | Interfaz anterior (la animación de la fórmula 1 sí es la nueva) |
| `#tema/2/<parte>/<fase>` | Fases B, C y D | Interfaz anterior |
| `#s/…`, `#c/…`, `#examen`, `#simulacro`, `#repaso`, `#sesion`, `#progreso`, `#visual` | Estudio del Tema 1 | Interfaz anterior (barra superior + índice lateral + columna de 900 px) |
| `#academia` | Selector de mundos | Identidad propia; no se toca |
| `#inicio` | Ciudad del Dinero y Atlas | Identidad propia (3D); no se toca |

El rediseño está en **dos pantallas** (y en la animación de la fórmula 1), no en toda la aplicación.

## Auditoría previa (11/10)

- **Solo previsualización:** la portada, el Sumario, el índice editorial, la animación de referencia
  y la página de revisión vivían en `propuesta/editorial/`. Vite solo compila `index.html`, así que
  nada de eso llegó nunca a GitHub Pages; solo se veía con `npm run dev` en `/propuesta/editorial/`.
- **Local frente a publicado:** el archivo publicado (`assets/index-CrT7vVr-.js`) era idéntico a la
  compilación local de `main`. La diferencia que se veía era la maqueta, que nunca se publicó.
- **Lo que impedía aplicar la identidad de forma coherente:**
  - el esqueleto común de `index.html`: índice lateral fijo de 300 px, `main` con margen izquierdo,
    barra superior (en `academia.css`) y `.page` limitada a 900 px con relleno;
  - `app.ts` solo dejaba salir de ese esqueleto al selector (`ac-cabecera-escena`);
  - `base.css` pinta `b, strong` y `a` para fondo oscuro (sobre papel salían mal);
  - el temario (`tm-*`) tiene estilos de tarjeta oscura en `academia.css`;
  - el router usa el hash: los anclajes internos de la maqueta (`#parte-…`, `#atlas`, `#contenido`)
    habrían sido rutas, y se han cambiado por rutas reales (`#tema/2/simple`…).

## Cómo está montado

- `body.editorial` (lo pone `app.ts` en las dos pantallas) quita la barra superior y la columna; el
  índice lateral sigue montado y queda bajo demanda. El resto de pantallas no cambia.
- `src/ui/components/editorial.ts`: navegación (marca, migas, Sumario, Atlas, Cuaderno, Mi
  progreso; en el móvil, «Sumario» y «Menú»), Sumario (el `temario.ts` real con su buscador y el
  dominio, en un diálogo modal) y barra del capítulo.
- `src/styles/editorial.css`: estilos de la identidad (tokens de `base.css`). Grano de papel solo en
  aperturas y recortes.
- La animación de la fórmula 1 (`escenas/simpleIntereses.ts`) es la de referencia; sus piezas de papel
  recortado están en `motion/piezas.ts`.

## Reproductor con expansión cinematográfica

`src/ui/components/reproductorExpandido.ts` + `src/styles/expansion.css`, sin dependencias (Web
Animations API).

- **Shared element / FLIP:** se mide la miniatura, se coloca el reproductor en su sitio y se anima la
  diferencia: posición, tamaño, recorte (`clip-path: inset(… round …)`) y esquinas a la vez, con una
  inclinación de 4° que se endereza al llegar. Al cerrar, el mismo movimiento al revés.
- **El vídeo real viaja:** el `<video>` de la miniatura es el que pasa al reproductor y vuelve (nunca
  una imagen fija). Arranca desde el fotograma que enseñaba la miniatura.
- **Fondo:** capa oscura con desenfoque; el resto de la página queda inerte (`inert`).
- **Controles:** reproducir/pausar, barra de posición, tiempo y Cerrar. Teclado: Intro abre, Espacio o
  K pausa, flechas ±5 s, Tab da la vuelta dentro, Escape cierra y el foco vuelve a la miniatura.
- **Movimiento reducido:** solo un fundido corto, sin desplazamiento ni 3D, y nada arranca solo.
- **Dónde:** el vídeo del Tema 1 («El sistema financiero español», 1:12) en el capítulo I de la
  portada; la animación de la fórmula 1 en el capítulo II; la de la fórmula 7 en la parte II del
  índice. Las animaciones del motor usan el mismo patrón con su propio reproductor.
- **Archivos del vídeo:** `video/sistema-financiero.webm` (VP9, 1,8 MB) primero y `.mp4` (H.264) de
  respaldo. `video/render.mjs` genera los dos. El vídeo no tiene sonido: los rótulos van en la imagen.

## Comprobaciones

- `npm test`: pruebas de la portada, del Sumario (foco, Escape, inerte) y del reproductor (el mismo
  `<video>` va y vuelve, diálogo modal, controles, cierre por botón, fondo y Escape).
- `scripts/verificar-chromium.mjs`: además de lo de siempre, la portada editorial, el Sumario, el
  vídeo expandido (se reproduce, se pausa con Espacio, vuelve con Escape), la animación expandida,
  movimiento reducido y móvil a 390 px sin desbordamiento.
- `scripts/grabar-escena.mjs`: graba cualquier escena del Tema 2 a MP4 para revisar el movimiento.

## Pendiente

- Llevar la identidad a la ficha de cada fórmula y a las fases B–D (hoy, interfaz anterior).
- Las demás animaciones del Tema 2 con el lenguaje de la fórmula 1.
- Vista propia del Atlas (hoy «Abrir el Atlas» lleva al Atlas de la ciudad).
- Estilos que han quedado sin uso en `academia.css` (`.as-*`, la portada anterior). No se han tocado
  porque esa hoja es también la del selector.
