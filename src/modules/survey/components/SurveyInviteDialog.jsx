import { useNavigate, useLocation } from 'react-router-dom'
import { Clock, MessageSquareHeart, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { postponeInvite, surveyHref, useSurveyInvite } from '../invite'

const LEAD = {
  primer_proyecto: '¡Ya diste un paso importante en Gameploy!',
  uso_prolongado: 'Ya llevas un tiempo usando Gameploy.',
}

/** Invitación a la encuesta, abierta desde checkInvite (ver ../invite.js). */
export default function SurveyInviteDialog() {
  const { open, momento, close } = useSurveyInvite()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const answer = () => {
    close()
    navigate(surveyHref(momento ?? 'voluntaria', pathname))
  }
  const later = () => {
    close()
    postponeInvite()
  }

  return (
    <Dialog open={open} onOpenChange={next => { if (!next) later() }}>
      <DialogContent className="gap-0 bg-background p-0 text-popover-foreground sm:max-w-md">
        <div className="flex flex-col items-center gap-4 px-6 pt-8 pb-6 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
            <MessageSquareHeart className="h-6 w-6" />
          </span>
          <div className="space-y-2">
            <DialogTitle className="text-lg">¿Nos ayudas a mejorar Gameploy?</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              {LEAD[momento] && <>{LEAD[momento]} </>}
              Cuéntanos cómo te ha ido con una encuesta corta sobre la plataforma.
            </DialogDescription>
          </div>
          <ul className="flex flex-col gap-1.5 text-xs text-muted-foreground">
            <li className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-primary" /> Unos 3 minutos</li>
            <li className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-primary" /> Anónima: no guardamos quién responde</li>
          </ul>
        </div>
        <div className="flex flex-col-reverse gap-2 border-t border-border/50 px-6 py-4 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={later}>Ahora no</Button>
          <Button onClick={answer}>Responder</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
