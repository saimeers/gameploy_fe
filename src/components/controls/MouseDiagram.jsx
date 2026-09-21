import ControlKey from './ControlKey'
import { ZonePath }  from './svgZones'
import { zoneState } from './controlHelpers'
import { MOUSE_BUTTONS, MOUSE_ACTIONS } from './inputCatalog'

/**
 * Mouse dibujado en SVG. Las tres zonas clicables corresponden a los botones
 * físicos; el resto de acciones (scroll, arrastre, movimiento) se ofrecen como
 * fichas, porque no son una región del dibujo.
 */
export default function MouseDiagram({
  assignments = {},
  selectedKey,
  onSelect,
  onHover,
  readOnly = false,
}) {
  const state = zoneState({ assignments, selectedKey, onSelect, onHover, readOnly })

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <svg viewBox="0 0 160 170" className="h-52 w-auto" role="img" aria-label="Diagrama del mouse">
          <path
            d="M80,12 C52,12 34,30 34,52 V116 C34,140 54,158 80,158 C106,158 126,140 126,116 V52 C126,30 108,12 80,12 Z"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.35"
            strokeWidth="1.5"
            className="text-muted-foreground"
          />

          <ZonePath
            {...state(MOUSE_BUTTONS.left)}
            d="M78,14 H60 C46,14 36,30 36,50 V78 H78 Z"
            label="Izq."
            labelX={57}
            labelY={48}
          />
          <ZonePath
            {...state(MOUSE_BUTTONS.right)}
            d="M82,14 H100 C114,14 124,30 124,50 V78 H82 Z"
            label="Der."
            labelX={103}
            labelY={48}
          />
          <ZonePath
            {...state(MOUSE_BUTTONS.middle)}
            d="M74,28 H86 A6,6 0 0 1 92,34 V60 A6,6 0 0 1 86,66 H74 A6,6 0 0 1 68,60 V34 A6,6 0 0 1 74,28 Z"
          />
        </svg>
      </div>

      <div className="space-y-2 border-t border-border/40 pt-3">
        <p className="text-xs text-muted-foreground">Otras acciones del mouse</p>
        <div className="flex flex-wrap gap-1.5">
          {MOUSE_ACTIONS.map(key => (
            <ControlKey
              key={key}
              label={key}
              assigned={assignments[key] ?? null}
              selected={selectedKey === key}
              readOnly={readOnly}
              onSelect={onSelect}
              onHover={onHover}
              className="h-8 px-2.5"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
