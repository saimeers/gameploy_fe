import { Link } from 'react-router-dom'
import { ExternalLink, MoreHorizontal, Pencil, Trash2, Globe, Lock, Link2 } from 'lucide-react'
import { Badge }  from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'

const STATUS_CFG = {
  publicado: { label: 'Publicado', class: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  borrador:  { label: 'Borrador',  class: 'bg-muted/50 text-muted-foreground border-border' },
  archivado: { label: 'Archivado', class: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
}

const VISIBILITY_ICON = {
  publico:    Globe,
  privado:    Lock,
  por_enlace: Link2,
}

export default function ProjectCard({ project, onDelete }) {
  const statusCfg = STATUS_CFG[project.estado] ?? { label: project.estado, class: '' }
  const VisIcon   = VISIBILITY_ICON[project.visibilidad] ?? Lock

  return (
    <Card className="border-border/50 bg-card/60 flex flex-col hover:border-border/80 transition-colors">
      {/* Portada placeholder */}
      <div className="h-36 rounded-t-lg bg-gradient-to-br from-primary/10 to-accent/20 flex items-center justify-center">
        <span className="text-3xl font-bold text-primary/30">
          {project.nombre.charAt(0).toUpperCase()}
        </span>
      </div>

      <CardHeader className="pb-2 pt-3 px-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{project.nombre}</p>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {project.descripcion ?? 'Sin descripción'}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem asChild>
                <Link to={`/student/projects/${project.id}`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </DropdownMenuItem>
              {project.estado === 'publicado' && (
                <DropdownMenuItem asChild>
                  <a href={`/games/${project.slug}`} target="_blank" rel="noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Ver publicado
                  </a>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(project)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-3 flex-1">
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline" className={`text-xs ${statusCfg.class}`}>
            {statusCfg.label}
          </Badge>
          {project.categoria && (
            <Badge variant="outline" className="text-xs border-border/50 text-muted-foreground">
              {project.categoria.nombre}
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="px-4 py-3 border-t border-border/40 flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <VisIcon className="h-3 w-3" />
          <span className="capitalize">{project.visibilidad?.replace('_', ' ')}</span>
        </div>
        <Link
          to={`/student/projects/${project.id}`}
          className="text-xs text-primary hover:underline"
        >
          Gestionar →
        </Link>
      </CardFooter>
    </Card>
  )
}