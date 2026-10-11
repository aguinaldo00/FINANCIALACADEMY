import type { Tema } from '../content/schema.ts';
import { buscarAsignatura, ID_GESTION_FINANCIERA } from '../content/academia.ts';
import { TEMAS, type TemaCatalogo } from '../content/temas/index.ts';
import { validarTema } from '../content/validate.ts';
import { almacenNavegador, escribirJson, leerJson } from '../persistence/storage.ts';
import { type Miga, pintarMigas, pintarRailAcademia } from '../ui/components/barraAcademia.ts';
import { pintarAcademia, type UltimoSitio } from '../ui/views/academiaView.ts';
import { pintarAsignatura } from '../ui/views/asignaturaView.ts';
import { pintarRail } from '../ui/components/rail.ts';
import { activarAparicion, conectarFichas, conectarMenuMovil } from '../ui/interactions.ts';
import type { ContextoVista } from '../ui/views/context.ts';
import { pintarExamen } from '../ui/views/examView.ts';
import { pintarProgreso } from '../ui/views/progresoView.ts';
import { pintarRepaso } from '../ui/views/repasoView.ts';
import { pintarSesion } from '../ui/views/sesionView.ts';
import { detenerVisual, pintarVisual } from '../ui/views/visualView.ts';
import { pintarGlosario } from '../ui/views/glosarioView.ts';
import { detenerSimulacro, pintarSimulacro } from '../ui/views/simulacroView.ts';
import { pintarInicio } from '../ui/views/homeView.ts';
import { pintarSeccion } from '../ui/views/sectionView.ts';
import { desplazarTemaDos, detenerTemaDos, pintarTemaDos, pintarRailTemaDos } from '../ui/views/topicsView.ts';
import { ControladorMundo } from '../ui/world/worldController.ts';
import { hrefAcademia, hrefAsignatura, hrefInicio, hrefTema2, resolverRuta } from './router.ts';
import { EstadoPractica } from './practiceStore.ts';
import { EstadoEstudio } from './store.ts';

/** Último sitio visitado de cada asignatura (comodidad local: "Continuar donde lo dejaste"). */
export const CLAVE_ULTIMO = 'financial-academy:ultimo';
/** El usuario ha ocultado el índice lateral en escritorio (se abre como capa con "Temario"). */
export const CLAVE_INDICE_PLEGADO = 'financial-academy:indice-plegado';

function elemento(selector: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) throw new Error(`Falta ${selector} en index.html`);
  return el;
}

export function iniciarApp(tema: Tema, _catalogo: readonly TemaCatalogo[] = TEMAS): void {
  if (import.meta.env.DEV) {
    const errores = validarTema(tema);
    if (errores.length) console.error('Contenido del tema con errores:', errores);
  }

  const ctx: ContextoVista = { pagina: elemento('#page'), rail: elemento('#rail'), tituloMovil: elemento('#mt') };
  const almacen = almacenNavegador();
  const estado = new EstadoEstudio(tema, almacen);
  const practica = new EstadoPractica(tema, almacen);
  const mundo = new ControladorMundo(estado, almacen, practica);

  const migas = document.querySelector<HTMLElement>('#migas');
  const gf = buscarAsignatura(ID_GESTION_FINANCIERA)!;
  const ultimos = (): Record<string, UltimoSitio> => {
    const v = leerJson(almacen, CLAVE_ULTIMO);
    return v && typeof v === 'object' ? (v as Record<string, UltimoSitio>) : {};
  };
  /** Cierra lo que haya dejado montado la vista anterior (animaciones del selector). */
  let detenerVista: (() => void) | null = null;
  /** Migas de la asignatura y del tema (el texto de la página actual lo pone cada vista en #mt). */
  const migasTema = (numero: number, href: string): Miga[] => [
    { texto: 'Academia', href: hrefAcademia() },
    { texto: gf.nombre, href: hrefAsignatura(gf.id) },
    { texto: `Tema ${numero}`, href },
  ];
  const recordar = () => {
    const titulo = ctx.tituloMovil.textContent?.trim();
    if (titulo) escribirJson(almacen, CLAVE_ULTIMO, { ...ultimos(), [gf.id]: { href: location.hash || hrefInicio(), titulo } });
  };

  let indicePlegado = leerJson(almacen, CLAVE_INDICE_PLEGADO) === true;
  const botonPlegar = document.querySelector<HTMLButtonElement>('#rp');
  let vistaAcademia = false;
  const aplicarIndice = () => {
    // Plegado = el mismo modo "bajo demanda" del selector: el índice se abre como capa con "Temario".
    document.body.classList.toggle('rail-bajo-demanda', indicePlegado || vistaAcademia);
    document.body.classList.toggle('indice-plegado', indicePlegado && !vistaAcademia);
    if (!botonPlegar) return;
    const fijar = indicePlegado;
    botonPlegar.setAttribute('aria-label', fijar ? 'Fijar el índice' : 'Ocultar el índice');
    botonPlegar.title = fijar ? 'Fijar el índice' : 'Ocultar el índice';
    botonPlegar.classList.toggle('fijar', fijar);
  };
  botonPlegar?.addEventListener('click', (e) => {
    e.stopPropagation();
    indicePlegado = !indicePlegado;
    escribirJson(almacen, CLAVE_INDICE_PLEGADO, indicePlegado);
    document.body.classList.remove('menu');
    aplicarIndice();
  });

  let seccionActual: string | null = null;
  /** Si la vista actual es del tema 1 (el índice lateral es el suyo). */
  let vistaTemaUno = true;

  function pintar(): void {
    document.body.classList.remove('menu');
    const ruta = resolverRuta(location.hash, tema);
    detenerVista?.();
    detenerVista = null;
    // Índice bajo demanda fuera del estudio (selector y asignatura) o si el usuario lo ha ocultado.
    const indiceTemaDos = ruta.vista === 'tema2' && ruta.pantalla.tipo === 'indice';
    vistaAcademia = ruta.vista === 'academia' || ruta.vista === 'asignatura' || indiceTemaDos;
    aplicarIndice();
    document.body.dataset.vista = ruta.vista;
    // Identidad editorial (página a todo el ancho con su propia navegación): hoy, la portada de la
    // asignatura y el índice del Tema 2. El resto de pantallas usa el esqueleto común.
    document.body.classList.toggle('editorial', ruta.vista === 'asignatura' || indiceTemaDos);
    seccionActual = null;
    detenerSimulacro();
    detenerVisual();
    if (ruta.vista !== 'tema2') detenerTemaDos();
    vistaTemaUno = ruta.vista !== 'academia' && ruta.vista !== 'asignatura' && ruta.vista !== 'tema2';
    if (ruta.vista === 'academia') {
      mundo.desmontar();
      detenerVista = pintarAcademia(ctx, ultimos());
      pintarRailAcademia(ctx.rail);
      pintarMigas(migas, []);
      document.title = 'Financial Academy';
      window.scrollTo(0, 0);
      activarAparicion();
      return;
    }
    if (ruta.vista === 'asignatura') {
      mundo.desmontar();
      const asignatura = buscarAsignatura(ruta.asignaturaId)!;
      detenerVista = pintarAsignatura(ctx, asignatura, estado, practica, ultimos()[asignatura.id]);
      pintarRailAcademia(ctx.rail, asignatura);
      pintarMigas(migas, [{ texto: 'Academia', href: hrefAcademia() }]);
      document.title = `${asignatura.nombre} · Financial Academy`;
      window.scrollTo(0, 0);
      activarAparicion();
      return;
    }
    if (ruta.vista === 'tema2') {
      mundo.desmontar();
      // Dentro de la misma lección, cambiar de parte solo desplaza: no se pierde lo que llevas hecho.
      if (!desplazarTemaDos(ctx, ruta)) pintarTemaDos(ctx, ruta, estado);
      pintarRailTemaDos(ctx.rail, ruta);
      pintarMigas(migas, migasTema(2, hrefTema2()).slice(0, ruta.pantalla.tipo === 'indice' && !ruta.pantalla.bloque ? 2 : 3));
      recordar();
      document.title = 'Introducción al cálculo financiero · Tema 2';
      if (ruta.scrollArriba) window.scrollTo(0, 0);
      activarAparicion();
      return;
    }
    document.title = 'Gestión financiera · La ciudad del dinero';
    if (ruta.vista !== 'inicio' && ruta.vista !== 'seccion') {
      seccionActual = ruta.vista;
      mundo.desmontar();
      if (ruta.vista === 'examen') pintarExamen(ctx, estado, practica);
      else if (ruta.vista === 'simulacro') pintarSimulacro(ctx, estado, practica);
      else if (ruta.vista === 'sesion') pintarSesion(ctx, estado, practica);
      else if (ruta.vista === 'progreso') pintarProgreso(ctx, estado, practica);
      else if (ruta.vista === 'visual') pintarVisual(ctx, estado);
      else if (ruta.vista === 'glosario') pintarGlosario(ctx);
      else pintarRepaso(ctx, estado, practica, undefined, 'conceptoId' in ruta ? ruta.conceptoId : undefined);
    } else if (ruta.vista === 'seccion') {
      seccionActual = ruta.seccionId;
      mundo.desmontar();
      // Al volver a la portada, el mapa se abre donde se estaba estudiando.
      mundo.recordar(ruta.conceptoFoco ? { nivel: 'edificio', conceptoId: ruta.conceptoFoco } : { nivel: 'zona', seccionId: ruta.seccionId });
      pintarSeccion(ctx, estado, ruta.seccionId, ruta.conceptoFoco);
    } else {
      pintarInicio(ctx, estado);
      const raizMundo = ctx.pagina.querySelector<HTMLElement>('[data-mundo]');
      if (raizMundo) mundo.montar(raizMundo);
    }
    pintarRail(ctx.rail, estado, seccionActual, practica);
    pintarMigas(migas, migasTema(tema.meta.numero, hrefInicio()).slice(0, ruta.vista === 'inicio' ? 2 : 3));
    recordar();
    if (ruta.scrollArriba) window.scrollTo(0, 0);
    activarAparicion();
  }

  conectarFichas(ctx, estado, practica);
  // La insignia de pendientes del índice sigue a la práctica.
  practica.escuchar(() => {
    if (vistaTemaUno) pintarRail(ctx.rail, estado, seccionActual, practica);
  });
  const flotante = document.querySelector<HTMLElement>('#ib');
  conectarMenuMovil(flotante ? [elemento('#mb'), flotante] : [elemento('#mb')], ctx.rail);
  addEventListener('hashchange', pintar);
  pintar();
  document.documentElement.classList.remove('arrancando');
  // El índice ya está en su sitio: desde el segundo fotograma vuelve a animarse al abrir y cerrar.
  requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.remove('quieto')));
}
