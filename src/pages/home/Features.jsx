const STATS = [
  { value: 'WebGL', label: 'Formato nativo Unity' },
  { value: '∞',     label: 'Versiones por proyecto' },
  { value: '1 URL', label: 'Enlace por juego' },
]

export default function Features() {
  return (
    <section id="funciones" className="py-20 px-6 border-t border-border/30">
      <div className="container mx-auto max-w-4xl">
        <div className="grid grid-cols-3 gap-8">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center space-y-1">
              <p className="text-3xl font-bold text-primary">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}