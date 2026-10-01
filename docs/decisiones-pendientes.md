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
7. **Paseo en móvil.** El personaje se mueve con teclado; en pantallas táctiles el botón "Pasear"
   está oculto. ¿Añadimos un joystick táctil o tocar el suelo para ir a ese punto?
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
