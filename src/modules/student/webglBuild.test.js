import { describe, it, expect } from 'vitest'
import { inspectWebGLZip } from './webglBuild'

/** Build con la configuración que pide Gameploy: plantilla PWA y sin compresión. */
const PWA_BUILD = [
  'index.html',
  'manifest.webmanifest',
  'ServiceWorker.js',
  'Build/',
  'Build/Juego.loader.js',
  'Build/Juego.framework.js',
  'Build/Juego.data',
  'Build/Juego.wasm',
  'TemplateData/',
  'TemplateData/style.css',
]

describe('inspectWebGLZip', () => {
  it('acepta un build PWA sin compresión en la raíz del .zip', () => {
    expect(inspectWebGLZip(PWA_BUILD)).toEqual({ errors: [], warnings: [] })
  })

  it('acepta el build dentro de una carpeta', () => {
    const nested = PWA_BUILD.map(p => `Juego_Web/${p}`)

    expect(inspectWebGLZip(nested)).toEqual({ errors: [], warnings: [] })
  })

  it('ignora las entradas __MACOSX que añade el compresor de macOS', () => {
    const paths = [...PWA_BUILD, '__MACOSX/Build/._Juego.data.gz']

    expect(inspectWebGLZip(paths).errors).toEqual([])
  })

  it('rechaza un build comprimido con Gzip y explica cómo desactivarlo', () => {
    const gzip = PWA_BUILD.map(p => p.replace(/\.(framework\.js|data|wasm)$/, '.$1.gz'))

    const { errors } = inspectWebGLZip(gzip)

    expect(errors).toHaveLength(1)
    expect(errors[0]).toMatch(/Compression Format en Disabled/)
  })

  it('rechaza un build comprimido con Brotli', () => {
    const brotli = PWA_BUILD.map(p => p.replace(/\.wasm$/, '.wasm.br'))

    expect(inspectWebGLZip(brotli).errors[0]).toMatch(/comprimido/)
  })

  it('señala cada archivo del build que falte', () => {
    const paths = PWA_BUILD.filter(p => !p.endsWith('.wasm') && !p.endsWith('.data'))

    expect(inspectWebGLZip(paths).errors).toEqual(['Falta .data', 'Falta .wasm'])
  })

  it('exige index.html, Build y TemplateData', () => {
    expect(inspectWebGLZip(['Build/Juego.wasm']).errors).toEqual(['Falta index.html'])
    expect(inspectWebGLZip(['index.html', 'manifest.webmanifest']).errors)
      .toEqual(['Falta la carpeta Build', 'Falta la carpeta TemplateData'])
  })

  it('avisa, sin bloquear, si el build no usa la plantilla PWA', () => {
    const defaultTemplate = PWA_BUILD.filter(p => !['manifest.webmanifest', 'ServiceWorker.js'].includes(p))

    const { errors, warnings } = inspectWebGLZip(defaultTemplate)

    expect(errors).toEqual([])
    expect(warnings[0]).toMatch(/plantilla PWA/)
  })
})
