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
- **Estado del edificio = dominio.** Se deriva de `nivelDominio`, que ya existía. Es siempre la
  misma masa arquitectónica, más o menos construida (un plano de corte por edificio):
  - `sin-estudiar` → **en proyecto**: maqueta blanca entera, con los huecos grabados;
  - `flojo`/`regular` → **en obra**: mitad inferior acabada, mitad superior en blanco, con andamio y grúa;
  - `dominado` → **construido**: materiales, color del concepto, ventanas encendidas y remate.

  Con el motor actual solo aparecen 0, 0,5 y 1. Al subir de fase, el corte sube y el edificio "se
  construye" (sin animación si hay movimiento reducido).
- **Tipología = glifos de DATA** (`world/typology.ts`). El primer glifo del concepto que pertenece a la
  gramática visual decide su arquitectura:

  | Tipología | Glifos | Arquitectura |
  |---|---|---|
  | Institucional | brain, inst, vault, globe | Podio, pórtico de columnas, friso con el color del concepto |
  | Banco | bank, ship, chapel, hive | Basamento y torre de piedra con pilastras |
  | Supervisor | eye, lens | Torre de vidrio con forjados y mirador |
  | Aseguradora | shield, umbrella | Bloque con gran alero protector |
  | Lonja | chart, screen, metro | Nave con bóveda y panel de cotizaciones |
  | Tecnológica | card, phone, link | Volúmenes de vidrio girados con líneas de luz |
  | Oficina | el resto | Bloque escalonado con ventanas corridas y terraza |

  Los remates siguen las convenciones de la portada original: frontón institucional, antena de
  supervisión, cúpula de protección y bandera de banco.
- **Altura.** Los 12 edificios de la portada original conservan su altura y su tejado de DATA. El
  resto usan la altura de su tipología. La altura nunca codifica conocimiento.
- **Lotes.** Cada manzana se reparte en lotes que la cubren entera (solo quedan pasajes). Si sobra
  espacio por concepto, se reserva una plaza con fuente y bancos. Un lote con espacio libre es jardín.
- **Color de dominio.** El bordillo de cada lote y la lámina del Atlas usan `colorDominio`, el
  mismo código que la ciudad 2D, las fichas y el índice.
- **Vegetación, luces y actividad con motivo.** Hay árboles en las medianas de los bulevares y en
  las esquinas de las plazas, nunca como relleno. Hay farolas a lo largo de las avenidas. Hay
  tráfico solo en las zonas que ya se han empezado a estudiar. El hito 📌 marca las 3 zonas de
  "Estudia ya", con el mismo criterio que la portada.
- Nada se comunica solo con animación: el estado siempre es geometría y texto.

## Parpadeo: causa y corrección

Medido en Chromium con WebGL: con la cámara quieta y movimiento reducido no cambia ningún píxel
entre fotogramas. Al orbitar, en cambio, las avenidas mostraban un rayado inestable.

1. **Z-fighting por superficies coplanares.** El canto de la peana y el asfalto tenían la cara
   superior exactamente en `y = 0`, y la GPU elegía uno u otro según el ángulo. Lo mismo pasaba
   (con márgenes de 0,02) con el césped, los anillos de dominio y las ventanas.
2. **Plano cercano fijo** en 0,5 con la cámara a unas 280 unidades: la precisión de profundidad
   (~0,01) no separaba esas superficies.
3. **Baliza intermitente y volúmenes transparentes.** La baliza parpadeaba de verdad, y los
   volúmenes fantasma cambiaban de orden de dibujo al mover la cámara.

Corrección:
- Los niveles del suelo están separados (`NIVEL` en `palette.ts`) y un test lo comprueba.
- Los calcos (marcas viales, ventanas) usan `polygonOffset`.
- El plano cercano y el lejano se ajustan a la distancia real de la cámara.
- No hay transparencias en los edificios, y nada parpadea.

## Encuadre

La cámara ya no encuadra una esfera envolvente, que dejaba la ciudad pequeña y rodeada de vacío.
Proyecta las esquinas reales del foco y busca (bisección) la distancia mínima a la que caben.

- **Vista inicial:** tres cuartos poco diagonal; casi frontal y algo más cenital en móvil.
- **Al redimensionar:** se reencuadra lo que se estaba viendo.

## Etiquetas

Están jerarquizadas (`world/labels.ts`):

| Nivel | Qué se rotula |
|---|---|
| Ciudad | Los 4 barrios y los 3 hitos 📌. Las 12 zonas, solo en lectura de mapa |
| Barrio | Sus zonas |
| Zona | Nada fijo: el nombre aparece al pasar el puntero |
| Edificio | Solo él |

Las etiquetas se colocan en píxeles enteros y se apartan para no taparse entre sí. En móvil, los
barrios muestran solo su número.

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
  - En reposo no redibuja (medido: 0 dibujados en 3 s).
  - Cada edificio une sus piezas por material (unas 10 llamadas de dibujo por edificio).
  - Árboles, farolas y coches van instanciados.

## Pendiente (siguientes pasos)

1. Reproducir las historias en 3D: entidades como piezas sobre la maqueta, flujos animados y
   cámara guiada por pasos.
2. Relaciones entre conceptos en el Atlas. Hoy solo se muestran las que DATA respalda
   (grupo → sección → concepto). Las cadenas de los esquemas podrían enlazar edificios, pero
   antes hay que validarlo.
3. Más estados visuales cuando el motor de aprendizaje los soporte (p. ej. consolidación).
