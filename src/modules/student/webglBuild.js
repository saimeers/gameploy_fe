/**
 * Revisión del .zip de un build Unity WebGL antes de subirlo.
 *
 * El backend sirve cada archivo tal como viene en el .zip y sin la cabecera
 * `Content-Encoding`, así que un build comprimido con Gzip o Brotli no llega a
 * cargar en el navegador: por eso la compresión es un error y no un aviso. La
 * plantilla PWA, en cambio, solo cambia cómo se ajusta el juego al reproductor.
 */

/** Extensiones que deja Unity cuando el build no tiene la compresión en Disabled. */
const COMPRESSED_BUILD = /\.(gz|br|unityweb)$/i

/** Archivos que solo genera la plantilla PWA de Unity. */
const PWA_FILES = ['manifest.webmanifest', 'ServiceWorker.js']

/**
 * @param {string[]} paths Rutas de las entradas del .zip, tal como las da JSZip.
 * @returns {{ errors: string[], warnings: string[] }}
 */
export function inspectWebGLZip(paths) {
  // Las entradas __MACOSX/ son metadatos del compresor de macOS, no del build.
  const entries = paths.filter(p => !p.startsWith('__MACOSX/'))

  // Si el build va dentro de una carpeta, la raíz es la de su index.html.
  const index = entries
    .filter(p => p === 'index.html' || p.endsWith('/index.html'))
    .sort((a, b) => a.length - b.length)[0]

  if (!index) return { errors: ['Falta index.html'], warnings: [] }

  const root = index.slice(0, -'index.html'.length)
  const within = dir => entries.filter(p => p.startsWith(`${root}${dir}`))
  const build = within('Build/')

  const errors = []
  if (!build.length) errors.push('Falta la carpeta Build')
  if (!within('TemplateData/').length) errors.push('Falta la carpeta TemplateData')

  if (build.some(p => COMPRESSED_BUILD.test(p))) {
    errors.push('El build está comprimido: en Publishing Settings pon Compression Format en Disabled y vuelve a generarlo')
  } else if (build.length) {
    if (!build.some(p => p.endsWith('.loader.js')))    errors.push('Falta .loader.js')
    if (!build.some(p => p.endsWith('.framework.js'))) errors.push('Falta .framework.js')
    if (!build.some(p => p.endsWith('.data')))         errors.push('Falta .data')
    if (!build.some(p => p.endsWith('.wasm')))         errors.push('Falta .wasm')
  }

  const warnings = []
  if (!PWA_FILES.some(f => entries.includes(`${root}${f}`))) {
    warnings.push('No se detectó la plantilla PWA: el juego puede no ajustarse al reproductor ni a la pantalla completa')
  }

  return { errors, warnings }
}
