import { Outlet, useLocation } from 'react-router-dom'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { AppSidebar } from './AppSidebar'

const breadcrumbMap = {
    '/student': 'Mis proyectos',
    '/student/new': 'Nuevo proyecto',
    '/teacher': 'Inicio',
    '/teacher/explore': 'Explorar juegos',
    '/teacher/evaluations': 'Mis evaluaciones',
    '/admin': 'Dashboard',
    '/admin/users': 'Usuarios',
    '/admin/projects': 'Proyectos',
    '/admin/catalog': 'Catálogo',
}

export default function DashboardLayout() {
    const { pathname } = useLocation()
    const pageTitle = breadcrumbMap[pathname] ?? 'Gameploy'

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>

                {/* Topbar */}
                <header className="flex h-14 shrink-0 items-center border-b border-border/50 px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger className="-ml-1" />
                        <span className="text-sm font-medium text-muted-foreground">
                            {pageTitle}
                        </span>
                    </div>
                </header>

                {/* Page content */}
                <div className="flex flex-1 flex-col gap-4 p-4 pt-4">
                    <Outlet />
                </div>

            </SidebarInset>
        </SidebarProvider>
    )
}