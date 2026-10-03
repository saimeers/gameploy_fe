import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GamePlayer from './GamePlayer'

const SRC = 'http://localhost:3000/api/v1/play/p1/v1/index.html'

const renderPlayer = (props = {}) =>
  render(<GamePlayer src={SRC} title="Memoria Cognitiva" version="1.2.0" {...props} />)

describe('GamePlayer', () => {
  afterEach(() => {
    delete document.fullscreenElement
    document.body.style.overflow = ''
  })

  it('avisa cuando la versión no tiene juego', () => {
    render(<GamePlayer src={null} title="Sin build" />)

    expect(screen.getByText('No hay archivos del juego disponibles.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Pantalla completa/ })).not.toBeInTheDocument()
  })

  it('muestra la portada sin cargar el juego hasta que se pulsa jugar', () => {
    const { container } = renderPlayer({ coverUrl: 'https://cdn/portada.png' })

    expect(screen.queryByTitle('Memoria Cognitiva')).not.toBeInTheDocument()
    // La portada es decorativa (alt vacío), así que no tiene rol accesible.
    expect(container.querySelector('img')).toHaveAttribute('src', 'https://cdn/portada.png')
    expect(screen.getByText('v1.2.0')).toBeInTheDocument()
  })

  it('carga el build en un iframe al pulsar jugar', async () => {
    const user = userEvent.setup()
    renderPlayer()

    await user.click(screen.getByRole('button', { name: 'Jugar Memoria Cognitiva' }))

    const iframe = screen.getByTitle('Memoria Cognitiva')
    expect(iframe).toHaveAttribute('src', SRC)
    expect(iframe.getAttribute('allow')).toContain('gamepad')
    expect(screen.getByText('Cargando juego…')).toBeInTheDocument()

    fireEvent.load(iframe)
    expect(screen.getByText('En ejecución')).toBeInTheDocument()
  })

  it('reinicia el juego montando un iframe nuevo', async () => {
    const user = userEvent.setup()
    renderPlayer()
    await user.click(screen.getByRole('button', { name: 'Jugar Memoria Cognitiva' }))
    const first = screen.getByTitle('Memoria Cognitiva')
    fireEvent.load(first)

    await user.click(screen.getByRole('button', { name: 'Reiniciar juego' }))

    expect(screen.getByTitle('Memoria Cognitiva')).not.toBe(first)
    expect(screen.getByText('Cargando juego…')).toBeInTheDocument()
  })

  it('ofrece abrir el juego en una pestaña nueva', () => {
    renderPlayer()

    const link = screen.getByRole('link', { name: 'Abrir en una pestaña nueva' })
    expect(link).toHaveAttribute('href', SRC)
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('pone el marco del juego en pantalla completa con la Fullscreen API', async () => {
    const user = userEvent.setup()
    renderPlayer()
    const frame = screen.getByTestId('game-frame')
    frame.requestFullscreen = vi.fn(async () => {
      document.fullscreenElement = frame
      document.dispatchEvent(new Event('fullscreenchange'))
    })

    await user.click(screen.getByRole('button', { name: /Pantalla completa/ }))

    expect(frame.requestFullscreen).toHaveBeenCalled()
    expect(frame).toHaveAttribute('data-fullscreen', 'native')
    // Pulsar pantalla completa también arranca el juego.
    expect(screen.getByTitle('Memoria Cognitiva')).toBeInTheDocument()
  })

  it('usa el modo inmersivo donde no hay Fullscreen API, y sale con Escape', async () => {
    const user = userEvent.setup()
    renderPlayer()
    const frame = screen.getByTestId('game-frame')

    await user.click(screen.getByRole('button', { name: /Pantalla completa/ }))

    expect(frame).toHaveAttribute('data-fullscreen', 'fallback')
    expect(document.body.style.overflow).toBe('hidden')

    await user.keyboard('{Escape}')

    expect(frame).not.toHaveAttribute('data-fullscreen')
    expect(document.body.style.overflow).toBe('')
  })

  it('sale del modo inmersivo con su botón', async () => {
    const user = userEvent.setup()
    renderPlayer()

    await user.click(screen.getByRole('button', { name: /Pantalla completa/ }))
    await user.click(screen.getByRole('button', { name: 'Salir de pantalla completa' }))

    expect(screen.getByTestId('game-frame')).not.toHaveAttribute('data-fullscreen')
  })
})
