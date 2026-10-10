import { hrefAsignatura } from '../../app/router.ts';
import { ASIGNATURAS, type Asignatura, disponible, NOMBRE_EXPERIENCIA } from '../../content/academia.ts';
import { ICONOS_UI } from '../../icons/ui.ts';
import { webglDisponible } from '../../scene/webgl.ts';
import { introBarcoPendiente, reproducirIntroBarco } from '../intro/introBarco.ts';
import type { ContextoVista } from './context.ts';

/*
 * Selector de mundos: la entrada de Financial Academy. Cada asignatura es un medallón con su icono
 * propio y su color de identidad; las que tienen temas se abren, las demás aparecen atenuadas como
 * "todavía sin contenido" (estado derivado de los datos, nunca declarado a mano).
 * Movimiento: los medallones flotan, siguen al puntero con paralaje y, al entrar, el elegido se
 * acerca a la cámara antes de cambiar de vista. Con movimiento reducido, nada de eso.
 */

/** Último sitio visitado de cada asignatura ("Continuar donde lo dejaste"). */
export interface UltimoSitio {
  href: string;
  titulo: string;
}

/** Medallón grande de una asignatura (misma gramática que los iconos de la interfaz). */
export function medallonAsignatura(a: Asignatura, clase = 'ac-sello'): string {
  return `<svg class="${clase}" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><circle class="ac-disco" cx="32" cy="32" r="30"/><circle class="ac-grafila" cx="32" cy="32" r="26.5"/><g class="ac-trazo" transform="translate(14 14) scale(.5625)">${ICONOS_UI[a.icono]}</g></svg>`;
}

function mundo(a: Asignatura, i: number, ultimo: UltimoSitio | null): string {
  const abierta = disponible(a);
  const estado = abierta ? `${a.temas.length} ${a.temas.length === 1 ? 'tema' : 'temas'}` : 'Todavía sin contenido';
  const temas = abierta
    ? `<ul class="ac-temas">${a.temas.map((t) => `<li><b>Tema ${t.numero}</b> ${t.titulo}<small>${NOMBRE_EXPERIENCIA[t.experiencia]}</small></li>`).join('')}</ul>`
    : '';
  const cuerpo = `<span class="ac-halo" aria-hidden="true"></span>${medallonAsignatura(a)}<span class="ac-nombre">${a.nombre}</span><span class="ac-estado">${estado}</span>`;
  const puerta = abierta
    ? `<a class="ac-puerta" href="${hrefAsignatura(a.id)}" data-entrar aria-label="${a.nombre}: ${estado}. Entrar">${cuerpo}</a>`
    : `<div class="ac-puerta" aria-disabled="true" role="group" aria-label="${a.nombre}: todavía sin contenido">${cuerpo}</div>`;
  const continuar = abierta && ultimo ? `<a class="ac-continuar" href="${ultimo.href}">Continuar: <b>${ultimo.titulo}</b> →</a>` : '';
  return `<li class="ac-mundo ${abierta ? 'abierta' : 'pendiente'}" style="--c:${a.color};--i:${i}">${puerta}${temas || continuar ? `<div class="ac-detalle">${temas}${continuar}</div>` : ''}</li>`;
}

/** Texto del panel de la isla elegida: lo que contiene según sus datos (nada inventado). */
function resumenMundo(a: Asignatura): string {
  if (!disponible(a)) return 'Todavía sin contenido: aparecerá aquí cuando se registren sus temas.';
  return a.temas.map((t) => `Tema ${t.numero} · ${t.titulo} — ${NOMBRE_EXPERIENCIA[t.experiencia]}`).join(' · ');
}

export function pintarAcademia(ctx: ContextoVista, ultimo: Readonly<Record<string, UltimoSitio>> = {}): () => void {
  const abiertas = ASIGNATURAS.filter(disponible).length;
  ctx.pagina.innerHTML = `<div class="academia" data-academia>
  <div class="ac-fondo" aria-hidden="true"><i class="ac-orbita o1"></i><i class="ac-orbita o2"></i><i class="ac-orbita o3"></i></div>
  <div class="ac-escena" data-ac-escena aria-hidden="true"></div>
  <header class="ac-cab">
    <p class="ac-ante">Financial Academy</p>
    <h1>Elige un mundo</h1>
    <p class="ac-lema">Ciclo de Administración y Finanzas · ${ASIGNATURAS.length} asignaturas · ${abiertas} ${abiertas === 1 ? 'abierta' : 'abiertas'}</p>
    <button type="button" class="ac-ver-intro" data-ac-intro>Ver intro</button>
  </header>
  <ul class="ac-mundos" aria-label="Asignaturas">${ASIGNATURAS.map((a, i) => mundo(a, i, ultimo[a.id] ?? null)).join('')}</ul>
  <section class="ac-foco" data-ac-foco aria-live="polite" hidden></section>
  <nav class="ac-nav" data-ac-nav aria-label="Cambiar de mundo" hidden>
    <button type="button" class="ac-flecha" data-ac-paso="-1" aria-label="Mundo anterior">‹</button>
    <span class="ac-puntos">${ASIGNATURAS.map((a, i) => `<button type="button" class="ac-punto" data-ac-ir="${i}" aria-label="${a.nombre}" style="--c:${a.color}"></button>`).join('')}</span>
    <button type="button" class="ac-flecha" data-ac-paso="1" aria-label="Mundo siguiente">›</button>
  </nav>
</div>`;
  ctx.tituloMovil.textContent = 'Financial Academy';

  const raiz = ctx.pagina.querySelector<HTMLElement>('[data-academia]')!;
  const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let raf = 0;
  let temporizador = 0;
  let activo = true;
  let escena: import('../../scene/three/mundosScene.ts').EscenaMundos | null = null;
  let elegida = Math.max(0, ASIGNATURAS.findIndex(disponible));
  let temporizadorRevela = 0;
  let cancelarIntro: (() => void) | null = null;
  // El selector avisa cuando está listo (3D o plano) para que la intro se retire sobre él.
  let avisarListo: (es3d: boolean) => void = () => {};
  const selectorListo = new Promise<boolean>((r) => (avisarListo = r));
  const conIntro = introBarcoPendiente(reducido) && webglDisponible();

  // Paralaje del selector plano (sin 3D): el puntero inclina levemente el conjunto.
  const mover = (e: PointerEvent) => {
    if (reducido || e.pointerType === 'touch' || escena) return;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const r = raiz.getBoundingClientRect();
      raiz.style.setProperty('--px', (((e.clientX - r.left) / r.width - 0.5) * 2).toFixed(3));
      raiz.style.setProperty('--py', (((e.clientY - r.top) / r.height - 0.5) * 2).toFixed(3));
    });
  };
  raiz.addEventListener('pointermove', mover);

  const irA = (href: string, indice: number) => {
    const fin = () => (location.hash = href);
    if (escena) {
      raiz.classList.add('saliendo');
      return escena.entrar(indice, fin);
    }
    if (reducido) return fin();
    raiz.querySelectorAll('.ac-mundo')[indice]?.classList.add('entrando');
    raiz.classList.add('saliendo');
    temporizador = window.setTimeout(fin, 520);
  };

  // Panel de la isla elegida (solo con la escena 3D).
  const pintarFoco = () => {
    const a = ASIGNATURAS[elegida]!;
    const foco = raiz.querySelector<HTMLElement>('[data-ac-foco]')!;
    const accion = disponible(a)
      ? `<a class="ac-entrar" href="${hrefAsignatura(a.id)}" data-ac-entrar="${elegida}">Entrar <span aria-hidden="true">→</span></a>`
      : `<span class="ac-entrar ac-cerrada" aria-disabled="true">En preparación</span>`;
    const sigue = disponible(a) && ultimo[a.id] ? `<a class="ac-continuar" href="${ultimo[a.id]!.href}">Continuar: <b>${ultimo[a.id]!.titulo}</b> →</a>` : '';
    foco.style.setProperty('--c', a.color);
    foco.innerHTML = `${medallonAsignatura(a, 'ac-foco-sello')}<h2>${a.nombre}</h2><p>${resumenMundo(a)}</p>${accion}${sigue}`;
    raiz.querySelectorAll<HTMLElement>('.ac-punto').forEach((p, i) => p.setAttribute('aria-current', String(i === elegida)));
    raiz.querySelectorAll<HTMLElement>('.ac-mundo').forEach((m, i) => m.classList.toggle('elegida', i === elegida));
    raiz.querySelector<HTMLButtonElement>('[data-ac-paso="-1"]')!.disabled = elegida === 0;
    raiz.querySelector<HTMLButtonElement>('[data-ac-paso="1"]')!.disabled = elegida === ASIGNATURAS.length - 1;
  };
  const elegir = (i: number) => {
    elegida = Math.max(0, Math.min(ASIGNATURAS.length - 1, i));
    escena?.seleccionar(elegida);
    pintarFoco();
  };

  raiz.addEventListener('click', (e) => {
    const destino = e.target as Element;
    if (e.metaKey || e.ctrlKey || e.shiftKey || (e as MouseEvent).button !== 0) return;
    const paso = destino.closest<HTMLElement>('[data-ac-paso]');
    if (paso) return elegir(elegida + Number(paso.dataset.acPaso));
    if (destino.closest('[data-ac-intro]')) return lanzarIntro();
    const punto = destino.closest<HTMLElement>('[data-ac-ir]');
    if (punto) return elegir(Number(punto.dataset.acIr));
    const entrar = destino.closest<HTMLAnchorElement>('a[data-ac-entrar], a[data-entrar]');
    if (entrar) {
      e.preventDefault();
      const indice = entrar.dataset.acEntrar ? Number(entrar.dataset.acEntrar) : [...raiz.querySelectorAll('.ac-mundo')].indexOf(entrar.closest('.ac-mundo')!);
      return irA(entrar.getAttribute('href') ?? '', indice);
    }
    // En 3D, pulsar el rótulo de un mundo sin abrir lo elige (y muestra que está en preparación).
    const rotulo = destino.closest<HTMLElement>('.ac-mundo');
    if (rotulo && escena) elegir([...raiz.querySelectorAll('.ac-mundo')].indexOf(rotulo));
  });
  const teclado = (e: KeyboardEvent) => {
    if (!escena || (e.target as Element).closest?.('input, textarea')) return;
    if (e.key === 'ArrowLeft') elegir(elegida - 1);
    else if (e.key === 'ArrowRight') elegir(elegida + 1);
    else return;
    e.preventDefault();
  };
  document.addEventListener('keydown', teclado);

  // Universo 2,5D: islas flotantes pintadas. Se carga aparte (Three.js) y, si no hay WebGL o fallan
  // las imágenes, queda el selector plano.
  let limpiarPendiente = () => {};
  if (webglDisponible()) {
    let pendiente: import('../../scene/three/mundosScene.ts').EscenaMundos | null = null;
    void import('../../scene/three/mundosScene.ts')
      .then(({ EscenaMundos }) => {
        if (!activo || !raiz.isConnected) return;
        const rotulos = [...raiz.querySelectorAll<HTMLElement>('.ac-mundo')];
        const nueva = new EscenaMundos(
          ASIGNATURAS.map((a) => ({ id: a.id, color: a.color, abierta: disponible(a) })),
          elegida,
          {
            reducido,
            llegada: conIntro,
            alElegir: elegir,
            alEntrar: (i) => {
              const a = ASIGNATURAS[i]!;
              if (disponible(a)) irA(hrefAsignatura(a.id), i);
            },
            alFotograma: (pies) =>
              pies.forEach((p, i) => {
                const el = rotulos[i];
                if (el) el.style.transform = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px) translate(-50%, 0) scale(${Math.min(1, 0.55 + p.escala * 0.4).toFixed(3)})`;
              }),
          },
        );
        pendiente = nueva;
        // Hasta que cargan las ilustraciones sigue a la vista (y en uso) el selector plano.
        return nueva.montarEn(raiz.querySelector<HTMLElement>('[data-ac-escena]')!).then(() => {
          pendiente = null;
          if (!activo) return nueva.destruir();
          escena = nueva;
          nueva.seleccionar(elegida);
          raiz.classList.add('ac-3d');
          raiz.querySelector<HTMLElement>('[data-ac-foco]')!.hidden = false;
          raiz.querySelector<HTMLElement>('[data-ac-nav]')!.hidden = false;
          pintarFoco();
          avisarListo(true);
        });
      })
      .catch((error) => {
        console.error('No se pudo iniciar el universo 3D', error);
        pendiente?.destruir();
        pendiente = null;
        avisarListo(false);
      });
    limpiarPendiente = () => pendiente?.destruir();
  } else avisarListo(false);

  // Intro del barco: sola la primera vez; después, con "Ver intro". Al deslumbrar se revela esto.
  function lanzarIntro(): void {
    if (cancelarIntro) return;
    raiz.classList.add('ac-llegada');
    escena?.esperarLlegada();
    cancelarIntro = reproducirIntroBarco({
      reducido,
      selectorListo,
      alRevelar: () => {
        escena?.llegar();
        raiz.classList.add('ac-revelando');
        raiz.classList.remove('ac-llegada');
        temporizadorRevela = window.setTimeout(() => raiz.classList.remove('ac-revelando'), 2600);
      },
      alTerminar: () => {
        cancelarIntro = null;
        raiz.classList.remove('ac-llegada');
      },
    });
  }
  if (conIntro) lanzarIntro();

  return () => {
    activo = false;
    cancelAnimationFrame(raf);
    clearTimeout(temporizador);
    document.removeEventListener('keydown', teclado);
    limpiarPendiente();
    clearTimeout(temporizadorRevela);
    cancelarIntro?.();
    escena?.destruir();
    escena = null;
  };
}
