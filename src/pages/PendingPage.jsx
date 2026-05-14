import { Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/modules/auth/hooks/useAuth'

export default function PendingPage() {
  const { logout } = useAuth()

  return (
    <div className="flex min-h-svh items-center justify-center p-6 bg-background">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-primary/10 p-4">
            <Clock className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-semibold">Cuenta en revisión</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Tu cuenta está pendiente de aprobación por un administrador.
            Te notificaremos por correo cuando sea aprobada.
          </p>
        </div>
        <Button variant="outline" className="w-full" onClick={logout}>
          Cerrar sesión
        </Button>
      </div>
    </div>
  )
}