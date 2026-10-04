import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ClipboardList } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { adminService } from '../../services/admin.service'
import { BANDAS, decimal, integer } from './labels'

/** Resumen de la encuesta en el dashboard del admin, con enlace a los resultados. */
export default function SurveySummaryCard() {
  const [data, setData] = useState(null)

  useEffect(() => {
    let cancelled = false
    adminService.getSurveySummary({})
      .then(res => { if (!cancelled) setData(res.data.data) })
      .catch(() => { /* la tarjeta queda sin datos */ })
    return () => { cancelled = true }
  }, [])

  const sus = data?.usabilidad
  const ux = data?.experiencia

  return (
    <Card className="border-border/50 bg-card/60">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-sm">
            <ClipboardList className="h-4 w-4 text-muted-foreground" /> Encuesta de usabilidad y experiencia
          </CardTitle>
          <CardDescription className="text-xs">
            {data ? `${integer.format(data.total)} respuesta${data.total === 1 ? '' : 's'} en total` : 'Cargando…'}
          </CardDescription>
        </div>
        <Link to="/admin/encuestas" className="flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline">
          Ver resultados <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent>
        {data && data.total > 0 ? (
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-xs text-muted-foreground">Usabilidad (SUS)</dt>
              <dd className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{decimal.format(sus.media)}</span>
                <span className="text-xs text-muted-foreground">{BANDAS[sus.banda]} · referencia {sus.referencia}</span>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Experiencia</dt>
              <dd className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{decimal.format(ux.media)}</span>
                <span className="text-xs text-muted-foreground">de 100</span>
              </dd>
            </div>
          </dl>
        ) : data ? (
          <p className="text-sm text-muted-foreground">Todavía nadie ha respondido la encuesta.</p>
        ) : null}
      </CardContent>
    </Card>
  )
}
