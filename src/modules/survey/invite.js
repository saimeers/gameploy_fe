import { create } from 'zustand'
import { useAuthStore } from '@/store/authStore'
import { surveyService } from './survey.service'

/**
 * Cuándo ofrecer la encuesta.
 *
 * Con sesión decide la API (GET /encuesta/estado): primer proyecto publicado
 * o primera evaluación, o una semana de uso; "Ahora no" la pospone 3 días,
 * como mucho dos veces. Sin sesión decide este navegador, con las mismas
 * reglas guardadas en localStorage.
 */

const LOCAL_KEY = 'gameploy-encuesta'
const SESSION_KEY = 'gameploy-encuesta-invitada'
const DAY_MS = 24 * 60 * 60 * 1000
const POSTPONE_DAYS = 3
const MAX_POSTPONES = 2

/** Minutos con un juego en ejecución antes de ofrecer la encuesta. */
export const PLAY_MINUTES = 3

// El almacenamiento puede fallar (modo privado, cookies bloqueadas): sin él,
// simplemente no se recuerda nada.
const readLocal = () => {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY)) ?? {} } catch { return {} }
}
const writeLocal = (patch) => {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify({ ...readLocal(), ...patch })) } catch { /* sin memoria */ }
}
const invitedThisSession = () => {
  try { return sessionStorage.getItem(SESSION_KEY) === '1' } catch { return false }
}
const markInvitedThisSession = () => {
  try { sessionStorage.setItem(SESSION_KEY, '1') } catch { /* sin memoria */ }
}

const hasSession = () => Boolean(useAuthStore.getState().token)

/** Diálogo de invitación, uno para toda la app. */
export const useSurveyInvite = create((set) => ({
  open: false,
  momento: null,
  show: (momento) => set({ open: true, momento }),
  close: () => set({ open: false }),
}))

/**
 * Pregunta a la API si toca invitar y, si es así, abre el diálogo. Se muestra
 * una vez por sesión del navegador, salvo con `force` (justo después de
 * publicar el primer proyecto o de la primera evaluación).
 */
export async function checkInvite({ force = false } = {}) {
  if (!hasSession() || (!force && invitedThisSession())) return
  try {
    const { data } = await surveyService.getStatus()
    if (data.data.invitar) {
      markInvitedThisSession()
      useSurveyInvite.getState().show(data.data.momento)
    }
  } catch { /* sin invitación si falla */ }
}

/** Si se puede ofrecer la encuesta ahora (por ejemplo, tras jugar un rato). */
export async function canOffer() {
  if (hasSession()) {
    try {
      const { data } = await surveyService.getStatus()
      return data.data.puede_responder && !data.data.pospuesta
    } catch {
      return false
    }
  }
  const state = readLocal()
  return !state.respondida
    && (state.pospuestas ?? 0) < MAX_POSTPONES
    && !((state.pospuesta_hasta ?? 0) > Date.now())
}

/** "Ahora no". */
export async function postponeInvite() {
  if (hasSession()) {
    await surveyService.postpone().catch(() => {})
    return
  }
  const state = readLocal()
  writeLocal({ pospuestas: (state.pospuestas ?? 0) + 1, pospuesta_hasta: Date.now() + POSTPONE_DAYS * DAY_MS })
}

/** Este navegador ya respondió (sin sesión; con sesión lo sabe la API). */
export const markAnsweredLocally = () => writeLocal({ respondida: true })
export const answeredLocally = () => Boolean(readLocal().respondida)

/** Ruta interna a la que volver tras responder; nunca una URL externa. */
export const safeReturnPath = (value) =>
  typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : '/'

/** Enlace a la encuesta desde la página actual. */
export const surveyHref = (momento, from = window.location.pathname) =>
  `/encuesta?momento=${momento}&volver=${encodeURIComponent(from)}`
