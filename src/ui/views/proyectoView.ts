import { hrefAcademia, hrefFormula, hrefInicio, hrefNormativa, hrefProyecto, hrefSesion, hrefTema2 } from '../../app/router.ts';
import { montarEditorial, navegacionEditorial } from '../components/editorial.ts';
import type { ContextoVista } from './context.ts';

/** Sobre el proyecto: por qué existe, qué es, guía rápida, hacia dónde va, contacto y apoyo. */
export function pintarProyecto(ctx: ContextoVista): () => void {
  ctx.tituloMovil.textContent = 'Sobre el proyecto';
  ctx.pagina.innerHTML = `<div class="ed-pagina ed-pagina-noche pr-proyecto">
  ${navegacionEditorial('noche', [{ texto: 'Academia', href: hrefAcademia() }, { texto: 'Sobre el proyecto' }], { sumario: false, proyecto: false })}
  <header class="pr-hero pr-hero-personal" id="arriba">
    <div class="pr-hero-texto">
      <p class="ed-volanta">Financial Academy · Sobre el proyecto</p>
      <h1 class="ed-titular"><span>Sobre el proyecto</span></h1>
      <p class="ed-entradilla">Georgi Angelov (Pepe) · 21 años · 2.º de Administración y Finanzas. Proyecto personal de estudio.</p>
      <div class="ed-cta">
        <a class="ed-boton" href="${hrefAcademia()}"><small>Explora la herramienta</small>Elegir un mundo</a>
        <a class="ed-enlace" href="${hrefProyecto('origen')}">Por qué existe ↓</a>
      </div>
    </div>
    <aside class="pr-hero-pregunta" aria-labelledby="pr-pregunta-titulo">
      <p class="ed-volanta">La pregunta que lo empezó todo</p>
      <p class="pr-formula" aria-label="C sub cero por uno más i por n">C<sub>0</sub> · (<span class="pr-formula-uno">1</span> + i · n)</p>
      <h2 id="pr-pregunta-titulo">¿De dónde sale el 1?</h2>
      <a class="pr-pregunta-link" href="${hrefProyecto('origen')}">Por qué existe <span aria-hidden="true">↗</span></a>
    </aside>
  </header>

  <nav class="pr-indice" aria-label="Apartados de Sobre el proyecto">
    <a href="${hrefProyecto('origen')}">Por qué existe</a>
    <a href="${hrefProyecto('academia')}">Qué es</a>
    <a href="${hrefProyecto('guia')}">Guía</a>
    <a href="${hrefProyecto('futuro')}">Hacia dónde va</a>
    <a href="${hrefProyecto('contacto')}">Contacto</a>
  </nav>

  <section class="pr-seccion pr-origen" id="origen" aria-labelledby="pr-origen-titulo">
    <header class="pr-seccion-cab">
      <p class="ed-volanta">01 · El origen</p>
      <h2 id="pr-origen-titulo">Por qué existe</h2>
    </header>
    <p class="pr-origen-pregunta">Todo empezó con una pregunta: ¿de dónde sale el 1 en <a class="pr-formula-ficha" href="${hrefFormula('simple-montante')}" aria-label="Abrir la ficha de la fórmula de capital final o montante en interés simple"><span>C<sub>0</sub> · (1 + i · n)</span></a>?</p>
    <div class="pr-origen-texto">
      <p>En clase y en el libro las fórmulas suelen llegar ya hechas. Hay letras, logaritmos y tiempos que no se ven, todo en texto corrido. Se aprende a colocar números en la fórmula, no a entender qué representa cada parte.</p>
      <p>Financial Academy nace para cambiar eso: ver la fórmula, cambiar los datos y practicar en el mismo sitio.</p>
    </div>
  </section>

  <section class="pr-seccion pr-que-es" id="academia" aria-labelledby="pr-academia-titulo">
    <header class="pr-seccion-cab">
      <p class="ed-volanta">02 · La herramienta</p>
      <h2 id="pr-academia-titulo">Qué es Financial Academy</h2>
      <p>Financial Academy es una web para estudiar Gestión Financiera. De momento tiene dos temas: el sistema financiero español (teoría) y la matemática financiera (cálculo).</p>
    </header>
    <article class="pr-que-es-destacada">
      <span>01 / ENTENDER</span>
      <div>
        <h3>La fórmula está junto al ejercicio</h3>
        <p>La fórmula no está en una página y el ejercicio en otra. Trabajas con ella mientras cambias los datos y ves qué le ocurre al capital, al tiempo y al interés. Explicación y práctica conviven en la misma pantalla: puedes calcular a la vez que el profesor explica, sin saltar entre pestañas ni copiar enunciados.</p>
      </div>
    </article>
    <div class="pr-que-es-grid">
      <article class="pr-que-es-tarjeta">
        <span>02 / VISUALIZAR</span>
        <h3>Animaciones para comprender</h3>
        <p>Las animaciones convierten las letras de la fórmula en algo que puedes ver: cómo cambian el capital, el tiempo y el interés. Así entiendes qué representa cada dato, en vez de limitarte a memorizar dónde colocarlo. Y como explicación y ejercicio están juntos, estudias sin perder tiempo saltando entre recursos.</p>
      </article>
      <article class="pr-que-es-tarjeta">
        <span>03 / PRACTICAR</span>
        <h3>Ejercicios que no se acaban</h3>
        <p>Los ejercicios se generan al azar para cada concepto, así que nunca se acaban. Puedes resolverlos en papel o en la web, con pistas o sin ellas. No hace falta copiar enunciados: la web los genera, igual que las preguntas tipo test y las infografías.</p>
      </article>
      <article class="pr-que-es-tarjeta">
        <span>04 / AVANZAR</span>
        <h3>Progreso que cuenta los fallos</h3>
        <p>Hay también un sistema de progreso. Cada ejercicio que haces cuenta, y los fallos también, de modo que la puntuación mide si lo entiendes y no si lo has memorizado.</p>
      </article>
      <article class="pr-que-es-tarjeta">
        <span>05 / EXPLORAR</span>
        <h3>Cada asignatura, un mundo</h3>
        <p>Cada asignatura es un “mundo”. No es decoración: quería que abrir la web no pareciera ponerse a estudiar, porque eso también ayuda a empezar.</p>
      </article>
    </div>
    <div class="pr-temas">
      <p class="ed-volanta">Dos temas para empezar</p>
      <div class="pr-hero-rutas" aria-label="Accesos a los temas disponibles">
        <a href="${hrefInicio()}"><span>01</span><b>Sistema financiero español</b><small>Teoría en La Ciudad del Dinero</small><i aria-hidden="true">↗</i></a>
        <a href="${hrefTema2()}"><span>02</span><b>Matemática financiera</b><small>Cálculo, fórmulas y práctica guiada</small><i aria-hidden="true">↗</i></a>
      </div>
    </div>
  </section>

  <section class="pr-seccion pr-guia" id="guia" aria-labelledby="pr-guia-titulo">
    <header class="pr-seccion-cab">
      <p class="ed-volanta">03 · Una guía rápida</p>
      <h2 id="pr-guia-titulo">Empieza a tu manera</h2>
      <p>La web reúne dos recorridos distintos. Puedes entrar por una asignatura o ir directo a un recurso de estudio.</p>
    </header>
    <div class="pr-pasos">
      <article class="pr-paso"><span>01</span><h3>Elige un mundo</h3><p>En el selector, Gestión Financiera es la asignatura con contenido disponible. Las demás aparecen como próximas.</p><a href="${hrefAcademia()}">Ir al selector <b aria-hidden="true">↗</b></a></article>
      <article class="pr-paso"><span>02</span><h3>Explora o consulta</h3><p>En el Tema 1 puedes recorrer la Ciudad del Dinero o usar el Atlas HTML. En el Tema 2, abre el sumario para localizar bloques y fórmulas.</p><a href="${hrefInicio()}">Abrir el Tema 1 <b aria-hidden="true">↗</b></a></article>
      <article class="pr-paso"><span>03</span><h3>Practica y vuelve</h3><p>«Estudiar hoy» crea una sesión mezclada. «Mi progreso» resume tu actividad y evolución: son apartados distintos.</p><a href="${hrefSesion()}">Estudiar hoy <b aria-hidden="true">↗</b></a></article>
    </div>
  </section>

  <section class="pr-seccion pr-futuro" id="futuro" aria-labelledby="pr-futuro-titulo">
    <header class="pr-seccion-cab">
      <p class="ed-volanta">04 · Lo que viene</p>
      <h2 id="pr-futuro-titulo">Hacia dónde va</h2>
    </header>
    <div class="pr-futuro-texto">
      <p>Ahora es gratis para estudiar, y la idea es que siga siendo útil para quien estudia. Si a centros, academias o profesores les interesa usarla en clase, se puede adaptar.</p>
    </div>
    <blockquote class="pr-cierre">
      <p>Detrás hay muchas horas de método, código, animaciones y ejercicios. Si te ayuda a entender algo que antes solo memorizabas, habrá merecido la pena.</p>
    </blockquote>
  </section>

  <section class="pr-contacto" id="contacto" aria-labelledby="pr-contacto-titulo">
    <div>
      <p class="ed-volanta">05 · Colaboraciones</p>
      <h2 id="pr-contacto-titulo">¿Te interesa para tu centro?</h2>
      <p>¿Eres centro, profesor o empresa y te interesa? Escríbeme.</p>
    </div>
    <a class="pr-contacto-enlace" href="mailto:jorgeangelov2020@gmail.com">jorgeangelov2020@gmail.com <span aria-hidden="true">↗</span></a>
  </section>

  <section class="pr-apoyo" id="apoyo" aria-labelledby="pr-apoyo-titulo">
    <div><p class="ed-volanta">06 · Apoyo</p><h2 id="pr-apoyo-titulo">Si te está sirviendo</h2><p>Si esta herramienta te está sirviendo, puedes apoyar el proyecto invitándome a un café. Es totalmente voluntario.</p></div>
    <a class="ed-boton" href="https://buymeacoffee.com/pepitofinanzas" target="_blank" rel="noopener noreferrer"><small>Apoyo voluntario</small>Invítame a un café ↗</a>
  </section>

  <footer class="pr-pie"><span>Financial Academy · Proyecto personal y educativo</span><p>No sustituye al material oficial, los libros ni a las clases.</p><a href="${hrefProyecto('arriba')}">Volver arriba ↑</a><a href="${hrefNormativa()}">Referencias normativas</a></footer>
</div>`;
  return montarEditorial(ctx.pagina);
}
