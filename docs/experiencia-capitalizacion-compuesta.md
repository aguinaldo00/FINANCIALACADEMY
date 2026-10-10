# Tema 2 · Matemática financiera

El Tema 2 tiene entrada y ruta propias (`#tema/2`). El selector general (`#temas`) conecta los
temas sin mezclar su contenido con La Ciudad del Dinero, que sigue correspondiendo al Tema 1.

## Primera lección: capitalización compuesta

La secuencia didáctica sigue el planteamiento del PDF: distinguir capitalización simple y compuesta,
observar que en la compuesta cada interés se incorpora al capital, desarrollar el cálculo por
periodos y generalizar el patrón. El gráfico representa capital frente a tiempo; durante la
generación de intereses el incremento se muestra como una previsión, y al cierre se incorpora al
recorrido como un nuevo capital.

Las etapas incluyen la regla, el interés generado en cada periodo, el capital al cierre, la fórmula
general del capital final y el cálculo de los intereses totales. Se identifican `C₀`, `Cₙ`, `n`, `i`
e `I`. Las fórmulas se basan en el PDF del Tema 2, páginas impresas 39, 50 y 51. El ejemplo de
1.000 €, 5 % y tres años procede de la solicitud del alumno, no del PDF.

## Cálculo

- El dominio usa céntimos enteros y tasa anual en puntos base.
- Cada cierre anual se redondea a céntimos, mitad hacia arriba.
- Los capitales resultantes son 1.050,00 €, 1.102,50 € y 1.157,63 €.
- Los intereses de cada periodo son 50,00 €, 52,50 € y 55,13 €.
- La potencia sin redondear da 1.157,625 €, que se presenta como 1.157,63 €.
- `I` nombra los intereses totales acumulados, no el interés de un año concreto.

Los importes del gráfico y las ecuaciones salen del mismo modelo matemático. El cálculo, la secuencia
de aprendizaje y la representación gráfica están separados.

## Interacción y accesibilidad

La explicación admite reproducción, pausa, reinicio, avance y selección directa de etapas. Al salir
de la ruta se limpia el temporizador. Con `prefers-reduced-motion`, se desactiva la reproducción
automática y permanecen los controles manuales. El gráfico SVG se adapta a pantallas estrechas.

Capitalización simple, parámetros editables y evaluación persistente quedan pendientes.
