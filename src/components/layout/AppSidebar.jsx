import {
  LayoutDashboard, FolderOpen, Plus, Search,
  MessageSquare, Users, Settings, Gamepad2,
} from 'lucide-react'
import {
  Sidebar, SidebarContent, SidebarFooter,
  SidebarHeader, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, SidebarRail,
} from '@/components/ui/sidebar'
import { NavMain } from './NavMain'
import { NavUser } from './NavUser'
import { useAuthStore } from '@/store/authStore'

// Nav items por rol
const navByRole = {
  estudiante: [
    {
      title: 'Mis proyectos',
      url: '/student',
      icon: FolderOpen,
    },
    {
      title: 'Nuevo proyecto',
      url: '/student/new',
      icon: Plus,
    },
  ],
  docente: [
    {
      title: 'Explorar',
      url: '/teacher',
      icon: Search,
    },
    {
      title: 'Mis evaluaciones',
      url: '/teacher/evaluations',
      icon: MessageSquare,
    },
  ],
  admin: [
    {
      title: 'Dashboard',
      url: '/admin',
      icon: LayoutDashboard,
    },
    {
      title: 'Usuarios',
      url: '/admin/users',
      icon: Users,
    },
    {
      title: 'Proyectos',
      url: '/admin/projects',
      icon: Gamepad2,
    },
  ],
}

const labelByRole = {
  estudiante: 'Estudiante',
  docente:    'Docente',
  admin:      'Administración',
}

export function AppSidebar({ ...props }) {
  const user = useAuthStore(s => s.user)
  const role = user?.rol?.nombre ?? 'estudiante'
  const navItems = navByRole[role] ?? []
  const label = labelByRole[role] ?? 'Menú'

  return (
    <Sidebar collapsible="icon" {...props}>

      {/* Header — logo */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                  <img  src="/logo_gameploy.svg" alt="Logo" width={32} height={32} />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Gameploy</span>
                  <span className="truncate text-xs text-muted-foreground capitalize">{role}</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Nav items */}
      <SidebarContent>
        <NavMain items={navItems} label={label} />
      </SidebarContent>

      {/* User footer */}
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}