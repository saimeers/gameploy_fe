import { useEffect, useRef, useState } from 'react'
import { DataTable } from './ChartCard'
import { decimal, integer, monthLabel } from './labels'

const SERIES = [
  { key: 'usabilidad', label: 'Usabilidad (SUS)', stroke: 'stroke-chart-bar', fill: 'fill-chart-bar', line: 'bg-chart-bar' },
  { key: 'experiencia', label: 'Experiencia', stroke: 'stroke-chart-series-2', fill: 'fill-chart-series-2', line: 'bg-chart-series-2' },
]
const HEIGHT = 220
const M = { top: 14, right: 56, bottom: 26, left: 30 }
const TICKS = [0, 25, 50, 75, 100]

/** Ancho real del contenedor, para dibujar el SVG a tamaño de píxel. */
function useWidth() {
  const ref = useRef(null)
  const [width, setWidth] = useState(640)
  useEffect(() => {
    if (!ref.current || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  return [ref, width]
}

/**
 * Promedio mensual de los dos puntajes, en el mismo eje de 0 a 100, con la
 * referencia de 68 del SUS. Al pasar el cursor (o con Tab) una línea vertical
 * marca el mes y la ventana muestra ambos valores y cuántas respuestas hubo.
 */
export default function TrendChart({ points, reference }) {
  const [ref, width] = useWidth()
  const [active, setActive] = useState(null)
  const plotW = Math.max(width - M.left - M.right, 10)
  const plotH = HEIGHT - M.top - M.bottom
  const x = (i) => M.left + (points.length === 1 ? plotW / 2 : (i / (points.length - 1)) * plotW)
  const y = (v) => M.top + plotH - (v / 100) * plotH

  const nearest = (clientX, rect) => {
    const px = clientX - rect.left
    let best = 0
    points.forEach((_, i) => { if (Math.abs(x(i) - px) < Math.abs(x(best) - px)) best = i })
    return best
  }

  const current = active !== null ? points[active] : null

  return (
    <div className="space-y-3">
      <ul className="flex flex-wrap gap-4 text-xs text-muted-foreground" aria-label="Leyenda">
        {SERIES.map(s => (
          <li key={s.key} className="flex items-center gap-1.5">
            <span aria-hidden className={`h-[2px] w-3 rounded-full ${s.line}`} /> {s.label}
          </li>
        ))}
      </ul>

      <div ref={ref} className="relative">
        <svg
          width={width}
          height={HEIGHT}
          role="img"
          aria-label={`Promedio mensual de usabilidad y experiencia, ${points.length} mes${points.length === 1 ? '' : 'es'}. Detalle en la vista de tabla.`}
          onPointerMove={e => setActive(nearest(e.clientX, e.currentTarget.getBoundingClientRect()))}
          onPointerLeave={() => setActive(null)}
          className="block overflow-visible"
        >
          {TICKS.map(t => (
            <g key={t}>
              <line x1={M.left} x2={M.left + plotW} y1={y(t)} y2={y(t)} className={t === 0 ? 'stroke-border' : 'stroke-border/40'} strokeWidth={1} />
              <text x={M.left - 6} y={y(t)} dy="0.32em" textAnchor="end" className="fill-muted-foreground text-[10px] tabular-nums">{t}</text>
            </g>
          ))}

          <line x1={M.left} x2={M.left + plotW} y1={y(reference)} y2={y(reference)} className="stroke-foreground/40" strokeWidth={1} />
          {/* Etiqueta en el margen derecho, fuera del área de las líneas */}
          <text x={M.left + plotW + 10} y={y(reference)} dy="0.32em" className="fill-muted-foreground text-[10px]">SUS {reference}</text>

          {points.map((p, i) => (
            <text key={p.mes} x={x(i)} y={HEIGHT - 6} textAnchor="middle" className="fill-muted-foreground text-[10px]">{monthLabel(p.mes)}</text>
          ))}

          {current && (
            <line x1={x(active)} x2={x(active)} y1={M.top} y2={M.top + plotH} className="stroke-foreground/30" strokeWidth={1} />
          )}

          {SERIES.map(s => (
            <g key={s.key}>
              {points.length > 1 && (
                <path
                  d={points.map((p, i) => `${i ? 'L' : 'M'}${x(i)},${y(p[s.key])}`).join(' ')}
                  fill="none"
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  className={s.stroke}
                />
              )}
              {points.map((p, i) => (
                <circle key={p.mes} cx={x(i)} cy={y(p[s.key])} r={4} strokeWidth={2} className={`${s.fill} stroke-card`} />
              ))}
            </g>
          ))}

          {/* Zonas enfocables por mes (teclado) */}
          {points.map((p, i) => (
            <rect
              key={p.mes}
              x={x(i) - 12}
              y={M.top}
              width={24}
              height={plotH}
              fill="transparent"
              tabIndex={0}
              aria-label={`${monthLabel(p.mes)}: usabilidad ${decimal.format(p.usabilidad)}, experiencia ${decimal.format(p.experiencia)}, ${p.n} respuestas`}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              className="outline-none focus-visible:stroke-ring"
            />
          ))}
        </svg>

        {current && (
          <div
            role="tooltip"
            className="pointer-events-none absolute top-0 z-10 min-w-44 rounded-md border border-border/60 bg-popover p-2 text-xs text-popover-foreground shadow-lg"
            style={{ left: Math.min(x(active) + 10, width - 180) }}
          >
            <p className="mb-1 text-muted-foreground">{monthLabel(current.mes)} · {integer.format(current.n)} respuestas</p>
            {SERIES.map(s => (
              <p key={s.key} className="flex items-center justify-between gap-4 py-0.5">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span aria-hidden className={`h-[2px] w-3 rounded-full ${s.line}`} /> {s.label}
                </span>
                <strong className="font-semibold tabular-nums">{decimal.format(current[s.key])}</strong>
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function TrendTable({ points }) {
  return (
    <DataTable
      caption="Promedio mensual"
      columns={[
        { key: 'mes', label: 'Mes' },
        { key: 'n', label: 'Respuestas', numeric: true },
        { key: 'usabilidad', label: 'Usabilidad (SUS)', numeric: true },
        { key: 'experiencia', label: 'Experiencia', numeric: true },
      ]}
      rows={points.map(p => ({
        mes: monthLabel(p.mes),
        n: integer.format(p.n),
        usabilidad: decimal.format(p.usabilidad),
        experiencia: decimal.format(p.experiencia),
      }))}
    />
  )
}
