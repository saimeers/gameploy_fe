import { useEffect, useState } from 'react'
import { Calendar, Download, Eye, HardDrive, ImageOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import GamePlayer from '@/components/game/GamePlayer'
import { formatBytes, formatDateTime } from './fileFormat'

/** Nombre, tamaño y fecha de subida de un archivo, en una línea. */
export function FileMeta({ archivo, className = '' }) {
  return (
    <p className={`flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground ${className}`}>
      <span className="flex items-center gap-1"><HardDrive className="h-3 w-3" /> {formatBytes(archivo.tamanio_bytes)}</span>
      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Subido el {formatDateTime(archivo.fecha_subida)}</span>
    </p>
  )
}

/**
 * Miniatura de una imagen del bucket. Pide su URL firmada al montarse y abre
 * la vista ampliada al hacer clic.
 * @param {(archivo) => Promise<string>} getUrl
 */
export function ImageThumb({ archivo, getUrl, label, aspect = 'aspect-video', actions }) {
  const [url, setUrl] = useState(null)
  const [failed, setFailed] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    getUrl(archivo)
      .then(u => { if (!cancelled) setUrl(u) })
      .catch(() => { if (!cancelled) setFailed(true) })
    return () => { cancelled = true }
  }, [archivo, getUrl])

  return (
    <figure className="group relative overflow-hidden rounded-lg border border-border/50 bg-muted/20">
      <button
        type="button"
        onClick={() => url && setOpen(true)}
        disabled={!url}
        aria-label={`Ver ${label ?? archivo.nombre_archivo}`}
        className={`relative block w-full ${aspect}`}
      >
        {url ? (
          <img
            src={url}
            alt={archivo.nombre_archivo}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            {failed ? <ImageOff className="h-5 w-5" /> : <Loader2 className="h-4 w-4 animate-spin" />}
          </span>
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
          <Eye className="h-5 w-5 text-white opacity-0 transition-opacity group-hover:opacity-100" />
        </span>
      </button>

      <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2.5 pt-6 pb-2 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        <p className="truncate text-xs font-medium">{archivo.nombre_archivo}</p>
        <p className="text-[10px] text-white/70">{formatBytes(archivo.tamanio_bytes)} · {formatDateTime(archivo.fecha_subida)}</p>
      </figcaption>

      {actions && (
        <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          {actions}
        </div>
      )}

      <ImageLightbox archivo={archivo} url={url} open={open} onOpenChange={setOpen} label={label} />
    </figure>
  )
}

/** Imagen ampliada con sus datos y un enlace para descargarla. */
export function ImageLightbox({ archivo, url, open, onOpenChange, label }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-3 bg-background p-3 text-popover-foreground sm:max-w-5xl">
        <DialogTitle className="sr-only">{label ?? archivo.nombre_archivo}</DialogTitle>
        <DialogDescription className="sr-only">Vista ampliada de la imagen</DialogDescription>
        {url && (
          <img src={url} alt={archivo.nombre_archivo} className="max-h-[75vh] w-full rounded-md bg-black/40 object-contain" />
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 px-1 pr-12">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {label && <span className="text-muted-foreground">{label} · </span>}
              {archivo.nombre_archivo}
            </p>
            <FileMeta archivo={archivo} />
          </div>
          {url && (
            <Button variant="outline" size="sm" asChild>
              <a href={url} target="_blank" rel="noopener noreferrer" download={archivo.nombre_archivo}>
                <Download /> Descargar
              </a>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

/** Diálogo para jugar el build de una versión concreta, publicada o no. */
export function BuildPreviewDialog({ open, onOpenChange, src, title, version }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-3 bg-background p-3 text-popover-foreground sm:max-w-5xl">
        <div className="px-1 pr-12">
          <DialogTitle className="text-sm">Probar v{version}</DialogTitle>
          <DialogDescription className="text-xs">
            Así se verá el juego en su ficha pública cuando esta versión esté activa.
          </DialogDescription>
        </div>
        {open && <GamePlayer src={src} title={title} version={version} />}
      </DialogContent>
    </Dialog>
  )
}
