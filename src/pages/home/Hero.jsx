import { Link }          from 'react-router-dom'
import TextPressure      from '@/components/TextPressure'
import RotatingText      from '@/components/RotatingText'

export default function Hero() {
  return (
    <section id="inicio" className="min-h-screen flex items-center justify-center px-6 pt-16">
      <div className="max-w-4xl mx-auto text-center space-y-10">

        <div className="relative w-full h-[clamp(4rem,18vw,12rem)]">
          <TextPressure
            text="Gameploy"
            flex={true}
            alpha={false}
            stroke={false}
            width={true}
            weight={true}
            italic={true}
            textColor="currentColor"
            minFontSize={48}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-xl sm:text-2xl font-medium text-muted-foreground">
          <span>Plataforma para</span>
          <RotatingText
            texts={['desplegar', 'gestionar', 'evaluar', 'compartir']}
            mainClassName="px-3 py-1 bg-primary text-primary-foreground rounded-md overflow-hidden"
            staggerFrom="last"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-120%' }}
            staggerDuration={0.03}
            splitLevelClassName="overflow-hidden"
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            rotationInterval={2200}
          />
          <span>Juegos Serios</span>
        </div>

        <p className="text-base text-muted-foreground leading-relaxed max-w-xl mx-auto">
          Gameploy es la plataforma del Semillero VIRAL para publicar, compartir y evaluar
          Juegos Serios desarrollados por estudiantes e investigadores, con acceso directo
          desde el navegador.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/register"
            className="bg-primary text-primary-foreground px-8 py-3 rounded-md font-medium text-sm hover:opacity-90 hover:scale-105 transition-all duration-200 shadow-md w-full sm:w-auto text-center"
          >
            Comenzar ahora
          </Link>
          <Link
            to="/login"
            className="border border-border/60 bg-background/40 px-8 py-3 rounded-md font-medium text-sm hover:bg-accent/30 transition-colors w-full sm:w-auto text-center"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    </section>
  )
}