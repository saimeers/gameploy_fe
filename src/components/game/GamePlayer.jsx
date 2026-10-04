import { useEffect, useRef, useState } from 'react'
import {
  AlertTriangle, ExternalLink, Gamepad2, Loader2, Maximize, Minimize, Play, RotateCcw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useFullscreen } from '@/hooks/use-fullscreen'
import { cn } from '@/lib/utils'
import { useGameLoading } from './useGameLoading'

/** Segundos de carga a partir de los cuales se explica por qué tarda. */
const SLOW_LOAD_SECONDS = 8

/** Pantalla de carga sobre el iframe, con el progreso real que envía Unity. */
function LoadingOverlay({ title, phase, downloadPercent, elapsed, error, onRetry }) {
  if (phase === 'error') return (
    <div role="alert" className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/90 px-6 text-center text-white">
      <AlertTriangle className="h-9 w-9 text-amber-400" />
      <div className="space-y-1">
        <p className="font-semibold">No se pudo cargar el juego</p>
        {error && <p className="max-w-md text-xs text-white/50">{error}</p>}
      </div>
      <Button type="button" size="sm" onClick={onRetry}>
        <RotateCcw /> Reintentar
      </Button>
    </div>
  )

  const label = {
    connecting: 'Conectando con el servidor…',
    downloading: `Descargando el juego · ${downloadPercent}%`,
    starting: 'Iniciando el juego…',
  }[phase]
  const indeterminate = phase === 'connecting' || phase === 'starting'

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-5 bg-black px-6 text-center text-white">
      <div className="space-y-1">
        <p className="text-[11px] uppercase tracking-widest text-white/40">Cargando</p>
        <p className="text-lg font-semibold sm:text-xl">{title}</p>
      </div>

      <div className="w-full max-w-sm space-y-2">
        <div
          role="progressbar"
          aria-label="Progreso de carga del juego"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={indeterminate ? undefined : downloadPercent}
          className="relative h-1.5 overflow-hidden rounded-full bg-white/10"
        >
          {indeterminate ? (
            <div className={cn(
              'absolute inset-y-0 rounded-full bg-primary',
              phase === 'starting' ? 'inset-x-0 animate-pulse' : 'w-1/3 animate-[gameploy-slide_1.2s_ease-in-out_infinite]',
            )} />
          ) : (
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-fuchsia-400 transition-[width] duration-300"
              style={{ width: `${downloadPercent}%` }}
            />
          )}
        </div>
        <div className="flex items-center justify-between text-xs text-white/60" aria-live="polite">
          <span className="flex items-center gap-1.5">
            <Loader2 className="h-3 w-3 animate-spin" /> {label}
          </span>
          <span className="font-mono tabular-nums text-white/40">{elapsed}s</span>
        </div>
      </div>

      {elapsed >= SLOW_LOAD_SECONDS && (
        <p className="max-w-sm text-xs text-white/40">
          La primera vez tarda más: el navegador descarga el juego completo y lo guarda,
          así que las siguientes partidas abren mucho más rápido.
        </p>
      )}
    </div>
  )
}

/** Portada del reproductor antes de cargar el juego. */
function Cover({ title, version, coverUrl, onPlay }) {
  return (
    <div className="absolute inset-0">
      {coverUrl ? (
        <img
          src={coverUrl}
          alt=""
          className="absolute inset-0 h-full w-full scale-105 object-cover opacity-70 blur-[2px]"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/40 via-black to-black">
          <Gamepad2 className="h-1/2 w-1/2 text-white/5" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10" />

      <button
        type="button"
        onClick={onPlay}
        aria-label={`Jugar ${title}`}
        className="group/play absolute inset-0 flex flex-col items-center justify-center gap-5 px-6 text-white outline-none"
      >
        <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary shadow-xl shadow-primary/40 transition-transform duration-300 group-hover/play:scale-110 group-focus-visible/play:ring-4 group-focus-visible/play:ring-white/60 sm:h-20 sm:w-20">
          <span className="absolute inset-0 animate-ping rounded-full bg-primary/30" />
          <Play className="relative h-7 w-7 translate-x-0.5 fill-current sm:h-8 sm:w-8" />
        </span>
        <span className="space-y-1 text-center">
          <span className="block text-lg font-semibold leading-tight sm:text-2xl">{title}</span>
          <span className="block text-[11px] uppercase tracking-widest text-white/60">
            Haz clic para jugar
          </span>
        </span>
      </button>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between px-4 py-3 text-[11px] text-white/60">
        {version ? <span className="font-mono">v{version}</span> : <span />}
        <span className="hidden items-center gap-1.5 sm:flex">
          <Maximize className="h-3 w-3" /> Mejor en pantalla completa
        </span>
      </div>
    </div>
  )
}

/**
 * Reproductor de un build Unity WebGL.
 *
 * El marco es 16:9, igual que la resolución 1920×1080 que se pide al exportar;
 * con la plantilla PWA el canvas de Unity ocupa todo el iframe, así que basta
 * con poner el marco en pantalla completa para que el juego lo llene.
 *
 * @param {string} src enlace firmado del juego (vence en unas horas)
 * @param {string} [newTabHref] página del frontend que abre "Nueva pestaña";
 *   sin ella no se ofrece. Nunca es `src`: ese enlace caduca y no debe circular.
 * @param {boolean} [autoStart] cargar el juego sin esperar a que se pulse jugar
 * @param {(running: boolean) => void} [onRunningChange] avisa cuando el juego
 *   termina de cargar y está en marcha, y cuando deja de estarlo
 */
export default function GamePlayer({ src, title, version, coverUrl, newTabHref, autoStart = false, onRunningChange }) {
  const frameRef = useRef(null)
  const iframeRef = useRef(null)
  const [started, setStarted] = useState(autoStart)
  // Cambiarla monta un iframe nuevo, que vuelve a cargar el juego desde cero.
  const [session, setSession] = useState(0)
  const { isFullscreen, isFallback, enter, exit } = useFullscreen(frameRef)
  const loading = useGameLoading(iframeRef, started, session)
  const running = started && loading.phase === 'ready'

  useEffect(() => { onRunningChange?.(running) }, [running, onRunningChange])

  if (!src) return (
    <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-dashed border-border/60 bg-card/40">
      <div className="space-y-2 text-center">
        <Gamepad2 className="mx-auto h-8 w-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">No hay archivos del juego disponibles.</p>
      </div>
    </div>
  )

  // El teclado va al documento con el foco: tras cada acción se devuelve al juego.
  const focusGame = () => iframeRef.current?.focus()

  const toggleFullscreen = async () => {
    if (isFullscreen) {
      exit()
    } else {
      setStarted(true)
      await enter()
    }
    focusGame()
  }

  const restart = () => setSession(s => s + 1)

  const handleLoad = () => {
    loading.handleFrameLoad()
    focusGame()
  }

  const status = !started
    ? 'Listo para jugar'
    : loading.phase === 'error'
      ? 'Error al cargar'
      : loading.loading
        ? loading.phase === 'downloading' ? `Cargando… ${loading.downloadPercent}%` : 'Cargando…'
        : 'En ejecución'

  return (
    <section
      aria-label={`Reproductor de ${title}`}
      className="overflow-hidden rounded-xl border border-border/50 bg-card/60 shadow-2xl shadow-primary/10"
    >
      {/* Barra del reproductor: arriba, para que el botón de pantalla completa
          se vea sin desplazarse aunque el marco 16:9 llene la ventana. */}
      <div className="flex items-center justify-between gap-3 border-b border-border/50 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground" aria-live="polite">
          <span className={cn(
            'h-2 w-2 shrink-0 rounded-full',
            !started
              ? 'bg-muted-foreground/40'
              : loading.phase === 'error'
                ? 'bg-destructive'
                : loading.loading ? 'animate-pulse bg-amber-500' : 'bg-emerald-500',
          )} />
          <span className="shrink-0">{status}</span>
          {started && (
            <span className="hidden truncate md:inline">· Haz clic dentro del juego para usar el teclado</span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {started && (
            <Button type="button" variant="ghost" size="xs" onClick={restart} aria-label="Reiniciar juego">
              <RotateCcw /> <span className="hidden sm:inline">Reiniciar</span>
            </Button>
          )}
          {newTabHref && (
            <Button variant="ghost" size="xs" asChild>
              <a href={newTabHref} target="_blank" rel="noopener noreferrer" aria-label="Abrir en una pestaña nueva">
                <ExternalLink /> <span className="hidden sm:inline">Nueva pestaña</span>
              </a>
            </Button>
          )}
          <Button type="button" size="xs" onClick={toggleFullscreen}>
            <Maximize /> Pantalla completa
          </Button>
        </div>
      </div>

      <div
        ref={frameRef}
        data-testid="game-frame"
        data-fullscreen={isFullscreen ? (isFallback ? 'fallback' : 'native') : undefined}
        className={cn(
          'w-full overflow-hidden bg-black',
          isFallback ? 'fixed inset-0 z-[100] h-dvh' : 'relative',
          !isFullscreen && 'aspect-video',
        )}
      >
        {started ? (
          <>
            <iframe
              key={session}
              ref={iframeRef}
              src={src}
              title={title}
              className="absolute inset-0 h-full w-full border-0"
              allow="autoplay; fullscreen; gamepad"
              allowFullScreen
              onLoad={handleLoad}
            />
            {(loading.loading || loading.phase === 'error') && (
              <LoadingOverlay
                title={title}
                phase={loading.phase}
                downloadPercent={loading.downloadPercent}
                elapsed={loading.elapsed}
                error={loading.error}
                onRetry={restart}
              />
            )}
          </>
        ) : (
          <Cover title={title} version={version} coverUrl={coverUrl} onPlay={() => setStarted(true)} />
        )}

        {isFullscreen && (
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label="Salir de pantalla completa"
            title="Salir de pantalla completa (Esc)"
            className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white/80 opacity-60 backdrop-blur-sm transition hover:bg-black/70 hover:opacity-100"
          >
            <Minimize className="h-4 w-4" />
          </button>
        )}
      </div>
    </section>
  )
}
