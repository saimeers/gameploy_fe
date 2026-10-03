import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import GamePlayer from '@/components/game/GamePlayer'
import GameUnavailable from '@/components/game/GameUnavailable'
import { gameUrl } from '@/components/files/fileFormat'
import { usePublicGame } from '@/hooks/use-public-game'

const playPath = (slug) => `/games/${slug}/jugar`

/**
 * El juego solo, a toda la ventana: lo que abre "Nueva pestaña" en la ficha.
 * Pide la ficha a la API igual que GamePage, así que aplica las mismas reglas
 * de visibilidad y recibe sus propios enlaces firmados.
 */
export default function GamePlayPage() {
  const { slug } = useParams()
  const { project, loading, error } = usePublicGame(slug, playPath)

  if (loading) return (
    <div className="flex min-h-svh items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
  if (error) return <GameUnavailable reason={error} />

  const version = project.versiones?.[0]
  const portada = version?.archivos?.find(a => a.tipo === 'portada')

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border/50 px-4 py-2">
        <Link
          to={`/games/${project.slug}`}
          className="inline-flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Ficha del juego
        </Link>
        <h1 className="min-w-0 truncate text-sm font-semibold">{project.nombre}</h1>
      </header>

      <main className="flex flex-1 items-center justify-center p-3 sm:p-6">
        {/* Tan ancho como quepa el marco 16:9 en el alto de la ventana. */}
        <div className="w-full" style={{ maxWidth: 'calc((100svh - 8rem) * 16 / 9)' }}>
          <GamePlayer
            src={gameUrl(project.id, version)}
            title={project.nombre}
            version={version?.numero_version}
            coverUrl={portada?.url}
            autoStart
          />
        </div>
      </main>
    </div>
  )
}
