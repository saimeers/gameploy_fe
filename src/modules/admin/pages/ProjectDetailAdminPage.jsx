import { useCallback, useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  ArrowLeft, Globe, Lock, Link2, Loader2, ExternalLink,
  Star, Eye, MessageSquare, FileArchive, Image, Camera,
  Download, Gamepad2, EyeOff, Tag, Trash2, Play, ListTree,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge }  from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { adminService } from '../services/admin.service'
import ControlsViewer   from '@/components/controls/ControlsViewer'
import HoldConfirmDialog from '@/components/HoldConfirmDialog'
import VisitOrigins     from '@/components/visits/VisitOrigins'
import BuildContents    from '@/components/files/BuildContents'
import { BuildPreviewDialog, FileMeta, ImageThumb } from '@/components/files/FilePreviews'
import { formatBytes, gameUrl } from '@/components/files/fileFormat'

const STATUS_CFG = {
  publicado: { label: 'Publicado', class: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  borrador:  { label: 'Borrador',  class: 'bg-muted/50 text-muted-foreground border-border' },
  archivado: { label: 'Archivado', class: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
}

const VISIBILITY_ICON = { publico: Globe, privado: Lock, por_enlace: Link2 }

const FILE_CFG = {
  juego_webgl: { label: 'Juego WebGL', icon: FileArchive },
  portada:     { label: 'Portada',     icon: Image },
  captura:     { label: 'Captura',     icon: Camera },
}

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

/** Campo de solo lectura: muestra un guion cuando no hay valor. */
function Field({ label, children, className = '' }) {
  return (
    <div className={`space-y-1 ${className}`}>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="text-sm">{children ?? <span className="text-muted-foreground">—</span>}</div>
    </div>
  )
}

function Stat({ icon: Icon, value, label }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-card/40 px-3 py-2">
      <Icon className="h-4 w-4 text-primary shrink-0" />
      <div className="leading-tight">
        <p className="text-sm font-semibold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

/** El .zip del juego: datos, prueba en vivo, contenido, descarga y borrado. */
function BuildCard({ project, version, archivo, onDelete, onDownload, downloading }) {
  const [playing, setPlaying] = useState(false)
  const [showContents, setShowContents] = useState(false)
  const loadContents = useCallback(
    () => adminService.getBuildContents(archivo.id).then(res => res.data.data),
    [archivo.id]
  )

  return (
    <div className="overflow-hidden rounded-lg border border-border/50 bg-background/40">
      <div className="flex flex-wrap items-center gap-3 p-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
          <FileArchive className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{archivo.nombre_archivo}</p>
          <FileMeta archivo={archivo} />
        </div>
        <div className="flex items-center gap-1">
          <Button size="xs" onClick={() => setPlaying(true)}>
            <Play /> Probar
          </Button>
          <Button
            variant="ghost"
            size="xs"
            aria-expanded={showContents}
            onClick={() => setShowContents(v => !v)}
          >
            <ListTree /> Contenido
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            title="Descargar .zip"
            aria-label="Descargar .zip"
            disabled={downloading === archivo.id}
            onClick={() => onDownload(archivo)}
          >
            {downloading === archivo.id ? <Loader2 className="animate-spin" /> : <Download />}
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            className="text-destructive hover:text-destructive"
            title="Eliminar definitivamente"
            aria-label="Eliminar el .zip"
            onClick={() => onDelete(archivo)}
          >
            <Trash2 />
          </Button>
        </div>
      </div>

      {showContents && (
        <div className="border-t border-border/50 p-3">
          <BuildContents load={loadContents} />
        </div>
      )}

      <BuildPreviewDialog
        open={playing}
        onOpenChange={setPlaying}
        src={gameUrl(project.id, version)}
        title={project.nombre}
        version={version.numero_version}
      />
    </div>
  )
}

/** Archivos de una versión: el build y las imágenes con vista previa. */
function VersionFiles({ project, version, onDelete, onDownload, downloading }) {
  const archivos = version.archivos ?? []
  const build = archivos.find(a => a.tipo === 'juego_webgl')
  const portada = archivos.find(a => a.tipo === 'portada')
  const capturas = archivos.filter(a => a.tipo === 'captura')

  if (archivos.length === 0) {
    return <p className="text-sm text-muted-foreground">Sin archivos en esta versión.</p>
  }

  const deleteAction = (archivo) => (
    <Button
      variant="secondary"
      size="icon-xs"
      className="bg-background/80 text-destructive backdrop-blur-sm hover:text-destructive"
      aria-label={`Eliminar ${archivo.nombre_archivo}`}
      onClick={() => onDelete(archivo)}
    >
      <Trash2 />
    </Button>
  )

  return (
    <div className="space-y-4">
      {build ? (
        <BuildCard
          project={project}
          version={version}
          archivo={build}
          onDelete={onDelete}
          onDownload={onDownload}
          downloading={downloading}
        />
      ) : (
        <p className="rounded-md border border-dashed border-border/60 px-3 py-2 text-xs text-muted-foreground">
          Esta versión no tiene el .zip del juego.
        </p>
      )}

      {(portada || capturas.length > 0) && (
        <div className="grid gap-3 sm:grid-cols-[2fr_3fr]">
          {portada && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Portada</p>
              <ImageThumb archivo={portada} label="Portada" actions={deleteAction(portada)} />
            </div>
          )}
          {capturas.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Capturas ({capturas.length})</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {capturas.map((captura, i) => (
                  <ImageThumb
                    key={captura.id}
                    archivo={captura}
                    label={`Captura ${i + 1}`}
                    actions={deleteAction(captura)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ProjectDetailAdminPage() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [openingFile, setOpeningFile] = useState(null)
  const [fileToDelete, setFileToDelete] = useState(null)
  const [commentToDelete, setCommentToDelete] = useState(null)
  const [moderating, setModerating] = useState(null)

  useEffect(() => {
    let cancelled = false

    const fetchProject = async () => {
      try {
        const res = await adminService.getProject(id)
        if (!cancelled) setProject(res.data.data)
      } catch (err) {
        if (cancelled) return
        if (err.response?.status === 404) {
          toast.error('El proyecto no existe')
          navigate('/admin/projects')
          return
        }
        toast.error('Error al cargar el proyecto')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchProject()
    return () => { cancelled = true }
  }, [id, navigate])

  const loadVisits = useCallback(
    (days) => adminService.getProjectVisits(id, days).then(res => res.data.data),
    [id]
  )

  /** Descarga el archivo original con un enlace de 5 minutos que firma la API. */
  const downloadFile = async (archivo) => {
    setOpeningFile(archivo.id)
    try {
      const res = await adminService.downloadFile(archivo.id)
      window.location.assign(res.data.data.url)
    } catch {
      toast.error('No se pudo descargar el archivo')
    } finally {
      setOpeningFile(null)
    }
  }

  /** Borrado permanente: quita el archivo del bucket y de la base de datos. */
  const deleteFile = async (archivo) => {
    try {
      await adminService.deleteFile(archivo.id)
      setProject(prev => ({
        ...prev,
        versiones: prev.versiones.map(version => ({
          ...version,
          archivos: (version.archivos ?? []).filter(a => a.id !== archivo.id),
        })),
      }))
      toast.success('Archivo eliminado definitivamente')
    } catch {
      toast.error('No se pudo eliminar el archivo')
    }
  }

  /** Oculta o vuelve a mostrar un comentario, sin borrarlo. */
  const moderateComment = async (comentario) => {
    setModerating(comentario.id)
    try {
      await adminService.moderateComment(comentario.id, !comentario.activo)
      setProject(prev => ({
        ...prev,
        comentarios: prev.comentarios.map(c =>
          c.id === comentario.id ? { ...c, activo: !c.activo } : c
        ),
      }))
      toast.success(comentario.activo ? 'Comentario oculto' : 'Comentario visible de nuevo')
    } catch {
      toast.error('No se pudo moderar el comentario')
    } finally {
      setModerating(null)
    }
  }

  /** Borrado permanente: la fila desaparece de la base de datos. */
  const deleteComment = async (comentario) => {
    try {
      await adminService.deleteComment(comentario.id)
      setProject(prev => ({
        ...prev,
        comentarios: prev.comentarios.filter(c => c.id !== comentario.id),
      }))
      toast.success('Comentario eliminado definitivamente')
    } catch {
      toast.error('No se pudo eliminar el comentario')
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

  const statusCfg  = STATUS_CFG[project.estado] ?? { label: project.estado, class: '' }
  const VisIcon    = VISIBILITY_ICON[project.visibilidad] ?? Lock
  const versiones  = project.versiones ?? []
  const controles  = project.controles ?? []
  const comentarios = project.comentarios ?? []
  const etiquetas  = project.etiquetas ?? []

  return (
    <div className="space-y-5 max-w-3xl">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/admin/projects">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              {project.destacado && <Star className="h-4 w-4 text-yellow-400 shrink-0" />}
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

        {project.estado === 'publicado' && (
          <a href={`/games/${project.slug}`} target="_blank" rel="noreferrer">
            <Button size="sm" variant="outline" className="gap-2 shrink-0">
              <ExternalLink className="h-4 w-4" />
              Ver juego
            </Button>
          </a>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat icon={Eye}           value={project._count?.visitas ?? 0}     label="Visitas" />
        <Stat icon={MessageSquare} value={comentarios.length}               label="Comentarios" />
        <Stat icon={FileArchive}   value={versiones.length}                 label="Versiones" />
        <Stat icon={Gamepad2}      value={controles.length}                 label="Controles" />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info">
        <TabsList className="bg-card/60 border border-border/50">
          <TabsTrigger value="info">Información</TabsTrigger>
          <TabsTrigger value="controles">Controles</TabsTrigger>
          <TabsTrigger value="versiones">Versiones y archivos</TabsTrigger>
          <TabsTrigger value="comentarios">Comentarios</TabsTrigger>
          <TabsTrigger value="visitas">Visitas</TabsTrigger>
        </TabsList>

        {/* ── Información ── */}
        <TabsContent value="info" className="mt-4">
          <Card className="bg-card/60 border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Información del proyecto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Autor">
                  <p>{project.usuario?.nombre}</p>
                  <p className="text-xs text-muted-foreground">{project.usuario?.correo}</p>
                </Field>
                <Field label="Categoría">{project.categoria?.nombre}</Field>
                <Field label="Fecha de creación">{formatDate(project.fecha_creacion)}</Field>
                <Field label="Fecha de publicación">{formatDate(project.fecha_publicacion)}</Field>
              </div>

              <Field label="Descripción">
                {project.descripcion && (
                  <p className="whitespace-pre-wrap leading-relaxed">{project.descripcion}</p>
                )}
              </Field>

              <Field label="Instrucciones generales">
                {project.instrucciones && (
                  <p className="whitespace-pre-wrap leading-relaxed">{project.instrucciones}</p>
                )}
              </Field>

              <Field label="Etiquetas">
                {etiquetas.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {etiquetas.map(({ etiqueta }) => (
                      <span
                        key={etiqueta.id}
                        className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs text-primary"
                      >
                        <Tag className="h-3 w-3 shrink-0" />
                        {etiqueta.nombre}
                      </span>
                    ))}
                  </div>
                )}
              </Field>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Controles ── */}
        <TabsContent value="controles" className="mt-4">
          <Card className="bg-card/60 border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Controles del juego</CardTitle>
            </CardHeader>
            <CardContent>
              {controles.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  El proyecto no tiene controles registrados.
                </p>
              ) : (
                <ControlsViewer controls={controles} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Versiones y archivos ── */}
        <TabsContent value="versiones" className="mt-4 space-y-3">
          {versiones.length === 0 ? (
            <Card className="bg-card/60 border-border/50">
              <CardContent className="py-8">
                <p className="text-sm text-muted-foreground text-center">
                  El proyecto todavía no tiene versiones.
                </p>
              </CardContent>
            </Card>
          ) : (
            versiones.map(version => (
              <Card key={version.id} className="bg-card/60 border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="text-base font-mono">v{version.numero_version}</CardTitle>
                    <div className="flex items-center gap-2">
                      {version.es_activa && (
                        <Badge variant="outline" className="text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                          Activa
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatDate(version.fecha_subida)}
                      </span>
                    </div>
                  </div>
                  {version.notas_version && (
                    <p className="text-xs text-muted-foreground">{version.notas_version}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <VersionFiles
                    project={project}
                    version={version}
                    onDelete={setFileToDelete}
                    onDownload={downloadFile}
                    downloading={openingFile}
                  />
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* ── Visitas ── */}
        <TabsContent value="visitas" className="mt-4">
          <VisitOrigins load={loadVisits} />
        </TabsContent>

        {/* ── Comentarios ── */}
        <TabsContent value="comentarios" className="mt-4">
          <Card className="bg-card/60 border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Retroalimentación recibida</CardTitle>
            </CardHeader>
            <CardContent>
              {comentarios.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  El proyecto no ha recibido comentarios.
                </p>
              ) : (
                <div className="space-y-3">
                  {comentarios.map(comentario => (
                    <div
                      key={comentario.id}
                      className={`group rounded-md border border-border/50 bg-background/40 px-3 py-2.5 space-y-1 ${
                        comentario.activo ? '' : 'opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{comentario.usuario?.nombre}</p>
                          {comentario.calificacion && (
                            <span className="flex items-center gap-0.5 text-xs text-yellow-400">
                              <Star className="h-3 w-3 fill-current" />
                              {comentario.calificacion}/5
                            </span>
                          )}
                          {!comentario.activo && (
                            <Badge variant="outline" className="gap-1 text-xs">
                              <EyeOff className="h-3 w-3" />
                              Oculto
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(comentario.fecha)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                            title={comentario.activo ? 'Ocultar comentario' : 'Volver a mostrarlo'}
                            disabled={moderating === comentario.id}
                            onClick={() => moderateComment(comentario)}
                          >
                            {moderating === comentario.id
                              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              : comentario.activo
                                ? <EyeOff className="h-3.5 w-3.5" />
                                : <Eye className="h-3.5 w-3.5" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                            title="Eliminar definitivamente"
                            onClick={() => setCommentToDelete(comentario)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {comentario.contenido}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Borrado permanente de un archivo */}
      <HoldConfirmDialog
        open={!!fileToDelete}
        onOpenChange={() => setFileToDelete(null)}
        title="Eliminar archivo"
        description={`Se borrará del almacenamiento y de la base de datos. No se puede deshacer, y el proyecto de ${project.usuario?.nombre ?? 'su autor'} dejará de tenerlo.`}
        label="Mantén pulsado para eliminar"
        onConfirm={() => {
          deleteFile(fileToDelete)
          setFileToDelete(null)
        }}
      >
        {fileToDelete && (
          <div className="rounded-md border border-border/50 bg-background/40 px-3 py-2">
            <p className="truncate text-sm font-medium">{fileToDelete.nombre_archivo}</p>
            <p className="text-xs text-muted-foreground">
              {FILE_CFG[fileToDelete.tipo]?.label ?? fileToDelete.tipo}
              {' · '}
              {formatBytes(fileToDelete.tamanio_bytes)}
            </p>
          </div>
        )}
      </HoldConfirmDialog>

      {/* Borrado permanente de un comentario */}
      <HoldConfirmDialog
        open={!!commentToDelete}
        onOpenChange={() => setCommentToDelete(null)}
        title="Eliminar comentario"
        description="La retroalimentación desaparece de la base de datos y no queda registro. Si solo quieres retirarla de la vista pública, ocúltala en lugar de eliminarla."
        label="Mantén pulsado para eliminar"
        onConfirm={() => {
          deleteComment(commentToDelete)
          setCommentToDelete(null)
        }}
      >
        {commentToDelete && (
          <div className="space-y-1 rounded-md border border-border/50 bg-background/40 px-3 py-2">
            <p className="text-sm font-medium">{commentToDelete.usuario?.nombre}</p>
            <p className="text-sm text-muted-foreground">{commentToDelete.contenido}</p>
          </div>
        )}
      </HoldConfirmDialog>
    </div>
  )
}
