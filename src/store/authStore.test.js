import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from './authStore'

const USER = { id: 'u1', nombre: 'Saimer', rol: { nombre: 'admin' } }

describe('authStore', () => {
  beforeEach(() => useAuthStore.getState().clearAuth())

  it('arranca sin sesión', () => {
    const { token, user } = useAuthStore.getState()
    expect(token).toBeNull()
    expect(user).toBeNull()
  })

  it('guarda token, usuario y foto al iniciar sesión', () => {
    useAuthStore.getState().setAuth('jwt-123', USER, 'https://foto')

    const state = useAuthStore.getState()
    expect(state.token).toBe('jwt-123')
    expect(state.user.rol.nombre).toBe('admin')
    expect(state.photoURL).toBe('https://foto')
  })

  it('deja la foto en null si no se le pasa', () => {
    useAuthStore.getState().setAuth('jwt-123', USER)

    expect(useAuthStore.getState().photoURL).toBeNull()
  })

  it('limpia toda la sesión al cerrarla', () => {
    useAuthStore.getState().setAuth('jwt-123', USER, 'https://foto')
    useAuthStore.getState().clearAuth()

    expect(useAuthStore.getState()).toMatchObject({ token: null, user: null, photoURL: null })
  })
})
