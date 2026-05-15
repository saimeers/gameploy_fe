import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      photoURL: null,
      setAuth: (token, user, photoURL = null) => set({ token, user, photoURL }),
      clearAuth: () => set({ token: null, user: null, photoURL: null }),
    }),
    { name: 'gameploy-auth' }
  )
)