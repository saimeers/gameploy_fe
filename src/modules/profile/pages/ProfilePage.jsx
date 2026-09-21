import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Loader2, Pencil, Check, X, Mail, CalendarDays, FolderOpen,
  Eye, MessageSquare, Gamepad2, ExternalLink, Globe, Lock, Link2,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge }  from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input }  from '@/components/ui/input'
import { Label }  from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore }  from '@/store/authStore'
import { LIMITS }        from '@/lib/limits'
import { profileService } from '../services/profile.service'

const ROLE_LABELS = {
  admin:      { label: 'Administrador', class: 'bg-primary/20 text-primary border-primary/30' },
  estudiante: { label: 'Estudiante',    class: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  docente:    { label: 'Docente',       class: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  pendiente:  { label: 'Pendiente',     class: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
}

const VISIBILITY = {
  publico:    { label: 'Público',   icon: Globe },
  privado:    { label: 'Privado',   icon: Lock },
  por_enlace: { label: 'Por enlace', icon: Link2 },
}

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })
    : '—'

const initials = (nombre) =>
  nombre ? nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'

/** Tarjeta de un proyecto publicado, con su portada si la versión activa la tiene. */
function PublishedProject({ project }) {
  const [portadaUrl, setPortadaUrl] = useState(null)
  const portada = project.versiones?.[0]?.archivos?.[0]

  useEffect(() => {
    if (!portada?.ruta_storage) return
    let cancelled = false
    profileService.getFileUrl(portada.ruta_storage)
      .then(res => { if (!cancelled) setPortadaUrl(res.data.data.url) })
      .catch(() => { /* la tarjeta se queda con el icono */ })
    return () => { cancelled = true }
  }, [portada])

  const VisIcon = VISIBILITY[project.visibilidad]?.icon ?? Globe

  return (
    <Card className="overflow-hidden border-border/50 bg-card/60 transition-colors hover:border-primary/40">
      <div className="flex h-28 items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 to-accent/20">
        {portadaUrl
          ? <img src={portadaUrl} alt={project.nombre} className="h-full w-full object-cover" />
          : <Gamepad2 className="h-8 w-8 text-primary/30" />}
      </div>

      <CardHeader className="px-4 pt-3 pb-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-sm font-semibold">{project.nombre}</p>
          <a
            href={`/games/${project.slug}`}
            target="_blank"
            rel="noreferrer"
            title="Ver la ficha pública"
            className="shrink-0 text-muted-foreground hover:text-primary"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {project.descripcion || 'Sin descripción'}
        </p>
      </CardHeader>

      <CardContent className="space-y-2 px-4 pb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {project.categoria && (
            <span className="rounded-full border border-border/50 px-2 py-0.5 text-[10px] text-muted-foreground">
              {project.categoria.nombre}
            </span>
          )}
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <VisIcon className="h-3 w-3" />
            {VISIBILITY[project.visibilidad]?.label ?? project.visibilidad}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {project._count?.visitas ?? 0}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            {project._count?.comentarios ?? 0}
          </span>
          <span className="ml-auto">{formatDate(project.fecha_publicacion)}</span>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [nombre, setNombre]   = useState('')

  const storedUser = useAuthStore(s => s.user)
  const token      = useAuthStore(s => s.token)
  const photoURL   = useAuthStore(s => s.photoURL)
  const setAuth    = useAuthStore(s => s.setAuth)

  const loadProfile = useCallback(
    () => profileService.getProfile().then(res => res.data.data),
    []
  )

  useEffect(() => {
    let cancelled = false
    loadProfile()
      .then(data => { if (!cancelled) setProfile(data) })
      .catch(() => { if (!cancelled) toast.error('Error al cargar el perfil') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [loadProfile])

  const startEditing = () => {
    setNombre(profile.nombre)
    setEditing(true)
  }

  const handleSave = async () => {
    const limpio = nombre.trim()
    if (!limpio) {
      toast.error('El nombre no puede quedar vacío')
      return
    }

    setSaving(true)
    try {
      const res = await profileService.updateProfile({ nombre: limpio })
      const actualizado = res.data.data
      setProfile(prev => ({ ...prev, nombre: actualizado.nombre }))
      // La barra lateral lee el usuario de la sesión, no del perfil
      setAuth(token, { ...storedUser, nombre: actualizado.nombre }, photoURL)
      toast.success('Perfil actualizado')
      setEditing(false)
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'No se pudo actualizar el perfil')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!profile) return null

  const rol = ROLE_LABELS[profile.rol?.nombre] ?? { label: profile.rol?.nombre, class: '' }
  const publicados = profile.proyectos ?? []

  return (
    <div className="max-w-3xl space-y-5">

      {/* Datos básicos */}
      <Card className="border-border/50 bg-card/60">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <Avatar className="h-16 w-16 shrink-0 rounded-lg">
              {(profile.foto_perfil || photoURL) && (
                <AvatarImage
                  src={profile.foto_perfil || photoURL}
                  alt={profile.nombre}
                  referrerPolicy="no-referrer"
                />
              )}
              <AvatarFallback className="rounded-lg bg-primary/20 text-lg font-semibold text-primary">
                {initials(profile.nombre)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1 space-y-3">
              {editing ? (
                <div className="space-y-1.5">
                  <Label htmlFor="nombre" className="text-xs">Nombre</Label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      id="nombre"
                      className="h-9 flex-1"
                      maxLength={LIMITS.nombreUsuario}
                      value={nombre}
                      onChange={e => setNombre(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleSave()
                        if (e.key === 'Escape') setEditing(false)
                      }}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" className="h-9 gap-1.5" disabled={saving} onClick={handleSave}>
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        Guardar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 gap-1.5"
                        disabled={saving}
                        onClick={() => setEditing(false)}
                      >
                        <X className="h-4 w-4" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="truncate text-xl font-semibold">{profile.nombre}</h1>
                  <Badge variant="outline" className={`text-xs ${rol.class}`}>{rol.label}</Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    title="Editar nombre"
                    onClick={startEditing}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}

              <div className="space-y-1 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  {profile.correo}
                </p>
                <p className="flex items-center gap-2">
                  <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                  En el semillero desde {formatDate(profile.fecha_registro)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3 border-t border-border/40 pt-4">
            {[
              { label: 'Publicados', value: publicados.length, icon: Gamepad2 },
              { label: 'Proyectos',  value: profile._count?.proyectos ?? 0, icon: FolderOpen },
              { label: 'Comentarios hechos', value: profile._count?.comentarios ?? 0, icon: MessageSquare },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon className="h-4 w-4 shrink-0 text-primary" />
                <div className="leading-tight">
                  <p className="text-sm font-semibold">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Proyectos publicados */}
      <Card className="border-border/50 bg-card/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Proyectos publicados</CardTitle>
        </CardHeader>
        <CardContent>
          {publicados.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <FolderOpen className="h-8 w-8 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                Todavía no has publicado ningún Juego Serio.
              </p>
              {profile.rol?.nombre === 'estudiante' && (
                <Link to="/student">
                  <Button variant="outline" size="sm">Ir a mis proyectos</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {publicados.map(project => (
                <PublishedProject key={project.id} project={project} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
