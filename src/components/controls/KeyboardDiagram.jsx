import ControlKey from './ControlKey'
import { KEYBOARD_ROWS, ARROW_KEYS, EXTRA_KEYS } from './inputCatalog'

/**
 * Teclado dibujado con HTML: cada tecla reparte el ancho de su fila según el
 * peso `w` del catálogo, así la distribución se adapta al contenedor.
 */
export default function KeyboardDiagram({
  assignments = {},
  selectedKey,
  onSelect,
  onHover,
  readOnly = false,
}) {
  const keyProps = (key) => ({
    label: key,
    assigned: assignments[key] ?? null,
    selected: selectedKey === key,
    readOnly,
    onSelect,
    onHover,
  })

  return (
    // El padding deja sitio al anillo de foco: al ser contenedor de scroll,
    // recorta todo lo que sobresalga de su caja de relleno.
    <div className="overflow-x-auto px-1.5 py-2">
      <div className="min-w-[520px] space-y-3">

        {/* Bloque principal */}
        <div className="space-y-1.5">
          {KEYBOARD_ROWS.map((row, i) => (
            <div key={i} className="flex gap-1.5">
              {row.map(({ key, w = 1 }) => (
                <ControlKey
                  key={key}
                  {...keyProps(key)}
                  className="h-9"
                  style={{ flexGrow: w, flexBasis: 0 }}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Cursores */}
        <div className="flex justify-end">
          <div className="grid grid-cols-3 gap-1.5">
            <span />
            <ControlKey {...keyProps(ARROW_KEYS.up)} className="h-9 w-11 text-base" />
            <span />
            <ControlKey {...keyProps(ARROW_KEYS.left)}  className="h-9 w-11 text-base" />
            <ControlKey {...keyProps(ARROW_KEYS.down)}  className="h-9 w-11 text-base" />
            <ControlKey {...keyProps(ARROW_KEYS.right)} className="h-9 w-11 text-base" />
          </div>
        </div>

        {/* Teclas fuera de la distribución */}
        <div className="flex flex-wrap gap-1.5 border-t border-border/40 pt-3">
          {EXTRA_KEYS.map(key => (
            <ControlKey key={key} {...keyProps(key)} className="h-8 px-2.5" />
          ))}
        </div>
      </div>
    </div>
  )
}
