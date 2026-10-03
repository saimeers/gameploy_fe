/** Tamaño legible: 512 B, 3.4 KB, 12.8 MB. */
export function formatBytes(bytes) {
  const n = Number(bytes) || 0
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

/** Fecha y hora de subida: "3 oct 2026, 14:20". */
export function formatDateTime(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('es-CO', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false,
  })
}

/** URL del build de una versión, la misma que usa la ficha pública del juego. */
export function playUrl(projectId, versionId) {
  return `${import.meta.env.VITE_API_URL}/play/${projectId}/${versionId}/index.html`
}
