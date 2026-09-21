import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { toast } from 'sonner'
import { useAuth } from './useAuth'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/store/authStore'

const navigate = vi.fn()

vi.mock('@/services/auth.service', () => ({
  authService: {
    loginWithEmail: vi.fn(),
    loginWithGoogle: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(() => Promise.resolve()),
  },
}))

vi.mock('firebase/auth', () => ({ getAuth: () => ({ currentUser: { photoURL: null } }) }))
vi.mock('@/lib/firebase', () => ({ firebaseApp: {} }))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() },
}))

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => navigate,
}))

const ACTIVO     = { id: 'u1', nombre: 'Saimer', activo: true,  rol: { nombre: 'estudiante' } }
const DESACTIVADO = { id: 'u2', nombre: 'Ale',    activo: false, rol: { nombre: 'estudiante' } }
const PENDIENTE   = { id: 'u3', nombre: 'Nuevo',  activo: true,  rol: { nombre: 'pendiente' } }

const login = async (user) => {
  authService.loginWithEmail.mockResolvedValue({ token: 'jwt', user })
  const { result } = renderHook(() => useAuth())
  await act(() => result.current.loginWithEmail('correo@ufps.edu.co', 'secreta'))
}

beforeEach(() => {
  useAuthStore.getState().clearAuth()
  navigate.mockClear()
})

describe('useAuth — acceso según el estado de la cuenta', () => {
  it('deja entrar a una cuenta activa y la lleva a su panel', async () => {
    await login(ACTIVO)

    expect(useAuthStore.getState().token).toBe('jwt')
    expect(navigate).toHaveBeenCalledWith('/student')
  })

  it('avisa a una cuenta deshabilitada y no la deja pasar', async () => {
    await login(DESACTIVADO)

    expect(toast.error).toHaveBeenCalledWith(
      'Tu cuenta ha sido deshabilitada',
      expect.objectContaining({ description: expect.stringContaining('administrador') })
    )
    expect(useAuthStore.getState().token).toBeNull()
    expect(navigate).not.toHaveBeenCalled()
  })

  it('cierra la sesión de Firebase de una cuenta deshabilitada', async () => {
    await login(DESACTIVADO)

    expect(authService.logout).toHaveBeenCalled()
  })

  it('sigue frenando a una cuenta pendiente de aprobación', async () => {
    await login(PENDIENTE)

    expect(toast.warning).toHaveBeenCalledWith('Cuenta en revisión', expect.any(Object))
    expect(useAuthStore.getState().token).toBeNull()
  })

  it('aplica la misma regla al entrar con Google', async () => {
    authService.loginWithGoogle.mockResolvedValue({ token: 'jwt', user: DESACTIVADO })
    const { result } = renderHook(() => useAuth())

    await act(() => result.current.loginWithGoogle())

    expect(toast.error).toHaveBeenCalledWith('Tu cuenta ha sido deshabilitada', expect.any(Object))
    expect(useAuthStore.getState().token).toBeNull()
    expect(navigate).not.toHaveBeenCalled()
  })
})
