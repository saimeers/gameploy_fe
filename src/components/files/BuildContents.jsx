import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, File, Folder, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatBytes } from './fileFormat'

/** Agrupa las rutas por carpeta de primer nivel; los archivos sueltos van primero. */
function groupByFolder(files) {
  const groups = new Map([['', []]])
  for (const file of files) {
    const slash = file.path.indexOf('/')
    const folder = slash === -1 ? '' : file.path.slice(0, slash + 1)
    if (!groups.has(folder)) groups.set(folder, [])
    groups.get(folder).push({ ...file, name: slash === -1 ? file.path : file.path.slice(slash + 1) })
  }
  return [...groups].filter(([, items]) => items.length)
}

function Check({ ok, okText, badText, bad = 'error' }) {
  const Icon = ok ? CheckCircle2 : AlertTriangle
  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px]',
      ok
        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500'
        : bad === 'error'
          ? 'border-destructive/30 bg-destructive/10 text-destructive'
          : 'border-amber-500/30 bg-amber-500/10 text-amber-500',
    )}>
      <Icon className="h-3 w-3" /> {ok ? okText : badText}
    </span>
  )
}

/**
 * Contenido de un .zip de juego, leído por la API: carpetas, archivos con su
 * tamaño y las mismas comprobaciones que hace el formulario de subida.
 * @param {() => Promise<{ files: { path: string, size: number }[], totalBytes: number, compressed: boolean, pwa: boolean }>} load
 */
export default function BuildContents({ load }) {
  const [contents, setContents] = useState(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    load()
      .then(data => { if (!cancelled) setContents(data) })
      .catch(() => { if (!cancelled) setFailed(true) })
    return () => { cancelled = true }
  }, [load])

  if (failed) return <p className="text-xs text-destructive">No se pudo leer el contenido del .zip.</p>
  if (!contents) return (
    <p className="flex items-center gap-2 text-xs text-muted-foreground">
      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Abriendo el .zip…
    </p>
  )

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Check ok={!contents.compressed} okText="Sin compresión" badText="Comprimido: no cargará" />
        <Check ok={contents.pwa} okText="Plantilla PWA" badText="Sin plantilla PWA" bad="warning" />
        <span className="text-[11px] text-muted-foreground">
          {contents.files.length} archivos · {formatBytes(contents.totalBytes)} descomprimido
        </span>
      </div>

      <div className="max-h-64 overflow-y-auto rounded-md border border-border/50 bg-background/40 p-2 font-mono text-xs">
        {groupByFolder(contents.files).map(([folder, items]) => (
          <div key={folder || 'root'}>
            {folder && (
              <p className="flex items-center gap-1.5 px-1 pt-1.5 pb-0.5 text-foreground">
                <Folder className="h-3.5 w-3.5 text-amber-400" /> {folder}
              </p>
            )}
            {items.map(file => (
              <p
                key={file.path}
                className={cn('flex items-center gap-1.5 rounded px-1 py-0.5 hover:bg-muted/40', folder && 'pl-6')}
              >
                <File className="h-3 w-3 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate">{file.name}</span>
                <span className="shrink-0 tabular-nums text-muted-foreground">{formatBytes(file.size)}</span>
              </p>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
