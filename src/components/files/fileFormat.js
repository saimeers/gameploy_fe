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

/**
 * Dirección del juego de una versión, o null si no tiene build.
 *
 * La API añade `play_url` al build en las respuestas que el usuario tiene
 * derecho a ver: un enlace firmado al CDN que vence a las pocas horas. Los
 * builds subidos antes del CDN no lo tienen y se cargan desde /play, que solo
 * sirve la versión activa de un proyecto publicado y no privado.
 */
export function gameUrl(projectId, version) {
  const build = version?.archivos?.find(a => a.tipo === 'juego_webgl')
  if (!build) return null
  return build.play_url ?? `${import.meta.env.VITE_API_URL}/play/${projectId}/${version.id}/index.html`
}
