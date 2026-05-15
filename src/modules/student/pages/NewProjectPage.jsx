import { useState, useEffect } from 'react'
import { useNavigate, Link }   from 'react-router-dom'
import { useForm }             from 'react-hook-form'
import { toast }               from 'sonner'
import { ArrowLeft, Loader2 }  from 'lucide-react'
import { Button }   from '@/components/ui/button'
import { Input }    from '@/components/ui/input'
import { Label }    from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge }    from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { studentService } from '../services/student.service'

export default function NewProjectPage() {
  const navigate = useNavigate()
  const [loading, setLoading]       = useState(false)
  const [categorias, setCategorias] = useState([])
  const [etiquetas, setEtiquetas]   = useState([])
  const [selectedTags, setSelectedTags] = useState([])

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm()

  useEffect(() => {
    Promise.all([studentService.getCategorias(), studentService.getEtiquetas()])
      .then(([catRes, tagRes]) => {
        setCategorias(catRes.data.data)
        setEtiquetas(tagRes.data.data)
      })
      .catch(console.error)
  }, [])

  const toggleTag = (id) => {
    setSelectedTags(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    )
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const res = await studentService.createProject({
        nombre:      data.nombre,
        descripcion: data.descripcion || null,
        instrucciones: data.instrucciones || null,
        id_categoria: data.id_categoria ? Number(data.id_categoria) : null,
        etiquetas:   selectedTags,
      })
      toast.success('Proyecto creado', {
        description: 'Ahora puedes subir tus archivos y configurar los controles.',
      })
      navigate(`/student/projects/${res.data.data.id}`)
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Error al crear el proyecto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/student">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-semibold">Nuevo proyecto</h1>
          <p className="text-sm text-muted-foreground">
            Completa la información básica de tu Juego Serio.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Card className="border-border/50 bg-card/60">
          <CardHeader>
            <CardTitle className="text-sm">Información general</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">

            <div className="space-y-1.5">
              <Label htmlFor="nombre">Nombre del proyecto *</Label>
              <Input
                id="nombre"
                placeholder="Ej: Memoria Cognitiva 2025"
                disabled={loading}
                {...register('nombre', { required: 'El nombre es requerido' })}
              />
              {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                placeholder="Describe brevemente tu juego y sus objetivos pedagógicos..."
                rows={3}
                disabled={loading}
                {...register('descripcion')}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="instrucciones">Instrucciones generales</Label>
              <Textarea
                id="instrucciones"
                placeholder="Describe cómo se juega, qué debe hacer el usuario..."
                rows={3}
                disabled={loading}
                {...register('instrucciones')}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Categoría</Label>
              <Select onValueChange={val => setValue('id_categoria', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map(cat => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              {etiquetas.length === 0 && (
                <p className="text-xs text-muted-foreground">No hay etiquetas disponibles.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Link to="/student">
            <Button type="button" variant="outline" disabled={loading}>
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Creando...' : 'Crear proyecto'}
          </Button>
        </div>
      </form>
    </div>
  )
}