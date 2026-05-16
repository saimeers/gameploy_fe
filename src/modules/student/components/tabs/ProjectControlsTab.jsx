import { useEffect, useState, useCallback } from 'react'
import { useForm }    from 'react-hook-form'
import { toast }      from 'sonner'
import { Plus, Trash2, Loader2, Gamepad2 } from 'lucide-react'
import { Button }     from '@/components/ui/button'
import { Label }      from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { studentService } from '../../services/student.service'

// Predefined keys/buttons per input type
const KEYS_BY_TYPE = {
  teclado: [
    'W','A','S','D',
    '↑','↓','←','→',
    'Espacio','Enter','Shift','Ctrl','Alt','Esc','Tab',
    'Q','E','R','F','G','H','I','J','K','L','M',
    '1','2','3','4','5','6','7','8','9','0',
    'F1','F2','F3','F4','F5',
    'Backspace','Delete','Inicio','Fin','Re Pág','Av Pág',
  ],
  mouse: [
    'Click izquierdo','Click derecho','Click central',
    'Doble click','Scroll arriba','Scroll abajo',
    'Mover mouse','Arrastrar',
  ],
  mando: [
    'Botón A','Botón B','Botón X','Botón Y',
    'LB','RB','LT','RT',
    'Start','Select','L3','R3',
    'D-pad ↑','D-pad ↓','D-pad ←','D-pad →',
    'Joystick izq.','Joystick der.',
  ],
  mobile: [
    'Tap','Doble tap','Hold (mantener)',
    'Swipe ↑','Swipe ↓','Swipe ←','Swipe →',
    'Pinch (acercar)','Spread (alejar)',
    'Rotar','Sacudir',
    'Botón virtual ↑','Botón virtual ↓','Botón virtual ←','Botón virtual →',
    'Joystick virtual',
  ],
}

const INPUT_TYPES = [
  { value: 'teclado', label: '⌨️ Teclado' },
  { value: 'mouse',   label: '🖱️ Mouse' },
  { value: 'mando',   label: '🎮 Mando' },
  { value: 'mobile',  label: '📱 Mobile' },
]

const INPUT_LABELS = {
  teclado: '⌨️ Teclado',
  mouse:   '🖱️ Mouse',
  mando:   '🎮 Mando',
  mobile:  '📱 Mobile',
}

export default function ProjectControlsTab({ projectId }) {
  const [controls, setControls]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [toDelete, setToDelete]     = useState(null)
  const [selectedType, setSelectedType] = useState('teclado')
  const [selectedKey, setSelectedKey]   = useState('')
  const [accion, setAccion]             = useState('')

  const fetchControls = useCallback(async () => {
    setLoading(true)
    try {
      const res = await studentService.getControls(projectId)
      setControls(res.data.data)
    } catch { toast.error('Error al cargar controles') }
    finally { setLoading(false) }
  }, [projectId])

  useEffect(() => { fetchControls() }, [fetchControls])

  // Reset key when type changes
  const handleTypeChange = (val) => {
    setSelectedType(val)
    setSelectedKey('')
  }

  const handleAdd = async () => {
    if (!selectedKey || !accion.trim()) {
      toast.error('Selecciona una tecla y describe la acción')
      return
    }
    setSaving(true)
    try {
      await studentService.createControl(projectId, {
        tipo_entrada:       selectedType,
        tecla_boton:        selectedKey,
        descripcion_accion: accion.trim(),
      })
      toast.success('Control agregado')
      setSelectedKey('')
      setAccion('')
      fetchControls()
    } catch { toast.error('Error al agregar control') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try {
      await studentService.deleteControl(projectId, toDelete.id)
      toast.success('Control eliminado')
      fetchControls()
    } catch { toast.error('Error al eliminar') }
    finally { setToDelete(null) }
  }

  // Check if a key is already used for the current type
  const usedKeys = controls
    .filter(c => c.tipo_entrada === selectedType)
    .map(c => c.tecla_boton)

  const grouped = controls.reduce((acc, c) => {
    if (!acc[c.tipo_entrada]) acc[c.tipo_entrada] = []
    acc[c.tipo_entrada].push(c)
    return acc
  }, {})

  return (
    <div className="space-y-4">

      {/* Add control */}
      <Card className="border-border/50 bg-card/60">
        <CardHeader>
          <CardTitle className="text-sm">Agregar control</CardTitle>
          <CardDescription className="text-xs">
            Selecciona el tipo de entrada, la tecla/botón y describe su función.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid sm:grid-cols-3 gap-3">

            {/* Input type */}
            <div className="space-y-1.5">
              <Label className="text-xs">Tipo de entrada</Label>
              <Select value={selectedType} onValueChange={handleTypeChange}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INPUT_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Key selector */}
            <div className="space-y-1.5">
              <Label className="text-xs">Tecla / Botón</Label>
              <Select value={selectedKey} onValueChange={setSelectedKey}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Selecciona..." />
                </SelectTrigger>
                <SelectContent>
                  {KEYS_BY_TYPE[selectedType].map(key => (
                    <SelectItem
                      key={key}
                      value={key}
                      disabled={usedKeys.includes(key)}
                    >
                      <div className="flex items-center justify-between w-full gap-4">
                        <span>{key}</span>
                        {usedKeys.includes(key) && (
                          <span className="text-xs text-muted-foreground">en uso</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Action description */}
            <div className="space-y-1.5">
              <Label className="text-xs">Acción</Label>
              <input
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Ej: Mover hacia arriba"
                value={accion}
                onChange={e => setAccion(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button size="sm" disabled={saving || !selectedKey || !accion.trim()} onClick={handleAdd} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Agregar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Controls list */}
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : controls.length === 0 ? (
        <div className="flex flex-col items-center py-10 gap-2 text-center">
          <Gamepad2 className="h-8 w-8 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">Agrega el primer control arriba.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([tipo, items]) => (
          <Card key={tipo} className="border-border/50 bg-card/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {INPUT_LABELS[tipo] ?? tipo}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {items.map(control => (
                <div
                  key={control.id}
                  className="flex items-center justify-between rounded-md border border-border/40 bg-background/40 px-3 py-2 group"
                >
                  <div className="flex items-center gap-3">
                    <kbd className="rounded bg-accent/60 px-2 py-0.5 text-xs font-mono border border-border/50">
                      {control.tecla_boton}
                    </kbd>
                    <span className="text-sm text-muted-foreground">
                      {control.descripcion_accion}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setToDelete(control)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        ))
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