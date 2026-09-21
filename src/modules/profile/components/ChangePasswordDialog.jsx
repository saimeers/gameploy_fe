import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2, KeyRound, Eye, EyeOff, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input }  from '@/components/ui/input'
import { Label }  from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { authService } from '@/services/auth.service'
import { LIMITS } from '@/lib/limits'

const MIN_PASSWORD = 6

/** Mensajes de Firebase traducidos a algo que la persona pueda accionar. */
const FIREBASE_MESSAGES = {
  'auth/invalid-credential':  'La contraseña actual no es correcta.',
  'auth/wrong-password':      'La contraseña actual no es correcta.',
  'auth/weak-password':       `La nueva contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`,
  'auth/too-many-requests':   'Demasiados intentos. Espera unos minutos y vuelve a probar.',
  'auth/requires-recent-login': 'Por seguridad, vuelve a iniciar sesión antes de cambiarla.',
}

function PasswordField({ id, label, value, onChange, disabled, autoComplete }) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs">{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? 'text' : 'password'}
          className="h-9 pr-10"
          maxLength={LIMITS.password}
          autoComplete={autoComplete}
          value={value}
          disabled={disabled}
          onChange={e => onChange(e.target.value)}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible(v => !v)}
          title={visible ? 'Ocultar' : 'Mostrar'}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}

/**
 * Cambio de contraseña desde el perfil. Firebase obliga a reautenticar antes de
 * cambiarla, así que la contraseña actual se valida en el mismo paso. Quien no
 * la recuerde puede pedir el enlace por correo sin salir del diálogo.
 */
export default function ChangePasswordDialog({ open, onOpenChange, correo }) {
  const [actual, setActual]   = useState('')
  const [nueva, setNueva]     = useState('')
  const [repetir, setRepetir] = useState('')
  const [saving, setSaving]   = useState(false)
  const [sending, setSending] = useState(false)

  const tienePassword = authService.hasPasswordProvider()

  const close = () => {
    setActual(''); setNueva(''); setRepetir('')
    onOpenChange(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (nueva.length < MIN_PASSWORD) {
      toast.error(`La nueva contraseña debe tener al menos ${MIN_PASSWORD} caracteres`)
      return
    }
    if (nueva !== repetir) {
      toast.error('Las contraseñas nuevas no coinciden')
      return
    }
    if (nueva === actual) {
      toast.error('La nueva contraseña debe ser distinta de la actual')
      return
    }

    setSaving(true)
    try {
      await authService.changePassword(actual, nueva)
      toast.success('Contraseña actualizada')
      close()
    } catch (err) {
      toast.error(FIREBASE_MESSAGES[err.code] ?? err.message ?? 'No se pudo cambiar la contraseña')
    } finally {
      setSaving(false)
    }
  }

  const handleSendReset = async () => {
    setSending(true)
    try {
      await authService.sendPasswordReset(correo)
      toast.success('Enlace enviado', {
        description: `Revisa ${correo} para establecer una contraseña nueva.`,
      })
      close()
    } catch {
      toast.error('No se pudo enviar el enlace')
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={value => (value ? onOpenChange(true) : close())}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cambiar contraseña</DialogTitle>
          <DialogDescription>
            {tienePassword
              ? 'Escribe tu contraseña actual y la nueva. Si no la recuerdas, te enviamos un enlace al correo.'
              : 'Tu cuenta entra con Google y todavía no tiene contraseña. Te enviamos un enlace al correo para establecer una.'}
          </DialogDescription>
        </DialogHeader>

        {tienePassword ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <PasswordField
              id="password-actual"
              label="Contraseña actual"
              autoComplete="current-password"
              value={actual}
              onChange={setActual}
              disabled={saving}
            />
            <PasswordField
              id="password-nueva"
              label="Nueva contraseña"
              autoComplete="new-password"
              value={nueva}
              onChange={setNueva}
              disabled={saving}
            />
            <PasswordField
              id="password-repetir"
              label="Repite la nueva contraseña"
              autoComplete="new-password"
              value={repetir}
              onChange={setRepetir}
              disabled={saving}
            />

            <button
              type="button"
              onClick={handleSendReset}
              disabled={sending}
              className="text-xs text-primary hover:underline disabled:opacity-50"
            >
              {sending ? 'Enviando enlace…' : '¿No recuerdas tu contraseña actual?'}
            </button>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={close} disabled={saving}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving || !actual || !nueva || !repetir} className="gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                Cambiar contraseña
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <DialogFooter>
            <Button type="button" variant="outline" onClick={close} disabled={sending}>
              Cancelar
            </Button>
            <Button onClick={handleSendReset} disabled={sending} className="gap-2">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              Enviarme el enlace
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
