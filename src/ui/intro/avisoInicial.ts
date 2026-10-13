import urlAviso from '../../assets/intro/triangulo-aviso.png';

const CLAVE_AVISO = 'financial-academy:aviso-inicial';

/** El aviso aparece una vez en cada navegador; también se puede volver a abrir desde Ajustes. */
export function avisoInicialPendiente(): boolean {
  try {
    return localStorage.getItem(CLAVE_AVISO) !== 'vista';
  } catch {
    return true;
  }
}

/** Muestra el aviso centrado sobre la academia y devuelve una función para desmontarlo. */
export function reproducirAvisoInicial(alTerminar: () => void = () => {}): () => void {
  document.querySelectorAll<HTMLElement>('body > [data-aviso-inicial]').forEach((capa) => capa.remove());

  const capa = document.createElement('section');
  capa.className = 'fa-aviso-capa';
  capa.dataset.avisoInicial = '';
  capa.setAttribute('role', 'dialog');
  capa.setAttribute('aria-modal', 'true');
  capa.setAttribute('aria-labelledby', 'fa-aviso-titulo');
  capa.setAttribute('aria-describedby', 'fa-aviso-texto');
  capa.innerHTML = `<div class="fa-aviso-luz" aria-hidden="true"></div>
    <article class="fa-aviso-cartel">
      <p class="fa-aviso-volanta">Financial Academy <span aria-hidden="true">·</span> Ciclo de Administración y Finanzas</p>
      <div class="fa-aviso-icono">
        <svg class="fa-aviso-contorno" viewBox="0 0 100 88" aria-hidden="true"><path d="M50 3 97 85H3Z"/></svg>
        <img src="${urlAviso}" alt="" width="280" height="280">
        <i class="fa-aviso-reflejo" aria-hidden="true"></i>
      </div>
      <h1 id="fa-aviso-titulo" aria-label="Aviso"><span aria-hidden="true">A</span><span aria-hidden="true">V</span><span aria-hidden="true">I</span><span aria-hidden="true">S</span><span aria-hidden="true">O</span></h1>
      <span class="fa-aviso-filete" aria-hidden="true"></span>
      <div class="fa-aviso-texto" id="fa-aviso-texto">
        <p>Herramienta de estudio creada por un alumno del ciclo de Administración y Finanzas.</p>
        <p>Uso personal y educativo.</p>
        <p>No sustituye al material oficial, los libros ni a las clases.</p>
      </div>
      <button type="button" class="btn-principal fa-aviso-continuar">Entrar al selector <span aria-hidden="true">→</span></button>
    </article>`;
  document.body.append(capa);
  document.documentElement.classList.add('fa-aviso-activo');

  const inertes = [...document.body.children].filter(
    (el): el is HTMLElement => el !== capa && el instanceof HTMLElement && !el.inert,
  );
  inertes.forEach((el) => { el.inert = true; });

  const continuar = capa.querySelector<HTMLButtonElement>('.fa-aviso-continuar')!;
  const volverA = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let terminado = false;
  let temporizador = 0;

  const desmontar = (devolverFoco: boolean) => {
    if (terminado) return;
    terminado = true;
    clearTimeout(temporizador);
    document.removeEventListener('keydown', alTeclado);
    capa.remove();
    document.documentElement.classList.remove('fa-aviso-activo');
    inertes.forEach((el) => { el.inert = false; });
    if (devolverFoco && volverA?.isConnected) volverA.focus({ preventScroll: true });
    alTerminar();
  };
  const cerrar = () => {
    if (terminado) return;
    try {
      localStorage.setItem(CLAVE_AVISO, 'vista');
    } catch {
      /* El aviso sigue siendo usable aunque el navegador no guarde preferencias. */
    }
    capa.classList.add('fa-aviso-cerrando');
    temporizador = window.setTimeout(() => desmontar(true), reducido ? 0 : 650);
  };
  const alTeclado = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      cerrar();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      continuar.focus();
    }
  };

  document.addEventListener('keydown', alTeclado);
  continuar.addEventListener('click', cerrar);
  continuar.focus({ preventScroll: true });
  return () => desmontar(false);
}
