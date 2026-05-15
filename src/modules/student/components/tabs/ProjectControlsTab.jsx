import { useEffect, useState, useCallback } from 'react'
import { useForm }   from 'react-hook-form'
import { toast }     from 'sonner'
import { Plus, Trash2, GripVertical, Loader2, Gamepad2 } from 'lucide-react'
import { Button }    from '@/components/ui/button'
import { Input }     from '@/components/ui/input'
import { Label }     from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { studentService } from '../../services/student.service'

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
  const [controls, setControls] = useState([])
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [toDelete, setToDelete] = useState(null)

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm({
    defaultValues: { tipo_entrada: 'teclado' },
  })

  const fetchControls = useCallback(async () => {
    setLoading(true)
    try {
      const res = await studentService.getControls(projectId)
      setControls(res.data.data)
    } catch { toast.error('Error al cargar controles') }
    finally { setLoading(false) }
  }, [projectId])

  useEffect(() => { fetchControls() }, [fetchControls])

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      await studentService.createControl(projectId, {
        tipo_entrada:       data.tipo_entrada,
        tecla_boton:        data.tecla_boton,
        descripcion_accion: data.descripcion_accion,
      })
      toast.success('Control agregado')
      reset({ tipo_entrada: 'teclado', tecla_boton: '', descripcion_accion: '' })
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

  // Group by input type
  const grouped = controls.reduce((acc, c) => {
    if (!acc[c.tipo_entrada]) acc[c.tipo_entrada] = []
    acc[c.tipo_entrada].push(c)
    return acc
  }, {})

  return (
    <div className="space-y-4">

      {/* Add control form */}
      <Card className="border-border/50 bg-card/60">
        <CardHeader>
          <CardTitle className="text-sm">Agregar control</CardTitle>
          <CardDescription className="text-xs">
            Define las teclas o botones y la acción que ejecutan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Tipo de entrada</Label>
                <Select
                  defaultValue="teclado"
                  onValueChange={val => setValue('tipo_entrada', val)}
                >
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

              <div className="space-y-1.5">
                <Label className="text-xs">Tecla / Botón</Label>
                <Input
                  className="h-9"
                  placeholder="Ej: W, Espacio, Click izq."
                  {...register('tecla_boton', { required: true })}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Acción</Label>
                <Input
                  className="h-9"
                  placeholder="Ej: Mover hacia arriba"
                  {...register('descripcion_accion', { required: true })}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" size="sm" disabled={saving} className="gap-2">
                {saving
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Plus className="h-4 w-4" />}
                Agregar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Controls list grouped by type */}
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : controls.length === 0 ? (
        <div className="flex flex-col items-center py-10 gap-2 text-center">
          <Gamepad2 className="h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            Aún no hay controles. Agrega el primero arriba.
          </p>
        </div>
      ) : (
        Object.entries(grouped).map(([tipo, items]) => (
          <Card key={tipo} className="border-border/50 bg-card/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {INPUT_LABELS[tipo] ?? tipo}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {items.map(control => (
                <div
                  key={control.id}
                  className="flex items-center justify-between rounded-md border border-border/40 bg-background/40 px-3 py-2 group"
                >
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-4 w-4 text-muted-foreground/40" />
                    <kbd className="rounded bg-accent/50 px-2 py-0.5 text-xs font-mono">
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

      {/* Delete confirm */}
      <AlertDialog open={!!toDelete} onOpenChange={() => setToDelete(null)}>
        <AlertDialogContent className="bg-background text-popover-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar control</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Eliminar el control <strong>{toDelete?.tecla_boton}</strong> — {toDelete?.descripcion_accion}?
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