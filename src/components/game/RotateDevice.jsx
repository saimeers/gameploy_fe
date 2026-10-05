import { Maximize, RotateCw, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Aviso a pantalla completa que pide girar el teléfono antes de jugar.
 *
 * Los builds de Unity se exportan en 1920x1080: en vertical el juego cabe en
 * una franja de unos pocos centímetros y los controles táctiles quedan fuera
 * de alcance. Por eso el aviso tapa el juego en lugar de acompañarlo.
 *
 * @param {() => void} [onFullscreen] ofrece pantalla completa; el gesto de
 *   pulsar es lo que permite a Android girar la pantalla por su cuenta
 * @param {() => void} onIgnore salida para quien tenga el giro bloqueado en
 *   el sistema operativo y no pueda rotar aunque quiera
 */
export default function RotateDevice({ onFullscreen, onIgnore }) {
  return (
    <div
      role="alertdialog"
      aria-label="Gira el dispositivo para jugar"
      className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6 bg-black px-6 text-center text-white"
    >
      <span className="relative flex h-20 w-20 items-center justify-center">
        <Smartphone className="h-11 w-11 animate-[gameploy-rotate_2.4s_ease-in-out_infinite] text-white/90" />
        <RotateCw className="absolute -right-1 -bottom-1 h-6 w-6 text-primary" />
      </span>

      <div className="space-y-2">
        <p className="text-lg font-semibold">Gira tu teléfono</p>
        <p className="mx-auto max-w-xs text-sm text-white/60">
          Este juego está hecho para pantalla horizontal. En vertical se vería diminuto.
        </p>
      </div>

      <div className="flex flex-col items-center gap-3">
        {onFullscreen && (
          <Button type="button" size="sm" onClick={onFullscreen}>
            <Maximize /> Pantalla completa
          </Button>
        )}
        <button
          type="button"
          onClick={onIgnore}
          className="text-xs text-white/40 underline underline-offset-4 transition-colors hover:text-white/70"
        >
          Jugar en vertical de todas formas
        </button>
      </div>

      <p className="max-w-xs text-[11px] text-white/30">
        Si la pantalla no gira, desactiva el bloqueo de rotación de tu teléfono.
      </p>
    </div>
  )
}
