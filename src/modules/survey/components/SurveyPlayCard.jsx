import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageSquareHeart, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { canOffer, postponeInvite, surveyHref } from '../invite'

/** Minutos jugando antes de ofrecer la encuesta. */
export const PLAY_MINUTES = 3

/**
 * Invitación discreta debajo del reproductor, cuando el juego lleva unos
 * minutos en ejecución. Nunca tapa ni interrumpe la partida.
 * @param {boolean} running el juego terminó de cargar y está en marcha
 */
export default function SurveyPlayCard({ running }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!running) return
    let cancelled = false
    const timer = setTimeout(async () => {
      if (await canOffer() && !cancelled) setVisible(true)
    }, PLAY_MINUTES * 60 * 1000)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [running])

  if (!visible) return null

  const later = () => {
    setVisible(false)
    postponeInvite()
  }

  return (
    <aside
      aria-label="Encuesta sobre Gameploy"
      className="flex flex-col gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 sm:flex-row sm:items-center"
    >
      <MessageSquareHeart className="hidden h-8 w-8 shrink-0 text-primary sm:block" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">¿Qué tal tu experiencia en Gameploy?</p>
        <p className="text-xs text-muted-foreground">
          Cuéntanos en unos 3 minutos con una encuesta anónima. Nos ayuda a mejorar la plataforma.
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button size="sm" asChild>
          <Link to={surveyHref('tras_jugar')}>Responder</Link>
        </Button>
        <Button size="sm" variant="ghost" onClick={later}>Ahora no</Button>
        <Button size="icon-sm" variant="ghost" onClick={() => setVisible(false)} aria-label="Cerrar">
          <X />
        </Button>
      </div>
    </aside>
  )
}
