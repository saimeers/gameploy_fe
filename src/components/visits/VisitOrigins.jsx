import { useEffect, useState } from 'react'
import { Globe2, Loader2, MapPin } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { countryName, flagEmoji, foldTail, share } from './visitHelpers'

const PERIODS = [
  { days: 7, label: '7 días' },
  { days: 30, label: '30 días' },
  { days: 90, label: '90 días' },
  { days: null, label: 'Todo' },
]

const MAX_COUNTRIES = 8
const numberFormat = new Intl.NumberFormat('es-CO')

/**
 * Fila de una lista de barras: nombre y valor arriba, barra delgada debajo.
 * El porcentaje sobre el total aparece al pasar el cursor o enfocar la fila.
 */
function BarRow({ label, detail, value, total, max, muted }) {
  const pct = share(value, total)
  return (
    <li
      tabIndex={0}
      className="group relative space-y-1.5 rounded-md px-2 py-1.5 outline-none transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring/40"
      aria-label={`${label}: ${numberFormat.format(value)} visitas, ${pct}% del total`}
    >
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="min-w-0 truncate">
          {label}
          {detail && <span className="text-muted-foreground"> · {detail}</span>}
        </span>
        <span className="shrink-0 font-medium tabular-nums">{numberFormat.format(value)}</span>
      </div>
      <div className="h-2 w-full">
        <div
          className={cn('h-full rounded-r-[4px]', muted ? 'bg-chart-bar-muted' : 'bg-chart-bar')}
          style={{ width: `${Math.max((value / max) * 100, 1.5)}%` }}
        />
      </div>
      <span
        role="tooltip"
        className="pointer-events-none absolute right-2 -top-7 z-10 hidden rounded-md border border-border/60 bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md group-hover:block group-focus-visible:block"
      >
        <strong className="font-semibold">{pct}%</strong>
        <span className="text-muted-foreground"> del total</span>
      </span>
    </li>
  )
}

function BarList({ title, icon: Icon, rows, total, empty }) {
  const max = Math.max(...rows.map(r => r.visitas), 1)
  return (
    <div className="min-w-0 space-y-2">
      <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {title}
      </p>
      {rows.length === 0 ? (
        <p className="rounded-md border border-dashed border-border/60 px-3 py-6 text-center text-xs text-muted-foreground">
          {empty}
        </p>
      ) : (
        <ul className="space-y-0.5">
          {rows.map(row => (
            <BarRow key={row.key} {...row} total={total} max={max} />
          ))}
        </ul>
      )}
    </div>
  )
}

function Kpi({ label, value, hint }) {
  return (
    <div className="min-w-0 rounded-lg border border-border/50 bg-background/40 px-3 py-2.5">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="truncate text-xl font-semibold">{value}</p>
      {hint && <p className="truncate text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

/**
 * De dónde vienen las visitas: total, países y ciudades en un periodo.
 * @param {(days: number | null) => Promise<{ total: number, countries: object[], cities: object[] }>} load
 */
export default function VisitOrigins({ load, title = 'Origen de las visitas', description }) {
  const [days, setDays] = useState(30)
  const [stats, setStats] = useState(null)
  const [failed, setFailed] = useState(false)
  const [loadingDays, setLoadingDays] = useState(30)

  useEffect(() => {
    let cancelled = false
    load(days)
      .then(data => { if (!cancelled) { setStats(data); setFailed(false) } })
      .catch(() => { if (!cancelled) setFailed(true) })
      .finally(() => { if (!cancelled) setLoadingDays(null) })
    return () => { cancelled = true }
  }, [load, days])

  const choosePeriod = (value) => {
    setLoadingDays(value)
    setDays(value)
  }

  const loading = loadingDays === days
  const total = stats?.total ?? 0
  const located = (stats?.countries ?? []).filter(c => c.codigo_pais)

  const countryRows = foldTail(stats?.countries ?? [], MAX_COUNTRIES).map(c => ({
    key: c.other ? 'otros' : c.codigo_pais ?? 'none',
    label: c.other ? 'Otros países' : `${c.codigo_pais ? flagEmoji(c.codigo_pais) + ' ' : ''}${countryName(c.codigo_pais)}`,
    value: c.visitas,
    visitas: c.visitas,
    muted: c.other || !c.codigo_pais,
  }))

  const cityRows = (stats?.cities ?? []).map(c => ({
    key: `${c.codigo_pais}-${c.region}-${c.ciudad}`,
    label: c.ciudad,
    detail: countryName(c.codigo_pais),
    value: c.visitas,
    visitas: c.visitas,
  }))

  const topCountry = located[0]
  const topCity = cityRows[0]

  return (
    <Card className="border-border/50 bg-card/60">
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Globe2 className="h-4 w-4 text-muted-foreground" /> {title}
            </CardTitle>
            <CardDescription className="text-xs">
              {description ?? 'Calculado a partir de la conexión de cada visitante; no se guarda su IP.'}
            </CardDescription>
          </div>
          <div role="group" aria-label="Periodo" className="flex rounded-md border border-border/60 p-0.5">
            {PERIODS.map(p => (
              <button
                key={p.label}
                type="button"
                aria-pressed={days === p.days}
                onClick={() => choosePeriod(p.days)}
                className={cn(
                  'rounded-[5px] px-2.5 py-1 text-xs transition-colors',
                  days === p.days ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-5">
        {failed && !stats ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No se pudieron cargar las visitas.</p>
        ) : !stats ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className={cn('space-y-5 transition-opacity', loading && 'opacity-50')} aria-busy={loading}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Kpi label="Visitas" value={numberFormat.format(total)} />
              <Kpi
                label="Países"
                value={located.length}
                hint={topCountry ? `Más visitas: ${countryName(topCountry.codigo_pais)}` : undefined}
              />
              <Kpi
                label="Ciudad principal"
                value={topCity?.label ?? '—'}
                hint={topCity ? `${numberFormat.format(topCity.value)} visitas` : undefined}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <BarList
                title="Por país"
                icon={Globe2}
                rows={countryRows}
                total={total}
                empty="Todavía no hay visitas en este periodo."
              />
              <BarList
                title="Ciudades con más visitas"
                icon={MapPin}
                rows={cityRows}
                total={total}
                empty="Aún no hay visitas con ciudad conocida."
              />
            </div>

            {countryRows.some(r => r.key === 'none') && (
              <p className="text-xs text-muted-foreground">
                «Sin ubicación» agrupa las visitas anteriores a esta función y las que llegan desde
                redes privadas o locales.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
