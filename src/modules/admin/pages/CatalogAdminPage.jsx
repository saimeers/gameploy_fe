import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Loader2, Tag, LayoutGrid, EyeOff, Eye, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import HoldConfirmDialog from '@/components/HoldConfirmDialog'
import { cn } from '@/lib/utils'
import api from '@/services/api'
import { LIMITS } from '@/lib/limits'

/** "Ningún proyecto la usa", "En 1 proyecto", "En 3 proyectos". */
const usageLabel = (n) =>
    n === 0 ? 'Ningún proyecto la usa' : `En ${n} proyecto${n !== 1 ? 's' : ''}`

function CrudSection({ type, label, icon: Icon, fetchFn, createFn, updateFn, setStatusFn, deleteFn }) {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [dialog, setDialog] = useState(null)
    const [toDelete, setToDelete] = useState(null)
    const [toDeactivate, setToDeactivate] = useState(null)
    const [saving, setSaving] = useState(false)

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm()

    const load = useCallback(() => fetchFn().then(res => res.data.data), [fetchFn])

    useEffect(() => {
        let cancelled = false
        load()
            .then(data => { if (!cancelled) setItems(data) })
            .catch(() => { if (!cancelled) toast.error(`Error al cargar ${label}`) })
            .finally(() => { if (!cancelled) setLoading(false) })
        return () => { cancelled = true }
    }, [load, label])

    const refresh = async () => {
        try { setItems(await load()) }
        catch { toast.error(`Error al cargar ${label}`) }
    }

    const openCreate = () => {
        reset(type !== 'etiqueta'
            ? { nombre: '', descripcion: '' }
            : { nombre: '' }
        )
        setDialog({ mode: 'create' })
    }

    const openEdit = (item) => {
        setValue('nombre', item.nombre)
        if (type !== 'etiqueta') {
            setValue('descripcion', item.descripcion ?? '')
        }
        setDialog({ mode: 'edit', item })
    }

    const onSubmit = async (data) => {
        setSaving(true)
        try {
            if (dialog.mode === 'create') {
                await createFn(data)
                toast.success(`${label} creada`)
            } else {
                await updateFn(dialog.item.id, data)
                toast.success(`${label} actualizada`)
            }
            setDialog(null)
            refresh()
        } catch (err) {
            toast.error(err.response?.data?.message ?? 'Error al guardar')
        } finally { setSaving(false) }
    }

    const handleDelete = async (item) => {
        setToDelete(null)
        try {
            await deleteFn(item.id)
            toast.success(`${label} eliminada`)
            refresh()
        } catch (err) {
            toast.error(err.response?.status === 409
                ? 'Está en uso por algún proyecto: desactívala en su lugar'
                : 'No se pudo eliminar')
        }
    }

    const handleStatus = async (item, activo) => {
        setToDeactivate(null)
        try {
            await setStatusFn(item.id, activo)
            toast.success(`${label} ${activo ? 'activada' : 'desactivada'}`)
            refresh()
        } catch {
            toast.error('No se pudo cambiar el estado')
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{items.length} {label.toLowerCase()}(s)</p>
                <Button size="sm" className="gap-2" onClick={openCreate}>
                    <Plus className="h-4 w-4" />
                    Nueva {label.toLowerCase()}
                </Button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-10">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
            ) : items.length === 0 ? (
                <div className="flex flex-col items-center py-10 gap-2">
                    <Icon className="h-8 w-8 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">No hay {label.toLowerCase()}s aún.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {items.map(item => {
                        const usage = item._count?.proyectos ?? 0
                        return (
                            <div
                                key={item.id}
                                className={cn(
                                    'flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-card/60 px-4 py-3',
                                    !item.activo && 'border-dashed bg-transparent',
                                )}
                            >
                                <div className={cn('min-w-0 space-y-1', !item.activo && 'opacity-60')}>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="text-sm font-medium">{item.nombre}</p>
                                        {!item.activo && (
                                            <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                                                Desactivada
                                            </span>
                                        )}
                                    </div>
                                    {item.descripcion && (
                                        <p className="text-xs text-muted-foreground">{item.descripcion}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        {usageLabel(usage)}
                                    </p>
                                </div>
                                <div className="flex shrink-0 items-center gap-1">
                                    <Button variant="ghost" size="icon-xs" title="Editar" aria-label={`Editar ${item.nombre}`} onClick={() => openEdit(item)}>
                                        <Pencil />
                                    </Button>
                                    {item.activo ? (
                                        <Button
                                            variant="ghost"
                                            size="icon-xs"
                                            className="text-amber-500 hover:text-amber-500"
                                            title="Desactivar"
                                            aria-label={`Desactivar ${item.nombre}`}
                                            onClick={() => setToDeactivate(item)}
                                        >
                                            <EyeOff />
                                        </Button>
                                    ) : (
                                        <Button variant="ghost" size="xs" onClick={() => handleStatus(item, true)}>
                                            <Eye /> Activar
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon-xs"
                                        className="text-destructive hover:text-destructive disabled:opacity-30"
                                        title={usage > 0 ? 'En uso: desactívala en su lugar' : 'Eliminar'}
                                        aria-label={`Eliminar ${item.nombre}`}
                                        disabled={usage > 0}
                                        onClick={() => setToDelete(item)}
                                    >
                                        <Trash2 />
                                    </Button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Create/Edit dialog */}
            <Dialog open={!!dialog} onOpenChange={() => setDialog(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {dialog?.mode === 'create' ? `Nueva ${label.toLowerCase()}` : `Editar ${label.toLowerCase()}`}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                        <div className="space-y-1.5">
                            <Label>Nombre *</Label>
                            <Input
                                maxLength={LIMITS.nombreCatalogo}
                                {...register('nombre', { required: 'El nombre es requerido' })}
                                disabled={saving}
                            />
                            {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
                        </div>
                        {type !== 'etiqueta' && (
                            <div className="space-y-1.5">
                                <Label>Descripción</Label>
                                <Input
                                    maxLength={LIMITS.descripcionCatalogo}
                                    {...register('descripcion')}
                                    disabled={saving}
                                />
                            </div>
                        )}
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setDialog(null)} disabled={saving}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={saving}>
                                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Guardar
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Desactivar */}
            <HoldConfirmDialog
                open={!!toDeactivate}
                onOpenChange={() => setToDeactivate(null)}
                tone="warning"
                title={`Desactivar ${label.toLowerCase()}`}
                description="Deja de ofrecerse en los formularios y en los filtros del catálogo. Los proyectos que ya la usan la conservan, y puedes volver a activarla cuando quieras."
                label="Mantén pulsado para desactivar"
                doneLabel="Desactivada"
                icon={<EyeOff className="h-4 w-4" />}
                onConfirm={() => handleStatus(toDeactivate, false)}
            >
                {toDeactivate && (
                    <div className="rounded-md border border-border/50 bg-background/40 px-3 py-2">
                        <p className="text-sm font-medium">{toDeactivate.nombre}</p>
                        <p className="text-xs text-muted-foreground">
                            {usageLabel(toDeactivate._count?.proyectos ?? 0)}
                        </p>
                    </div>
                )}
            </HoldConfirmDialog>

            {/* Eliminar: solo lo que ningún proyecto usa */}
            <HoldConfirmDialog
                open={!!toDelete}
                onOpenChange={() => setToDelete(null)}
                title={`Eliminar ${label.toLowerCase()}`}
                description="Ningún proyecto la usa, así que se borra definitivamente. No se puede deshacer."
                label="Mantén pulsado para eliminar"
                doneLabel="Eliminada"
                onConfirm={() => handleDelete(toDelete)}
            >
                {toDelete && (
                    <div className="rounded-md border border-border/50 bg-background/40 px-3 py-2">
                        <p className="text-sm font-medium">{toDelete.nombre}</p>
                    </div>
                )}
            </HoldConfirmDialog>
        </div>
    )
}

export default function CatalogAdminPage() {
    return (
        <div className="space-y-4 max-w-2xl">
            <div>
                <h1 className="text-xl font-semibold">Catálogo</h1>
                <p className="text-sm text-muted-foreground">
                    Gestiona las categorías y etiquetas disponibles para los proyectos.
                </p>
            </div>

            <p className="flex gap-2 rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                Desactivar oculta una categoría o etiqueta de los formularios y filtros, pero los
                proyectos que ya la tienen la conservan. Solo se puede eliminar lo que ningún proyecto usa.
            </p>

            <Tabs defaultValue="categorias">
                <TabsList className="bg-card/60 border border-border/50">
                    <TabsTrigger value="categorias" className="gap-2">
                        <LayoutGrid className="h-3.5 w-3.5" />
                        Categorías
                    </TabsTrigger>
                    <TabsTrigger value="etiquetas" className="gap-2">
                        <Tag className="h-3.5 w-3.5" />
                        Etiquetas
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="categorias" className="mt-4">
                    <Card className="border-border/50 bg-card/60">
                        <CardHeader>
                            <CardTitle className="text-sm">Categorías</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CrudSection
                                type="categoria"
                                label="Categoría"
                                icon={LayoutGrid}
                                fetchFn={() => api.get('/admin/categorias')}
                                createFn={(data) => api.post('/admin/categorias', data)}
                                updateFn={(id, data) => api.patch(`/admin/categorias/${id}`, data)}
                                setStatusFn={(id, activo) => api.patch(`/admin/categorias/${id}/status`, { activo })}
                                deleteFn={(id) => api.delete(`/admin/categorias/${id}`)}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="etiquetas" className="mt-4">
                    <Card className="border-border/50 bg-card/60">
                        <CardHeader>
                            <CardTitle className="text-sm">Etiquetas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CrudSection
                                type="etiqueta"
                                label="Etiqueta"
                                icon={Tag}
                                fetchFn={() => api.get('/admin/etiquetas')}
                                createFn={(data) => api.post('/admin/etiquetas', data)}
                                updateFn={(id, data) => api.patch(`/admin/etiquetas/${id}`, data)}
                                setStatusFn={(id, activo) => api.patch(`/admin/etiquetas/${id}/status`, { activo })}
                                deleteFn={(id) => api.delete(`/admin/etiquetas/${id}`)}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}