import { hrefConcepto } from '../../app/router.ts';
import type { EstadoEstudio } from '../../app/store.ts';
import { historiaDeConcepto } from '../../experiences/registry.ts';
import { type AlmacenClaveValor, escribirJson, leerJson } from '../../persistence/storage.ts';
import type { DatosSeleccionables } from '../../scene/three/builders.ts';
import type { Mundo3D } from '../../scene/three/cityScene.ts';
import { webglDisponible } from '../../scene/webgl.ts';
import { vistaAtlas } from '../../world/atlas.ts';
import { type ModeloCiudad, modeloCiudad } from '../../world/cityModel.ts';
import {
  buscarBarrio,
  buscarEdificio,
  buscarZona,
  cadenaFoco,
  codificarFoco,
  decodificarFoco,
  FOCO_CIUDAD,
  type Foco,
  focoPadre,
  focoValido,
  igualFoco,
} from '../../world/focus.ts';
import { colorDominio } from '../format.ts';
import { alCambiarMovimiento, movimientoReducido } from '../motion.ts';
import { atlasHtml, barraMundo, esqueletoMundo, historiaHtml, type Miga, TEXTO_FASE } from './worldPanel.ts';

/** Preferencia de vista de cada usuario (comodidad local, no es progreso). */
export const CLAVE_VISTA = 'financial-academy:vista';

/**
 * Orquesta el mundo de la portada: un único foco compartido por la cámara 3D, las etiquetas
 * flotantes y el Atlas HTML. El renderer Three.js se carga bajo demanda y se reutiliza entre
 * visitas a la portada; si no hay WebGL, el Atlas y la ciudad 2D siguen funcionando.
 */
export class ControladorMundo {
  private foco: Foco = FOCO_CIUDAD;
  private vistaAtlas = false;
  private modo3d: boolean;
  private disponible3d: boolean | null = null;
  private mundo: Mundo3D | null = null;
  private modelo: ModeloCiudad;
  private raiz: HTMLElement | null = null;
  private pasoHistoria = 0;
  private reducido = movimientoReducido();
  private etiquetas: { foco: Foco; el: HTMLElement }[] = [];

  constructor(
    private readonly estado: EstadoEstudio,
    private readonly almacen: AlmacenClaveValor | null,
  ) {
    this.modo3d = leerJson(almacen, CLAVE_VISTA) !== '2d';
    this.modelo = modeloCiudad(estado.tema, estado.progreso);
    alCambiarMovimiento((reducido) => {
      this.reducido = reducido;
      if (this.mundo) this.mundo.movimientoReducido = reducido;
    });
  }

  /** Recuerda el último lugar visitado para volver a él al regresar al mapa. */
  recordar(foco: Foco): void {
    if (!igualFoco(foco, this.foco)) this.pasoHistoria = 0;
    this.foco = foco;
  }

  montar(raiz: HTMLElement): void {
    this.raiz = raiz;
    this.modelo = modeloCiudad(this.estado.tema, this.estado.progreso);
    if (!focoValido(this.modelo, this.foco)) this.foco = FOCO_CIUDAD;
    raiz.innerHTML = esqueletoMundo();
    raiz.addEventListener('click', (e) => this.alPulsar(e));
    raiz.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.subir()) e.preventDefault();
    });
    this.pintarPanel();
    void this.prepararVista();
  }

  desmontar(): void {
    this.mundo?.desmontar();
    this.raiz = null;
    this.etiquetas = [];
  }

  /* ------------------------------------------------------------ vista 3D / 2D */

  private async prepararVista(): Promise<void> {
    const raiz = this.raiz;
    if (!raiz) return;
    if (!this.modo3d) return this.mostrar2d('');
    this.disponible3d ??= webglDisponible();
    if (!this.disponible3d) return this.mostrar2d('La vista 3D no está disponible en este navegador: se muestra la ciudad 2D.');

    this.aviso('Cargando la ciudad 3D…');
    let mundo: Mundo3D;
    try {
      if (this.mundo) this.mundo.actualizar(this.modelo);
      else this.mundo = await this.crearMundo();
      mundo = this.mundo;
    } catch (error) {
      console.error('No se pudo iniciar la vista 3D', error);
      this.disponible3d = false;
      if (this.raiz === raiz) this.mostrar2d('No se pudo iniciar la vista 3D: se muestra la ciudad 2D.');
      return;
    }
    // El usuario puede haber salido de la portada o cambiado a 2D mientras cargaba.
    if (this.raiz !== raiz || !this.modo3d) return;

    const vista = this.el('[data-mundo-vista]');
    vista.hidden = false;
    this.alternarCiudad2d(false);
    mundo.lienzo.setAttribute('aria-label', `Maqueta 3D de ${this.estado.tema.meta.ciudad}. El Atlas de abajo ofrece la misma navegación en texto.`);
    mundo.montarEn(vista);
    mundo.enfocar(this.foco, this.vistaAtlas ? 'atlas' : 'maqueta', false);
    this.aviso('');
    this.pintarPanel();
  }

  private async crearMundo(): Promise<Mundo3D> {
    // Three.js va en un fragmento aparte: la portada 2D no lo descarga.
    const { Mundo3D } = await import('../../scene/three/cityScene.ts');
    return new Mundo3D(this.modelo, {
      movimientoReducido: this.reducido,
      alSeleccionar: (s) => this.alSeleccionar(s),
      alSobrevolar: (s) => this.alSobrevolar(s),
      alFotograma: () => this.colocarEtiquetas(),
      alPerderContexto: () => {
        this.disponible3d = false;
        this.mundo?.destruir();
        this.mundo = null;
        this.mostrar2d('La vista 3D se ha detenido: se muestra la ciudad 2D.');
      },
    });
  }

  private mostrar2d(mensaje: string): void {
    if (!this.raiz) return;
    this.mundo?.desmontar();
    this.el('[data-mundo-vista]').hidden = true;
    this.alternarCiudad2d(true);
    this.aviso(mensaje);
    this.pintarPanel();
  }

  /** La ciudad pixel art sigue siendo la alternativa 2D: se oculta solo con la 3D funcionando. */
  private alternarCiudad2d(visible: boolean): void {
    const pagina = this.raiz?.parentElement;
    for (const el of pagina?.querySelectorAll<HTMLElement>('.skyline, .legend') ?? []) el.hidden = !visible;
  }

  private aviso(texto: string): void {
    const el = this.raiz?.querySelector<HTMLElement>('[data-mundo-aviso]');
    if (el) {
      el.textContent = texto;
      el.hidden = !texto;
    }
  }

  private get activo3d(): boolean {
    return Boolean(this.mundo && this.modo3d && this.disponible3d && this.raiz);
  }

  /* ------------------------------------------------------------ navegación */

  private enfocar(foco: Foco): void {
    if (!igualFoco(foco, this.foco)) this.pasoHistoria = 0;
    this.foco = foco;
    this.pintarPanel();
    if (this.activo3d) this.mundo!.enfocar(foco, this.vistaAtlas ? 'atlas' : 'maqueta', true);
  }

  private subir(): boolean {
    const padre = focoPadre(this.modelo, this.foco);
    if (!padre) return false;
    this.enfocar(padre);
    return true;
  }

  private alSeleccionar(s: DatosSeleccionables): void {
    if (s.tipo === 'edificio') {
      const foco: Foco = { nivel: 'edificio', conceptoId: s.conceptoId };
      // Segundo toque sobre el edificio ya enfocado: entrar al concepto.
      if (igualFoco(foco, this.foco)) location.hash = hrefConcepto(s.conceptoId);
      else this.enfocar(foco);
    } else {
      this.enfocar({ nivel: 'zona', seccionId: s.seccionId });
    }
  }

  private alSobrevolar(s: DatosSeleccionables | null): void {
    const el = this.raiz?.querySelector<HTMLElement>('[data-mundo-sobre]');
    if (!el) return;
    let texto = '';
    if (s?.tipo === 'edificio') {
      const e = buscarEdificio(this.modelo, s.conceptoId);
      if (e) texto = `${e.nombre} · ${TEXTO_FASE[e.fase]}`;
    } else if (s?.tipo === 'zona') {
      const z = buscarZona(this.modelo, s.seccionId);
      if (z) texto = `${z.seccionId} ${z.titulo} · ${z.pesoExamen} % del examen`;
    }
    el.textContent = texto;
    el.hidden = !texto;
  }

  private alPulsar(e: Event): void {
    const objetivo = (e.target as Element).closest<HTMLButtonElement>('button');
    if (!objetivo || objetivo.disabled) return;
    const { dataset } = objetivo;
    if (dataset.foco) {
      const foco = decodificarFoco(this.modelo, dataset.foco);
      if (foco) this.enfocar(foco);
    } else if ('mundoSubir' in dataset) {
      this.subir();
    } else if ('mundoAtlas' in dataset) {
      this.vistaAtlas = !this.vistaAtlas;
      this.pintarPanel();
      if (this.activo3d) this.mundo!.enfocar(this.foco, this.vistaAtlas ? 'atlas' : 'maqueta', true);
    } else if ('mundoModo' in dataset) {
      this.modo3d = !this.modo3d;
      escribirJson(this.almacen, CLAVE_VISTA, this.modo3d ? '3d' : '2d');
      if (this.modo3d) void this.prepararVista();
      else this.mostrar2d('');
    } else if (dataset.historia) {
      this.pasoHistoria = Math.max(0, this.pasoHistoria + Number(dataset.historia));
      this.pintarPanel();
      this.raiz?.querySelector<HTMLButtonElement>(`[data-historia="${dataset.historia}"]:not(:disabled)`)?.focus();
    }
  }

  /* ------------------------------------------------------------ pintado */

  private etiquetaFoco(f: Foco): string {
    switch (f.nivel) {
      case 'ciudad':
        return this.estado.tema.meta.ciudad;
      case 'barrio':
        return buscarBarrio(this.modelo, f.grupoId)?.titulo ?? '';
      case 'zona': {
        const z = buscarZona(this.modelo, f.seccionId);
        return z ? `${z.seccionId} ${z.titulo}` : '';
      }
      case 'edificio':
        return buscarEdificio(this.modelo, f.conceptoId)?.nombre ?? '';
    }
  }

  private pintarPanel(): void {
    if (!this.raiz) return;
    const migas: Miga[] = cadenaFoco(this.modelo, this.foco).map((foco) => ({ foco, etiqueta: this.etiquetaFoco(foco) }));
    this.el('[data-mundo-barra]').innerHTML = barraMundo({
      migas,
      puedeSubir: this.foco.nivel !== 'ciudad',
      modo3d: this.modo3d,
      disponible3d: this.disponible3d,
      vistaAtlas: this.vistaAtlas,
    });

    let historia = '';
    if (this.foco.nivel === 'edificio') {
      const h = historiaDeConcepto(this.estado.tema, this.foco.conceptoId);
      if (h) {
        this.pasoHistoria = Math.min(this.pasoHistoria, h.pasos.length - 1);
        historia = historiaHtml(h, this.estado.tema.modos, this.pasoHistoria);
      }
    }
    this.el('[data-atlas]').innerHTML = atlasHtml(vistaAtlas(this.modelo, this.foco), historia);
    this.pintarEtiquetas();
  }

  /** Etiquetas flotantes del nivel actual: zonas en la ciudad o el barrio, edificios en una zona. */
  private pintarEtiquetas(): void {
    const capa = this.raiz?.querySelector<HTMLElement>('[data-mundo-etiquetas]');
    if (!capa) return;
    const f = this.foco;
    const focos: Foco[] =
      f.nivel === 'ciudad' ? this.modelo.zonas.map((z) => ({ nivel: 'zona', seccionId: z.seccionId }))
      : f.nivel === 'barrio' ? this.modelo.zonas.filter((z) => z.grupoId === f.grupoId).map((z) => ({ nivel: 'zona', seccionId: z.seccionId }))
      : f.nivel === 'zona' ? this.modelo.edificios.filter((e) => e.seccionId === f.seccionId).map((e) => ({ nivel: 'edificio', conceptoId: e.conceptoId }))
      : [f];

    capa.innerHTML = '';
    this.etiquetas = focos.map((foco) => {
      const el = document.createElement('button');
      el.type = 'button';
      el.tabIndex = -1;
      el.className = 'm-etq';
      el.dataset.foco = codificarFoco(foco);
      if (foco.nivel === 'zona') {
        const z = buscarZona(this.modelo, foco.seccionId)!;
        el.style.setProperty('--c', z.dominio > 0 ? colorDominio(z.dominio) : '#9b958b');
        const titulo = f.nivel === 'barrio' ? ` ${z.titulo}` : '';
        el.innerHTML = `${z.prioridad ? '📌 ' : ''}<b>${z.seccionId}</b>${titulo}<small>${z.pesoExamen} %</small>`;
      } else if (foco.nivel === 'edificio') {
        const e = buscarEdificio(this.modelo, foco.conceptoId)!;
        el.style.setProperty('--c', e.dominio > 0 ? colorDominio(e.dominio) : '#9b958b');
        el.textContent = e.nombre;
      }
      capa.append(el);
      return { foco, el };
    });
    this.colocarEtiquetas();
  }

  private colocarEtiquetas(): void {
    if (!this.activo3d) return;
    for (const { foco, el } of this.etiquetas) {
      const p = this.mundo!.proyectarFoco(foco);
      el.hidden = !p.visible;
      el.style.transform = `translate(-50%, -100%) translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px)`;
    }
  }

  private el(selector: string): HTMLElement {
    return this.raiz!.querySelector<HTMLElement>(selector)!;
  }
}
