import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Loader2, Tag, LayoutGrid } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import api from '@/services/api'

function CrudSection({ type, label, icon: Icon, fetchFn, createFn, updateFn, deleteFn }) {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [dialog, setDialog] = useState(null)
    const [toDelete, setToDelete] = useState(null)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm()

    const fetch = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetchFn()
            setItems(res.data.data)
        } catch { toast.error(`Error al cargar ${label}`) }
        finally { setLoading(false) }
    }, [fetchFn, label])

    useEffect(() => { fetch() }, [fetch])

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
            fetch()
        } catch (err) {
            toast.error(err.response?.data?.message ?? 'Error al guardar')
        } finally { setSaving(false) }
    }

    const handleDelete = async () => {
        setDeleting(true)
        try {
            await deleteFn(toDelete.id)
            toast.success(`${label} eliminada`)
            fetch()
        } catch (err) {
            toast.error(err.response?.data?.message ?? 'No se puede eliminar, puede estar en uso')
        } finally {
            setDeleting(false)
            setToDelete(null)
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
                    {items.map(item => (
                        <div
                            key={item.id}
                            className="flex items-center justify-between rounded-lg border border-border/50 bg-card/60 px-4 py-3"
                        >
                            <div>
                                <p className="text-sm font-medium">{item.nombre}</p>
                                {item.descripcion && (
                                    <p className="text-xs text-muted-foreground">{item.descripcion}</p>
                                )}
                            </div>
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(item)}>
                                    <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-destructive hover:text-destructive"
                                    onClick={() => setToDelete(item)}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    ))}
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
                                {...register('nombre', { required: 'El nombre es requerido' })}
                                disabled={saving}
                            />
                            {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
                        </div>
                        {type !== 'etiqueta' && (
                            <div className="space-y-1.5">
                                <Label>Descripción</Label>
                                <Input {...register('descripcion')} disabled={saving} />
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

            {/* Delete confirm */}
            <AlertDialog open={!!toDelete} onOpenChange={() => setToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Eliminar {label.toLowerCase()}</AlertDialogTitle>
                        <AlertDialogDescription>
                            ¿Eliminar <strong>{toDelete?.nombre}</strong>? Si está en uso por algún proyecto, no se podrá eliminar.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
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
                                deleteFn={(id) => api.delete(`/admin/etiquetas/${id}`)}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}