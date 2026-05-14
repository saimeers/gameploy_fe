import { Gamepad2, Users, LinkIcon } from 'lucide-react'

const items = [
  {
    icon: Gamepad2,
    title: 'Juegos Serios',
    description:
      'Aloja y comparte prototipos de Juegos Serios desarrollados en el semillero, accesibles directamente desde el navegador sin instalación.',
  },
  {
    icon: LinkIcon,
    title: 'URLs únicas',
    description:
      'Cada juego publicado recibe un enlace estable y compartible que puedes enviar a docentes, evaluadores o usuarios externos.',
  },
  {
    icon: Users,
    title: 'Evaluación colaborativa',
    description:
      'Recibe retroalimentación estructurada de docentes y evaluadores con calificaciones y comentarios por proyecto.',
  },
]

export default function About() {
  return (
    <section id="sobre" className="py-24 px-6">
      <div className="max-w-4xl mx-auto space-y-16">

        <div className="text-center space-y-3">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">
            Sobre la plataforma
          </p>
          <h2 className="text-3xl font-bold tracking-tight">
            Todo lo que necesita el semillero
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm leading-relaxed">
            Una infraestructura centralizada para que los estudiantes publiquen sus proyectos
            y los evaluadores los accedan sin fricción.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {items.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-xl border border-border/50 bg-card/60 p-6 space-y-3 backdrop-blur-sm"
            >
              <div className="rounded-lg bg-primary/10 p-2 w-fit">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-sm">{title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}