import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import SurveyResultsPage from './SurveyResultsPage'
import { adminService } from '../services/admin.service'

vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))
vi.mock('../services/admin.service', () => ({
  adminService: { getSurveySummary: vi.fn(), downloadSurveyCsv: vi.fn() },
}))

const item = (n, inversa, respuestas) => ({ item: n, inversa, respuestas, acuerdo: 3.5, favorable: 62.5 })
const SUMMARY = {
  version: 1,
  total: 12,
  usabilidad: {
    n: 12, media: 74.5, desviacion: 10.2, ic95: [68, 81], banda: 'buena', referencia: 68,
    bandas: [
      { id: 'pobre', label: 'Pobre', from: 0, to: 51, respuestas: 1 },
      { id: 'mejorable', label: 'Mejorable', from: 51, to: 68, respuestas: 2 },
      { id: 'buena', label: 'Buena', from: 68, to: 80.3, respuestas: 6 },
      { id: 'excelente', label: 'Excelente', from: 80.3, to: 100, respuestas: 3 },
    ],
    histograma: Array.from({ length: 10 }, (_, b) => ({ desde: b * 10, hasta: b * 10 + 10, respuestas: b === 7 ? 6 : b > 4 ? 2 : 0 })),
    items: Array.from({ length: 10 }, (_, i) => item(i + 1, i % 2 === 1, [1, 2, 3, 4, 2])),
  },
  experiencia: {
    n: 12, media: 70.2, desviacion: 12, ic95: [62.6, 77.8], inversos: [4, 8],
    items: Array.from({ length: 10 }, (_, i) => item(i + 1, i === 3 || i === 7, [0, 1, 2, 5, 4])),
  },
  tendencia: [
    { mes: '2026-09', n: 5, usabilidad: 70, experiencia: 65 },
    { mes: '2026-10', n: 7, usabilidad: 77.7, experiencia: 73.9 },
  ],
  participacion: {
    perfil: { estudiante: 8, visitante: 4 },
    momento: { tras_jugar: 7, voluntaria: 5 },
    edad: { '18_24': 9, no_dice: 1, sin_respuesta: 2 },
    genero: {}, experiencia_videojuegos: {}, frecuencia_juego: {}, juegos_serios_previos: {},
  },
  comentarios: [{ fecha: '2026-10-02', perfil: 'estudiante', texto: 'Más ejemplos en la guía' }],
}

// Radix Select usa APIs de puntero que jsdom no implementa
Element.prototype.hasPointerCapture ??= () => false
Element.prototype.releasePointerCapture ??= () => {}
Element.prototype.scrollIntoView ??= () => {}

const renderPage = () => render(<MemoryRouter><SurveyResultsPage /></MemoryRouter>)

beforeEach(() => {
  vi.clearAllMocks()
  adminService.getSurveySummary.mockResolvedValue({ data: { data: SUMMARY } })
})

describe('SurveyResultsPage', () => {
  it('muestra el SUS con su banda, la referencia y el intervalo de confianza', async () => {
    renderPage()

    expect(await screen.findByText('74,5')).toBeInTheDocument()
    // En la etiqueta junto al número y resaltada bajo la escala
    expect(screen.getAllByText('Buena')).toHaveLength(2)
    expect(screen.getByText(/\+6,5 frente al promedio de referencia \(68\)/)).toBeInTheDocument()
    expect(screen.getByText('n = 12 · DE 10,2 · IC 95 %: 68,0–81,0')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /Usabilidad: 74,5 de 100; intervalo de confianza del 95 % entre 68,0 y 81,0/ })).toBeInTheDocument()
    expect(screen.getByText('70,2')).toBeInTheDocument()
  })

  it('cada afirmación lista sus respuestas al enfocarla y marca las inversas', async () => {
    renderPage()
    await screen.findByText('74,5')

    const rows = screen.getAllByRole('listitem', { name: /^2\. Encontré la plataforma innecesariamente compleja/ })
    // Ítem 2 es inverso: [1,2,3,4,2] se lee al revés → Muy desfavorable = 2
    expect(rows[0]).toHaveAccessibleName(/Muy desfavorable: 2 \(17 %\).*Muy favorable: 1 \(8 %\)/)
    expect(within(rows[0]).getByText('inversa')).toBeInTheDocument()
  })

  it('cada gráfico tiene su vista de tabla', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('74,5')

    const [, , susDetail] = screen.getAllByRole('button', { name: /Ver tabla/ })
    await user.click(susDetail)

    const table = screen.getByRole('table', { name: 'Respuestas por afirmación' })
    expect(within(table).getByText('Totalmente en desacuerdo')).toBeInTheDocument()
    expect(within(table).getByText(/^2\. Encontré la plataforma innecesariamente compleja\. \(inversa\)$/)).toBeInTheDocument()
  })

  it('los filtros se aplican a todo y se envían a la API', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('74,5')

    await user.click(screen.getByRole('combobox', { name: 'Perfil' }))
    await user.click(await screen.findByRole('option', { name: 'Docentes' }))

    await waitFor(() => expect(adminService.getSurveySummary).toHaveBeenLastCalledWith({ perfil: 'docente' }))
  })

  it('participación: "Prefiero no decirlo" y "Sin responder" al final, y los comentarios', async () => {
    renderPage()
    await screen.findByText('74,5')

    expect(screen.getByText('18 a 24')).toBeInTheDocument()
    expect(screen.getByText('Sin responder')).toBeInTheDocument()
    expect(screen.getByText('Más ejemplos en la guía')).toBeInTheDocument()
  })

  it('sin respuestas muestra un estado vacío y no permite descargar', async () => {
    adminService.getSurveySummary.mockResolvedValue({ data: { data: { ...SUMMARY, total: 0 } } })
    renderPage()

    expect(await screen.findByText('Aún no hay respuestas con estos filtros')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Descargar CSV/ })).toBeDisabled()
  })

  it('descarga el CSV con los mismos filtros', async () => {
    const user = userEvent.setup()
    adminService.downloadSurveyCsv.mockResolvedValue({ data: new Blob(['a,b']) })
    URL.createObjectURL = vi.fn(() => 'blob:x')
    URL.revokeObjectURL = vi.fn()
    renderPage()
    await screen.findByText('74,5')

    await user.click(screen.getByRole('button', { name: /Descargar CSV/ }))

    expect(adminService.downloadSurveyCsv).toHaveBeenCalledWith({})
    expect(URL.createObjectURL).toHaveBeenCalled()
  })
})
