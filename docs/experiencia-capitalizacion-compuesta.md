# Tema 2 · Matemática financiera

La web entra por el índice de temas (`#temas`, también sin hash). El Tema 2 tiene rutas propias en
el router: `#tema/2`, `#tema/2/<lección>` y `#tema/2/<lección>/<parte>`. La Ciudad del Dinero sigue
siendo el Tema 1 (`#inicio`). "Todos los temas" está siempre arriba del menú lateral, en los dos temas.

## Estructura de la lección y por qué

La lección va en cinco partes, en este orden. Cada decisión sale de la investigación sobre
aprendizaje (Mayer, Sweller/Renkl, Rohrer, Roediger y Karpicke):

| Parte | Qué hace | Principio |
|---|---|---|
| 1. Los símbolos | C₀, Cₙ, n, i, I y las fórmulas, **antes** del cálculo | Preentrenamiento: conocer las piezas antes de ver el proceso reduce la carga |
| 2. Paso a paso | Ejemplo resuelto año a año, con **modo cuaderno** | Segmentación y ritmo del alumno; predecir/recuperar antes de ver (efecto generación) |
| 3. Errores típicos | Se ve el error, se piensa qué falla y luego la corrección | Ejemplos erróneos: localizar y corregir mejora la retención |
| 4. Tu turno, en papel | Casos del libro con ayudas que se retiran (completar → pista → nada) | Desvanecimiento de ejemplos resueltos; evita el efecto de inversión por pericia |
| 5. ¿Qué fórmula toca? | Elegir fórmula entre tipos **mezclados** (simple y compuesta) | Práctica intercalada: entrena a reconocer el tipo, que es lo que más se falla |

- **Modo cuaderno (activado por defecto):** en cada etapa con cálculo se pide hacerlo en papel y el
  resultado se oculta, también en el gráfico ("+?", "C₁ · ?"), hasta pulsar "Ya lo tengo". En este
  modo no hay reproducción automática. Al desactivarlo se ve todo y se puede reproducir seguido.
- **Color fijo por variable** (Okabe-Ito, apta para daltonismo) en toda la lección: C₀ azul, Cₙ y
  capitales intermedios naranja, i verde, n rosa, I bermellón. El símbolo siempre va escrito: el
  color es una ayuda, no la única pista (`src/ui/components/simbolos.ts`).
- **Nada de calcular en la web:** la profesora pide papel y calculadora. La web oculta resultados,
  da la secuencia de teclas y pide autoevaluarse; las cifras de las soluciones salen de
  `src/domain/formulasCompuesta.ts`, con tests contra los casos resueltos del libro.
- Cambiar de parte desde el menú solo desplaza la página: no se pierde lo ya revelado.

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

## Pendiente

- Capitalización simple como lección propia (ya entra mezclada en "¿Qué fórmula toca?").
- Guardar los resultados de "¿Qué fórmula toca?" y de la autoevaluación en la práctica espaciada
  (`practiceStore`), para que salgan en el repaso de días posteriores.
- Confirmar con la profesora: decimales que pide, año civil o comercial y si acepta la conversión
  de años a meses y días con dos decimales como hace el libro.
- Erratas del libro detectadas: caso de María (15.000 × 3 × 0,03 = 1.350 €, no 1.450 €) y "raíces
  cuadradas" al despejar i en compuesta (es la raíz de índice n).
