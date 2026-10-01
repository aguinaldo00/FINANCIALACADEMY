import { GLYPHS } from '../icons/glyphs.ts';
import type { Tema } from './schema.ts';

/** Devuelve la lista de incoherencias del tema; vacía si es válido. */
export function validarTema(tema: Tema): string[] {
  const errores: string[] = [];
  const duplicados = (ids: string[]) => ids.filter((id, i) => ids.indexOf(id) !== i);

  for (const id of duplicados(tema.grupos.map((g) => g.id))) errores.push(`Grupo duplicado: ${id}`);
  for (const id of duplicados(tema.secciones.map((s) => s.id))) errores.push(`Sección duplicada: ${id}`);
  for (const id of duplicados(tema.conceptos.map((c) => c.id))) errores.push(`Concepto duplicado: ${id}`);

  const grupos = new Set(tema.grupos.map((g) => g.id));
  for (const s of tema.secciones) {
    if (!grupos.has(s.grupoId)) errores.push(`Sección ${s.id}: grupo inexistente ${s.grupoId}`);
    if (!(s.pesoExamen >= 0)) errores.push(`Sección ${s.id}: peso no válido`);
  }

  const secciones = new Set(tema.secciones.map((s) => s.id));
  for (const c of tema.conceptos) {
    if (!secciones.has(c.seccionId)) errores.push(`Concepto ${c.id}: sección inexistente ${c.seccionId}`);
    for (const g of c.iconos) if (!(g in GLYPHS)) errores.push(`Concepto ${c.id}: glifo inexistente ${g}`);
    if (c.explicaciones.length !== tema.modos.length) {
      errores.push(`Concepto ${c.id}: ${c.explicaciones.length} explicaciones para ${tema.modos.length} modos`);
    }
    const { opciones, indiceCorrecta } = c.pregunta;
    if (!Number.isInteger(indiceCorrecta) || indiceCorrecta < 0 || indiceCorrecta >= opciones.length) {
      errores.push(`Concepto ${c.id}: respuesta correcta fuera de rango`);
    }
  }

  const conceptos = new Set(tema.conceptos.map((c) => c.id));
  for (const e of tema.ciudad.edificios) {
    if (!conceptos.has(e.conceptoId)) errores.push(`Edificio: concepto inexistente ${e.conceptoId}`);
  }

  return errores;
}
