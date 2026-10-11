# Propuesta visual · dirección editorial (aprobada · fase de consolidación)

La dirección artística general está aprobada. Esta fase la consolida **solo** en tres pantallas,
sin extenderla al resto de la academia y sin sustituir nada de la web:

| Pantalla de la maqueta | Sustituiría a | Ver |
|---|---|---|
| Portada de Gestión Financiera + Sumario | `#a/gestion-financiera` (`asignaturaView.ts`) | `?pantalla=portada` (`&sumario` lo abre) |
| Portada e índice del Tema 2 | `#tema/2` (`src/ui/views/tema2/indice.ts`) | `?pantalla=indice` |
| Revisión de la animación de referencia | — (sirve para revisar el movimiento) | `?pantalla=animacion` |

- Arrancar: `npm run dev` → `http://127.0.0.1:5173/propuesta/editorial/?pantalla=…`
  Opciones: `&limpio` (sin la barra de la maqueta), `&quieto` (sin reproducción automática).
- Grabar la animación: `node propuesta/editorial/grabar.mjs salida.mp4 [escena] [fps]`.
- Comprobar que se puede montar sin perder nada: `node propuesta/editorial/comprobar.mjs`.
- Código: `propuesta/editorial/` (`main.ts`, `editorial.css`, `referencia/`). Fuera del `build`.
- **El selector de mundos no se toca**, ni la Ciudad del Dinero, el Atlas, la intro ni el progreso
  (lo verifica `comprobar.mjs` con `git status`).

## 1 · Portada de Gestión Financiera y Sumario

- **Navegación global discreta**: marca, dónde estás y cuatro accesos (Sumario, Atlas, Cuaderno,
  Mi progreso). En la portada es transparente sobre la apertura y se vuelve compacta y opaca al bajar.
  En el móvil quedan «Sumario» y «Menú» (panel con la ruta y los demás accesos; Esc lo cierra).
- **Una sola acción principal**: «Continuar donde lo dejaste» con el mismo dato que guarda la web
  (`financial-academy:ultimo`); si no hay nada guardado, «Empezar · Capítulo I».
- **Sumario** = el temario real (`temarioHtml` + `conectarBuscadorTemario` de `temario.ts`), con el
  dominio de cada apartado, los conceptos plegados, las fórmulas y las fases B–D del Tema 2. Es una
  capa de papel: se abre con el foco en el buscador, Esc la cierra y el foco vuelve al botón.
- Capítulos I (noche, la ciudad de cerca) y II (pliego de papel con el fotograma final de la
  animación de referencia); Cuaderno de estudio; Atlas como sección propia. El enlace «Abrir el Atlas»
  lleva hoy al Atlas que existe dentro de la ciudad (se dice en la propia sección).

## 2 · Portada e índice del Tema 2

- Apertura: titular, entradilla y la **ruta A → D** con «Estás aquí» en A; la animación de
  referencia como portada («Empieza aquí»).
- **Barra del capítulo** pegada bajo la navegación: A Comprender · B Identificar · C Elegir · D En
  papel, y las partes I–III con la parte que se está leyendo marcada.
- Cada parte conserva su composición (genealogía, estrella, matriz) y termina con «Cuando la
  entiendas, practícala: B · C · D» de esa parte. Al final, el paso siguiente (B) en grande.
- La secuencia pedagógica queda explícita en tres sitios: ruta de la apertura, barra fija y cierre
  de cada parte.

## 3 · Motion design: la animación de referencia

Una captura no demuestra el movimiento, así que se entrega la secuencia completa (MP4 y página de
revisión con reproductor, guion por capítulos y «antes y ahora»).

**Capitalización simple · I = C₀ · n · i** (27 s, 6 capítulos, `referencia/escena.ts`)

| s | Qué pasa | Qué enseña |
|---|---|---|
| 0 | Cae un bloque azul (C₀ = 10.000 €), echa raíces y brota | El capital inicial es lo que se planta |
| 3,2 | Etiqueta rosa «i = 7 % anual»; una tajada del 7 % del bloque | El tipo es una parte del capital, a escala |
| 6,6 | Eje de años; una flecha sale del bloque y crece un árbol con +700 € | Cosecha = C₀ · i = 10.000 · 0,07 |
| 10,6 | Años 2 y 3: las flechas vuelven a salir del **mismo** bloque | En simple siempre se calcula sobre C₀ |
| 15,2 | Llave n = 3; las tres cosechas viajan y forman I = 2.100 € | I = 3 · 700 |
| 19,2 | La fórmula se arma con piezas que vienen de la escena; cada símbolo baja a su significado; sustitución numérica | I = C₀ · n · i |

- Rigor: la tajada mide el 7 % del bloque; los tres árboles y las tres etiquetas son idénticos; las
  cifras salen del cálculo. La cámara sigue la explicación (de cerca al plano general) y nunca deja
  fuera la etiqueta del tipo una vez aparece.
- Usa el motor del proyecto sin cambios (`Lienzo`, `montarReproductor`, `tiempo.ts`, `papel.ts`):
  subtítulos, capítulos, pausa con espacio y movimiento reducido (cada capítulo en su estado final).
- Piezas nuevas reutilizables en `referencia/piezas.ts`: bloque recortado en 3D, planta, árbol,
  etiqueta rasgada con cinta, nota manuscrita, flecha discontinua.

## 4 · Texturas con medida

- Grano de papel solo donde hay composición: apertura del Tema 2, pliego del capítulo II, recortes
  y cabecera de la revisión. Las partes, el sumario y el guion van limpios.
- Imágenes de la isla solo en la apertura y en el capítulo I; el resto es tipografía y reglas finas.
- Contraste AA comprobado en los textos clave (de 5,5:1 a 15,6:1; los numerales grandes, 3,2:1).

## 5 · Viabilidad comprobada (`comprobar.mjs`, 40 comprobaciones, todas correctas)

- Los **98 enlaces** de la portada actual y los **33** del índice actual tienen equivalente en la
  maqueta (página + sumario). El buscador del temario sigue funcionando.
- 19 fichas de fórmula; las fases B, C y D de las tres partes enlazadas; «Continuar» y el dominio
  usan los datos guardados reales.
- Sin errores de consola; sin desbordamiento a 390 px en las tres pantallas.
- Sumario y menú: apertura, foco, filtro, Esc y vuelta del foco.
- Movimiento reducido: el reproductor no arranca solo y enseña la composición completa.
- `git status` sin cambios en selector, ciudad, Atlas, intro, progreso y Tema 1.
- `npm run typecheck`, `npm test` (251) y `npm run build` pasan; `dist/` no contiene la maqueta.

## Plan para la siguiente fase (si se autoriza)

1. `asignaturaView.ts` con esta portada y el Sumario (mismas rutas; las pruebas de
   `academia.dom.test.ts` se adaptan manteniendo lo que verifican). Los estilos del sumario irían en
   una hoja nueva, sin tocar `academia.css` (que es del selector).
2. `tema2/indice.ts` con esta portada, la barra del capítulo y el cierre B–D por parte.
3. Sustituir la escena `simple-intereses` por la de referencia y, con el mismo lenguaje, las demás.
4. Más adelante: vista propia del Atlas y el lenguaje en fichas y fases.

## Detalles que hay que corregir al integrar (vistos en esta revisión)

(Los exponentes de `.fx` que no subían ya están corregidos en `src/styles/tema2.css`.)


- Los paréntesis de las fórmulas no crecen con una fracción dentro (fórmula 11).
- En el temario, el texto plano de las fracciones sale con paréntesis de más («iₘ = (i) / (m)») y
  el contador dice «1 conceptos».
- El Atlas se ve pequeño en el móvil; con su propia vista se resolvería.
