// @vitest-environment happy-dom
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { iniciarApp } from '../../src/app/app.ts';
import { generarPreguntaTiempo } from '../../src/domain/tema2/generador.ts';
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
  location.hash = '#inicio';
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
    expect($('#mt').textContent).toBe('UNIDAD 1 · EL SISTEMA FINANCIERO');
    expect($('.hero h1').getAttribute('aria-label')).toBe('Unidad 1. El sistema financiero');
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
    expect(boton.textContent!.trim()).toBe('Otra forma (1/5)');
    // Icono propio en vez del emoji: el texto de la etiqueta de DATA sin su emoji.
    expect(boton.querySelector('svg.iu')).not.toBeNull();
    expect($('.md b', panel).textContent!.trim()).toBe(tema01.modos[0]!.etiqueta.replace(/^\S+\s/, ''));
    expect($('.md b svg.iu', panel)).not.toBeNull();
    boton.click();
    boton.click();
    expect(boton.textContent!.trim()).toBe('Otra forma (3/5)');
    expect($('.esq', panel).textContent).toBe(tema01.conceptos.find((c) => c.id === 'fgd')!.explicaciones[2]);
    boton.click();
    boton.click();
    boton.click();
    expect(boton.textContent!.trim()).toBe('Otra forma (1/5)');
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

  it('Esquema: la cadena de DATA y el árbol desplegable de los apuntes', () => {
    navegar('#s/4.2A');
    const ficha = $('#c-ico');
    $<HTMLButtonElement>('.ab.e', ficha).click();
    const panel = $('.pn.e', ficha);
    expect(panel.hidden).toBe(false);
    expect($('.esq-arbol h5', panel).textContent).toContain('Las dos vías del ICO');
    expect($$('details', panel).length).toBeGreaterThan(0);
    expect($$('.flujo .f-nodo', panel).length).toBeGreaterThan(1);
    $<HTMLButtonElement>('[data-arbol="cerrar"]', panel).click();
    expect($$('details', panel).every((d) => !(d as HTMLDetailsElement).open)).toBe(true);
    $<HTMLButtonElement>('[data-arbol="abrir"]', panel).click();
    expect($$('details', panel).every((d) => (d as HTMLDetailsElement).open)).toBe(true);
  });

  it('Flashcards: se gira y se pasa a la siguiente', () => {
    const ficha = $('#c-fgd');
    $<HTMLButtonElement>('.ab.f', ficha).click();
    const panel = $('.pn.f', ficha);
    expect($('.fc-anverso', panel).textContent).toContain('Fondo de Garantía');
    $<HTMLButtonElement>('[data-fc="girar"]', panel).click();
    expect($('.fc', panel).classList.contains('girada')).toBe(true);
    $<HTMLButtonElement>('[data-fc="siguiente"]', panel).click();
    expect($('.fc-n', panel).textContent).toBe('2 / 2');
    expect($('.fc', panel).classList.contains('girada')).toBe(false);
  });

  it('Más preguntas: práctica que no cambia el dominio', () => {
    const ficha = $('#c-ico');
    const antes = localStorage.getItem(CLAVE_PROGRESO);
    $<HTMLButtonElement>('.ab.p', ficha).click();
    const panel = $('.pn.p', ficha);
    const pregunta = tema01.ampliacion!.preguntas.filter((p) => p.conceptoId === 'ico')[0]!;
    expect($('p b', panel).textContent).toBe(pregunta.enunciado);
    ($$('.opt', panel) as HTMLButtonElement[])[pregunta.indiceCorrecta]!.click();
    // Antes de corregir se pide la confianza.
    expect($('.fb', panel).textContent).toBe('');
    expect($('.conf', panel).hidden).toBe(false);
    $<HTMLButtonElement>('[data-conf="dudo"]', panel).click();
    expect($('.fb', panel).textContent).toContain('Correcto, pero sin seguridad');
    expect(localStorage.getItem(CLAVE_PROGRESO)).toBe(antes);
    // Un acierto dudoso entra al repaso.
    const practica = JSON.parse(localStorage.getItem('financial-academy:practica')!).temas['1'];
    expect(practica.fallos[pregunta.id]).toMatchObject({ dudosa: true });
    expect(practica.calibracion.dudo).toEqual({ aciertos: 1, total: 1 });
    $<HTMLButtonElement>('[data-pq="siguiente"]', panel).click();
    expect($('.pq-pie span', panel).textContent).toContain('Práctica 2 / 3');
  });

  it('Escríbelo tú: oculta la definición, compara con las ideas clave y anota la tarjeta', () => {
    navegar('#s/4.2A');
    const ficha = $('#c-fgd');
    $<HTMLButtonElement>('.ab.w', ficha).click();
    expect(ficha.classList.contains('recordando')).toBe(true);
    const panel = $('.pn.w', ficha);
    $<HTMLTextAreaElement>('.rec-texto', panel).value = 'Garantiza los depósitos hasta 100.000 euros por titular';
    $<HTMLButtonElement>('[data-rec="comparar"]', panel).click();
    expect(ficha.classList.contains('recordando')).toBe(false);
    expect($$('.rec-ideas li', panel).length).toBeGreaterThan(0);
    $<HTMLButtonElement>('[data-rec="si"]', panel).click();
    const practica = JSON.parse(localStorage.getItem('financial-academy:practica')!).temas['1'];
    expect(practica.tarjetas['frase:fgd'].caja).toBe(1);
  });

  it('Pretest: preguntas rápidas antes de las fichas, sin afectar al dominio', () => {
    navegar('#s/4.2A');
    const antes = localStorage.getItem(CLAVE_PROGRESO);
    const pre = $('[data-pretest]');
    expect($('.pre-panel', pre).hidden).toBe(true);
    $<HTMLButtonElement>('[data-pre="empezar"]', pre).click();
    for (let i = 0; i < 3; i++) {
      $<HTMLButtonElement>('.opt[data-k="0"]', pre).click();
      expect($$('.opt.ok', pre)).toHaveLength(1);
      $<HTMLButtonElement>('[data-pre="sig"]', pre).click();
    }
    expect($('.pre-fin', pre).textContent).toMatch(/de 3/);
    expect(localStorage.getItem(CLAVE_PROGRESO)).toBe(antes);
  });

  it('Visualízalo: infografía paso a paso del ICO en su ficha', () => {
    navegar('#s/4.2A');
    expect($('#c-bancos .ab.v')).toBeNull(); // solo los conceptos con infografía
    const ficha = $('#c-ico');
    $<HTMLButtonElement>('.ab.v', ficha).click();
    const panel = $('.pn.v', ficha);
    expect(panel.hidden).toBe(false);
    expect($('.ig-titulo', panel).textContent).toContain('ICO');
    expect($('.ig-texto', panel).textContent).toMatch(/^Paso 1 de 5/);
    expect($$('.ig-actor.activo', panel).map((a) => a.dataset.actor)).toEqual(['estado', 'mercados', 'ico']);
    $<HTMLButtonElement>('[data-ig="siguiente"]', panel).click();
    expect($('.ig-texto', panel).textContent).toMatch(/^Paso 2 de 5.*mediación/);
    $<HTMLButtonElement>('[data-ig-paso="4"]', panel).click();
    expect($<HTMLButtonElement>('[data-ig="siguiente"]', panel).disabled).toBe(true);
  });

  it('#glosario: siglas y términos explicados, con buscador', () => {
    navegar('#glosario');
    expect($('#mt').textContent).toBe('Glosario');
    expect($$('.gl-entrada').length).toBeGreaterThan(40);
    expect($('.gl-entrada', $('.gl')).textContent).toBeTruthy();
    const campo = $<HTMLInputElement>('.gl-buscar input');
    campo.value = 'cnmv';
    campo.dispatchEvent(new Event('input'));
    expect($$('.gl-entrada').filter((e) => !e.hidden).map((e) => $('dt b', e).textContent)).toContain('CNMV');
    expect($('.sl.on').getAttribute('href')).toBe('#glosario');
  });

  it('las fichas explican sus siglas al tocarlas', () => {
    navegar('#s/4.1');
    const sigla = $('#c-sebc .corta button.sigla');
    expect(sigla).not.toBeNull();
  });

  it('#visual: galería del Tema 1 conserva sus infografías', () => {
    navegar('#visual');
    expect($('#mt').textContent).toBe('Infografías');
    expect($('.vis-capitalizacion')).toBeNull();
    expect($('.vis').textContent).not.toContain('Capitalización compuesta');
    expect($$('.ig')).toHaveLength(tema01.ampliacion!.infografias!.length);
    expect($('.sl.on').getAttribute('href')).toBe('#visual');
  });

  it('la asignatura separa el Tema 2 de la ciudad del Tema 1', () => {
    navegar('#temas');
    expect($('#mt').textContent).toBe('Gestión Financiera');
    expect($$('.ed-cap')).toHaveLength(2);
    expect($('.ed-cap-1 .ed-enlace-fuerte').getAttribute('href')).toBe('#inicio');
    expect($('.ed-cap-2').textContent).toContain('Introducción al cálculo financiero');
    expect($('.ed-cap-2 .ed-enlace-fuerte').getAttribute('href')).toBe('#tema/2');
  });

  it('el Tema 2 abre su propia experiencia (el índice de fórmulas) y mantiene una ruta separada', () => {
    navegar('#tema/2');
    expect($('#mt').textContent).toBe('Tema 2 · Índice de fórmulas');
    expect($('.ed-indice-t2 h1').textContent).toBe('Introducción al cálculo financiero');
    expect($('.vis')).toBeNull();
    expect(new Set($$('a.ed-f').map((a) => a.dataset.formula)).size).toBe(19);
    expect($$('.ed-parte').map((b) => b.id)).toEqual(['t2-simple', 't2-compuesta', 't2-descuento']);
    expect($('.ed-clave').textContent).toContain('hoy');
    expect($('.rail').textContent).toContain('Gestión Financiera · todos los temas');
    // Identidad editorial: página propia, índice lateral bajo demanda y barra del capítulo.
    expect(document.body.classList.contains('editorial')).toBe(true);
    expect(document.body.classList.contains('rail-bajo-demanda')).toBe(true);
    expect($$('.ed-barra-partes a').map((a) => a.getAttribute('href'))).toEqual(['#tema/2/simple', '#tema/2/compuesta', '#tema/2/descuento']);
    expect($('[data-reproductor="simple-intereses"] .mo-svg')).not.toBeNull();
    // Simple y Compuesta comparten composición: la madre grande y una columna de ramas, cada fórmula
    // con su animación ampliable desde el índice (sin salir de él).
    for (const [parte, madre, ramas] of [['simple', 'simple-intereses', 5], ['compuesta', 'compuesta-montante', 7]] as const) {
      expect($(`#t2-${parte} .ed-estrella-centro [data-expandir="${madre}"]`)).not.toBeNull();
      expect($(`#t2-${parte} .ed-estrella-centro .ed-margen`)).not.toBeNull();
      expect($$(`#t2-${parte} .ed-estrella-ramas li`).filter((li) => li.querySelector('[data-expandir] .mo-svg')).length).toBe(ramas);
    }
  });

  it('el Tema 2 va en orden: datos (A), elegir (B), comprender (C) y practicar (D)', () => {
    navegar('#tema/2');
    expect($$('.ed-ruta b').map((b) => b.textContent)).toEqual(['A', 'B', 'C', 'D']);
    expect($$('.ed-ruta b + span').map((s) => s.firstChild!.textContent)).toEqual(['Identificar', 'Elegir', 'Comprender', 'Practicar']);
    // La portada del tema es «Comprender» (C): quien empieza de cero tiene ahí todas las fórmulas.
    expect($('.ed-ruta li.on').textContent).toContain('Comprender');
    expect($('.ed-ruta li.on').textContent).toContain('Estás aquí');
    expect($('.ed-ruta-nota a').getAttribute('href')).toBe('#tema/2/simple/datos');
    for (const parte of ['simple', 'compuesta', 'descuento']) {
      // Descuento añade, al final, el apartado de varias letras (ejercicios de examen).
      const fases = parte === 'descuento' ? ['datos', 'elegir', 'practica', 'letras'] : ['datos', 'elegir', 'practica'];
      expect($$(`#t2-${parte} .ed-parte-practica a`).map((a) => a.getAttribute('href'))).toEqual(fases.map((f) => `#tema/2/${parte}/${f}`));
    }
    navegar('#tema/2/f/simple-intereses');
    // Las fichas usan la navegación editorial y el Sumario de papel (no el índice lateral oscuro).
    expect(document.body.classList.contains('editorial')).toBe(true);
    expect($('.ed-nav [data-sumario]')).not.toBeNull();
    expect($('[data-capa-sumario]')).not.toBeNull();
    expect($('.t2-ficha h1').textContent).toBe('Intereses totales');
    expect($('.mo .mo-svg')).not.toBeNull();
    expect($$('.mo-caps li').length).toBeGreaterThan(3);
    expect($('.rail .sl.on').getAttribute('href')).toBe('#tema/2/f/simple-intereses');
    navegar('#tema/2/simple/datos');
    expect($('.t2-recorrido li.on').textContent).toContain('Identificar los datos');
    expect($('.rail .sl.on').getAttribute('href')).toBe('#tema/2/simple/datos');
  });

  it('Descuento tiene un apartado de varias letras: remesa y fecha focal, enlazado desde sus fases y la fórmula 17', () => {
    navegar('#tema/2/descuento/letras');
    expect($('.t2-letras h1').textContent).toBe('Varias letras con fechas distintas');
    expect($('[data-remesa-ej]')).not.toBeNull();
    expect($('[data-focal-ej]')).not.toBeNull();
    expect($$('.t2-letras-anim .mo-svg').length).toBe(2);
    expect($('.t2-recorrido li.on').textContent).toContain('Varias letras');
    for (const fase of ['datos', 'practica']) {
      navegar(`#tema/2/descuento/${fase}`);
      expect($('.t2-letras-enlace').getAttribute('href')).toBe('#tema/2/descuento/letras');
    }
    // La animación de la fórmula 17 es la remesa de tres letras.
    navegar('#tema/2/f/descuento-remesa');
    expect($('[data-laboratorio] [data-escena]').dataset.escena).toBe('descuento-remesa');
    expect($('[data-laboratorio] .mo-svg').getAttribute('aria-label') ?? $('[data-laboratorio] .mo-svg').textContent).toContain('tres letras');
  });

  it('la ficha de una fórmula es un laboratorio: cuaderno, animación y calculadora que comparten el ejercicio', () => {
    localStorage.clear();
    navegar('#tema/2/f/simple-capital-inicial');
    expect(document.body.classList.contains('t2-escritorio')).toBe(true);
    const lab = $('[data-laboratorio="simple-capital-inicial"]');
    expect(lab.dataset.modo).toBe('digital');
    // Por defecto, el caso de la animación como enunciado.
    expect(lab.dataset.ejercicio).toBe('animacion');
    expect($('[data-lab-caso-texto]').textContent).toContain('12.100 €');
    // Ningún campo enseña los números del caso como ejemplo.
    for (const c of $$('.lab [placeholder]')) expect(c.getAttribute('placeholder')).not.toMatch(/\d/);
    const escribir = (sel: string, valor: string, zona = '.lab-papel') => {
      const c = $<HTMLInputElement>(`${zona} ${sel}`);
      c.value = valor;
      c.dispatchEvent(new Event('input', { bubbles: true }));
    };
    // Digital: una hoja de cálculo. Primero la fórmula (las 19), después sus datos y «Calcular».
    const hoja = $('.lab-cuaderno');
    expect($$('[data-paso]', hoja)).toHaveLength(0);
    expect($$('select[data-campo="formula"] option', hoja).length).toBe(20);
    expect($$('input[data-campo^="dato:"]', hoja)).toHaveLength(0);
    const elegir = (formula: string) => {
      const sel = $<HTMLSelectElement>('select[data-campo="formula"]', hoja);
      sel.value = formula;
      sel.dispatchEvent(new Event('change', { bubbles: true }));
    };
    elegir('simple-capital-inicial');
    expect($$('input[data-campo^="dato:"]', hoja).map((c) => c.dataset.campo)).toEqual(['dato:C_n', 'dato:n', 'dato:i']);
    escribir('[data-campo="dato:C_n"]', '12.100 €', '.lab-cuaderno');
    escribir('[data-campo="dato:n"]', '3', '.lab-cuaderno');
    escribir('[data-campo="dato:i"]', '7', '.lab-cuaderno');
    $<HTMLButtonElement>('[data-lab-calcular]', hoja).click();
    // Un tipo sin % no se corrige solo: se avisa y no se calcula.
    expect($('[data-lab-hoja-nota]', hoja).textContent).toContain('%');
    expect($('[data-lab-hoja-salida]', hoja).hidden).toBe(true);
    escribir('[data-campo="dato:i"]', '7 %', '.lab-cuaderno');
    $<HTMLButtonElement>('[data-lab-calcular]', hoja).click();
    expect($('[data-lab-hoja-resultado]', hoja).textContent).toContain('10.000,00 €');
    expect($('[data-lab-hoja-sust]', hoja).textContent).toContain('12.100');
    expect($('[data-lab-hoja-nota]', hoja).textContent).toContain('coinciden con el enunciado');
    // Una fórmula que calcula otra cosa: lo dice (fuera del examen).
    elegir('simple-intereses');
    escribir('[data-campo="dato:C_0"]', '10.000', '.lab-cuaderno');
    escribir('[data-campo="dato:n"]', '3', '.lab-cuaderno');
    escribir('[data-campo="dato:i"]', '7 %', '.lab-cuaderno');
    $<HTMLButtonElement>('[data-lab-calcular]', hoja).click();
    expect($('[data-lab-hoja-nota]', hoja).textContent).toContain('te piden capital inicial');
    elegir('simple-capital-inicial');
    // Pro: las variables y la fórmula las escribe el alumno, con el nombre que quiera (c0, Cn, i…).
    $<HTMLButtonElement>('[data-hoja-poner="pro"]', hoja).click();
    escribir('[data-campo="pro:nombre:0"]', 'Cn', '.lab-cuaderno');
    escribir('[data-campo="pro:valor:0"]', '12.100', '.lab-cuaderno');
    escribir('[data-campo="pro:nombre:1"]', 'n', '.lab-cuaderno');
    escribir('[data-campo="pro:valor:1"]', '3', '.lab-cuaderno');
    escribir('[data-campo="pro:nombre:2"]', 'i', '.lab-cuaderno');
    escribir('[data-campo="pro:valor:2"]', '7 %', '.lab-cuaderno');
    escribir('[data-campo="pro:formula"]', 'c0 = Cn / (1 + n * i)', '.lab-cuaderno');
    $<HTMLButtonElement>('[data-lab-calcular]', hoja).click();
    expect($('[data-lab-hoja-resultado]', hoja).textContent).toContain('c0 = 10.000,00 €');
    $<HTMLButtonElement>('[data-hoja-pro-limpiar]', hoja).click();
    expect($$('.hoja-pro input[data-campo^="pro:nombre:"]', hoja).every((c) => (c as HTMLInputElement).value === '')).toBe(true);
    // La guía de variables dice qué es cada letra y cómo se escribe.
    $<HTMLButtonElement>('[data-hoja-guia]', hoja).click();
    expect($('[data-hoja-guia-panel]', hoja).hidden).toBe(false);
    expect($('[data-hoja-guia-panel]', hoja).textContent).toContain('C0, c0, C_0, Co');
    $<HTMLButtonElement>('[data-hoja-poner="guiada"]', hoja).click();
    // El papel (modo analógico) tiene lo mismo: un solo estado para los dos modos.
    expect($<HTMLInputElement>('.lab-papel [data-campo="dato:C_n"]').value).toBe('12.100 €');
    // Analógico: los pasos a mano. Despeje y sustitución dicen qué escribir, con un ejemplo de otra fórmula.
    expect($('.lab-papel [data-paso="despeje"] .lab-ejemplo').textContent).toContain('I = C₀ · n · i');
    escribir('[data-campo="dato:i"]', '7');
    escribir('[data-campo="incognita"]', 'C_0');
    escribir('[data-campo="formula"]', 'simple-capital-inicial');
    escribir('[data-campo="resultado"]', '10.000');
    // Mientras se escribe no se corrige nada.
    expect($('.lab-papel [data-nota="datos"]').textContent).toBe('');
    // Comprobar revisa paso a paso: el tipo sin % se marca, sin dar el valor.
    $<HTMLButtonElement>('.lab-papel [data-lab-comprobar]').click();
    expect($('.lab-papel [data-paso="datos"]').dataset.revision).toBe('mal');
    expect($('.lab-papel [data-nota="datos"]').textContent).toContain('%');
    escribir('[data-campo="dato:i"]', '7 %');
    $<HTMLButtonElement>('.lab-papel [data-lab-comprobar]').click();
    for (const paso of ['datos', 'incognita', 'formula', 'resultado']) expect($(`.lab-papel [data-paso="${paso}"]`).dataset.revision, paso).toBe('bien');
    expect($('.lab-papel [data-nota="resultado"]').textContent).toBe('Correcto: 10.000,00 €.');
    expect($('.lab-papel [data-lab-revision]').textContent).toBe('Todo el cuaderno está bien.');
    // La fórmula se elige en un desplegable; la del montante también vale (sale despejando).
    escribir('[data-campo="formula"]', 'simple-montante');
    expect($('.lab-papel [data-lab-formula-elegida]').textContent).toContain('=');
    $<HTMLButtonElement>('.lab-papel [data-lab-comprobar]').click();
    expect($('.lab-papel [data-nota="formula"]').textContent).toContain('También vale');
    // La calculadora calcula de verdad y envía al cuaderno.
    const entrada = $<HTMLInputElement>('[data-cal-entrada]');
    entrada.value = '12100 ÷ (1 + 3 × 0,07)';
    entrada.dispatchEvent(new Event('input', { bubbles: true }));
    $<HTMLButtonElement>('[data-cal-accion="igual"]').click();
    expect($('[data-cal-resultado]').textContent).toBe('10.000');
    $<HTMLButtonElement>('[data-cal-explicar]').click();
    expect($('[data-cal-explicacion]').textContent).toContain('12100 es Cₙ.');
    $<HTMLButtonElement>('[data-cal-enviar]').click();
    expect($<HTMLTextAreaElement>('.lab-papel [data-campo="operaciones"]').value).toBe('12100 ÷ (1 + 3 × 0,07) = 10.000,00');
    // Ejercicio aleatorio: generado, con su número; cambiar de ejercicio empieza un cuaderno nuevo.
    $<HTMLButtonElement>('[data-lab-ejercicio="practica"]').click();
    expect(lab.dataset.ejercicio).toBe('practica');
    expect($('[data-lab-caso-origen]').textContent).toContain('Ejercicio aleatorio nº');
    expect($<HTMLSelectElement>('.lab-cuaderno select[data-campo="formula"]').value).toBe('');
    expect($$('.lab-cuaderno input[data-campo^="dato:"]')).toHaveLength(0);
    expect($<HTMLInputElement>('.lab-papel [data-campo="dato:C_n"]').value).toBe('');
    const primero = $('[data-lab-caso-texto]').textContent;
    $<HTMLButtonElement>('[data-lab-otro]').click();
    expect($('[data-lab-caso-texto]').textContent).not.toBe(primero);
    // Modo examen: el mismo generador, redactado como en un examen y sin símbolos ni pistas.
    $<HTMLButtonElement>('[data-lab-ejercicio="examen"]').click();
    expect(lab.dataset.ejercicio).toBe('examen');
    expect($('[data-lab-caso-texto]').textContent).toMatch(/^¿Qué capital inicial debemos invertir hoy para obtener un capital final de [\d.,]+ € al cabo de \d+ años/);
    expect($$('[data-lab-caso-texto] .fx')).toHaveLength(0);
    expect($('[data-lab-otro]').hidden).toBe(false);
    const togglePeriodos = $<HTMLInputElement>('[data-lab-todos-periodos]');
    expect(togglePeriodos.checked).toBe(false);
    togglePeriodos.checked = true;
    togglePeriodos.dispatchEvent(new Event('change', { bubbles: true }));
    expect(localStorage.getItem('fa-lab-todos-periodos')).toBe('true');
    expect($('[data-lab-periodos-control]').hidden).toBe(false);
    expect($('[data-lab-caso-texto]').textContent).toMatch(/(anual|semestral|cuatrimestral|trimestral|mensual|diario)/);
    $<HTMLButtonElement>('[data-lab-ejercicio="examen-real"]').click();
    expect(lab.dataset.ejercicio).toBe('examen-real');
    expect($('[data-lab-pista]').hidden).toBe(true);
    $<HTMLButtonElement>('[data-lab-modo="analogico"]').click();
    expect($('.lab-papel [data-lab-datos-fijos]').hidden).toBe(true);
    expect($('.lab-papel [data-lab-datos-manuales]').hidden).toBe(false);
    expect($('.lab-papel [data-lab-incognita-select]').hidden).toBe(true);
    expect($('.lab-papel [data-lab-incognita-text]').hidden).toBe(false);
    expect($('.lab-papel [data-lab-formula-select]').hidden).toBe(true);
    expect($('.lab-papel [data-lab-formula-text]').hidden).toBe(false);
    expect($$('.lab-papel [data-lab-datos-manuales] .lab-sim')).toHaveLength(0);
    $<HTMLButtonElement>('.lab-papel [data-lab-variable-mas]').click();
    expect($$('.lab-papel [data-lab-variable-fila]')).toHaveLength(4);
    $<HTMLButtonElement>('.lab-papel [data-lab-variable-quitar]').click();
    expect($$('.lab-papel [data-lab-variable-fila]')).toHaveLength(3);
    $<HTMLButtonElement>('.lab-papel [data-lab-variable-limpiar]').click();
    expect($$('.lab-papel [data-lab-datos-manuales] input').every((c) => (c as HTMLInputElement).value === '')).toBe(true);
    $<HTMLButtonElement>('[data-lab-ejercicio="propio"]').click();
    expect($('[data-lab-escena-nota]').textContent).toContain('no tus datos');
    // Analógico: el papel sube desde detrás de la animación.
    $<HTMLButtonElement>('[data-lab-modo="analogico"]').click();
    expect(lab.dataset.modo).toBe('analogico');
    expect($('[data-lab-papel]').getAttribute('aria-hidden')).toBe('false');
    // La pizarra con las fórmulas del bloque, y la teoría completa debajo.
    expect($$('.pizarra-formulas li').length).toBe(6);
    expect($('.pizarra-actual a').getAttribute('href')).toBe('#tema/2/f/simple-capital-inicial');
    expect($('.t2-teoria .t2-simbolos')).not.toBeNull();
    expect($$('.t2-teoria [data-t2-error]').length).toBeGreaterThan(0);
  });

  it('las fichas con cambios de unidad llevan el calendario de equivalencias: duraciones y tipos, cualquier unidad a cualquier otra', () => {
    navegar('#tema/2/f/compuesta-equivalentes');
    const conv = $('[data-conversor]');
    const resultado = () => $('[data-conv-resultado]', conv).textContent ?? '';
    const atajo = (k: number) => $<HTMLButtonElement>(`[data-conv-atajo="${k}"]`, conv).click();
    // En tantos equivalentes empieza por los tipos en compuesta: el caso práctico 19.
    expect(conv.dataset.modo).toBe('tipo');
    expect(resultado()).toContain('10 % anual = 0,7974 % mensual');
    expect($('[data-conv-reproductor] .mo-svg', conv)).not.toBeNull();
    // Es una ficha de compuesta: las preguntas de tipos son de compuesta, no el reparto de simple.
    expect(conv.dataset.convFicha).toBe('compuesta');
    expect($('.conv-volanta', conv).textContent).toContain('compuesta');
    expect($('.conv-entrada', conv).textContent).toContain('no se reparte');
    const preguntasTipo = $$('[data-conv-atajo-modo="tipo"] button', conv).map((b) => b.textContent ?? '');
    expect(preguntasTipo.length).toBeGreaterThan(0);
    expect(preguntasTipo.some((t) => t.includes('simple'))).toBe(false);
    expect(preguntasTipo.every((t) => t.includes('compuesta') || t.startsWith('TIN'))).toBe(true);
    // Paso a paso con los números de la pregunta, y el año partido con las dos unidades marcadas.
    const pasos = () => $$('[data-conv-pasos] li', conv).map((li) => li.textContent ?? '').join(' | ');
    expect(pasos()).toContain('no se reparte');
    expect(pasos()).toContain('Raíz de índice 12');
    expect(pasos()).toContain('Error típico');
    expect($('[data-conv-fila="año"]', conv).dataset.papel).toBe('de');
    expect($('[data-conv-fila="mes"]', conv).dataset.papel).toBe('a');
    // Entre dos fracciones del año: distinto en compuesta y en simple (simple, solo para comparar).
    atajo(13);
    expect(resultado()).toContain('2 % trimestral = 2,6755 % cuatrimestral');
    const simple = $<HTMLInputElement>('[data-conv-regimen] input[value="simple"]', conv);
    simple.checked = true;
    simple.dispatchEvent(new Event('change', { bubbles: true }));
    expect(resultado()).toContain('2 % trimestral = 2,6667 % cuatrimestral');
    // Duraciones: la pregunta que no encaja y los días con su convenio.
    $<HTMLButtonElement>('[data-conv-modo="duracion"]', conv).click();
    expect(conv.dataset.modo).toBe('duracion');
    expect(resultado()).toBe('1 semestre = 1,5 cuatrimestres');
    expect(pasos()).toContain('1 × 6 = 6 meses');
    expect(pasos()).toContain('6 ÷ 4 = 1,5 cuatrimestres');
    expect($('[data-conv-fila="semestre"]', conv).dataset.papel).toBe('de');
    atajo(8);
    expect(resultado()).toBe('195 días = 0,5342 años');
    expect($('[data-conv-convenio]', conv).hidden).toBe(false);
    expect($('[data-conv-reproductor]', conv).dataset.escena).toBe('conversion-dia-año-195-365');
    const valor = $<HTMLInputElement>('[data-conv-valor]', conv);
    valor.value = '1.5';
    valor.dispatchEvent(new Event('input', { bubbles: true }));
    expect(resultado()).toContain('coma');
    // Calculadora analógica al lado, que lleva su resultado al conversor.
    expect($('.conv-calculadora .cal-analogica', conv)).not.toBeNull();
    const entrada = $<HTMLInputElement>('#conv-cal-entrada', conv);
    entrada.value = '6 ÷ 4';
    entrada.dispatchEvent(new Event('input', { bubbles: true }));
    $<HTMLButtonElement>('.conv-calculadora [data-cal-enviar]', conv).click();
    expect(valor.value).toBe('1,50');
    // Ejercicio aleatorio del modo elegido: se resuelve, se comprueba y se puede ver resuelto en el conversor.
    const ej = $('[data-conv-ejercicio]', conv);
    $<HTMLButtonElement>('[data-conv-ej-generar]', ej).click();
    expect($('[data-conv-ej-origen]', ej).textContent).toContain('Ejercicio aleatorio nº');
    const q = generarPreguntaTiempo(Number(ej.dataset.semilla), 'duracion', 'compuesta');
    expect($('[data-conv-ej-enunciado]', ej).textContent).toContain(`¿Cuántos ${q.a === 'dia' ? 'días' : ''}`);
    const respuesta = $<HTMLInputElement>('[data-conv-ej-respuesta]', ej);
    const nota = () => $('[data-conv-ej-nota]', ej).textContent ?? '';
    respuesta.value = String(q.resultado * 3 + 1).replace('.', ',');
    $<HTMLButtonElement>('[data-conv-ej-comprobar]', ej).click();
    expect(nota()).toContain('No es eso');
    respuesta.value = String(q.resultado).replace('.', ',');
    $<HTMLButtonElement>('[data-conv-ej-comprobar]', ej).click();
    expect(nota()).toContain('Bien');
    $<HTMLButtonElement>('[data-conv-ej-solucion]', ej).click();
    expect($<HTMLSelectElement>('[data-conv-de]', conv).value).toBe(q.de);
    expect($<HTMLSelectElement>('[data-conv-a]', conv).value).toBe(q.a);
    expect(pasos().length).toBeGreaterThan(0);
    // En tipos de compuesta, repartir en proporción se reconoce como el error típico.
    $<HTMLButtonElement>('[data-conv-modo="tipo"]', conv).click();
    // (se busca uno en que repartir se note: con tipos pequeños entre fracciones parecidas casi coinciden).
    let qt = generarPreguntaTiempo(1, 'tipo', 'compuesta');
    for (let intento = 0; intento < 50; intento++) {
      $<HTMLButtonElement>('[data-conv-ej-generar]', ej).click();
      qt = generarPreguntaTiempo(Number(ej.dataset.semilla), 'tipo', 'compuesta');
      if (Math.abs(qt.proporcional - qt.resultado) > qt.resultado * 0.02) break;
    }
    expect(Math.abs(qt.proporcional - qt.resultado)).toBeGreaterThan(qt.resultado * 0.02);
    respuesta.value = String(qt.proporcional).replace('.', ',');
    $<HTMLButtonElement>('[data-conv-ej-comprobar]', ej).click();
    expect(nota()).toContain('repartir en proporción');
    // En una ficha de simple, «Tipo de interés» pregunta en simple: se reparte en proporción.
    navegar('#tema/2/f/simple-tiempo');
    const convSimple = $('[data-conversor]');
    expect(convSimple.dataset.modo).toBe('duracion');
    $<HTMLButtonElement>('[data-conv-modo="tipo"]', convSimple).click();
    expect($('[data-conv-resultado]', convSimple).textContent).toContain('10 % anual = 0,8333 % mensual');
    // No todas las fichas lo llevan.
    navegar('#tema/2/f/simple-intereses');
    expect(document.querySelector('[data-conversor]')).toBeNull();
  });

  it('ir a un ejercicio dentro de la misma pantalla del Tema 2 no reinicia lo ya hecho', () => {
    navegar('#tema/2/compuesta/practica');
    $<HTMLButtonElement>('[data-mat-revelar-error]').click();
    expect($('.mat-error-bien').hidden).toBe(false);
    navegar('#tema/2/compuesta/practica#t2-ej-c-4500');
    expect($('.mat-error-bien').hidden).toBe(false);
  });

  it('el menú vuelve al de cada tema y el enlace a la asignatura está siempre arriba', () => {
    navegar('#tema/2');
    expect($('.rail').firstElementChild!.getAttribute('href')).toBe('#a/gestion-financiera');
    navegar('#inicio');
    expect($('.rail').firstElementChild!.getAttribute('href')).toBe('#a/gestion-financiera');
    expect($('.rail').textContent).toContain('dominio global');
  });

  it('#c/<id> abre la sección del concepto y lo muestra', () => {
    navegar('#c/bce');
    expect($('[data-sec]').dataset.sec).toBe('4.1');
    expect($('#c-bce').classList.contains('in')).toBe(true);
  });

  it('#examen: pesos orientativos con 5 bloques, gráficos, tabla y simulacro', () => {
    navegar('#examen');
    expect($('#mt').textContent).toBe('Pesos orientativos');
    expect($('.ex-cab h1').textContent).toBe('Pesos orientativos para organizar el estudio');
    expect($('.sl.on').getAttribute('href')).toBe('#examen');
    // Los pesos orientativos van al final del índice.
    expect($$('#rail a').slice(-6).map((a) => a.getAttribute('href'))).toEqual(['#sesion', '#examen', '#visual', '#simulacro', '#repaso', '#progreso']);
    expect($$('.ex-bloque .ex-pct').map((e) => e.textContent)).toEqual(['30 %', '25 %', '20 %', '15 %', '10 %']);
    // Cada concepto del tema aparece una vez en el mapa.
    expect($$('.ex-chip')).toHaveLength(tema01.conceptos.length);
    expect($$('.ex-barra.prob')).toHaveLength(5);
    expect($$('.ex-tabla tbody tr')).toHaveLength(5);

    const antes = localStorage.getItem(CLAVE_PROGRESO);
    const ficha = $('#ex-activos');
    $<HTMLButtonElement>('[data-sim="abrir"]', ficha).click();
    const panel = $('.pn.p', ficha);
    expect(panel.hidden).toBe(false);
    // Primero la pregunta oficial de "instrumento".
    const correcta = tema01.conceptos.find((c) => c.id === 'instrumento')!.pregunta.indiceCorrecta;
    $<HTMLButtonElement>(`.opt[data-k="${correcta}"]`, panel).click();
    $<HTMLButtonElement>('[data-conf="seguro"]', panel).click();
    expect($('.fb', panel).textContent).toContain('Correcto');
    expect($('.ex-marcador', panel).textContent).toBe('Aciertos 1 / 1');
    expect(localStorage.getItem(CLAVE_PROGRESO)).toBe(antes);
    $<HTMLButtonElement>('[data-sim="siguiente"]', panel).click();
    expect($('.pq-pie', panel).textContent).toContain('Simulacro 2 /');
  });

  it('Simulacro: 10 preguntas sin corrección inmediata, nota final y fallos al repaso', () => {
    vi.useFakeTimers();
    try {
      navegar('#simulacro');
      expect($('#mt').textContent).toBe('Simulacro');
      $<HTMLInputElement>('input[name="sim-n"][value="10"]').click();
      $<HTMLButtonElement>('[data-sim-empezar]').click();
      for (let i = 0; i < 10; i++) {
        expect($('.sim-n b').textContent).toBe(String(i + 1));
        // Si la pregunta tiene siglas, hay pista para ver qué significan.
        const pista = document.querySelector<HTMLButtonElement>('.sim-pregunta [data-siglas]');
        expect(Boolean(pista)).toBe($$('.sim-pregunta abbr.sg-q').length > 0);
        if (pista) {
          pista.click();
          expect($('.sim-pregunta').classList.contains('siglas-vistas')).toBe(true);
        }
        // Siempre la primera opción: algunas acertarán y otras no.
        $<HTMLButtonElement>('.opt[data-k="0"]').click();
        $<HTMLButtonElement>(i % 2 ? '[data-conf="seguro"]' : '[data-conf="adivino"]').click();
        expect($$('.opt.ok, .opt.no')).toHaveLength(0);
        vi.advanceTimersByTime(300);
      }
      const nota = $('[data-sim-nota]').textContent!;
      expect(Number(nota.replace(',', '.'))).toBeGreaterThanOrEqual(0);
      expect($$('.sim-correccion li')).toHaveLength(10);
      // En la corrección las siglas ya se ven desarrolladas.
      expect($('.sim-correccion').classList.contains('siglas-vistas')).toBe(true);
      // Calibración: aciertos según la seguridad declarada.
      expect($('.sim-cal')).toBeTruthy();
      expect($$('.sim-cal .ex-fila')).toHaveLength(2);
      const guardado = JSON.parse(localStorage.getItem('financial-academy:practica')!);
      expect(guardado.temas['1'].simulacros).toHaveLength(1);
      expect(guardado.temas['1'].simulacros[0].total).toBe(10);
    } finally {
      vi.useRealTimers();
    }
  });

  it('Repaso: los fallos aparecen y una flashcard que te sabes sale de las de hoy', () => {
    navegar('#repaso');
    expect(Number($('.rep-tab[data-tab="fallos"] b').textContent)).toBeGreaterThan(0);
    expect($('[data-rep-panel] .pq-pie').textContent).toContain('Fallada');
    // El índice muestra la insignia de pendientes.
    expect(Number($('#rail .insignia').textContent)).toBeGreaterThan(0);
    $<HTMLButtonElement>('.rep-tab[data-tab="tarjetas"]').click();
    const antes = Number($('.rep-tab[data-tab="tarjetas"] b').textContent);
    expect(antes).toBeGreaterThan(0);
    expect($('.rep-calif').hidden).toBe(true);
    $<HTMLButtonElement>('[data-rep-girar]').click();
    $<HTMLButtonElement>('[data-rep-sabia="1"]').click();
    $<HTMLButtonElement>('.rep-tab[data-tab="tarjetas"]').click();
    expect(Number($('.rep-tab[data-tab="tarjetas"] b').textContent)).toBe(antes - 1);
  });

  it('Estudiar hoy: sesión mezclada con confianza, tarjetas y resumen final', () => {
    navegar('#sesion');
    expect($('#mt').textContent).toBe('Estudiar hoy');
    expect($('.sl.on').getAttribute('href')).toBe('#sesion');
    // Fecha de examen: se guarda en la práctica.
    const fecha = $<HTMLInputElement>('[data-ses-fecha]');
    fecha.value = '2026-12-01';
    fecha.dispatchEvent(new Event('change'));
    expect(JSON.parse(localStorage.getItem('financial-academy:practica')!).temas['1'].fechaExamen).toBe('2026-12-01');
    expect($('.ses-examen').textContent).toMatch(/Faltan \d+ días/);
    $<HTMLInputElement>('input[name="ses-n"][value="10"]').click();
    $<HTMLInputElement>('input[name="ses-n"][value="10"]').dispatchEvent(new Event('change'));
    $<HTMLButtonElement>('[data-ses-empezar]').click();
    for (let i = 0; i < 10; i++) {
      const panel = $('[data-ses-panel]');
      if ($('[data-ses-girar]', panel)) {
        $<HTMLButtonElement>('[data-ses-girar]', panel).click();
        $<HTMLButtonElement>('[data-sabia="1"]', panel).click();
      } else {
        $<HTMLButtonElement>('.opt[data-k="0"]', panel).click();
        $<HTMLButtonElement>('[data-conf="seguro"]', panel).click();
        $<HTMLButtonElement>('[data-ses-sig]', panel).click();
      }
    }
    expect($('.ses-fin h2').textContent).toMatch(/de 10 bien/);
  });

  it('Mi progreso: racha, memoria, calibración, bloques y simulacros', () => {
    navegar('#progreso');
    expect($('#mt').textContent).toBe('Mi progreso');
    expect($$('.prog-tile').length).toBeGreaterThanOrEqual(4);
    expect($('.prog-tile b').textContent).toBe('1');
    expect($$('.prog-dia').length).toBeGreaterThanOrEqual(28);
    expect($$('.prog-memoria i').length).toBeGreaterThan(1);
    expect($$('.prog-sim').length).toBeGreaterThan(0);
  });

  it('un id desconocido vuelve a la portada', () => {
    navegar('#s/zzz');
    expect($$('.tile')).toHaveLength(12);
    expect($$('.sl.on')).toHaveLength(0);
  });
});
