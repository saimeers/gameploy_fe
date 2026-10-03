const regionNames = new Intl.DisplayNames(['es'], { type: 'region' })

/** Nombre del país en español a partir de su código ISO; null es "Sin ubicación". */
export function countryName(code) {
  if (!code) return 'Sin ubicación'
  try {
    return regionNames.of(code) ?? code
  } catch {
    return code
  }
}

/** Bandera emoji de un código ISO de dos letras (en Windows se ven las letras). */
export function flagEmoji(code) {
  if (!/^[A-Z]{2}$/.test(code ?? '')) return '🌐'
  return String.fromCodePoint(...[...code].map(c => 0x1F1E6 + c.charCodeAt(0) - 65))
}

/**
 * Deja las `max` filas con más visitas y suma el resto en una fila "Otros",
 * para que la lista no crezca sin límite.
 * @param {{ visitas: number }[]} rows ordenadas de mayor a menor
 */
export function foldTail(rows, max) {
  if (rows.length <= max) return rows
  const rest = rows.slice(max - 1).reduce((sum, row) => sum + row.visitas, 0)
  return [...rows.slice(0, max - 1), { other: true, visitas: rest }]
}

/** Porcentaje entero de `value` sobre `total`, sin dividir por cero. */
export function share(value, total) {
  return total > 0 ? Math.round((value / total) * 100) : 0
}
