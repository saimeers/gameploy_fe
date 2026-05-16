import { useEffect, useState, useCallback } from 'react'
import {
  CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight,
  Search, MoreHorizontal, ShieldCheck, UserX, UserCheck,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { adminService } from '../services/admin.service'

const ROLE_LABELS = {
  admin: { label: 'Admin', class: 'bg-primary/20 text-primary border-primary/30' },
  estudiante: { label: 'Estudiante', class: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  docente: { label: 'Docente', class: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  pendiente: { label: 'Pendiente', class: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
}

function RoleBadge({ rol }) {
  const cfg = ROLE_LABELS[rol] ?? { label: rol, class: '' }
  return (
    <Badge variant="outline" className={`text-xs ${cfg.class}`}>
      {cfg.label}
    </Badge>
  )
}

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterRol, setFilterRol] = useState('all')
  const [confirm, setConfirm] = useState(null) // { type, user }
  const limit = 10

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminService.getUsers({ page, limit })
      setUsers(res.data.data)
      setTotal(res.data.meta.total)
    } catch {
      toast.error('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const filtered = users.filter(u => {
    const matchSearch = u.nombre.toLowerCase().includes(search.toLowerCase())
      || u.correo.toLowerCase().includes(search.toLowerCase())
    const matchRol = filterRol === 'all' || u.rol?.nombre === filterRol
    return matchSearch && matchRol
  })

  const handleApprove = async (user) => {
    try {
      await adminService.approveUser(user.id)
      toast.success(`${user.nombre} aprobado`)
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Error al aprobar')
    }
  }

  const handleRole = async (userId, rol) => {
    try {
      await adminService.updateRole(userId, rol)
      toast.success('Rol actualizado')
      fetchUsers()
    } catch {
      toast.error('Error al actualizar rol')
    }
  }

  const handleToggleStatus = async (user) => {
    try {
      await adminService.toggleStatus(user.id, !user.activo)
      toast.success(user.activo ? 'Usuario desactivado' : 'Usuario activado')
      fetchUsers()
    } catch {
      toast.error('Error al cambiar estado')
    }
    setConfirm(null)
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Usuarios</h1>
        <p className="text-sm text-muted-foreground">Gestiona los usuarios de la plataforma.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o correo..."
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterRol} onValueChange={setFilterRol}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Todos los roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pendiente">Pendiente</SelectItem>
            <SelectItem value="estudiante">Estudiante</SelectItem>
            <SelectItem value="docente">Docente</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="text-xs">Usuario</TableHead>
              <TableHead className="text-xs">Rol</TableHead>
              <TableHead className="text-xs">Estado</TableHead>
              <TableHead className="text-xs">Registro</TableHead>
              <TableHead className="text-xs w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 rounded bg-muted/40 animate-pulse" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-10">
                  No se encontraron usuarios.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(user => (
                <TableRow key={user.id} className="hover:bg-accent/20">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-7 w-7 rounded-md">
                        {user.foto_perfil ? (
                          <img
                            src={user.foto_perfil}
                            alt={user.nombre}
                            className="h-full w-full object-cover rounded-md"
                          />
                        ) : (
                          <AvatarFallback className="rounded-md bg-primary/20 text-primary text-xs">
                            {user.nombre
                              .split(' ')
                              .map(n => n[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user.nombre}</p>
                        <p className="text-xs text-muted-foreground">{user.correo}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <RoleBadge rol={user.rol?.nombre} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {user.activo
                        ? <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                        : <XCircle className="h-3.5 w-3.5 text-destructive" />}
                      <span className="text-xs text-muted-foreground">
                        {user.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {new Date(user.fecha_registro).toLocaleDateString('es-CO')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">

                        {user.rol?.nombre === 'pendiente' ? (
                          <>
                            <DropdownMenuItem onClick={() => handleApprove(user)}>
                              <ShieldCheck className="mr-2 h-4 w-4 text-emerald-500" />
                              Aprobar ({user.rol_solicitado ?? 'usuario'})
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => setConfirm({ type: 'reject', user })}
                              className="text-destructive focus:text-destructive"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Rechazar
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <>
                            {['estudiante', 'docente', 'admin'].map(rol => (
                              user.rol?.nombre !== rol && (
                                <DropdownMenuItem
                                  key={rol}
                                  onClick={() => handleRole(user.id, rol)}
                                >
                                  <ShieldCheck className="mr-2 h-4 w-4" />
                                  Hacer {rol}
                                </DropdownMenuItem>
                              )
                            ))}

                            <DropdownMenuSeparator />

                            {/* Activar / Desactivar */}
                            <DropdownMenuItem
                              onClick={() => setConfirm({ type: 'status', user })}
                              className={user.activo ? 'text-destructive focus:text-destructive' : ''}
                            >
                              {user.activo ? (
                                <>
                                  <UserX className="mr-2 h-4 w-4" />
                                  Desactivar
                                </>
                              ) : (
                                <>
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Activar
                                </>
                              )}
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{total} usuario{total !== 1 ? 's' : ''} en total</span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline" size="icon" className="h-7 w-7"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <span>{page} / {totalPages || 1}</span>
          <Button
            variant="outline" size="icon" className="h-7 w-7"
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Confirm dialog */}
      <AlertDialog open={!!confirm} onOpenChange={() => setConfirm(null)}>
        <AlertDialogContent className="bg-background text-popover-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm?.user?.activo ? 'Desactivar usuario' : 'Activar usuario'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm?.user?.activo
                ? `${confirm?.user?.nombre} no podrá acceder a la plataforma.`
                : `${confirm?.user?.nombre} recuperará el acceso a la plataforma.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleToggleStatus(confirm.user)}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}