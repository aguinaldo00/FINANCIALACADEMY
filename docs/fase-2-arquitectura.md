# Fase 2 · La Ciudad del Dinero como maqueta viva

La ciudad representa conocimiento: estudiar hace que se construya. Esta fase añade a la portada
una maqueta 3D explorable que también funciona como **Atlas del Conocimiento**. El Atlas no es un
sistema aparte: es la misma ciudad vista a otra escala.

## Capas

| Capa | Carpeta | Depende de | Notas |
|---|---|---|---|
| 1. DATA académica | `src/content/` | — | Sin cambios. Literal del prototipo. |
| 2. Estado de aprendizaje | `src/domain/`, `src/persistence/` | 1 | Sin cambios. |
| 3. Modelo visual derivado | `src/world/`, `src/experiences/` | 1, 2 | Puro (sin Three.js ni DOM). Testeado. |
| 4. Renderer Three.js | `src/scene/three/` | 3 | Se carga bajo demanda (`import()`), en su propio fragmento. |
| 5. UI HTML/CSS | `src/ui/world/`, `src/styles/world.css` | 3 (y 4 por tipos) | Atlas accesible, migas, etiquetas y fallback. |

`src/app/app.ts` crea un `ControladorMundo` y lo monta en la portada. Al ir a `#s/…` o a `#c/…`,
el controlador recuerda el lugar. Al volver a `#inicio`, el mapa se abre en esa zona o en ese edificio.

## Reglas de significado

- **Superficie = peso real en examen.** El treemap (`world/geometry.ts`) da a cada barrio
  (grupo) y a cada zona (sección) un área exactamente proporcional a `pesoExamen`. A nivel de
  concepto no hay peso en DATA y no se inventa (`pesoExamen: null`).
- **Estado del edificio = dominio.** Se deriva de `nivelDominio`, que ya existía:
  `sin-estudiar` → solar (volumen fantasma), `flojo`/`regular` → en obra (mitad de altura y andamio)
  y `dominado` → construido (cornisa con el color del concepto, tejado y ventanas encendidas).
  Con el motor actual solo aparecen 0, 0,5 y 1.
- **Altura.** Solo los 12 edificios de la portada original tienen altura y tejado propios
  (`tema.ciudad`). El resto comparten una altura estándar que no codifica nada.
- **Color de dominio.** El anillo del suelo y el tinte del Atlas usan `colorDominio`, el mismo
  código que la ciudad 2D, las fichas y el índice.
- **Actividad.** Hay tráfico solo en las zonas que ya se han empezado a estudiar. El hito 📌
  marca las 3 zonas de "Estudia ya", con el mismo criterio que la portada.
- Nada se comunica solo con animación: el estado siempre es geometría y texto.

## Zoom conceptual

`world/focus.ts` define `Foco = ciudad | barrio | zona | edificio`. Un único foco sincroniza la
cámara (`encuadre()`), el contorno de selección, las etiquetas flotantes, las migas y el Atlas
HTML (`world/atlas.ts`). El recorrido es este:

- **Edificio → concepto:** el primer toque enfoca el edificio y el segundo abre `#c/<id>`.
  "Entrar al concepto" hace lo mismo desde el Atlas.
- **Concepto → pregunta:** se usa la ficha existente.
- **Pregunta → mapa:** al volver, el edificio crece si ha subido de fase.

La ciudad se convierte en Atlas de dos formas: el botón "Ver Atlas" pone la cámara cenital, con
el norte arriba, y alejar la cámara tiñe cada zona con su dominio (`factorAtlas`).

## Microexperiencias

Una historia es solo datos (`experiences/schema.ts`):
concepto → entidades → flujos (`flujo` | `intercambio` | `contiene`) → pasos → pregunta.

- `experiences/esquema.ts` convierte el modo "Esquema visual" de DATA en entidades y flujos. Lo
  hace solo si el esquema es una cadena inequívoca y, si no, devuelve `null`. Hoy produce
  historias para más de 20 conceptos (intermediación, BCE ⊂ Eurosistema ⊂ SEBC, MUS, MUR, SGR,
  seguros…). Todos sus textos son literales, y un test lo verifica.
- `experiences/registry.ts`: `HISTORIAS_CURADAS` (vacío) tiene prioridad sobre las automáticas.
- Reproductor actual: HTML paso a paso en la ficha del edificio del Atlas. Un reproductor 3D
  puede consumir las mismas historias sin cambiar el modelo.

## Accesibilidad, fallback y rendimiento

- **Sin WebGL**, si falla la carga o si se pierde el contexto, se muestran la ciudad pixel art y el
  Atlas HTML con la misma navegación. La preferencia 2D/3D de cada usuario se guarda en
  `financial-academy:vista`.
- **`prefers-reduced-motion`:** no hay tráfico, banderas, balizas, crecimiento ni transiciones
  de cámara, y se escucha si la preferencia cambia en caliente.
- **Lienzo:** el lienzo lleva `role="img"`. Las etiquetas flotantes son `aria-hidden`, porque el
  Atlas es el equivalente navegable por teclado. `Escape` sube un nivel.
- **Rendimiento:**
  - El renderer se reutiliza entre visitas a la portada y no dibuja fuera de pantalla.
  - En reposo dibuja bajo demanda.
  - Árboles, ventanas y coches van instanciados.

## Pendiente (siguientes pasos)

1. Reproducir las historias en 3D: entidades como piezas sobre la maqueta, flujos animados y
   cámara guiada por pasos.
2. Relaciones entre conceptos en el Atlas. Hoy solo se muestran las que DATA respalda
   (grupo → sección → concepto). Las cadenas de los esquemas podrían enlazar edificios, pero
   antes hay que validarlo.
3. Evitar que se solapen las etiquetas en zonas densas y en móvil.
4. Rehacer el encuadre al cambiar el tamaño de la ventana.
5. Más estados visuales cuando el motor de aprendizaje los soporte (p. ej. consolidación).
