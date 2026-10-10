import { hrefAsignatura, hrefProgreso } from '../../app/router.ts';
import { ASIGNATURAS, type Asignatura, disponible, NOMBRE_EXPERIENCIA } from '../../content/academia.ts';
import { ICONOS_UI } from '../../icons/ui.ts';
import { webglDisponible } from '../../scene/webgl.ts';
import { introBarcoPendiente, reproducirIntroBarco } from '../intro/introBarco.ts';
import type { ContextoVista } from './context.ts';

/*
 * Selector de mundos: la entrada de Financial Academy. Cada asignatura es un capítulo numerado
 * (01–06) con su color de identidad; las que tienen temas se abren, las demás aparecen como
 * "en preparación" (estado derivado de los datos, nunca declarado a mano).
 * Identidad "capítulos de un documental": número de capítulo como protagonista, filetes de 1 px que
 * unen número y nombre, rótulos colgados de guías y el acento que pone la asignatura elegida.
 * Sin WebGL queda el selector plano de medallones (misma lista, mismos enlaces).
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
  const cuerpo = `<i class="ac-guia" aria-hidden="true"></i><span class="ac-halo" aria-hidden="true"></span>${medallonAsignatura(a)}<span class="ac-num" aria-hidden="true">${capitulo(i)}</span><span class="ac-nombre">${a.nombre}</span><span class="ac-estado">${abierta ? estado : 'En preparación'}</span>`;
  const puerta = abierta
    ? `<a class="ac-puerta" href="${hrefAsignatura(a.id)}" data-entrar aria-label="${a.nombre}: ${estado}. Entrar">${cuerpo}</a>`
    : `<div class="ac-puerta" aria-disabled="true" role="group" aria-label="${a.nombre}: todavía sin contenido">${cuerpo}</div>`;
  const continuar = abierta && ultimo ? `<a class="ac-continuar" href="${ultimo.href}">Continuar: <b>${ultimo.titulo}</b> →</a>` : '';
  return `<li class="ac-mundo ${abierta ? 'abierta' : 'pendiente'}" style="--c:${a.color};--i:${i}">${puerta}${temas || continuar ? `<div class="ac-detalle">${temas}${continuar}</div>` : ''}</li>`;
}

/** Panel de la isla elegida: sus temas, uno por línea, según sus datos (nada inventado). */
function resumenMundo(a: Asignatura): string {
  if (!disponible(a)) return '<p class="ac-foco-vacio">Todavía sin contenido: aparecerá aquí cuando se registren sus temas.</p>';
  return `<ul class="ac-foco-temas">${a.temas.map((t) => `<li><span class="ac-foco-n" aria-label="Tema ${t.numero}">T${t.numero}</span><span class="ac-foco-t">${t.titulo}</span><span class="ac-foco-x">${NOMBRE_EXPERIENCIA[t.experiencia]}</span></li>`).join('')}</ul>`;
}

const CHEVRON = (d: string) => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${d}"/></svg>`;
/** Iconos de línea de la cabecera (mismo trazo que los chevrones). */
const ICONO_CAB = {
  temario: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 6h3M10 6h10M4 12h3M10 12h10M4 18h3M10 18h7"/></svg>',
  ajustes: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/></svg>',
  perfil: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c1.2-3.6 3.8-5.4 7-5.4s5.8 1.8 7 5.4"/></svg>',
};
/** Número de capítulo a dos dígitos ("01"–"06"). */
const capitulo = (i: number) => String(i + 1).padStart(2, '0');

export function pintarAcademia(ctx: ContextoVista, ultimo: Readonly<Record<string, UltimoSitio>> = {}): () => void {
  const abiertas = ASIGNATURAS.filter(disponible).length;
  const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
  ctx.pagina.innerHTML = `<div class="academia" data-academia>
  <div class="ac-fondo" aria-hidden="true"><i class="ac-orbita o1"></i><i class="ac-orbita o2"></i><i class="ac-orbita o3"></i></div>
  <div class="ac-escena" data-ac-escena aria-hidden="true"></div>
  <header class="ac-top" data-ac-top hidden>
    <a class="ac-logo" href="#academia" aria-label="Financial Academy: selector de mundos"><span class="ac-logo-txt"><b>Financial</b><b>Academy</b></span><span class="ac-logo-sub">Ciclo de Administración y Finanzas</span></a>
    <nav class="ac-accesos" aria-label="Accesos">
      <button type="button" class="ac-acceso" data-ac-temario>${ICONO_CAB.temario}<span>Temario</span></button>
      <span class="ac-ajustes-caja">
        <button type="button" class="ac-acceso" data-ac-ajustes aria-expanded="false" aria-controls="ac-ajustes">${ICONO_CAB.ajustes}<span>Ajustes</span></button>
        <span class="ac-ajustes" id="ac-ajustes" data-ac-ajustes-panel role="group" aria-label="Ajustes" hidden>
          <span class="ac-rotulo">Ajustes</span>
          <button type="button" class="ac-ajuste" data-ac-intro>Ver la intro<small>El barco y la llegada al selector</small></button>
          <button type="button" class="ac-ajuste" data-ac-temario>Abrir el temario<small>Todas las secciones, sin pasar por el 3D</small></button>
          <span class="ac-ajuste-info"><span>Movimiento</span><b>${reducido ? 'Reducido' : 'Completo'}</b><small>Sigue la preferencia de tu sistema</small></span>
        </span>
      </span>
      <a class="ac-acceso" href="${hrefProgreso()}">${ICONO_CAB.perfil}<span>Mi progreso</span></a>
    </nav>
  </header>
  <header class="ac-cab">
    <p class="ac-ante">Financial Academy</p>
    <h1>Elige un mundo</h1>
    <p class="ac-lema"><span>Ciclo de Administración y Finanzas</span><span class="ac-cifras">${ASIGNATURAS.length} asignaturas · ${abiertas} ${abiertas === 1 ? 'abierta' : 'abiertas'}</span></p>
    <p class="ac-cuenta" aria-hidden="true"><span><b>${String(ASIGNATURAS.length).padStart(2, '0')}</b> mundos</span><span><b>${String(abiertas).padStart(2, '0')}</b> ${abiertas === 1 ? 'abierto' : 'abiertos'}</span></p>
  </header>
  <ul class="ac-mundos" aria-label="Asignaturas">${ASIGNATURAS.map((a, i) => mundo(a, i, ultimo[a.id] ?? null)).join('')}</ul>
  <section class="ac-foco" data-ac-foco aria-live="polite" hidden></section>
  <nav class="ac-nav" data-ac-nav aria-label="Cambiar de mundo" hidden>
    <button type="button" class="ac-flecha" data-ac-paso="-1" aria-label="Mundo anterior">${CHEVRON('M14.5 5.5 8 12l6.5 6.5')}</button>
    <span class="ac-contador" aria-hidden="true"><b data-ac-actual>01</b></span>
    <span class="ac-puntos">${ASIGNATURAS.map((a, i) => `<button type="button" class="ac-punto" data-ac-ir="${i}" aria-label="${a.nombre}" style="--c:${a.color}"></button>`).join('')}</span>
    <span class="ac-contador ac-total" aria-hidden="true">${capitulo(ASIGNATURAS.length - 1)}</span>
    <button type="button" class="ac-flecha" data-ac-paso="1" aria-label="Mundo siguiente">${CHEVRON('M9.5 5.5 16 12l-6.5 6.5')}</button>
  </nav>
</div>`;
  ctx.tituloMovil.textContent = 'Financial Academy';

  const raiz = ctx.pagina.querySelector<HTMLElement>('[data-academia]')!;
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
      ? `<a class="ac-entrar" href="${hrefAsignatura(a.id)}" data-ac-entrar="${elegida}"><span>Entrar</span><span class="ac-entrar-num" aria-hidden="true">${capitulo(elegida)}</span></a>`
      : `<span class="ac-cerrada">En preparación</span>`;
    const sigue = disponible(a) && ultimo[a.id] ? `<a class="ac-continuar" href="${ultimo[a.id]!.href}">Seguir donde lo dejaste: <b>${ultimo[a.id]!.titulo}</b></a>` : '';
    foco.style.setProperty('--c', a.color);
    // El acento de toda la pantalla lo pone la asignatura elegida.
    raiz.style.setProperty('--acento', a.color);
    foco.innerHTML = `<div class="ac-cap">${medallonAsignatura(a, 'ac-foco-sello')}<span class="ac-cap-num" aria-hidden="true">${capitulo(elegida)}</span><p class="ac-rotulo">Capítulo ${capitulo(elegida)} · Asignatura</p><i class="ac-filete" aria-hidden="true"></i><h2>${a.nombre}</h2></div><div class="ac-cap-cuerpo">${resumenMundo(a)}<div class="ac-foco-acciones">${accion}${sigue}</div></div>`;
    raiz.querySelector<HTMLElement>('[data-ac-actual]')!.textContent = capitulo(elegida);
    raiz.querySelectorAll<HTMLElement>('.ac-punto').forEach((p, i) => p.setAttribute('aria-current', String(i === elegida)));
    raiz.querySelectorAll<HTMLElement>('.ac-mundo').forEach((m, i) => {
      m.classList.toggle('elegida', i === elegida);
      // Los capítulos lejanos se rotulan solo con número y nombre (sin guía ni estado): no se pisan.
      m.classList.toggle('lejana', Math.abs(i - elegida) > 1);
    });
    raiz.querySelector<HTMLButtonElement>('[data-ac-paso="-1"]')!.disabled = elegida === 0;
    raiz.querySelector<HTMLButtonElement>('[data-ac-paso="1"]')!.disabled = elegida === ASIGNATURAS.length - 1;
  };
  const botonAjustes = raiz.querySelector<HTMLButtonElement>('[data-ac-ajustes]')!;
  const panelAjustes = raiz.querySelector<HTMLElement>('[data-ac-ajustes-panel]')!;
  const cerrarAjustes = () => {
    panelAjustes.hidden = true;
    botonAjustes.setAttribute('aria-expanded', 'false');
  };
  const alternarAjustes = () => {
    panelAjustes.hidden = !panelAjustes.hidden;
    botonAjustes.setAttribute('aria-expanded', String(!panelAjustes.hidden));
  };
  const fueraDeAjustes = (e: PointerEvent) => {
    if (!panelAjustes.hidden && !(e.target as Element).closest('.ac-ajustes-caja')) cerrarAjustes();
  };
  document.addEventListener('pointerdown', fueraDeAjustes);
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
    if (destino.closest('[data-ac-intro]')) {
      cerrarAjustes();
      return lanzarIntro();
    }
    if (destino.closest('[data-ac-temario]')) {
      cerrarAjustes();
      return document.querySelector<HTMLButtonElement>('#mb')?.click();
    }
    if (destino.closest('[data-ac-ajustes]')) return alternarAjustes();
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
    if (e.key === 'Escape' && !panelAjustes.hidden) {
      cerrarAjustes();
      return botonAjustes.focus();
    }
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
                if (!el) return;
                // El rótulo nunca se sale de la pantalla: se ciñe a los márgenes de la escena.
                const medio = el.offsetWidth / 2;
                const ancho = raiz.clientWidth;
                // Fuera de la escena (mundos lejanos del carrusel), el rótulo no se muestra.
                el.classList.toggle('fuera', p.x < 0 || p.x > ancho);
                const x = Math.min(ancho - medio - 12, Math.max(medio + 12, p.x));
                el.style.transform = `translate(${x.toFixed(1)}px, ${p.y.toFixed(1)}px) translate(-50%, 0) scale(${Math.min(1, 0.55 + p.escala * 0.4).toFixed(3)})`;
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
          // En 3D la cabecera es parte de la escena: sustituye a la barra común.
          raiz.querySelector<HTMLElement>('[data-ac-top]')!.hidden = false;
          document.body.classList.add('ac-cabecera-escena');
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
    document.removeEventListener('pointerdown', fueraDeAjustes);
    document.body.classList.remove('ac-cabecera-escena');
    limpiarPendiente();
    clearTimeout(temporizadorRevela);
    cancelarIntro?.();
    escena?.destruir();
    escena = null;
  };
}
