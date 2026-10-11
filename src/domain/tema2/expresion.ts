/*
 * Expresiones de la calculadora del laboratorio: se analizan en un árbol de operaciones, se calculan
 * con precisión completa y se explican paso a paso. Es el mismo motor para la calculadora, el
 * cuaderno y «Explícame cómo lo he hecho».
 *
 * Reglas (las de una calculadora científica, escritas en español):
 *  - Coma decimal: 0,07. El punto solo se acepta como separador de miles en grupos de tres (10.000);
 *    «1.5» es ambiguo y se avisa, nunca se corrige en silencio.
 *  - Operadores: + − × ÷ ^ (también - * / del teclado), paréntesis, % al final de un número (÷ 100),
 *    √(…), log(…) en base 10, ln(…) y Ans (el último resultado).
 *  - No se supone ninguna multiplicación: «2(3)» o «3√4» piden el × que falta.
 *  - La potencia se agrupa por la derecha (2^3^2 = 2^9) y el signo menos inicial va después de ella
 *    (−2^2 = −4), como en las calculadoras de examen.
 */

export type Nodo =
  | { tipo: 'num'; valor: number; texto: string; ini: number; fin: number }
  | { tipo: 'ans'; ini: number; fin: number }
  | { tipo: 'op'; op: '+' | '−' | '×' | '÷' | '^'; izq: Nodo; der: Nodo; ini: number; fin: number }
  | { tipo: 'neg'; arg: Nodo; ini: number; fin: number }
  | { tipo: 'pct'; arg: Nodo; ini: number; fin: number }
  | { tipo: 'fn'; fn: 'log' | 'ln' | '√'; arg: Nodo; ini: number; fin: number }
  | { tipo: 'grupo'; arg: Nodo; ini: number; fin: number };

export type Analisis = { ok: true; arbol: Nodo } | { ok: false; error: string; posicion: number };

type Token =
  | { t: 'num'; valor: number; texto: string; ini: number; fin: number }
  | { t: 'op'; op: '+' | '−' | '×' | '÷' | '^'; ini: number; fin: number }
  | { t: '(' | ')' | '%' | 'ans'; ini: number; fin: number }
  | { t: 'fn'; fn: 'log' | 'ln' | '√'; ini: number; fin: number };

class ErrorExpresion extends Error {
  constructor(mensaje: string, readonly posicion: number) {
    super(mensaje);
  }
}

const OPERADORES: Record<string, '+' | '−' | '×' | '÷' | '^'> = { '+': '+', '-': '−', '−': '−', '×': '×', '*': '×', '·': '×', '÷': '÷', '/': '÷', ':': '÷', '^': '^' };

/** Lee un número en formato español. Devuelve null si no hay número en esa posición. */
function leerNumero(texto: string, i: number): { valor: number; texto: string; fin: number } | null {
  const m = /^\d[\d.]*(,\d+)?|^,\d+/.exec(texto.slice(i));
  if (!m) return null;
  const crudo = m[0];
  const [entera = '', decimales] = crudo.split(',');
  if (entera.includes('.')) {
    // Solo miles en grupos de tres: 10.000 o 1.234.567,89.
    if (!/^\d{1,3}(\.\d{3})+$/.test(entera)) {
      throw new ErrorExpresion(`«${crudo}» es ambiguo: los decimales se escriben con coma (por ejemplo 1,5) y el punto solo separa miles (10.000).`, i);
    }
  }
  const valor = Number(`${entera.replace(/\./g, '') || '0'}${decimales !== undefined ? `.${decimales}` : ''}`);
  return { valor, texto: crudo, fin: i + crudo.length };
}

function tokenizar(texto: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < texto.length) {
    const c = texto[i]!;
    if (/\s/.test(c)) { i++; continue; }
    const num = leerNumero(texto, i);
    if (num) { tokens.push({ t: 'num', ...num, ini: i }); i = num.fin; continue; }
    if (OPERADORES[c]) { tokens.push({ t: 'op', op: OPERADORES[c]!, ini: i, fin: i + 1 }); i++; continue; }
    if (c === '(' || c === ')' || c === '%') { tokens.push({ t: c, ini: i, fin: i + 1 }); i++; continue; }
    if (c === '√') { tokens.push({ t: 'fn', fn: '√', ini: i, fin: i + 1 }); i++; continue; }
    const palabra = /^[A-Za-zÁÉÍÓÚáéíóú]+/.exec(texto.slice(i))?.[0];
    if (palabra) {
      const p = palabra.toLowerCase();
      if (p === 'ans') tokens.push({ t: 'ans', ini: i, fin: i + 3 });
      else if (p === 'log' || p === 'ln') tokens.push({ t: 'fn', fn: p, ini: i, fin: i + p.length });
      else if (p === 'raiz' || p === 'raíz' || p === 'sqrt') tokens.push({ t: 'fn', fn: '√', ini: i, fin: i + p.length });
      else throw new ErrorExpresion(`No reconozco «${palabra}». Se puede usar log, ln, √ y Ans.`, i);
      i += palabra.length;
      continue;
    }
    throw new ErrorExpresion(`No reconozco el signo «${c}».`, i);
  }
  return tokens;
}

/** Analiza el texto tecleado y devuelve su árbol de operaciones o el error y dónde está. */
export function analizar(texto: string): Analisis {
  try {
    const tokens = tokenizar(texto);
    if (!tokens.length) return { ok: false, error: 'No hay nada que calcular.', posicion: 0 };
    let k = 0;
    const ver = () => tokens[k];

    // suma := producto (('+' | '−') producto)*
    function suma(): Nodo {
      let izq = producto();
      for (let t = ver(); t?.t === 'op' && (t.op === '+' || t.op === '−'); t = ver()) {
        k++;
        const der = producto();
        izq = { tipo: 'op', op: t.op, izq, der, ini: izq.ini, fin: der.fin };
      }
      return izq;
    }
    // producto := signo (('×' | '÷') signo)*
    function producto(): Nodo {
      let izq = signo();
      for (let t = ver(); t?.t === 'op' && (t.op === '×' || t.op === '÷'); t = ver()) {
        k++;
        const der = signo();
        izq = { tipo: 'op', op: t.op, izq, der, ini: izq.ini, fin: der.fin };
      }
      return izq;
    }
    // signo := '−' signo | potencia   (−2^2 = −4)
    function signo(): Nodo {
      const t = ver();
      if (t?.t === 'op' && t.op === '−') {
        k++;
        const arg = signo();
        return { tipo: 'neg', arg, ini: t.ini, fin: arg.fin };
      }
      if (t?.t === 'op' && t.op === '+') { k++; return signo(); }
      return potencia();
    }
    // potencia := postfijo ('^' signo)?   (por la derecha)
    function potencia(): Nodo {
      const base = postfijo();
      const t = ver();
      if (t?.t === 'op' && t.op === '^') {
        k++;
        const exp = signo();
        return { tipo: 'op', op: '^', izq: base, der: exp, ini: base.ini, fin: exp.fin };
      }
      return base;
    }
    // postfijo := atomo '%'*
    function postfijo(): Nodo {
      let n = atomo();
      while (ver()?.t === '%') {
        const t = ver()!;
        k++;
        n = { tipo: 'pct', arg: n, ini: n.ini, fin: t.fin };
      }
      return n;
    }
    function atomo(): Nodo {
      const t = ver();
      if (!t) throw new ErrorExpresion('Falta un número al final.', texto.length);
      k++;
      let n: Nodo;
      if (t.t === 'num') n = { tipo: 'num', valor: t.valor, texto: t.texto, ini: t.ini, fin: t.fin };
      else if (t.t === 'ans') n = { tipo: 'ans', ini: t.ini, fin: t.fin };
      else if (t.t === '(') {
        const arg = suma();
        const cierre = ver();
        if (cierre?.t !== ')') throw new ErrorExpresion('Falta cerrar un paréntesis.', t.ini);
        k++;
        n = { tipo: 'grupo', arg, ini: t.ini, fin: cierre.fin };
      } else if (t.t === 'fn') {
        // √ admite un número suelto (√9); log y ln piden paréntesis, como en la calculadora.
        if (t.fn !== '√' && ver()?.t !== '(') throw new ErrorExpresion(`Después de ${t.fn} va un paréntesis: ${t.fn}(…).`, t.fin);
        const arg = postfijo();
        n = { tipo: 'fn', fn: t.fn, arg, ini: t.ini, fin: arg.fin };
      } else if (t.t === ')') throw new ErrorExpresion('Sobra un paréntesis de cierre (o falta lo de dentro).', t.ini);
      else if (t.t === '%') throw new ErrorExpresion('El % va detrás de un número.', t.ini);
      else throw new ErrorExpresion(`Falta un número antes de «${t.t === 'op' ? t.op : t.t}».`, t.ini);
      // Nada de multiplicaciones supuestas: 2(3), 3√4, 2Ans…
      const sig = ver();
      if (sig && (sig.t === 'num' || sig.t === '(' || sig.t === 'fn' || sig.t === 'ans')) {
        throw new ErrorExpresion('Falta un operador aquí (si es una multiplicación, escribe ×).', sig.ini);
      }
      return n;
    }

    const arbol = suma();
    const resto = ver();
    if (resto) throw new ErrorExpresion(resto.t === ')' ? 'Sobra un paréntesis de cierre.' : 'Falta un operador aquí.', resto.ini);
    return { ok: true, arbol };
  } catch (e) {
    if (e instanceof ErrorExpresion) return { ok: false, error: e.message, posicion: e.posicion };
    throw e;
  }
}

export type Calculo = { ok: true; valor: number } | { ok: false; error: string; posicion: number };

/** Calcula el árbol con precisión completa. `ans` es el último resultado de la calculadora. */
export function evaluar(n: Nodo, ans = 0): Calculo {
  try {
    return { ok: true, valor: valorDe(n, ans) };
  } catch (e) {
    if (e instanceof ErrorExpresion) return { ok: false, error: e.message, posicion: e.posicion };
    throw e;
  }
}

function valorDe(n: Nodo, ans: number): number {
  switch (n.tipo) {
    case 'num': return n.valor;
    case 'ans': return ans;
    case 'grupo': return valorDe(n.arg, ans);
    case 'neg': return -valorDe(n.arg, ans);
    case 'pct': return valorDe(n.arg, ans) / 100;
    case 'fn': {
      const x = valorDe(n.arg, ans);
      if (n.fn === '√') {
        if (x < 0) throw new ErrorExpresion('No hay raíz cuadrada de un número negativo.', n.ini);
        return Math.sqrt(x);
      }
      if (x <= 0) throw new ErrorExpresion(`El ${n.fn} solo existe para números mayores que 0.`, n.ini);
      return n.fn === 'log' ? Math.log10(x) : Math.log(x);
    }
    case 'op': {
      const a = valorDe(n.izq, ans);
      const b = valorDe(n.der, ans);
      if (n.op === '+') return a + b;
      if (n.op === '−') return a - b;
      if (n.op === '×') return a * b;
      if (n.op === '÷') {
        if (b === 0) throw new ErrorExpresion('No se puede dividir entre 0.', n.der.ini);
        return a / b;
      }
      const p = a ** b;
      if (!Number.isFinite(p)) throw new ErrorExpresion('Esta potencia no da un número real.', n.ini);
      return p;
    }
  }
}

/** Analiza y calcula de una vez. */
export function calcular(texto: string, ans = 0): Calculo {
  const a = analizar(texto);
  return a.ok ? evaluar(a.arbol, ans) : a;
}

/** Número en formato español: 2479.338… con 2 decimales → «2.479,34». */
export function formatear(valor: number, decimales = 2): string {
  const signo = valor < 0 ? '−' : '';
  const [entera, frac] = Math.abs(valor).toFixed(decimales).split('.');
  return `${signo}${entera!.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}${frac ? `,${frac}` : ''}`;
}

/** Número con hasta 6 decimales significativos, sin ceros de sobra (para explicar pasos intermedios). */
export function formatearExacto(valor: number): string {
  const redondo = Number(valor.toFixed(6));
  const decimales = (String(redondo).split('.')[1] ?? '').length;
  return formatear(redondo, decimales);
}

const NOMBRE_OP = { '+': 'sumas', '−': 'restas', '×': 'multiplicas', '÷': 'divides', '^': 'elevas' } as const;

/** Texto de la expresión tal como se tecleó (para citar un trozo en la explicación). */
function trozo(texto: string, n: Nodo): string {
  return texto.slice(n.ini, n.fin).trim();
}

/**
 * Explicación paso a paso, en el orden en que la calculadora hace las operaciones. `datos` relaciona
 * valores con su símbolo (C_n → 3000) para decir qué representa cada número; si un mismo valor
 * corresponde a dos datos, lo dice y no elige. Sin datos, solo explica la matemática.
 */
export function explicar(texto: string, datos: Readonly<Record<string, number>> = {}, ans = 0): string[] {
  const a = analizar(texto);
  if (!a.ok) return [`No puedo calcularlo: ${a.error}`];
  const pasos: string[] = [];
  const nombres = (v: number) => Object.entries(datos).filter(([, d]) => Math.abs(d - v) < 1e-9).map(([s]) => s);

  const recorrer = (n: Nodo): number => {
    switch (n.tipo) {
      case 'num': {
        const s = nombres(n.valor);
        if (s.length === 1) pasos.push(`${n.texto} es ${s[0]}.`);
        else if (s.length > 1) pasos.push(`${n.texto} puede ser ${s.join(' o ')}: no sé cuál de los dos has querido usar.`);
        return n.valor;
      }
      case 'ans': pasos.push(`Ans es el resultado anterior: ${formatearExacto(ans)}.`); return ans;
      case 'grupo': return recorrer(n.arg);
      case 'neg': { const v = -recorrer(n.arg); pasos.push(`Cambias el signo: ${formatearExacto(v)}.`); return v; }
      case 'pct': { const v = recorrer(n.arg) / 100; pasos.push(`El % divide entre 100: ${trozo(texto, n)} = ${formatearExacto(v)} (tanto por uno).`); return v; }
      case 'fn': {
        const x = recorrer(n.arg);
        const v = valorDe(n, ans);
        const que = n.fn === '√' ? 'la raíz cuadrada' : n.fn === 'log' ? 'el logaritmo decimal' : 'el logaritmo neperiano';
        pasos.push(`Calculas ${que} de ${formatearExacto(x)}: ${formatearExacto(v)}.`);
        return v;
      }
      case 'op': {
        const x = recorrer(n.izq);
        const y = recorrer(n.der);
        const v = valorDe(n, ans);
        // Por qué va en este orden: el paréntesis se resuelve antes, y × ÷ antes que + −.
        const porque = n.der.tipo === 'grupo' || n.izq.tipo === 'grupo'
          ? ' (lo de dentro del paréntesis va antes)'
          : (n.op === '+' || n.op === '−') && [n.izq, n.der].some((h) => h.tipo === 'op' && h.op !== '+' && h.op !== '−')
            ? ' (las multiplicaciones, divisiones y potencias van antes que las sumas y restas)'
            : '';
        pasos.push(`${NOMBRE_OP[n.op][0]!.toUpperCase()}${NOMBRE_OP[n.op].slice(1)}: ${formatearExacto(x)} ${n.op} ${formatearExacto(y)} = ${formatearExacto(v)}${porque}.`);
        return v;
      }
    }
  };
  let total: number;
  try {
    total = recorrer(a.arbol);
  } catch (e) {
    if (e instanceof ErrorExpresion) return [...pasos, `No puedo seguir: ${e.message}`];
    throw e;
  }
  pasos.push(`Resultado: ${formatearExacto(total)} (con 2 decimales, ${formatear(total)}).`);
  return pasos;
}
