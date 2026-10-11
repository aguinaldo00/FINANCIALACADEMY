# Informe final · Auditoría del Tema 2 (Fase 1) y propuesta (Fase 2)

> Copia del informe de la auditoría (11/10). Los informes intermedios de los agentes (`a1-…`, `a2-…`, `a3-…`, `r1-…`) eran
> archivos de trabajo y no están en el repositorio; las conclusiones están aquí.

Base: commit `8d98f49` en `claude/quirky-lovelace-79c6fm`, con cambios locales sin commit (4 escenas del Tema 1, ajuste de `simpleTipo.ts`,
`lienzo.ts`, `reproductor.ts`, `main.ts` y scripts). Entradas: `a1-arquitectura.md`, `a2-matematicas.md`, `a3-visual.md`,
`r1-inventario-material.json` (137 elementos) y las salidas parciales. El Agente 4 ha releído en el código las citas en las que se apoyan
las decisiones (`app.ts:99-105`, `formulas.ts:56`, `ejercicios.ts:441-461`, `descuento.ts:212`, `asignaturaView.ts:161,231`,
`fases.ts:228-236,276`, `ficha.ts:36`, `$i_{12}$` en `compuestaTasas.ts:20` y `simpleFraccionado.ts:31`) y ha contado las relaciones de
`formulas.ts`: hay **34 en las 19 fórmulas**. A3 dice 20 fórmulas, un desliz sin consecuencias. No se ha modificado nada del repositorio.

**Leyenda.**
- Gravedad: **A** alta · **M** media · **B** baja.
- Esfuerzo: **S** < ½ día · **M** 1–2 días · **L** > 2 días.
- **Tipo** (las cuatro categorías del usuario): **Dis** diseño · **Ped** comprensión pedagógica · **Exa** exactitud académica · **Téc** técnico.
- Estados: **verificado** (lo comprobó un agente y está bien, o solo tiene detalles B) · **parcial** (existe, pero con fallos A/M o cubre solo una parte) ·
  **falta** · **no confirmable** (el material del repositorio no permite saberlo).

## 0. Resumen en lenguaje sencillo
- **Bien:** las 19 fórmulas, sus despejes y las 21 soluciones son correctos (321 comprobaciones por dos caminos). Cada fórmula tiene ficha y
  animación. El índice del Tema 2 es la mejor pantalla del proyecto y la referencia visual.
- **Matemáticas, solo 2 errores pequeños:** un paso del caso 28 da 11.763,66 €, no 11.763,68 €, y la app rechaza el resultado de su propio paso;
  y una frase de resumen del descuento compuesto solo vale para el racional.
- **Temario:** faltan los apartados 1 y 2 (preferencia por la liquidez, operación financiera), no hay ejercicios combinados, los cambios de
  periodicidad se explican pero no se practican y las fórmulas 8 y 13 no tienen ejercicio.
- **Práctica:** solo corrige el resultado final; no dice si el fallo es de fórmula, de conversión, de despeje o de redondeo, no crea ejercicios
  nuevos y no guarda el progreso.
- **Animaciones:** 5 fallos graves a la vista (i₁₂ invisible; 3 escenas a medias con movimiento reducido; rótulos que se tapan en
  compuesta-montante y compuesta-capital-inicial). El ajuste de simple-tipo, hecho y sin commit, funciona.
- **Navegación:** fichas y fases muestran el índice antiguo en vez del Sumario; «Abrir el índice de fórmulas» está a 3 pantallas; con teclado
  hay 36 paradas invisibles antes del contenido.
- **Propuesta:** un primer incremento de navegación y arreglos de escenas; ejercicios que diagnostiquen el tipo de error y generen otros
  equivalentes; escenas de calendario y de logaritmos; papel para leer y noche o color para las escenas; Atlas interactivo y separador «planta».
- **Necesita tu permiso:** tocar `src/content/` (2 errores y el caso 29), añadir contenido (apartados 1–2, combinados, ejercicios generados),
  los colores nuevos y elegir una de las tres direcciones artísticas del Tema 1.

## 1. Matriz de cobertura del Tema 2
Quién verifica cada columna: **Fórmula**, A2 · **Ejercicios del material**, r1 · **Animación**, A3 (23 escenas renderizadas) ·
**Práctica digital**, A1 (fases B identificar, C elegir y D resolver) · **Papel**, sustitución y pasos de D (revisados por A1; cifras de A2).

| # | Apartado / elemento | Fórmula | Ejercicios del material | Animación | Práctica digital | Papel |
|---|---|---|---|---|---|---|
| 1 | Apdo. 1 · Concepto, preferencia por la liquidez, factores C–t–i | — | CP1 y Act. 1–2 (cualitativos) | falta | falta | falta (tampoco hay explicación: solo una frase en `formulas.ts`) |
| 2 | Apdo. 2 · Operación financiera: elementos, requisitos, clasificación | — | CP2, CP3, Act. 8; CP4–7 no confirmables | falta | falta | falta |
| 3 | Homogeneidad n–i (regla de la unidad) | verificado | transversal | parcial (sin «regla de la unidad» visible) | parcial: B da el valor ya convertido y D no detecta n sin convertir | verificado (45/360, 195/365, 565/365) |
| 4 | F1 · I = C₀·n·i | verificado | CP9, s-10000, s-3000 | verificado (escena de referencia) | verificado (3) | verificado |
| 5 | F2 · Cₙ = C₀(1+n·i) | verificado | Juana, CP14 | parcial (fin cap. 2 a medias, A) | verificado (1) | verificado |
| 6 | F3 · C₀ simple | verificado | s-5400 | parcial (C₀ fuera de cuadro, A) | verificado (1) | verificado |
| 7 | F4 · i simple (y su variante i = I/(C₀·n)) | verificado | propuesta (a), s-8000 | verificado **con el ajuste sin commit** | verificado (1) | verificado |
| 8 | Despejes desde I: n = I/(C₀·i), C₀ = I/(n·i) | verificado (álgebra) | solo implícitos en la propuesta (a) | falta | falta | falta |
| 9 | F5 · n simple → años, meses y días | verificado (convenio: 2 decimales) | CP13, Act. 18 | parcial (modelo de calendario; cortes M) | parcial: solo años decimales, el desglose no se comprueba | verificado |
| 10 | F6 · iₘ = i/m; I = C₀·iₘ·n·m; i₃₆₀ e i₃₆₅ | verificado | CP14, s-semestral, propuesta (b) diario | parcial (hueco i₁₂, A) | parcial: ningún ejercicio pide iₘ | parcial |
| 11 | Año civil (365) frente a comercial (360) | verificado (CP14 y CP28 solo cuadran con 365) | Act. 19 (no confirmable qué año usa) | parcial (no hay calendario 360/365) | parcial: el enunciado siempre lo dice y no se detecta 360↔365 | verificado |
| 12 | **Conversiones de periodicidad** m ∈ {2, 3, 4, 12, 360, 365}; días, meses y trimestres → años | verificado | anual ✓ · semestral (s-semestral) · cuatrimestral ✗ · trimestral (c-tae) · mensual (s-3000, s-8000, c-mensual) · diario (s-195 y d-cp28 con 365; d-pagare, d-racional y d-remesa con 360) · bimestral y quincenal: no confirmables | parcial | **falta como práctica**: se muestran hechas, nunca se piden | parcial |
| 13 | F7 · Cₙ = C₀(1+i)ⁿ | verificado | CP15 | parcial (comparación final ilegible, A) | verificado (1) + ejemplo año a año | verificado |
| 14 | F8 · I = C₀[(1+i)ⁿ − 1] | verificado | CP15–24 | parcial (rótulos tapados, M) | **falta** (0 ejercicios) | falta |
| 15 | F9 · C₀ = Cₙ(1+i)⁻ⁿ | verificado | c-9000 (no confirmable que sea «del libro») | parcial (A: «8.411,21 €» tapa Cₙ) | verificado (1) | verificado |
| 16 | **Logaritmos** · F10 · n = log(Cₙ/C₀)/log(1+i) | verificado (la base da igual) | CP17; Act. 27–28 sin datos; propuesta «duplicar» (14,21 años) | parcial (M: el log no se ve, faltan pasos, «logl,l») | parcial: 1 de 2 familias; desglose sin comprobar | verificado (D4: redondeo de presentación) |
| 17 | F11 · i = (Cₙ/C₀)^(1/n) − 1 | verificado | c-50000 (procedencia no confirmable); Act. 27–28 | parcial (falta «elevar a 1/n», M) | verificado (1) | verificado |
| 18 | **Tantos equivalentes** · F12 · 1+i = (1+iₘ)^m, en los dos sentidos | verificado | CP19; Act. 20 (sin resultados en la fuente); propuesta 1 % mensual → 12,68 % | parcial (hueco i₁₂, A; 1,1047 frente a 1,10 no se distingue, M) | parcial: solo mensual, solo i→iₘ, el distractor i/m no se diagnostica | verificado (c-mensual) |
| 19 | F13 · simple frente a compuesta según el plazo | verificado (30.000 pares) | CP20, propuesta n = 0,5 | parcial (M) | **falta** (CP20 solo en la ficha) | falta |
| 20 | F14 · TIN → TAE | verificado | Act. 37–38, propuesta (c-tae); CP22 no confirmable | parcial (no se ve por qué TAE > TIN, M) | parcial (solo c-tae) | verificado |
| 21 | TAE → TIN (inversa) | verificado (álgebra) | Act. 37–38 | falta | falta | falta |
| 22 | TAE real con comisión | verificado (CP24: 10,99 %) | CP24 | parcial (la comisión casi no se ve, M) | falta | falta (solo en la ficha 14) |
| 23 | F15 · descuento comercial simple: Dc y E | verificado | pagaré (propuesta) | verificado (lupa ×20) | parcial: pide Dc, nunca E | verificado |
| 24 | F16 · descuento racional simple | verificado | d-racional | parcial (el capítulo acaba sin fórmula, A) | parcial: pide Dr, nunca C₀ | verificado |
| 25 | Racional frente a comercial (Dc > Dr) | verificado (Dc/Dr = 1+n·i) | CP25 (datos de partida no confirmables) | verificado (final «base N / base C₀») | falta | falta |
| 26 | F17 · líquido de una remesa, comisión con mínimo | verificado | propuesta 5.899,50 €; Act. 46, CT 13–14 y CP27 no confirmables | verificado (cascada) | parcial: un solo efecto, fuera de B, ficha mal rotulada (§2) | verificado |
| 27 | F18 · descuento compuesto racional | verificado | CP28 | parcial (recta en vez de curva, M-B) | verificado (d-cp28) | **error E1** |
| 28 | F19 · descuento compuesto comercial | verificado (E2 está en el resumen del bloque) | CP29; propuesta 15.000 € al 4 % | parcial (×0,95 amontonados, M) | parcial: pide E y el libro pide Dc | verificado |
| 29 | **Combinados**: CP14+20, CP24, CP25, CP27, reto profesional | verificado (CP20, CP24) | 5 | parcial (escenas de comparación y de TAE) | **falta** (el «Repaso mezclado» solo elige fórmula) | falta |
| 30 | **Casos especiales**: n ≤ 1 = corto plazo; con n = 1, simple = compuesta; n fraccionario o < 1 en compuesta; comisión max(%, mín); TAE = TIN solo si m = 1 | verificado (salvo «n ≤ 1 = corto plazo», que solo consta en r1) | CP20, CP28, propuesta remesa | parcial | parcial: solo n fraccionario (d-cp28) y comisión con mínimo (d-remesa) | parcial |
| 31 | Errores frecuentes del material (10 en r1) | — | — | parcial (pocas escenas los tachan) | parcial: fichas + 7 errores típicos; D distingue solo 3 | — |
| 32 | Fuera del material: despejes de descuento, compuesta desde I, i ⇄ d, forfait, timbre, m = 6 o 24, TAE con comisión a varios años | **no confirmable** | — | — | no generar | — |

**Lectura rápida (filas 1–31).**
| Columna | Verificado | Parcial | Falta |
|---|---|---|---|
| Animación | 5 | 22 | 4 |
| Práctica digital | 8 | 13 | 10 |

Las fórmulas están verificadas en todas las filas que tienen fórmula. El hueco grande no son las fórmulas sino **practicar las conversiones, los combinados y los apartados 1–2**.

## 2. Errores confirmados

### 2.1 Dentro de `src/content/`: requieren permiso explícito del usuario
| # | Archivo:línea | Qué falla | Grav. | Tipo | Corrección propuesta | Fuente |
|---|---|---|---|---|---|---|
| C1 | `ejercicios.ts:441` (pasos de d-cp28) | «1,04^{−1,548} = 11.763,68 €»: con 1,548 sale 11.763,66 € y Dr = 736,34 €, que `comprobar()` rechaza (tolerancia 0,011) | M | Exa | Escribir el exponente como −565/365, o añadir «con n sin redondear». No ampliar la tolerancia | A2 (3 caminos) |
| C2 | `formulas.ts:56` (`BLOQUES.descuento.memoriza`) | «Compuesto: la capitalización compuesta al revés» solo vale para el racional y contradice la ficha 19 (`formulas.ts:466`) | B | Exa | «Compuesto: exponente n; racional (1 + i)⁻ⁿ, comercial (1 − d)ⁿ.» | A2 |
| C3 | `ejercicios.ts:444-461` (d-cp29) | Rotulado «Caso práctico 29 del libro», pero pide E = 1.470,18 €, cuando el material pide Dc = 529,82 € (r1, L62/L232). Las dos cifras son correctas | M | Exa | Pedir Dc (E queda como paso) o rotularlo «basado en el CP 29». Recomiendo lo primero | A1. A2 no lo cuenta como error porque las cifras están bien. **Criterio de A4: es fidelidad al material, no un fallo de cálculo** |
| C4 | `ejercicios.ts:9-10` | El comentario cita `tests/content/ejerciciosTema2.test.ts`, que no existe | B | Téc | Crear esa prueba (está fuera de `src/content/`) y dejar el comentario tal cual | A1 |
| C5 | `practica.ts:28-37` y `:191` | Catálogo de fórmulas duplicado de `FORMULAS_TEMA2`. Hay 4 `EJERCICIOS_PAPEL` que ninguna pantalla muestra | B | Téc/Ped | **No borrarlos** (regla «no quitar funciones»): reutilizarlos en el sistema nuevo | A1 |
| C6 | `src/content/temas/tema-02/index.ts:23` (A1 citaba `index.ts:22`; A4 lo ha localizado) | Las fases cambian de nombre según la pantalla: «Las fórmulas» o «Comprender»; «En papel», «Practicar en papel» o «Resolver en papel» | B | Ped | Un nombre por fase, el mismo en la barra y en los títulos | A1 |

**No confirmables.** No son errores; se trata de decidir si se suavizan:
«el libro imprime 1.450 €» (`formulas.ts:122`, `ejercicios.ts:71,85`); «el libro dice raíces cuadradas» (`formulas.ts:318`, `practica.ts:77`);
«caso del libro» (`formulas.ts:145,289,319`).

Los apuntes originales no están en el repositorio. Propuesta: conservar la cifra correcta y escribir «según el análisis del tema», salvo que el usuario lo confirme con el libro.

### 2.2 Fuera de `src/content/`: no requieren permiso
| # | Archivo:línea | Qué falla | Grav. | Tipo | Corrección |
|---|---|---|---|---|---|
| N1 | `src/ui/escenas/descuento.ts:212` | La misma cifra que C1, en la descripción de la escena | M | Exa | Cambiarla a la vez que C1 para que coincidan |
| N2 | `src/ui/views/tema2/ficha.ts:36` | El texto de reserva «Compara · Simple y compuesta según el plazo» aparece también en la ficha 17 (remesa) | M | Exa | Texto por fórmula; en la 17, «Calcula · Líquido» (sale de su expresión) |
| N3 | `fases.ts:276` + s-6000 / s-act18 | El enunciado pide «años, meses y días», pero el campo solo admite años decimales; el desglose no se corrige | M | Ped | Segundo campo para el desglose, comprobado con `desglosarAnos` |
| N4 | `fases.ts:241-253` | D distingue 3 errores (formato, % sin símbolo, ×100); para todo lo demás, «Repasa los datos y la unidad» | A | Ped | `diagnosticar()` por mutaciones (§4) |
| N5 | `fases.ts:233` (`leerNumero`) | «1.617» se lee como 1617 y «0.007» como 7 | B | Téc | Si el valor esperado es < 100 y hay un solo punto, preguntar «¿querías decir 1,617?» |
| N6 | `fases.ts:243-246` | La tolerancia de los años es asimétrica: con 2,78, «2,77» se acepta y «2,79» no | B | Téc | Comparar en centésimas enteras |
| N7 | (no existe) | Ninguna prueba coteja las 21 respuestas con el dominio ni cubre `comprobar`, `leerNumero` o `razonNo` | M | Téc | `tests/content/ejerciciosTema2.test.ts` |
| N8 | `src/domain/calculoFinanciero.ts` | Bordes sin protección: efectivo negativo si n·d ≥ 1, acepta n < 0, da n o i negativos si Cₙ < C₀ | B | Téc | Guardas en el generador y `RangeError` como en `desglosarAnos` |
| N9 | `src/ui/escenas/tema1/sistema.ts` (sin commit) | «Son las empresas y el sector público» fija el estereotipo que docs/fuentes §1 marca como error típico (CP1: INST, SA con superávit) | M | Exa | Añadir «normalmente», como en `conceptos.ts`. Es redacción académica: enseñárselo al usuario |
| N10 | `index.html:18`, `app.ts:71-80` | El `.rail` oculto deja 36 paradas de Tab invisibles antes del contenido | A | Téc | `inert` mientras esté cerrado |
| N11 | `app.ts:99-105`, `topicsView.ts:94-102` | Fichas y fases sin Sumario ni navegación editorial («el sumario está mal») | A | Dis | §6.1 |
| N12 | `interactions.ts:150-163`, `academia.css:35`, `responsive.css:4` | La capa «Temario» no se cierra con Escape, no mueve el foco, no tiene `aria-expanded` y deja activo el fondo | M | Téc | Escape, foco, `aria-expanded` e `inert` (como el Sumario) |
| N13 | `asignaturaView.ts:161,198-200` | «Abrir el índice de fórmulas» queda a 3,1 pantallas (3,5 en móvil); si hay último sitio, la cabecera no enlaza al capítulo II | A | Dis | §6.2 |
| N14 | `fases.ts:195-198` | En C, tras responder, el foco cae al `<body>` | M | Téc | Llevarlo a `.t2-explica` con `tabindex=-1` |
| N15 | `editorial.css:382-386` | A 390 px, las partes I–III quedan fuera de la barra del capítulo y no hay ninguna indicación | M | Dis | Ajustar al ancho o señalar el desplazamiento |
| N16 | `tema2.css:164` | La fórmula de la ficha 17 se corta en móvil | M | Dis | Partirla en dos líneas |
| N17 | `editorial.ts:29-30` | La barra del Tema 2 lleva a «Cuaderno» y «Mi progreso», que solo tienen el Tema 1 | M | Ped/Téc | Persistencia del Tema 2 (§4.6) |
| N18 | `editorial.ts:85-93` | El Sumario no marca la página actual ni se abre en el capítulo en curso | M | Dis | `aria-current` y desplazamiento hasta ella |
| N19 | `asignaturaView.ts:231-233` | «Todo está conectado… los dos capítulos», pero el Atlas no tiene el Tema 2 ni relaciones | M | Exa | Texto honesto ya; relaciones en §5 |
| N20 | `asignaturaView.ts:201` | `--c` (color de la asignatura) pisa la `--c` de la paleta (`base.css:20`) | B | Téc | `--amb-acento` |
| N21 | `topicsView.ts:138` | `summary > a`: un elemento interactivo dentro de otro | B | Téc | Sacar el enlace del `summary` |
| N23 | `.mat-etapas` (compuesta/práctica) | Desplazamiento horizontal sin indicación (985 px de contenido en 278 px) | B | Dis | Sombra o flecha que lo indique |

Los fallos de las escenas están en §3.

## 3. Animaciones

### 3.0 Las dos escenas que señaló el usuario
| Escena | Estado | Qué hacer |
|---|---|---|
| **simple-tipo** | En la versión subida, C₀ y su rótulo se salían del encuadre (z 1,35 centrado en x = 470). **El ajuste local sin commit lo corrige**: C₀ y Cₙ se ven a los 4,1, 6,15, 9,35 y 12,95 s. Detalles pendientes: la tarjeta de la fórmula toca el borde superior entre los 15 y los 19 s (B, Dis), y al final el «AÑO 1» queda vacío (B, Dis) | Grabar fotograma a fotograma y hacer commit del ajuste. Llevar la cosecha del año 1 a su casilla |
| **compuesta-montante** | En la comparación final (14,6–18,5 s), «simple: 12.100 €» tapa «11.449,00 €» y la flecha (A, Dis). Los contornos de simple casi coinciden con las barras (150 € ≈ 3 px): **no se ve el interés sobre interés**, que es lo que la escena quiere enseñar (A, Ped). La línea C₃ desarrollada queda medio tapada (M). A los 12,4 s una «i» cae bajo la línea (B) y a los 6,5 s «AÑOS» sale cortado (B) | Inmediato (S): sacar el rótulo de la barra y engrosar el contorno. Fase 3 (M): barras por capas, con C₀ en azul, interés simple en verde e **interés de intereses en cobre**, más la lupa ×10 (reutilizar la de descuento-comercial) |

### 3.1 Problemas por escena (las demás)
| Escena | Segundo | Problema | Grav. | Tipo | Arreglo |
|---|---|---|---|---|---|
| simple-fraccionado, compuesta-equivalentes | 7,2–10,6 · 9–12,4 | `$i_{12}$` no se pinta: el analizador no admite subíndices de dos cifras y lo deja en `.fx-txt`, invisible sobre papel | A | Téc | Admitir `_{12}` en `src/ui/matematica/formula.ts` (S) |
| simple-montante | 6,75 (fin cap. 2) | «Cₙ = C₀ + I» a medio montar, que es justo lo que se ve con movimiento reducido | A | Téc/Ped | Capítulo quieto ≥ 0,5 s antes del siguiente |
| descuento-racional | 9,8–10,2 | La fórmula de «Sustituyendo» desaparece antes de que acabe el capítulo | A | Téc/Ped | Igual; la sustitución se queda como columna fija |
| simple-capital-inicial | 5,55 | El subtítulo nombra C₀ y su caja está fuera del encuadre; entre 10 y 17,5 s, rótulos de unos 10 px | A / M | Dis | La cámara incluye siempre el año 0 |
| compuesta-capital-inicial | 2,8–9,6 | «8.411,21 €» y «÷1,07» tapan «Cₙ = 9.000 €» | A | Dis | Factor encima del arco e importe encima de la barra |
| Todas, en móvil | — | El lienzo de 720 se dibuja a unos 358 px, así que un rótulo de 10–13 u queda en 5–6 px | M-A | Dis | Mínimo de 22 u o variante móvil a 480 u (M) |
| compuesta-tiempo | 3–18 | Una recta sobre ejes lineales pasa a llamarse «escala logarítmica» sin cambiar (Exa). La fracción pisa la línea. Se lee «logl,l» (Dis). Desaparecen log 1,1667 y log 1,1, y 0,62 años solo sale en el texto (Ped) | M | Exa/Ped | Reescritura de §3.3 |
| compuesta-tipo | 8 | Falta el paso «elevar a 1/n» (Ped); hay escalones «logarítmicos» junto a una barra lineal (Exa) | M | Ped/Exa | Columna algebraica; tachar el error de la raíz cuadrada, que ya está en `formulas.ts` |
| compuesta-equivalentes | 3,7 · 12,4–17 | El arco sale del cuadro. 1,1047 y 1,10 no se distinguen y el eje vertical no tiene escala | M | Ped | Calendario de §3.2 y eje 1,00–1,11 con lupa |
| compuesta-tae | 5,8–17 | No enseña por qué TAE > TIN; barras sin eje; la comisión apenas se ve | M | Ped | Dos escenarios lado a lado y franja de 68,25 € |
| compuesta-comparacion | 6,4–9,4 | El zoom no separa las líneas y el plazo de 195 días no aparece marcado | M | Ped | Marcar el plazo de 195 días y lupa sobre [0, 1] |
| compuesta-intereses | 3–16 | «C₀ = 4.500 €» queda tapado por «×1,03»; rótulos diminutos | M | Dis | Tamaño mínimo de rótulo |
| descuento-compuesto-comercial | 6,6–14 | Los ×0,95 se amontonan sobre N; Dc queda pegado a la fórmula; los contornos de simple apenas se ven | M | Dis | Franja de diferencia con simple |
| descuento-compuesto-racional | — | Une C₀ y Cₙ con una recta, cuando la actualización es curva (Exa); «n = 565/365» se desvanece (B) | M-B | Exa | Curva y calendario de 565 días |
| simple-tiempo | 12,7–14,6 | La pila verde se corta por arriba. Los 11 días siguen el convenio del material: no tocar | M | Dis | Encuadre |
| sf-sistema (T1) | 7–15 | Rótulos de los puentes a unos 9 px; edificio cortado; matiz «normalmente» (N9) | M | Dis/Exa | — |
| sf-funciones (T1) | 4,35 | «Viabilidad» casi invisible al cerrar el capítulo; iconos ambiguos (Pagos, Estabilidad) | M | Dis/Ped | — |
| sf-caminos (T1) | 11–18,2 | EMPRESA y AHORRADOR cortados | M | Dis | — |
| sf-supervision (T1) | — | Los haces se cruzan (no queda claro qué supervisor ilumina cada producto); alcances a unos 8 px | M | Ped | Poner depósito, fondo y seguro bajo su supervisor |

**Reglas transversales** (S salvo indicación):
(1) Cada capítulo termina quieto al menos 0,5 s antes del siguiente; prueba automática: pintar `fin − 0,6` y `fin` y exigir que cambie menos
del 0,5 % de los píxeles. (2) Rótulos de 22 u como mínimo. (3) Espacio duro antes de «%» y del punto final. (4) Que el «1» de Big Shoulders
no se confunda con la «l»: mono tabular en los logaritmos. (5) Comprobar en `Lienzo` que las cajas no chocan (M). (6) Lupa reutilizable para diferencias pequeñas (M).

**Escenas que se conservan como modelo:** simple-intereses, la lupa ×20, la cascada de la remesa y las reglas anidadas de simple-tiempo.

### 3.2 Prioridad 3.1 · Calendario de periodicidad y tantos equivalentes (A3 §1c-A)
Se crea un componente `calendario` en el `Lienzo` (SVG) que sirve para simple-fraccionado, compuesta-equivalentes y compuesta-tae.
Después se reutiliza en simple-tiempo, en compuesta-tiempo (0,62 años) y en el descuento compuesto racional (565 días).
| Paso | Qué se ve | Qué enseña |
|---|---|---|
| 1 | Franja anual con los meses E F M A M J J A S O N D; debajo, 360 días (comercial) y 365 (civil) | Las unidades del año; la confusión 360/365 es un error típico del material |
| 2 | El mismo año se reagrupa en 2 semestres, 3 cuatrimestres, 4 trimestres y 12 meses: «1 periodo = 1/m de año» | Qué es m |
| 3 | Dos marcadores, la unidad del tipo y la de n, que tienen que coincidir; «i anual con n en meses ✗» en burdeos | Homogeneidad n–i |
| 4 | Simple: cada trozo cosecha sobre el mismo C₀; 12 · 58,33 € = 700 € | Por qué iₘ = i/m es exacto en simple |
| 5 | Compuesta: un 10 %/12 reinvertido mes a mes da 1,1047 > 1,10, visible con la lupa sobre un eje de 1,00 a 1,11 | Por qué en compuesta no se divide: (1+i)^{1/12} − 1 = 0,7974 % |
| 6 | Tabla m = 2/4/12: i/m frente al equivalente | Actividad 20 (**los valores son cálculo propio: el usuario debe validarlos antes de añadirlos**) |
| 7 | TAE: con un TIN del 12 %, las 12 casillas se encienden y la franja cobre muestra 68,25 € de intereses de intereses → 12,68 %; luego la comisión aparece como franja que se resta | TIN frente a TAE y TAE real (CP24) |

### 3.3 Prioridad 3.2 · Logaritmo paso a paso (compuesta-tiempo, CP17): 8 pasos y errores frecuentes
**Composición:**
- a la izquierda, una pizarra donde cada paso **se queda** atenuado, con la operación anotada al margen;
- a la derecha, el gráfico: una curva en escala lineal que se endereza al pasar a escala logarítmica, con escalones iguales de log 1,1, de los que caben 1,62.

**Movimiento reducido:** un capítulo por paso, quieto al final; el último fotograma es la pizarra completa.

| Paso | Pizarra | Margen | Gráfico |
|---|---|---|---|
| 1 | 35.000 = 30.000 · 1,1ⁿ | datos en la fórmula 7 | curva y punto de llegada |
| 2 | 35.000 / 30.000 = 1,1ⁿ → 1,1667 = 1,1ⁿ | ÷ C₀ en los dos lados (1,1667 = 7/6) | se normaliza a 1 |
| 3 | 1,1¹ = 1,1 < 1,1667 < 1,21 = 1,1² | n está en el exponente: entre 1 y 2 años | escalones ×1,1 |
| 4 | log 1,1667 = log(1,1ⁿ) | log en los dos lados | el eje pasa a logarítmico y la curva se endereza |
| 5 | log 1,1667 = n · log 1,1 | **el exponente baja multiplicando** (resaltado) | escalones iguales de log 1,1 |
| 6 | n = 0,0669 / 0,0414 = 1,62 | ÷ log 1,1; con ln sale lo mismo (r1: la base da igual) | caben 1,62 escalones |
| 7 | 30.000 · 1,1^1,6174 ≈ 35.000 | comprobar con n sin redondear | ida y vuelta |
| 8 | 0,62 · 12 = 7,44 → 7 meses; 0,44 · 30 = 13,2 → 13 días | convenio del material: n con 2 decimales | calendario anidado |

**Errores frecuentes** (aparecen en burdeos y se tachan). Solo los que ya están en el contenido:
- (a) Usar el tiempo simple n = (Cₙ−C₀)/(i·C₀) en compuesta (`formulas.ts`): da 1,67 en lugar de 1,62.
- (b) «1,62 años = 1 año y 62 meses» (`practica.ts`).
- (c) La dificultad algebraica del despeje (r1, L143; es una hipótesis pedagógica).

Otros, como «log Cₙ / log C₀» u olvidar el «1 +», son contenido nuevo: piden permiso.

## 4. Sistema de ejercicios digitales

### 4.1 Flujo de un ejercicio (un solo motor; sustituye a `montarIdentificar`, `montarElegir` y `montarPractica`)
| Paso | El alumno | Se comprueba | Error que se distingue | Reutiliza |
|---|---|---|---|---|
| 1 Enunciado | lee | — | — | `enunciadoHtml()` (`fases.ts:39-57`) |
| 2 Datos e incógnita | marca cada fragmento y su símbolo | símbolo de cada dato y de la incógnita | **identificación** | `fragmentos()`, fase B |
| 3 Fórmula | elige entre 4 opciones | id de la fórmula | **fórmula** (simple↔compuesta, Dc↔Dr, sin despejar) | `razonNo()`, fase C |
| 4 Variables | escribe cada variable homogeneizada (n = 45/360; i = 0,05) | valor y unidad de cada una | **conversión de unidades** (meses/12, 360↔365, % → tanto por uno, i/m frente al equivalente) | hay que añadir `numero`, `unidad` y `periodo` a cada dato (hoy `valor` es texto) |
| 5 Despeje (si hace falta) | escribe el intermedio (Cₙ/C₀ = 1,1667) o elige la forma despejada | expresión intermedia | **despeje** ((1+i)ⁿ↔(1+i)⁻ⁿ, raíz cuadrada en vez de n-ésima, log) | solucionador `calculoFinanciero.ts:49-158` |
| 6 Resultado | número | tolerancia según el tipo | **aritmética**, **redondeo** intermedio, formato | `leerNumero()` y `comprobar()` |
| 7 Corrección | — | — | mensaje del tipo de error y del paso que hay que revisar | `PISTA_PAPEL`, errores de las fichas, `ERRORES_TIPICOS` |
| 8 Explicación | — | — | sustitución, pasos y enlace al capítulo de la escena | `sustitucion`, `pasos` |
| 9 Nuevo equivalente | — | — | la misma familia y la misma incógnita con otra semilla | `aleatorio(semilla)` (`src/domain/exam.ts:71`) |

### 4.2 Diagnóstico por mutaciones (`src/domain/tema2/diagnosticar.ts`)
El solucionador calcula la respuesta correcta y la de cada camino erróneo. Si la respuesta del alumno coincide con un único camino, ese es el tipo de error.
Ejemplos con datos que ya existen (A4 los ha calculado):
| Tipo | Mutación | Ejemplo |
|---|---|---|
| conversión de unidades | n sin pasar a años | s-8000: 0,5 % en lugar de 6 % |
| convenio | 360 ↔ 365 | s-195: 5.081,25 € en lugar de 5.080,14 € |
| tanto por uno | ×100 | ya existe |
| fórmula (régimen) | simple ↔ compuesta | c-4500: 5.445 € en lugar de 5.534,43 € |
| fórmula (proporcional en compuesta) | i/m en lugar del equivalente | c-mensual: 0,8333 % en lugar de 0,7974 % |
| despeje | (1+i)ⁿ en lugar de (1+i)⁻ⁿ | c-9000: 15.463,68 € en lugar de 5.238,08 € |
| despeje | raíz cuadrada en lugar de n-ésima | c-50000: 1,98 % en lugar de 0,6558 % |
| fórmula (descuento) | (1+d)⁻ⁿ en lugar de (1−d)ⁿ | CP29: 1.492,43 € en lugar de 1.470,18 € |
| fórmula (tiempo) | tiempo simple en compuesta | CP17: 1,67 en lugar de 1,62 |
| redondeo | n redondeado antes de la potencia | CP28: 736,34 € en lugar de 736,32 € |
| desglose | decimal leído como meses | «1 año y 62 meses» |
| aritmética | ninguna mutación coincide | «Revisa la operación» y se enseña la sustitución |

**Condición de discriminación:** si dos caminos dan la misma cifra dentro de la tolerancia (por ejemplo, con n = 1 simple y compuesta coinciden), el generador cambia de semilla.

### 4.3 Los cinco modos (cada modo activa unos pasos del mismo motor)
| Modo | Pasos | Ayuda | Para qué | Ruta (los nombres actuales quedan como alias) |
|---|---|---|---|---|
| Reconocimiento | 2–3 | inmediata (las B y C actuales) | leer el enunciado y elegir la ley | `#tema/2/<bloque>/reconocer` (`datos`, `elegir`) |
| Planteamiento | 2–5, sin calcular | fórmula a petición | montar el problema | `…/plantear` |
| Resolución | 1–9 | niveles 1–3 (datos, fórmula, sustitución) | aprender el procedimiento | `…/resolver` (`practica`) |
| Autonomía | solo el 6, nivel 4 | diagnóstico y explicación **después** | simular el examen | `…/autonomia` (cabecera de examen, §7) |
| Práctica mixta | según el modo elegido | según el dominio de cada familia | práctica intercalada entre bloques | `#tema/2/mixta` |

### 4.4 Generador con semilla reproducible
| Elemento | Diseño |
|---|---|
| Familias | Las 20 de A2 §6 (S1–S6, C1–C8, D1–D6). Cada una con una plantilla que toma el texto de los enunciados actuales y solo cambia las cifras |
| Semilla | Número visible y compartible (`#tema/2/mixta?s=48213`): la misma semilla da el mismo ejercicio. «Otro equivalente» = semilla + 1, con la misma familia y la misma incógnita |
| Datos (A2) | C₀ o N entre 500 y 100.000 €, múltiplos de 50; tipos entre 0,5 y 15 %, de 0,25 en 0,25; m ∈ {2, 3, 4, 12, 360, 365}; el enunciado dice siempre el régimen, la base y el periodo del tipo |
| Resultados (A2) | Importes al céntimo (±0,01); tipos con 6 decimales en tanto por uno o 4 en %; n con 2 decimales y desglose según el convenio; Cₙ > C₀, E > 0, líquido > 0, i > 0, n > 0 y n·d < 1 |
| Pasos mostrados | Ninguno puede mover el resultado más que la tolerancia (lección de E1 y D12) |
| Exclusiones | **No generar** nada de la fila 32 (no confirmable) |
| Verificación independiente | (1) Prueba de compilación con 1.000 semillas fijas por familia: cada ejercicio se comprueba por la ruta independiente de A2 (inversa, producto iterado, ida y vuelta) y las mutaciones tienen que dar cifras distintas. (2) En ejecución se descarta y se regenera lo que no cumpla. (3) Las 21 respuestas actuales se cotejan con el dominio (N7) |

### 4.5 Qué se reutiliza (A1 §2.3)
- Modelo e interfaz: `EjercicioTema2` (`ejercicios.ts:24-45`) como base; `fragmentos()`, `enunciadoHtml()`, `razonNo()`, `leerNumero()` y `comprobar()` (`fases.ts`).
- Cálculo y azar: el solucionador puro (`calculoFinanciero.ts`, `formulasCompuesta.ts`) y `aleatorio(semilla)`.
- Progreso: `EstadoPractica`, `practice.ts`, `recall.ts` y `session.ts` (dominio y repetición espaciada).
- Contenido ya escrito: los catálogos de errores, los 4 `EJERCICIOS_PAPEL` sin usar y `seccionReconocer` (pasándola a los id de `FORMULAS_TEMA2`).

### 4.6 Persistencia
Se guardan los resultados por familia y por tipo de error en `EstadoPractica`, con una clave propia. Así «Mi progreso» y «Cuaderno» incluyen el Tema 2 y queda resuelto N17.

### 4.7 Consejo sobre los «ejercicios aleatorios» que piensa el usuario
1. **Familias con parámetros, no números al azar.** Lo aleatorio son las cifras dentro de rangos «de libro» y el orden; la estructura (qué se da y qué se pide) es fija y está verificada.
2. **Reproducibles.** Con la semilla a la vista, un fallo se puede repetir, revisar con el profesor o compartir.
3. **Que varíe lo que más enseña:** la periodicidad (meses, trimestres, días) y la base 360/365, que es donde están los errores del material. Siempre dentro de lo confirmado: sin m = 6 ni m = 24.
4. **Primero por familia, después mezclado.** La práctica mixta llega cuando cada familia sale bien por separado, y el selector da más peso a los fallos recientes.
5. **Los casos del libro se mantienen como anclas fijas.** Lo generado se marca «Ejercicio de práctica» y usa plantillas neutras, sin personas ni empresas inventadas.
6. **Cada ejercicio tiene que permitir el diagnóstico.** Si dos errores dan la misma cifra, se cambia de semilla.
7. **Necesita permiso**, porque es contenido nuevo. Conviene anotarlo en `docs/decisiones-pendientes.md`.

## 5. Atlas y separador «planta»

### 5.1 Atlas
**Estado (A3).**
- **El Atlas real** se abre en `#inicio` → «Ver Atlas» (`worldPanel.ts:89`): la ciudad Three.js vista desde arriba, con rótulos HTML proyectados
  (`labels.ts`) y una lista accesible. Sus datos (`atlas.ts`) son pesos y dominio; **no tiene relaciones ni el Tema 2**. Sin WebGL quedan la lista y la ciudad 2D.
- **La constelación de la portada** es un SVG estático: en el Tema 1 las líneas indican pertenencia y las únicas relaciones son 2 puentes escritos
  a mano. No se puede enfocar y en móvil los puntos miden unos 1,5 px.

**Datos reales.** Tema 2: 34 relaciones en las 19 fórmulas (`formulas.ts`). Tema 1: no tiene campo de relaciones; sacarlas de docs/fuentes
(«Relaciones: conecta con…») es contenido nuevo y **pide permiso**.

| Microinteracción | En el Atlas real (3D) | En la constelación (SVG) | Teclado · táctil · movimiento reducido |
|---|---|---|---|
| Los nodos se acercan al cursor | Solo los rótulos HTML (≤ 6 px, con muelle); la geometría del mapa no se deforma | `transform` por nodo | El foco equivale a «cerca», sin desplazamiento; táctil: no aplica; reducido: desactivado |
| Las conexiones se iluminan | Necesita datos y una capa SVG sobre el canvas, que se reproyecta solo cuando se mueve la cámara | Directo, con las 34 relaciones | Al enfocar un nodo se encienden sus aristas; táctil: el primer toque enciende y el segundo navega; reducido: cambio instantáneo |
| La etiqueta se eleva con sombra | `translateY` + `box-shadow` | Sombra precalculada; nunca se anima `filter` | Igual con `:focus-visible` |
| Parallax del fondo | Capa CSS de ≤ 10 px | Igual | Nunca en táctil ni con movimiento reducido |
| Nodo activo con brillo dorado | Marcadores HTML | Los 19 nodos ya están numerados | Brillo solo en el nodo activo |
| Legibilidad | El treemap fija la disposición: habrá cruces | Disposición fija calculada de antemano | Solo las aristas del nodo activo, en arcos, con un color por tipo de relación |

**Rendimiento y técnica.** Menos de 100 elementos en la capa; un único lector del puntero dentro de `requestAnimationFrame`; recálculo solo al
redimensionar y al mover la cámara. SVG + TS sin librerías, con disposición determinista (las fuerzas en vivo hacen bailar los nodos), y nodos `<button>` o `<a>`.

**Plan.** **S:** texto honesto (N19), relaciones de `formulas.ts` en la constelación y nodos enfocables y legibles en móvil.
**M:** las 5 microinteracciones en la constelación y en los rótulos del Atlas real. **L:** capa de relaciones en 3D y Tema 2 dentro de la ciudad (decisión de producto).

### 5.2 Separador «planta» entre los capítulos I y II
**Dónde va:** en `pintarAsignatura`, entre `capituloCiudad` y `capituloLeccion`. Hoy ahí hay un corte seco de noche a papel.

**Idea:** la semilla y las raíces están en la noche; el tronco atraviesa el degradado de `--bg2` al papel y se bifurca justo en la frontera.
La rama I es la ciudad (línea clara con luces de oro); la rama II, la geometría del cálculo (tinta y cobre sobre papel: línea temporal, curva (1+i)ⁿ, escalera de factores).

| Escena | Progreso p | Qué aparece |
|---|---|---|
| 1 | 0–0,15 | semilla |
| 2 | 0,15–0,35 | raíces |
| 3 | 0,35–0,55 | tronco que cruza de la noche al papel |
| 4 | 0,55–0,65 | bifurcación (I \| II) |
| 5 | 0,65–0,85 | ramas: ciudad / cálculo |
| 6 | 0,85–1 | composición final y leyenda en texto real |

| Aspecto | Decisión |
|---|---|
| Técnica | **SVG + scroll.** `stroke-dashoffset` con `pathLength="1"` y menos de 150 trazos generados con semilla (`papel.ts`). Canvas 2D y Three.js, descartados: rompen el lenguaje de línea, cuestan más y necesitan alternativa sin WebGL |
| Progreso | p = clamp((vh − top)/(alto + vh)), en `requestAnimationFrame` solo mientras un `IntersectionObserver` vea la sección. Determinista; no secuestra el scroll. `animation-timeline: view()` como mejora progresiva |
| Escritorio | 150 vh como máximo; `sticky` solo a partir de 900 px |
| Móvil | Una columna, ramas una detrás de otra, sin detalle fino por debajo de 600 px, 120 vh como máximo |
| Movimiento reducido · accesibilidad | Composición final estática (p = 1) · dibujo con `aria-hidden` y leyenda en texto real |
| Riesgos | Que parezca un scroll secuestrado; tirones si se anima `filter`; que compita con la apertura; que retrase el capítulo II; saltos de maquetación (hay que reservar la altura) |
| Pruebas | p = 0, 0,25, 0,5, 0,75 y 1, también con movimiento reducido y a 390 px |
| Alternativa | Lámina estática con una única revelación de unos 3 s al entrar en pantalla |

## 6. Navegación y pendientes que ya pidió el usuario

### 6.1 Sumario de fichas y fases (A1 §3.2): cambia el envoltorio, no la lógica
1. **(S)** `app.ts:99-105`: toda pantalla `tema2` pasa a ser editorial. Desaparecen la barra superior oscura y «Temario», y el `.rail` queda bajo demanda.
2. **(S)** `topicsView.ts:pintarTemaDos`: envolver la ficha y la fase en `ed-pagina ed-pagina-papel` con `navegacionEditorial`, `barraCapitulo` (exportada, con la fase activa como parámetro), el contenido y `sumarioEditorial`, y llamar a `montarEditorial`. `barraCapitulo` sustituye a `t2-recorrido` y `t2-pestanas`.
3. **(M)** Lectura sobre papel con tokens de superficie `--amb-*`, decididos por `body[data-ambiente]` y `data-bloque`, sin duplicar hojas. Hay que revisar unos 20 colores fijos de `tema2.css` y 16 fondos de `practice.css`. **Los acentos actuales no sirven como texto sobre papel** (`--oro` da 1,65:1): rotulador con tinta.
4. **(S)** El Sumario marca la página actual (N18).
5. **(S)** Actualizar, no desactivar, las pruebas `tests/app/app.dom.test.ts:242,246,249`.
6. Grabar fotograma a fotograma el paso índice → ficha → fase.

### 6.2 «Abrir el índice de fórmulas», bien visible (A1 §3.3; S)
- (a) En la cabecera de la portada, mostrar **siempre** los dos capítulos con el mismo peso que el botón principal: «Capítulo I · La Ciudad del Dinero →» y «Capítulo II · Índice de fórmulas →», en tinta clara sobre la noche.
- (b) En la tarjeta II, subir el enlace por encima de `ed-datos` con la composición grande de `.ed-siguiente` (`editorial.css:339-340`). No es un botón inventado. Se conserva `ed-enlace-fuerte` o se actualizan `academia.dom.test.ts:104` y `app.dom.test.ts:215`.
- (c) Opcional: el recorte «II · El cálculo financiero» del collage pasa a ser un enlace real.

### 6.3 Integración de las 4 escenas nuevas del Tema 1 (cambios locales sin commit)
**Estado.** Sin seguimiento en git: `src/ui/escenas/tema1/` (`sistema`, `funciones`, `caminos`, `supervision`, `nocturno`, `index.ts`) y
`src/styles/escenasTema1.css`. Modificados: `main.ts`, `lienzo.ts`, `reproductor.ts`, `simpleTipo.ts` y los scripts `visor-escenas.ts` y
`grabar-escena.ts`. **Solo se llega a ellas desde los scripts.** `index.ts` dice que sustituyen al vídeo «de cajas y nodos»
(`video/sistema-financiero.*`, la miniatura del capítulo I en `asignaturaView.ts:20-35`).

**Plan.** (1) Arreglar lo de §3.1: cortes, rótulos, haces y N9. (2) Volver a renderizar las 19 escenas del Tema 2, porque `lienzo.ts` y
`reproductor.ts` son compartidos. (3) Montarlas como `FuenteExpandible` de escena en la miniatura del capítulo I; **el vídeo se conserva**
(norma de no quitar recursos) y retirarlo de la portada pide permiso. (4) Grabar fotograma a fotograma la carga de la portada.
(5) Dos commits: el motor por un lado y las escenas por otro.

### 6.4 Fondo de la portada (variaciones A/B)
**No hay rastro de las variaciones A/B en el repositorio ni en `docs/`.** A4 lo ha buscado; deben de ser de una conversación anterior. No se rehace nada sin analizarlo primero.

| Se conserva (funciona) | Se ajusta |
|---|---|
| La apertura (isla, niebla, recorte de papel) | El capítulo I pasa de franja nocturna a sangre a **lámina nocturna enmarcada** |
| El capítulo II en papel, asimétrico | El cuaderno (noche con rejilla 2×2, aire de panel) pasa a papel o a una superficie propia de «libro mayor», con cifras en mono |
| El índice del Tema 2 como referencia | El pie pasa a papel; el Atlas sigue en noche, pero legible |

Ritmo propuesto: noche (apertura) → papel → lámina noche → planta → papel → noche (Atlas) → papel.

**Recomendación:** evaluar A y B con estos criterios **después** de elegir la dirección del Tema 1 (§8), porque el capítulo I la hereda.

### 6.5 Accesibilidad (resumen; el detalle está en §2.2)
| Hallazgo | Grav. | Tipo |
|---|---|---|
| El `.rail` oculto está en el orden de tabulación (N10) | A | Téc |
| Capa «Temario» sin Escape, sin `aria-expanded` y sin `inert` (N12) | M | Téc |
| Foco perdido en C (N14) | M | Téc |
| Barra de partes en móvil (N15) | M | Dis |
| Constelación no enfocable, puntos de 1,5 px | M | Téc/Dis |
| Rótulos de las escenas en móvil | M-A | Dis |
| `summary > a` (N21) | B | Téc |

Movimiento reducido en la ficha: funciona («Siguiente paso»). Lo pendiente son los fotogramas finales de §3.1.

## 7. Sistema de dirección artística (propuesta)
**Principio.** La base cambia con la función: **papel** para leer, estudiar y resolver; **noche** para contemplar, explorar o entrar; **color**
para marcar un momento. La identidad la dan la tipografía (Fraunces, Plex, Big Shoulders), el código de color de los símbolos y la calidad del trazo.
Coherencia no es uniformidad: ni todo azul noche y oro, ni todo crema y negro, ni arcoíris, ni plantilla de tarjetas de colores.
No se elimina ninguna escena 3D ni ningún recurso original.

### 7.1 Paleta (contraste medido sobre papel `#f1ebdf` y sobre tinta `#0d1321`)
**Los tokens nuevos necesitan aprobación**, porque `CLAUDE.md` dice «no inventar colores».
| Familia | Tokens y valores | Estado | Uso | Contraste papel / tinta |
|---|---|---|---|---|
| **Principal · noche** | `--bg` #070b14 · `--bg2` #0d1321 · `--bg3` #141c2d · `--bg4` #1b2539 | existe | intro, selector, ciudad, escenas del Tema 1, Atlas | — |
| **Principal · papel** | `--papel` #f1ebdf (alias: hoy se usa `--ink`) · `--papel2` #e6dcc7 (pliego hundido) · `--papel3` #faf6ee (hoja levantada, campos) | nuevo | lectura, ejercicios | — |
| **Principal · tinta** | `--ed-tinta` #0d1321 · `--tinta-suave` #4a5160 | existe / nuevo | texto sobre papel (`--mut` y `--tenue` no llegan: 1,8 y 2,9) | 15+ · 6,7 |
| **Principal · oro** | `--oro` #e0b25e y `--oro2` #f2d48f **solo sobre noche** · `--oro-papel` #86601f · `--oro3` #a87b32 (solo decoración) | existe / nuevo | acción y foco en noche; enlaces y volantas en papel | 1,65/9,45 · 4,77 · 3,19/4,90 |
| Apoyo · cobre | #b0623a · tinta #8a4523 · noche #e08a5a | nuevo | interés de intereses; acento de la compuesta | 3,8 y 6,0 / 7,0 |
| Apoyo · burdeos | #7a2335 · noche #d9677e | nuevo | errores frecuentes, tachados, superficie de examen | 8,35 / 5,47 |
| Apoyo · terracota | #c0573d · tinta #a4432c | nuevo | descuento sobre papel, avisos | 3,8 y 5,2 |
| Apoyo · verde | `--g` #6ccf96 (noche) · #1f6b50 (texto en papel) | existe / nuevo | intereses; acento de la simple | ≥ 4,8 (versión de texto) |
| Apoyo · azul eléctrico | #2448d8 · noche #5b8cff | nuevo | foco e interacción en papel; aristas activas del Atlas | 5,9 / 5,9 |
| Superficie · azul tinta | #1d3a8a | nuevo | lámina de color dentro de una página clara (papel encima: 8,7:1) | — |
| Semántica de símbolos | `--b` #6fa9ea presente · `--y` #e8c062 futuro · `--g` intereses · `--p` #e8789a tipos · `--v` #a796e8 tiempo · `--c` #5cc6c1 m · `--o` #ec9459 descuento | existe: **conservar** | en papel, como fondo de rotulador con tinta encima; versiones de texto: b #2c5f9e · g #1f6b50 · p #a8325a · v #5b45b0 · c #16736f | 4,8–6,1 |
| Firma de asignatura | #199e70 · #3987e5 · #c98500 · #9085e9 · #008300 · #d55181 | existe | solo filete, volanta o selector; nunca como relleno; con `--amb-acento`, no con `--c` | — |

**Acento por bloque del Tema 2** (A4; deriva de la semántica, no inventa significados):
simple = **verde** (la cosecha constante) · compuesta = **cobre** (el interés de intereses) · descuento = **terracota** (pariente del naranja
del descuento). Las bandas se hacen con `color-mix(… 18 %, fondo)`.

### 7.2 Cuándo usar fondo claro, oscuro o de color
| Fondo | Cuándo | Ejemplos del proyecto | Sensación / función |
|---|---|---|---|
| Papel | leer, estudiar, resolver | índice del Tema 2, fichas, fases, cuaderno, pie | libro, calma, concentración |
| Noche | contemplar, explorar o entrar, **solo con motivo narrativo** | intro del barco, selector, apertura, Ciudad del Dinero, escenas del Tema 1, Atlas | documental, profundidad, luz |
| Superficie de color (azul tinta, burdeos, cobre) | un momento distinto dentro de una página clara, **como mucho una por página** | cabecera de examen o autonomía (burdeos), lámina del capítulo I (azul tinta) | énfasis y cambio de ritmo |
| Degradado noche → papel | transición narrativa | separador planta | paso de un mundo a otro |
| Paleta dramática de escena | escenas educativas | capitalización (cobre sobre papel), Ciudad (oro y acentos por institución sobre noche) | emoción al servicio del concepto |

### 7.3 Cómo se diferencia cada tipo de pantalla
| Pantalla | Fondo | Tipografía | Color | Firma (un elemento) | Movimiento |
|---|---|---|---|---|---|
| Selector e intro | noche | Fraunces de cartel, Barlow espaciada | oro + color de la asignatura | plano completo «documental» | cinematográfico |
| Portada | ritmo noche/papel (§6.4) | titulares en Fraunces con cursiva final | oro en noche, oro-papel en papel | recortes y planta | apertura, planta y Atlas |
| Índices | papel | romanos grandes, columnas | semántica + banda del bloque | numeración romana | mínimo |
| Teoría (fichas) | papel + escena como lámina | Plex para leer, Fraunces en títulos | símbolos; burdeos en los errores | notas al margen | el de la escena |
| Ejercicios (fases) | papel con `--papel3` en los campos | enunciado en Fraunces, cifras en Plex Mono | subrayado semántico; azul eléctrico en el foco | cuaderno rayado | respuesta inmediata |
| Examen / autonomía | papel con cabecera burdeos | igual | burdeos con mesura | sello de prueba | ninguno |
| Diagramas e infografías | según el tema (§8) | Barlow ≥ 11 px | 2–3 colores por diagrama | lupa o franja de diferencia | ninguno o un paso |
| Escenas del Tema 2 | papel con grano | Big Shoulders con un «1» que se distinga | semántica + cobre | lienzo 720 | narrativo |
| Escenas del Tema 1, Ciudad, Atlas 3D | noche | Fraunces en cursiva para los rótulos | luz de oro + `--b`, `--c` y `--v` por institución | paisaje | cinematográfico, parallax |

**Ejemplos de lo que hay que cambiar:**
- `#inicio`, bajo la maqueta, es lo más parecido a un dashboard: cifras grandes, dónut y rejilla de tarjetas iguales. Pasa a índice editorial; se conservan la maqueta 3D, «Así empezó la ciudad» y la ficha contextual, y se fusiona la lista duplicada **sin quitar funciones**.
- Las fichas pasan de una carcasa oscura a una página de lectura con la escena como lámina.
- Las fases pasan de un «formulario SaaS» a un cuaderno.

### 7.4 Identidad común sin repetir el diseño
| Constante (une) | Variable (diferencia) |
|---|---|
| Fraunces, Plex y Big Shoulders; volanta en versalitas | Fondo y atmósfera según la función |
| Código de color de los símbolos en todo el producto | Acento por tema, bloque o experiencia |
| Trazo: rotulador sobre papel, línea luminosa sobre noche | Composición: plano completo, columna, cuaderno, mapa |
| `.btn-*` y foco visible de `base.css` | Densidad: el índice denso, la ficha aireada |
| Grano de papel y recortes | Movimiento: solo donde explica algo |

**Regla:** ninguna página repite dos veces un bloque de tarjetas idénticas, y cada sección tiene **un** elemento de firma (romano, lámina, lupa, cascada, constelación, planta).

## 8. Infografías del Tema 1 (el análisis y las propuestas están en `docs/infografias-tema1.md`)
**Estado.** Son 12 infografías: `src/content/temas/tema-01/infografias.ts` y `src/ui/components/infographic.ts`. Al usuario le parecen oscuras, rígidas, repetitivas y con aspecto de herramienta técnica: fondo azul casi negro, cuadrícula de puntos, nodos con círculos dorados, líneas y cajas, como el prototipo de un dashboard.

**Criterios del usuario:**
- **Referencia:** publicación editorial premium, infografía de revista de divulgación científica y documental moderno.
- **Formas:** diagramas elegantes, ilustraciones, composiciones originales y conexiones que se entiendan de un vistazo.
- **Variedad** cromática y de ambiente según lo que se explique: una composición editorial luminosa, un diagrama de colores vivos con conexiones animadas, una escena ilustrada con profundidad, una comparación muy limpia.
- **Identidad compartida, pero no copias.** Jerarquía clara; ningún texto o nodo importante apagado o ilegible.
- **Fuera:** plantilla SaaS, tarjetas repetidas, adornos gratuitos y efectos que distraigan.
- **No se pierde nada:** ni explicaciones, ni conceptos, ni animaciones, ni funciones. **Ninguna explicación se sacrifica por el efecto visual.**
- **Tema 2 = «día»:** el nivel de calidad de referencia; ilustración texturizada, papel recortado, colores cálidos, crema, azul, verde, rosa y amarillo.
- **Tema 1 = «noche»:** una atmósfera propia e inmersiva que no se limite al azul oscuro y al oro, sin estética de videojuego, de dashboard ni de nodos y líneas.
- **Paletas complementarias entre los dos temas, no iguales**, y variedad real entre una infografía y otra.

**Proceso:** (1) el coordinador prepara **tres direcciones artísticas distintas** en `docs/infografias-tema1.md`; (2) el usuario elige
una (decisión D4); (3) se prueba en **una sola** infografía integrada en la app real; (4) solo después se extiende a las otras 11.

## 9. Auditoría pedagógica: enseñar desde cero (detalle en `a1-pedagogia.md`)
**Confirmado: la plataforma da por sabidas siglas y términos.**
- En las 11 pantallas recorridas, tocar una sigla no da ninguna explicación.
- El recorrido real no empieza por el temario: la Ciudad abre con el Banco de España («miembro del SEBC y del Eurosistema… MUS», `conceptos.ts:823`), y «Por dónde empezar» manda primero al 4.2.

| Hallazgo | Ejemplos | Tipo |
|---|---|---|
| Siglas que nunca se desarrollan | IIC, SICAV, SII, SEPBLAC, FGDEC, CERSA, AIAF; TIN en el Tema 2 | Ped |
| Siglas usadas antes de su tarjeta | SEBC (`conceptos.ts:648`), MUR (`:739`), CNMV (`:658`), OTC (`:270`), ESI/IIC/FOGAIN (`:1033`); edificios «CNMV» y «DGSFP» rotulados solo con la sigla | Ped |
| Términos sin definir | riesgo de crédito, intermediación (solo se nombran sus tipos), garantía explícita, línea de mediación, efecto, timbre | Ped |
| «OMEC» | No aparece en ningún texto del repositorio; no se le atribuye significado. **Hay que preguntar al usuario dónde lo ha visto** | Ped |
| ICO: «más de 10 M€» | ico.es dice «importe mínimo 10 M€», y puede ser menor para medianas empresas; además `conceptos.ts:977,981` dice «mínimo» (contradicción interna) | Exa |
| EFC «entidades de crédito» | Desde la Ley 5/2015 los EFC **no** son entidades de crédito (preámbulo; BdE). Infografía `infografias.ts:112` y `conceptos.ts:852,857` | Exa |
| SGR: «sus socios son las pymes» | Hay también socios protectores, que no son pymes y suelen ser bancos (Ley 1/1994, arts. 1 y 6.2) | Exa |
| AES en singular | Son tres autoridades | Exa |
| **Banco de España «financia a las Administraciones públicas»** (`conceptos.ts:823`) | Contradice la prohibición del art. 13 de la Ley 13/1994. **Gravedad alta** | Exa |
| Verificado tal cual | garantía explícita del ICO (RD 706/1999, art. 24); EDE (Ley 21/2011, BdE con informe del SEPBLAC); FGD 100.000 € y RDL 16/2011; MUS desde el 4/11/2014; CERSA; ICO entidad de crédito pero no de depósito | Exa |
| Verificado con matiz | En la vía de agencia del Estado el riesgo lo asume el **Estado** (la infografía solo dice «no el ICO»); FOGAIN según la CNMV; faltan depositarias (cooperativas de crédito, agencias de valores) | Exa |
| No verificable | adhesión voluntaria al FGD de sucursales de la UE; EAF como ESI hoy | Exa |
| Animaciones e infografías | Casi todas dicen qué pasa y quién interviene, pero no **por qué** ni **qué cambia**. Bancos centrales no tiene flujos. De las escenas nuevas: «Funciones» es una lista con regla mnemotécnica; «Dos caminos» no enseña el impago; «Supervisión» no desarrolla las siglas | Ped/Dis |

**Propuesta de experiencia (sin implementar):**
- **Botón de sigla con `popover` nativo.** Funciona con teclado, Escape, táctil y lector de pantalla (`aria-describedby`) y marca la primera aparición en cada pantalla. No se usa `abbr title`, que no sirve en táctil ni con teclado.
- **Glosario por tema**, que reutiliza las definiciones de `conceptos.ts` y `simbolos.ts`. Hay unas 35 explicaciones propuestas en lenguaje sencillo y con ejemplo; unas 20 son entradas nuevas y necesitan permiso, porque están en `src/content/`.
- **Prueba automática:** toda sigla visible tiene que estar declarada en el glosario y, en cada pantalla, desarrollarse o ser un botón.

## 10. Prioridades y plan por fases
**Primer incremento propuesto** (pequeño, de alto impacto y casi todo sin permiso): **I-1 + I-2 + I-3 + I-4**.

Arregla las tres quejas directas del usuario: el Sumario, el botón del índice y las escenas simple-tipo y compuesta-montante. También corrige los fallos A más visibles de las escenas.

| Fase | # | Qué | Por qué | Esf. | Riesgo | Permiso | Tipo |
|---|---|---|---|---|---|---|---|
| Incr. 1 | I-1 | Navegación editorial y Sumario en fichas y fases (§6.1, pasos 1, 2, 4 y 5) + `.rail` con `inert` y capa «Temario» con Escape y foco | Queja principal; 36 paradas de Tab | S | Bajo (hay pruebas que actualizar) | No | Dis/Téc |
| Incr. 1 | I-2 | «Abrir el índice de fórmulas» bien visible (§6.2 a y b) | Hoy está a más de 3 pantallas | S | Bajo | No | Dis |
| Incr. 1 | I-3 | Escenas: `$i_{12}$`, 3 fotogramas finales, solape de compuesta-capital-inicial, rótulo de compuesta-montante, commit del ajuste de simple-tipo, prueba automática de capítulo quieto | 5 fallos A; se ven con movimiento reducido | S | Medio: tocar `lienzo.ts` afecta a 23 escenas, así que hay que volver a grabarlas | No | Téc/Dis |
| Incr. 1 | I-4 | Correcciones pequeñas: N1–N2, N5–N7, N14–N16 y N19 (texto del Atlas) | Bajo coste, mucha confianza | S | Bajo | No | Exa/Téc |
| Incr. 1 | I-5 | C1, C2 y C3 en `src/content/` | Exactitud | S | Bajo | **Sí** | Exa |
| 3 · Pedagogía | P-1 | Dominio `src/domain/tema2/` con `diagnosticar()` y paso «variables» en D | Corregir por tipo de error (N4) | M | Medio | No | Ped/Téc |
| 3 · Pedagogía | P-2 | Motor único con los 5 modos, rutas y alias, persistencia por familia | Sustituye B, C y D sin perder funciones | L | Medio-alto (regresiones) | No | Ped/Téc |
| 3 · Pedagogía | P-3 | Generador con semilla + verificación en 3 capas (§4.4) | «Otro ejercicio equivalente» | M | Medio | **Sí** (contenido nuevo) | Ped/Exa |
| 3 · Pedagogía | P-4 | Huecos de contenido: apartados 1–2, combinados CP20 y CP24 (CP25 como familia generada), fórmulas 8 y 13, TAE→TIN, conversiones como ejercicio | Cobertura (§1) | M-L | Medio | **Sí** | Ped/Exa |
| 3 · Pedagogía | P-5 | Escenas prioritarias: calendario (§3.2) y logaritmo en 8 pasos (§3.3); compuesta-montante por capas; reglas de tamaño de rótulo | Lo que más pidió el usuario en animación | M + M | Medio | Solo los valores de la Act. 20 | Ped/Dis |
| 3 · Pedagogía | P-6 | Lectura sobre papel con `--amb-*` y acento por bloque (§6.1, paso 3) | Coherencia con el índice | M | Medio (contraste) | **Sí** (tokens nuevos) | Dis |
| 3 · Pedagogía | P-7 | Auditoría pedagógica desde cero: glosario y explicaciones en contexto (§9) | Se usan siglas antes de explicarlas | M | Bajo | **Sí** si toca `src/content/` | Ped/Exa |
| 4 · Atlas, separador y arte | A-1 | Constelación interactiva con las 34 relaciones + microinteracciones en los rótulos del Atlas real | Promesa del texto; interacción pedida | M | Medio (rendimiento en móvil) | No (Tema 2); **Sí** (relaciones del Tema 1) | Dis/Téc |
| 4 · Atlas, separador y arte | A-2 | Separador planta en SVG + scroll | Corte seco de noche a papel | M | Medio | No | Dis |
| 4 · Atlas, separador y arte | A-3 | **Decisión del usuario: elegir una de las tres direcciones artísticas del Tema 1** (`infografias-tema1.md`) y probarla en una sola infografía real | Rechazo de las 12 infografías actuales | S (decidir) + M (prueba) | Alto si se extiende antes de probar | **Sí** | Dis/Ped |
| 4 · Atlas, separador y arte | A-4 | Integración de las 4 escenas del Tema 1 (§6.3) y reajuste de la portada (§6.4) | Ya están hechas pero no se ven | M | Medio (destellos en la entrada) | Sí para retirar el vídeo | Dis/Téc |
| 4 · Atlas, separador y arte | A-5 | Llevar `#inicio` de dashboard a índice editorial | Lo más «SaaS» del proyecto | M | Medio | No | Dis |
| 5 · Validación | V-1 | typecheck + test + build; grabación fotograma a fotograma de la entrada, la portada y el paso índice → ficha → fase; 23 escenas en `fin − 0,6` y `fin` | Normas de `CLAUDE.md` | S por incremento | — | No | Téc |
| 5 · Validación | V-2 | Pruebas reales con lector de pantalla (NVDA o VoiceOver), Safari/iOS y un Android modesto; contraste medido | No se ha hecho (§11) | M | — | No | Téc |
| 5 · Validación | V-3 | Revisión del usuario con capturas y con los apuntes en papel (procedencias no confirmables) | Exactitud | S | — | — | Exa |

## 11. Revisión de completitud y decisiones del usuario

### 11.1 Qué no se ha verificado o sigue abierto
- **Accesibilidad real.** No se ha probado con lectores de pantalla (solo se ha revisado el ARIA en el DOM), ni en Safari/iOS, ni en dispositivos reales: todo se ha hecho en Chromium con SwiftShader.
- **Grabaciones que faltan.** No se ha grabado fotograma a fotograma la entrada ni la intro; la auditoría no cambia nada, pero será obligatorio al implementar. El movimiento reducido de las escenas se ha deducido de `finCapitulo`, no se ha grabado. Las escenas en móvil se han simulado escalándolas.
- **Pantallas sin capturar.** Ningún agente ha capturado las pantallas de estudio del Tema 1 (`#s`, `#c`, examen, simulacro, repaso).
- **Material de referencia.** **Los apuntes originales no están en el repositorio**, solo `docs/fuentes`. Por eso no se pueden confirmar: la
  errata del 1.450 €; lo de las «raíces cuadradas»; la procedencia «del libro» de c-9000, c-50000 y Juana; el resultado de la Act. 18 y el año
  de la Act. 19; los valores de la Act. 20 (el diario con 360 o 365); el bimestral y el quincenal; los datos del CP25; CP4–8, 10–12, 16, 18,
  21–23, 26 y 27; el timbre y el forfait.
- **Otros abiertos:** las variaciones A/B del fondo de la portada no se han encontrado en el repositorio (§6.4); el corte de la versión subida de
  simple-tipo se ha calculado, no renderizado; las infografías del Tema 1 se analizan en un documento aparte; «OMEC» no aparece en el repositorio (§9).
- **Sin métricas de rendimiento** (carga, FPS en móvil): lo del Atlas y la planta son estimaciones. Esta auditoría no ha ejecutado `typecheck`,
  `test` ni `build` sobre el árbol con cambios locales.

### 11.2 Decisiones que necesitan al usuario (en cada una, la opción recomendada)
| # | Decisión | Recomendación |
|---|---|---|
| D1 | Permiso para corregir C1, C2 y C3 en `src/content/` y suavizar las procedencias no confirmables | **Sí**. C1: exponente −565/365. C2: el texto propuesto. C3: pedir Dc como el libro |
| D2 | Ejercicios generados con semilla («Ejercicio de práctica») | **Sí**, solo con las 20 familias confirmadas de A2 §6; nada de la fila 32 |
| D3 | Añadir contenido: apartados 1–2, combinados y valores de la Act. 20 | **Sí**, con texto y cifras de docs/fuentes: CP20 y CP24 tal cual (datos y resultado constan); CP25 solo como familia D3 generada, porque sus datos de partida no constan; validar la Act. 20 antes de publicarla |
| D4 | **Elegir una de las tres direcciones artísticas del Tema 1** (`infografias-tema1.md`) | Elegir tras ver los prototipos y probarla en **una** infografía real antes de extenderla |
| D5 | Paleta ampliada (cobre, burdeos, terracota, azul eléctrico, versiones para papel), lectura sobre papel en fichas y fases, y acento por bloque | **Sí**: resuelve la legibilidad (los acentos actuales no llegan al 3:1 sobre papel) sin caer en la monocromía |
| D7 | Permiso para corregir las afirmaciones de exactitud de §9 (BdE y financiación de las AAPP, EFC, ICO «mínimo 10 M€», SGR, AES) y añadir el glosario | **Sí**, empezando por la del Banco de España (gravedad alta) |
| D6 | Atlas: relaciones del Tema 1 sacadas de docs/fuentes y el Tema 2 dentro del Atlas 3D | Primero la constelación interactiva (sin permiso para el Tema 2); el Tema 1 con relaciones, **sí** con permiso; el Tema 2 en la ciudad se aplaza |
