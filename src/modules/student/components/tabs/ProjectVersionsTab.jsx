import { useEffect, useState, useCallback, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import {
  Plus, CheckCircle, Upload, FileArchive, Image, Camera,
  Loader2, FolderOpen, Trash2, Eye, Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Dialog, DialogContent,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { studentService } from '../../services/student.service'
import { LIMITS }         from '@/lib/limits'

/** Etiqueta e icono de cada tipo de archivo en la lista de herencia. */
const INHERIT_FILE_CFG = {
  juego_webgl: { label: 'Juego WebGL', icon: FileArchive },
  portada:     { label: 'Portada',     icon: Image },
  captura:     { label: 'Captura',     icon: Camera },
}

// ─── Semantic version helpers ─────────────────────────────────────────────────

function parseVersion(str) {
  // Format: MAJOR.MINOR.PATCH[-beta]
  const match = str?.match(/^(\d+)\.(\d+)\.(\d+)(-beta)?$/)
  if (!match) return null
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    beta: !!match[4],
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
  if (type === 'beta') return formatVersion({ ...v, beta: true })
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
// ─── Upload zone ──────────────────────────────────────────────────────────────

function UploadZone({ versionId, projectId, fileType, existingFiles = [], onFileAdded, onFileDeleted }) {
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [validating, setValidating] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [selectedPreview, setSelectedPreview] = useState(null)
  const [previews, setPreviews] = useState({})
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleteInput, setDeleteInput] = useState('')
  const inputRef = useRef()

  const isWebGL = fileType === 'juego_webgl'
  const isPortada = fileType === 'portada'
  const isCaptura = fileType === 'captura'

  const cfg = {
    juego_webgl: { label: 'Juego WebGL', icon: FileArchive, accept: '.zip', desc: 'Archivo .zip con /Build, /TemplateData, index.html' },
    portada: { label: 'Portada', icon: Image, accept: 'image/*', desc: 'Una imagen de presentación (PNG, JPG)' },
    captura: { label: 'Capturas', icon: Camera, accept: 'image/*', desc: 'Capturas de pantalla — puedes subir múltiples' },
  }[fileType]

  // Load presigned URLs for existing image files
  useEffect(() => {
    existingFiles.forEach(async (file) => {
      if (previews[file.id]) return
      try {
        const res = await studentService.getFileUrl(file.ruta_storage)
        setPreviews(prev => ({ ...prev, [file.id]: res.data.data.url }))
      } catch { /* sin previsualización si la URL falla */ }
    })
  }, [existingFiles])

  const handleFile = async (e) => {
    const files = isCaptura ? Array.from(e.target.files) : [e.target.files?.[0]]
    const validFiles = files.filter(Boolean)
    if (!validFiles.length) return

    for (const file of validFiles) {
      if (isWebGL) {
        setValidating(true)
        try {
          const JSZip = (await import('jszip')).default
          const zip = await JSZip.loadAsync(file)
          const paths = Object.keys(zip.files)
          const errors = []
          if (!paths.some(p => p === 'index.html' || p.endsWith('/index.html'))) errors.push('Falta index.html')
          if (!paths.some(p => p.includes('Build/'))) errors.push('Falta carpeta /Build')
          if (!paths.some(p => p.includes('TemplateData/'))) errors.push('Falta carpeta /TemplateData')
          const buildFiles = paths.filter(p => p.includes('Build/'))
          if (!buildFiles.some(p => p.endsWith('.loader.js'))) errors.push('Falta .loader.js')
          if (!buildFiles.some(p => p.endsWith('.framework.js'))) errors.push('Falta .framework.js')
          if (!buildFiles.some(p => p.endsWith('.data') || p.endsWith('.data.gz'))) errors.push('Falta .data')
          if (!buildFiles.some(p => p.endsWith('.wasm') || p.endsWith('.wasm.gz'))) errors.push('Falta .wasm')
          if (errors.length) {
            toast.error('Estructura WebGL inválida', { description: errors.join(' · '), duration: 6000 })
            e.target.value = ''
            setValidating(false)
            return
          }
          toast.success('Estructura WebGL válida ✓')
        } catch {
          toast.error('No se pudo validar el archivo')
          e.target.value = ''
          setValidating(false)
          return
        }
        setValidating(false)
      }

      setUploading(true)
      setProgress(0)
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('fileType', fileType)
        const res = await studentService.uploadFile(projectId, versionId, formData, setProgress)
        // Create local preview for images without reloading
        if (isPortada || isCaptura) {
          const localUrl = URL.createObjectURL(file)
          setPreviews(prev => ({ ...prev, [res.data.data.id]: localUrl }))
        }
        onFileAdded(res.data.data)
        toast.success(`${isCaptura ? 'Captura' : cfg.label} subida`)
      } catch (err) {
        toast.error(err.response?.data?.message ?? 'Error al subir')
      } finally {
        setUploading(false)
        setProgress(0)
      }
    }
    e.target.value = ''
  }

  const confirmDelete = async () => {
    if (deleteInput !== 'eliminar') return
    try {
      await studentService.deleteFile(projectId, versionId, deleteConfirm.id)
      onFileDeleted(deleteConfirm.id)
      // Revoke object URL if it was local
      if (previews[deleteConfirm.id]?.startsWith('blob:')) {
        URL.revokeObjectURL(previews[deleteConfirm.id])
      }
      setPreviews(prev => { const n = { ...prev }; delete n[deleteConfirm.id]; return n })
      toast.success('Archivo eliminado')
    } catch { toast.error('Error al eliminar') }
    finally { setDeleteConfirm(null); setDeleteInput('') }
  }

  const busy = uploading || validating
  const canAddMore = isCaptura || existingFiles.length === 0 || isWebGL

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium">{cfg.label}</Label>
        {(isPortada || isCaptura) && existingFiles.length > 0 && (
          <span className="text-xs text-muted-foreground">{existingFiles.length} archivo{existingFiles.length !== 1 ? 's' : ''}</span>
        )}
      </div>
      <p className="text-xs text-muted-foreground">{cfg.desc}</p>

      {/* Existing files — image previews */}
      {(isPortada || isCaptura) && existingFiles.length > 0 && (
        <div className={`grid gap-2 ${isCaptura ? 'grid-cols-3' : 'grid-cols-1'}`}>
          {existingFiles.map(file => (
            <div key={file.id} className="relative group rounded-lg overflow-hidden border border-border/50 bg-muted/20">
              {previews[file.id] ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPreview(previews[file.id])
                    setPreviewOpen(true)
                  }}
                  className="relative w-full h-full group"
                >
                  <img
                    src={previews[file.id]}
                    alt={file.nombre_archivo}
                    className={` w-full object-cover transition-transform duration-300 group-hover:scale-105 ${isPortada ? 'h-40' : 'h-24'} `}
                  />

                  {/* Overlay */}
                  <div className=" absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center ">
                    <Eye className=" h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity " />
                  </div>
                </button>
              ) : (
                <div className={`flex items-center justify-center bg-muted/30 ${isPortada ? 'h-40' : 'h-24'}`}>
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
              <button
                type="button"
                onClick={() => setDeleteConfirm(file)}
                className="absolute top-1.5 right-1.5 rounded-md bg-background/80 p-1 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
              >
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </button>
              {file.nombre_archivo && (
                <div className="absolute bottom-0 left-0 right-0 bg-background/70 backdrop-blur-sm px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-xs truncate text-foreground">{file.nombre_archivo}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* WebGL existing indicator */}
      {isWebGL && existingFiles[0] && (
        <div className="flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2">
          <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <span className="text-xs text-emerald-400 truncate">{existingFiles[0].nombre_archivo}</span>
          <Badge variant="outline" className="ml-auto text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shrink-0">
            Listo
          </Badge>
        </div>
      )}

      {/* Upload trigger */}
      {canAddMore && (
        <label className={`flex items-center gap-3 rounded-lg border border-dashed border-border/60 px-4 py-3 cursor-pointer hover:border-primary/50 hover:bg-accent/20 transition-all ${busy ? 'opacity-60 pointer-events-none' : ''}`}>
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
                {existingFiles.length > 0 && isWebGL ? 'Click para reemplazar' : isCaptura ? 'Click para agregar captura' : 'Click para seleccionar'}
                {' '}— {cfg.accept}
              </p>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={cfg.accept}
            multiple={isCaptura}
            className="hidden"
            onChange={handleFile}
            disabled={busy}
          />
        </label>
      )}

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-5xl p-2 bg-background/95 border-border/50">
          {selectedPreview && (
            <img
              src={selectedPreview}
              alt="Vista previa"
              className="w-full max-h-[85vh] object-contain rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => { setDeleteConfirm(null); setDeleteInput('') }}>
        <AlertDialogContent className="bg-background text-popover-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar archivo permanentemente</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Escribe <strong>eliminar</strong> para confirmar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            className="mt-2"
            placeholder="eliminar"
            maxLength={LIMITS.confirmacion}
            value={deleteInput}
            onChange={e => setDeleteInput(e.target.value)}
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteInput('')}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteInput !== 'eliminar'}
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ─── Version card ─────────────────────────────────────────────────────────────

function VersionCard({ version: initialVersion, projectId, onActivated }) {
  // La tarjeta lleva su propia copia para reflejar altas y bajas de archivos sin
  // esperar a que el padre recargue; cuando el padre trae datos nuevos, se
  // descarta la copia local (patrón de ajuste de estado al cambiar una prop).
  const [version, setVersion] = useState(initialVersion)
  const [syncedFrom, setSyncedFrom] = useState(initialVersion)
  const [activating, setActivating] = useState(false)
  const [expanded, setExpanded] = useState(false)

  if (initialVersion !== syncedFrom) {
    setSyncedFrom(initialVersion)
    setVersion(initialVersion)
  }

  const handleFileAdded = (newFile) => {
    setVersion(prev => {
      const archivos = prev.archivos ?? []
      if (newFile.tipo === 'portada' || newFile.tipo === 'juego_webgl') {
        return {
          ...prev,
          archivos: [...archivos.filter(a => a.tipo !== newFile.tipo), newFile],
        }
      }
      return { ...prev, archivos: [...archivos, newFile] }
    })
  }

  const handleFileDeleted = (fileId) => {
    setVersion(prev => ({
      ...prev,
      archivos: (prev.archivos ?? []).filter(a => a.id !== fileId),
    }))
  }


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
    if (!acc[f.tipo]) acc[f.tipo] = []
    acc[f.tipo].push(f)
    return acc
  }, {})

  const webglFiles = filesByType['juego_webgl'] ?? []
  const portadaFiles = filesByType['portada'] ?? []
  const capturaFiles = filesByType['captura'] ?? []

  const FILE_BADGES = [
    { tipo: 'juego_webgl', icon: FileArchive, label: 'WebGL', files: webglFiles },
    { tipo: 'portada', icon: Image, label: 'Portada', files: portadaFiles },
    { tipo: 'captura', icon: Camera, label: `${capturaFiles.length} captura${capturaFiles.length !== 1 ? 's' : ''}`, files: capturaFiles },
  ]

  return (
    <Card className={`border-border/50 transition-colors ${version.es_activa ? 'bg-primary/5 border-primary/30' : 'bg-card/60'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
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
            {!version.es_activa && (
              <Button variant="outline" size="sm" className="h-7 text-xs" disabled={activating} onClick={handleActivate}>
                {activating ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3 mr-1" />}
                Activar
              </Button>
            )}
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => setExpanded(v => !v)}>
              <Upload className="h-3 w-3" />
              {expanded ? 'Cerrar archivos' : 'Gestionar archivos'}
            </Button>
          </div>
        </div>

        {version.notas_version && (
          <CardDescription className="text-xs mt-1">{version.notas_version}</CardDescription>
        )}

        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <p className="text-xs text-muted-foreground">
            {new Date(version.fecha_subida).toLocaleDateString('es-CO')}
          </p>
          <div className="flex gap-1.5 flex-wrap">
            {FILE_BADGES.filter(b => b.files.length > 0).map(b => (
              <Badge key={b.tipo} variant="outline" className="text-xs gap-1 border-border/50 text-muted-foreground">
                <b.icon className="h-3 w-3" />
                {b.label}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-5 border-t border-border/40 pt-4">
          <UploadZone
            versionId={version.id}
            projectId={projectId}
            fileType="juego_webgl"
            existingFiles={webglFiles}
            onFileAdded={handleFileAdded}
            onFileDeleted={handleFileDeleted}
          />
          <UploadZone
            versionId={version.id}
            projectId={projectId}
            fileType="portada"
            existingFiles={portadaFiles}
            onFileAdded={handleFileAdded}
            onFileDeleted={handleFileDeleted}
          />
          <UploadZone
            versionId={version.id}
            projectId={projectId}
            fileType="captura"
            existingFiles={capturaFiles}
            onFileAdded={handleFileAdded}
            onFileDeleted={handleFileDeleted}
          />
        </CardContent>
      )}
    </Card>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ProjectVersionsTab({ projectId }) {
  const [versions, setVersions] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [bumpType, setBumpType] = useState('minor')
  const [isBeta, setIsBeta] = useState(false)
  const [customVersion, setCustomVersion] = useState('')
  const [versionError, setVersionError] = useState('')
  // Ids de los archivos de la versión activa que la nueva versión conservará
  const [keepFiles, setKeepFiles] = useState([])

  const { register, handleSubmit, reset } = useForm()

  const loadVersions = useCallback(
    () => studentService.getVersions(projectId).then(res => res.data.data),
    [projectId]
  )

  useEffect(() => {
    let cancelled = false
    loadVersions()
      .then(data => { if (!cancelled) setVersions(data) })
      .catch(() => { if (!cancelled) toast.error('Error al cargar versiones') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [loadVersions])

  const refreshVersions = async () => {
    try {
      setVersions(await loadVersions())
    } catch {
      toast.error('Error al cargar versiones')
    }
  }

  // Latest published version (first in list after ordering by date desc)
  const latestVersion = versions[0]?.numero_version

  // Archivos que la nueva versión puede heredar de la activa
  const inheritable = versions.find(v => v.es_activa)?.archivos ?? []

  const toggleForm = () => {
    setShowForm(open => {
      if (!open) setKeepFiles(inheritable.map(a => a.id))
      return !open
    })
    setCustomVersion('')
    setVersionError('')
  }

  const toggleKeepFile = (fileId) => {
    setKeepFiles(prev =>
      prev.includes(fileId) ? prev.filter(id => id !== fileId) : [...prev, fileId]
    )
  }

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
        notas_version: data.notas_version || null,
        heredar: keepFiles,
      })
      toast.success(`Versión ${finalVersion} creada`)
      reset()
      setShowForm(false)
      setCustomVersion('')
      setBumpType('minor')
      setIsBeta(false)
      refreshVersions()
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
          onClick={toggleForm}
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
                      className={`rounded-lg border px-3 py-2 text-left text-xs transition-all ${bumpType === opt.value && !customVersion
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
                    className={`rounded-lg border px-3 py-2 text-left text-xs transition-all ${isBeta
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
                  maxLength={LIMITS.numeroVersion}
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
                  maxLength={LIMITS.notasVersion}
                  {...register('notas_version')}
                />
              </div>

              {/* Archivos que se conservan de la versión activa */}
              {inheritable.length > 0 && (
                <div className="space-y-1.5">
                  <Label className="text-xs">Archivos que conservas</Label>
                  <p className="text-xs text-muted-foreground">
                    Desmarca los que vayas a reemplazar: esos tendrás que subirlos de nuevo
                    en la versión nueva. Los marcados se mantienen sin volver a subirlos.
                  </p>
                  <div className="space-y-1.5 pt-1">
                    {inheritable.map(archivo => {
                      const cfg = INHERIT_FILE_CFG[archivo.tipo] ?? { label: archivo.tipo, icon: FileArchive }
                      const Icon = cfg.icon
                      const keep = keepFiles.includes(archivo.id)
                      return (
                        <button
                          key={archivo.id}
                          type="button"
                          onClick={() => toggleKeepFile(archivo.id)}
                          className={`flex w-full items-center gap-3 rounded-md border px-3 py-2 text-left transition-colors ${
                            keep
                              ? 'border-primary/50 bg-primary/10'
                              : 'border-border/40 bg-background/40 opacity-60'
                          }`}
                        >
                          <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                            keep ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
                          }`}>
                            {keep && <Check className="h-3 w-3" />}
                          </span>
                          <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-xs">{archivo.nombre_archivo}</span>
                            <span className="block text-[10px] text-muted-foreground">
                              {cfg.label} · {keep ? 'se conserva' : 'lo subirás de nuevo'}
                            </span>
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

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
              onActivated={refreshVersions}
              onUploaded={refreshVersions}
            />
          ))}
        </div>
      )}
    </div>
  )
}