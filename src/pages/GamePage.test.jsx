import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
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
})
