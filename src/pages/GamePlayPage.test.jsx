import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import GamePlayPage from './GamePlayPage'
import api from '@/services/api'

vi.mock('@/services/api', () => ({ default: { get: vi.fn() } }))

const PLAY_URL = 'https://cdn-gameploy.saimers.dev/t/1790000000.firma/builds/b1/index.html'
const PROJECT = {
  id: 'p1', slug: 'memoria', nombre: 'Memoria Cognitiva',
  versiones: [{ id: 'v1', numero_version: '1.0.0', archivos: [{ id: 'a1', tipo: 'juego_webgl', play_url: PLAY_URL }] }],
}

function CurrentPath() {
  return <p data-testid="path">{useLocation().pathname}</p>
}

const renderAt = (path) => render(
  <MemoryRouter initialEntries={[path]}>
    <Routes>
      <Route path="/games/:slug/jugar" element={<><GamePlayPage /><CurrentPath /></>} />
    </Routes>
  </MemoryRouter>
)

// Con llaves: una función devuelta por beforeEach se ejecuta como limpieza.
beforeEach(() => { api.get.mockReset() })

describe('GamePlayPage', () => {
  it('carga el juego directamente, con el enlace firmado de la ficha', async () => {
    api.get.mockResolvedValue({ data: { data: PROJECT } })
    renderAt('/games/memoria/jugar')

    expect(await screen.findByTitle('Memoria Cognitiva')).toHaveAttribute('src', PLAY_URL)
    expect(api.get).toHaveBeenCalledWith('/public/games/memoria')
    expect(screen.getByRole('link', { name: /Ficha del juego/ })).toHaveAttribute('href', '/games/memoria')
    // Dentro de la página ya no se ofrece otra pestaña.
    expect(screen.queryByRole('link', { name: 'Abrir en una pestaña nueva' })).not.toBeInTheDocument()
  })

  it('aplica las mismas reglas que la ficha: privado o borrador no se muestra', async () => {
    api.get.mockRejectedValue({ response: { status: 403 } })
    renderAt('/games/secreto/jugar')

    expect(await screen.findByRole('heading', { name: 'Proyecto no disponible' })).toBeInTheDocument()
    expect(document.querySelector('iframe')).toBeNull()
  })

  it('lleva un enlace antiguo al actual, sin salir de la página de juego', async () => {
    api.get.mockResolvedValue({ data: { data: PROJECT } })
    renderAt('/games/enlace-viejo/jugar')

    await waitFor(() => expect(screen.getByTestId('path')).toHaveTextContent('/games/memoria/jugar'))
    expect(api.get).toHaveBeenCalledTimes(1)
  })
})
