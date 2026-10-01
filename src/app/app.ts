import type { Tema } from '../content/schema.ts';
import { validarTema } from '../content/validate.ts';
import { almacenNavegador } from '../persistence/storage.ts';
import { pintarRail } from '../ui/components/rail.ts';
import { activarAparicion, conectarFichas, conectarMenuMovil } from '../ui/interactions.ts';
import type { ContextoVista } from '../ui/views/context.ts';
import { pintarInicio } from '../ui/views/homeView.ts';
import { pintarSeccion } from '../ui/views/sectionView.ts';
import { ControladorMundo } from '../ui/world/worldController.ts';
import { resolverRuta } from './router.ts';
import { EstadoEstudio } from './store.ts';

function elemento(selector: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) throw new Error(`Falta ${selector} en index.html`);
  return el;
}

export function iniciarApp(tema: Tema): void {
  if (import.meta.env.DEV) {
    const errores = validarTema(tema);
    if (errores.length) console.error('Contenido del tema con errores:', errores);
  }

  const ctx: ContextoVista = { pagina: elemento('#page'), rail: elemento('#rail'), tituloMovil: elemento('#mt') };
  const almacen = almacenNavegador();
  const estado = new EstadoEstudio(tema, almacen);
  const mundo = new ControladorMundo(estado, almacen);

  function pintar(): void {
    document.body.classList.remove('menu');
    const ruta = resolverRuta(location.hash, tema);
    let seccionActual: string | null = null;
    if (ruta.vista === 'seccion') {
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
    pintarRail(ctx.rail, estado, seccionActual);
    if (ruta.scrollArriba) window.scrollTo(0, 0);
    activarAparicion();
  }

  conectarFichas(ctx, estado);
  conectarMenuMovil(elemento('#mb'), ctx.rail);
  addEventListener('hashchange', pintar);
  pintar();
}
