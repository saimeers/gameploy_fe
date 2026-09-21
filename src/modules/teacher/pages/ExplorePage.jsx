import { useEffect, useState, useCallback } from 'react'
import { Link }     from 'react-router-dom'
import { Search, Gamepad2, Eye, User, Star, Loader2, MessageSquare } from 'lucide-react'
import { Input }  from '@/components/ui/input'
import { Badge }  from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label }    from '@/components/ui/label'
import { toast }    from 'sonner'
import { teacherService } from '../services/teacher.service'
import { LIMITS }         from '@/lib/limits'

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i + 1)}
          onMouseEnter={() => setHovered(i + 1)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={`h-6 w-6 transition-colors ${
              i < (hovered || value)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-muted-foreground/30'
            }`}
          />
        </button>
      ))}
    </div>
  )
}

function GameCard({ project, onEvaluate }) {
  const portadaFile = project.versiones?.[0]?.archivos?.find(a => a.tipo === 'portada')
  const [portadaUrl, setPortadaUrl] = useState(null)

  useEffect(() => {
    if (!portadaFile?.ruta_storage) return
    teacherService.getFileUrl(portadaFile.ruta_storage)
      .then(res => setPortadaUrl(res.data.data.url))
      .catch(() => {})
  }, [portadaFile])

  return (
    <Card className="border-border/50 bg-card/60 flex flex-col hover:border-border/80 transition-colors overflow-hidden">
      <div className="h-36 bg-gradient-to-br from-primary/10 to-accent/20 flex items-center justify-center overflow-hidden">
        {portadaUrl ? (
          <img src={portadaUrl} alt={project.nombre} className="w-full h-full object-cover" />
        ) : (
          <Gamepad2 className="h-10 w-10 text-primary/30" />
        )}
      </div>

      <CardHeader className="pb-2 pt-3 px-4">
        <p className="font-semibold text-sm truncate">{project.nombre}</p>
        <p className="text-xs text-muted-foreground truncate">{project.descripcion ?? 'Sin descripción'}</p>
      </CardHeader>

      <CardContent className="bg-background text-popover-foreground px-4 pb-2 flex-1 space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {project.categoria && (
            <Badge variant="outline" className="text-xs border-border/50 text-muted-foreground">
              {project.categoria.nombre}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {project.usuario?.nombre}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {project._count?.visitas ?? 0}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            {project._count?.comentarios ?? 0}
          </span>
        </div>
      </CardContent>

      <CardFooter className="px-4 py-3 border-t border-border/40 flex gap-2">
        <Link to={`/games/${project.slug}`} className="flex-1" target="_blank" rel="noreferrer">
          <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
            <Gamepad2 className="h-3.5 w-3.5" />
            Jugar
          </Button>
        </Link>
        <Button
          size="sm"
          className="flex-1 gap-1.5 text-xs"
          onClick={() => onEvaluate(project)}
        >
          <Star className="h-3.5 w-3.5" />
          Evaluar
        </Button>
      </CardFooter>
    </Card>
  )
}

export default function ExplorePage() {
  const [projects, setProjects]   = useState([])
  const [total, setTotal]         = useState(0)
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [categoria, setCategoria] = useState('all')
  const [categorias, setCategorias] = useState([])
  const [page, setPage]           = useState(1)
  const [evaluateProject, setEvaluateProject] = useState(null)
  const [calificacion, setCalificacion]       = useState(0)
  const [contenido, setContenido]             = useState('')
  const [submitting, setSubmitting]           = useState(false)
  const limit = 12

  useEffect(() => {
    teacherService.getCategorias().then(r => setCategorias(r.data.data)).catch(() => {})
  }, [])

  const loadProjects = useCallback(() => {
    const params = { page, limit }
    if (search)              params.q         = search
    if (categoria !== 'all') params.categoria = categoria
    return teacherService.getPublicGames(params).then(res => res.data)
  }, [search, categoria, page])

  useEffect(() => {
    let cancelled = false
    loadProjects()
      .then(body => {
        if (cancelled) return
        setProjects(body.data)
        setTotal(body.meta?.total ?? 0)
      })
      .catch(() => { if (!cancelled) toast.error('Error al cargar juegos') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [loadProjects])

  const refreshProjects = async () => {
    try {
      const body = await loadProjects()
      setProjects(body.data)
      setTotal(body.meta?.total ?? 0)
    } catch {
      toast.error('Error al cargar juegos')
    }
  }

  useEffect(() => {
    const t = setTimeout(() => { setPage(1) }, 400)
    return () => clearTimeout(t)
  }, [search])

  const handleSubmitEvaluation = async () => {
    if (!contenido.trim()) { toast.error('Escribe un comentario'); return }
    setSubmitting(true)
    try {
      await teacherService.addComment(evaluateProject.id, {
        contenido: contenido.trim(),
        calificacion: calificacion || null,
      })
      toast.success('Evaluación enviada', {
        description: `Tu retroalimentación sobre "${evaluateProject.nombre}" fue registrada.`,
      })
      setEvaluateProject(null)
      setCalificacion(0)
      setContenido('')
      refreshProjects()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Error al enviar evaluación')
    } finally { setSubmitting(false) }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Explorar juegos</h1>
        <p className="text-sm text-muted-foreground">
          Juega y evalúa los Juegos Serios publicados en el semillero.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar juegos..."
            className="pl-9"
            maxLength={LIMITS.busqueda}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <Select value={categoria} onValueChange={v => { setCategoria(v); setPage(1) }}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {categorias.map(c => (
              <SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-2 text-center">
          <Gamepad2 className="h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No hay juegos disponibles.</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">{total} juego{total !== 1 ? 's' : ''}</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map(p => (
              <GameCard key={p.id} project={p} onEvaluate={setEvaluateProject} />
            ))}
          </div>
          {total > limit && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Anterior</Button>
              <span className="text-xs text-muted-foreground">Página {page} de {Math.ceil(total / limit)}</span>
              <Button variant="outline" size="sm" disabled={page >= Math.ceil(total / limit)} onClick={() => setPage(p => p + 1)}>Siguiente</Button>
            </div>
          )}
        </>
      )}

      {/* Evaluate modal */}
      <Dialog open={!!evaluateProject} onOpenChange={() => { setEvaluateProject(null); setCalificacion(0); setContenido('') }}>
        <DialogContent className="bg-background text-popover-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Evaluar proyecto</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <p className="font-medium text-sm">{evaluateProject?.nombre}</p>
              <p className="text-xs text-muted-foreground">{evaluateProject?.usuario?.nombre}</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Calificación (opcional)</Label>
              <StarRating value={calificacion} onChange={setCalificacion} />
              {calificacion > 0 && (
                <p className="text-xs text-muted-foreground">
                  {['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente'][calificacion]}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Comentario *</Label>
              <Textarea
                rows={4}
                placeholder="Describe tu experiencia con el juego, aspectos pedagógicos, usabilidad, sugerencias de mejora..."
                maxLength={LIMITS.comentario}
                value={contenido}
                onChange={e => setContenido(e.target.value)}
              />
              <p className="text-xs text-muted-foreground text-right">
                {contenido.length} / {LIMITS.comentario} caracteres
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setEvaluateProject(null); setCalificacion(0); setContenido('') }}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button onClick={handleSubmitEvaluation} disabled={submitting || !contenido.trim()}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar evaluación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}