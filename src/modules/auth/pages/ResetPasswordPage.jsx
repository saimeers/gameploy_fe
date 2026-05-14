import { useState }          from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useForm }           from 'react-hook-form'
import { toast }             from 'sonner'
import { getAuth, confirmPasswordReset } from 'firebase/auth'
import { firebaseApp }       from '@/lib/firebase'
import { ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react'
import { Button }            from '@/components/ui/button'
import { Input }             from '@/components/ui/input'
import { Label }             from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const auth = getAuth(firebaseApp)

export default function ResetPasswordPage() {
  const [searchParams]          = useSearchParams()
  const navigate                = useNavigate()
  const [loading, setLoading]   = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // Firebase sends oobCode as query param
  const oobCode = searchParams.get('oobCode')

  const { register, handleSubmit, watch, formState: { errors } } = useForm()

  const onSubmit = async ({ password }) => {
    if (!oobCode) {
      toast.error('Enlace inválido', { description: 'El enlace no contiene un código válido.' })
      return
    }

    setLoading(true)
    try {
      await confirmPasswordReset(auth, oobCode, password)
      toast.success('Contraseña actualizada', {
        description: 'Ya puedes iniciar sesión con tu nueva contraseña.',
      })
      navigate('/login')
    } catch (err) {
      const messages = {
        'auth/expired-action-code': 'El enlace ha expirado. Solicita uno nuevo.',
        'auth/invalid-action-code': 'El enlace es inválido o ya fue usado.',
        'auth/weak-password':       'La contraseña debe tener al menos 6 caracteres.',
      }
      toast.error('Error', {
        description: messages[err.code] ?? 'No se pudo actualizar la contraseña.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-svh w-full items-center justify-center p-6">
      <div className="fixed inset-0 bg-background">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(246,11%,22%,0.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(246,11%,22%,0.3)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(270,60%,52%,0.15),transparent)]" />
      </div>

      <div className="relative z-10 w-full max-w-sm space-y-6">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver al inicio de sesión
        </Link>

        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Gameploy</h1>
          <p className="text-sm text-muted-foreground">Semillero VIRAL</p>
        </div>

        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Nueva contraseña</CardTitle>
            <CardDescription>
              Elige una contraseña segura para tu cuenta
            </CardDescription>
          </CardHeader>

          <CardContent>
            {!oobCode ? (
              <div className="py-4 text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                  Enlace inválido o expirado.
                </p>
                <Link to="/forgot-password">
                  <Button variant="outline" size="sm">Solicitar nuevo enlace</Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="password">Nueva contraseña</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPass ? 'text' : 'password'}
                      disabled={loading}
                      className="pr-10"
                      {...register('password', {
                        required: 'La contraseña es requerida',
                        minLength: { value: 6, message: 'Mínimo 6 caracteres' },
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password &&
                    <p className="text-xs text-destructive">{errors.password.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirm ? 'text' : 'password'}
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
                  {errors.confirmPassword &&
                    <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? 'Guardando...' : 'Guardar contraseña'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}