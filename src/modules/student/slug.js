/**
 * Misma normalización de slugs que hace la API, para mostrar al escribir cómo
 * quedará el enlace: minúsculas, sin tildes y palabras unidas por guiones.
 */
export function slugify(text) {
  return String(text ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-')
    .replace(/^-|-$/g, '')
}
