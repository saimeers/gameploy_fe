import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import BuildContents from './BuildContents'

const CONTENTS = {
  totalBytes: 3 * 1024 * 1024,
  compressed: false,
  pwa: true,
  files: [
    { path: 'Build/Juego.wasm', size: 2 * 1024 * 1024 },
    { path: 'TemplateData/style.css', size: 900 },
    { path: 'index.html', size: 1200 },
  ],
}

describe('BuildContents', () => {
  it('lista los archivos por carpeta con su tamaño', async () => {
    render(<BuildContents load={vi.fn().mockResolvedValue(CONTENTS)} />)

    expect(await screen.findByText('Build/')).toBeInTheDocument()
    expect(screen.getByText('Juego.wasm')).toBeInTheDocument()
    expect(screen.getByText('2.0 MB')).toBeInTheDocument()
    expect(screen.getByText('3 archivos · 3.0 MB descomprimido')).toBeInTheDocument()
  })

  it('muestra las comprobaciones del build', async () => {
    render(<BuildContents load={vi.fn().mockResolvedValue({ ...CONTENTS, compressed: true, pwa: false })} />)

    expect(await screen.findByText('Comprimido: no cargará')).toBeInTheDocument()
    expect(screen.getByText('Sin plantilla PWA')).toBeInTheDocument()
  })

  it('avisa si no puede leer el .zip', async () => {
    render(<BuildContents load={vi.fn().mockRejectedValue(new Error('404'))} />)

    expect(await screen.findByText('No se pudo leer el contenido del .zip.')).toBeInTheDocument()
  })
})
