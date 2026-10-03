import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import GamePage from './GamePage'
import api from '@/services/api'
import { ThemeProviderContext } from '@/components/theme-context'

vi.mock('@/services/api', () => ({ default: { get: vi.fn() } }))
vi.mock('@/pages/home/Navbar', () => ({ default: () => null }))

const PROJECT = {
  id: 'p1', slug: 'nuevo-enlace', nombre: 'Memoria Cognitiva', usuario: { nombre: 'Ana' },
  versiones: [], controles: [], comentarios: [], etiquetas: [], _count: { visitas: 3 },
}

const PLAY_URL = 'https://cdn-gameploy.saimers.dev/t/1790000000.firma/builds/b1/index.html'
const WITH_FILES = {
  ...PROJECT,
  slug: 'memoria',
  versiones: [{
    id: 'v1',
    numero_version: '1.0.0',
    archivos: [
      { id: 'a1', tipo: 'juego_webgl', play_url: PLAY_URL },
      { id: 'a2', tipo: 'portada', url: 'https://cdn-gameploy.saimers.dev/t/1.x/media/m1/portada.png' },
      { id: 'a3', tipo: 'captura', url: 'https://cdn-gameploy.saimers.dev/t/1.x/media/m2/captura.png' },
    ],
  }],
}

const renderAt = (path) => render(
  <ThemeProviderContext.Provider value={{ theme: 'dark', setTheme: vi.fn() }}>
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/games/:slug" element={<><GamePage /><CurrentPath /></>} />
      </Routes>
    </MemoryRouter>
  </ThemeProviderContext.Provider>
)

function CurrentPath() {
  return <p data-testid="path">{useLocation().pathname}</p>
}

describe('GamePage', () => {
  it('lleva un enlace antiguo al actual sin volver a pedir el proyecto', async () => {
    api.get.mockResolvedValue({ data: { data: PROJECT } })

    render(
      <ThemeProviderContext.Provider value={{ theme: 'dark', setTheme: vi.fn() }}>
        <MemoryRouter initialEntries={['/games/enlace-viejo']}>
          <Routes>
            <Route path="/games/:slug" element={<><GamePage /><CurrentPath /></>} />
          </Routes>
        </MemoryRouter>
      </ThemeProviderContext.Provider>
    )

    expect(await screen.findByRole('heading', { name: 'Memoria Cognitiva' })).toBeInTheDocument()
    await waitFor(() => expect(screen.getByTestId('path')).toHaveTextContent('/games/nuevo-enlace'))
    // Una sola petición: la visita no se cuenta dos veces.
    expect(api.get.mock.calls.filter(([url]) => url.startsWith('/public/games/'))).toEqual([['/public/games/enlace-viejo']])
  })

  it('usa los enlaces firmados de la API y no pide nada más', async () => {
    api.get.mockReset()
    api.get.mockResolvedValue({ data: { data: WITH_FILES } })
    const user = userEvent.setup()
    const { container } = renderAt('/games/memoria')

    await user.click(await screen.findByRole('button', { name: 'Jugar Memoria Cognitiva' }))

    expect(screen.getByTitle('Memoria Cognitiva')).toHaveAttribute('src', PLAY_URL)
    expect(container.querySelector('img[alt="captura"]')).toHaveAttribute('src', WITH_FILES.versiones[0].archivos[2].url)
    // La ficha cuesta una sola petición a la API: juego e imágenes van al CDN.
    expect(api.get).toHaveBeenCalledTimes(1)
  })

  it('"Nueva pestaña" abre la página del juego en el frontend, no la API', async () => {
    api.get.mockResolvedValue({ data: { data: WITH_FILES } })
    renderAt('/games/memoria')

    const link = await screen.findByRole('link', { name: 'Abrir en una pestaña nueva' })
    expect(link).toHaveAttribute('href', '/games/memoria/jugar')
  })

  it('explica cuando el proyecto es privado o no está publicado', async () => {
    api.get.mockRejectedValue({ response: { status: 403 } })
    renderAt('/games/secreto')

    expect(await screen.findByRole('heading', { name: 'Proyecto no disponible' })).toBeInTheDocument()
  })
})
