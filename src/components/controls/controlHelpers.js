/** Utilidades compartidas por los diagramas de controles. */

/** Indexa una lista de controles por su tecla, para pintar el diagrama. */
export const indexByKey = (controls = []) =>
  controls.reduce((acc, control) => {
    acc[control.tecla_boton] = control
    return acc
  }, {})

/**
 * Devuelve una función que arma las props de estado de una zona del diagrama
 * a partir del diccionario de asignaciones.
 */
export const zoneState = ({ assignments, selectedKey, onSelect, onHover, readOnly }) => (key) => ({
  zoneKey:  key,
  assigned: assignments[key] ?? null,
  selected: selectedKey === key,
  readOnly,
  onSelect,
  onHover,
})
