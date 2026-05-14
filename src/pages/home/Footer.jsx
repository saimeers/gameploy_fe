export default function Footer() {
  return (
    <footer className="border-t border-border/40 py-8 px-6">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>© {new Date().getFullYear()} Gameploy — Semillero VIRAL</span>
        <span>Desarrollado con fines de investigación académica</span>
      </div>
    </footer>
  )
}