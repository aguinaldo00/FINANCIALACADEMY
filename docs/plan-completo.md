# Plan completo · Financial Academy

Plan maestro de evolución, escrito el 11/10. Se lee al empezar cada sesión. Se basa en
`docs/auditoria-tema2.md` (no se repite la auditoría), `docs/experiencia-capitalizacion-compuesta.md`,
`docs/infografias-tema1.md`, `docs/identidad-editorial.md` y `docs/decisiones-pendientes.md`.

**Cómo se trabaja**
- Un incremento pequeño por sesión y por PR, en el orden del §13.
- Al terminar cada uno: typecheck, test y build; previsualización (§12); fusión; y parar a esperar.
- No se migra de framework, no se rehacen las 19 animaciones y no se crean motores paralelos.
- Las dependencias nuevas solo entran con justificación escrita aquí.
- `src/content/` solo se toca con permiso expreso. Nada académico se inventa: lo que no consta en `docs/fuentes` va a §14.

---

## 1. Estado actual

| Pieza | Estado | Dónde |
|---|---|---|
| 19 fórmulas del Tema 2 con ficha, escena y relaciones | **Existe** | `src/content/temas/tema-02/formulas.ts`, `src/ui/escenas/` |
| Motor de escenas: `Lienzo` SVG 720×600, `Escena`, capítulos y reproductor | **Existe** | `src/ui/motion/` |
| Reproductor con expansión (FLIP) | **Existe** | `src/ui/components/reproductorExpandido.ts` |
| Cálculo financiero: céntimos enteros y casos del libro con pruebas | **Existe** | `src/domain/calculoFinanciero.ts`, `formulasCompuesta.ts` |
| Generador con semilla | **Existe, sin usar en el Tema 2** | `src/domain/exam.ts:71` (`aleatorio`) |
| Fases B, C y D (identificar, elegir, practicar) y 21 ejercicios | **Existe, hay que ampliarlo** | `src/ui/views/tema2/fases.ts`, `ejercicios.ts` |
| Modo cuaderno: oculta resultados y pide hacerlos en papel | **Existe, hay que ampliarlo** | `src/ui/components/capitalizacionCompuesta.ts`, `practicaCompuesta.ts` |
| Progreso y repetición espaciada | **Existe** (en el Tema 2 no guarda nada) | `practice.ts`, `recall.ts`, `session.ts` |
| Pintado de fórmulas (texto a SVG o HTML) | **Existe, con un fallo**: no admite `_{12}` | `src/ui/matematica/formula.ts` |
| Identidad editorial (portada, índice, Sumario en fichas y fases) | **Existe** | `editorial.ts`, `editorial.css` |
| Glosario de 50 entradas con siglas explicables | **Existe, hay que ampliarlo** (aún no está en la ciudad, las escenas ni el Tema 2) | `src/content/glosario.ts`, `siglas.ts` |
| Infografía del ICO en «Calcografía» | **Existe** (faltan las otras 11) | `src/ui/infografias/` |
| 4 escenas «noche» del Tema 1 | **Hechas, sin montar** | `src/ui/escenas/tema1/` |
| Fallos de escena (`i₁₂`, solapes, capítulos que acaban a medias, móvil) | **Hay que corregirlos** | auditoría §3.0–3.1 |
| Calculadora física funcional | **Nueva** | — |
| Cuaderno interactivo con entradas | **Nuevo** | — |
| Analizador de expresiones (árbol de operaciones) | **Nuevo** | — |
| Matriz de conversión de periodos y tipos | **Nueva** (hoy las reglas están repartidas en textos) | — |
| Diagnóstico de errores por mutaciones | **Nuevo** (diseñado en la auditoría §4.2) | — |
| Laboratorio por fórmula y modo EXAMEN | **Nuevos** | — |
| Escena de conversión de periodos y tipos | **Nueva** (la única animación nueva) | §9 |
| Atlas de 34 relaciones y transición «planta» | **Nuevos** (diseñados en la auditoría §5) | — |

## 2. Arquitectura: una sola fuente de verdad

```
src/content/ (datos y textos, protegido)
      │  ids de fórmula, enunciados, casos del libro
      ▼
src/domain/tema2/ (lógica pura, sin DOM, con pruebas)
  periodos.ts      matriz de conversión de duraciones y tipos
  expresion.ts     analizador → árbol (AST) → evaluación
  laboratorio.ts   declaración de cada fórmula: variables, despejes, unidades, restricciones
  explicar.ts      árbol del alumno + datos del ejercicio → explicación
  diagnosticar.ts  caminos erróneos (mutaciones) → tipo de error
  generador.ts     familias con semilla → «Ejercicio de práctica»
      │  números y pasos ya calculados
      ▼
src/ui/ (presentación)
  escenas · calculadora · cuaderno · laboratorio · ejercicios/EXAMEN · fichas
```

**Reglas**
- Ninguna vista calcula por su cuenta. Todo importe visible (en la escena, la ficha, el ejercicio, la calculadora o el cuaderno) sale de `src/domain/tema2/`.
- Una prueba compara las cifras que pinta cada escena con las del dominio: si dos pantallas dan cifras distintas, la prueba falla.
- Los números internos se guardan sin redondear; solo se redondea al mostrar, y el redondeo sigue el convenio del material (importes al céntimo, mitad hacia arriba).
- `calculoFinanciero.ts` y `formulasCompuesta.ts` se reutilizan dentro de `tema2/`: no se duplican.
- Las declaraciones de despejes son lógica matemática y van en `src/domain/tema2/laboratorio.ts`, enlazadas por id a `formulas.ts`. Los textos para el alumno siguen en `src/content/`.

## 3. Matriz de conversión (`periodos.ts`)

Es la misma en todas partes: escena, fichas, ejercicios, diagnóstico y calculadora.

| Unidad | m (por año) | Fuente |
|---|---|---|
| año | 1 | temario |
| semestre | 2 | temario |
| cuatrimestre | 3 | temario |
| trimestre | 4 | temario |
| mes | 12 | temario |
| día, año comercial | 360 | temario |
| día, año civil | 365 | temario |

Bimestre (m = 6) y quincena (m = 24) solo se **mencionan** en el calendario de la escena, sin explicarlos ni generar ejercicios con ellos (decisión del usuario, 11/10).

**Funciones, cada una con nombre propio** (nunca una regla única de «dividir entre 12»):
- `convertirDuracion(valor, de, a, convenio)`: solo cambia la duración. Ejemplos: 195 días → 195/365 años; 2,78 años → 2 años, 9 meses y 11 días, con el convenio del material (n con 2 decimales, mes de 30 días; CP13).
- `tipoProporcional(i, m)`: solo en simple, iₘ = i/m (fórmula 6, CP14).
- `tipoEquivalente(i, de, a)`: solo en compuesta, en los dos sentidos. iₘ = (1+i)^{1/m} − 1 e i = (1+iₘ)^m − 1 (fórmula 12, CP19).
- `nominalAEfectivo(Jₘ, m)`: iₘ = Jₘ/m (el TIN se divide porque está definido así) y TAE = (1 + Jₘ/m)^m − 1 (fórmula 14, CP24).
- `efectivoANominal(TAE, m)`: la inversa, Jₘ = m · ((1 + TAE)^{1/m} − 1) (Actividades 37 y 38: «la TAE a partir del TIN y viceversa»).
- Nominal de una frecuencia a otra: no es una fórmula nueva, sino la cadena de las dos anteriores (Jₘ → TAE → Jₖ). Se enseña como combinación.
- `homogeneizar(dato tipo, dato tiempo, régimen)`: decide si hay que convertir el tiempo, convertir el tipo o dejarlo igual, y devuelve el porqué.
- `diasEntre(fecha1, fecha2)`: días reales entre fechas, para vencimientos y descuentos.
- `llevarAFecha(capital, desde, hasta, ley)`: lleva un capital a otra fecha con la ley del enunciado. Sirve para comparar o sustituir capitales que vencen en días distintos (equivalencia financiera y sustitución de capitales, CP3).
- El convenio 360/365 sale siempre del enunciado («año comercial» o «año civil»), también para el equivalente diario en compuesta.

Fórmulas como el vencimiento común o el vencimiento medio no constan en `docs/fuentes`: solo entran si aparecen en los apuntes.

## 4. Analizador de expresiones (`expresion.ts`)

- **Entrada:** el texto tal como lo teclea el alumno. Admite:
  - coma decimal española;
  - `+ − × ÷ ^`, paréntesis y `Ans`;
  - `√` y raíz de índice n;
  - `log` (base 10) y `ln`;
  - `%` solo como tecla de la calculadora y con un significado explícito.
- **Salida:** un árbol de operaciones tipado (número, variable, operación binaria, función o raíz) que conserva la posición de cada trozo en el texto original. La evaluación usa precisión completa.
- **Sin magia:**
  - nunca reescribe ni corrige en silencio lo que se ha tecleado;
  - si falta un paréntesis o hay ambigüedad, lo dice y señala dónde;
  - la multiplicación implícita no se supone, se pregunta.
- **Pruebas de aceptación.** La primera: `3000 ÷ (1 + 3 × 0,07)` = 2.479,338…, que se muestra como 2.479,34 €. Después: precedencia de operadores, potencias encadenadas, `Ans` y errores de sintaxis.
- Es un analizador descendente recursivo escrito a mano (unas 300 líneas). **No hace falta ninguna dependencia** (mathjs o similares): el alcance es pequeño y el árbol tiene que ser nuestro para poder explicarlo.

## 5. Calculadora

- **Aspecto de calculadora física:**
  - teclado de cifras, `( )`, `Ans`, `x^y`, `√`, `ⁿ√`, `log`, `ln`, `DEL`, `AC` y `=`;
  - pantalla de dos líneas: lo tecleado arriba y el resultado abajo;
  - selector de decimales mostrados (FIX 2/4/6, como en el examen), sin cambiar el valor interno.
- **Uso:** con ratón, dedo o teclado físico, y con etiquetas accesibles.
- **«Enviar al cuaderno»** copia la expresión y el resultado como una entrada nueva.
- **«Explícame cómo lo he hecho»** (§7) pasa el árbol al explicador.
- No se bloquea nunca fuera del EXAMEN, porque forma parte del aprendizaje. En el EXAMEN se puede quitar (§8).
- Va en `src/ui/components/calculadora.ts`, con la lógica en `expresion.ts`.

## 6. Cuaderno y laboratorio

**Cuaderno (papel interactivo)**
- Una hoja pautada por ejercicio, con líneas tipadas: datos, fórmula, sustitución, operación y resultado.
- Cada línea guarda su árbol, no solo el texto, para poder diagnosticarla después.
- Se escribe a mano (teclado) o llega desde la calculadora o la escena («Llevar al cuaderno»).
- Se guarda en el almacenamiento existente de `src/app/`.

**Laboratorio:** la misma composición en las 19 fórmulas.
1. La escena existente, centrada, con el botón «Maximizar» (§6.1).
2. Datos del caso y selector de incógnita (qué despeje).
3. Calculadora y cuaderno juntos.
4. Comprobación y explicación.

Cada fórmula declara en `laboratorio.ts`:
- **variables:** símbolo, unidad y dominio válido;
- **despejes**, por incógnita: el árbol y sus pasos;
- **unidades:** qué conversiones admite, usando la matriz del §3;
- **operaciones:** qué teclas hacen falta;
- **restricciones:** Cₙ > C₀, n·d < 1, i > 0…;
- **caso ancla:** el del libro.

El primero es C₀ en simple (fórmula 3). Las demás se añaden de una en una y con la misma forma.

### 6.1 Maximizar el vídeo en las 19 fórmulas

Todas las fichas y laboratorios tienen un botón «Maximizar» sobre su escena. Hoy la expansión solo existe en el índice y en la portada.
- **Animación:** zoom de ventana al estilo macOS.
  - El vídeo crece desde su sitio hasta ocupar la pantalla, con las esquinas redondeadas que se abren.
  - Hay una inclinación 3D muy leve que se endereza al llegar.
  - El fondo se oscurece.
  - Al cerrar, hace el mismo recorrido al revés.
- **Reutiliza** el FLIP de `reproductorExpandido.ts`, sin motor nuevo. Solo se añade la fuente «escena ya montada en la página».
- **Continuidad:** sigue en el mismo segundo y capítulo, y con el mismo estado de pausa, al abrir y al cerrar.
- **Accesibilidad:** diálogo modal, Esc cierra y el foco vuelve al botón. Con movimiento reducido, un fundido corto.

## 7. «Explícame cómo lo he hecho» (`explicar.ts`)

**Con un ejercicio delante**
- Asocia cada número del árbol a un dato: 3000 → Cₙ, 3 → n, 0,07 → i.
- Reconoce la estructura frente a los despejes declarados.
- Lo cuenta paso a paso: «Has dividido Cₙ entre (1 + n · i): es la fórmula 3».
- Si coincide con un camino erróneo, nombra el tipo de error (§8).

**En uso libre (sin ejercicio)**
- Explica solo la matemática: «has sumado 1 a un producto y has dividido…».
- Dice que no sabe qué representa cada número.

**Incertidumbre**
- Si un número puede ser dos datos (por ejemplo, el mismo valor repetido), lo dice y no elige.

## 8. Ejercicios, práctica y EXAMEN

Es un solo motor y sustituye por dentro a B, C y D sin quitar ninguna función ni ruta (auditoría §4.1–4.3).

**Pasos:** enunciado → datos → fórmula → variables homogeneizadas → despeje → resultado → corrección → explicación → otro ejercicio equivalente.

**Diagnóstico de errores** (auditoría §4.2):
- identificación de datos;
- elección de fórmula;
- conversión de unidades;
- convenio 360/365;
- % → tanto por uno;
- despeje;
- aritmética;
- redondeo.

Si dos errores dan la misma cifra, el generador cambia de semilla.

**Generador**
- Usa familias válidas (S1–S6, C1–C8, D1–D6) y `aleatorio(semilla)`.
- Los casos del libro se quedan como anclas fijas.
- Lo generado lleva la marca «Ejercicio de práctica».
- Verificación en tres capas (auditoría §4.4).
- **Cobertura total** (objetivo del usuario: todos los ejercicios que se puedan preguntar del temario, en todas sus variantes). Las familias salen del producto:
  - fórmula × incógnita (cada despeje);
  - unidad del tipo × unidad del tiempo (año, semestre, cuatrimestre, trimestre, mes, día);
  - convenio 360/365;
  - régimen;
  - fechas (capitales que vencen en días distintos, días al vencimiento);
  - combinaciones (TIN → TAE → TIN de otra frecuencia, TAE real con comisiones, remesas).
- Una prueba recorre ese producto y falla si queda alguna combinación válida sin familia.

**EXAMEN**
- Botón visible en cada bloque.
- Configuración: herramientas (calculadora, cuaderno y fórmulas, cada una sí o no; también sin calculadora), número de ejercicios y familias.
- Durante el examen no hay pistas.
- Revisión al final, con el diagnóstico de cada fallo.

**Progreso**
- Se guarda por familia y por tipo de error en `EstadoPractica`, con una clave del Tema 2.
- Da más peso a los fallos recientes.

---

## 9. Escena de conversión de periodos y tipos de interés

Es la única animación nueva y tiene que ser una de las explicaciones visuales más memorables de la
aplicación, siempre al servicio de la comprensión matemática.

### 9.0 Principios narrativos (prioridad máxima)

**Orden del relato**
1. **Primero, la proporcionalidad en interés simple.** Cada trozo del año cosecha sobre el mismo C₀, así que repartir el tipo es exacto.
2. **Después, la equivalencia de tipos y la acumulación en compuesta.** Cada trozo cosecha sobre lo ya cosechado, así que repartir se queda corto y hace falta la equivalencia financiera.

**Columna vertebral: convertir la duración no es convertir el tipo**
- Convertir una duración cambia cómo se **mide** el tiempo: el dinero no se mueve.
- Convertir un tipo cambia **cuánto rinde cada trozo**: el dinero sí se mueve, y depende del régimen.
- Se cuenta con movimiento narrativo, con cálculos correctos y con ejemplos completos (dato, objetivo, operación, por qué vale, interpretación y comprobación).
- No es una tabla animada: la matriz del §3 solo aparece al final, como resumen de lo que ya se ha visto.

**Mismo estilo que las otras 19 explicaciones**

Lo nuevo tiene que parecer parte de la misma serie:
- ambiente `papel` y las piezas de `motivos.ts` (`Capsula`, `Etiqueta`, `Regla`, `Rotulo`);
- metáfora de la «cosecha» de intereses, como en simple-intereses y simple-fraccionado;
- colores fijos por variable: C₀ azul, Cₙ naranja, i verde, n rosa, I bermellón y m en su color de `Regla`;
- fórmulas que se construyen con los símbolos volando desde los objetos de la escena (`formula.construir` con `origenes`), nunca escritas de golpe;
- un subtítulo por capítulo, con las fórmulas en línea (`$i_m$`);
- duración por pieza parecida a la de las demás, entre 14 y 27 s.

Por eso cada acto es **una escena corta de unos 15–20 s**, no un vídeo de dos minutos. Los siete forman una serie que se reproduce seguida en el reproductor maximizado y que se puede enlazar acto por acto desde las fichas 6, 12 y 14.

### 9.1 Requisitos del usuario (literales en lo esencial)

**Lo que no debe ser**
- No una tabla estática animada, una colección de flechas ni reglas para memorizar.
- Tiene que ser una secuencia narrativa, en el lenguaje de los documentales explicativos tipo Vox que ya usan las 19 fórmulas, que cuente una historia matemática.

**Lo que tiene que hacer**
- Una línea temporal cinematográfica que se expande y se subdivide en años, semestres, cuatrimestres, trimestres, meses y días.
- Una transición visible entre escalas, que deje ver la relación entre el periodo de referencia y el buscado.
- Representar el dinero, los intereses y el crecimiento del capital, para que se vea la diferencia real entre simple y compuesta.
- Las fórmulas aparecen integradas justo cuando hacen falta: el movimiento revela el razonamiento, no decora una fórmula ya mostrada.
- Cada transformación enseña:
  - el dato inicial;
  - qué se quiere obtener;
  - qué operación se aplica;
  - por qué es válida;
  - cómo se interpreta el resultado.
- El alumno puede:
  - pausar, avanzar y retroceder;
  - inspeccionar los pasos;
  - relacionar la escena con la fórmula y con el cuaderno.

**Cobertura matemática obligatoria**
1. Conversión de duraciones entre las unidades del temario.
2. Conversión de tipos en simple (proporcionales).
3. Tipos efectivos equivalentes en compuesta, en los dos sentidos.
4. Diferencia entre nominal convertible y efectivo, sin una regla única.
5. Convenios 360/365 cuando corresponda.
6. Cuándo se convierte el tiempo, cuándo se mantiene la unidad y cuándo se transforma el tipo.
7. Ejemplos numéricos completos: sustitución, resultado y comprobación de coherencia.

**Distinción central:** convertir una duración no es convertir un tipo. En simple se aplica la proporcionalidad; en compuesta, la equivalencia financiera, y **nunca se divide siempre entre doce**.

**Condiciones técnicas**
- Reutilizar Vite, TypeScript, `Escena`, `Lienzo` y el reproductor.
- Las cifras salen del núcleo compartido (§3), no de la escena.
- No inventar convenciones: lo no respaldado se consulta (§14).
- Las referencias visuales son orientación estética, no una pieza que haya que copiar.

### 9.2 Evaluación técnica: sin Remotion

Remotion renderiza vídeo con React. Habría que añadir React y un segundo motor de animación (está prohibido crear motores paralelos), y sus vídeos no se pueden inspeccionar paso a paso ni conectar con el cuaderno. **No se usa.**

El aspecto se consigue con lo que ya hay, más tres piezas reutilizables en `src/ui/motion/`:
- **`calendario`:** la franja temporal que se reagrupa en m trozos y se anida (años → meses → días). Está diseñada en la auditoría §3.2 y la reutilizan simple-fraccionado, compuesta-equivalentes, compuesta-tae, simple-tiempo, compuesta-tiempo y el descuento compuesto racional.
- **`lupa`:** generaliza la de descuento-comercial para diferencias pequeñas (1,10 frente a 1,1047).
- **`pizarra`:** una columna algebraica en la que cada paso se queda atenuado, con la operación anotada al margen. La comparte con la escena del logaritmo (§10).

El lenguaje Vox se consigue con:
- papel con grano (ambiente `papel`);
- cámara que viaja y hace zoom entre escalas;
- tipografía cinética;
- subrayado de rotulador sobre la palabra clave;
- cortes por coincidencia (*match cut*): la franja del año se convierte en la barra del capital.

Todo es SVG con los tokens de `base.css`.

**Antes de programar:** un guion gráfico de 7 fotogramas clave en Figma (plan gratuito), uno por acto, que el usuario aprueba. Es la forma más barata de discutir la estética sin gastar sesiones de código.

### 9.3 Guion (7 actos = 7 escenas cortas en serie, unos 15–20 s cada una)

**I. «El año se puede cortar»** (duración)
- Imagen: la franja de un año se estira y se parte en 2, 3, 4, 12 y 360/365 trozos, y la cámara entra hasta los días.
- El bimestre y la quincena aparecen un instante, solo como mención.
- Unidades juntas: una deuda vence el 15 de marzo y otra el 30 de junio. Se cuentan los días entre fechas y se pasan a años con el convenio del enunciado.
- Pregunta: ¿cuántos años son 195 días? Respuesta: 195/365 con año civil y 195/360 con comercial.
- Vuelta: 2,78 años = 2 años, 9 meses y 11 días (CP13). Solo cambia cómo se mide el tiempo; el dinero no se mueve.

**II. «Tipo y tiempo tienen que hablar el mismo idioma»** (homogeneidad)
- Imagen: dos marcadores, la unidad del tipo y la de n. Si no coinciden, se ve en burdeos «i anual con n en meses ✗».
- Tres salidas: convertir el tiempo, convertir el tipo o, si ya coinciden, no tocar nada.

**III. Simple: cada trozo cosecha sobre el mismo C₀** (proporcionalidad, antes que la compuesta)
- CP14: 5.000 € al 3 % durante 195 días, año civil.
- i₃₆₅ = 0,03/365 → Cₙ = 5.000 · (1 + 0,03/365 · 195) = 5.080,14 €.
- Comprobación: con n = 195/365 años e i anual sale lo mismo. Por eso dividir es exacto en simple.

**IV. Compuesta: cada trozo cosecha sobre lo ya cosechado** (equivalencia y acumulación)
- Corte por coincidencia: la misma franja del acto III, pero ahora cada cosecha se suma al capital antes de la siguiente.
- El 10 %/12 reinvertido mes a mes da 1,1047, no 1,10 (lupa sobre un eje de 1,00 a 1,11).
- Por eso no se divide: 1 + i = (1 + iₘ)^m → i₁₂ = 1,10^{1/12} − 1 = 0,7974 % (CP19).
- Sentido inverso: un 1 % mensual compuesto es un 12,68 % anual, no un 12 %.

**V. Nominal frente a efectivo**
- El TIN (Jₘ) es una etiqueta anual que el banco **define** como iₘ · m.
- Aquí dividir sí es correcto, porque así está definido: iₘ = Jₘ/m.
- CP24: TIN 12 % mensual → iₘ = 1 % → TAE = 1,01¹² − 1 = 12,68 %.
- Contraste explícito con el acto IV: lo que se divide es un nominal, nunca un efectivo.
- Vuelta atrás (Actividades 37 y 38): de la TAE al TIN, con Jₘ = m · ((1 + TAE)^{1/m} − 1).
- Cambio de frecuencia de un nominal: pasando por la TAE.

**VI. ¿Qué régimen da más?**
- CP20: 5.000 € al 3 % durante 195 días. Simple: 5.080,14 €. Compuesta: 5.079,59 €.
- Con menos de un año gana la recta; en el año empatan; después gana la curva.

**VII. Cierre**
- La matriz del §3 se monta a partir de lo visto, como resumen, no como punto de partida.
- Botón «Llevar al cuaderno» con el último ejemplo.

**Reglas de la escena**
- Cada capítulo termina quieto al menos 0,5 s; con movimiento reducido, el último fotograma de cada acto es completo y legible.
- Rótulos de 22 u como mínimo, o variante móvil.
- Las cifras salen de `periodos.ts`, con una prueba que coteja las de la escena con las del dominio.
- Valores sin fuente (tabla de la Act. 20, equivalente diario 360 o 365): no entran hasta que el usuario los valide.
- Desde las fichas 6, 12 y 14 se enlaza al acto correspondiente (los capítulos ya admiten salto directo).

## 10. Arreglos de las escenas existentes

Se corrigen, no se rehacen (auditoría §3.0–3.1):
- **`i₁₂`:** `formula.ts` admite subíndices de dos cifras.
- **Capítulos que acaban a medias** (se ven así con movimiento reducido).
  - La prueba `tests/ui/escenasQuietas.dom.test.ts` (incremento 2a) compara lo que se lee en `fin − 0,5` y en `fin`, sin contar el ambiente vivo.
  - Midió 53 capítulos de las 19 escenas que aún se mueven al final: cámara, rotuladores, flechas y etiquetas que llegan tarde.
  - Resuelto en el 2b de forma general: cada capítulo tiene un instante de lectura (`lectura`) y el reproductor se detiene ahí 0,6 s. Las fórmulas que llegaban tarde terminan durante una retención (`retener` en `tiempo.ts`). La prueba ya no tiene excepciones.
  - **Reorientación del usuario (12/10):** la quietud total no es prioridad. Primero van los índices Simple/Compuesta y el laboratorio de la ficha.
- **Solapes:** compuesta-capital-inicial, compuesta-intereses, descuento-compuesto-comercial y simple-tiempo.
- **Móvil:** tamaño mínimo de rótulo.
- **compuesta-tiempo:** el logaritmo en 8 pasos con la `pizarra` (auditoría §3.3).
- **compuesta-montante:** barras por capas que separan el capital (azul), el interés ordinario (verde) y el interés de intereses (cobre), con lupa.

## 11. Resto del producto

**§5 · Dinero real primero**
- Primero una matriz de las 19 fórmulas: qué dice hoy cada texto y la propuesta «el caso en euros antes que el símbolo».
- Los textos se cambian después, con permiso, porque están en `src/content/`.

**Tema 1**
- **Preguntas generadas:** plantillas sobre los 45 conceptos y las 12 secciones, con distractores validados (sin repetir la respuesta y sin falsos correctos). Dan prioridad a los conceptos fallados.
- **Calcografía:** pulir primero el ICO, para que cada actor se reconozca por su tipo visual, y después las otras 11 de una en una.
- **Glosario:** llevarlo a las fichas de los edificios de la ciudad, a las escenas y al Tema 2.
- **Siglas comprensibles:** toda sigla que aparezca en la aplicación tiene que poder entenderse (botón del glosario). «OMEC» queda descartado: era un ejemplo de esta necesidad.

**Tema 2 y global**
- Sumario con la página actual marcada.
- Arreglos de teclado: `inert` en el rail y Escape en «Temario».
- Atlas con las 34 relaciones.
- Transición «planta» en SVG ligada al scroll, con alternativa estática.
- Identidad común sin plantilla uniforme. No se añaden tokens globales sin aprobación.

## 12. Previsualización por incremento

GitHub Pages solo publica un sitio por repositorio. Así se evita pisar producción:
- `pages.yml` construye **dos** versiones en el mismo despliegue:
  - `main` en la raíz (producción, igual que hoy);
  - la rama de trabajo en `/preview/` (`base: './'` ya permite servir desde una subcarpeta).
- Se dispara al hacer push a `main` y a `claude/quirky-lovelace-79c6fm`.
- La previsualización comparte el almacenamiento del navegador con producción (mismo dominio): el progreso guardado es el mismo en las dos.
- URL de la previsualización: `https://aguinaldo00.github.io/FINANCIALACADEMY/preview/`.

**Bloqueo previsible:** el entorno `github-pages` solo deja desplegar desde `main`.
- Hay que añadir la rama de trabajo en Settings → Environments → github-pages → Deployment branches.
- Es gratis y no cambia la visibilidad.
- Lo hace el usuario cuando se lo pida en el incremento 2. Hasta entonces, la comprobación es local.

## 13. Orden de incrementos y dependencias

| # | Incremento | Depende de | Permiso de contenido | Hecho cuando |
|---|---|---|---|---|
| 1 | Este plan y `CLAUDE.md` | — | No | Documento fusionado |
| 2a | Previsualización (§12) + `i₁₂` + prueba de capítulo quieto | 1 | No | URL `/preview/` funciona; prueba nueva en verde |
| 2b | Solapes, capítulos a medias y rótulos en móvil | 2a | No | Escenas afectadas grabadas en `fin − 0,6` y `fin` |
| 2c | compuesta-montante por capas | 2a | No | Se distingue el interés de intereses |
| 2d | «Maximizar» con zoom estilo macOS en las 19 fichas (§6.1) | 2a | No | Abre y cierra en el mismo segundo de la escena, con teclado y con movimiento reducido |
| 3a | `periodos.ts` (matriz) | 1 | No | Pruebas con CP13, 14, 19, 20 y 24 |
| 3b | `expresion.ts` (analizador) | 1 | No | `3000 ÷ (1 + 3 × 0,07)` = 2.479,34 y errores de sintaxis |
| 3c | `diagnosticar.ts` | 3a, 3b | No | Las mutaciones de la auditoría §4.2 se distinguen |
| 3d | `generador.ts` | 3c | **Sí** (contenido nuevo) | 1.000 semillas por familia verificadas |
| 4 | Laboratorio en C₀ simple: calculadora, cuaderno y «Explícame» | 3b | No | El flujo completo funciona en la fórmula 3 |
| 5 | Práctica y EXAMEN | 3c, 3d, 4 | **Sí** (familias) | Examen configurable con revisión y progreso guardado |
| 6a | Guion gráfico de la escena de conversión (Figma) | 3a | No | El usuario lo aprueba |
| 6b | Piezas `calendario`, `lupa` y `pizarra` + actos I–III | 6a | No | Capítulos quietos y cifras cotejadas |
| 6c | Actos IV–VII + enlaces desde las fichas 6, 12 y 14 | 6b | Solo los valores sin fuente | Escena completa con movimiento reducido |
| 6d | Logaritmo en 8 pasos (compuesta-tiempo) | 6b (`pizarra`) | No | Auditoría §3.3 |
| 7 | Matriz de textos de las 19 fórmulas y después los cambios | 4 | **Sí** | El usuario aprueba la matriz |
| 8 | Tema 1: ICO pulido → 11 infografías; glosario; preguntas generadas | — | **Sí** en partes | Una pieza por incremento |
| 9 | Atlas, transición «planta» y portada | 2 | No (Tema 2) | Con alternativa estática y sin destellos |

El laboratorio de las 18 fórmulas restantes se extiende de una en una después del incremento 4, sin un orden fijo.

## 14. Decisiones pendientes (no se deciden sin el usuario)

**Resueltas el 11/10**
- Bimestre y quincena: solo se mencionan.
- 360/365: lo decide el enunciado (civil o comercial), también para el diario en compuesta. El generador siempre lo indica.
- TAE → TIN: está en el temario (Actividades 37 y 38). El cambio de frecuencia de un nominal se hace como cadena.
- «OMEC»: descartado. La necesidad real es que todas las siglas se entiendan (glosario).

- Redondeo de iₘ: se guarda sin redondear y se muestra con 4 decimales en % (aceptado el 11/10).
- Caso del libro sin convenio indicado: se calcula con los dos (360 y 365), se aceptan las dos respuestas y se explica la diferencia (11/10).

**Abiertas:** ninguna por ahora.

## 15. Herramientas

- **Figma (plan gratuito):** recomendado para guiones gráficos y piezas vectoriales, porque exporta SVG limpio y se puede leer desde aquí.
- **Canva:** sirve para material suelto, pero no para piezas que acaban en SVG animado.
- **Planes de pago:** ahora no hace falta ninguno.
