import { Upload, Eye, Star, BarChart2 } from 'lucide-react'

const features = [
  { icon: Upload,   title: 'Publica tu juego',        description: 'Sube tu proyecto WebGL desde Unity en segundos y obtén tu URL propia.' },
  { icon: Eye,      title: 'Acceso desde el navegador', description: 'Los evaluadores juegan directamente en Chrome, Firefox o Edge, sin instalar nada.' },
  { icon: Star,     title: 'Retroalimentación',        description: 'Comentarios y calificaciones de docentes disponibles en tu panel de proyecto.' },
  { icon: BarChart2,title: 'Métricas de visitas',      description: 'Consulta cuántas personas han accedido a tu juego y desde dónde.' },
]

export default function Features() {
  return (
    <section id="funciones" className="py-24 px-6">
      <div className="max-w-4xl mx-auto space-y-16">

        <div className="text-center space-y-3">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">
            Funciones
          </p>
          <h2 className="text-3xl font-bold tracking-tight">
            Diseñado para investigadores
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex gap-4 rounded-xl border border-border/50 bg-card/60 p-5 backdrop-blur-sm"
            >
              <div className="shrink-0 rounded-lg bg-primary/10 p-2 h-fit">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}