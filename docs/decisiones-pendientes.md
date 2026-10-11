# Decisiones pendientes

Dudas encontradas durante el trabajo autónomo. Ninguna bloquea lo ya hecho.

1. **Extender la gramática urbana a los barrios 1–3** (tarea 8 de la cola). Requiere tu aprobación.
   Técnicamente es cambiar `GRAMATICA_URBANA` en `src/world/cityModel.ts`; los barrios 1 y 2 tienen
   zonas pequeñas (1–4 conceptos) y habría que revisar que las manzanas no queden demasiado estrechas.
2. **Menciones de texto entre conceptos** (72 detectadas). ¿Se pueden mostrar en el esquema como
   "aparece en", sabiendo que no tienen tipo y que algunas son contrastes de examen? Requiere
   validación manual de cada una.
3. **Enlazar entidades de los esquemas con edificios** (p. ej. "🏦" en la intermediación indirecta
   con un banco de la ciudad). DATA no lo indica; sería una interpretación.
4. **Miniatura del esquema en la barra lateral.** Cambiaría el diseño literal heredado del prototipo.
5. **Texto "Fase 1 de 6…" de la portada.** Es texto del prototipo y su numeración de fases no
   coincide con la del proyecto actual. No se ha tocado.
6. **"Dominio alto → pregunta difícil" en las microexperiencias.** DATA tiene una sola pregunta por
   concepto; en dominio alto se propone la misma pregunta en versión abreviada.
7. ~~**Paseo en móvil.**~~ **Resuelto (02/10):** joystick táctil con botones "Saltar" (doble
   toque: dash) y "Entrar".
8. **Colisiones del paseo.** Hoy solo chocan los edificios; el personaje atraviesa fuentes, árboles
   y bancos. ¿Merece la pena añadirlos como obstáculos?

## Predicción de examen y preguntas de práctica (02/10)

- **Probabilidades:** las de los bloques (30/25/20/15/10) son las de los apuntes del alumno y se
  muestran como "estimadas según tus apuntes". No sustituyen al `pesoExamen` de DATA, que sigue
  dando el tamaño de los barrios del mapa.
  - **¿Unificar?** Decidir si el mapa debería usar también estos pesos.
- **Práctica y dominio:** las preguntas de práctica y los simulacros no suben el dominio.
  - **¿Contar parcialmente?** Decidir si deberían contar en parte (p. ej. hasta 0,5).
- **Router:** se añadió la ruta `#examen`, un cambio mínimo pedido explícitamente.

## Revisión del temario del libro (02/10)

- **Añadido a la ampliación** (DATA intacta): apartados 1 y 2 del temario.
  - 15 preguntas de práctica;
  - 8 flashcards;
  - 2 esquemas: "Unidades económicas" y "Funciones y razón de ser".
- **Temas cubiertos:** dinero, unidades económicas y sus tipos, ahorradores e inversores,
  terminología (excedentaria o deficitaria), financiación, caso práctico INST, SA, razón de ser y
  complejidad del sistema, vías bursátil y bancaria, sistema de pagos y vocabulario.
- **No añadido:**
  - **Actividad 2 (familia de cuatro miembros):** falta el importe del gasto de ocio en el texto, así
    que no se puede resolver sin inventarlo.
  - **Introducción de la Unidad 2 (cálculo financiero):** el texto incluye su portada, pero
    pertenece a otro tema.

## Simulacro, repaso y práctica persistente (02/10)

- **Dominio:** el simulacro del tema y el repaso no cambian el dominio (solo "Compruébalo" lo hace).
  - **¿Contar parcialmente?** Decidir si un simulacro aprobado debería sumar dominio.
- **Persistencia:** la práctica se guarda en una clave aparte (`financial-academy:practica`); el
  progreso no cambia de formato.
- **Repaso de fallos:** una pregunta fallada sale del repaso tras 2 aciertos seguidos.
- **Flashcards:** entran como mucho 10 nuevas al día (constantes en `domain/practice.ts`).

## Decoración y día/noche (02/10)

- **Día y noche:** día = aprender y noche = repasar, como eligió el usuario.
  - **Cambio:** solo con el botón, y el mapa se abre siempre de día.
  - **Persistencia:** no se guarda nada; la elección dura mientras la aplicación está abierta.
  - **Ruta nueva:** `#repaso/<concepto>`, para repasar solo lo pendiente de un edificio.
- **Mapa 2D:** no cambia con el ambiente (ya tiene un cielo nocturno propio).
  - **¿Igualarlo?** Decidir si debería seguir el mismo ciclo.
- **Emblemas:** solo usan el primer glifo de cada concepto (el principal del icono 2D). Los glifos
  secundarios no se dibujan, para no recargar la fachada.
- **Animación continua:** las palomas y las nubes hacen que la escena se redibuje (a unos 30 fps)
  mientras el mapa está a la vista. Con movimiento reducido no se anima nada.


## Academia y navegación (10/10)

- **Segmentación en unidades:** el selector y el temario usan lo que hay ("Tema 1", "Tema 2" y,
  dentro del Tema 1, sus 4 grupos de DATA).
  - **¿Unidades por encima de los temas?** Decidirlo. La arquitectura lo admite: un nivel más en
    el árbol del temario.
- **Asignaturas sin contenido:** Contabilidad, Gestión Logística, Recursos Humanos, IPE y
  Simulación Empresarial aparecen como "Todavía sin contenido". No tienen temas, estado ni
  progreso inventados.
- **Zonas de la ciudad:** el boceto mostraba 6 zonas (Política monetaria, Mercados
  internacionales…) que no existen en DATA. Se usan los 4 grupos reales; cambiarlo requiere
  decidir antes la estructura académica.
- **Islas del selector (prueba de Gestión Financiera):**
  - **Moneda de la cúpula:** la ilustración generada lleva un símbolo parecido a "$". ¿Se
    regenera con "€", o se retoca?
  - **Las otras 5 islas:** pendientes de aprobar esta. Para mantener la coherencia, hay que
    generarlas con el mismo estilo, luz y encuadre.
  - **Derechos de las imágenes:** son imágenes generadas con Figma AI, con el plan del usuario.
    Antes de publicarlas de forma comercial, conviene confirmar las condiciones de uso de Figma
    para lo que se genera.
  - **Calidad en pantallas grandes:** la isla mide 1024 px. En pantallas 4K o al acercarse al
    entrar se nota algo de suavizado. Si se aprueba, conviene regenerarla a 2048 px.
- **Intro del barco (prototipo):**
  - **Imágenes:** el barco y el remolino son los recortes que aportó el usuario. Confirmar sus
    derechos de uso antes de publicar.
  - **Barco:** es una ilustración plana, así que no puede girar. Si se quiere que vire o se vea
    desde otro ángulo, hacen falta más vistas o un modelo 3D de calidad.
  - **Título:** "Financial Academy" con el lema "Ciclo de Administración y Finanzas". ¿Otro texto?
  - **Sonido:** no tiene. Si se añade, tendría que empezar tras un gesto del usuario.

## Tema 2 y propuesta editorial (11/10)

- **Identidad editorial en el resto de pantallas.** Ya está en la portada de la asignatura y en el
  índice del Tema 2 (ver `docs/identidad-editorial.md`). ¿Se extiende a las fichas, a las fases B–D
  y al estudio del Tema 1?
- **Fases B, C y D del Tema 2.** Funcionan y tienen pruebas de rutas y de cálculo, pero falta una
  revisión visual a fondo y pruebas propias de los enunciados y de las escenas.
- **Detalles de las fórmulas en HTML.** Los paréntesis no crecen alrededor de una fracción; en el
  temario el texto plano de las fracciones lleva paréntesis de más («iₘ = (i) / (m)») y el contador
  dice «1 conceptos».

## Infografías del Tema 1 y auditoría (11/10)

Detalle en `docs/infografias-tema1.md` y `docs/auditoria-tema2.md`.

- **Calcografía en el ICO:** está en la app real. ¿Se aprueba para extenderla a las otras 11 infografías?
- **Exactitud: corregido el 11/10 con permiso del usuario.**
  - Banco de España: ya no dice que financie a las Administraciones públicas.
  - AES en plural.
  - EFC y EDE fuera de las entidades de crédito.
  - SGR con socios protectores.
  - ICO: «mínimo 10 M€» y el Estado asume el riesgo en la vía de agencia.
  - FGD: sucursales de la UE.
  - Lista de depositarias.
  - Flashcard de la EDE: la autoriza el Banco de España.
  - Tema 2: caso 28 (exponente −565/365), caso 29 (pide el descuento, como el libro), resumen del descuento compuesto y rótulo de la ficha de la remesa.

  Las correcciones de los conceptos del Tema 1 quedan registradas en `src/content/temas/tema-01/correcciones.ts`.
- **Glosario y siglas: hecho.**
  - Página `#glosario` y botón en cada sigla de las fichas y las infografías (`src/content/glosario.ts`, `src/ui/components/siglas.ts`).
  - Pendiente: llevarlo a la ficha de los edificios de la ciudad, a las escenas y al Tema 2.
- **«OMEC»:** no aparece en ningún texto del proyecto. ¿Dónde se vio?
- **Errores del Tema 2:** caso 28 (exponente −565/365) y la frase del descuento compuesto en `formulas.ts:56`.

## Plan maestro (11/10)
Las dudas de conversión de periodos y tipos están en `docs/plan-completo.md`, §14. El 11/10 se resolvieron el bimestre y la quincena, el 360/365, TAE → TIN y OMEC; quedan el redondeo de iₘ y los casos del libro sin convenio.

## Narración de las animaciones (pedida el 11/10, sin empezar)
Narración provisional con la voz del dispositivo, usando la Web Speech API (`speechSynthesis`): gratis y sin dependencias.
- **Qué se lee:** el subtítulo de cada capítulo pasado a voz, con las fórmulas leídas como en clase («ce ene igual a ce cero por, uno más i, todo elevado a ene»).
- **Locución propia:** un campo opcional `locucion` en `Capitulo` para cuando el subtítulo no suene bien leído.
- **Botón:** «Narración» en los mandos del reproductor, apagado por defecto y recordado. No aparece si el navegador no tiene voz.
- **Sincronía:** el reproductor espera en el instante de lectura de cada capítulo hasta que la voz acaba, con un tope por si nunca avisa del final.
- **Pausa y cambio de capítulo:** al pausar o salir de pantalla, la voz calla; al saltar de capítulo, empieza la del nuevo.
- **Voces según el dispositivo:**
  - Windows: Helena, Laura o Pablo; en Edge, las voces «Natural» online, que suenan mejor.
  - Android y Samsung: el motor de voz del teléfono.
  - Apple: las voces en español del sistema (Mónica, Jorge…). Las voces de Siri no suelen estar disponibles para páginas web.
