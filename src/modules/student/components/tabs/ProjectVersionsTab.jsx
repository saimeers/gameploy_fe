import { useEffect, useState, useCallback, useRef } from 'react'
import { useForm }   from 'react-hook-form'
import { toast }     from 'sonner'
import {
  Plus, CheckCircle, Upload, FileArchive, Image, Camera,
  Loader2, FolderOpen, Download, Trash2, Eye, EyeOff, X,
} from 'lucide-react'
import { Button }   from '@/components/ui/button'
import { Input }    from '@/components/ui/input'
import { Label }    from '@/components/ui/label'
import { Badge }    from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { studentService } from '../../services/student.service'
import api from '@/services/api'

// ─── Semantic version helpers ─────────────────────────────────────────────────

function parseVersion(str) {
  // Format: MAJOR.MINOR.PATCH[-beta]
  const match = str?.match(/^(\d+)\.(\d+)\.(\d+)(-beta)?$/)
  if (!match) return null
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    beta:  !!match[4],
  }
}

function formatVersion({ major, minor, patch, beta }) {
  return `${major}.${minor}.${patch}${beta ? '-beta' : ''}`
}

function suggestNext(latestStr, type) {
  const v = parseVersion(latestStr)
  if (!v) return type === 'major' ? '1.0.0' : '0.1.0'
  if (type === 'major') return formatVersion({ major: v.major + 1, minor: 0, patch: 0, beta: false })
  if (type === 'minor') return formatVersion({ major: v.major, minor: v.minor + 1, patch: 0, beta: false })
  if (type === 'patch') return formatVersion({ major: v.major, minor: v.minor, patch: v.patch + 1, beta: false })
  if (type === 'beta')  return formatVersion({ ...v, beta: true })
  return ''
}

function isVersionGreater(newStr, latestStr) {
  const n = parseVersion(newStr)
  const l = parseVersion(latestStr)
  if (!n) return false
  if (!l) return true
  if (n.major !== l.major) return n.major > l.major
  if (n.minor !== l.minor) return n.minor > l.minor
  if (n.patch !== l.patch) return n.patch > l.patch
  // beta < non-beta of same version
  if (n.beta && !l.beta) return false
  return true
}

// ─── WebGL zip validator ──────────────────────────────────────────────────────

async function validateWebGLZip(file) {
  // We use the browser's native zip reading via DataTransferItem — not available
  // so we do a lightweight check: filename pattern and size
  // For proper validation, use JSZip
  const JSZip = (await import('jszip')).default
  const zip = await JSZip.loadAsync(file)
  const paths = Object.keys(zip.files)

  const hasIndexHtml   = paths.some(p => p === 'index.html' || p.endsWith('/index.html'))
  const hasBuildFolder = paths.some(p => p.startsWith('Build/') || p.includes('/Build/'))
  const hasTemplateData = paths.some(p => p.startsWith('TemplateData/') || p.includes('/TemplateData/'))

  const errors = []
  if (!hasIndexHtml)    errors.push('Falta index.html')
  if (!hasBuildFolder)  errors.push('Falta carpeta /Build')
  if (!hasTemplateData) errors.push('Falta carpeta /TemplateData')

  // Check Build folder has the expected files
  const buildFiles = paths.filter(p => p.includes('Build/'))
  const hasLoader    = buildFiles.some(p => p.endsWith('.loader.js'))
  const hasFramework = buildFiles.some(p => p.endsWith('.framework.js'))
  const hasData      = buildFiles.some(p => p.endsWith('.data') || p.endsWith('.data.gz') || p.endsWith('.data.br'))
  const hasWasm      = buildFiles.some(p => p.endsWith('.wasm') || p.endsWith('.wasm.gz') || p.endsWith('.wasm.br'))

  if (!hasLoader)    errors.push('Falta .loader.js en /Build')
  if (!hasFramework) errors.push('Falta .framework.js en /Build')
  if (!hasData)      errors.push('Falta .data en /Build')
  if (!hasWasm)      errors.push('Falta .wasm en /Build')

  return { valid: errors.length === 0, errors }
}

// ─── File preview modal ───────────────────────────────────────────────────────

function FilePreviewModal({ files, open, onClose, onDelete, projectId, versionId }) {
  const [urlCache, setUrlCache] = useState({})
  const [loadingUrl, setLoadingUrl] = useState({})
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleteInput, setDeleteInput]     = useState('')

  const loadUrl = async (file) => {
    if (urlCache[file.id]) return
    setLoadingUrl(prev => ({ ...prev, [file.id]: true }))
    try {
      const res = await api.get(`/public/files/url?key=${encodeURIComponent(file.ruta_storage)}`)
      setUrlCache(prev => ({ ...prev, [file.id]: res.data.data.url }))
    } catch { toast.error('Error al cargar preview') }
    finally { setLoadingUrl(prev => ({ ...prev, [file.id]: false })) }
  }

  useEffect(() => {
    if (open) files.forEach(f => f.tipo !== 'juego_webgl' && loadUrl(f))
  }, [open, files])

  const handleDelete = async () => {
    if (deleteInput !== 'eliminar') return
    try {
      await api.delete(`/projects/${projectId}/versions/${versionId}/files/${deleteConfirm.id}`)
      toast.success('Archivo eliminado permanentemente')
      setDeleteConfirm(null)
      setDeleteInput('')
      onDelete()
    } catch { toast.error('Error al eliminar') }
  }

  const imageFiles = files.filter(f => f.tipo !== 'juego_webgl')

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-sm">Archivos de la versión</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {imageFiles.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No hay imágenes en esta versión.
              </p>
            ) : (
              imageFiles.map(file => (
                <div key={file.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {file.tipo === 'portada' ? (
                        <Image className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Camera className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-xs font-medium capitalize">
                        {file.tipo === 'portada' ? 'Portada' : 'Captura'}
                      </span>
                      <span className="text-xs text-muted-foreground">{file.nombre_archivo}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {urlCache[file.id] && (
                        <a href={urlCache[file.id]} download={file.nombre_archivo} target="_blank" rel="noreferrer">
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        </a>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => setDeleteConfirm(file)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {loadingUrl[file.id] ? (
                    <div className="flex items-center justify-center h-32 rounded-lg border border-border/50 bg-muted/20">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : urlCache[file.id] ? (
                    <img
                      src={urlCache[file.id]}
                      alt={file.nombre_archivo}
                      className="w-full rounded-lg border border-border/50 object-cover max-h-64"
                    />
                  ) : null}
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Permanent delete confirm — must type "eliminar" */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => { setDeleteConfirm(null); setDeleteInput('') }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar archivo permanentemente</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span>Esta acción no se puede deshacer. El archivo se eliminará del almacenamiento.</span>
              <span className="block mt-2">
                Escribe <strong>eliminar</strong> para confirmar:
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            className="mt-2"
            placeholder="eliminar"
            value={deleteInput}
            onChange={e => setDeleteInput(e.target.value)}
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteInput('')}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteInput !== 'eliminar'}
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// ─── Upload zone ──────────────────────────────────────────────────────────────

function UploadZone({ versionId, projectId, fileType, existingFile, onUploaded, onDelete }) {
  const [progress, setProgress]   = useState(0)
  const [uploading, setUploading] = useState(false)
  const [validating, setValidating] = useState(false)
  const inputRef = useRef()

  const isWebGL   = fileType === 'juego_webgl'
  const isImage   = fileType === 'portada' || fileType === 'captura'

  const cfg = {
    juego_webgl: { label: 'Juego WebGL', icon: FileArchive, accept: '.zip', desc: 'Archivo .zip con /Build, /TemplateData, index.html' },
    portada:     { label: 'Portada',     icon: Image,       accept: 'image/*', desc: 'Imagen de presentación (PNG, JPG)' },
    captura:     { label: 'Captura',     icon: Camera,      accept: 'image/*', desc: 'Captura de pantalla del juego' },
  }[fileType]

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (isWebGL) {
      setValidating(true)
      try {
        const { valid, errors } = await validateWebGLZip(file)
        if (!valid) {
          toast.error('Estructura del .zip inválida', {
            description: errors.join(' · '),
            duration: 6000,
          })
          e.target.value = ''
          return
        }
        toast.success('Estructura WebGL válida', { description: 'Subiendo archivos...' })
      } catch {
        toast.error('No se pudo validar el archivo .zip')
        e.target.value = ''
        return
      } finally { setValidating(false) }
    }

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

  const busy = uploading || validating

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs">{cfg.label}</Label>
        {existingFile && isImage && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs gap-1 text-destructive hover:text-destructive"
            onClick={() => onDelete(existingFile)}
          >
            <Trash2 className="h-3 w-3" />
            Eliminar
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">{cfg.desc}</p>

      {/* Existing file indicator */}
      {existingFile && (
        <div className="flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2">
          <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <span className="text-xs text-emerald-400 truncate">{existingFile.nombre_archivo}</span>
          {isWebGL && (
            <Badge variant="outline" className="ml-auto text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
              Listo para jugar
            </Badge>
          )}
        </div>
      )}

      {/* Upload zone — always show for WebGL (replace), only if no file for images */}
      {(isWebGL || !existingFile) && (
        <label className={`flex items-center gap-3 rounded-lg border border-dashed border-border/60 px-4 py-3 cursor-pointer hover:border-border hover:bg-accent/20 transition-all ${busy ? 'opacity-60 pointer-events-none' : ''}`}>
          <cfg.icon className="h-5 w-5 text-muted-foreground shrink-0" />
          <div className="flex-1 min-w-0">
            {validating ? (
              <p className="text-xs text-muted-foreground">Validando estructura WebGL...</p>
            ) : uploading ? (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Subiendo... {progress}%</p>
                <Progress value={progress} className="h-1.5" />
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                {existingFile && isWebGL ? 'Click para reemplazar' : 'Click para seleccionar'} — {cfg.accept}
              </p>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={cfg.accept}
            className="hidden"
            onChange={handleFile}
            disabled={busy}
          />
        </label>
      )}
    </div>
  )
}

// ─── Version card ─────────────────────────────────────────────────────────────

function VersionCard({ version, projectId, onActivated, onUploaded }) {
  const [activating, setActivating]   = useState(false)
  const [expanded, setExpanded]       = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [deleteFile, setDeleteFile]   = useState(null)
  const [deleteInput, setDeleteInput] = useState('')

  const handleActivate = async () => {
    setActivating(true)
    try {
      await studentService.activateVersion(projectId, version.id)
      toast.success(`Versión ${version.numero_version} activada`)
      onActivated()
    } catch { toast.error('Error al activar versión') }
    finally { setActivating(false) }
  }

  const handlePermanentDelete = async () => {
    if (deleteInput !== 'eliminar') return
    try {
      await api.delete(`/projects/${projectId}/versions/${version.id}/files/${deleteFile.id}`)
      toast.success('Archivo eliminado permanentemente')
      onUploaded()
    } catch { toast.error('Error al eliminar') }
    finally { setDeleteFile(null); setDeleteInput('') }
  }

  const filesByType = (version.archivos ?? []).reduce((acc, f) => {
    if (!acc[f.tipo]) acc[f.tipo] = []
    acc[f.tipo].push(f)
    return acc
  }, {})

  const webglFile   = filesByType['juego_webgl']?.[0]
  const portadaFile = filesByType['portada']?.[0]
  const capturas    = filesByType['captura'] ?? []
  const imageFiles  = [...(portadaFile ? [portadaFile] : []), ...capturas]

  const FILE_TYPE_ICONS = {
    juego_webgl: { icon: FileArchive, label: 'WebGL' },
    portada:     { icon: Image,       label: 'Portada' },
    captura:     { icon: Camera,      label: 'Captura' },
  }

  return (
    <>
      <Card className={`border-border/50 transition-colors ${version.es_activa ? 'bg-primary/5 border-primary/30' : 'bg-card/60'}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-mono">v{version.numero_version}</CardTitle>
              {version.es_activa && (
                <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/30 gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Activa
                </Badge>
              )}
              {version.numero_version.includes('beta') && (
                <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
                  Beta
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              {imageFiles.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => setPreviewOpen(true)}
                >
                  <Eye className="h-3 w-3" />
                  Ver archivos ({imageFiles.length})
                </Button>
              )}
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
                className="h-7 text-xs gap-1"
                onClick={() => setExpanded(v => !v)}
              >
                <Upload className="h-3 w-3" />
                {expanded ? 'Cerrar' : 'Subir archivos'}
              </Button>
            </div>
          </div>

          {version.notas_version && (
            <CardDescription className="text-xs mt-1">{version.notas_version}</CardDescription>
          )}

          <div className="flex items-center gap-3 mt-1">
            <p className="text-xs text-muted-foreground">
              {new Date(version.fecha_subida).toLocaleDateString('es-CO')}
            </p>
            {/* File badges */}
            <div className="flex gap-1.5">
              {Object.entries(FILE_TYPE_ICONS).map(([tipo, { icon: Icon, label }]) =>
                filesByType[tipo] ? (
                  <Badge key={tipo} variant="outline" className="text-xs gap-1 border-border/50 text-muted-foreground">
                    <Icon className="h-3 w-3" />
                    {label}
                  </Badge>
                ) : null
              )}
            </div>
          </div>
        </CardHeader>

        {/* Upload zone */}
        {expanded && (
          <CardContent className="space-y-4 border-t border-border/40 pt-4">
            <UploadZone
              versionId={version.id}
              projectId={projectId}
              fileType="juego_webgl"
              existingFile={webglFile}
              onUploaded={onUploaded}
              onDelete={setDeleteFile}
            />
            <UploadZone
              versionId={version.id}
              projectId={projectId}
              fileType="portada"
              existingFile={portadaFile}
              onUploaded={onUploaded}
              onDelete={setDeleteFile}
            />
            <UploadZone
              versionId={version.id}
              projectId={projectId}
              fileType="captura"
              existingFile={capturas[0]}
              onUploaded={onUploaded}
              onDelete={setDeleteFile}
            />
          </CardContent>
        )}
      </Card>

      {/* Preview modal */}
      <FilePreviewModal
        files={imageFiles}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onDelete={setDeleteFile}
        projectId={projectId}
        versionId={version.id}
      />

      {/* Permanent delete confirm */}
      <AlertDialog open={!!deleteFile} onOpenChange={() => { setDeleteFile(null); setDeleteInput('') }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar archivo permanentemente</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción elimina el archivo del almacenamiento y no se puede deshacer.
              Escribe <strong>eliminar</strong> para confirmar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            className="mt-2"
            placeholder="eliminar"
            value={deleteInput}
            onChange={e => setDeleteInput(e.target.value)}
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteInput('')}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteInput !== 'eliminar'}
              onClick={handlePermanentDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ProjectVersionsTab({ projectId }) {
  const [versions, setVersions] = useState([])
  const [loading, setLoading]   = useState(true)
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [bumpType, setBumpType] = useState('minor')
  const [isBeta, setIsBeta]     = useState(false)
  const [customVersion, setCustomVersion] = useState('')
  const [versionError, setVersionError]   = useState('')

  const { register, handleSubmit, reset } = useForm()

  const fetchVersions = useCallback(async () => {
    setLoading(true)
    try {
      const res = await studentService.getVersions(projectId)
      setVersions(res.data.data)
    } catch { toast.error('Error al cargar versiones') }
    finally { setLoading(false) }
  }, [projectId])

  useEffect(() => { fetchVersions() }, [fetchVersions])

  // Latest published version (first in list after ordering by date desc)
  const latestVersion = versions[0]?.numero_version

  // Auto-suggest version
  const suggested = suggestNext(latestVersion, bumpType)
  const previewVersion = isBeta && !suggested.includes('beta')
    ? suggested + '-beta'
    : suggested

  const validateAndSetVersion = (val) => {
    setCustomVersion(val)
    if (!val) { setVersionError(''); return }
    const parsed = parseVersion(val)
    if (!parsed) {
      setVersionError('Formato inválido. Usa MAJOR.MINOR.PATCH o MAJOR.MINOR.PATCH-beta')
      return
    }
    if (latestVersion && !isVersionGreater(val, latestVersion)) {
      setVersionError(`Debe ser mayor que la versión actual (${latestVersion})`)
      return
    }
    setVersionError('')
  }

  const onCreateVersion = async (data) => {
    const finalVersion = customVersion || previewVersion
    if (!finalVersion) return
    if (versionError) return

    // Final validation
    if (latestVersion && !isVersionGreater(finalVersion, latestVersion)) {
      setVersionError(`Debe ser mayor que la versión actual (${latestVersion})`)
      return
    }

    setCreating(true)
    try {
      await studentService.createVersion(projectId, {
        numero_version: finalVersion,
        notas_version:  data.notas_version || null,
      })
      toast.success(`Versión ${finalVersion} creada`)
      reset()
      setShowForm(false)
      setCustomVersion('')
      setBumpType('minor')
      setIsBeta(false)
      fetchVersions()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Error al crear versión')
    } finally { setCreating(false) }
  }

  return (
    <div className="space-y-4">

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Versiones del proyecto</p>
          <p className="text-xs text-muted-foreground">
            {latestVersion ? `Versión actual: v${latestVersion}` : 'Sin versiones aún'}
          </p>
        </div>
        <Button
          size="sm"
          variant={showForm ? 'outline' : 'default'}
          className="gap-2"
          onClick={() => { setShowForm(v => !v); setCustomVersion(''); setVersionError('') }}
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
            <CardDescription className="text-xs">
              Formato semántico: MAJOR.MINOR.PATCH[-beta]
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onCreateVersion)} className="space-y-4">

              {/* Bump type selector */}
              <div className="space-y-1.5">
                <Label className="text-xs">Tipo de incremento</Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'major', label: 'Major', desc: 'Cambio grande' },
                    { value: 'minor', label: 'Minor', desc: 'Nueva función' },
                    { value: 'patch', label: 'Patch', desc: 'Corrección' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => { setBumpType(opt.value); setCustomVersion(''); setVersionError('') }}
                      className={`rounded-lg border px-3 py-2 text-left text-xs transition-all ${
                        bumpType === opt.value && !customVersion
                          ? 'border-primary bg-primary/10 text-foreground'
                          : 'border-border/50 text-muted-foreground hover:border-border'
                      }`}
                    >
                      <p className="font-medium">{opt.label}</p>
                      <p className="text-muted-foreground">{opt.desc}</p>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => { setIsBeta(v => !v); setCustomVersion(''); setVersionError('') }}
                    className={`rounded-lg border px-3 py-2 text-left text-xs transition-all ${
                      isBeta
                        ? 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400'
                        : 'border-border/50 text-muted-foreground hover:border-border'
                    }`}
                  >
                    <p className="font-medium">Beta</p>
                    <p className={isBeta ? 'text-yellow-400/70' : 'text-muted-foreground'}>Marcar como beta</p>
                  </button>
                </div>
              </div>

              {/* Version preview / custom input */}
              <div className="space-y-1.5">
                <Label className="text-xs">
                  Número de versión
                  {!customVersion && (
                    <span className="ml-2 text-primary">Sugerido: {previewVersion}</span>
                  )}
                </Label>
                <Input
                  className="font-mono"
                  placeholder={previewVersion}
                  value={customVersion}
                  onChange={e => validateAndSetVersion(e.target.value)}
                />
                {versionError && <p className="text-xs text-destructive">{versionError}</p>}
                {!customVersion && !versionError && (
                  <p className="text-xs text-muted-foreground">
                    Deja vacío para usar la versión sugerida o escribe una personalizada.
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Notas de cambios</Label>
                <Input
                  placeholder="¿Qué cambió en esta versión?"
                  {...register('notas_version')}
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" size="sm" disabled={creating || !!versionError}>
                  {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Crear v{customVersion || previewVersion}
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
          <FolderOpen className="h-8 w-8 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            Crea la primera versión para subir tus archivos.
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