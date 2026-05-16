import { useEffect, useState } from 'react'
import { Link }     from 'react-router-dom'
import { Star, Gamepad2, ExternalLink, Calendar, Loader2 } from 'lucide-react'
import { Badge }  from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { teacherService } from '../services/teacher.service'

export default function EvaluationsPage() {
  const [evaluations, setEvaluations] = useState([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    teacherService.getMyEvaluations()
      .then(res => setEvaluations(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  )

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Mis evaluaciones</h1>
        <p className="text-sm text-muted-foreground">
          Proyectos que has evaluado — {evaluations.length} en total.
        </p>
      </div>

      {evaluations.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-2 text-center">
          <Star className="h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            Aún no has evaluado ningún proyecto.
          </p>
          <Link to="/teacher/explore">
            <Button size="sm" variant="outline">Explorar juegos</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {evaluations.map(ev => (
            <Card key={ev.id} className="border-border/50 bg-card/60">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm">{ev.nombre}</p>
                      {ev.categoria && (
                        <Badge variant="outline" className="text-xs border-border/50 text-muted-foreground">
                          {ev.categoria.nombre}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{ev.usuario?.nombre}</p>
                  </div>
                  <a href={`/games/${ev.slug}`} target="_blank" rel="noreferrer">
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </a>
                </div>
              </CardHeader>

              <CardContent className="bg-background text-popover-foreground space-y-2">
                {/* My comment */}
                <div className="rounded-lg border border-border/40 bg-background/40 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground">Tu evaluación</p>
                    <div className="flex items-center gap-1">
                      {ev.mi_comentario?.calificacion
                        ? Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${i < ev.mi_comentario.calificacion ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/20'}`}
                          />
                        ))
                        : <span className="text-xs text-muted-foreground">Sin calificación</span>
                      }
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{ev.mi_comentario?.contenido}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(ev.mi_comentario?.fecha).toLocaleDateString('es-CO')}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}