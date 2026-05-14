import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/store/authStore'

export function useAuth() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const setAuth = useAuthStore(s => s.setAuth)
  const clearAuth = useAuthStore(s => s.clearAuth)

  const loginWithEmail = async (correo, password) => {
    setLoading(true)
    try {
      const { token, user } = await authService.loginWithEmail(correo, password)

      if (user.rol?.nombre === 'pendiente') {
        toast.warning('Cuenta en revisión', {
          description: 'Tu cuenta está pendiente de aprobación por un administrador.',
        })
        return
      }

      setAuth(token, user)
      toast.success(`Bienvenido, ${user.nombre}`)
      redirectByRole(user.rol?.nombre, navigate)
    } catch (err) {
      const msg = err.response?.data?.message ?? 'Correo o contraseña incorrectos.'
      toast.error('Error al iniciar sesión', { description: msg })
    } finally {
      setLoading(false)
    }
  }

  const loginWithGoogle = async () => {
    setLoading(true)
    try {
      const result = await authService.loginWithGoogle()

      if (result.needsRegistration) {
        toast.info('Casi listo', {
          description: 'Completa estos últimos datos para crear tu cuenta.',
        })
        navigate('/register', { state: { googleData: result.googleData } })
        return 
      }

      const { token, user } = result

      if (user.rol?.nombre === 'pendiente') {
        toast.warning('Cuenta en revisión', {
          description: 'Tu cuenta está pendiente de aprobación por un administrador.',
        })
        return 
      }

      setAuth(token, user)
      toast.success(`Bienvenido, ${user.nombre}`)
      redirectByRole(user.rol?.nombre, navigate)

    } catch (err) {
      const msg = err.response?.data?.message ?? 'No se pudo iniciar sesión con Google.'
      toast.error('Error', { description: msg })
    } finally {
      setLoading(false)
    }
  }

  const register = async ({ nombre, correo, password, rol_solicitado }) => {
    setLoading(true)
    try {
      await authService.register({ nombre, correo, password, rol_solicitado })
      toast.success('Registro exitoso', {
        description: 'Tu cuenta está pendiente de aprobación. Te avisaremos pronto.',
      })
      navigate('/login')
    } catch (err) {
      const msg = err.response?.data?.message ?? 'No se pudo crear la cuenta.'
      toast.error('Error al registrarse', { description: msg })
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    await authService.logout()
    clearAuth()
    navigate('/login')
  }

  return { loading, loginWithEmail, loginWithGoogle, register, logout }
}

function redirectByRole(role, navigate) {
  if (role === 'admin') navigate('/admin')
  else if (role === 'docente') navigate('/teacher')
  else if (role === 'estudiante') navigate('/student')
  else navigate('/')
}