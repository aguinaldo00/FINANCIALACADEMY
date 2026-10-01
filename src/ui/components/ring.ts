import { colorDominio } from '../format.ts';

/** Anillo de progreso con el dominio en el centro. */
export function anilloDominio(valor: number, tamano = 58): string {
  const r = 24;
  const c = 2 * Math.PI * r;
  return `<svg class="ring" viewBox="0 0 60 60" width="${tamano}" height="${tamano}"><circle cx="30" cy="30" r="${r}" fill="none" stroke="#262626" stroke-width="7"/><circle cx="30" cy="30" r="${r}" fill="none" stroke="${colorDominio(valor)}" stroke-width="7" stroke-linecap="round" stroke-dasharray="${(c * valor).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 30 30)"/><text x="30" y="35" text-anchor="middle" fill="#fff" font-size="14" font-weight="800" font-family="Bricolage Grotesque">${Math.round(valor * 100)}</text></svg>`;
}
