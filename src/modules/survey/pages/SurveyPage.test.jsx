import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import SurveyPage from './SurveyPage'
import api from '@/services/api'
import { useAuthStore } from '@/store/authStore'

vi.mock('@/services/api', () => ({ default: { get: vi.fn(), post: vi.fn() } }))
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

const renderSurvey = (query = '?momento=tras_jugar&volver=%2Fgames%2Fmemoria') => render(
  <MemoryRouter initialEntries={[`/encuesta${query}`]}>
    <Routes>
      <Route path="/encuesta" element={<SurveyPage />} />
      <Route path="*" element={<p>otra página</p>} />
    </Routes>
  </MemoryRouter>
)

/** Responde las 5 afirmaciones del paso con la misma opción. */
const answerStep = async (user, label = 'De acuerdo') => {
  for (const radio of screen.getAllByRole('radio', { name: label })) await user.click(radio)
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  sessionStorage.clear()
  useAuthStore.setState({ token: null, user: null })
  api.post.mockResolvedValue({ data: { success: true } })
})

describe('SurveyPage', () => {
  it('sin cuenta: recorre los 6 pasos y envía una respuesta anónima', async () => {
    const user = userEvent.setup()
    renderSurvey()

    expect(screen.getByText(/Es anónima: no guardamos tu nombre, correo ni IP/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Empezar/ }))

    // Sobre ti: opcional
    expect(screen.getByRole('heading', { name: 'Sobre ti' })).toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: '18 a 24' }))
    await user.click(screen.getByRole('button', { name: /Siguiente/ }))

    for (let i = 0; i < 4; i++) {
      await answerStep(user, i % 2 ? 'Totalmente de acuerdo' : 'De acuerdo')
      await user.click(screen.getByRole('button', { name: /Siguiente/ }))
    }

    expect(screen.getByText('20 de 20 afirmaciones')).toBeInTheDocument()
    await user.type(screen.getByLabelText('¿Qué mejorarías de Gameploy?'), '  Más ejemplos  ')
    await user.click(screen.getByRole('button', { name: /Enviar respuestas/ }))

    expect(await screen.findByRole('heading', { name: '¡Gracias por tu tiempo!' })).toBeInTheDocument()
    expect(api.post).toHaveBeenCalledWith('/encuesta', {
      version: 1,
      momento: 'tras_jugar',
      sus: [4, 4, 4, 4, 4, 5, 5, 5, 5, 5],
      ux: [4, 4, 4, 4, 4, 5, 5, 5, 5, 5],
      edad: '18_24',
      comentario: 'Más ejemplos',
    })
    expect(JSON.parse(localStorage.getItem('gameploy-encuesta'))).toMatchObject({ respondida: true })
    expect(sessionStorage.getItem('gameploy-encuesta-borrador')).toBeNull()
  })

  it('no avanza con afirmaciones sin responder y señala cuáles faltan', async () => {
    const user = userEvent.setup()
    renderSurvey()
    await user.click(screen.getByRole('button', { name: /Empezar/ }))
    await user.click(screen.getByRole('button', { name: /Siguiente/ }))

    await user.click(screen.getAllByRole('radio', { name: 'De acuerdo' })[0])
    await user.click(screen.getByRole('button', { name: /Siguiente/ }))

    expect(screen.getByText('Te falta responder 4 afirmaciones de este paso.')).toBeInTheDocument()
    expect(screen.getAllByText('Elige una opción para continuar.')).toHaveLength(4)
    expect(screen.getByText('Paso 2 de 6')).toBeInTheDocument()
    // El foco va a la primera que falta
    expect(document.activeElement.name).toBe('sus-1')
  })

  it('se responde con el teclado (flechas dentro de cada afirmación)', async () => {
    const user = userEvent.setup()
    renderSurvey()
    await user.click(screen.getByRole('button', { name: /Empezar/ }))
    await user.click(screen.getByRole('button', { name: /Siguiente/ }))

    const first = screen.getAllByRole('radio', { name: 'Totalmente en desacuerdo' })[0]
    first.focus()
    await user.keyboard('{ArrowRight}{ArrowRight}')

    expect(screen.getAllByRole('radio', { name: 'Ni de acuerdo ni en desacuerdo' })[0]).toBeChecked()
  })

  it('recupera el borrador si se recarga la página', async () => {
    sessionStorage.setItem('gameploy-encuesta-borrador', JSON.stringify({
      version: 1, answers: { sus: [5, 1, 5, 1, 5, null, null, null, null, null] },
    }))
    const user = userEvent.setup()
    renderSurvey()
    await user.click(screen.getByRole('button', { name: /Empezar/ }))
    await user.click(screen.getByRole('button', { name: /Siguiente/ }))

    expect(screen.getAllByRole('radio', { name: 'Totalmente de acuerdo' })[0]).toBeChecked()
    expect(screen.getByText('5 de 20 afirmaciones')).toBeInTheDocument()
  })

  it('en un navegador que ya respondió, permite responder a otra persona', async () => {
    localStorage.setItem('gameploy-encuesta', JSON.stringify({ respondida: true }))
    const user = userEvent.setup()
    renderSurvey()

    expect(screen.getByRole('heading', { name: 'Ya se respondió en este navegador' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Soy otra persona/ }))
    expect(screen.getByRole('button', { name: /Empezar/ })).toBeInTheDocument()
  })

  it('con cuenta que ya respondió, lo dice y no muestra el cuestionario', async () => {
    useAuthStore.setState({ token: 't' })
    api.get.mockResolvedValue({ data: { data: { respondida: true, puede_responder: false } } })
    renderSurvey()

    expect(await screen.findByRole('heading', { name: 'Ya respondiste la encuesta' })).toBeInTheDocument()
  })

  it('el admin no responde', async () => {
    useAuthStore.setState({ token: 't' })
    api.get.mockResolvedValue({ data: { data: { respondida: false, puede_responder: false } } })
    renderSurvey()

    expect(await screen.findByText(/Los administradores no la responden/)).toBeInTheDocument()
  })

  it('si la cuenta ya había respondido (409), agradece igual', async () => {
    sessionStorage.setItem('gameploy-encuesta-borrador', JSON.stringify({
      version: 1, answers: { sus: Array(10).fill(3), ux: Array(10).fill(3) },
    }))
    api.post.mockRejectedValue({ response: { status: 409 } })
    const user = userEvent.setup()
    renderSurvey()
    await user.click(screen.getByRole('button', { name: /Empezar/ }))
    for (let i = 0; i < 5; i++) await user.click(screen.getByRole('button', { name: /Siguiente/ }))
    await user.click(screen.getByRole('button', { name: /Enviar respuestas/ }))

    expect(await screen.findByText(/Ya habíamos recibido tu respuesta/)).toBeInTheDocument()
  })

  it('"Volver" regresa a la página de origen, nunca a un sitio externo', async () => {
    const user = userEvent.setup()
    renderSurvey('?volver=https%3A%2F%2Fmalo.com')

    expect(screen.getByRole('link', { name: 'Salir de la encuesta' })).toHaveAttribute('href', '/')
    localStorage.setItem('gameploy-encuesta', JSON.stringify({ respondida: true }))
    await user.click(screen.getByRole('link', { name: 'Salir de la encuesta' }))
    await waitFor(() => expect(screen.getByText('otra página')).toBeInTheDocument())
  })
})
