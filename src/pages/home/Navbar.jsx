import { useState, useEffect } from 'react'
import { Link, useLocation }   from 'react-router-dom'
import { Sun, Moon, Gamepad2 } from 'lucide-react'

export default function Navbar({ isDark, toggleTheme }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()
  const isHome   = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`fixed top-0 z-50 w-full border-b transition-all duration-300 ${
      isScrolled || !isHome
        ? 'border-border/40 bg-background/80 py-3 backdrop-blur-md'
        : 'border-transparent bg-transparent py-5'
    }`}>
      <div className="container mx-auto flex items-center justify-between px-6">

        <Link to="/" className="text-xl font-bold tracking-tight hover:opacity-80 transition-opacity">
          Gameploy
        </Link>

        <div className="hidden gap-8 text-sm font-medium text-muted-foreground md:flex">
          {isHome ? (
            <a href="#inicio" className="transition-colors hover:text-foreground">Inicio</a>
          ) : null}
          <Link to="/games" className="transition-colors hover:text-foreground flex items-center gap-1.5">
            Juegos
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="rounded-full p-2 transition-colors hover:bg-muted"
            aria-label="Cambiar tema"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <Link
            to="/login"
            className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-200 hover:scale-105 hover:opacity-90"
          >
            Ingresar
          </Link>
        </div>
      </div>
    </nav>
  )
}