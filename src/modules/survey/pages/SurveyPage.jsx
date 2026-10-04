import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  ArrowLeft, ArrowRight, CheckCircle2, Clock, Loader2, MessageSquareHeart, ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import ScaleQuestion from '../components/ScaleQuestion'
import { surveyService } from '../survey.service'
import { answeredLocally, markAnsweredLocally, safeReturnPath } from '../invite'
import {
  COMENTARIO_MAX, ESCALA, EXPERIENCIA, MOMENTOS, NO_DICE, SOBRE_TI, USABILIDAD, VERSION,
} from '../preguntas'

const DRAFT_KEY = 'gameploy-encuesta-borrador'
const PER_STEP = 5

/** Pasos del cuestionario: datos opcionales, 2 de usabilidad, 2 de experiencia y comentario. */
const STEPS = [
  { kind: 'about', title: 'Sobre ti', description: 'Opcional: nos ayuda a entender los resultados por grupos.' },
  { kind: 'items', field: 'sus', from: 0, title: 'Usabilidad', description: '¿Qué tan de acuerdo estás con cada afirmación sobre usar Gameploy?' },
  { kind: 'items', field: 'sus', from: PER_STEP, title: 'Usabilidad', description: '¿Qué tan de acuerdo estás con cada afirmación sobre usar Gameploy?' },
  { kind: 'items', field: 'ux', from: 0, title: 'Experiencia', description: 'Ahora, sobre cómo te sentiste usando Gameploy.' },
  { kind: 'items', field: 'ux', from: PER_STEP, title: 'Experiencia', description: 'Ahora, sobre cómo te sentiste usando Gameploy.' },
  { kind: 'comment', title: 'Para terminar', description: 'Opcional, pero nos ayuda mucho.' },
]
const TEXTS = { sus: USABILIDAD, ux: EXPERIENCIA }

const emptyAnswers = () => ({
  sus: Array(USABILIDAD.length).fill(null),
  ux: Array(EXPERIENCIA.length).fill(null),
  comentario: '',
  ...Object.fromEntries(SOBRE_TI.map(q => [q.campo, null])),
})

const loadDraft = () => {
  try {
    const draft = JSON.parse(sessionStorage.getItem(DRAFT_KEY))
    return draft?.version === VERSION ? { ...emptyAnswers(), ...draft.answers } : emptyAnswers()
  } catch {
    return emptyAnswers()
  }
}
const saveDraft = (answers) => {
  try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ version: VERSION, answers })) } catch { /* sin borrador */ }
}
const clearDraft = () => {
  try { sessionStorage.removeItem(DRAFT_KEY) } catch { /* nada que borrar */ }
}

/** Pantalla centrada para la bienvenida, el agradecimiento y los avisos. */
function Panel({ icon: Icon, title, children, actions }) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-5 py-10 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
        <Icon className="h-7 w-7" />
      </span>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">{children}</div>
      </div>
      {actions && <div className="flex flex-wrap justify-center gap-2">{actions}</div>}
    </div>
  )
}

/**
 * Encuesta anónima de usabilidad (SUS) y experiencia de la plataforma.
 * Pública: la responden estudiantes, docentes y visitantes sin cuenta.
 */
export default function SurveyPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = useAuthStore(s => s.token)
  const momento = MOMENTOS.includes(params.get('momento')) ? params.get('momento') : 'voluntaria'
  const volver = safeReturnPath(params.get('volver'))

  // intro → steps (0..5) → done; o un aviso si no puede responder. Sin sesión
  // decide este navegador; con sesión, la API.
  const [stage, setStage] = useState(() => (token ? 'checking' : answeredLocally() ? 'answered-here' : 'intro'))
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState(loadDraft)
  const [missing, setMissing] = useState([])
  const [sending, setSending] = useState(false)
  const [alreadyAnswered, setAlreadyAnswered] = useState(false)

  useEffect(() => {
    if (!token) return
    let cancelled = false
    surveyService.getStatus()
      .then(res => {
        if (cancelled) return
        const s = res.data.data
        setStage(s.respondida ? 'answered' : s.puede_responder ? 'intro' : 'not-allowed')
      })
      .catch(() => { if (!cancelled) setStage('intro') })
    return () => { cancelled = true }
  }, [token])

  useEffect(() => { if (stage === 'steps') saveDraft(answers) }, [answers, stage])
  useEffect(() => { window.scrollTo?.(0, 0) }, [step, stage])

  const current = STEPS[step]
  const answeredCount = useMemo(
    () => [...answers.sus, ...answers.ux].filter(v => v != null).length,
    [answers],
  )

  const setItem = (field, index, value) => {
    setAnswers(prev => {
      const list = [...prev[field]]
      list[index] = value
      return { ...prev, [field]: list }
    })
    setMissing(prev => prev.filter(key => key !== `${field}-${index}`))
  }

  /** Ítems sin responder del paso actual (los datos y el comentario son opcionales). */
  const missingInStep = () => {
    if (current.kind !== 'items') return []
    return Array.from({ length: PER_STEP }, (_, i) => current.from + i)
      .filter(i => answers[current.field][i] == null)
      .map(i => `${current.field}-${i}`)
  }

  const next = () => {
    const pending = missingInStep()
    if (pending.length) {
      setMissing(pending)
      document.getElementById(pending[0])?.querySelector('input')?.focus()
      return
    }
    setMissing([])
    setStep(s => s + 1)
  }

  const submit = async () => {
    setSending(true)
    const optional = Object.fromEntries(
      SOBRE_TI.map(q => [q.campo, answers[q.campo]]).filter(([, v]) => v),
    )
    try {
      await surveyService.submit({
        version: VERSION,
        momento,
        sus: answers.sus,
        ux: answers.ux,
        ...optional,
        ...(answers.comentario.trim() && { comentario: answers.comentario.trim() }),
      })
      finish(false)
    } catch (err) {
      const status = err.response?.status
      if (status === 409) finish(true)
      else if (status === 429) toast.error('Se recibieron muchas respuestas desde esta conexión. Inténtalo más tarde.')
      else toast.error('No se pudo enviar la encuesta. Inténtalo de nuevo.')
    } finally {
      setSending(false)
    }
  }

  const finish = (wasAnswered) => {
    if (!token) markAnsweredLocally()
    clearDraft()
    setAlreadyAnswered(wasAnswered)
    setStage('done')
  }

  const backButton = (
    <Button variant="outline" onClick={() => navigate(volver)}>
      <ArrowLeft /> Volver
    </Button>
  )

  return (
    <div className="min-h-svh bg-background">
      <header className="border-b border-border/50">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="text-base font-bold tracking-tight">Gameploy</Link>
          <Link to={volver} className="text-xs text-muted-foreground transition-colors hover:text-foreground">
            Salir de la encuesta
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-16">
        {stage === 'checking' && (
          <div className="flex justify-center py-24">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {stage === 'intro' && (
          <Panel
            icon={MessageSquareHeart}
            title="Ayúdanos a mejorar Gameploy"
            actions={<Button size="lg" onClick={() => setStage('steps')}>Empezar <ArrowRight /></Button>}
          >
            <p>
              Son 20 afirmaciones sobre tu experiencia con la plataforma y unas preguntas opcionales sobre
              ti. No hay respuestas correctas ni incorrectas: queremos saber qué piensas.
            </p>
            <ul className="mx-auto flex max-w-sm flex-col gap-2 pt-2 text-left">
              <li className="flex items-center gap-2"><Clock className="h-4 w-4 shrink-0 text-primary" /> Toma unos 3 minutos.</li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
                Es anónima: no guardamos tu nombre, correo ni IP.
              </li>
            </ul>
          </Panel>
        )}

        {stage === 'answered' && (
          <Panel icon={CheckCircle2} title="Ya respondiste la encuesta" actions={backButton}>
            <p>¡Gracias! Tu opinión ya está ayudando a mejorar Gameploy.</p>
          </Panel>
        )}

        {stage === 'answered-here' && (
          <Panel
            icon={CheckCircle2}
            title="Ya se respondió en este navegador"
            actions={<>
              {backButton}
              <Button onClick={() => setStage('intro')}>Soy otra persona</Button>
            </>}
          >
            <p>Si compartes el computador (por ejemplo, en una sala), puedes responder igual.</p>
          </Panel>
        )}

        {stage === 'not-allowed' && (
          <Panel icon={ShieldCheck} title="Esta encuesta es para quienes usan Gameploy" actions={backButton}>
            <p>Los administradores no la responden: consultan los resultados en el panel.</p>
          </Panel>
        )}

        {stage === 'steps' && (
          <div className="space-y-6 pt-8">
            <div className="space-y-3">
              <ol className="grid grid-cols-6 gap-1.5" aria-label="Progreso de la encuesta">
                {STEPS.map((s, i) => (
                  <li key={i} aria-current={i === step ? 'step' : undefined}>
                    <span className={cn('block h-1 rounded-full transition-colors', i <= step ? 'bg-primary' : 'bg-border')} />
                  </li>
                ))}
              </ol>
              <div className="flex items-baseline justify-between gap-3 text-xs text-muted-foreground">
                <span>Paso {step + 1} de {STEPS.length}</span>
                <span>{answeredCount} de {USABILIDAD.length + EXPERIENCIA.length} afirmaciones</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight">{current.title}</h1>
                <p className="text-sm text-muted-foreground">{current.description}</p>
              </div>
            </div>

            {current.kind === 'about' && (
              <div className="space-y-3">
                {SOBRE_TI.map(q => (
                  <ScaleQuestion
                    key={q.campo}
                    id={q.campo}
                    text={q.pregunta}
                    variant="pills"
                    options={[...q.opciones, NO_DICE]}
                    value={answers[q.campo]}
                    onChange={value => setAnswers(prev => ({ ...prev, [q.campo]: value }))}
                  />
                ))}
              </div>
            )}

            {current.kind === 'items' && (
              <div className="space-y-3">
                {TEXTS[current.field].slice(current.from, current.from + PER_STEP).map((text, offset) => {
                  const index = current.from + offset
                  return (
                    <ScaleQuestion
                      key={`${current.field}-${index}`}
                      id={`${current.field}-${index}`}
                      number={index + 1}
                      text={text}
                      options={ESCALA}
                      value={answers[current.field][index]}
                      onChange={value => setItem(current.field, index, value)}
                      missing={missing.includes(`${current.field}-${index}`)}
                    />
                  )
                })}
              </div>
            )}

            {current.kind === 'comment' && (
              <div className="space-y-2 rounded-xl border border-border/50 bg-card/60 p-4 sm:p-5">
                <label htmlFor="comentario" className="text-sm font-medium">¿Qué mejorarías de Gameploy?</label>
                <Textarea
                  id="comentario"
                  rows={5}
                  maxLength={COMENTARIO_MAX}
                  value={answers.comentario}
                  onChange={e => setAnswers(prev => ({ ...prev, comentario: e.target.value }))}
                  placeholder="Lo que te gustó, lo que te costó, lo que le falta…"
                />
                <p className="text-right text-xs text-muted-foreground">{answers.comentario.length} / {COMENTARIO_MAX}</p>
              </div>
            )}

            {missing.length > 0 && (
              <p className="text-sm text-destructive" role="alert">
                Te falta responder {missing.length === 1 ? '1 afirmación' : `${missing.length} afirmaciones`} de este paso.
              </p>
            )}

            <div className="flex items-center justify-between gap-3 border-t border-border/50 pt-4">
              <Button variant="ghost" disabled={step === 0} onClick={() => { setMissing([]); setStep(s => s - 1) }}>
                <ArrowLeft /> Anterior
              </Button>
              {step < STEPS.length - 1 ? (
                <Button onClick={next}>Siguiente <ArrowRight /></Button>
              ) : (
                <Button onClick={submit} disabled={sending}>
                  {sending ? <Loader2 className="animate-spin" /> : <CheckCircle2 />} Enviar respuestas
                </Button>
              )}
            </div>
          </div>
        )}

        {stage === 'done' && (
          <Panel icon={CheckCircle2} title="¡Gracias por tu tiempo!" actions={backButton}>
            {alreadyAnswered
              ? <p>Ya habíamos recibido tu respuesta antes. ¡Gracias por tu interés!</p>
              : <p>Tus respuestas son anónimas y nos ayudan a mejorar Gameploy para todos.</p>}
          </Panel>
        )}
      </main>
    </div>
  )
}
