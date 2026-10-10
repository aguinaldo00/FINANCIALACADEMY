// @vitest-environment happy-dom
import { beforeAll, describe, expect, it } from 'vitest';
import { iniciarApp } from '../../src/app/app.ts';
import { ASIGNATURAS, disponible, ID_GESTION_FINANCIERA } from '../../src/content/academia.ts';
import { TEMAS } from '../../src/content/temas/index.ts';
import { PARTES_LECCION } from '../../src/content/temas/tema-02/index.ts';
import { tema01 } from '../../src/content/temas/tema-01/index.ts';

const $ = <T extends Element = HTMLElement>(s: string, raiz: ParentNode = document) => raiz.querySelector<T>(s)!;
const $$ = (s: string, raiz: ParentNode = document) => [...raiz.querySelectorAll<HTMLElement>(s)];

function navegar(hash: string): void {
  location.hash = hash;
  dispatchEvent(new HashChangeEvent('hashchange'));
}

describe('academia: datos', () => {
  it('seis asignaturas en el orden del ciclo, con ids únicos', () => {
    expect(ASIGNATURAS.map((a) => a.nombre)).toEqual(['Contabilidad', 'Gestión Logística', 'Gestión Financiera', 'Recursos Humanos', 'IPE', 'Simulación Empresarial']);
    expect(new Set(ASIGNATURAS.map((a) => a.id)).size).toBe(6);
  });

  it('la disponibilidad se deriva de los temas registrados (nada declarado a mano)', () => {
    const gf = ASIGNATURAS.find((a) => a.id === ID_GESTION_FINANCIERA)!;
    expect(gf.temas).toBe(TEMAS);
    expect(gf.temas.map((t) => t.experiencia)).toEqual(['ciudad-3d', 'leccion']);
    expect(ASIGNATURAS.filter(disponible).map((a) => a.id)).toEqual([ID_GESTION_FINANCIERA]);
  });
});

describe('academia en el navegador', () => {
  beforeAll(() => {
    globalThis.IntersectionObserver ??= class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof IntersectionObserver;
    window.scrollTo = () => {};
    Element.prototype.scrollIntoView = () => {};
    localStorage.clear();
    document.body.innerHTML = `<nav class="rail" id="rail"></nav><main><div class="topbar"><a class="fa-marca" href="#academia">FA</a><nav class="migas" id="migas" hidden></nav><span id="mt"></span><button id="mb">Temario</button></div><div class="page" id="page"></div></main>`;
    location.hash = '';
    iniciarApp(tema01);
  });

  it('sin hash se entra por el selector de mundos: 6 asignaturas, solo una se abre', () => {
    expect($$('.ac-mundo')).toHaveLength(6);
    expect($$('.ac-mundo a[data-entrar]').map((a) => a.getAttribute('href'))).toEqual(['#a/gestion-financiera']);
    expect($$('.ac-mundo.pendiente')).toHaveLength(5);
    expect($('.ac-mundo.abierta').textContent).toContain('2 temas');
    expect($('#migas').hidden).toBe(true);
    expect(document.body.classList.contains('rail-bajo-demanda')).toBe(true);
  });

  it('las migas llevan de vuelta a la academia y a la asignatura', () => {
    navegar('#s/3.2B');
    expect($$('#migas a').map((a) => a.getAttribute('href'))).toEqual(['#academia', '#a/gestion-financiera', '#inicio']);
    expect(document.body.classList.contains('rail-bajo-demanda')).toBe(false);
    navegar('#tema/2/capitalizacion-compuesta/papel');
    expect($$('#migas a').map((a) => a.textContent)).toEqual(['Academia', 'Gestión Financiera', 'Tema 2']);
  });

  it('el temario llega a cualquier apartado del Tema 1 y a cualquier parte del Tema 2 sin pasar por el 3D', () => {
    navegar('#a/gestion-financiera');
    expect($('[data-mundo]', document)).toBeNull();
    const enlaces = new Set($$('.as-temario a').map((a) => a.getAttribute('href')));
    for (const s of tema01.secciones) expect(enlaces.has(`#s/${s.id}`)).toBe(true);
    for (const c of tema01.conceptos) expect(enlaces.has(`#c/${c.id}`)).toBe(true);
    for (const p of PARTES_LECCION) expect(enlaces.has(`#tema/2/capitalizacion-compuesta/${p.id}`)).toBe(true);
    // Los botones de estudio y examen de siempre siguen ahí.
    expect($$('.as-herramientas a.ab').map((a) => a.getAttribute('href'))).toEqual(['#sesion', '#examen', '#visual', '#simulacro', '#repaso', '#progreso']);
  });

  it('el buscador del temario filtra por número o por nombre', () => {
    navegar('#a/gestion-financiera');
    const campo = $<HTMLInputElement>('[data-tm-buscar]');
    campo.value = '3.2b';
    campo.dispatchEvent(new Event('input'));
    const visibles = $$('.as-temario .tm-n1').filter((a) => !a.closest('li')!.hidden);
    expect(visibles.map((a) => a.querySelector('.tm-id')!.textContent)).toEqual(['3.2B']);
    campo.value = 'simbolos';
    campo.dispatchEvent(new Event('input'));
    expect($$('.as-temario a').filter((a) => !a.closest('li')?.hidden && a.textContent!.includes('Los símbolos'))).toHaveLength(1);
    campo.value = 'zzzz';
    campo.dispatchEvent(new Event('input'));
    expect($('[data-tm-vacio]').hidden).toBe(false);
  });

  it('volver al selector recuerda por dónde ibas en la asignatura', () => {
    navegar('#s/4.1');
    navegar('#academia');
    expect($('.ac-continuar').getAttribute('href')).toBe('#s/4.1');
  });
});
