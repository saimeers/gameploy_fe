import { useEffect, useState, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import {
  Trash2, Loader2, Check, X, Keyboard, Mouse, Gamepad2, Smartphone, Info, Pencil,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input }  from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import ControlDiagram  from '@/components/controls/ControlDiagram'
import ControlsViewer  from '@/components/controls/ControlsViewer'
import { indexByKey }  from '@/components/controls/controlHelpers'
import { INPUT_TYPES, INPUT_LABELS, KEYS_BY_TYPE } from '@/components/controls/inputCatalog'
import { studentService } from '../../services/student.service'
import { LIMITS } from '@/lib/limits'

const TYPE_ICONS = {
  teclado: Keyboard,
  mouse:   Mouse,
  mando:   Gamepad2,
  mobile:  Smartphone,
}

export default function ProjectControlsTab({ projectId }) {
  const [controls, setControls] = useState([])
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [toDelete, setToDelete] = useState(null)
  const [editing, setEditing]   = useState(false)

  const [selectedType, setSelectedType] = useState('teclado')
  const [selectedKey, setSelectedKey]   = useState(null)
  const [accion, setAccion]             = useState('')

  const accionRef = useRef(null)

  const fetchControls = useCallback(async () => {
    const res = await studentService.getControls(projectId)
    return res.data.data
  }, [projectId])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const data = await fetchControls()
        if (!cancelled) setControls(data)
      } catch {
        if (!cancelled) toast.error('Error al cargar controles')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [fetchControls])

  const refresh = async () => {
    try {
      setControls(await fetchControls())
    } catch {
      toast.error('Error al cargar controles')
    }
  }

  const byType = controls.filter(c => c.tipo_entrada === selectedType)
  const assignments = indexByKey(byType)
  const current = selectedKey ? assignments[selectedKey] : null

  // Controles guardados con una tecla que ya no existe en el catálogo
  const legacy = controls.filter(
    c => !KEYS_BY_TYPE[c.tipo_entrada]?.includes(c.tecla_boton)
  )

  const countByType = controls.reduce((acc, c) => {
    acc[c.tipo_entrada] = (acc[c.tipo_entrada] ?? 0) + 1
    return acc
  }, {})

  const cancelEdit = () => {
    setSelectedKey(null)
    setAccion('')
  }

  const selectType = (type) => {
    setSelectedType(type)
    cancelEdit()
  }

  const selectKey = (key) => {
    setSelectedKey(key)
    setAccion(assignments[key]?.descripcion_accion ?? '')
    requestAnimationFrame(() => accionRef.current?.focus())
  }

  const toggleEditing = () => {
    setEditing(prev => !prev)
    cancelEdit()
  }

  const handleSave = async () => {
    const descripcion = accion.trim()
    if (!selectedKey || !descripcion) return

    setSaving(true)
    try {
      if (current) {
        await studentService.updateControl(projectId, current.id, {
          descripcion_accion: descripcion,
        })
        toast.success('Control actualizado')
      } else {
        await studentService.createControl(projectId, {
          tipo_entrada:       selectedType,
          tecla_boton:        selectedKey,
          descripcion_accion: descripcion,
        })
        toast.success(`${selectedKey} asignado`)
      }
      await refresh()
      cancelEdit()
    } catch {
      toast.error('No se pudo guardar el control')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      await studentService.deleteControl(projectId, toDelete.id)
      toast.success('Control eliminado')
      if (toDelete.tecla_boton === selectedKey) cancelEdit()
      await refresh()
    } catch {
      toast.error('Error al eliminar')
    } finally {
      setToDelete(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">

      <Card className="border-border/50 bg-card/60">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="text-sm">Controles del juego</CardTitle>
              <CardDescription className="text-xs">
                {editing
                  ? 'Haz clic en una tecla o botón del diagrama y describe qué hace en tu juego.'
                  : 'Así verán los controles quienes jueguen tu proyecto.'}
              </CardDescription>
            </div>
            <Button
              variant={editing ? 'default' : 'outline'}
              size="sm"
              className="shrink-0 gap-2"
              onClick={toggleEditing}
            >
              {editing ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
              {editing ? 'Listo' : 'Editar controles'}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {editing ? (
            <>
              {/* Selector de tipo de entrada */}
              <div className="flex flex-wrap gap-2">
                {INPUT_TYPES.map(({ value, label }) => {
                  const Icon = TYPE_ICONS[value]
                  const active = value === selectedType
                  const count = countByType[value] ?? 0
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => selectType(value)}
                      className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        active
                          ? 'border-primary/50 bg-primary/10 text-primary'
                          : 'border-border/50 text-muted-foreground hover:border-border hover:text-foreground'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                      {count > 0 && (
                        <span className={`rounded-full px-1.5 text-[10px] ${
                          active ? 'bg-primary/20' : 'bg-muted'
                        }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Diagrama editable */}
              <div className="rounded-lg border border-border/40 bg-background/30 p-3">
                <ControlDiagram
                  type={selectedType}
                  assignments={assignments}
                  selectedKey={selectedKey}
                  onSelect={selectKey}
                />
              </div>

              {/* Panel de asignación */}
              {selectedKey ? (
                <div className="space-y-2 rounded-lg border border-primary/40 bg-primary/5 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">
                      {current ? 'Editando' : 'Asignando'}{' '}
                      <kbd className="rounded border border-border/60 bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
                        {selectedKey}
                      </kbd>
                    </p>
                    {current && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1.5 text-destructive hover:text-destructive"
                        onClick={() => setToDelete(current)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Quitar
                      </Button>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      ref={accionRef}
                      className="h-9 flex-1"
                      placeholder="Ej: Mover al personaje hacia arriba"
                      maxLength={LIMITS.accionControl}
                      value={accion}
                      onChange={e => setAccion(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleSave()
                        if (e.key === 'Escape') cancelEdit()
                      }}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="h-9 gap-1.5"
                        disabled={saving || !accion.trim()}
                        onClick={handleSave}
                      >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        Guardar
                      </Button>
                      <Button variant="outline" size="sm" className="h-9 gap-1.5" onClick={cancelEdit}>
                        <X className="h-4 w-4" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Info className="h-3.5 w-3.5 shrink-0" />
                  Selecciona una entrada del diagrama para asignarle una acción.
                </p>
              )}
            </>
          ) : controls.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <Gamepad2 className="h-8 w-8 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                Este proyecto aún no tiene controles.
              </p>
              <Button variant="outline" size="sm" className="gap-2" onClick={toggleEditing}>
                <Pencil className="h-4 w-4" />
                Configurarlos
              </Button>
            </div>
          ) : (
            <ControlsViewer controls={controls} />
          )}
        </CardContent>
      </Card>

      {/* Controles con teclas fuera del catálogo actual */}
      {editing && legacy.length > 0 && (
        <Card className="border-border/50 bg-card/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Otras entradas
            </CardTitle>
            <CardDescription className="text-xs">
              Guardadas con una tecla que ya no aparece en los diagramas. Puedes eliminarlas
              y volver a asignarlas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {legacy.map(control => (
              <div
                key={control.id}
                className="group flex items-center justify-between rounded-md border border-border/40 bg-background/40 px-3 py-2"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <kbd className="shrink-0 rounded border border-border/50 bg-accent/60 px-2 py-0.5 font-mono text-xs">
                    {control.tecla_boton}
                  </kbd>
                  <span className="truncate text-sm text-muted-foreground">
                    {control.descripcion_accion}
                  </span>
                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    {INPUT_LABELS[control.tipo_entrada] ?? control.tipo_entrada}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => setToDelete(control)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <AlertDialog open={!!toDelete} onOpenChange={() => setToDelete(null)}>
        <AlertDialogContent className="bg-background text-popover-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar control</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Eliminar <strong>{toDelete?.tecla_boton}</strong> — {toDelete?.descripcion_accion}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
