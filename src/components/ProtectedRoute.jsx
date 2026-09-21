import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { token, user } = useAuthStore()

  if (!token || !user) return <Navigate to="/login" replace />

  // Red de seguridad: si desactivan la cuenta con la sesión abierta, el backend
  // responde 401 y el interceptor la limpia, pero mientras tanto no se entra.
  if (user.activo === false) return <Navigate to="/login" replace />

  if (user.rol?.nombre === 'pendiente') {
    return <Navigate to="/pending" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.rol?.nombre)) {
    return <Navigate to="/" replace />
  }

  return children
}