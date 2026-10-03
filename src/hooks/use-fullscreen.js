import { useCallback, useEffect, useState } from 'react'

const fullscreenElement = () =>
  document.fullscreenElement ?? document.webkitFullscreenElement ?? null

/**
 * Pantalla completa para el elemento de `ref`.
 *
 * Usa la Fullscreen API y, donde no existe (Safari en iPhone) o el navegador
 * la rechaza, cae a un modo inmersivo que cubre la ventana con CSS: en ese
 * caso `isFallback` es true y quien lo use debe fijar el elemento a la ventana.
 */
export function useFullscreen(ref) {
  const [isNative, setIsNative] = useState(false)
  const [isFallback, setIsFallback] = useState(false)

  useEffect(() => {
    const onChange = () => setIsNative(!!ref.current && fullscreenElement() === ref.current)
    document.addEventListener('fullscreenchange', onChange)
    document.addEventListener('webkitfullscreenchange', onChange)
    return () => {
      document.removeEventListener('fullscreenchange', onChange)
      document.removeEventListener('webkitfullscreenchange', onChange)
    }
  }, [ref])

  // En el modo inmersivo no hay tecla del navegador para salir: Escape lo
  // cierra, y la página de fondo no se desplaza mientras dura.
  useEffect(() => {
    if (!isFallback) return
    const onKey = (e) => { if (e.key === 'Escape') setIsFallback(false) }
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = overflow
      window.removeEventListener('keydown', onKey)
    }
  }, [isFallback])

  const enter = useCallback(async () => {
    const el = ref.current
    if (!el) return
    const request = el.requestFullscreen ?? el.webkitRequestFullscreen
    if (request) {
      try {
        await request.call(el)
        // Los juegos son apaisados: en móvil se intenta girar la pantalla.
        screen.orientation?.lock?.('landscape').catch(() => {})
        return
      } catch { /* el navegador la rechazó: se usa el modo inmersivo */ }
    }
    setIsFallback(true)
  }, [ref])

  const exit = useCallback(() => {
    if (isFallback) {
      setIsFallback(false)
      return
    }
    if (fullscreenElement()) {
      const exitFullscreen = document.exitFullscreen ?? document.webkitExitFullscreen
      exitFullscreen?.call(document)?.catch?.(() => {})
    }
  }, [isFallback])

  const isFullscreen = isNative || isFallback

  const toggle = useCallback(
    () => (isFullscreen ? exit() : enter()),
    [isFullscreen, enter, exit]
  )

  return { isFullscreen, isFallback, enter, exit, toggle }
}
