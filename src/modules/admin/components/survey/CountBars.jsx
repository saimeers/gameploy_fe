import { cn } from '@/lib/utils'
import { integer, percent } from './labels'

/**
 * Cuántas respuestas hubo por opción, en barras horizontales de un solo color
 * (las opciones no son series distintas). "Prefiero no decirlo" y "Sin
 * responder" van en gris para no competir con las respuestas reales.
 * @param {{ value: string, label: string, quiet?: boolean }[]} options en su orden
 * @param {Record<string, number>} counts
 */
export default function CountBars({ title, options, counts }) {
  const rows = options.filter(o => counts[o.value])
  const total = rows.reduce((sum, o) => sum + counts[o.value], 0)
  const max = Math.max(...rows.map(o => counts[o.value]), 1)

  return (
    <div className="min-w-0 space-y-2">
      <p className="text-xs font-medium text-muted-foreground">{title}</p>
      {rows.length === 0 ? (
        <p className="text-xs text-muted-foreground">Sin respuestas.</p>
      ) : (
        <ul className="space-y-1.5">
          {rows.map(o => (
            <li key={o.value} className="space-y-1" title={`${percent(counts[o.value], total)} % del total`}>
              <div className="flex items-baseline justify-between gap-3 text-xs">
                <span className={cn('min-w-0 truncate', o.quiet && 'text-muted-foreground')}>{o.label}</span>
                <span className="shrink-0 tabular-nums">
                  {integer.format(counts[o.value])}
                  <span className="text-muted-foreground"> · {percent(counts[o.value], total)} %</span>
                </span>
              </div>
              <div className="h-1.5 w-full">
                <div
                  className={cn('h-full rounded-r-[4px]', o.quiet ? 'bg-chart-bar-muted' : 'bg-chart-bar')}
                  style={{ width: `${Math.max((counts[o.value] / max) * 100, 2)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
