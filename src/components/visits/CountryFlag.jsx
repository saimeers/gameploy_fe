import { useState } from 'react'
import { cn } from '@/lib/utils'
import { flagEmoji } from './visitHelpers'

/** Banderas en SVG, ~1 KB cada una y cacheadas por el navegador. */
const FLAG_URL = (code) => `https://flagcdn.com/${code.toLowerCase()}.svg`

/**
 * Bandera de un país a partir de su código ISO.
 *
 * Windows no incluye los glifos de las banderas emoji en sus fuentes: donde un
 * teléfono dibuja la bandera, un computador muestra las dos letras. Por eso se
 * pinta una imagen, y el emoji queda como respaldo para cuando no carga.
 *
 * Es decorativa: el nombre del país ya va escrito al lado, así que se oculta a
 * los lectores de pantalla.
 */
export default function CountryFlag({ code, className = '' }) {
  const [failed, setFailed] = useState(false)
  const valid = /^[A-Za-z]{2}$/.test(code ?? '')

  if (!valid || failed) {
    return <span aria-hidden="true" className={className}>{flagEmoji(code?.toUpperCase())}</span>
  }

  return (
    <img
      src={FLAG_URL(code)}
      alt=""
      aria-hidden="true"
      width={20}
      height={15}
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn(
        'inline-block h-[0.85em] w-auto rounded-[2px] align-[-0.08em] ring-1 ring-border/50',
        className
      )}
    />
  )
}
