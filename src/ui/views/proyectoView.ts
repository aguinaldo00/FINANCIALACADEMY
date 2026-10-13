import { hrefAcademia, hrefInicio, hrefProyecto, hrefProgreso, hrefSesion, hrefTema2 } from '../../app/router.ts';
import { montarEditorial, navegacionEditorial } from '../components/editorial.ts';
import type { ContextoVista } from './context.ts';

/** Guía global del proyecto, sus recorridos y sus recursos de estudio. */
export function pintarProyecto(ctx: ContextoVista): () => void {
  ctx.tituloMovil.textContent = 'Sobre el proyecto';
  ctx.pagina.innerHTML = `<div class="ed-pagina ed-pagina-noche pr-proyecto">
  ${navegacionEditorial('noche', [{ texto: 'Academia', href: hrefAcademia() }, { texto: 'Sobre el proyecto' }], { sumario: false, proyecto: false })}
  <header class="pr-hero" id="arriba">
    <div class="pr-hero-texto">
      <p class="ed-volanta">Financial Academy · El proyecto</p>
      <h1 class="ed-titular"><span>Estudiar finanzas</span><em>explorándolas</em></h1>
      <p class="ed-entradilla">Una herramienta de estudio creada por un alumno del ciclo de Administración y Finanzas. Aquí puedes conocer sus recorridos, aprender a usar sus recursos y encontrar las funciones que mejor encajan contigo.</p>
      <div class="ed-cta"><a class="ed-boton" href="${hrefAcademia()}"><small>Empieza por aquí</small>Elegir un mundo</a><a class="ed-enlace" href="${hrefProyecto('guia')}">Ver la guía de uso ↓</a></div>
    </div>
    <aside class="pr-hero-rutas" aria-label="Dos recorridos de estudio">
      <a href="${hrefInicio()}"><span>01</span><b>La Ciudad del Dinero</b><small>Explora el sistema financiero español</small><i aria-hidden="true">↗</i></a>
      <a href="${hrefTema2()}"><span>02</span><b>Cálculo financiero</b><small>Entiende fórmulas y practica paso a paso</small><i aria-hidden="true">↗</i></a>
    </aside>
  </header>

  <nav class="pr-indice" aria-label="Apartados de Sobre el proyecto">
    <a href="${hrefProyecto('guia')}">Guía de uso</a>
    <a href="${hrefProyecto('funciones')}">Funciones</a>
    <a href="${hrefProyecto('contacto')}">Contacto</a>
    <a href="${hrefProyecto('apoyo')}">Apoyar al creador</a>
  </nav>

  <section class="pr-seccion" id="guia" aria-labelledby="pr-guia-titulo">
    <header class="pr-seccion-cab"><p class="ed-volanta">01 · Una guía rápida</p><h2 id="pr-guia-titulo">Empieza a tu manera</h2><p>La web reúne dos recorridos distintos. Puedes entrar por una asignatura o ir directo a un recurso de estudio.</p></header>
    <div class="pr-pasos">
      <article class="pr-paso"><span>01</span><h3>Elige un mundo</h3><p>En el selector, Gestión Financiera es la asignatura con contenido disponible. Las demás aparecen como próximas.</p><a href="${hrefAcademia()}">Ir al selector <b aria-hidden="true">↗</b></a></article>
      <article class="pr-paso"><span>02</span><h3>Explora o consulta</h3><p>En el Tema 1 puedes recorrer la Ciudad del Dinero o usar el Atlas HTML. En el Tema 2, abre el sumario para localizar bloques y fórmulas.</p><a href="${hrefInicio()}">Abrir el Tema 1 <b aria-hidden="true">↗</b></a></article>
      <article class="pr-paso"><span>03</span><h3>Practica y vuelve</h3><p>«Estudiar hoy» crea una sesión mezclada. «Mi progreso» resume tu actividad y evolución: son apartados distintos.</p><a href="${hrefSesion()}">Estudiar hoy <b aria-hidden="true">↗</b></a></article>
    </div>
  </section>

  <section class="pr-seccion pr-funciones" id="funciones" aria-labelledby="pr-funciones-titulo">
    <header class="pr-seccion-cab"><p class="ed-volanta">02 · Dentro de la academia</p><h2 id="pr-funciones-titulo">Recursos para entender y practicar</h2><p>La interfaz combina explicación visual, consulta rápida y práctica. Puedes entrar en cada función desde aquí.</p></header>
    <div class="pr-funciones-grid">
      <a class="pr-funcion" href="${hrefInicio()}"><span>01 / TEMA 1</span><h3>La Ciudad del Dinero</h3><p>Mapa explorable, fichas de conceptos, Atlas HTML, glosario e infografías interactivas.</p><b aria-hidden="true">↗</b></a>
      <a class="pr-funcion" href="${hrefTema2()}"><span>02 / TEMA 2</span><h3>Cálculo financiero</h3><p>19 fórmulas en tres bloques, explicaciones paso a paso, calculadora y práctica guiada.</p><b aria-hidden="true">↗</b></a>
      <a class="pr-funcion" href="${hrefSesion()}"><span>03 / PRÁCTICA</span><h3>Sesión de hoy</h3><p>Elige una duración aproximada de 10, 15 o 25 minutos y mezcla repasos con preguntas nuevas.</p><b aria-hidden="true">↗</b></a>
      <a class="pr-funcion" href="${hrefProgreso()}"><span>04 / SEGUIMIENTO</span><h3>Mi progreso</h3><p>Consulta racha, actividad, memoria a largo plazo y evolución de los simulacros.</p><b aria-hidden="true">↗</b></a>
    </div>
  </section>

  <section class="pr-contacto" id="contacto" aria-labelledby="pr-contacto-titulo">
    <div><p class="ed-volanta">03 · Hablemos</p><h2 id="pr-contacto-titulo">Contacto</h2><p>¿Has encontrado un error o quieres dejar una sugerencia? Puedes escribirme directamente.</p></div>
    <a class="pr-contacto-enlace" href="mailto:jorgeangelov2020@gmail.com">jorgeangelov2020@gmail.com <span aria-hidden="true">↗</span></a>
  </section>

  <section class="pr-apoyo" id="apoyo" aria-labelledby="pr-apoyo-titulo">
    <div><p class="ed-volanta">04 · Apoyo</p><h2 id="pr-apoyo-titulo">Ayuda a que el proyecto siga creciendo</h2><p>Si esta herramienta te está sirviendo, puedes apoyar al creador a través de Buy Me a Coffee.</p></div>
    <a class="ed-boton" href="https://buymeacoffee.com/pepitofinanzas" target="_blank" rel="noopener noreferrer"><small>Apoyo voluntario</small>Invítame a un café ↗</a>
  </section>

  <footer class="pr-pie"><span>Financial Academy · Proyecto personal y educativo</span><p>No sustituye al material oficial, los libros ni a las clases.</p><a href="${hrefProyecto('arriba')}">Volver arriba ↑</a></footer>
</div>`;
  return montarEditorial(ctx.pagina);
}
