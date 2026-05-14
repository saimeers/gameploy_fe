import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Loader2, GraduationCap, BookOpen } from 'lucide-react'
import { Button }   from '@/components/ui/button'
import { Input }    from '@/components/ui/input'
import { Label }    from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn }       from '@/lib/utils'
import { useAuth }  from '../hooks/useAuth'

const ROLES = [
  {
    value: 'estudiante',
    label: 'Estudiante',
    description: 'Explora y evalúa juegos serios',
    icon: GraduationCap,
  },
  {
    value: 'docente',
    label: 'Docente',
    description: 'Publica y evalúa proyectos',
    icon: BookOpen,
  },
]

export default function RegisterForm() {
  const { loading, register: registerUser } = useAuth()
  const [rolSeleccionado, setRolSeleccionado] = useState(null)
  
  const location = useLocation()
  const googleData = location.state?.googleData

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      nombre: googleData?.nombre || '',
      correo: googleData?.correo || '',
    }
  })

  const onSubmit = (data) => {
    if (!rolSeleccionado) return
    registerUser({
      nombre: data.nombre,
      correo: data.correo,
      password: data.password,
      rol_solicitado: rolSeleccionado,
      isGoogleCompletion: !!googleData 
    })
  }

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl">
          {googleData ? 'Completa tu registro' : 'Crear cuenta'}
        </CardTitle>
        <CardDescription>
          {googleData 
            ? 'Casi listo. Elige tu rol y asigna una contraseña para tu cuenta.'
            : 'Tu cuenta quedará pendiente de aprobación por un administrador'
          }
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

          <div className="space-y-2">
            <Label>¿Cómo quieres registrarte?</Label>
            <div className="grid grid-cols-2 gap-3">
              {ROLES.map(({ value, label, description, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRolSeleccionado(value)}
                  className={cn(
                    'flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-all',
                    rolSeleccionado === value
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border/50 bg-background/40 text-muted-foreground hover:border-border hover:bg-accent/30'
                  )}
                >
                  <Icon className={cn('h-4 w-4', rolSeleccionado === value ? 'text-primary' : '')} />
                  <span className="text-sm font-medium">{label}</span>
                  <span className="text-xs">{description}</span>
                </button>
              ))}
            </div>
            {!rolSeleccionado && errors.submit &&
              <p className="text-xs text-destructive">Selecciona un rol para continuar</p>}
          </div>

          {/* Fields */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="nombre">Nombre completo</Label>
              <Input
                id="nombre"
                placeholder="Tu nombre"
                disabled={loading || !!googleData} 
                {...register('nombre', { required: 'El nombre es requerido' })}
              />
              {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="correo">Correo electrónico</Label>
              <Input
                id="correo"
                type="email"
                placeholder="tu@correo.com"
                disabled={loading || !!googleData}
                {...register('correo', {
                  required: 'El correo es requerido',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Correo inválido' },
                })}
              />
              {errors.correo && <p className="text-xs text-destructive">{errors.correo.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                disabled={loading}
                {...register('password', {
                  required: 'La contraseña es requerida',
                  minLength: { value: 6, message: 'Mínimo 6 caracteres' },
                })}
              />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                disabled={loading}
                {...register('confirmPassword', {
                  required: 'Confirma tu contraseña',
                  validate: val => val === watch('password') || 'Las contraseñas no coinciden',
                })}
              />
              {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading || !rolSeleccionado}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading
              ? 'Creando cuenta...'
              : rolSeleccionado
                ? `Registrarme como ${rolSeleccionado}`
                : 'Selecciona un rol para continuar'}
          </Button>

          {!googleData && (
            <p className="text-center text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-foreground underline-offset-4 hover:underline">
                Inicia sesión
              </Link>
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}