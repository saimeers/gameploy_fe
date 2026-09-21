import { useState } from 'react'
import { Keyboard, Mouse, Gamepad2, Smartphone, Info } from 'lucide-react'
import ControlDiagram from './ControlDiagram'
import { indexByKey } from './controlHelpers'
import { INPUT_TYPES } from './inputCatalog'

const TYPE_ICONS = {
  teclado: Keyboard,
  mouse:   Mouse,
  mando:   Gamepad2,
  mobile:  Smartphone,
}

/**
 * Vista de solo lectura de los controles de un proyecto.
 *
 * Muestra el diagrama de cada tipo de entrada con las teclas configuradas
 * resaltadas: al pasar el cursor o pulsar una de ellas, su acción aparece en la
 * barra inferior. Las teclas sin asignar quedan atenuadas y no responden.
 */
export default function ControlsViewer({ controls = [], className = '' }) {
  const [type, setType]         = useState(null)
  const [selected, setSelected] = useState(null)
  const [hovered, setHovered]   = useState(null)

  const availableTypes = INPUT_TYPES.filter(
    t => controls.some(c => c.tipo_entrada === t.value)
  )

  if (availableTypes.length === 0) return null

  // El tipo activo se resuelve en cada render: los controles llegan de forma
  // asíncrona y el primer tipo disponible puede cambiar.
  const activeType = availableTypes.some(t => t.value === type)
    ? type
    : availableTypes[0].value

  const byType = controls.filter(c => c.tipo_entrada === activeType)
  const assignments = indexByKey(byType)
  const active = assignments[hovered] ?? assignments[selected] ?? null

  const selectType = (value) => {
    setType(value)
    setSelected(null)
    setHovered(null)
  }

  return (
    <div className={`space-y-3 ${className}`}>

      {availableTypes.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {availableTypes.map(({ value, label }) => {
            const Icon = TYPE_ICONS[value]
            const isActive = value === activeType
            const count = controls.filter(c => c.tipo_entrada === value).length
            return (
              <button
                key={value}
                type="button"
                onClick={() => selectType(value)}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? 'border-primary/50 bg-primary/10 text-primary'
                    : 'border-border/50 text-muted-foreground hover:border-border hover:text-foreground'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
                <span className={`rounded-full px-1.5 text-[10px] ${
                  isActive ? 'bg-primary/20' : 'bg-muted'
                }`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      )}

      <div className="rounded-lg border border-border/40 bg-background/30 p-3">
        <ControlDiagram
          type={activeType}
          assignments={assignments}
          selectedKey={selected}
          onSelect={setSelected}
          onHover={setHovered}
          readOnly
        />
      </div>

      {/* Acción de la entrada consultada */}
      <div className="flex min-h-9 items-center gap-2 rounded-md border border-border/40 bg-background/40 px-3 py-2">
        {active ? (
          <>
            <kbd className="shrink-0 rounded border border-primary/40 bg-primary/10 px-2 py-0.5 font-mono text-xs text-primary">
              {active.tecla_boton}
            </kbd>
            <span className="text-sm">{active.descripcion_accion}</span>
          </>
        ) : (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5 shrink-0" />
            Pasa el cursor o haz clic sobre una tecla resaltada para ver su función.
          </span>
        )}
      </div>
    </div>
  )
}
