import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import LoginForm from '../components/LoginForm'

export default function LoginPage() {
  return (
    <div className="relative flex min-h-svh w-full items-center justify-center p-6">

      <div className="fixed inset-0 bg-background">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(246,11%,22%,0.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(246,11%,22%,0.3)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(270,60%,52%,0.15),transparent)]" />
      </div>

      <div className="relative z-10 w-full max-w-sm space-y-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver al inicio
        </Link>

        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Gameploy</h1>
          <p className="text-sm text-muted-foreground">Semillero VIRAL</p>
        </div>

        <LoginForm />
      </div>
    </div>
  )
}