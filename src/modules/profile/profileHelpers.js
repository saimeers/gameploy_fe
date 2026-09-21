import { Globe, Lock, Link2 } from 'lucide-react'

/** Etiquetas y color de cada rol. */
export const ROLE_LABELS = {
  admin:      { label: 'Administrador', class: 'bg-primary/20 text-primary border-primary/30' },
  estudiante: { label: 'Estudiante',    class: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  docente:    { label: 'Docente',       class: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  pendiente:  { label: 'Pendiente',     class: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
}

/** Etiqueta e icono de cada visibilidad de proyecto. */
export const VISIBILITY = {
  publico:    { label: 'Público',    icon: Globe },
  privado:    { label: 'Privado',    icon: Lock },
  por_enlace: { label: 'Por enlace', icon: Link2 },
}

export const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })
    : '—'

/** Iniciales para el avatar cuando no hay foto. */
export const initials = (nombre) =>
  nombre ? nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'
