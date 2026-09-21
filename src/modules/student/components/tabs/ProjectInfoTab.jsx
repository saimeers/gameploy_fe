import { useState, useEffect } from 'react'
import { useForm }    from 'react-hook-form'
import { toast }      from 'sonner'
import { Loader2 }    from 'lucide-react'
import { Button }     from '@/components/ui/button'
import { Input }      from '@/components/ui/input'
import { Label }      from '@/components/ui/label'
import { Textarea }   from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { studentService } from '../../services/student.service'
import { LIMITS }         from '@/lib/limits'

const VISIBILITY_OPTIONS = [
  { value: 'privado',    label: 'Privado — solo tú' },
  { value: 'por_enlace', label: 'Por enlace — quien tenga el link' },
  { value: 'publico',    label: 'Público — visible en el catálogo' },
]

export default function ProjectInfoTab({ project, onUpdated }) {
  const [loading, setLoading]       = useState(false)
  const [categorias, setCategorias] = useState([])
  const [etiquetas, setEtiquetas]   = useState([])
  const [selectedTags, setSelectedTags] = useState(
    project.etiquetas?.map(pe => pe.id_etiqueta) ?? []
  )

  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      nombre:        project.nombre,
      descripcion:   project.descripcion ?? '',
      instrucciones: project.instrucciones ?? '',
      visibilidad:   project.visibilidad,
      id_categoria:  project.id_categoria ? String(project.id_categoria) : '',
    },
  })

  useEffect(() => {
    Promise.all([studentService.getCategorias(), studentService.getEtiquetas()])
      .then(([c, e]) => { setCategorias(c.data.data); setEtiquetas(e.data.data) })
      .catch(console.error)
  }, [])

  const toggleTag = (id) =>
    setSelectedTags(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id])

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await studentService.updateProject(project.id, {
        nombre:        data.nombre,
        descripcion:   data.descripcion || null,
        instrucciones: data.instrucciones || null,
        visibilidad:   data.visibilidad,
        id_categoria:  data.id_categoria ? Number(data.id_categoria) : null,
        etiquetas:     selectedTags,
      })
      toast.success('Proyecto actualizado')
      onUpdated()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Error al actualizar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Card className="border-border/50 bg-card/60">
        <CardHeader>
          <CardTitle className="text-sm">Información general</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">

          <div className="space-y-1.5">
            <Label>Nombre</Label>
            <Input
              maxLength={LIMITS.nombreProyecto}
              {...register('nombre', { required: true })}
              disabled={loading}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Descripción</Label>
            <Textarea
              rows={3}
              maxLength={LIMITS.descripcionProyecto}
              {...register('descripcion')}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground text-right">
              {(watch('descripcion') || '').length} / {LIMITS.descripcionProyecto}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>Instrucciones generales</Label>
            <Textarea
              rows={3}
              placeholder="¿Cómo se juega? ¿Qué debe hacer el usuario?"
              maxLength={LIMITS.instruccionesProyecto}
              {...register('instrucciones')}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground text-right">
              {(watch('instrucciones') || '').length} / {LIMITS.instruccionesProyecto}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Visibilidad</Label>
              <Select
                defaultValue={project.visibilidad}
                onValueChange={val => setValue('visibilidad', val, { shouldDirty: true })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {VISIBILITY_OPTIONS.map(o => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Categoría</Label>
              <Select
                defaultValue={project.id_categoria ? String(project.id_categoria) : ''}
                onValueChange={val => setValue('id_categoria', val, { shouldDirty: true })}
              >
                <SelectTrigger><SelectValue placeholder="Sin categoría" /></SelectTrigger>
                <SelectContent>
                  {categorias.map(cat => (
                    <SelectItem key={cat.id} value={String(cat.id)}>{cat.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Etiquetas</Label>
            <div className="flex flex-wrap gap-2">
              {etiquetas.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`rounded-full border px-3 py-1 text-xs transition-all ${
                    selectedTags.includes(tag.id)
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border/50 text-muted-foreground hover:border-border'
                  }`}
                >
                  {tag.nombre}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Guardar cambios
        </Button>
      </div>
    </form>
  )
}