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
- **Color de dominio.** La lámina del Atlas (y, solo en la gramática de parcelas, el bordillo de
  cada lote) usa `colorDominio`, el mismo código que la ciudad 2D, las fichas y el índice. En la
  gramática urbana el estado se lee en el edificio, no en marcas de color en el suelo.
- **Vegetación, luces y actividad con motivo.** Hay árboles en las medianas de los bulevares y en
  las esquinas de las plazas, nunca como relleno. Hay farolas a lo largo de las avenidas. Hay
  tráfico solo en las zonas que ya se han empezado a estudiar. Una columna de luz marca las 3 zonas
  de "Estudia ya", con el mismo criterio que la portada.
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

El mundo no es una infografía (`world/labels.ts`):

| Nivel | Qué se rotula |
|---|---|
| Ciudad | Solo los 4 barrios, en tipografía de plano, sin cifras. Las 12 zonas, solo en lectura de mapa |
| Barrio | Sus zonas |
| Zona | Nada permanente |
| Edificio | Nada permanente: el nombre está en la ficha contextual |

Los datos exactos (peso, conceptos, dominio, estado) aparecen en la ficha contextual al señalar o
seleccionar. Las etiquetas se colocan en píxeles enteros y se apartan para no taparse entre sí. En
móvil, los barrios muestran solo su número.

## Zoom conceptual

`world/focus.ts` define `Foco = ciudad | barrio | zona | edificio`. Un único foco sincroniza la
cámara (`encuadre()`), el contorno de selección, las etiquetas flotantes, las migas y el Atlas
HTML (`world/atlas.ts`). El recorrido es este:

- **Edificio → concepto:** el primer toque enfoca el edificio y el segundo abre `#c/<id>`.
  "Estudiar el concepto" (ficha) y "Entrar al concepto" (Atlas) hacen lo mismo.
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
- **`prefers-reduced-motion`:** no hay tráfico, peatones, crecimiento, entrada cinematográfica
  ni transiciones de cámara, y se escucha si la preferencia cambia en caliente.
- **Lienzo:** el lienzo lleva `role="img"`. Las etiquetas flotantes son `aria-hidden`, porque el
  Atlas es el equivalente navegable por teclado. `Escape` sube un nivel.
- **Rendimiento:**
  - El renderer se reutiliza entre visitas a la portada y no dibuja fuera de pantalla.
  - En reposo no redibuja (medido: 0 dibujados en 3 s).
  - Cada edificio une sus piezas por material (unas 10 llamadas de dibujo por edificio).
  - Árboles, farolas, coches y peatones van instanciados.
  - Texturas de suelo procedurales de 64×64 generadas una vez (sin imágenes externas).
- **Verificación:** `scripts/verificar-chromium.mjs` (19 comprobaciones en Chromium real).

## Dirección de arte (vertical slice, barrio 4)

> "Estudiar es construirla." La ciudad es la representación del conocimiento; la interfaz académica
> vive dentro de ese mundo. Este apartado describe la gramática visual validada en el barrio 4. Los
> barrios 1–3 conservan la gramática `parcelas` hasta que se apruebe extenderla (`GRAMATICA_URBANA`
> en `world/cityModel.ts`).

### Reglas

| Canal | Comunica | Ejemplo |
|---|---|---|
| Geometría | Jerarquía | Superficie de zona = peso en examen; landmarks con silueta propia |
| Materiales | Estado | Maqueta clara (sin estudiar), obra (a medias), materiales y luz (dominado) |
| Actividad | Progreso | Tráfico y peatones solo en zonas estudiadas; más dominio, más vida |
| Iluminación | Atención | Columna de luz cálida en las zonas de "Estudia ya" |
| Interacción | Qué es | Ficha contextual al señalar o seleccionar |
| Panel HTML | Datos exactos | Atlas editorial y ficha: peso, conceptos, dominio |

Prueba de cada elemento: ¿por qué existe? Si no tiene razón funcional, espacial, narrativa o
académica, no está. Por eso desaparecieron los pines, las cifras flotantes, los bordillos de color en
la gramática urbana, el vaivén de los hitos y el parpadeo de las balizas.

### Gramática urbana (Ensanche)

`world/urban.ts`. DATA sigue siendo rectangular (treemap exacto por peso); la ocupación no:

- **Manzanas cerradas** con fachada continua a la calle y **patio interior** ajardinado (sendas en
  cruz, árboles en el contorno). Hasta 5 edificios por manzana.
- **Pasajes peatonales** arbolados entre manzanas de una misma zona.
- **Aceras con chaflán**, la esquina del Ensanche; losas, asfalto y césped con textura procedural.
- **Antepatios** delante de los emblemáticos: losas de piedra, jardineras y faroles.
- Los emblemáticos ocupan las fachadas sur y este (las que se ven desde la vista inicial).
- El **entorno está siempre construido**: el dominio cambia el edificio, nunca el escenario.
  Coches aparcados (estáticos) dan vida aunque no se haya estudiado nada.

### Arquitectura con identidad

`scene/three/urbanArchitecture.ts`. Vocabulario común de ciudad europea: zócalo, imposta, huecos con
alféizar, cornisa y remate (mansarda con buhardillas, cubierta o coronación). Sobre él:

| Tipología (glifos de DATA) | Silueta |
|---|---|
| Institucional (brain, inst, vault, globe) | Palacio: zócalo almohadillado, pórtico de orden gigante con friso del color del concepto, escalinata, frontón o cúpula |
| Autoridad central (brain, altura de portada ≥ 9) | Torre institucional sobre basamento palaciego con templete: la silueta más alta |
| Banco (bank, ship, chapel, hive) | Basamento de granito con patio de operaciones y torre de piedra con pilastras |
| Supervisión (eye, lens) | Podio de piedra y torre de vidrio con montantes y mirador en la coronación |
| Protección (shield, umbrella) | Volumen macizo con gran alero; con cúpula, rotonda exenta con contrafuertes o "paraguas" |
| Lonja (chart, screen, metro) | Nave de ladrillo con bóveda de zinc, ventanales y panel de cotizaciones luminoso |
| Pagos (card, phone, link) | Vidrio claro, volumen superior girado, líneas de luz en los forjados |
| Oficina (resto) | Bloque de fachada continua, ático retranqueado y terraza |

Rasgos por glifo: `vault` zócalo almohadillado · `handshake` dos volúmenes unidos por una pasarela
(aval) · `truck` portones · `basket` celosía de bronce · `store`/`car` escaparate con toldo ·
`chapel` hastial con rosetón (con el remate "ruina" de la portada) · `umbrella` gran alero ·
`eye`/`lens` mirador. Los tejados siguen las convenciones de la portada original.

**Landmarks** (los 12 de la portada, `tema.ciudad`): Banco de España (palacio con frontón), BCE
(torre con templete), FGD y DGSFP (rotondas), CNMV y MUR (supervisión con antena), bancos (torre con
bandera), cajas (nave con rosetón), cooperativas (cubierta de teja), ICO, fondos y SGR.

### Paleta

Fondo oscuro cálido, blanco cálido (`--m-tinta`), piedras arena y ocre, pizarra, cobre verdoso en
cúpulas. El **oro** solo señala: recomendación, acción, luz. Los colores de dominio conservan su
significado y aparecen únicamente como muestra pequeña junto a un dato.

### Cámara como lenguaje

| Nivel | Óptica |
|---|---|
| Ciudad | Tres cuartos, objetivo normal (30°) |
| Mapa (Atlas) | Cenital y orientado al norte |
| Barrio | Isométrica de teleobjetivo (17°): perspectiva casi plana, como una axonometría |
| Zona | Más baja, se entra en las calles |
| Edificio | Arquitectónica (38°), frente a la fachada principal, algo de lado |

Transiciones de 1,1 s con arco (la cámara "vuela" entre lugares lejanos) e interpolación del campo
de visión. Composición asimétrica (`setViewOffset`): con la ficha a la izquierda, el sujeto se
desplaza a la derecha. Niebla de profundidad. **Vista en corte**: en el plano de edificio se retiran
los edificios que se interponen. **Entrada de primera visita**: negro → marca → la cámara desciende
mientras los barrios se levantan → "Estudiar es construirla" → navegación. Se salta con un botón,
Escape o un toque; no se repite (`financial-academy:entrada`) ni se muestra con movimiento reducido.

### Interfaz editorial

Sin tarjetas ni pills: filetes finos, tipografía protagonista y números grandes. La navegación es
una ruta de lugares con tres acciones de texto. La ficha contextual sigue el orden de lectura
qué es → cuánto pesa → qué sé → dónde entrar. El Atlas es un índice con clave, nombre y estado, peso
con barra fina y dominio alineados a la derecha. La leyenda tiene cuatro claves.

## Pendiente (siguientes pasos)

1. Reproducir las historias en 3D: entidades como piezas sobre la maqueta, flujos animados y
   cámara guiada por pasos.
2. Relaciones entre conceptos en el Atlas. Hoy solo se muestran las que DATA respalda
   (grupo → sección → concepto). Las cadenas de los esquemas podrían enlazar edificios, pero
   antes hay que validarlo.
3. Más estados visuales cuando el motor de aprendizaje los soporte (p. ej. consolidación).
4. Extender la gramática urbana a los barrios 1–3 (pendiente de aprobación).
5. Resaltar el edificio al pasar el ratón (hoy solo cambia el cursor y aparece la ficha).
6. Storytelling por scroll donde aporte comprensión.
