# Ideas para las siguientes fases (17/10/2026)

Propuestas para decidir. Ninguna está hecha salvo lo marcado como «ya está». Cada idea se apoya en
algo que ya existe en la web, para no duplicar.

## 1. «Cómo leer un enunciado» (nueva sección, antes de A · Identificar)

**Problema.** El alumno no falla en la cuenta, falla antes: no sabe qué le piden, confunde Cₙ con
C₀, no ve que «semestral» cambia n, o no detecta que el tiempo y el tipo van en unidades distintas.

**Propuesta: un método de 4 pasos, siempre el mismo** (se enseña una vez y se repite en A, B y D):

1. **¿Qué me piden?** Subrayar la pregunta y escribir la incógnita: «¿Qué capital inicial…?» → C₀.
2. **¿Qué me dan?** Cada cifra a su símbolo, con su unidad (ya existe: fase A, que colorea).
3. **¿Cuadran las unidades?** Tipo y tiempo en la misma unidad; días → año comercial o civil;
   simple o compuesta (la palabra «compuesto» o «simple» del enunciado decide).
4. **¿Qué fórmula une lo que me dan con lo que me piden?** (ya existe: fase B).

**Piezas concretas, reutilizando lo existente:**
- **Diccionario de expresiones**: «se constituye un capital» → C₀; «obtener / se convierte en / al
  cabo de» → Cₙ; «¿qué rentabilidad?» → i; «¿cuánto tiempo?» → n; «liquida trimestralmente» → m = 4;
  «TIN» → Jₘ; «efecto, letra, pagaré de» → N. Sale de los enunciados que ya tiene `enunciados.ts`.
- **Palabras trampa**: «anual» frente a «semestral», «nominal» frente a «efectivo», «descuento
  comercial» frente a «racional», «a 90 días» (fracción de año).
- **Ejercicio de lectura rápida**: se enseña un enunciado del generador y solo se pregunta «¿qué te
  piden?» (6 botones de símbolo). 10 seguidos, cronometrados. Usa el generador y los colores del
  enunciado redactado (ya está).
- **Marcar el enunciado tú mismo**: en el enunciado redactado, el alumno pulsa las cifras y elige su
  símbolo; al terminar, se descubren los colores correctos. Es la fase A con enunciados infinitos.

**Dónde va:** como paso «0 · Leer» en la ruta del tema (A → D sigue igual) o como primera tarjeta de
A · Identificar. Recomiendo lo segundo: no añade una ruta nueva.

## 2. Reloj y modo examen (el reloj por ejercicio ya está)

Ya está: cuenta atrás de 5/10/15/20 min en «Examen real», que se para al comprobar.

Siguientes pasos, por orden de utilidad:
1. **Simulacro cronometrado**: 4–6 ejercicios mezclados (simple, compuesta, descuento) con un único
   reloj total (p. ej. 50 min) y sin poder ver soluciones hasta entregar. Al final: nota, tiempo por
   ejercicio y fallos por tipo (lectura, fórmula, cálculo).
2. **Tiempo de referencia**: guardar en el navegador cuánto tardas en cada fórmula y enseñar la
   mejora («la semana pasada 6:40, hoy 4:10»). Se puede unir a «Mi progreso».
3. **Modo calculadora de examen**: en el simulacro, solo la calculadora (sin «Explícame este
   cálculo» ni hoja guiada), como en el aula.
4. **Ritmo**: un aviso suave a mitad de tiempo («llevas la mitad: ¿tienes ya la fórmula?»), sin sonido.

Decisiones pendientes: duración del simulacro y si debe contar en el dominio (hoy la práctica no
cuenta, ver `decisiones-pendientes.md`).

## 3. Diagnóstico de errores (mejora la corrección actual)

Al comprobar, en vez de solo «bien / revisa», clasificar el fallo: **lectura** (dato mal copiado o
incógnita equivocada), **elección** (fórmula de simple en compuesta), **unidades** (n en años con un
tipo mensual) o **cálculo** (todo bien hasta el último paso). El cuaderno ya revisa paso a paso: se
trata de nombrar el tipo de error y llevar la cuenta en «Mi progreso».

## 4. Tamaños y composición de los ejercicios

- Escritorio: la composición de tres columnas solo en «Caso de la animación»; en el resto, hoja y
  calculadora arriba y la animación debajo (así es ahora). Propuesta: limitar el ancho de la hoja a
  ~720 px y centrar el conjunto en pantallas muy anchas (> 1700 px), que hoy quedan con mucho hueco.
- Móvil: la calculadora es lo que más se usa; propuesta de botón flotante «Calculadora» que la abre
  como hoja inferior (bottom sheet) sin perder el enunciado de vista.
- Animaciones en móvil: los rótulos pequeños (los significados bajo la fórmula) no se leen a 390 px.
  Propuesta: en pantallas estrechas, quitar esos rótulos del dibujo y llevarlos al subtítulo.

## 5. Investigación que respalda el enfoque

- **Ejemplos resueltos que se van retirando** (worked examples → completion problems → problema
  solo): es lo que ya hace D · Practicar en papel con sus niveles de ayuda.
- **Práctica de recuperación** (testing effect) y **práctica espaciada**: «Estudiar hoy» y el repaso
  ya lo aplican en el Tema 1; falta llevarlo al Tema 2 (repasar fórmulas falladas días después).
- **Práctica intercalada** (interleaving): mezclar tipos de ejercicio mejora elegir la fórmula; es
  justo lo que hace falta en el simulacro del punto 2.
- **Codificación dual** (texto + imagen): base de las animaciones y de los colores por símbolo.
- **Presión de tiempo**: practicar con reloj reduce la ansiedad en el examen real si antes se ha
  practicado sin él; por eso el reloj solo aparece en «Examen real».

## 6. Otras ideas, de menos a más trabajo

- Botón «Ver de dónde sale» en cada fórmula derivada, que abre la animación de la madre.
- Exportar el cuaderno a PDF para entregarlo o repasarlo en papel.
- Modo profesora: un enlace con un ejercicio fijo (la semilla ya lo permite: `nº 12345`) para que
  toda la clase haga el mismo en directo.
- Tema 3 y siguientes: el laboratorio es el mismo para cualquier fórmula; añadir un tema es sobre
  todo contenido (`src/content/`), que necesita tu permiso y tus apuntes.
