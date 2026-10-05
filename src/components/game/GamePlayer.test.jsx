import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GamePlayer from './GamePlayer'

const SRC = 'https://cdn-gameploy.saimers.dev/t/1790000000.firma/builds/b1/index.html'

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
    expect(screen.getByText('Conectando con el servidor…')).toBeInTheDocument()

    // Sin mensajes de progreso (API antigua o página que no es Unity), basta con
    // que el iframe cargue para darlo por listo.
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
    expect(screen.getByText('Conectando con el servidor…')).toBeInTheDocument()
  })

  it('abre en una pestaña nueva la página del frontend, nunca el enlace del juego', () => {
    renderPlayer({ newTabHref: '/games/memoria/jugar' })

    const link = screen.getByRole('link', { name: 'Abrir en una pestaña nueva' })
    expect(link).toHaveAttribute('href', '/games/memoria/jugar')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('sin página para la pestaña nueva, no ofrece el botón', () => {
    renderPlayer()

    expect(screen.queryByRole('link', { name: 'Abrir en una pestaña nueva' })).not.toBeInTheDocument()
  })

  it('con autoStart carga el juego sin pasar por la portada', () => {
    renderPlayer({ autoStart: true })

    expect(screen.getByTitle('Memoria Cognitiva')).toHaveAttribute('src', SRC)
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

  describe('progreso de carga', () => {
    /** Mensaje del script que la API inyecta en el index.html del juego. */
    const post = (iframe, data) => act(() => {
      window.dispatchEvent(new MessageEvent('message', {
        data: { source: 'gameploy-player', ...data },
        source: iframe.contentWindow,
      }))
    })

    const startGame = async () => {
      const user = userEvent.setup()
      renderPlayer()
      await user.click(screen.getByRole('button', { name: 'Jugar Memoria Cognitiva' }))
      return { user, iframe: screen.getByTitle('Memoria Cognitiva') }
    }

    it('muestra el porcentaje de descarga que envía Unity', async () => {
      const { iframe } = await startGame()

      post(iframe, { type: 'boot' })
      post(iframe, { type: 'progress', value: 0.45 })

      expect(screen.getByText('Descargando el juego · 50%')).toBeInTheDocument()
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50')
      expect(screen.getByText('Cargando… 50%')).toBeInTheDocument()
    })

    it('sigue cargando aunque el iframe termine, hasta que Unity avisa que está listo', async () => {
      const { iframe } = await startGame()
      post(iframe, { type: 'progress', value: 0.2 })

      fireEvent.load(iframe)
      expect(screen.getByRole('progressbar')).toBeInTheDocument()

      post(iframe, { type: 'progress', value: 0.95 })
      expect(screen.getByText('Iniciando el juego…')).toBeInTheDocument()

      post(iframe, { type: 'ready' })
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
      expect(screen.getByText('En ejecución')).toBeInTheDocument()
    })

    it('ignora mensajes de otras ventanas', async () => {
      await startGame()

      act(() => {
        window.dispatchEvent(new MessageEvent('message', {
          data: { source: 'gameploy-player', type: 'ready' },
          source: window,
        }))
      })

      expect(screen.getByText('Conectando con el servidor…')).toBeInTheDocument()
    })

    it('muestra el error y permite reintentar', async () => {
      const { user, iframe } = await startGame()

      post(iframe, { type: 'error', message: 'Out of memory' })
      expect(screen.getByRole('alert')).toHaveTextContent('No se pudo cargar el juego')
      expect(screen.getByText('Out of memory')).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: /Reintentar/ }))
      expect(screen.getByTitle('Memoria Cognitiva')).not.toBe(iframe)
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('explica la espera cuando la carga se alarga', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      try {
        const { iframe } = await startGame()
        post(iframe, { type: 'progress', value: 0.1 })

        act(() => { vi.advanceTimersByTime(9000) })

        expect(screen.getByText(/La primera vez tarda más/)).toBeInTheDocument()
      } finally {
        vi.useRealTimers()
      }
    })
  })

  describe('teléfono en vertical', () => {
    /** Hace que solo la consulta del teléfono en vertical coincida. */
    const portrait = (matches) => {
      window.matchMedia.mockImplementation(query => ({
        matches: matches && query.includes('orientation: portrait'),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))
    }

    afterEach(() => { portrait(false) })

    it('anuncia en la portada que hay que girar el teléfono', () => {
      portrait(true)
      renderPlayer()

      expect(screen.getByText('Gira el teléfono para jugar')).toBeInTheDocument()
      expect(screen.queryByText('Mejor en pantalla completa')).not.toBeInTheDocument()
    })

    it('tapa el juego con el aviso de girar en cuanto arranca', async () => {
      const user = userEvent.setup()
      portrait(true)
      renderPlayer()

      await user.click(screen.getByRole('button', { name: 'Jugar Memoria Cognitiva' }))

      expect(screen.getByRole('alertdialog', { name: 'Gira el dispositivo para jugar' })).toBeInTheDocument()
      // El juego sí carga por detrás: al girar ya está listo para jugarse.
      expect(screen.getByTitle('Memoria Cognitiva')).toBeInTheDocument()
    })

    it('intenta girar la pantalla al pulsar jugar, usando ese gesto', async () => {
      const user = userEvent.setup()
      const lock = vi.fn().mockResolvedValue(undefined)
      // `screen` aquí es el de Testing Library: el del navegador es window.screen.
      Object.defineProperty(window.screen, 'orientation', { value: { lock }, configurable: true })
      portrait(true)
      renderPlayer()
      const frame = screen.getByTestId('game-frame')
      frame.requestFullscreen = vi.fn(async () => {
        document.fullscreenElement = frame
        document.dispatchEvent(new Event('fullscreenchange'))
      })

      await user.click(screen.getByRole('button', { name: 'Jugar Memoria Cognitiva' }))

      expect(frame.requestFullscreen).toHaveBeenCalled()
      expect(lock).toHaveBeenCalledWith('landscape')
    })

    it('deja pasar a quien tiene el giro bloqueado en el sistema', async () => {
      const user = userEvent.setup()
      portrait(true)
      renderPlayer({ autoStart: true })

      await user.click(screen.getByRole('button', { name: 'Jugar en vertical de todas formas' }))

      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    })

    it('no estorba en el computador ni con la ventana estrecha', async () => {
      const user = userEvent.setup()
      renderPlayer()

      await user.click(screen.getByRole('button', { name: 'Jugar Memoria Cognitiva' }))

      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    })
  })
})
