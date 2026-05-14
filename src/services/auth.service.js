import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  getAuth,
} from 'firebase/auth'
import { firebaseApp } from '@/lib/firebase'
import api from './api'

const auth = getAuth(firebaseApp)
const googleProvider = new GoogleAuthProvider()

export const authService = {

  loginWithEmail: async (correo, password) => {
    const credential = await signInWithEmailAndPassword(auth, correo, password)
    const token = await credential.user.getIdToken()
    // sync with our backend
    const res = await api.post('/auth/sync', {
      nombre: credential.user.displayName ?? correo.split('@')[0],
      correo,
    }, { headers: { Authorization: `Bearer ${token}` } })
    return { token, user: res.data.data }
  },

  loginWithGoogle: async () => {
      const credential = await signInWithPopup(auth, googleProvider)
      const token = await credential.user.getIdToken()
      const correo = credential.user.email
      const nombre = credential.user.displayName ?? ''

      const checkRes = await api.get(`/users/check?email=${correo}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const exists = checkRes.data.data.exists;

      if (!exists) {
        return { 
          needsRegistration: true, 
          googleData: { correo, nombre, token } 
        };
      }

      const res = await api.post('/auth/sync', {
        nombre,
        correo,
      }, { headers: { Authorization: `Bearer ${token}` } })
      
      return { token, user: res.data.data }
    },

  register: async ({ nombre, correo, password, rol_solicitado }) => {
    const credential = await createUserWithEmailAndPassword(auth, correo, password)
    const token = await credential.user.getIdToken()
    const res = await api.post('/auth/register', {
      nombre, correo, rol_solicitado,
    }, { headers: { Authorization: `Bearer ${token}` } })
    return { token, user: res.data.data }
  },

  logout: async () => {
    await signOut(auth)
  },
}