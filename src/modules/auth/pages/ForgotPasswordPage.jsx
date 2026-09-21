import { useState } from 'react'
import { Link }     from 'react-router-dom'
import { useForm }  from 'react-hook-form'
import { toast }    from 'sonner'
import { ArrowLeft, Loader2, MailCheck } from 'lucide-react'
import { Button }   from '@/components/ui/button'
import { Input }    from '@/components/ui/input'
import { LIMITS }   from '@/lib/limits'
import { Label }    from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import api          from '@/services/api'

export default function ForgotPasswordPage() {
  const [sent, setSent]     = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async ({ correo }) => {
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { correo })
      setSent(true)
    } catch {
      // Always show success to avoid email enumeration
      setSent(true)
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
            <CardTitle className="text-xl">Restablecer contraseña</CardTitle>
            <CardDescription>
              Te enviaremos un enlace para crear una nueva contraseña
            </CardDescription>
          </CardHeader>

          <CardContent>
            {sent ? (
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <MailCheck className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Correo enviado</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Si ese correo está registrado, recibirás un enlace en los próximos minutos.
                    Revisa también tu carpeta de spam.
                  </p>
                </div>
                <Link to="/login">
                  <Button variant="outline" size="sm">Volver al login</Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="correo">Correo electrónico</Label>
                  <Input
                    id="correo"
                    type="email"
                    placeholder="tu@correo.com"
                    maxLength={LIMITS.correo}
                    disabled={loading}
                    {...register('correo', {
                      required: 'El correo es requerido',
                      pattern: { value: /^\S+@\S+\.\S+$/, message: 'Correo inválido' },
                    })}
                  />
                  {errors.correo &&
                    <p className="text-xs text-destructive">{errors.correo.message}</p>}
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? 'Enviando...' : 'Enviar enlace'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}