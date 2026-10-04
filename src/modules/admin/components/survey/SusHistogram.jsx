import { useState } from 'react'
import { cn } from '@/lib/utils'
import { DataTable } from './ChartCard'
import { integer } from './labels'

const PLOT_HEIGHT = 120

/**
 * Cuántas respuestas cayeron en cada tramo de 10 puntos del SUS, con la línea
 * del promedio de referencia. Cada columna muestra su valor al pasar el
 * cursor o enfocarla; el eje marca el máximo y la tabla los lista todos.
 */
export default function SusHistogram({ bins, reference }) {
  const [active, setActive] = useState(null)
  const max = Math.max(...bins.map(b => b.respuestas), 1)

  return (
    <div className="flex gap-2">
      {/* Eje Y: solo el máximo y el cero */}
      <div aria-hidden className="relative w-5 shrink-0 text-right text-[10px] tabular-nums text-muted-foreground" style={{ height: PLOT_HEIGHT + 4 }}>
        <span className="absolute right-0 top-0 -translate-y-1/2">{integer.format(max)}</span>
        <span className="absolute bottom-0 right-0 translate-y-1/2">0</span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="relative" style={{ height: PLOT_HEIGHT + 4 }}>
          <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-border/40" />
          <span aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-border" />
          {/* Referencia, con su etiqueta a la derecha de la línea, sobre el área del gráfico */}
          <span aria-hidden className="absolute bottom-0 w-px bg-foreground/40" style={{ left: `${reference}%`, height: PLOT_HEIGHT + 16 }} />
          <span aria-hidden className="absolute -top-3 whitespace-nowrap pl-1 text-[10px] text-muted-foreground" style={{ left: `${reference}%` }}>
            promedio {reference}
          </span>

          <ol className="absolute inset-0 flex items-end" aria-label="Respuestas por tramo de puntaje SUS">
            {bins.map((b, i) => {
              const label = `${b.desde} a ${b.hasta}: ${integer.format(b.respuestas)} respuesta${b.respuestas === 1 ? '' : 's'}`
              return (
                <li
                  key={b.desde}
                  tabIndex={0}
                  aria-label={label}
                  onPointerEnter={() => setActive(i)}
                  onPointerLeave={() => setActive(null)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                  className="group relative flex h-full flex-1 items-end justify-center outline-none"
                >
                  {b.respuestas > 0 && (
                    <span
                      className={cn(
                        'w-full max-w-6 rounded-t-[4px] bg-chart-bar transition-opacity',
                        active !== null && active !== i && 'opacity-50',
                      )}
                      style={{ height: (b.respuestas / max) * PLOT_HEIGHT }}
                    />
                  )}
                  {active === i && (
                    <span role="tooltip" className="absolute -top-2 z-10 -translate-y-full whitespace-nowrap rounded-md border border-border/60 bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md">
                      <strong className="font-semibold tabular-nums">{integer.format(b.respuestas)}</strong>
                      <span className="text-muted-foreground"> · {b.desde}–{b.hasta} puntos</span>
                    </span>
                  )}
                  <span aria-hidden className="pointer-events-none absolute inset-0 rounded-sm group-focus-visible:ring-2 group-focus-visible:ring-ring/40" />
                </li>
              )
            })}
          </ol>
        </div>
        <div aria-hidden className="mt-1 flex justify-between text-[10px] tabular-nums text-muted-foreground">
          {[0, 20, 40, 60, 80, 100].map(t => <span key={t}>{t}</span>)}
        </div>
      </div>
    </div>
  )
}

export function SusHistogramTable({ bins }) {
  return (
    <DataTable
      caption="Respuestas por tramo de puntaje SUS"
      columns={[{ key: 'tramo', label: 'Puntaje SUS' }, { key: 'n', label: 'Respuestas', numeric: true }]}
      rows={bins.map(b => ({ tramo: `${b.desde}–${b.hasta}`, n: integer.format(b.respuestas) }))}
    />
  )
}
