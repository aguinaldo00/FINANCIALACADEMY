// @vitest-environment happy-dom
import { beforeAll, describe, expect, it } from 'vitest';
import { iniciarApp } from '../../src/app/app.ts';
import { ASIGNATURAS, disponible, ID_GESTION_FINANCIERA } from '../../src/content/academia.ts';
import { TEMAS } from '../../src/content/temas/index.ts';
import { BLOQUES, FORMULAS_TEMA2 } from '../../src/content/temas/tema-02/formulas.ts';
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
    navegar('#tema/2/compuesta/practica');
    expect($$('#migas a').map((a) => a.textContent)).toEqual(['Academia', 'Gestión Financiera', 'Tema 2']);
  });

  it('el temario (en el Sumario) llega a cualquier apartado del Tema 1 y a cualquier parte del Tema 2 sin pasar por el 3D', () => {
    navegar('#a/gestion-financiera');
    expect($('[data-mundo]', document)).toBeNull();
    const enlaces = new Set($$('.ed-sumario a').map((a) => a.getAttribute('href')));
    for (const s of tema01.secciones) expect(enlaces.has(`#s/${s.id}`)).toBe(true);
    for (const c of tema01.conceptos) expect(enlaces.has(`#c/${c.id}`)).toBe(true);
    // Tema 2: cada fórmula del índice y cada fase (B, C, D) de cada bloque.
    for (const f of FORMULAS_TEMA2) expect(enlaces.has(`#tema/2/f/${f.id}`)).toBe(true);
    for (const b of BLOQUES) for (const fase of ['datos', 'elegir', 'practica']) expect(enlaces.has(`#tema/2/${b.id}/${fase}`)).toBe(true);
    // Las herramientas de estudio y examen de siempre siguen ahí (en el Cuaderno de estudio).
    expect($$('.ed-cuaderno a').map((a) => a.getAttribute('href'))).toEqual(['#sesion', '#examen', '#simulacro', '#repaso', '#visual', '#progreso']);
  });

  it('el buscador del temario filtra por número o por nombre', () => {
    navegar('#a/gestion-financiera');
    const campo = $<HTMLInputElement>('[data-tm-buscar]');
    campo.value = '3.2b';
    campo.dispatchEvent(new Event('input'));
    const visibles = $$('.ed-sumario .tm-n1').filter((a) => !a.closest('li')!.hidden);
    expect(visibles.map((a) => a.querySelector('.tm-id')!.textContent)).toEqual(['3.2B']);
    campo.value = 'tantos equivalentes';
    campo.dispatchEvent(new Event('input'));
    expect($$('.ed-sumario a').filter((a) => !a.closest('li')?.hidden && a.textContent!.includes('Tantos equivalentes'))).toHaveLength(1);
    campo.value = 'zzzz';
    campo.dispatchEvent(new Event('input'));
    expect($('[data-tm-vacio]').hidden).toBe(false);
  });

  it('volver al selector recuerda por dónde ibas en la asignatura', () => {
    navegar('#s/4.1');
    navegar('#academia');
    expect($('.ac-continuar').getAttribute('href')).toBe('#s/4.1');
  });

  it('la portada de la asignatura tiene la identidad editorial: una acción principal, capítulos y Sumario', () => {
    navegar('#s/4.1');
    navegar('#a/gestion-financiera');
    expect(document.body.classList.contains('editorial')).toBe(true);
    // La acción principal es «Continuar donde lo dejaste», con el mismo dato que el selector.
    expect($('.ed-boton').getAttribute('href')).toBe('#s/4.1');
    expect($('.ed-boton').textContent).toContain('Continuar donde lo dejaste');
    expect($$('.ed-cap .ed-enlace-fuerte').map((a) => a.getAttribute('href'))).toEqual(['#inicio', '#tema/2']);
    // El Tema 1 tiene su vídeo y el Tema 2 su animación, como miniaturas que se expanden.
    expect($$('[data-expandir]').map((b) => b.dataset.expandir)).toEqual(['sistema-financiero', 'simple-intereses']);
    expect($('[data-expandir="sistema-financiero"] video')).not.toBeNull();
    // Fuera de estas pantallas vuelve el esqueleto común.
    navegar('#s/4.1');
    expect(document.body.classList.contains('editorial')).toBe(false);
    expect($('.ed-sumario')).toBeNull();
  });

  it('el Sumario se abre como diálogo, recibe el foco, se cierra con Escape y devuelve el foco', () => {
    navegar('#a/gestion-financiera');
    const capa = $('[data-capa-sumario]');
    expect(capa.hidden).toBe(true);
    const boton = $<HTMLButtonElement>('.ed-acciones [data-sumario]');
    boton.focus();
    boton.click();
    expect(capa.hidden).toBe(false);
    expect(document.activeElement).toBe($('[data-capa-sumario] [data-tm-buscar]'));
    expect($('#page').closest('main')!.inert).toBe(true);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(capa.hidden).toBe(true);
    expect($('#page').closest('main')!.inert).toBe(false);
    expect(document.activeElement).toBe(boton);
  });
});
