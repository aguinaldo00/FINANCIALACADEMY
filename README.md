# Financial Academy

Aplicación web de estudio para el ciclo de **Administración y Finanzas**. El contenido desarrollado se centra en **Gestión Financiera** y ofrece dos recorridos distintos: explorar el sistema financiero español como una ciudad y aprender cálculo financiero con lecciones, fórmulas y práctica en papel.

> Estudiar es construirla: en el Tema 1, el mapa representa el contenido y el dominio; en el Tema 2, el recorrido va de entender una fórmula a resolver problemas con menos ayuda.

## Estado y alcance

El catálogo muestra seis asignaturas del ciclo, pero solo **Gestión Financiera** tiene temas completos.

| Tema | Contenido | Cómo se estudia |
| --- | --- | --- |
| **1 · El sistema financiero español** | 4 bloques, 12 apartados y 45 conceptos | Ciudad 3D, Atlas HTML, fichas, preguntas, glosario, flashcards e infografías |
| **2 · Matemática financiera** | 19 fórmulas en capitalización simple, compuesta y descuento | Lecciones paso a paso y una secuencia para identificar datos, elegir fórmula y practicar |

El Tema 1 tiene también una **predicción de examen**: ordena cinco bloques con porcentajes tomados de los apuntes del curso. Es una estimación de esos apuntes, **no una probabilidad oficial**. Algunos ejemplos de actualidad incluidos en el temario pueden quedar desfasados; el contenido se mantiene en el repositorio, no se consulta en tiempo real.

Las otras cinco asignaturas aparecen en el selector, todavía sin contenido de estudio.

## Recorridos de aprendizaje

### Tema 1 · La Ciudad del Dinero

Los conceptos se organizan en cuatro bloques y doce apartados. La portada permite entrar por el mapa o por un Atlas HTML con la misma navegación. El área de cada zona refleja su peso de examen y el estado de cada edificio cambia según el dominio del concepto.

Según el concepto, las fichas ofrecen una definición y recursos para trabajarla: explicaciones alternativas, trampas de examen, preguntas de comprobación, esquemas, flashcards o recuerdo escrito. Las siglas abren una explicación en el glosario; en las preguntas tipo test, su significado empieza oculto y se puede revelar antes de contestar. La corrección lo muestra cuando ya no puede dar la respuesta por adelantado.

Hay además doce infografías interactivas que desglosan relaciones como quién supervisa a quién, cómo funciona el ICO o la diferencia entre el MUS y el MUR.

### Tema 2 · Cálculo financiero

Las 19 fórmulas se reparten en tres bloques: seis de capitalización simple, ocho de capitalización compuesta y cinco de descuento. Para cada bloque, la práctica sigue cuatro fases:

1. **Entender las fórmulas:** símbolos, explicación y ejemplos.
2. **Identificar los datos:** relacionar el enunciado con variables como C₀, Cₙ, n o i.
3. **Elegir la fórmula:** discriminar qué expresión resuelve lo que pide el problema y recibir explicación de las alternativas.
4. **Practicar en papel:** resolver con calculadora y comprobar el resultado; los casos guiados van retirando ayudas.

La práctica incluye un ejercicio aleatorio, casos guiados, una hoja de cálculo con modo guiado o profesional y una calculadora integrada. En capitalización compuesta hay además una lección segmentada con ejemplos paso a paso y errores típicos.

## Cómo organiza el estudio

- **Pretest:** algunas fichas empiezan con tres preguntas breves antes de leer. Sirven para intentar recordar; no cuentan como nota ni cambian el dominio.
- **Recuperación y feedback:** las preguntas piden responder y luego explican la corrección.
- **Confianza:** antes de corregir se puede indicar «Seguro», «Dudo» o «Adivino». Los errores con seguridad reciben prioridad de repaso; acertar con dudas también señala algo que conviene afianzar.
- **Sesión diaria:** se puede elegir una sesión aproximada de 10, 15 o 25 minutos. Mezcla repasos vencidos, preguntas nuevas priorizadas y conceptos parecidos que conviene distinguir. La fecha del examen es opcional.
- **Repaso espaciado:** las preguntas falladas vuelven hasta encadenar dos aciertos; las flashcards avanzan por intervalos de 1, 3, 7 y 14 días según la autoevaluación.
- **Simulacro:** permite elegir 10, 20 o 30 preguntas, con corrección al final. Sus fallos pasan al repaso.
- **Progreso:** muestra dominio por concepto y bloque, actividad, evolución de simulacros y calibración de confianza.

La app separa el **dominio académico** de la **actividad de práctica**: responder en una sesión, un simulacro o el repaso no equivale automáticamente a subir el dominio. Las decisiones pedagógicas y sus referencias están en [docs/metodos-estudio.md](docs/metodos-estudio.md). Esas referencias justifican el diseño; el proyecto no mide por sí solo cuánto mejora el aprendizaje de sus usuarios.

## Diseño y accesibilidad

- La Ciudad del Dinero convierte jerarquía, peso de examen y dominio en mapa y arquitectura. Su alternativa HTML permite recorrer el contenido sin depender del lienzo 3D.
- El Tema 2 usa una secuencia de lectura y práctica apoyada por fórmulas animadas, calculadora y ejercicios en papel.
- Hay controles para teclado, reducción de movimiento y una vista alternativa cuando WebGL no está disponible.
- La interfaz combina fuentes locales y estilos editoriales, pero **el rediseño no está extendido a toda la aplicación**: está aplicado a la portada de Gestión Financiera, al índice del Tema 2 y a algunas animaciones. Muchas pantallas de estudio y práctica conservan el sistema visual anterior.

Estas funciones son medidas concretas de accesibilidad, no una declaración de conformidad con una auditoría WCAG.

## Arquitectura

Aplicación de una sola página en **TypeScript y Vite**, con navegación mediante rutas hash y sin framework de interfaz.

```text
src/
├── app/          Arranque, router y coordinación del estado
├── content/      Catálogo, esquemas y contenido académico estático
├── domain/       Reglas de dominio, práctica, prioridad y cálculo financiero
├── persistence/  Almacenamiento local, validación y migraciones
├── ui/           Vistas, componentes e interacciones
├── world/        Modelo y navegación de la Ciudad del Dinero
├── scene/        Renderer Three.js y detección de WebGL
├── experiences/  Modelo de historias y microexperiencias
└── styles/       Sistema visual y estilos por experiencia

tests/            Pruebas de dominio, contenido, persistencia, UI y escenas
docs/             Métodos, fuentes, arquitectura y decisiones del proyecto
```

El contenido de `src/content/` alimenta reglas de dominio independientes de las vistas. Para el Tema 1, el modelo de `src/world/` deriva mapa y estado; Three.js lo representa en la escena, que se carga bajo demanda. El Atlas HTML usa el mismo modelo como vía navegable y alternativa al renderer.

El navegador guarda datos en `localStorage`: el dominio del tema y la actividad de práctica usan repositorios y claves separadas, con saneamiento y migraciones. No hay cuentas, servidor de aplicación ni sincronización entre dispositivos.

## Límites conocidos

- El contenido académico está compilado en la aplicación; no se actualiza automáticamente desde fuentes externas.
- La predicción de examen depende de los apuntes del curso y no debe leerse como dato oficial.
- La práctica de selección de fórmulas del Tema 2 todavía no forma parte del repaso espaciado de preguntas y flashcards.
- La identidad visual nueva y la nueva gramática urbana de la ciudad están desplegadas por partes; hay pantallas y zonas con sistemas anteriores.

## Desarrollo local

Se necesita **Node.js 22** y npm.

```bash
npm ci
npm run dev
```

Vite indica la dirección local para abrir la app. Para verificar cambios:

```bash
npm test
npm run typecheck
npm run build
npm run preview
```

Vitest cubre reglas de cálculo y aprendizaje, consistencia del contenido, persistencia y migraciones, interacciones DOM, modelos geométricos y compatibilidad de vistas. `npm run build` comprueba TypeScript y genera la versión de producción.

## Publicación

GitHub Actions está configurado en [`.github/workflows/pages.yml`](.github/workflows/pages.yml). El flujo prueba y compila `main`; también intenta construir una previsualización desde la rama de trabajo configurada en el workflow y la publica bajo `/preview/` junto con el sitio de producción.

## Documentación del proyecto

- [Métodos de estudio](docs/metodos-estudio.md)
- [Arquitectura de la Ciudad del Dinero](docs/fase-2-arquitectura.md)
- [Identidad editorial y pantallas donde está aplicada](docs/identidad-editorial.md)
- [Experiencia de capitalización compuesta](docs/experiencia-capitalizacion-compuesta.md)
- [Fuentes de los temas](docs/fuentes/)
- [Plan y estado del proyecto](docs/plan-completo.md)

