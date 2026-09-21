import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import ProfilePage from './ProfilePage'
import { profileService } from '../services/profile.service'

vi.mock('../services/profile.service', () => ({
  profileService: {
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    getFileUrl: vi.fn(() => Promise.resolve({ data: { data: { url: 'https://portada' } } })),
  },
}))

const PROFILE = {
  id: 'u1',
  nombre: 'Saimer Saavedra',
  correo: 'saimer@ufps.edu.co',
  fecha_registro: '2026-02-10T00:00:00.000Z',
  foto_perfil: null,
  rol: { nombre: 'estudiante' },
  _count: { proyectos: 3, comentarios: 0 },
  proyectos: [
    {
      id: 'p1',
      nombre: 'Memoria Visual',
      descripcion: 'Juego de memoria',
      slug: 'memoria-visual-x7k2',
      visibilidad: 'publico',
      fecha_publicacion: '2026-03-01T00:00:00.000Z',
      categoria: { id: 1, nombre: 'Cognitivo' },
      versiones: [],
      _count: { visitas: 12, comentarios: 2 },
    },
  ],
}

const renderPage = () => render(<MemoryRouter><ProfilePage /></MemoryRouter>)

beforeEach(() => {
  profileService.getProfile.mockResolvedValue({ data: { data: PROFILE } })
})

describe('ProfilePage', () => {
  it('muestra los datos básicos de la cuenta', async () => {
    renderPage()

    expect(await screen.findByText('Saimer Saavedra')).toBeInTheDocument()
    expect(screen.getByText('saimer@ufps.edu.co')).toBeInTheDocument()
    expect(screen.getByText('Estudiante')).toBeInTheDocument()
  })

  it('lista los proyectos publicados con sus métricas', async () => {
    renderPage()

    expect(await screen.findByText('Memoria Visual')).toBeInTheDocument()
    expect(screen.getByText('Cognitivo')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
  })

  it('enlaza cada proyecto a su ficha pública', async () => {
    renderPage()

    const enlace = await screen.findByTitle('Ver la ficha pública')
    expect(enlace).toHaveAttribute('href', '/games/memoria-visual-x7k2')
  })

  it('invita a crear uno cuando no hay publicados', async () => {
    profileService.getProfile.mockResolvedValue({
      data: { data: { ...PROFILE, proyectos: [] } },
    })
    renderPage()

    expect(await screen.findByText(/Todavía no has publicado/)).toBeInTheDocument()
  })

  it('guarda el nombre editado', async () => {
    profileService.updateProfile.mockResolvedValue({
      data: { data: { ...PROFILE, nombre: 'Saimer S.' } },
    })
    const user = userEvent.setup()
    renderPage()

    await user.click(await screen.findByTitle('Editar nombre'))
    const input = screen.getByLabelText('Nombre')
    await user.clear(input)
    await user.type(input, 'Saimer S.')
    await user.click(screen.getByRole('button', { name: /Guardar/ }))

    expect(profileService.updateProfile).toHaveBeenCalledWith({ nombre: 'Saimer S.' })
    expect(await screen.findByText('Saimer S.')).toBeInTheDocument()
  })

  it('no envía un nombre vacío', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(await screen.findByTitle('Editar nombre'))
    await user.clear(screen.getByLabelText('Nombre'))
    await user.click(screen.getByRole('button', { name: /Guardar/ }))

    expect(profileService.updateProfile).not.toHaveBeenCalled()
  })
})
