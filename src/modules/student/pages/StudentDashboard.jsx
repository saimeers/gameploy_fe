import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Plus, FolderOpen, Eye, MessageSquare, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import ProjectCard from '../components/ProjectCard'
import { studentService } from '../services/student.service'
import { useAuthStore } from '@/store/authStore'

export default function StudentDashboard() {
  const user = useAuthStore(s => s.user)
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const loadProjects = useCallback(
    () => studentService.getMyProjects({ limit: 50 }).then(res => res.data.data),
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

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await studentService.deleteProject(toDelete.id)
      toast.success('Proyecto eliminado')
      refreshProjects()
    } catch {
      toast.error('Error al eliminar el proyecto')
    } finally {
      setDeleting(false)
      setToDelete(null)
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
      <AlertDialog open={!!toDelete} onOpenChange={() => setToDelete(null)}>
        <AlertDialogContent className="bg-background text-popover-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar proyecto</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de eliminar <strong>{toDelete?.nombre}</strong>?
              Se eliminarán todos los archivos y versiones asociados. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}