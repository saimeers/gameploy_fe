import { useEffect, useState } from 'react'
import { Users, Gamepad2, Eye, Clock, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { adminService } from '../services/admin.service'

export default function AdminDashboard() {
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminService.getStats()
      .then(res => setStats(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const cards = [
    { label: 'Usuarios activos',          value: stats?.totalUsers      ?? '—', icon: Users },
    { label: 'Proyectos publicados',       value: stats?.totalProjects   ?? '—', icon: Gamepad2 },
    { label: 'Visitas totales',            value: stats?.totalVisits     ?? '—', icon: Eye },
    { label: 'Pendientes de aprobación',   value: stats?.pendingUsers    ?? '—', icon: Clock },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Panel de administración</h1>
        <p className="text-sm text-muted-foreground">Vista general de la plataforma Gameploy.</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="border-border/50 bg-card/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription className="text-xs">{label}</CardDescription>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {loading ? <span className="animate-pulse">…</span> : value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top projects */}
      <Card className="border-border/50 bg-card/60">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm">Proyectos más visitados</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => (
                <div key={i} className="h-8 rounded bg-muted/40 animate-pulse" />
              ))}
            </div>
          ) : stats?.recentProjects?.length ? (
            <div className="space-y-1">
              {stats.recentProjects.map((p, i) => (
                <div key={p.id} className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-accent/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                    <span className="text-sm font-medium">{p.nombre}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(p.fecha_publicacion).toLocaleDateString('es-CO')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No hay proyectos publicados aún.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}