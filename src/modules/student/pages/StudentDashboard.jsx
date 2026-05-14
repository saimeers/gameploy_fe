import { FolderOpen, Plus, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store/authStore'

export default function StudentDashboard() {
  const user = useAuthStore(s => s.user)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Hola, {user?.nombre?.split(' ')[0]} 👋</h1>
        <p className="text-sm text-muted-foreground">Gestiona tus Juegos Serios desde aquí.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Proyectos publicados', value: '—', icon: FolderOpen },
          { label: 'Total de visitas',     value: '—', icon: Eye },
          { label: 'Comentarios recibidos',value: '—', icon: Plus },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label} className="border-border/50 bg-card/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription className="text-xs">{label}</CardDescription>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/50 bg-card/60">
        <CardHeader>
          <CardTitle className="text-sm">Mis proyectos</CardTitle>
          <CardDescription className="text-xs">Aún no tienes proyectos publicados.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link to="/student/new">
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Crear primer proyecto
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}