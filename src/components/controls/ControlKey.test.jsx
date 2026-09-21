import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ControlKey from './ControlKey'

const CONTROL = { id: 'c1', tecla_boton: 'W', descripcion_accion: 'Avanzar' }

describe('ControlKey', () => {
  it('avisa de la acción asignada en el tooltip', () => {
    render(<ControlKey label="W" assigned={CONTROL} />)

    expect(screen.getByTitle('W — Avanzar')).toBeInTheDocument()
  })

  it('llama a onSelect con su tecla al pulsarla', async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()
    render(<ControlKey label="W" onSelect={onSelect} />)

    await user.click(screen.getByRole('button'))

    expect(onSelect).toHaveBeenCalledWith('W')
  })

  it('en modo lectura una tecla libre no es interactiva', () => {
    render(<ControlKey label="W" readOnly />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('en modo lectura una tecla asignada sí se puede consultar', async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()
    render(<ControlKey label="W" assigned={CONTROL} readOnly onSelect={onSelect} />)

    await user.click(screen.getByRole('button'))

    expect(onSelect).toHaveBeenCalledWith('W')
  })

  it('anuncia cuál es la tecla seleccionada', () => {
    render(<ControlKey label="W" selected onSelect={vi.fn()} />)

    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
  })
})
