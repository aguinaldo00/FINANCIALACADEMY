// @vitest-environment happy-dom
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { conectarMiniaturas, type FuenteExpandible, miniaturaHtml } from '../../src/ui/components/reproductorExpandido.ts';
import { ESCENAS } from '../../src/ui/escenas/index.ts';

const FUENTES: Record<string, FuenteExpandible> = {
  video: { tipo: 'video', archivos: [{ src: 'video.webm', tipo: 'video/webm' }, { src: 'video.mp4', tipo: 'video/mp4' }], titulo: 'El sistema financiero español', volanta: 'Capítulo I · Vídeo', duracion: 72, fotogramaMiniatura: 9 },
  escena: { tipo: 'escena', escena: ESCENAS['simple-intereses']!, volanta: 'Capítulo II · Fórmula 1' },
};

let parar: () => void = () => {};

function montar(): HTMLElement {
  document.body.innerHTML = `<main id="pagina">${miniaturaHtml('video', FUENTES.video!)}${miniaturaHtml('escena', FUENTES.escena!)}</main>`;
  const pagina = document.querySelector<HTMLElement>('#pagina')!;
  parar = conectarMiniaturas(pagina, FUENTES);
  return pagina;
}
const capa = () => document.querySelector<HTMLElement>('.vx-capa');
const escape = () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
/** El cierre es la transición inversa: termina cuando acaba la animación. */
const cerrado = () => vi.waitFor(() => expect(capa()).toBeNull());

beforeAll(() => {
  globalThis.IntersectionObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof IntersectionObserver;
  HTMLMediaElement.prototype.play = function () { return Promise.resolve(); };
  HTMLMediaElement.prototype.pause = function () {};
});
afterEach(() => parar());

describe('reproductor con expansión cinematográfica', () => {
  it('cada miniatura es un botón con su medio real: el <video> o la animación congelada', () => {
    montar();
    const video = document.querySelector<HTMLButtonElement>('[data-expandir="video"]')!;
    expect(video.tagName).toBe('BUTTON');
    expect(video.getAttribute('aria-haspopup')).toBe('dialog');
    expect([...video.querySelectorAll('video source')].map((s) => s.getAttribute('src'))).toEqual(['video.webm', 'video.mp4']);
    expect(video.textContent).toContain('1:12');
    expect(document.querySelector('[data-expandir="escena"] .mo-svg')).not.toBeNull();
  });

  it('el vídeo viaja de la miniatura al reproductor (un diálogo modal) y vuelve al cerrar', async () => {
    const pagina = montar();
    const boton = document.querySelector<HTMLButtonElement>('[data-expandir="video"]')!;
    const video = boton.querySelector('video')!;
    boton.click();
    const dialogo = capa()!;
    expect(dialogo.getAttribute('role')).toBe('dialog');
    expect(dialogo.getAttribute('aria-modal')).toBe('true');
    expect(dialogo.querySelector('#vx-titulo')!.textContent).toBe('El sistema financiero español');
    // Es el mismo elemento <video>, no una imagen que lo sustituya.
    expect(dialogo.querySelector('.vx-marco video')).toBe(video);
    expect(boton.querySelector('video')).toBeNull();
    expect(boton.classList.contains('vx-en-viaje')).toBe(true);
    expect(pagina.inert).toBe(true);
    // Controles claros: reproducir/pausar, posición, tiempo y cerrar.
    expect(document.activeElement).toBe(dialogo.querySelector('[data-vx-play]'));
    expect(dialogo.querySelector('[data-vx-barra]')!.getAttribute('aria-label')).toBe('Posición del vídeo');
    expect(dialogo.querySelector('[data-vx-tiempo]')!.textContent).toContain('1:12');
    expect(dialogo.querySelectorAll('[data-vx-cerrar]').length).toBeGreaterThan(0);
    escape();
    await cerrado();
    expect(boton.querySelector('video')).toBe(video);
    expect(boton.classList.contains('vx-en-viaje')).toBe(false);
    expect(pagina.inert).toBe(false);
    expect(document.activeElement).toBe(boton);
  });

  it('el botón Cerrar y el fondo también cierran', async () => {
    montar();
    const boton = document.querySelector<HTMLButtonElement>('[data-expandir="video"]')!;
    boton.click();
    capa()!.querySelector<HTMLButtonElement>('.vx-cerrar')!.click();
    await cerrado();
    boton.click();
    capa()!.querySelector<HTMLElement>('.vx-fondo')!.click();
    await cerrado();
  });

  it('una animación del motor se abre con su propio reproductor (capítulos y subtítulos)', async () => {
    montar();
    document.querySelector<HTMLButtonElement>('[data-expandir="escena"]')!.click();
    const dialogo = capa()!;
    expect(dialogo.classList.contains('vx-capa-escena')).toBe(true);
    expect(dialogo.querySelector('.mo .mo-marco .mo-svg')).not.toBeNull();
    expect(dialogo.querySelectorAll('.mo-caps li').length).toBe(ESCENAS['simple-intereses']!.capitulos.length);
    expect(document.activeElement).toBe(dialogo.querySelector('[data-mo-play]'));
    escape();
    await cerrado();
  });

  it('al salir de la pantalla con el reproductor abierto, se cierra sin dejar nada inerte', () => {
    const pagina = montar();
    document.querySelector<HTMLButtonElement>('[data-expandir="escena"]')!.click();
    expect(capa()).not.toBeNull();
    parar();
    expect(capa()).toBeNull();
    expect(pagina.inert).toBe(false);
  });
});
