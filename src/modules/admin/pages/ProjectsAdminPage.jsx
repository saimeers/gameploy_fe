import { useEffect, useState, useCallback } from 'react'
import {
  Search, MoreHorizontal, Star, StarOff, Trash2,
  ChevronLeft, ChevronRight, ExternalLink,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge }   from '@/components/ui/badge'
import { Button }  from '@/components/ui/button'
import { Input }   from '@/components/ui/input'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { adminService } from '../services/admin.service'

const STATUS_CFG = {
  publicado: { label: 'Publicado', class: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  borrador:  { label: 'Borrador',  class: 'bg-muted/50 text-muted-foreground border-border' },
  archivado: { label: 'Archivado', class: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
}

export default function ProjectsAdminPage() {
  const [projects, setProjects] = useState([])
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [toDelete, setToDelete] = useState(null)
  const limit = 10

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminService.getProjects({ page, limit })
      setProjects(res.data.data)
      setTotal(res.data.meta.total)
    } catch {
      toast.error('Error al cargar proyectos')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { fetchProjects() }, [fetchProjects])

  const filtered = projects.filter(p => {
    const matchSearch = p.nombre.toLowerCase().includes(search.toLowerCase())
      || p.usuario?.nombre.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || p.estado === filterStatus
    return matchSearch && matchStatus
  })

  const handleFeatured = async (project) => {
    try {
      await adminService.toggleFeatured(project.id, !project.destacado)
      toast.success(project.destacado ? 'Proyecto quitado de destacados' : 'Proyecto destacado')
      fetchProjects()
    } catch {
      toast.error('Error al actualizar')
    }
  }

  const handleDelete = async () => {
    try {
      await adminService.deleteProject(toDelete.id)
      toast.success('Proyecto eliminado')
      fetchProjects()
    } catch {
      toast.error('Error al eliminar')
    }
    setToDelete(null)
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Proyectos</h1>
        <p className="text-sm text-muted-foreground">Gestiona todos los Juegos Serios de la plataforma.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o estudiante..."
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Todos los estados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="publicado">Publicado</SelectItem>
            <SelectItem value="borrador">Borrador</SelectItem>
            <SelectItem value="archivado">Archivado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="text-xs">Proyecto</TableHead>
              <TableHead className="text-xs">Autor</TableHead>
              <TableHead className="text-xs">Estado</TableHead>
              <TableHead className="text-xs">Categoría</TableHead>
              <TableHead className="text-xs">Publicado</TableHead>
              <TableHead className="text-xs w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 rounded bg-muted/40 animate-pulse" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-10">
                  No se encontraron proyectos.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(project => {
                const statusCfg = STATUS_CFG[project.estado] ?? { label: project.estado, class: '' }
                return (
                  <TableRow key={project.id} className="hover:bg-accent/20">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {project.destacado && (
                          <Star className="h-3.5 w-3.5 text-yellow-400 shrink-0" />
                        )}
                        <p className="text-sm font-medium">{project.nombre}</p>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">/{project.slug}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{project.usuario?.nombre}</p>
                      <p className="text-xs text-muted-foreground">{project.usuario?.correo}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${statusCfg.class}`}>
                        {statusCfg.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {project.categoria?.nombre ?? '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {project.fecha_publicacion
                          ? new Date(project.fecha_publicacion).toLocaleDateString('es-CO')
                          : '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem asChild>
                            <a
                              href={`/games/${project.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center"
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Ver proyecto
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleFeatured(project)}>
                            {project.destacado
                              ? <><StarOff className="mr-2 h-4 w-4" />Quitar destacado</>
                              : <><Star    className="mr-2 h-4 w-4" />Destacar</>}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setToDelete(project)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{total} proyecto{total !== 1 ? 's' : ''} en total</span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline" size="icon" className="h-7 w-7"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <span>{page} / {totalPages || 1}</span>
          <Button
            variant="outline" size="icon" className="h-7 w-7"
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Delete confirm */}
      <AlertDialog open={!!toDelete} onOpenChange={() => setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar proyecto</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de eliminar <strong>{toDelete?.nombre}</strong>?
              Esta acción no se puede deshacer y eliminará todos los archivos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}