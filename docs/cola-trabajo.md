# Cola de trabajo nocturna

Reglas:
- Al terminar cada tarea: tests, typecheck y build; commit y push a `claude/quirky-lovelace-79c6fm`; marcarla con [x].
- Si se agota el límite, la siguiente sesión retoma la primera tarea pendiente.
- No preguntar: las dudas van a `docs/decisiones-pendientes.md` y se sigue con la siguiente tarea.
- No cambiar DATA, contenido académico, persistencia ni router. No inventar contenido ni relaciones.
- Ante una decisión arquitectónica irreversible: dejar todo estable, documentarla y saltar a otra tarea.

Rutina horaria: `trig_01EsNSKvi2kqpUXensnJE3Xn` (00:25–08:25, Europe/Madrid). Desactivarla al terminar la cola.

## Tareas

- [x] 1. Terminar el vertical slice del barrio 4 con los criterios acordados: gramática urbana, landmarks, rótulos mínimos, ficha contextual, columna de luz, cámara por nivel y entrada cinematográfica. Seguir paso a paso `docs/plan-cierre-slice.md` (no borrarlo).
- [ ] 2. Verificar en Chromium: escritorio, móvil, sin WebGL, movimiento reducido, navegación y vuelta al mapa.
- [ ] 3. Documentar la dirección de arte en `docs/fase-2-arquitectura.md`.
- [ ] 4. Actualizar la PR y republicar el artefacto en el mismo enlace.
- [ ] 5. Escribir en `docs/esquema-del-tema.md` el análisis y la propuesta de arquitectura del Esquema del tema: datos y relaciones reales de DATA, las que no existen, integración con la barra lateral y piezas compartidas con la ciudad y el Atlas. Sin implementarlo.
- [ ] 6. Escribir en `docs/microexperiencia-intermediacion.md` el storyboard (6–8 fotogramas) de "Intermediación indirecta" con textos literales de DATA y principios de motion. Sin implementarlo.
- [ ] 7. Rendimiento, revisión de errores y ampliar tests donde falten.
- [ ] 8. (Opcional, solo con aprobación del usuario) Extender la gramática urbana a los demás barrios.

Al terminar: `docs/resumen-noche.md` y desactivar la rutina.
