import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { AlertCircle, Check, Copy, Link2, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { studentService } from '../services/student.service'
import { slugify } from '../slug'

const CHECK_DELAY_MS = 400

const STATUS = {
  current:   { icon: Check,       tone: 'text-muted-foreground', text: 'Es el enlace actual de tu juego.' },
  checking:  { icon: Loader2,     tone: 'text-muted-foreground', text: 'Comprobando disponibilidad…', spin: true },
  available: { icon: Check,       tone: 'text-emerald-500',      text: 'Disponible' },
  taken:     { icon: X,           tone: 'text-destructive',      text: 'Ya está en uso por otro juego.' },
  invalid:   { icon: AlertCircle, tone: 'text-amber-500',        text: 'Usa entre 3 y 60 letras, números o guiones.' },
  error:     { icon: AlertCircle, tone: 'text-destructive',      text: 'No se pudo comprobar. Intenta de nuevo.' },
}

/** Tarjeta para que el estudiante elija el enlace de su juego (/games/<slug>). */
export default function SlugEditor({ project, onUpdated }) {
  const [value, setValue] = useState(project.slug)
  const [result, setResult] = useState({ slug: project.slug, status: 'current' })
  const [saving, setSaving] = useState(false)

  const normalized = slugify(value)
  // El resultado vale solo para el texto que se comprobó; mientras no coincida, se está comprobando.
  const status = normalized === project.slug
    ? 'current'
    : result.slug === normalized ? result.status : 'checking'

  useEffect(() => {
    if (normalized === project.slug) return
    let cancelled = false
    const timer = setTimeout(async () => {
      try {
        const res = await studentService.checkSlug(project.id, normalized)
        const { valid, available } = res.data.data
        if (!cancelled) {
          setResult({ slug: normalized, status: !valid ? 'invalid' : available ? 'available' : 'taken' })
        }
      } catch {
        if (!cancelled) setResult({ slug: normalized, status: 'error' })
      }
    }, CHECK_DELAY_MS)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [normalized, project.id, project.slug])

  const save = async () => {
    setSaving(true)
    try {
      await studentService.changeSlug(project.id, normalized)
      toast.success('Enlace actualizado', {
        description: `Tu juego ahora está en /games/${normalized}. El enlace anterior lleva al nuevo.`,
      })
      onUpdated()
    } catch (err) {
      toast.error(err.response?.status === 409 ? 'Ese enlace ya está en uso' : 'No se pudo cambiar el enlace')
    } finally {
      setSaving(false)
    }
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/games/${project.slug}`)
      toast.success('Enlace copiado')
    } catch {
      toast.error('No se pudo copiar el enlace')
    }
  }

  const cfg = STATUS[status]
  const Icon = cfg.icon

  return (
    <Card className="border-border/50 bg-card/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Link2 className="h-4 w-4 text-muted-foreground" /> Enlace del juego
        </CardTitle>
        <CardDescription className="text-xs">
          Personaliza la dirección con la que compartes tu juego. Si lo cambias, el enlace
          anterior sigue funcionando y lleva al nuevo.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="flex min-w-0 flex-1 items-center overflow-hidden rounded-md border border-input bg-transparent focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30">
            <span className="shrink-0 select-none border-r border-input bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
              /games/
            </span>
            <input
              aria-label="Enlace del juego"
              value={value}
              onChange={e => setValue(e.target.value)}
              maxLength={80}
              spellCheck={false}
              autoCapitalize="off"
              className="min-w-0 flex-1 bg-transparent px-3 py-2 font-mono text-sm outline-none"
              disabled={saving}
            />
          </label>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={copy} aria-label="Copiar enlace actual">
              <Copy /> <span className="sm:hidden">Copiar</span>
            </Button>
            <Button
              type="button"
              size="sm"
              className="flex-1 sm:flex-none"
              disabled={status !== 'available' || saving}
              onClick={save}
            >
              {saving && <Loader2 className="animate-spin" />} Guardar enlace
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs" aria-live="polite">
          <span className={cn('flex items-center gap-1.5', cfg.tone)}>
            <Icon className={cn('h-3.5 w-3.5', cfg.spin && 'animate-spin')} /> {cfg.text}
          </span>
          {normalized && normalized !== value && (
            <span className="text-muted-foreground">
              Se guardará como <code className="font-mono text-foreground">{normalized}</code>
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
