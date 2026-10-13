// Interruptor de zonas cerradas de momento. Para reabrir 'Sobre el proyecto', pon false.
export const PROYECTO_BLOQUEADO = true;

// Oculta todos los enlaces a #proyecto (portada, barra de Academia, menu lateral...).
if (PROYECTO_BLOQUEADO && typeof document !== 'undefined') {
  const estilo = document.createElement('style');
  estilo.textContent = 'a[href="#proyecto"], a[href^="#proyecto/"] { display: none !important; }';
  document.head.append(estilo);
}
