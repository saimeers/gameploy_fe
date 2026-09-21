import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '@/pages/home/Navbar'
import { useTheme } from '@/components/theme-context'
import {
    Loader2, Gamepad2, User, Calendar, Tag,
    Star,
    Eye,
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

function GamePlayer({ archivos, projectName, projectId, versionId }) {
    const [started, setStarted] = useState(false)

    // Se deriva de las props en el render: no hace falta estado ni efecto.
    const webglFile = archivos?.find(f => f.tipo === 'juego_webgl')
    const error = webglFile ? null : 'No hay archivos del juego disponibles.'

    if (error) return (
        <div className="flex items-center justify-center h-64 rounded-xl border border-border/50 bg-card/40">
            <div className="text-center space-y-2">
                <Gamepad2 className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                <p className="text-sm text-muted-foreground">{error}</p>
            </div>
        </div>
    )

    const iframeSrc =
        `${import.meta.env.VITE_API_URL}/play/${projectId}/${versionId}/index.html`

    return (
        <div className="space-y-3">
            {!started ? (
                <div className="flex flex-col items-center justify-center h-[500px] rounded-xl border border-border/50 bg-gradient-to-br from-primary/5 to-accent/10 gap-4">
                    <div className="rounded-full bg-primary/10 p-6">
                        <Gamepad2 className="h-12 w-12 text-primary" />
                    </div>

                    <div className="text-center space-y-1">
                        <p className="font-semibold">{projectName}</p>
                        <p className="text-sm text-muted-foreground">
                            Haz click para iniciar el juego
                        </p>
                    </div>

                    <Button onClick={() => setStarted(true)} className="gap-2">
                        <Gamepad2 className="h-4 w-4" />
                        Jugar ahora
                    </Button>
                </div>
            ) : (
                <div className="relative rounded-xl overflow-hidden border border-border/50">
                    <iframe
                        src={iframeSrc}
                        className="w-full"
                        style={{ height: '600px' }}
                        allow="fullscreen"
                        allowFullScreen
                        title={projectName}
                    />
                </div>
            )}
        </div>
    )
}

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
    
    useEffect(() => {
        api.get(`/public/games/${slug}`)
            .then(res => setProject(res.data.data))
            .catch(err => {
                if (err.response?.status === 404) setNotFound(true)
                else if (err.response?.status === 403) setForbidden(true)
                else toast.error('Error al cargar el proyecto')
            })
            .finally(() => setLoading(false))
    }, [slug])

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

    const capturas = activeVersion?.archivos?.filter(f => f.tipo === 'captura') ?? []
    const visitCount = project?._count?.visitas ?? 0

    return (
        <div className="min-h-svh bg-background">

            <Navbar isDark={isDark} toggleTheme={() => setTheme(isDark ? 'light' : 'dark')} />

            <div className="container mx-auto px-6 pt-24 pb-8 max-w-5xl space-y-8">

                {/* Header */}
                <div className="space-y-4">
                    {/* Visitas */}

                    <div className="flex flex-wrap items-start gap-3">
                        <div className="flex-1 min-w-0 space-y-3">

                            {/* Título */}
                            <div className="space-y-2">
                                <h1 className="text-3xl font-bold tracking-tight">
                                    {project.nombre}
                                </h1>

                                {/* Metadata */}
                                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">

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
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-mono text-xs">
                                                v{activeVersion.numero_version}
                                            </span>
                                        </div>
                                    )}

                                    {/* Views */}
                                    <div className="flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/30 px-2.5 py-1 text-xs">
                                        <Eye className="h-3.5 w-3.5" />
                                        <span>
                                            {visitCount} visita{visitCount !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Tags */}
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
                        </div>
                    </div>

                    {project.descripcion && (
                        <p className="text-muted-foreground leading-relaxed max-w-2xl">{project.descripcion}</p>
                    )}

                    {/* Capturas */}
                    {capturas.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium">Capturas</h3>
                                <p className="text-xs text-muted-foreground">
                                    Click para ampliar
                                </p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {capturas.map(cap => mediaUrls[cap.id] && (
                                    <button
                                        key={cap.id}
                                        onClick={() => setSelectedImage(mediaUrls[cap.id])}
                                        className="group relative overflow-hidden rounded-xl border border-border/50"
                                    >
                                        <img
                                            src={mediaUrls[cap.id]}
                                            alt="captura"
                                            className="
                            w-full h-32 md:h-40 object-cover
                            transition-transform duration-300
                            group-hover:scale-105
                        "
                                        />

                                        {/* Overlay */}
                                        <div className="
                        absolute inset-0 bg-black/0
                        group-hover:bg-black/30
                        transition-colors duration-300
                        flex items-center justify-center
                    ">
                                            <Eye className="
                            h-5 w-5 text-white opacity-0
                            group-hover:opacity-100
                            transition-opacity
                        " />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Game player */}
                <GamePlayer
                    archivos={activeVersion?.archivos}
                    projectName={project.nombre}
                    projectId={project.id}
                    versionId={activeVersion?.id}
                />

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">

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

                        {/* Comments */}
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

                    {/* Sidebar info */}
                    <div className="space-y-4">
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
                    </div>
                </div>
            </div>
            <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
                <DialogContent className="bg-background text-popover-foreground">
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