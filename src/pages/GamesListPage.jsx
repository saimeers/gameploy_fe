import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Search, Tag, Gamepad2, Eye, User, Loader2 } from 'lucide-react'
import { Input }  from '@/components/ui/input'
import { Badge }  from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useTheme }  from '@/components/ThemeProvider'
import Navbar        from '@/pages/home/Navbar'
import api           from '@/services/api'

function GameCard({ project }) {
  const portadaFile = project.versiones?.[0]?.archivos?.find(a => a.tipo === 'portada')
  const [portadaUrl, setPortadaUrl] = useState(null)

  useEffect(() => {
    if (!portadaFile?.ruta_storage) return
    api.get(`/public/files/url?key=${encodeURIComponent(portadaFile.ruta_storage)}`)
      .then(res => setPortadaUrl(res.data.data.url))
      .catch(() => {})
  }, [portadaFile])

  return (
    <Link to={`/games/${project.slug}`} className="group">
      <Card className="border-border/50 bg-card/60 hover:border-primary/40 hover:bg-card/80 transition-all flex flex-col overflow-hidden">
        <div className="h-40 overflow-hidden bg-gradient-to-br from-primary/10 to-accent/20 flex items-center justify-center relative">
          {portadaUrl ? (
            <img src={portadaUrl} alt={project.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <Gamepad2 className="h-10 w-10 text-primary/30" />
          )}
          {project.destacado && (
            <div className="absolute top-2 left-2">
              <Badge className="text-xs bg-primary text-primary-foreground">Destacado</Badge>
            </div>
          )}
        </div>

        <CardHeader className="pb-1 pt-3 px-4">
          <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
            {project.nombre}
          </p>
          <p className="text-xs text-muted-foreground truncate">{project.descripcion}</p>
        </CardHeader>

        <CardContent className="px-4 pb-2 flex-1">
          <div className="flex flex-wrap gap-1.5">
            {project.categoria && (
              <Badge variant="outline" className="text-xs border-border/50 text-muted-foreground">
                {project.categoria.nombre}
              </Badge>
            )}
            {project.etiquetas?.slice(0, 2).map(pe => (
              <Badge key={pe.id_etiqueta} variant="outline" className="text-xs border-border/50 text-muted-foreground">
                {pe.etiqueta?.nombre}
              </Badge>
            ))}
          </div>
        </CardContent>

        <CardFooter className="px-4 py-3 border-t border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            <span>{project.usuario?.nombre}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Eye className="h-3 w-3" />
            <span>{project._count?.visitas ?? 0}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}

export default function GamesListPage() {
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'

  const [projects, setProjects]   = useState([])
  const [total, setTotal]         = useState(0)
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [categoria, setCategoria] = useState('all')
  const [categorias, setCategorias] = useState([])
  const [page, setPage]           = useState(1)
  const limit = 12

  useEffect(() => {
    api.get('/search/categorias').then(r => setCategorias(r.data.data)).catch(() => {})
  }, [])

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit }
      if (search)                params.q         = search
      if (categoria !== 'all')   params.categoria = categoria
      const res = await api.get('/search', { params })
      setProjects(res.data.data)
      setTotal(res.data.meta?.total ?? 0)
    } catch {}
    finally { setLoading(false) }
  }, [search, categoria, page])

  useEffect(() => { fetchProjects() }, [fetchProjects])

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchProjects() }, 400)
    return () => clearTimeout(t)
  }, [search])

  return (
    <div className="min-h-svh bg-background">
      <Navbar isDark={isDark} toggleTheme={() => setTheme(isDark ? 'light' : 'dark')} />

      <div className="container mx-auto px-6 pt-24 pb-16 space-y-8 max-w-6xl">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Juegos Serios</h1>
          <p className="text-muted-foreground">
            Explora los juegos desarrollados por el Semillero VIRAL.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar juegos..."
              className="pl-9"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <Select value={categoria} onValueChange={v => { setCategoria(v); setPage(1) }}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categorias.map(c => (
                <SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-3 text-center">
            <Gamepad2 className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-muted-foreground">No hay juegos publicados aún.</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-muted-foreground">{total} juego{total !== 1 ? 's' : ''}</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {projects.map(p => <GameCard key={p.id} project={p} />)}
            </div>

            {/* Pagination */}
            {total > limit && (
              <div className="flex items-center justify-center gap-3 pt-4">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  Anterior
                </Button>
                <span className="text-xs text-muted-foreground">Página {page} de {Math.ceil(total / limit)}</span>
                <Button variant="outline" size="sm" disabled={page >= Math.ceil(total / limit)} onClick={() => setPage(p => p + 1)}>
                  Siguiente
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}