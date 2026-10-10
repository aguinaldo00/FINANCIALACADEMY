// Cada fotograma es una función pura del tiempo: window.frame(t) (t en segundos).
// Los textos salen de datos.json (contenido literal de src/content).
const W = 1280, H = 720, DUR = 72;
const clamp = (x) => Math.min(1, Math.max(0, x));
const ease = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const seg = (t, a, b) => ease((t - a) / (b - a));
const st = document.getElementById('st');
let D;

const el = (tag, cls, html, parent, css) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  if (css) Object.assign(e.style, css);
  (parent || st).appendChild(e);
  return e;
};
const nodo = (par, x, y, w, h, txt, col, size) =>
  el('div', 'nodo', `<div>${txt}</div>`, par, { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px', borderColor: col || 'var(--oro)', fontSize: (size || 22) + 'px' });
const svgFlecha = (par, x1, y1, x2, y2, col) => {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('viewBox', `0 0 ${W} ${H}`);
  s.innerHTML = `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="3" stroke-dasharray="8 8" opacity=".7"/>`;
  par.appendChild(s);
  return s;
};
// Escena con ventana [a,b] y fundido de 0,6 s.
const escenas = [];
const escena = (a, b, titulo, sub, init) => {
  const e = el('div', 'esc');
  if (titulo) el('div', 'tit', titulo, e);
  const s = sub ? el('div', 'sub', sub, e) : null;
  const upd = init(e) || (() => {});
  escenas.push({ a, b, e, s, upd });
};
const monedas = (par, n, x1, y1, x2, y2, col) => {
  const cs = Array.from({ length: n }, () => el('div', 'coin', '', par));
  return (t, vel = 0.22) => cs.forEach((c, i) => {
    const f = (t * vel + i / n) % 1;
    const x = x1 + (x2 - x1) * f, y = y1 + (y2 - y1) * f + Math.sin(f * Math.PI) * -30;
    c.style.transform = `translate(${x - 11}px,${y - 11}px) scale(${Math.sin(f * Math.PI)})`;
    if (col) c.style.background = col;
  });
};

function montar() {
  const c = D.c;

  // 1 · Título
  escena(0, 6, null, null, (e) => {
    const h = el('div', null, D.meta.titulo, e, { position: 'absolute', top: '250px', left: 0, right: 0, textAlign: 'center', font: '500 70px Fraunces,serif', color: 'var(--oro2)' });
    const s = el('div', null, D.meta.ciudad, e, { position: 'absolute', top: '360px', left: 0, right: 0, textAlign: 'center', font: '400 30px "IBM Plex Mono",monospace', color: 'var(--mut)', letterSpacing: '.12em' });
    return (t) => { h.style.transform = `translateY(${(1 - seg(t, 0.2, 1.4)) * 30}px)`; h.style.opacity = seg(t, 0.2, 1.4); s.style.opacity = seg(t, 1.2, 2.4); };
  });

  // 2 · Del superávit al déficit
  escena(6, 20, 'El sistema financiero', c.sf.frase, (e) => {
    nodo(e, 70, 270, 260, 130, 'Familias<br><span style="color:var(--g)">superávit</span><br>les sobra', 'var(--g)');
    const mid = nodo(e, 480, 245, 320, 180, 'Instituciones<br>medios (activos)<br>mercados', 'var(--oro)', 26);
    nodo(e, 950, 270, 260, 130, 'Empresas y sector público<br><span style="color:var(--r)">déficit</span> · les falta', 'var(--r)', 20);
    svgFlecha(e, 330, 335, 480, 335, 'var(--g)'); svgFlecha(e, 800, 335, 950, 335, 'var(--r)');
    const m1 = monedas(e, 5, 330, 335, 480, 335), m2 = monedas(e, 5, 800, 335, 950, 335);
    return (t) => { m1(t); m2(t); mid.style.boxShadow = `0 0 ${20 + 14 * Math.sin(t * 3)}px #e0b25e55`; };
  });

  // 3 · Funciones
  escena(20, 32, c.funciones.nombre, c.funciones.frase, (e) => {
    const nombres = c.funciones.esquema.split('→')[0].trim().split('·').map((s) => s.trim());
    const cols = ['var(--y)', 'var(--g)', 'var(--c)', 'var(--b)', 'var(--v)', 'var(--p)'];
    const cx = 640, cy = 340;
    const centro = nodo(e, cx - 90, cy - 45, 180, 90, 'Canalizar<br>ahorro', 'var(--oro)', 22);
    const ns = nombres.map((n, i) => {
      const a = (i / nombres.length) * Math.PI * 2 - Math.PI / 2;
      return { n: nodo(e, 0, 0, 160, 60, n, cols[i % 6], 22), a };
    });
    return (t) => ns.forEach((o, i) => {
      const k = seg(t, 21.5 + i * 0.5, 22.5 + i * 0.5), r = 210 * k, x = cx + Math.cos(o.a) * r * 1.35 - 80, y = cy + Math.sin(o.a) * r * 0.78 - 30;
      o.n.style.transform = `translate(${x}px,${y}px)`; o.n.style.opacity = k;
    });
  });

  // 4 · Directa e indirecta
  escena(32, 46, 'Dos caminos para el dinero', null, (e) => {
    el('div', null, 'Intermediación directa', e, { position: 'absolute', left: '90px', top: '130px', font: '500 28px Fraunces,serif', color: 'var(--p)' });
    nodo(e, 90, 190, 200, 80, 'Ahorrador', 'var(--g)'); nodo(e, 640, 190, 200, 80, 'Empresa', 'var(--r)');
    svgFlecha(e, 290, 230, 640, 230, 'var(--g)');
    const dir = monedas(e, 4, 290, 230, 640, 230);
    el('div', null, c.directa.frase, e, { position: 'absolute', left: '90px', top: '285px', width: '1100px', fontSize: '20px', color: 'var(--mut)' });
    el('div', null, 'Intermediación indirecta', e, { position: 'absolute', left: '90px', top: '370px', font: '500 28px Fraunces,serif', color: 'var(--b)' });
    nodo(e, 90, 430, 200, 80, 'Ahorrador', 'var(--g)'); nodo(e, 460, 410, 200, 120, 'Banco', 'var(--b)', 26); nodo(e, 830, 430, 200, 80, 'Empresa', 'var(--r)');
    svgFlecha(e, 290, 470, 460, 470, 'var(--g)'); svgFlecha(e, 660, 470, 830, 470, 'var(--r)');
    const i1 = monedas(e, 3, 290, 470, 460, 470), i2 = monedas(e, 3, 660, 470, 830, 470);
    el('div', null, c.indirecta.frase, e, { position: 'absolute', left: '90px', top: '555px', width: '1100px', fontSize: '20px', color: 'var(--mut)' });
    return (t) => { dir(t); i1(t); i2(t); };
  });

  // 5 · Composición
  escena(46, 56, 'De qué se compone', null, (e) => {
    const piezas = [['instrumento', 'var(--y)', 'Instrumentos'], ['mercado', 'var(--c)', 'Mercados'], ['intermediario', 'var(--o)', 'Intermediarios']];
    const cs = piezas.map(([id, col, tt], i) => {
      const caja = el('div', null, null, e, { position: 'absolute', left: 60 + i * 400 + 'px', top: '150px', width: '360px', height: '440px', border: `2px solid ${col}`, borderRadius: '18px', background: 'var(--bg3)', padding: '28px' });
      el('div', null, tt, caja, { font: '500 34px Fraunces,serif', color: col, marginBottom: '22px' });
      el('div', null, c[id].frase, caja, { fontSize: '22px', lineHeight: 1.45 });
      return caja;
    });
    return (t) => cs.forEach((x, i) => { const k = seg(t, 47 + i * 1.2, 48.2 + i * 1.2); x.style.opacity = k; x.style.transform = `translateY(${(1 - k) * 40}px)`; });
  });

  // 6 · Estructura española
  escena(56, 68, 'Estructura del sistema español', null, (e) => {
    const bde = nodo(e, 480, 120, 320, 70, c.bde.nombre, 'var(--oro)', 26);
    const ban = nodo(e, 70, 300, 520, 50, 'Intermediarios bancarios · crean dinero', 'var(--b)', 22);
    const non = nodo(e, 690, 300, 520, 50, 'Intermediarios no bancarios', 'var(--o)', 22);
    svgFlecha(e, 640, 190, 330, 300, 'var(--b)'); svgFlecha(e, 640, 190, 950, 300, 'var(--o)');
    const izq = ['bancos', 'cajas', 'coop', 'ico'].map((id, i) => nodo(e, 70 + (i % 2) * 265, 380 + Math.floor(i / 2) * 90, 255, 78, c[id].nombre, 'var(--b)', 19));
    const der = ['fondo', 'seguros', 'sgr', 'efc'].map((id, i) => nodo(e, 690 + (i % 2) * 265, 380 + Math.floor(i / 2) * 90, 255, 78, c[id].nombre, 'var(--o)', 19));
    const sup = el('div', null, `Supervisores: ${c.cnmv.nombre} · ${c.dgsfp.nombre}`, e, { position: 'absolute', left: 0, right: 0, bottom: '60px', textAlign: 'center', font: '500 24px "IBM Plex Mono",monospace', color: 'var(--oro2)' });
    return (t) => { [bde, ban, non, ...izq, ...der, sup].forEach((x, i) => { const k = seg(t, 56.8 + i * 0.35, 57.6 + i * 0.35); x.style.opacity = k; }); };
  });

  // 7 · Cierre
  escena(68, 72, null, null, (e) => {
    el('div', null, D.meta.titulo, e, { position: 'absolute', top: '280px', left: '60px', right: '60px', textAlign: 'center', font: '500 54px Fraunces,serif', color: 'var(--oro2)' });
    el('div', null, 'Financial Academy', e, { position: 'absolute', top: '370px', left: 0, right: 0, textAlign: 'center', font: '400 26px "IBM Plex Mono",monospace', color: 'var(--mut)' });
  });
}

window.frame = (t) => {
  for (const s of escenas) {
    const o = Math.min(seg(t, s.a, s.a + 0.6), 1 - seg(t, s.b - 0.6, s.b));
    s.e.style.opacity = o; s.e.style.display = o > 0 ? 'block' : 'none';
    if (o > 0) s.upd(t);
  }
};
window.DUR = DUR;
D = window.DATOS; montar(); window.listo = true; window.frame(0);
