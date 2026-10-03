import { Check, Trash2 } from 'lucide-react'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import HoldButton from '@/components/HoldButton'

/** Color del relleno según lo que hace la acción. */
const TONES = {
  destructive: 'var(--destructive)',
  warning: 'hsl(32, 95%, 44%)',
}

/**
 * Confirmación de una acción delicada: hay que mantener pulsado el botón, que
 * muestra el estado final un instante antes de ejecutarla y cerrarse.
 *
 * @param {'destructive' | 'warning'} tone rojo para borrar, ámbar para desactivar
 */
export default function HoldConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  label = 'Mantén pulsado para eliminar',
  doneLabel = 'Eliminado',
  icon = <Trash2 className="h-4 w-4" />,
  tone = 'destructive',
  holdTime = 2000,
  onConfirm,
  children,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background text-popover-foreground sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {children}

          <HoldButton
            className="w-full"
            size="md"
            radius={8}
            holdTime={holdTime}
            backgroundColor="var(--muted)"
            fillColor={TONES[tone] ?? TONES.destructive}
            textColor="var(--foreground)"
            fillTextColor="#ffffff"
            icon={icon}
            doneIcon={<Check className="h-4 w-4" />}
            doneLabel={doneLabel}
            resetAfter={0}
            onHold={() => setTimeout(onConfirm, 600)}
          >
            {label}
          </HoldButton>
        </div>
      </DialogContent>
    </Dialog>
  )
}
