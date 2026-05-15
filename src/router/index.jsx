import { createBrowserRouter } from 'react-router-dom'
import HomePage             from '@/pages/HomePage'
import LoginPage            from '@/modules/auth/pages/LoginPage'
import RegisterPage         from '@/modules/auth/pages/RegisterPage'
import ForgotPasswordPage   from '@/modules/auth/pages/ForgotPasswordPage'
import ResetPasswordPage    from '@/modules/auth/pages/ResetPasswordPage'
import PendingPage          from '@/pages/PendingPage'
import DashboardLayout      from '@/components/layout/DashboardLayout'
import ProtectedRoute       from '@/components/ProtectedRoute'
import ErrorPage            from '@/components/ErrorPage'

// Student
import StudentDashboard     from '@/modules/student/pages/StudentDashboard'
import NewProjectPage     from '@/modules/student/pages/NewProjectPage'
import ProjectDetailPage  from '@/modules/student/pages/ProjectDetailPage'

// Teacher
import TeacherDashboard     from '@/modules/teacher/pages/TeacherDashboard'
import ExplorePage          from '@/modules/teacher/pages/ExplorePage'

// Admin
import AdminDashboard       from '@/modules/admin/pages/AdminDashboard'
import UsersPage            from '@/modules/admin/pages/UsersPage'
import ProjectsAdminPage    from '@/modules/admin/pages/ProjectsAdminPage'

export const router = createBrowserRouter([
  { path: '/',                 element: <HomePage /> },
  { path: '/login',            element: <LoginPage /> },
  { path: '/register',         element: <RegisterPage /> },
  { path: '/forgot-password',  element: <ForgotPasswordPage /> },
  { path: '/reset-password',   element: <ResetPasswordPage /> },
  { path: '/pending',          element: <PendingPage /> },

  // Student
  {
    element: <ProtectedRoute allowedRoles={['estudiante']}><DashboardLayout /></ProtectedRoute>,
    children: [
      { path: '/student',                   element: <StudentDashboard /> },
      { path: '/student/new',               element: <NewProjectPage /> },
      { path: '/student/projects/:id',      element: <ProjectDetailPage /> },
    ],
  },

  // Teacher
  {
    element: <ProtectedRoute allowedRoles={['docente']}><DashboardLayout /></ProtectedRoute>,
    children: [
      { path: '/teacher',              element: <TeacherDashboard /> },
      { path: '/teacher/evaluations',  element: <ExplorePage /> },
    ],
  },

  // Admin
  {
    element: <ProtectedRoute allowedRoles={['admin']}><DashboardLayout /></ProtectedRoute>,
    children: [
      { path: '/admin',          element: <AdminDashboard /> },
      { path: '/admin/users',    element: <UsersPage /> },
      { path: '/admin/projects', element: <ProjectsAdminPage /> },
    ],
  },

  // Error
  { 
    path: '*', 
    element: <ErrorPage /> 
  }
])