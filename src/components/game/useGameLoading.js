import { useCallback, useEffect, useState } from 'react'

/**
 * Progreso de carga de un build Unity dentro de un iframe.
 *
 * La API inyecta en el index.html del juego un script que envía, con
 * postMessage, `boot` al arrancar, `progress` (0 a 1) mientras Unity descarga
 * y prepara el juego, y luego `ready` o `error`. Unity usa el último 10 % para
 * iniciar el motor, así que de 0 a 0,9 es la descarga.
 *
 * Si no llega ningún progreso antes de que el iframe termine de cargar (una API
 * sin el script, o una página que no es de Unity), se da el juego por listo.
 *
 * @param {React.RefObject<HTMLIFrameElement>} iframeRef
 * @param {boolean} active true mientras el iframe está montado
 * @param {number} session cambia con cada recarga del iframe
 */
export function useGameLoading(iframeRef, active, session) {
  const [state, setState] = useState({ phase: 'connecting', progress: 0, error: null })
  const [elapsed, setElapsed] = useState(0)
  const [trackedSession, setTrackedSession] = useState(session)

  // Cada sesión nueva vuelve a empezar (ajuste de estado al cambiar la prop).
  if (trackedSession !== session) {
    setTrackedSession(session)
    setState({ phase: 'connecting', progress: 0, error: null })
    setElapsed(0)
  }

  useEffect(() => {
    if (!active) return
    const onMessage = (event) => {
      if (event.source !== iframeRef.current?.contentWindow) return
      const msg = event.data
      if (msg?.source !== 'gameploy-player') return

      if (msg.type === 'progress') {
        const value = Math.max(0, Math.min(1, Number(msg.value) || 0))
        setState(prev => prev.phase === 'ready' || prev.phase === 'error' ? prev : {
          phase: value >= 0.9 ? 'starting' : 'downloading',
          progress: Math.max(prev.progress, value),
          error: null,
        })
      } else if (msg.type === 'ready') {
        setState({ phase: 'ready', progress: 1, error: null })
      } else if (msg.type === 'error') {
        setState(prev => ({ ...prev, phase: 'error', error: msg.message || null }))
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [active, iframeRef, session])

  const loading = active && state.phase !== 'ready' && state.phase !== 'error'

  useEffect(() => {
    if (!loading) return
    const timer = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(timer)
  }, [loading, session])

  /** Para el onLoad del iframe: sin progreso hasta ahora, no lo habrá. */
  const handleFrameLoad = useCallback(() => {
    setState(prev => prev.phase === 'connecting' ? { phase: 'ready', progress: 1, error: null } : prev)
  }, [])

  // Porcentaje de la descarga (0 a 0,9 del progreso de Unity).
  const downloadPercent = Math.round(Math.min(state.progress / 0.9, 1) * 100)

  return { ...state, downloadPercent, elapsed, loading, handleFrameLoad }
}
