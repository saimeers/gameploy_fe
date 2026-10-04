import { Link } from 'react-router-dom'
import { surveyHref } from '@/modules/survey/invite'

export default function Footer() {
  return (
    <footer className="border-t border-border/40 py-8 px-6">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>© {new Date().getFullYear()} Gameploy — Semillero VIRAL</span>
        <Link to={surveyHref('voluntaria', '/')} className="font-medium text-primary hover:underline">
          Danos tu opinión
        </Link>
        <span>Desarrollado con fines de investigación académica</span>
      </div>
    </footer>
  )
}