import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { AlertTriangle, ClipboardList, Copy, Download, Loader2, MessageSquareQuote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { EXPERIENCIA, USABILIDAD } from '@/modules/survey/preguntas'
import { adminService } from '../services/admin.service'
import ChartCard from '../components/survey/ChartCard'
import ScoreMeter from '../components/survey/ScoreMeter'
import SusHistogram, { SusHistogramTable } from '../components/survey/SusHistogram'
import LikertChart, { LikertTable } from '../components/survey/LikertChart'
import TrendChart, { TrendTable } from '../components/survey/TrendChart'
import CountBars from '../components/survey/CountBars'
import {
  BANDAS, DATOS, MOMENTOS, PERFILES, QUIET_VALUES, decimal, integer,
} from '../components/survey/labels'

const PERIODOS = [
  { value: '30', label: 'Últimos 30 días' },
  { value: '90', label: 'Últimos 90 días' },
  { value: '365', label: 'Último año' },
  { value: 'all', label: 'Todo' },
]
const MIN_RELIABLE = 5

const toParams = ({ dias, perfil, momento }) => ({
  ...(dias !== 'all' && { dias }),
  ...(perfil !== 'all' && { perfil }),
  ...(momento !== 'all' && { momento }),
})

/** Filtro de una fila: un select con "Todos" y las opciones dadas. */
function Filter({ label, value, onChange, options, allLabel }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full sm:w-52" aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {allLabel && <SelectItem value="all">{allLabel}</SelectItem>}
        {options.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
      </SelectContent>
    </Select>
  )
}

/** Aviso cuando hay pocas respuestas para sacar conclusiones. */
function FewAnswers({ n }) {
  if (n >= MIN_RELIABLE) return null
  return (
    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
      Con menos de {MIN_RELIABLE} respuestas el promedio es solo orientativo.
    </p>
  )
}

const stats = (d) => [
  `n = ${integer.format(d.n)}`,
  d.desviacion != null && `DE ${decimal.format(d.desviacion)}`,
  d.ic95 && `IC 95 %: ${decimal.format(d.ic95[0])}–${decimal.format(d.ic95[1])}`,
].filter(Boolean).join(' · ')

/**
 * Resultados de la encuesta de usabilidad (SUS) y experiencia, con filtros de
 * periodo, perfil y momento que aplican a todo lo que hay debajo.
 */
export default function SurveyResultsPage() {
  const [filters, setFilters] = useState({ dias: 'all', perfil: 'all', momento: 'all' })
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    let cancelled = false
    adminService.getSurveySummary(toParams(filters))
      .then(res => { if (!cancelled) setData(res.data.data) })
      .catch(() => { if (!cancelled) toast.error('No se pudieron cargar los resultados') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [filters])

  const setFilter = (key) => (value) => {
    setLoading(true)
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const download = async () => {
    setDownloading(true)
    try {
      const res = await adminService.downloadSurveyCsv(toParams(filters))
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `encuesta-gameploy-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('No se pudo descargar el CSV')
    } finally {
      setDownloading(false)
    }
  }

  const surveyUrl = `${window.location.origin}/encuesta`
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(surveyUrl)
      toast.success('Enlace de la encuesta copiado')
    } catch {
      toast.error(`No se pudo copiar. El enlace es ${surveyUrl}`)
    }
  }

  const sus = data?.usabilidad
  const ux = data?.experiencia
  const empty = data && data.total === 0

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Encuesta de usabilidad y experiencia</h1>
          <p className="text-sm text-muted-foreground">
            Respuestas anónimas de estudiantes, docentes y visitantes sobre la plataforma.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={copyLink}>
          <Copy /> Copiar enlace de la encuesta
        </Button>
      </div>

      {/* Filtros: una fila, aplican a todo lo de abajo */}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <Filter label="Periodo" value={filters.dias} onChange={setFilter('dias')} options={PERIODOS} />
        <Filter
          label="Perfil"
          value={filters.perfil}
          onChange={setFilter('perfil')}
          allLabel="Todos los perfiles"
          options={Object.entries(PERFILES).map(([value, label]) => ({ value, label }))}
        />
        <Filter
          label="Momento"
          value={filters.momento}
          onChange={setFilter('momento')}
          allLabel="Todos los momentos"
          options={Object.entries(MOMENTOS).map(([value, label]) => ({ value, label }))}
        />
        <Button variant="outline" size="sm" className="sm:ml-auto" onClick={download} disabled={downloading || empty}>
          {downloading ? <Loader2 className="animate-spin" /> : <Download />} Descargar CSV
        </Button>
      </div>

      {!data && loading && (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {empty && (
        <Card className="border-dashed border-border/60 bg-card/40">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <ClipboardList className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm font-medium">Aún no hay respuestas con estos filtros</p>
            <p className="max-w-md text-xs text-muted-foreground">
              La encuesta se ofrece sola al publicar el primer proyecto, tras una semana de uso y después de
              jugar unos minutos. También puedes compartir el enlace.
            </p>
          </CardContent>
        </Card>
      )}

      {data && !empty && (
        // Al cambiar un filtro se mantiene lo anterior, atenuado, hasta que llegan los datos.
        <div className={`space-y-5 transition-opacity ${loading ? 'opacity-50' : ''}`} aria-busy={loading}>
          <div className="grid gap-5 lg:grid-cols-2">
            <Card className="border-border/50 bg-card/60">
              <CardHeader>
                <CardDescription className="text-xs">Usabilidad · System Usability Scale (SUS)</CardDescription>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <CardTitle className="text-5xl font-semibold tracking-tight">{decimal.format(sus.media)}</CardTitle>
                  <span className="text-sm text-muted-foreground">de 100</span>
                  <Badge variant="outline" className="text-xs">{BANDAS[sus.banda]}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {sus.media >= sus.referencia ? '+' : '−'}{decimal.format(Math.abs(sus.media - sus.referencia))} frente al
                  promedio de referencia ({sus.referencia})
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <ScoreMeter
                  label="Usabilidad"
                  value={sus.media}
                  ci={sus.ic95}
                  reference={{ value: sus.referencia, label: 'promedio' }}
                  bands={sus.bandas.map(b => ({ ...b, label: BANDAS[b.id] }))}
                />
                <p className="text-xs text-muted-foreground tabular-nums">{stats(sus)}</p>
                <FewAnswers n={sus.n} />
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/60">
              <CardHeader>
                <CardDescription className="text-xs">Experiencia de usuario</CardDescription>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <CardTitle className="text-3xl font-semibold tracking-tight">{decimal.format(ux.media)}</CardTitle>
                  <span className="text-sm text-muted-foreground">de 100</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  50 es neutral: por encima, la experiencia es favorable en promedio.
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <ScoreMeter
                  label="Experiencia"
                  value={ux.media}
                  ci={ux.ic95}
                  reference={{ value: 50, label: 'neutral' }}
                />
                <p className="text-xs text-muted-foreground tabular-nums">{stats(ux)}</p>
                <FewAnswers n={ux.n} />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-5 lg:grid-cols-[2fr_3fr]">
            <ChartCard
              title="Distribución del puntaje SUS"
              description="Respuestas por tramo de 10 puntos."
              table={<SusHistogramTable bins={sus.histograma} />}
            >
              <div className="pt-4">
                <SusHistogram bins={sus.histograma} reference={sus.referencia} />
              </div>
            </ChartCard>

            <ChartCard
              title="Evolución mensual"
              description="Promedio de cada mes, en el mismo eje de 0 a 100."
              table={<TrendTable points={data.tendencia} />}
            >
              <TrendChart points={data.tendencia} reference={sus.referencia} />
            </ChartCard>
          </div>

          <ChartCard
            title="Usabilidad: detalle por afirmación"
            description="Cómo respondió la gente cada afirmación del SUS, de lo desfavorable a lo favorable."
            table={<LikertTable items={sus.items} texts={USABILIDAD} />}
          >
            <LikertChart items={sus.items} texts={USABILIDAD} />
          </ChartCard>

          <ChartCard
            title="Experiencia: detalle por afirmación"
            description="Cómo se sintió la gente usando Gameploy, de lo desfavorable a lo favorable."
            table={<LikertTable items={ux.items} texts={EXPERIENCIA} />}
          >
            <LikertChart items={ux.items} texts={EXPERIENCIA} />
          </ChartCard>

          <Card className="border-border/50 bg-card/60">
            <CardHeader>
              <CardTitle className="text-sm">Quiénes respondieron</CardTitle>
              <CardDescription className="text-xs">{integer.format(data.total)} respuestas con estos filtros.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              <CountBars
                title="Perfil"
                counts={data.participacion.perfil}
                options={Object.entries(PERFILES).map(([value, label]) => ({ value, label }))}
              />
              <CountBars
                title="Momento"
                counts={data.participacion.momento}
                options={Object.entries(MOMENTOS).map(([value, label]) => ({ value, label }))}
              />
              {DATOS.map(d => (
                <CountBars
                  key={d.campo}
                  title={d.titulo}
                  counts={data.participacion[d.campo] ?? {}}
                  options={d.opciones.map(o => ({ ...o, quiet: QUIET_VALUES.includes(o.value) }))}
                />
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <MessageSquareQuote className="h-4 w-4 text-muted-foreground" /> ¿Qué mejorarían?
              </CardTitle>
              <CardDescription className="text-xs">Los 20 comentarios más recientes.</CardDescription>
            </CardHeader>
            <CardContent>
              {data.comentarios.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nadie ha dejado comentarios todavía.</p>
              ) : (
                <ul className="divide-y divide-border/40">
                  {data.comentarios.map((c, i) => (
                    <li key={i} className="space-y-1 py-3 first:pt-0 last:pb-0">
                      <p className="text-sm leading-relaxed whitespace-pre-line">{c.texto}</p>
                      <p className="text-xs text-muted-foreground">
                        {PERFILES[c.perfil]} · {new Date(`${c.fecha}T12:00:00`).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
