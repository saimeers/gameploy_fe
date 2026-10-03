import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Plus, FolderOpen, Eye, MessageSquare, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import HoldConfirmDialog from '@/components/HoldConfirmDialog'
import ProjectCard from '../components/ProjectCard'
import { studentService } from '../services/student.service'
import { useAuthStore } from '@/store/authStore'
import VisitOrigins from '@/components/visits/VisitOrigins'

export default function StudentDashboard() {
  const user = useAuthStore(s => s.user)
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [toDelete, setToDelete] = useState(null)

  const loadProjects = useCallback(
    () => studentService.getMyProjects({ limit: 50 }).then(res => res.data.data),
    []
  )

  const loadVisits = useCallback(
    (days) => studentService.getMyVisits(days).then(res => res.data.data),
    []
  )

  useEffect(() => {
    let cancelled = false
    loadProjects()
      .then(data => { if (!cancelled) setProjects(data) })
      .catch(() => { if (!cancelled) toast.error('Error al cargar proyectos') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [loadProjects])

  const refreshProjects = async () => {
    try {
      setProjects(await loadProjects())
    } catch {
      toast.error('Error al cargar proyectos')
    }
  }

  const handleDelete = async (project) => {
    setToDelete(null)
    try {
      await studentService.deleteProject(project.id)
      toast.success('Proyecto eliminado')
      refreshProjects()
    } catch {
      toast.error('Error al eliminar el proyecto')
    }
  }

  const totalComments = projects.reduce(
    (acc, project) => acc + (project._count?.comentarios ?? 0),
    0
  )

  const published = projects.filter(p => p.estado === 'publicado').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">
            Hola, {user?.nombre?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestiona tus Juegos Serios desde aquí.
          </p>
        </div>
        <Link to="/student/new">
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo proyecto
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Total de proyectos', value: projects.length, icon: FolderOpen },
          { label: 'Publicados', value: published, icon: Eye },
          { label: 'Comentarios recibidos', value: totalComments, icon: MessageSquare },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label} className="border-border/50 bg-card/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription className="text-xs">{label}</CardDescription>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {published > 0 && (
        <VisitOrigins
          load={loadVisits}
          description="Visitas a todos tus juegos, según la conexión de cada visitante. No se guarda su IP."
        />
      )}

      {/* Projects grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="rounded-full bg-primary/10 p-5">
            <FolderOpen className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="font-medium">Aún no tienes proyectos</p>
            <p className="text-sm text-muted-foreground">
              Crea tu primer Juego Serio y compártelo con tu semillero.
            </p>
          </div>
          <Link to="/student/new">
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Crear primer proyecto
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={setToDelete}
            />
          ))}
        </div>
      )}

      {/* Delete confirm */}
      <HoldConfirmDialog
        open={!!toDelete}
        onOpenChange={() => setToDelete(null)}
        title="Eliminar proyecto"
        description="Se borran todas sus versiones y archivos, los controles, los comentarios recibidos y las visitas. No se puede deshacer."
        label="Mantén pulsado para eliminar"
        onConfirm={() => handleDelete(toDelete)}
      >
        {toDelete && (
          <div className="rounded-md border border-border/50 bg-background/40 px-3 py-2">
            <p className="truncate text-sm font-medium">{toDelete.nombre}</p>
            <p className="text-xs text-muted-foreground">/games/{toDelete.slug}</p>
          </div>
        )}
      </HoldConfirmDialog>
    </div>
  )
}