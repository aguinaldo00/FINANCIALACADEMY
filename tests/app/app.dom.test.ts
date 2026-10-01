// @vitest-environment happy-dom
import { beforeAll, describe, expect, it } from 'vitest';
import { iniciarApp } from '../../src/app/app.ts';
import { tema01 } from '../../src/content/temas/tema-01/index.ts';
import { CLAVE_PROGRESO } from '../../src/persistence/progressRepository.ts';

const LEGACY = JSON.stringify({ dom: { fgd: 1 }, tries: {} });
const $ = <T extends Element = HTMLElement>(s: string, raiz: ParentNode = document) => raiz.querySelector<T>(s)!;
const $$ = (s: string, raiz: ParentNode = document) => [...raiz.querySelectorAll<HTMLElement>(s)];

function navegar(hash: string): void {
  location.hash = hash;
  dispatchEvent(new HashChangeEvent('hashchange'));
}

beforeAll(() => {
  globalThis.IntersectionObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof IntersectionObserver;
  window.scrollTo = () => {};
  Element.prototype.scrollIntoView = () => {};

  localStorage.clear();
  localStorage.setItem('cdd-t1', LEGACY);
  document.body.innerHTML = `<nav class="rail" id="rail"></nav><main><div class="topbar"><button id="mb">Índice</button><span id="mt">La Ciudad del Dinero</span></div><div class="page" id="page"></div></main>`;
  location.hash = '';
  iniciarApp(tema01);
});

describe('app en el navegador', () => {
  it('pinta la portada con el progreso migrado de cdd-t1', () => {
    expect($$('.tile')).toHaveLength(12);
    expect($$('.skyline a')).toHaveLength(12);
    expect($$('.ya a')).toHaveLength(3);
    // 4.2A tiene 8 conceptos y fgd está dominado: 1/8 → 13 %.
    const tile = $$('.tile').find((t) => t.getAttribute('href') === '#s/4.2A')!;
    expect(tile.textContent).toContain('dominio 13 %');
    expect($('#mt').textContent).toBe('La Ciudad del Dinero');
  });

  it('abre una sección por hash y marca el índice', () => {
    navegar('#s/4.2A');
    expect($$('.cc')).toHaveLength(8);
    expect($('#mt').textContent).toBe('4.2A · Intermediarios bancarios');
    expect($('.sl.on').getAttribute('href')).toBe('#s/4.2A');
    expect($('.pager a:last-child').getAttribute('href')).toBe('#s/4.2B');
  });

  it('"Explícamelo de otra forma" recorre los 5 modos y el tercero es esquema', () => {
    const ficha = $('#c-fgd');
    const boton = $<HTMLButtonElement>('.ab.o', ficha);
    const panel = $('.pn.o', ficha);
    boton.click();
    expect(panel.hidden).toBe(false);
    expect(boton.textContent).toBe('🔄 Otra forma (1/5)');
    expect($('.md b', panel).textContent).toBe(tema01.modos[0]!.etiqueta);
    boton.click();
    boton.click();
    expect(boton.textContent).toBe('🔄 Otra forma (3/5)');
    expect($('.esq', panel).textContent).toBe(tema01.conceptos.find((c) => c.id === 'fgd')!.explicaciones[2]);
    boton.click();
    boton.click();
    boton.click();
    expect(boton.textContent).toBe('🔄 Otra forma (1/5)');
  });

  it('"Trampa de examen" se abre y se cierra', () => {
    const ficha = $('#c-fgd');
    const boton = $<HTMLButtonElement>('.ab.t', ficha);
    boton.click();
    expect($('.pn.t', ficha).hidden).toBe(false);
    expect(boton.getAttribute('aria-expanded')).toBe('true');
    boton.click();
    expect($('.pn.t', ficha).hidden).toBe(true);
  });

  it('"Compruébalo": fallar y luego acertar da 50 % y se guarda en el nuevo formato', () => {
    const ficha = $('#c-cajas');
    $<HTMLButtonElement>('.ab.q', ficha).click();
    const opciones = $$('.opt', ficha) as HTMLButtonElement[];
    const correcta = tema01.conceptos.find((c) => c.id === 'cajas')!.pregunta.indiceCorrecta;
    const mala = opciones.find((_, i) => i !== correcta)!;
    mala.click();
    expect(mala.classList.contains('no')).toBe(true);
    expect(JSON.parse(localStorage.getItem(CLAVE_PROGRESO) ?? 'null')).toBeNull();

    opciones[correcta]!.click();
    expect(opciones[correcta]!.classList.contains('ok')).toBe(true);
    expect(opciones.every((o) => o.disabled)).toBe(true);
    expect($('.dm', ficha).textContent).toBe('Dominio 50 %');

    const guardado = JSON.parse(localStorage.getItem(CLAVE_PROGRESO)!);
    expect(guardado.temas['1'].dominio).toEqual({ fgd: 1, cajas: 0.5 });
    expect(localStorage.getItem('cdd-t1')).toBe(LEGACY);
    // El índice lateral se repinta con el nuevo dominio de la sección (1,5/8 → barra al 18,75 %).
    expect($('.sl.on .bar i').getAttribute('style')).toContain('width:18.75%');
  });

  it('#c/<id> abre la sección del concepto y lo muestra', () => {
    navegar('#c/bce');
    expect($('[data-sec]').dataset.sec).toBe('4.1');
    expect($('#c-bce').classList.contains('in')).toBe(true);
  });

  it('un id desconocido vuelve a la portada', () => {
    navegar('#s/zzz');
    expect($$('.tile')).toHaveLength(12);
    expect($$('.sl.on')).toHaveLength(0);
  });
});
