import { useEffect, useState, useCallback } from 'react'
import { useParams, Link, useNavigate }      from 'react-router-dom'
import { toast }        from 'sonner'
import {
  ArrowLeft, Globe, Lock, Link2, Loader2,
  ExternalLink, Send,
} from 'lucide-react'
import { Button }  from '@/components/ui/button'
import { Badge }   from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { studentService }   from '../services/student.service'
import ProjectInfoTab       from '../components/tabs/ProjectInfoTab'
import ProjectControlsTab   from '../components/tabs/ProjectControlsTab'
import ProjectVersionsTab   from '../components/tabs/ProjectVersionsTab'

const STATUS_CFG = {
  publicado: { label: 'Publicado', class: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  borrador:  { label: 'Borrador',  class: 'bg-muted/50 text-muted-foreground border-border' },
  archivado: { label: 'Archivado', class: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
}

const VISIBILITY_ICON = { publico: Globe, privado: Lock, por_enlace: Link2 }

export default function ProjectDetailPage() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const [project, setProject]         = useState(null)
  const [loading, setLoading]         = useState(true)
  const [publishing, setPublishing]   = useState(false)
  const [confirmPublish, setConfirmPublish] = useState(false)

  const loadProject = useCallback(
    () => studentService.getMyProjects({ limit: 50 })
      .then(res => res.data.data.find(p => p.id === id)),
    [id]
  )

  useEffect(() => {
    let cancelled = false
    loadProject()
      .then(found => {
        if (cancelled) return
        if (!found) { navigate('/student'); return }
        setProject(found)
      })
      .catch(() => { if (!cancelled) toast.error('Error al cargar el proyecto') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [loadProject, navigate])

  const refreshProject = async () => {
    try {
      const found = await loadProject()
      if (found) setProject(found)
    } catch {
      toast.error('Error al cargar el proyecto')
    }
  }

  const handlePublish = async () => {
    setPublishing(true)
    try {
      await studentService.publishProject(id)
      toast.success('¡Proyecto publicado!', {
        description: `Tu juego ya es accesible en /games/${project.slug}`,
      })
      refreshProject()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Error al publicar')
    } finally {
      setPublishing(false)
      setConfirmPublish(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!project) return null

  const statusCfg = STATUS_CFG[project.estado] ?? { label: project.estado, class: '' }
  const VisIcon   = VISIBILITY_ICON[project.visibilidad] ?? Lock

  return (
    <div className="space-y-5 max-w-3xl">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/student">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-semibold">{project.nombre}</h1>
              <Badge variant="outline" className={`text-xs ${statusCfg.class}`}>
                {statusCfg.label}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
              <VisIcon className="h-3 w-3" />
              <span className="capitalize">{project.visibilidad?.replace('_', ' ')}</span>
              {project.estado === 'publicado' && (
                <>
                  <span>·</span>
                 <a 
                    href={`/games/${project.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    /games/{project.slug}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Publish button */}
        {project.estado !== 'publicado' && (
          <Button
            size="sm"
            className="gap-2 shrink-0"
            onClick={() => setConfirmPublish(true)}
          >
            <Send className="h-4 w-4" />
            Publicar
          </Button>
        )}
        {project.estado === 'publicado' && (
          <a href={`/games/${project.slug}`} target="_blank" rel="noreferrer">
            <Button size="sm" variant="outline" className="gap-2 shrink-0">
              <ExternalLink className="h-4 w-4" />
              Ver juego
            </Button>
          </a>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info">
        <TabsList className="bg-card/60 border border-border/50">
          <TabsTrigger value="info">Información</TabsTrigger>
          <TabsTrigger value="controles">Controles</TabsTrigger>
          <TabsTrigger value="versiones">Versiones y archivos</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-4">
          <ProjectInfoTab project={project} onUpdated={refreshProject} />
        </TabsContent>

        <TabsContent value="controles" className="mt-4">
          <ProjectControlsTab projectId={project.id} />
        </TabsContent>

        <TabsContent value="versiones" className="mt-4">
          <ProjectVersionsTab projectId={project.id} />
        </TabsContent>
      </Tabs>

      {/* Publish confirm */}
      <AlertDialog open={confirmPublish} onOpenChange={setConfirmPublish}>
        <AlertDialogContent className="bg-background text-popover-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Publicar proyecto</AlertDialogTitle>
            <AlertDialogDescription>
              Tu proyecto será accesible mediante un enlace público. Asegúrate de haber
              subido los archivos del juego y activado una versión antes de publicar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={publishing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handlePublish} disabled={publishing}>
              {publishing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Publicar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}