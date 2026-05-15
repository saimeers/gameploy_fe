import { useEffect, useState, useCallback } from 'react'
import { useForm }   from 'react-hook-form'
import { toast }     from 'sonner'
import {
  Plus, CheckCircle, Upload, FileArchive,
  Image, Camera, Loader2, FolderOpen,
} from 'lucide-react'
import { Button }   from '@/components/ui/button'
import { Input }    from '@/components/ui/input'
import { Label }    from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge }    from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { studentService } from '../../services/student.service'

const FILE_TYPES = [
  { value: 'juego_webgl', label: 'Juego WebGL', icon: FileArchive, accept: '.zip', description: 'Archivo .zip exportado desde Unity WebGL' },
  { value: 'portada',     label: 'Portada',     icon: Image,       accept: 'image/*', description: 'Imagen de presentación del proyecto' },
  { value: 'captura',     label: 'Captura',     icon: Camera,      accept: 'image/*', description: 'Captura de pantalla del juego' },
]

function UploadZone({ versionId, projectId, fileType, onUploaded }) {
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const cfg = FILE_TYPES.find(f => f.value === fileType)

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setProgress(0)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('fileType', fileType)

      await studentService.uploadFile(projectId, versionId, formData, setProgress)
      toast.success(`${cfg.label} subida correctamente`)
      onUploaded()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Error al subir el archivo')
    } finally {
      setUploading(false)
      setProgress(0)
      e.target.value = ''
    }
  }

  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{cfg.label}</Label>
      <p className="text-xs text-muted-foreground">{cfg.description}</p>
      <label className={`flex items-center gap-3 rounded-lg border border-dashed border-border/60 px-4 py-3 cursor-pointer hover:border-border hover:bg-accent/20 transition-all ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
        <cfg.icon className="h-5 w-5 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          {uploading ? (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Subiendo... {progress}%</p>
              <Progress value={progress} className="h-1.5" />
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Click para seleccionar — {cfg.accept}
            </p>
          )}
        </div>
        <input
          type="file"
          accept={cfg.accept}
          className="hidden"
          onChange={handleFile}
          disabled={uploading}
        />
      </label>
    </div>
  )
}

function VersionCard({ version, projectId, onActivated, onUploaded }) {
  const [activating, setActivating] = useState(false)
  const [expanded, setExpanded]     = useState(false)

  const handleActivate = async () => {
    setActivating(true)
    try {
      await studentService.activateVersion(projectId, version.id)
      toast.success(`Versión ${version.numero_version} activada`)
      onActivated()
    } catch { toast.error('Error al activar versión') }
    finally { setActivating(false) }
  }

  const filesByType = (version.archivos ?? []).reduce((acc, f) => {
    acc[f.tipo] = f; return acc
  }, {})

  return (
    <Card className={`border-border/50 transition-colors ${version.es_activa ? 'bg-primary/5 border-primary/30' : 'bg-card/60'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm">v{version.numero_version}</CardTitle>
            {version.es_activa && (
              <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/30 gap-1">
                <CheckCircle className="h-3 w-3" />
                Activa
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!version.es_activa && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                disabled={activating}
                onClick={handleActivate}
              >
                {activating
                  ? <Loader2 className="h-3 w-3 animate-spin" />
                  : <CheckCircle className="h-3 w-3 mr-1" />}
                Activar
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setExpanded(v => !v)}
            >
              <Upload className="h-3 w-3 mr-1" />
              Archivos
            </Button>
          </div>
        </div>
        {version.notas_version && (
          <CardDescription className="text-xs">{version.notas_version}</CardDescription>
        )}
        <p className="text-xs text-muted-foreground">
          {new Date(version.fecha_subida).toLocaleDateString('es-CO')} ·{' '}
          {version.archivos?.length ?? 0} archivo{version.archivos?.length !== 1 ? 's' : ''}
        </p>
      </CardHeader>

      {/* Uploaded files summary */}
      {(version.archivos?.length ?? 0) > 0 && !expanded && (
        <CardContent className="pt-0 pb-3">
          <div className="flex flex-wrap gap-1.5">
            {FILE_TYPES.filter(ft => filesByType[ft.value]).map(ft => (
              <Badge key={ft.value} variant="outline" className="text-xs gap-1 border-border/50">
                <ft.icon className="h-3 w-3" />
                {ft.label}
              </Badge>
            ))}
          </div>
        </CardContent>
      )}

      {/* Upload zone */}
      {expanded && (
        <CardContent className="pt-0 space-y-3 border-t border-border/40 mt-2 pt-4">
          {FILE_TYPES.map(ft => (
            <UploadZone
              key={ft.value}
              versionId={version.id}
              projectId={projectId}
              fileType={ft.value}
              onUploaded={onUploaded}
            />
          ))}
        </CardContent>
      )}
    </Card>
  )
}

export default function ProjectVersionsTab({ projectId }) {
  const [versions, setVersions] = useState([])
  const [loading, setLoading]   = useState(true)
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const fetchVersions = useCallback(async () => {
    setLoading(true)
    try {
      const res = await studentService.getVersions(projectId)
      setVersions(res.data.data)
    } catch { toast.error('Error al cargar versiones') }
    finally { setLoading(false) }
  }, [projectId])

  useEffect(() => { fetchVersions() }, [fetchVersions])

  const onCreateVersion = async (data) => {
    setCreating(true)
    try {
      await studentService.createVersion(projectId, {
        numero_version: data.numero_version,
        notas_version:  data.notas_version || null,
      })
      toast.success(`Versión ${data.numero_version} creada`)
      reset()
      setShowForm(false)
      fetchVersions()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Error al crear versión')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-4">

      {/* New version button */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Versiones del proyecto</p>
          <p className="text-xs text-muted-foreground">
            Sube archivos WebGL, portadas y capturas por versión.
          </p>
        </div>
        <Button
          size="sm"
          variant={showForm ? 'outline' : 'default'}
          className="gap-2"
          onClick={() => setShowForm(v => !v)}
        >
          <Plus className="h-4 w-4" />
          {showForm ? 'Cancelar' : 'Nueva versión'}
        </Button>
      </div>

      {/* Create version form */}
      {showForm && (
        <Card className="border-border/50 bg-card/60">
          <CardHeader>
            <CardTitle className="text-sm">Nueva versión</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onCreateVersion)} className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Número de versión *</Label>
                  <Input
                    placeholder="Ej: 1.0, 1.1, 2.0"
                    {...register('numero_version', { required: 'Requerido' })}
                  />
                  {errors.numero_version && (
                    <p className="text-xs text-destructive">{errors.numero_version.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Notas de cambios</Label>
                  <Input
                    placeholder="¿Qué cambió en esta versión?"
                    {...register('notas_version')}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" size="sm" disabled={creating}>
                  {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Crear versión
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Versions list */}
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : versions.length === 0 ? (
        <div className="flex flex-col items-center py-10 gap-2 text-center">
          <FolderOpen className="h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            Aún no hay versiones. Crea la primera para subir tus archivos.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {versions.map(version => (
            <VersionCard
              key={version.id}
              version={version}
              projectId={projectId}
              onActivated={fetchVersions}
              onUploaded={fetchVersions}
            />
          ))}
        </div>
      )}
    </div>
  )
}