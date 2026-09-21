import KeyboardDiagram from './KeyboardDiagram'
import MouseDiagram    from './MouseDiagram'
import GamepadDiagram  from './GamepadDiagram'
import MobileDiagram   from './MobileDiagram'

const DIAGRAMS = {
  teclado: KeyboardDiagram,
  mouse:   MouseDiagram,
  mando:   GamepadDiagram,
  mobile:  MobileDiagram,
}

/**
 * Elige el diagrama que corresponde al tipo de entrada.
 *
 * @param {object} props
 * @param {'teclado'|'mouse'|'mando'|'mobile'} props.type
 * @param {Record<string, object>} props.assignments Controles guardados, indexados por `tecla_boton`
 * @param {string} [props.selectedKey] Tecla que se está editando
 * @param {(key: string) => void} [props.onSelect]
 * @param {boolean} [props.readOnly]
 */
export default function ControlDiagram({ type, ...props }) {
  const Diagram = DIAGRAMS[type]
  if (!Diagram) return null
  return <Diagram {...props} />
}
