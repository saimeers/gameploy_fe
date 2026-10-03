import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SlugEditor from './SlugEditor'
import { slugify } from '../slug'
import { studentService } from '../services/student.service'

vi.mock('../services/student.service', () => ({
  studentService: { checkSlug: vi.fn(), changeSlug: vi.fn() },
}))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

const PROJECT = { id: 'p1', slug: 'memoria-x7k2ab' }

const answer = (data) => studentService.checkSlug.mockResolvedValue({ data: { data: data } })

const typeSlug = async (user, text) => {
  const input = screen.getByRole('textbox', { name: 'Enlace del juego' })
  await user.clear(input)
  await user.type(input, text)
}

describe('slugify', () => {
  it('normaliza igual que la API', () => {
    expect(slugify('  Mi Juego -- Ñandú  ')).toBe('mi-juego-nandu')
  })
})

describe('SlugEditor', () => {
  beforeEach(() => {
    studentService.changeSlug.mockResolvedValue({})
  })

  it('arranca con el enlace actual y sin poder guardar', () => {
    render(<SlugEditor project={PROJECT} onUpdated={vi.fn()} />)

    expect(screen.getByText('Es el enlace actual de tu juego.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Guardar enlace/ })).toBeDisabled()
  })

  it('comprueba la disponibilidad y guarda el enlace normalizado', async () => {
    const user = userEvent.setup()
    const onUpdated = vi.fn()
    answer({ slug: 'mi-juego', valid: true, available: true })
    render(<SlugEditor project={PROJECT} onUpdated={onUpdated} />)

    await typeSlug(user, 'Mi Juego')
    expect(screen.getByText('Comprobando disponibilidad…')).toBeInTheDocument()
    expect(await screen.findByText('Disponible')).toBeInTheDocument()
    expect(screen.getByText('mi-juego', { selector: 'code' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Guardar enlace/ }))

    expect(studentService.checkSlug).toHaveBeenLastCalledWith('p1', 'mi-juego')
    expect(studentService.changeSlug).toHaveBeenCalledWith('p1', 'mi-juego')
    expect(onUpdated).toHaveBeenCalled()
  })

  it('avisa si el enlace ya está en uso', async () => {
    const user = userEvent.setup()
    answer({ slug: 'ocupado', valid: true, available: false })
    render(<SlugEditor project={PROJECT} onUpdated={vi.fn()} />)

    await typeSlug(user, 'ocupado')

    expect(await screen.findByText('Ya está en uso por otro juego.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Guardar enlace/ })).toBeDisabled()
  })

  it('explica el formato cuando no es válido', async () => {
    const user = userEvent.setup()
    answer({ slug: 'ab', valid: false, available: false })
    render(<SlugEditor project={PROJECT} onUpdated={vi.fn()} />)

    await typeSlug(user, 'ab')

    expect(await screen.findByText('Usa entre 3 y 60 letras, números o guiones.')).toBeInTheDocument()
  })
})
