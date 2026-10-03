import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import HoldConfirmDialog from './HoldConfirmDialog'

const renderDialog = (props = {}) => {
  const onConfirm = vi.fn()
  render(
    <HoldConfirmDialog
      open
      onOpenChange={vi.fn()}
      title="Eliminar proyecto"
      description="No se puede deshacer."
      onConfirm={onConfirm}
      {...props}
    >
      <p>Memoria Cognitiva</p>
    </HoldConfirmDialog>
  )
  return { onConfirm, button: screen.getByRole('button', { name: /Mantén pulsado para eliminar/ }) }
}

describe('HoldConfirmDialog', () => {
  afterEach(() => vi.useRealTimers())

  it('muestra qué se va a borrar', () => {
    renderDialog()

    expect(screen.getByRole('heading', { name: 'Eliminar proyecto' })).toBeInTheDocument()
    expect(screen.getByText('Memoria Cognitiva')).toBeInTheDocument()
  })

  it('no confirma con una pulsación corta', () => {
    vi.useFakeTimers()
    const { onConfirm, button } = renderDialog()

    fireEvent.keyDown(button, { key: ' ' })
    act(() => { vi.advanceTimersByTime(500) })
    fireEvent.keyUp(button, { key: ' ' })
    act(() => { vi.advanceTimersByTime(3000) })

    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('confirma al mantenerlo pulsado el tiempo completo', () => {
    vi.useFakeTimers()
    const { onConfirm, button } = renderDialog({ holdTime: 1000 })

    fireEvent.keyDown(button, { key: ' ' })
    act(() => { vi.advanceTimersByTime(1200) })
    act(() => { vi.advanceTimersByTime(700) })

    expect(onConfirm).toHaveBeenCalledTimes(1)
  })
})
