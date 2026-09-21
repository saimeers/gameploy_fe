import { Link } from 'react-router-dom'
import { ChevronsUpDown, LogOut, User, Sun, Moon } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from '@/components/ui/sidebar'
import { useTheme }     from '@/components/theme-context'
import { useAuth }      from '@/modules/auth/hooks/useAuth'
import { useAuthStore } from '@/store/authStore'

function UserAvatar({ nombre, photoURL, className = "h-8 w-8 rounded-lg" }) {
  const initials = nombre
    ? nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <Avatar className={className}>
      {photoURL && <AvatarImage src={photoURL} alt={nombre} referrerPolicy="no-referrer" />}
      <AvatarFallback className="rounded-lg bg-primary/20 text-primary text-xs font-semibold">
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}

export function NavUser({ user }) {
  const { isMobile }        = useSidebar()
  const { logout }          = useAuth()
  const { theme, setTheme } = useTheme()
  const photoURL            = useAuthStore(s => s.photoURL)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <UserAvatar nombre={user?.nombre} photoURL={photoURL} />
              <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user?.nombre}</span>
                  <span className="truncate text-xs text-muted-foreground">{user?.correo}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <UserAvatar nombre={user?.nombre} photoURL={photoURL} />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium normal-case">{user?.nombre}</span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link to="/profile" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                Mi perfil
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1">
              Apariencia
            </DropdownMenuLabel>

            <DropdownMenuItem onClick={() => setTheme('light')}>
              <Sun className="mr-2 h-4 w-4" />
              Claro
              {theme === 'light' && <span className="ml-auto text-xs text-primary">✓</span>}
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => setTheme('dark')}>
              <Moon className="mr-2 h-4 w-4" />
              Oscuro
              {theme === 'dark' && <span className="ml-auto text-xs text-primary">✓</span>}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={logout}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}