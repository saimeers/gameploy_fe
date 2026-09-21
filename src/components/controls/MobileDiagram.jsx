import {
  Pointer, MousePointerClick, Hand, ZoomIn, ZoomOut, RotateCw, Vibrate, Move,
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
} from 'lucide-react'
import { MOBILE_GESTURES } from './inputCatalog'

const ICONS = {
  pointer: Pointer,
  click:   MousePointerClick,
  hand:    Hand,
  up:      ArrowUp,
  down:    ArrowDown,
  left:    ArrowLeft,
  right:   ArrowRight,
  zoomIn:  ZoomIn,
  zoomOut: ZoomOut,
  rotate:  RotateCw,
  shake:   Vibrate,
  move:    Move,
}

/**
 * Entradas táctiles. A diferencia del teclado o el mando, un gesto no ocupa una
 * posición fija en la pantalla, así que en lugar de un dibujo se presenta como
 * una rejilla de gestos con su icono.
 */
export default function MobileDiagram({
  assignments = {},
  selectedKey,
  onSelect,
  onHover,
  readOnly = false,
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {MOBILE_GESTURES.map(({ key, icon, hint }) => {
        const assigned = assignments[key] ?? null
        const selected = selectedKey === key
        const interactive = !readOnly || !!assigned

        const state = assigned
          ? 'border-primary/50 bg-primary/15 text-primary hover:bg-primary/25'
          : readOnly
            ? 'border-border/40 bg-background/40 text-muted-foreground/50'
            : 'border-border/60 bg-background/60 text-muted-foreground hover:border-primary/40 hover:text-foreground'

        const Icon = ICONS[icon] ?? Pointer
        const Tag = interactive ? 'button' : 'div'

        return (
          <Tag
            key={key}
            type={interactive ? 'button' : undefined}
            onClick={interactive ? () => onSelect?.(key) : undefined}
            onMouseEnter={interactive ? () => onHover?.(key) : undefined}
            onMouseLeave={interactive ? () => onHover?.(null) : undefined}
            title={assigned ? `${key} — ${assigned.descripcion_accion}` : hint}
            className={`relative flex items-center gap-2 rounded-md border px-3 py-2 text-left transition-colors ${state} ${
              selected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
            } ${interactive ? 'cursor-pointer' : ''}`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-medium">{key}</span>
              <span className="block truncate text-[10px] text-muted-foreground">
                {assigned ? assigned.descripcion_accion : hint}
              </span>
            </span>
            {assigned && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
          </Tag>
        )
      })}
    </div>
  )
}
