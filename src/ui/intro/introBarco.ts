import type { EscenaIntroBarco } from '../../scene/three/introBarcoScene.ts';
import urlBarco from '../../assets/intro/barco.webp';
import urlCielo from '../../assets/intro/cielo-tormenta.webp';

/*
 * Intro oficial de Financial Academy: el barco cruza la tormenta hacia la luz y, en el blanco del
 * resplandor, aparece debajo el selector de mundos. Solo se reproduce sola la primera vez; luego,
 * con "Ver intro". Se salta con el botón o con Escape (la transición se abrevia, no se corta).
 * Con movimiento reducido no se reproduce sola y, si se pide, es una imagen fija con un fundido.
 * La escena 3D se carga aparte: si tarda o falla, la intro se retira y queda el selector.
 */

export const CLAVE_INTRO_BARCO = 'financial-academy:intro-barco';

/** ¿Toca la intro al entrar? Solo la primera vez (y nunca con movimiento reducido). */
export function introBarcoPendiente(reducido: boolean): boolean {
  if (reducido) return false;
  try {
    return localStorage.getItem(CLAVE_INTRO_BARCO) === null;
  } catch {
    return false;
  }
}

function marcarVista(): void {
  try {
    localStorage.setItem(CLAVE_INTRO_BARCO, 'vista');
  } catch {
    /* sin almacenamiento: se volvería a ver, pero no rompe nada */
  }
}

export interface OpcionesIntroBarcoUi {
  reducido: boolean;
  /** Se resuelve cuando el selector está listo debajo (true si es el 3D). */
  selectorListo: Promise<boolean>;
  /** La luz cubre la pantalla: el selector empieza a revelarse. */
  alRevelar: () => void;
  /** La capa se ha retirado. */
  alTerminar: (saltada: boolean) => void;
}

/** Espera máxima por la escena del barco antes de rendirse y mostrar el selector. */
const ESPERA_CARGA = 4500;
/** Espera máxima por el selector, ya deslumbrados. */
const ESPERA_SELECTOR = 2500;
/** Duración del fundido de la luz al selector (coincide con el CSS). */
const FUNDIDO = 1500;

const calidad = (): 'alta' | 'baja' => {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const pocos = (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4;
  return pocos || matchMedia('(max-width: 700px)').matches ? 'baja' : 'alta';
};

/** Reproduce la intro sobre la página. Devuelve una función que la cancela (al salir de la vista). */
export function reproducirIntroBarco(o: OpcionesIntroBarcoUi): () => void {
  marcarVista();
  const capa = document.createElement('div');
  capa.className = `intro-barco${o.reducido ? ' ib-fija' : ''}`;
  capa.setAttribute('role', 'dialog');
  capa.setAttribute('aria-label', 'Introducción de Financial Academy');
  capa.innerHTML = `<div class="ib-escena" aria-hidden="true">${o.reducido ? `<img class="ib-img-cielo" src="${urlCielo}" alt=""><img class="ib-img-barco" src="${urlBarco}" alt="">` : ''}</div>
<div class="ib-luz" aria-hidden="true"></div>
<div class="ib-titulo"><p class="ib-ante">Ciclo de Administración y Finanzas</p><h1>Financial Academy</h1></div>
<button type="button" class="ib-saltar">Saltar intro <span aria-hidden="true">›</span></button>`;
  document.body.append(capa);
  document.body.classList.add('intro-barco-activa');
  const contenedor = capa.querySelector<HTMLElement>('.ib-escena')!;
  const luzEl = capa.querySelector<HTMLElement>('.ib-luz')!;

  let escena: EscenaIntroBarco | null = null;
  let terminada = false;
  let revelando = false;
  let saltada = false;
  const tiempos: number[] = [];

  const terminar = () => {
    if (terminada) return;
    terminada = true;
    for (const t of tiempos) clearTimeout(t);
    document.removeEventListener('keydown', alTeclado);
    escena?.destruir();
    escena = null;
    capa.remove();
    document.body.classList.remove('intro-barco-activa');
    o.alTerminar(saltada);
  };

  // La luz ya lo cubre: debajo aparece el selector y la capa se funde.
  const revelar = () => {
    if (revelando || terminada) return;
    revelando = true;
    // Si la luz aún no lo cubría (salto o fallo de carga), se enciende en medio segundo, sin destello.
    capa.classList.add('ib-blanco');
    let hecho = false;
    let listo = false;
    let encendida = false;
    const seguir = () => {
      if (hecho || terminada || !listo || !encendida) return;
      hecho = true;
      capa.classList.add('ib-revela');
      o.alRevelar();
      tiempos.push(window.setTimeout(terminar, FUNDIDO));
    };
    const alListo = () => {
      listo = true;
      seguir();
    };
    void o.selectorListo.then(alListo, alListo);
    tiempos.push(window.setTimeout(alListo, ESPERA_SELECTOR));
    tiempos.push(
      window.setTimeout(() => {
        encendida = true;
        seguir();
      }, 480),
    );
  };

  const saltar = () => {
    saltada = true;
    if (escena) escena.saltar();
    else revelar();
  };
  const alTeclado = (e: KeyboardEvent) => {
    if (e.key === 'Escape') saltar();
  };
  document.addEventListener('keydown', alTeclado);
  capa.querySelector('.ib-saltar')!.addEventListener('click', saltar);

  if (o.reducido) {
    // Imagen fija: el título y, al poco, un fundido de luz al selector. Sin movimiento.
    capa.classList.add('en-marcha');
    tiempos.push(window.setTimeout(revelar, 2600));
    return terminar;
  }

  tiempos.push(
    window.setTimeout(() => {
      if (!escena) revelar();
    }, ESPERA_CARGA),
  );
  void import('../../scene/three/introBarcoScene.ts')
    .then(async ({ EscenaIntroBarco }) => {
      if (terminada || revelando) return;
      const nueva = new EscenaIntroBarco({
        calidad: calidad(),
        alFotograma: (sol, luz, t) => {
          capa.dataset.t = t.toFixed(1);
          luzEl.style.setProperty('--sx', `${(sol.x * 100).toFixed(1)}%`);
          luzEl.style.setProperty('--sy', `${(sol.y * 100).toFixed(1)}%`);
          luzEl.style.setProperty('--a', Math.min(1, luz * 1.25).toFixed(3));
          luzEl.style.setProperty('--r', `${(18 + luz * luz * 160).toFixed(1)}vmax`);
          luzEl.style.setProperty('--b', Math.max(0, (luz - 0.8) / 0.2).toFixed(3));
        },
        alDeslumbrar: revelar,
      });
      try {
        await nueva.montarEn(contenedor);
      } catch (error) {
        nueva.destruir();
        throw error;
      }
      if (terminada || revelando) return nueva.destruir();
      escena = nueva;
      capa.classList.add('en-marcha');
      if (saltada) nueva.saltar();
    })
    .catch((error) => {
      console.error('No se pudo iniciar la intro del barco', error);
      revelar();
    });

  return terminar;
}
