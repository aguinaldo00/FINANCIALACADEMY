// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { LABORATORIOS } from '../../src/domain/tema2/laboratorio.ts';
import { generarEjercicio } from '../../src/domain/tema2/generador.ts';
import { enunciadoExamen } from '../../src/content/temas/tema-02/enunciados.ts';
import { formulaTexto } from '../../src/ui/matematica/formula.ts';
import { enunciadoColoreado } from '../../src/ui/views/tema2/laboratorio.ts';

const pintar = (html: string) => {
  const p = document.createElement('p');
  p.innerHTML = html;
  return p;
};

describe('enunciado redactado con colores', () => {
  it('cada dato lleva el color de su símbolo y la pregunta el de la incógnita', () => {
    const p = pintar(enunciadoColoreado('simple-capital-inicial', { C_n: '9.659,25 €', n: '7', i: '11,75 %' })!);
    expect(p.textContent).toBe('¿Qué capital inicial debemos invertir hoy para obtener un capital final de 9.659,25 € al cabo de 7 años, si la entidad financiera nos ofrece un tipo de interés simple anual del 11,75 %?');
    expect([...p.querySelectorAll('.lab-marca')].map((m) => [m.textContent, m.classList.contains('s-cn') ? 'Cn' : m.classList.contains('s-n') ? 'n' : m.classList.contains('s-i') ? 'i' : '?'])).toEqual([
      ['9.659,25 €', 'Cn'], ['7 años', 'n'], ['11,75 %', 'i'],
    ]);
    expect(p.querySelector('.lab-marca-pide')!.classList.contains('s-c0')).toBe(true);
  });

  it('en las 19 fórmulas, con o sin periodos, se lee el enunciado del examen con todos sus datos marcados', () => {
    for (const id of Object.keys(LABORATORIOS)) {
      for (const semilla of [1, 3, 7, 42, 50, 999]) {
        for (const todosLosPeriodos of [false, true]) {
          const e = generarEjercicio(id, semilla, { todosLosPeriodos });
          if (!e) continue;
          const p = pintar(enunciadoColoreado(id, e.datos, e.periodicidad)!);
          expect(p.textContent).toBe(enunciadoExamen(id, e.datos, e.periodicidad));
          const marcados = [...p.querySelectorAll('.lab-marca')].map((m) => m.getAttribute('title'));
          for (const d of LABORATORIOS[id]!.datos) expect(marcados, `${id} ${semilla} ${d.simbolo}`).toContain(formulaTexto(d.simbolo));
        }
      }
    }
  });
});

describe('selector de fórmulas', () => {
  it('las partes del tema empiezan plegadas y elegir una fórmula cambia el <select> y el botón', async () => {
    const { montarSelectoresFormula, selectorFormulasHtml } = await import('../../src/ui/components/selectorFormulas.ts');
    const raiz = document.createElement('div');
    raiz.innerHTML = selectorFormulasHtml('<select class="x" data-campo="formula"><option value="">—</option><option value="simple-tiempo">5</option><option value="compuesta-tiempo">10</option></select>');
    document.body.append(raiz);
    const parar = montarSelectoresFormula(raiz);
    let cambios = 0;
    raiz.addEventListener('change', () => cambios++);
    raiz.querySelector<HTMLButtonElement>('[data-selfx-boton]')!.click();
    expect(raiz.querySelector<HTMLElement>('[data-selfx-panel]')!.hidden).toBe(false);
    expect([...raiz.querySelectorAll('details')].every((d) => !d.open)).toBe(true);
    raiz.querySelector<HTMLButtonElement>('[data-selfx-valor="compuesta-tiempo"]')!.click();
    expect(raiz.querySelector('select')!.value).toBe('compuesta-tiempo');
    expect(cambios).toBe(1);
    expect(raiz.querySelector('[data-selfx-elegida]')!.textContent).toContain('Tiempo');
    expect(raiz.querySelector<HTMLElement>('[data-selfx-panel]')!.hidden).toBe(true);
    // Al volver a abrir, solo está desplegada la parte de la fórmula elegida.
    raiz.querySelector<HTMLButtonElement>('[data-selfx-boton]')!.click();
    expect([...raiz.querySelectorAll<HTMLDetailsElement>('details')].filter((d) => d.open).map((d) => d.dataset.selfxBloque)).toEqual(['compuesta']);
    parar();
    raiz.remove();
  });
});
