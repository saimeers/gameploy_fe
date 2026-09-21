import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Loader2, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'
import ProfileView          from '../components/ProfileView'
import ChangePasswordDialog from '../components/ChangePasswordDialog'
import { profileService }   from '../services/profile.service'

export default function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [changingPassword, setChangingPassword] = useState(false)

  const storedUser = useAuthStore(s => s.user)
  const token      = useAuthStore(s => s.token)
  const photoURL   = useAuthStore(s => s.photoURL)
  const setAuth    = useAuthStore(s => s.setAuth)

  const loadProfile = useCallback(
    () => profileService.getProfile().then(res => res.data.data),
    []
  )

  useEffect(() => {
    let cancelled = false
    loadProfile()
      .then(data => { if (!cancelled) setProfile(data) })
      .catch(() => { if (!cancelled) toast.error('Error al cargar el perfil') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [loadProfile])

  const handleRename = async (nombre) => {
    try {
      const res = await profileService.updateProfile({ nombre })
      const actualizado = res.data.data
      setProfile(prev => ({ ...prev, nombre: actualizado.nombre }))
      // La barra lateral lee el usuario de la sesión, no del perfil
      setAuth(token, { ...storedUser, nombre: actualizado.nombre }, photoURL)
      toast.success('Perfil actualizado')
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'No se pudo actualizar el perfil')
      throw err
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="max-w-3xl">
      <ProfileView
        profile={{ ...profile, foto_perfil: profile.foto_perfil ?? photoURL }}
        onRename={handleRename}
        actions={
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setChangingPassword(true)}
          >
            <KeyRound className="h-4 w-4" />
            Cambiar contraseña
          </Button>
        }
        emptyAction={
          profile.rol?.nombre === 'estudiante' && (
            <Link to="/student">
              <Button variant="outline" size="sm">Ir a mis proyectos</Button>
            </Link>
          )
        }
      />

      <ChangePasswordDialog
        open={changingPassword}
        onOpenChange={setChangingPassword}
        correo={profile.correo}
      />
    </div>
  )
}
