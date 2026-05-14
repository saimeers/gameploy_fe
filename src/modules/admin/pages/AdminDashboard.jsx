import { Users, Gamepad2, Eye, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'

export default function AdminDashboard() {
  const stats = [
    { label: 'Usuarios activos',       value: '—', icon: Users },
    { label: 'Proyectos publicados',   value: '—', icon: Gamepad2 },
    { label: 'Visitas totales',        value: '—', icon: Eye },
    { label: 'Pendientes de aprobación', value: '—', icon: Clock },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Panel de administración</h1>
        <p className="text-sm text-muted-foreground">Vista general de la plataforma.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
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
    </div>
  )
}