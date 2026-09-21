import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, ShieldCheck, UserCheck, UserX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ProfileView from '@/modules/profile/components/ProfileView'
import { adminService } from '../services/admin.service'

/** Perfil de cualquier usuario, tal como lo abre el administrador desde la lista. */
export default function UserProfileAdminPage() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(false)

  useEffect(() => {
    let cancelled = false

    adminService.getUser(id)
      .then(res => { if (!cancelled) setProfile(res.data.data) })
      .catch(err => {
        if (cancelled) return
        if (err.response?.status === 404) {
          toast.error('El usuario no existe')
          navigate('/admin/users')
          return
        }
        toast.error('Error al cargar el usuario')
      })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [id, navigate])

  const approve = async () => {
    setWorking(true)
    try {
      const res = await adminService.approveUser(id)
      setProfile(prev => ({ ...prev, rol: res.data.data.rol, rol_solicitado: null }))
      toast.success(`${profile.nombre} aprobado`)
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Error al aprobar')
    } finally {
      setWorking(false)
    }
  }

  const toggleStatus = async () => {
    setWorking(true)
    try {
      await adminService.toggleStatus(id, !profile.activo)
      setProfile(prev => ({ ...prev, activo: !prev.activo }))
      toast.success(profile.activo ? 'Usuario desactivado' : 'Usuario activado')
    } catch {
      toast.error('Error al cambiar el estado')
    } finally {
      setWorking(false)
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

  const pendiente = profile.rol?.nombre === 'pendiente'

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/admin/users">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <p className="text-sm text-muted-foreground">Perfil del usuario</p>
      </div>

      <ProfileView
        profile={profile}
        actions={
          <div className="flex flex-wrap gap-2">
            {pendiente && (
              <Button size="sm" className="gap-2" disabled={working} onClick={approve}>
                <ShieldCheck className="h-4 w-4" />
                Aprobar como {profile.rol_solicitado ?? 'estudiante'}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className={`gap-2 ${profile.activo ? 'text-destructive hover:text-destructive' : ''}`}
              disabled={working}
              onClick={toggleStatus}
            >
              {profile.activo
                ? <><UserX className="h-4 w-4" />Desactivar cuenta</>
                : <><UserCheck className="h-4 w-4" />Activar cuenta</>}
            </Button>
          </div>
        }
      />
    </div>
  )
}
