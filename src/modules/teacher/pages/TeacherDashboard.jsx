import { Search, MessageSquare } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { useAuthStore } from '@/store/authStore'

export default function TeacherDashboard() {
  const user = useAuthStore(s => s.user)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Hola, {user?.nombre?.split(' ')[0]} 👋</h1>
        <p className="text-sm text-muted-foreground">Explora y evalúa los Juegos Serios del semillero.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { label: 'Proyectos disponibles', value: '—', icon: Search },
          { label: 'Evaluaciones realizadas', value: '—', icon: MessageSquare },
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
    </div>
  )
}