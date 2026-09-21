import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Loader2, GraduationCap, BookOpen, Eye, EyeOff } from 'lucide-react'
import { Button }   from '@/components/ui/button'
import { Input }    from '@/components/ui/input'
import { Label }    from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn }       from '@/lib/utils'
import { LIMITS }   from '@/lib/limits'
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
  const [showPassword, setShowPassword]       = useState(false)
  const [showConfirm, setShowConfirm]         = useState(false)

  const location   = useLocation()
  const googleData = location.state?.googleData

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      nombre: googleData?.nombre || '',
      correo: googleData?.correo || '',
    },
  })

  const onSubmit = (data) => {
    if (!rolSeleccionado) return
    registerUser({
      nombre:             data.nombre,
      correo:             data.correo,
      password:           data.password,
      rol_solicitado:     rolSeleccionado,
      isGoogleCompletion: !!googleData,
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
            ? 'Elige tu rol y crea una contraseña para poder entrar también con correo.'
            : 'Tu cuenta quedará pendiente de aprobación por un administrador.'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

          {/* Role selector */}
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
          </div>

          <div className="space-y-3">

            {/* Nombre */}
            <div className="space-y-1.5">
              <Label htmlFor="nombre">Nombre completo</Label>
              <Input
                id="nombre"
                placeholder="Tu nombre"
                maxLength={LIMITS.nombreUsuario}
                disabled={loading || !!googleData}
                {...register('nombre', { required: 'El nombre es requerido' })}
              />
              {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
            </div>

            {/* Correo */}
            <div className="space-y-1.5">
              <Label htmlFor="correo">Correo electrónico</Label>
              <Input
                id="correo"
                type="email"
                placeholder="tu@correo.com"
                maxLength={LIMITS.correo}
                disabled={loading || !!googleData}
                {...register('correo', {
                  required: 'El correo es requerido',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Correo inválido' },
                })}
              />
              {errors.correo && <p className="text-xs text-destructive">{errors.correo.message}</p>}
            </div>

            {/* Contraseña — siempre visible, Google completion también la necesita para linkear */}
            <div className="space-y-1.5">
              <Label htmlFor="password">
                {googleData ? 'Crea una contraseña' : 'Contraseña'}
              </Label>
              {googleData && (
                <p className="text-xs text-muted-foreground">
                  Con esta contraseña podrás entrar también con correo y contraseña.
                </p>
              )}
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  maxLength={LIMITS.password}
                  disabled={loading}
                  className="pr-10"
                  {...register('password', {
                    required: 'La contraseña es requerida',
                    minLength: { value: 6, message: 'Mínimo 6 caracteres' },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            {/* Confirmar contraseña */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  maxLength={LIMITS.password}
                  disabled={loading}
                  className="pr-10"
                  {...register('confirmPassword', {
                    required: 'Confirma tu contraseña',
                    validate: val => val === watch('password') || 'Las contraseñas no coinciden',
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
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
                ? googleData
                  ? `Completar registro como ${rolSeleccionado}`
                  : `Registrarme como ${rolSeleccionado}`
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