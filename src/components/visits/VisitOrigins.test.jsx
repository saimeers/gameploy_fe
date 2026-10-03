import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import VisitOrigins from './VisitOrigins'

const STATS = {
  total: 10,
  days: 30,
  countries: [
    { codigo_pais: 'CO', visitas: 7 },
    { codigo_pais: 'MX', visitas: 2 },
    { codigo_pais: null, visitas: 1 },
  ],
  cities: [
    { codigo_pais: 'CO', region: 'NSA', ciudad: 'Cúcuta', visitas: 5 },
    { codigo_pais: 'MX', region: 'CMX', ciudad: 'Ciudad de México', visitas: 2 },
  ],
}

describe('VisitOrigins', () => {
  it('resume el total, los países y la ciudad principal', async () => {
    render(<VisitOrigins load={vi.fn().mockResolvedValue(STATS)} />)

    expect(await screen.findByText('Cúcuta', { selector: 'p' })).toBeInTheDocument()
    expect(screen.getByText('Más visitas: Colombia')).toBeInTheDocument()
    expect(screen.getByLabelText('🇨🇴 Colombia: 7 visitas, 70% del total')).toBeInTheDocument()
    expect(screen.getByLabelText('Cúcuta: 5 visitas, 50% del total')).toBeInTheDocument()
  })

  it('explica las visitas sin ubicación', async () => {
    render(<VisitOrigins load={vi.fn().mockResolvedValue(STATS)} />)

    expect(await screen.findByLabelText('Sin ubicación: 1 visitas, 10% del total')).toBeInTheDocument()
    expect(screen.getByText(/agrupa las visitas anteriores/)).toBeInTheDocument()
  })

  it('pide los últimos 30 días y vuelve a pedir al cambiar de periodo', async () => {
    const user = userEvent.setup()
    const load = vi.fn().mockResolvedValue(STATS)
    render(<VisitOrigins load={load} />)
    await screen.findByText('Más visitas: Colombia')

    await user.click(screen.getByRole('button', { name: 'Todo' }))

    expect(load.mock.calls.map(c => c[0])).toEqual([30, null])
    expect(screen.getByRole('button', { name: 'Todo' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('avisa cuando no hay visitas', async () => {
    render(<VisitOrigins load={vi.fn().mockResolvedValue({ total: 0, countries: [], cities: [] })} />)

    expect(await screen.findByText('Todavía no hay visitas en este periodo.')).toBeInTheDocument()
  })

  it('avisa si no se pueden cargar', async () => {
    render(<VisitOrigins load={vi.fn().mockRejectedValue(new Error('500'))} />)

    expect(await screen.findByText('No se pudieron cargar las visitas.')).toBeInTheDocument()
  })
})
