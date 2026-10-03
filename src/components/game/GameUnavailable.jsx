import { Link } from 'react-router-dom'
import { Gamepad2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const MESSAGES = {
  not_found: {
    title: 'Proyecto no encontrado',
    text: 'El enlace puede haber expirado o el proyecto fue eliminado.',
  },
  forbidden: {
    title: 'Proyecto no disponible',
    text: 'Este proyecto no está publicado o su acceso es privado.',
  },
  failed: {
    title: 'No se pudo cargar el proyecto',
    text: 'Revisa tu conexión e inténtalo de nuevo.',
  },
}

/** Pantalla de un juego que no existe, no se puede ver o no cargó. */
export default function GameUnavailable({ reason }) {
  const { title, text } = MESSAGES[reason] ?? MESSAGES.failed
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <Gamepad2 className="h-12 w-12 text-muted-foreground/30" />
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="text-sm text-muted-foreground">{text}</p>
      <Link to="/"><Button variant="outline">Ir al inicio</Button></Link>
    </div>
  )
}
