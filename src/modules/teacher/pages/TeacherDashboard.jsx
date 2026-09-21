import { useEffect, useState } from 'react'
import { Link }     from 'react-router-dom'
import { Search, MessageSquare, Star, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button }   from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'
import { teacherService } from '../services/teacher.service'

export default function TeacherDashboard() {
  const user = useAuthStore(s => s.user)
  const [evaluations, setEvaluations] = useState([])
  const [totalGames, setTotalGames]   = useState(0)
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    Promise.all([
      teacherService.getMyEvaluations(),
      teacherService.getPublicGames({ limit: 1 }),
    ])
      .then(([evRes, gamesRes]) => {
        setEvaluations(evRes.data.data)
        setTotalGames(gamesRes.data.meta?.total ?? 0)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">
          Hola, {user?.nombre?.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-muted-foreground">
          Explora y evalúa los Juegos Serios del semillero.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-border/50 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-xs">Juegos disponibles</CardDescription>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="bg-background text-popover-foreground">
            <p className="text-2xl font-bold">{loading ? '…' : totalGames}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-xs">Evaluaciones realizadas</CardDescription>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="bg-background text-popover-foreground">
            <p className="text-2xl font-bold">{loading ? '…' : evaluations.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="flex gap-3">
        <Link to="/teacher/explore">
          <Button size="sm" className="gap-2">
            <Search className="h-4 w-4" />
            Explorar juegos
          </Button>
        </Link>
        <Link to="/teacher/evaluations">
          <Button size="sm" variant="outline" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Mis evaluaciones
          </Button>
        </Link>
      </div>

      {/* Recent evaluations */}
      {evaluations.length > 0 && (
        <Card className="border-border/50 bg-card/60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Evaluaciones recientes</CardTitle>
              <Link to="/teacher/evaluations">
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                  Ver todas <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="bg-background text-popover-foreground space-y-3">
            {evaluations.slice(0, 3).map(ev => (
              <div key={ev.id} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{ev.nombre}</p>
                  <p className="text-xs text-muted-foreground truncate">{ev.mi_comentario?.contenido}</p>
                </div>
                {ev.mi_comentario?.calificacion && (
                  <div className="flex items-center gap-1 shrink-0">
                    <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs">{ev.mi_comentario.calificacion}</span>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}