import ControlKey from './ControlKey'
import { ZoneRect, ZoneCircle } from './svgZones'
import { zoneState }            from './controlHelpers'
import { GAMEPAD_BUTTONS as B } from './inputCatalog'

/**
 * Mando dibujado en SVG, con la disposición habitual de un gamepad de dos
 * sticks: gatillos, cruceta, botones frontales, Start/Select y los dos sticks.
 * La pulsación de los sticks (L3/R3) va como ficha, porque visualmente coincide
 * con el propio stick.
 */
export default function GamepadDiagram({
  assignments = {},
  selectedKey,
  onSelect,
  onHover,
  readOnly = false,
}) {
  const state = zoneState({ assignments, selectedKey, onSelect, onHover, readOnly })

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto px-1.5 py-2">
        <div className="flex min-w-[320px] justify-center">
          <svg viewBox="0 0 300 190" className="h-56 w-auto" role="img" aria-label="Diagrama del mando">

            {/* Gatillos */}
            <ZoneRect {...state(B.lt)} x={48}  y={6}  width={44} height={13} label="LT" />
            <ZoneRect {...state(B.rt)} x={208} y={6}  width={44} height={13} label="RT" />
            <ZoneRect {...state(B.lb)} x={48}  y={23} width={44} height={13} label="LB" />
            <ZoneRect {...state(B.rb)} x={208} y={23} width={44} height={13} label="RB" />

            {/* Cuerpo */}
            <path
              d="M62,42 H238 C268,42 288,64 286,104 C284,146 266,166 242,162 C222,159 208,138 192,128 H108 C92,138 78,159 58,162 C34,166 16,146 14,104 C12,64 32,42 62,42 Z"
              fill="currentColor"
              fillOpacity="0.04"
              stroke="currentColor"
              strokeOpacity="0.35"
              strokeWidth="1.5"
              className="text-muted-foreground"
            />

            {/* Cruceta */}
            <ZoneRect {...state(B.dpadUp)}    x={66} y={56} width={16} height={19} label="↑" fontSize={9} />
            <ZoneRect {...state(B.dpadDown)}  x={66} y={94} width={16} height={19} label="↓" fontSize={9} />
            <ZoneRect {...state(B.dpadLeft)}  x={47} y={75} width={19} height={16} label="←" fontSize={9} />
            <ZoneRect {...state(B.dpadRight)} x={82} y={75} width={19} height={16} label="→" fontSize={9} />

            {/* Botones frontales */}
            <ZoneCircle {...state(B.y)} cx={230} cy={62}  r={11} label="Y" />
            <ZoneCircle {...state(B.a)} cx={230} cy={106} r={11} label="A" />
            <ZoneCircle {...state(B.x)} cx={208} cy={84}  r={11} label="X" />
            <ZoneCircle {...state(B.b)} cx={252} cy={84}  r={11} label="B" />

            {/* Start / Select */}
            <ZoneRect {...state(B.select)} x={122} y={62} width={24} height={11} rx={5} label="Sel"   fontSize={7} />
            <ZoneRect {...state(B.start)}  x={154} y={62} width={24} height={11} rx={5} label="Start" fontSize={7} />

            {/* Sticks */}
            <ZoneCircle {...state(B.leftStick)}  cx={120} cy={116} r={17} label="L" />
            <ZoneCircle {...state(B.rightStick)} cx={180} cy={116} r={17} label="R" />
          </svg>
        </div>
      </div>

      <div className="space-y-2 border-t border-border/40 pt-3">
        <p className="text-xs text-muted-foreground">Pulsación de los sticks</p>
        <div className="flex flex-wrap gap-1.5">
          {[B.l3, B.r3].map(key => (
            <ControlKey
              key={key}
              label={key}
              assigned={assignments[key] ?? null}
              selected={selectedKey === key}
              readOnly={readOnly}
              onSelect={onSelect}
              onHover={onHover}
              className="h-8 px-3"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
