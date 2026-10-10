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
