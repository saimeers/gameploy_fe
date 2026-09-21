/**
 * Catálogo de entradas que un Juego Serio puede declarar.
 *
 * Las cadenas de este archivo son las que se guardan en `ControlJuego.tecla_boton`,
 * así que deben mantenerse estables: cambiar una etiqueta deja huérfanos los
 * controles ya guardados con la anterior. Los valores siguen las entradas
 * habituales de Unity (Input Manager / Input System).
 */

export const INPUT_TYPES = [
  { value: 'teclado', label: 'Teclado' },
  { value: 'mouse',   label: 'Mouse' },
  { value: 'mando',   label: 'Mando' },
  { value: 'mobile',  label: 'Móvil' },
]

export const INPUT_LABELS = Object.fromEntries(
  INPUT_TYPES.map(t => [t.value, t.label])
)

/**
 * Distribución del teclado. Cada tecla declara su ancho relativo (`w`), que se
 * usa como `flex-grow`, de modo que las filas se reparten el ancho disponible.
 */
export const KEYBOARD_ROWS = [
  [
    { key: 'Esc', w: 1.4 },
    { key: 'F1' }, { key: 'F2' }, { key: 'F3' }, { key: 'F4' }, { key: 'F5' },
  ],
  [
    { key: '1' }, { key: '2' }, { key: '3' }, { key: '4' }, { key: '5' },
    { key: '6' }, { key: '7' }, { key: '8' }, { key: '9' }, { key: '0' },
  ],
  [
    { key: 'Tab', w: 1.6 },
    { key: 'Q' }, { key: 'W' }, { key: 'E' }, { key: 'R' }, { key: 'T' },
    { key: 'Y' }, { key: 'U' }, { key: 'I' }, { key: 'O' }, { key: 'P' },
  ],
  [
    { key: 'A' }, { key: 'S' }, { key: 'D' }, { key: 'F' }, { key: 'G' },
    { key: 'H' }, { key: 'J' }, { key: 'K' }, { key: 'L' },
    { key: 'Enter', w: 2 },
  ],
  [
    { key: 'Shift', w: 2 },
    { key: 'Z' }, { key: 'X' }, { key: 'C' }, { key: 'V' }, { key: 'B' },
    { key: 'N' }, { key: 'M' },
  ],
  [
    { key: 'Ctrl', w: 1.6 },
    { key: 'Alt', w: 1.4 },
    { key: 'Espacio', w: 6 },
  ],
]

/** Cursores: se dibujan aparte, en cruceta. */
export const ARROW_KEYS = { up: '↑', down: '↓', left: '←', right: '→' }

/** Teclas sueltas que no entran en la distribución pero siguen siendo válidas. */
export const EXTRA_KEYS = ['Backspace', 'Delete', 'Inicio', 'Fin', 'Re Pág', 'Av Pág']

/** Botones del mouse dibujados sobre el diagrama. */
export const MOUSE_BUTTONS = {
  left:   'Click izquierdo',
  right:  'Click derecho',
  middle: 'Click central',
}

/** Acciones de mouse que no corresponden a una zona del dibujo. */
export const MOUSE_ACTIONS = [
  'Doble click', 'Scroll arriba', 'Scroll abajo', 'Mover mouse', 'Arrastrar',
]

/** Botones del mando dibujados sobre el diagrama. */
export const GAMEPAD_BUTTONS = {
  a: 'Botón A', b: 'Botón B', x: 'Botón X', y: 'Botón Y',
  lb: 'LB', rb: 'RB', lt: 'LT', rt: 'RT',
  start: 'Start', select: 'Select',
  l3: 'L3', r3: 'R3',
  dpadUp: 'D-pad ↑', dpadDown: 'D-pad ↓', dpadLeft: 'D-pad ←', dpadRight: 'D-pad →',
  leftStick: 'Joystick izq.', rightStick: 'Joystick der.',
}

/** Gestos y controles táctiles. */
export const MOBILE_GESTURES = [
  { key: 'Tap',                icon: 'pointer',  hint: 'Toque simple' },
  { key: 'Doble tap',          icon: 'click',    hint: 'Dos toques rápidos' },
  { key: 'Hold (mantener)',    icon: 'hand',     hint: 'Mantener pulsado' },
  { key: 'Swipe ↑',            icon: 'up',       hint: 'Deslizar hacia arriba' },
  { key: 'Swipe ↓',            icon: 'down',     hint: 'Deslizar hacia abajo' },
  { key: 'Swipe ←',            icon: 'left',     hint: 'Deslizar a la izquierda' },
  { key: 'Swipe →',            icon: 'right',    hint: 'Deslizar a la derecha' },
  { key: 'Pinch (acercar)',    icon: 'zoomIn',   hint: 'Pellizcar para acercar' },
  { key: 'Spread (alejar)',    icon: 'zoomOut',  hint: 'Separar para alejar' },
  { key: 'Rotar',              icon: 'rotate',   hint: 'Girar con dos dedos' },
  { key: 'Sacudir',            icon: 'shake',    hint: 'Agitar el dispositivo' },
  { key: 'Joystick virtual',   icon: 'move',     hint: 'Stick en pantalla' },
  { key: 'Botón virtual ↑',    icon: 'up',       hint: 'Botón en pantalla' },
  { key: 'Botón virtual ↓',    icon: 'down',     hint: 'Botón en pantalla' },
  { key: 'Botón virtual ←',    icon: 'left',     hint: 'Botón en pantalla' },
  { key: 'Botón virtual →',    icon: 'right',    hint: 'Botón en pantalla' },
]

/** Todas las entradas que un diagrama puede representar, por tipo. */
export const KEYS_BY_TYPE = {
  teclado: [
    ...KEYBOARD_ROWS.flat().map(k => k.key),
    ...Object.values(ARROW_KEYS),
    ...EXTRA_KEYS,
  ],
  mouse:  [...Object.values(MOUSE_BUTTONS), ...MOUSE_ACTIONS],
  mando:  Object.values(GAMEPAD_BUTTONS),
  mobile: MOBILE_GESTURES.map(g => g.key),
}
