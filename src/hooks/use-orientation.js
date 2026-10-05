import { useSyncExternalStore } from 'react'

/**
 * Teléfono (o tablet pequeña) sostenido en vertical.
 *
 * `pointer: coarse` deja fuera el escritorio: una ventana estrecha en el
 * computador no es un teléfono y ahí el juego se ve bien igual.
 */
const PORTRAIT_PHONE = '(orientation: portrait) and (pointer: coarse) and (max-width: 1024px)'

const subscribe = (onChange) => {
  const mql = window.matchMedia(PORTRAIT_PHONE)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}

const getSnapshot = () => window.matchMedia(PORTRAIT_PHONE).matches

/**
 * `true` mientras el visitante esté en un teléfono en vertical.
 *
 * Se lee con `useSyncExternalStore` y no con un efecto porque el valor vive
 * fuera de React: así no hay un primer render con el dato equivocado.
 */
export function useIsPortraitPhone() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
