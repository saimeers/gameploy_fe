import { createBrowserRouter } from 'react-router-dom'

import HomePage            from '@/pages/HomePage'
import LoginPage           from '@/modules/auth/pages/LoginPage'
import RegisterPage        from '@/modules/auth/pages/RegisterPage'
import StudentDashboard    from '@/modules/student/pages/StudentDashboard'
import TeacherDashboard    from '@/modules/teacher/pages/TeacherDashboard'
import AdminDashboard      from '@/modules/admin/pages/AdminDashboard'
import ProtectedRoute      from '@/components/ProtectedRoute'

export const router = createBrowserRouter([
  { path: '/',          element: <HomePage /> },
  { path: '/login',     element: <LoginPage /> },
  { path: '/register',  element: <RegisterPage /> },
  {
    path: '/student',
    element: <ProtectedRoute allowedRoles={['estudiante']}><StudentDashboard /></ProtectedRoute>,
  },
  {
    path: '/teacher',
    element: <ProtectedRoute allowedRoles={['docente']}><TeacherDashboard /></ProtectedRoute>,
  },
  {
    path: '/admin',
    element: <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>,
  },
])