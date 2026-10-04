import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import api from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { canOffer, checkInvite, postponeInvite, safeReturnPath, useSurveyInvite } from './invite'
import SurveyInviteDialog from './components/SurveyInviteDialog'
import SurveyPlayCard, { PLAY_MINUTES } from './components/SurveyPlayCard'

vi.mock('@/services/api', () => ({ default: { get: vi.fn(), post: vi.fn() } }))

const status = (data) => api.get.mockResolvedValue({ data: { data: data } })

function Where() {
  const { pathname, search } = useLocation()
  return <p data-testid="where">{pathname + search}</p>
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  sessionStorage.clear()
  useAuthStore.setState({ token: null })
  useSurveyInvite.setState({ open: false, momento: null })
  api.post.mockResolvedValue({})
})
afterEach(() => vi.useRealTimers())

describe('invitación con cuenta', () => {
  it('la API decide; se muestra una vez por sesión, salvo justo después de publicar', async () => {
    useAuthStore.setState({ token: 't' })
    status({ invitar: true, momento: 'uso_prolongado' })

    await checkInvite()
    expect(useSurveyInvite.getState()).toMatchObject({ open: true, momento: 'uso_prolongado' })

    useSurveyInvite.setState({ open: false })
    await checkInvite()
    expect(useSurveyInvite.getState().open).toBe(false)

    status({ invitar: true, momento: 'primer_proyecto' })
    await checkInvite({ force: true })
    expect(useSurveyInvite.getState()).toMatchObject({ open: true, momento: 'primer_proyecto' })
  })

  it('sin sesión no pregunta a la API', async () => {
    await checkInvite()
    expect(api.get).not.toHaveBeenCalled()
  })

  it('"Ahora no" con cuenta lo guarda la API', async () => {
    useAuthStore.setState({ token: 't' })
    await postponeInvite()
    expect(api.post).toHaveBeenCalledWith('/encuesta/posponer')
  })
})

describe('invitación sin cuenta', () => {
  it('se ofrece hasta que responde o la pospone dos veces', async () => {
    expect(await canOffer()).toBe(true)

    await postponeInvite()
    expect(await canOffer()).toBe(false) // pospuesta 3 días

    localStorage.setItem('gameploy-encuesta', JSON.stringify({ pospuestas: 1, pospuesta_hasta: Date.now() - 1 }))
    expect(await canOffer()).toBe(true)
    localStorage.setItem('gameploy-encuesta', JSON.stringify({ pospuestas: 2 }))
    expect(await canOffer()).toBe(false)
    localStorage.setItem('gameploy-encuesta', JSON.stringify({ respondida: true }))
    expect(await canOffer()).toBe(false)
  })
})

describe('SurveyInviteDialog', () => {
  const renderDialog = () => render(
    <MemoryRouter initialEntries={['/student']}>
      <Routes><Route path="*" element={<><SurveyInviteDialog /><Where /></>} /></Routes>
    </MemoryRouter>
  )

  it('"Responder" lleva a la encuesta con el momento y la página de origen', async () => {
    const user = userEvent.setup()
    useSurveyInvite.setState({ open: true, momento: 'primer_proyecto' })
    renderDialog()

    expect(screen.getByText(/Ya diste un paso importante/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Responder' }))

    expect(screen.getByTestId('where')).toHaveTextContent('/encuesta?momento=primer_proyecto&volver=%2Fstudent')
  })

  it('"Ahora no" la cierra y la pospone', async () => {
    const user = userEvent.setup()
    useAuthStore.setState({ token: 't' })
    useSurveyInvite.setState({ open: true, momento: 'uso_prolongado' })
    renderDialog()

    await user.click(screen.getByRole('button', { name: 'Ahora no' }))

    expect(useSurveyInvite.getState().open).toBe(false)
    expect(api.post).toHaveBeenCalledWith('/encuesta/posponer')
  })
})

describe('SurveyPlayCard', () => {
  const renderCard = (running) => render(
    <MemoryRouter initialEntries={['/games/memoria']}><SurveyPlayCard running={running} /></MemoryRouter>
  )

  it(`aparece tras ${PLAY_MINUTES} minutos de juego, no antes`, async () => {
    vi.useFakeTimers()
    renderCard(true)

    await act(() => vi.advanceTimersByTimeAsync((PLAY_MINUTES * 60 - 1) * 1000))
    expect(screen.queryByText('¿Qué tal tu experiencia en Gameploy?')).not.toBeInTheDocument()

    await act(() => vi.advanceTimersByTimeAsync(1000))
    expect(screen.getByText('¿Qué tal tu experiencia en Gameploy?')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Responder' })).toHaveAttribute('href', '/encuesta?momento=tras_jugar&volver=%2F')
  })

  it('no aparece si el juego no está en marcha, ni a quien ya respondió', async () => {
    vi.useFakeTimers()
    const { unmount } = renderCard(false)
    await act(() => vi.advanceTimersByTimeAsync(PLAY_MINUTES * 60 * 1000))
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
    unmount()

    localStorage.setItem('gameploy-encuesta', JSON.stringify({ respondida: true }))
    renderCard(true)
    await act(() => vi.advanceTimersByTimeAsync(PLAY_MINUTES * 60 * 1000))
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
  })
})

describe('safeReturnPath', () => {
  it('solo acepta rutas internas', () => {
    expect(safeReturnPath('/games/memoria')).toBe('/games/memoria')
    expect(safeReturnPath('https://malo.com')).toBe('/')
    expect(safeReturnPath('//malo.com')).toBe('/')
    expect(safeReturnPath(null)).toBe('/')
  })
})
