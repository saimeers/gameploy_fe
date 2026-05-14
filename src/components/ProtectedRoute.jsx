import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { token, user } = useAuthStore()

  if (!token || !user) return <Navigate to="/login" replace />

  if (user.rol?.nombre === 'pendiente') {
    return <Navigate to="/pending" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.rol?.nombre)) {
    return <Navigate to="/" replace />
  }

  return children
}