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
