import { useEffect, useRef, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Navbar from '@/pages/home/Navbar'
import { useTheme } from '@/components/theme-context'
import {
    Loader2, Gamepad2, User, Calendar, Tag,
    Star,
    Eye,
    ArrowLeft,
} from 'lucide-react'
import {
    Dialog,
    DialogContent,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import api from '@/services/api'
import ControlsViewer from '@/components/controls/ControlsViewer'
import GamePlayer from '@/components/game/GamePlayer'

export default function GamePage() {
    const { slug } = useParams()
    const [project, setProject] = useState(null)
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)
    const [forbidden, setForbidden] = useState(false)
    const [mediaUrls, setMediaUrls] = useState({})
    const { theme, setTheme } = useTheme()
    const isDark = theme === 'dark'
    const activeVersion = project?.versiones?.[0]
    const [selectedImage, setSelectedImage] = useState(null)
    
    const navigate = useNavigate()
    // Slug del proyecto ya cargado, para no volver a pedirlo (y contar otra
    // visita) al reemplazar en la URL un enlace antiguo por el actual.
    const loadedSlug = useRef(null)

    useEffect(() => {
        if (loadedSlug.current === slug) return
        api.get(`/public/games/${slug}`)
            .then(res => {
                const data = res.data.data
                loadedSlug.current = data.slug
                setProject(data)
                if (data.slug !== slug) navigate(`/games/${data.slug}`, { replace: true })
            })
            .catch(err => {
                if (err.response?.status === 404) setNotFound(true)
                else if (err.response?.status === 403) setForbidden(true)
                else toast.error('Error al cargar el proyecto')
            })
            .finally(() => setLoading(false))
    }, [slug, navigate])

    useEffect(() => {
        if (!project) return
        const mediaFiles = activeVersion?.archivos?.filter(f => f.tipo !== 'juego_webgl') ?? []
        mediaFiles.forEach(async file => {
            try {
                const res = await api.get(`/public/files/url?key=${encodeURIComponent(file.ruta_storage)}`)
                setMediaUrls(prev => ({ ...prev, [file.id]: res.data.data.url }))
            } catch { /* sin previsualización si la URL falla */ }
        })
    }, [project, activeVersion])

    if (loading) return (
        <div className="flex items-center justify-center min-h-svh bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )

    if (notFound) return (
        <div className="flex flex-col items-center justify-center min-h-svh bg-background gap-4">
            <Gamepad2 className="h-12 w-12 text-muted-foreground/30" />
            <h1 className="text-xl font-semibold">Proyecto no encontrado</h1>
            <p className="text-sm text-muted-foreground">
                El enlace puede haber expirado o el proyecto fue eliminado.
            </p>
            <Link to="/"><Button variant="outline">Ir al inicio</Button></Link>
        </div>
    )

    if (forbidden) return (
        <div className="flex flex-col items-center justify-center min-h-svh bg-background gap-4">
            <Gamepad2 className="h-12 w-12 text-muted-foreground/30" />
            <h1 className="text-xl font-semibold">Proyecto no disponible</h1>
            <p className="text-sm text-muted-foreground">
                Este proyecto no está publicado o su acceso es privado.
            </p>
            <Link to="/"><Button variant="outline">Ir al inicio</Button></Link>
        </div>
    )


    const controles = project.controles ?? []

    const archivos = activeVersion?.archivos ?? []
    const capturas = archivos.filter(f => f.tipo === 'captura')
    const portada = archivos.find(f => f.tipo === 'portada')
    const hasGame = archivos.some(f => f.tipo === 'juego_webgl')
    const gameSrc = hasGame
        ? `${import.meta.env.VITE_API_URL}/play/${project.id}/${activeVersion.id}/index.html`
        : null
    const visitCount = project?._count?.visitas ?? 0

    const calificaciones = (project.comentarios ?? [])
        .map(c => c.calificacion)
        .filter(Boolean)
    const promedio = calificaciones.length
        ? calificaciones.reduce((a, b) => a + b, 0) / calificaciones.length
        : null

    return (
        <div className="min-h-svh bg-background">

            <Navbar isDark={isDark} toggleTheme={() => setTheme(isDark ? 'light' : 'dark')} />

            <div className="container mx-auto px-4 sm:px-6 pt-24 pb-12 max-w-6xl space-y-8">

                {/* Encabezado */}
                <header className="space-y-4">
                    <Link
                        to="/games"
                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Catálogo de juegos
                    </Link>

                    <div className="space-y-3">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                            {project.nombre}
                        </h1>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <User className="h-3.5 w-3.5" />
                                <span>{project.usuario?.nombre}</span>
                            </div>

                            {project.fecha_publicacion && (
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span>
                                        {new Date(project.fecha_publicacion)
                                            .toLocaleDateString('es-CO')}
                                    </span>
                                </div>
                            )}

                            {activeVersion && (
                                <span className="font-mono text-xs">
                                    v{activeVersion.numero_version}
                                </span>
                            )}

                            <div className="flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/30 px-2.5 py-1 text-xs">
                                <Eye className="h-3.5 w-3.5" />
                                <span>
                                    {visitCount} visita{visitCount !== 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>

                        {(project.categoria || project.etiquetas?.length > 0) && (
                            <div className="flex flex-wrap gap-2">
                                {project.categoria && (
                                    <Badge variant="outline" className="text-xs">
                                        {project.categoria.nombre}
                                    </Badge>
                                )}

                                {project.etiquetas?.map(pe => (
                                    <Badge
                                        key={pe.id_etiqueta}
                                        variant="outline"
                                        className="text-xs border-border/50 text-muted-foreground"
                                    >
                                        <Tag className="h-3 w-3 mr-1" />
                                        {pe.etiqueta?.nombre}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                </header>

                {/* Reproductor */}
                <GamePlayer
                    src={gameSrc}
                    title={project.nombre}
                    version={activeVersion?.numero_version}
                    coverUrl={portada ? mediaUrls[portada.id] : null}
                />

                {/* min-w-0: el diagrama de teclado es más ancho que un móvil y
                    hace scroll dentro de su tarjeta; sin él, ensancharía la columna. */}
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="min-w-0 lg:col-span-2 space-y-6">

                        {/* Descripción */}
                        {project.descripcion && (
                            <Card className="border-border/50 bg-card/60">
                                <CardHeader>
                                    <CardTitle className="text-sm">Acerca del juego</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                                        {project.descripcion}
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Instrucciones */}
                        {project.instrucciones && (
                            <Card className="border-border/50 bg-card/60">
                                <CardHeader>
                                    <CardTitle className="text-sm">Instrucciones</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                                        {project.instrucciones}
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Controles */}
                        {controles.length > 0 && (
                            <Card className="border-border/50 bg-card/60">
                                <CardHeader>
                                    <CardTitle className="text-sm">Controles del juego</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ControlsViewer controls={controles} />
                                </CardContent>
                            </Card>
                        )}

                        {/* Capturas */}
                        {capturas.length > 0 && (
                            <Card className="border-border/50 bg-card/60">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm">Capturas</CardTitle>
                                        <p className="text-xs text-muted-foreground">Click para ampliar</p>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {capturas.map(cap => mediaUrls[cap.id] && (
                                            <button
                                                key={cap.id}
                                                type="button"
                                                onClick={() => setSelectedImage(mediaUrls[cap.id])}
                                                className="group relative overflow-hidden rounded-lg border border-border/50"
                                            >
                                                <img
                                                    src={mediaUrls[cap.id]}
                                                    alt="captura"
                                                    className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/30">
                                                    <Eye className="h-5 w-5 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Evaluaciones */}
                        {project.comentarios?.length > 0 && (
                            <Card className="border-border/50 bg-card/60">
                                <CardHeader>
                                    <CardTitle className="text-sm">
                                        Evaluaciones ({project.comentarios.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {project.comentarios.map(comment => (
                                        <div key={comment.id} className="space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-6 w-6 rounded-md">
                                                        <AvatarFallback className="rounded-md text-xs bg-primary/10 text-primary">
                                                            {comment.usuario?.nombre.charAt(0).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm font-medium">{comment.usuario?.nombre}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {comment.calificacion && Array.from({ length: 5 }).map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`h-3.5 w-3.5 ${i < comment.calificacion ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'}`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-sm text-muted-foreground pl-8">{comment.contenido}</p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Información */}
                    <aside className="min-w-0 space-y-4">
                        <Card className="border-border/50 bg-card/60">
                            <CardHeader>
                                <CardTitle className="text-sm">Información</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Estado</span>
                                    <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                                        Publicado
                                    </Badge>
                                </div>
                                {promedio !== null && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Valoración</span>
                                        <span className="flex items-center gap-1">
                                            <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                                            {promedio.toFixed(1)}
                                            <span className="text-xs text-muted-foreground">({calificaciones.length})</span>
                                        </span>
                                    </div>
                                )}
                                {project.categoria && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Categoría</span>
                                        <span>{project.categoria.nombre}</span>
                                    </div>
                                )}
                                {activeVersion && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Versión</span>
                                        <span className="font-mono text-xs">v{activeVersion.numero_version}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Autor</span>
                                    <span>{project.usuario?.nombre}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-border/50 bg-card/60">
                            <CardContent className="pt-4">
                                <p className="text-xs text-muted-foreground text-center">
                                    Desarrollado en el{' '}
                                    <span className="text-foreground">Semillero VIRAL</span>
                                </p>
                            </CardContent>
                        </Card>
                    </aside>
                </div>
            </div>
            <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
                <DialogContent className="bg-background text-popover-foreground sm:max-w-5xl p-2">
                    {selectedImage && (
                        <img
                            src={selectedImage}
                            alt="Captura ampliada"
                            className="w-full max-h-[85vh] object-contain rounded-lg"
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
