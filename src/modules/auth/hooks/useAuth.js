import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { getAuth } from 'firebase/auth'
import { firebaseApp } from '@/lib/firebase'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/store/authStore'

const auth = getAuth(firebaseApp)

export function useAuth() {
  const [loading, setLoading] = useState(false)
  const navigate  = useNavigate()
  const setAuth   = useAuthStore(s => s.setAuth)
  const clearAuth = useAuthStore(s => s.clearAuth)

  /**
   * Cuenta que no puede entrar: avisa, cierra la sesión de Firebase y deja el
   * estado limpio, para que no quede una sesión a medias.
   */
  const denyAccess = async (notify) => {
    notify()
    await authService.logout()
    clearAuth()
  }

  /** Motivo por el que una cuenta no puede entrar, o null si sí puede. */
  const accessDenial = (user) => {
    if (user.activo === false) {
      return () => toast.error('Tu cuenta ha sido deshabilitada', {
        description: 'Contacta al administrador del semillero.',
      })
    }
    if (user.rol?.nombre === 'pendiente') {
      return () => toast.warning('Cuenta en revisión', {
        description: 'Tu cuenta está pendiente de aprobación por un administrador.',
      })
    }
    return null
  }

  const loginWithEmail = async (correo, password) => {
    setLoading(true)
    try {
      const { token, user } = await authService.loginWithEmail(correo, password)
      const photoURL = auth.currentUser?.photoURL ?? null

      const denial = accessDenial(user)
      if (denial) {
        await denyAccess(denial)
        return
      }

      setAuth(token, user, photoURL)
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
      const photoURL = auth.currentUser?.photoURL ?? null

      const denial = accessDenial(user)
      if (denial) {
        await denyAccess(denial)
        return
      }

      setAuth(token, user, photoURL)
      toast.success(`Bienvenido, ${user.nombre}`)
      redirectByRole(user.rol?.nombre, navigate)
    } catch (err) {
      const msg = err.response?.data?.message ?? 'No se pudo iniciar sesión con Google.'
      toast.error('Error', { description: msg })
    } finally {
      setLoading(false)
    }
  }

  const register = async ({ nombre, correo, password, rol_solicitado, isGoogleCompletion }) => {
    setLoading(true)
    try {
      await authService.register({ nombre, correo, password, rol_solicitado, isGoogleCompletion })
      toast.success('Registro exitoso', {
        description: 'Tu cuenta está pendiente de aprobación. Te avisaremos pronto.',
      })
      navigate('/login')
    } catch (err) {
      const firebaseMessages = {
        'auth/provider-already-linked': 'Esta cuenta ya tiene contraseña vinculada.',
        'auth/weak-password':           'La contraseña debe tener al menos 6 caracteres.',
        'auth/email-already-in-use':    'Este correo ya está registrado.',
      }
      const msg = firebaseMessages[err.code]
        ?? err.response?.data?.message
        ?? 'No se pudo crear la cuenta.'
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
  if (role === 'admin')          navigate('/admin')
  else if (role === 'docente')   navigate('/teacher')
  else if (role === 'estudiante') navigate('/student')
  else navigate('/')
}