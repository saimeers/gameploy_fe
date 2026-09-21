import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ControlsViewer from './ControlsViewer'

const CONTROLS = [
  { id: 'c1', tipo_entrada: 'teclado', tecla_boton: 'W',     descripcion_accion: 'Avanzar' },
  { id: 'c2', tipo_entrada: 'teclado', tecla_boton: 'Shift', descripcion_accion: 'Correr' },
  { id: 'c3', tipo_entrada: 'mouse',   tecla_boton: 'Click izquierdo', descripcion_accion: 'Disparar' },
]

describe('ControlsViewer', () => {
  it('no renderiza nada si el proyecto no tiene controles', () => {
    const { container } = render(<ControlsViewer controls={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('muestra una ficha por tipo de entrada usado, con su conteo', () => {
    render(<ControlsViewer controls={CONTROLS} />)

    expect(screen.getByRole('button', { name: /Teclado/ })).toHaveTextContent('2')
    expect(screen.getByRole('button', { name: /Mouse/ })).toHaveTextContent('1')
  })

  it('omite los tipos de entrada que el proyecto no usa', () => {
    render(<ControlsViewer controls={CONTROLS} />)

    expect(screen.queryByRole('button', { name: /Mando/ })).not.toBeInTheDocument()
  })

  it('invita a consultar una tecla mientras no haya ninguna elegida', () => {
    render(<ControlsViewer controls={CONTROLS} />)

    expect(screen.getByText(/Pasa el cursor o haz clic/)).toBeInTheDocument()
  })

  it('muestra la acción de la tecla al hacer clic sobre ella', async () => {
    const user = userEvent.setup()
    render(<ControlsViewer controls={CONTROLS} />)

    await user.click(screen.getByTitle('W — Avanzar'))

    expect(screen.getByText('Avanzar')).toBeInTheDocument()
  })

  it('cambia de diagrama al elegir otro tipo de entrada', async () => {
    const user = userEvent.setup()
    render(<ControlsViewer controls={CONTROLS} />)

    await user.click(screen.getByRole('button', { name: /Mouse/ }))

    expect(screen.getByRole('img', { name: /mouse/i })).toBeInTheDocument()
  })
})
