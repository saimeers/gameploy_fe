import { NO_DICE, SOBRE_TI } from '@/modules/survey/preguntas'

export const PERFILES = { estudiante: 'Estudiantes', docente: 'Docentes', visitante: 'Visitantes sin cuenta' }

export const MOMENTOS = {
  primer_proyecto: 'Tras su primer proyecto o evaluación',
  uso_prolongado: 'Tras una semana de uso',
  tras_jugar: 'Tras jugar unos minutos',
  voluntaria: 'Por iniciativa propia',
}

export const BANDAS = { pobre: 'Pobre', mejorable: 'Mejorable', buena: 'Buena', excelente: 'Excelente' }

/** Respuestas ya orientadas: a la derecha siempre lo favorable. */
export const NIVELES = [
  { key: 'muy_desfavorable', label: 'Muy desfavorable', color: 'bg-chart-unfav-strong' },
  { key: 'desfavorable', label: 'Desfavorable', color: 'bg-chart-unfav' },
  { key: 'neutral', label: 'Neutral', color: 'bg-chart-bar-muted' },
  { key: 'favorable', label: 'Favorable', color: 'bg-chart-fav' },
  { key: 'muy_favorable', label: 'Muy favorable', color: 'bg-chart-fav-strong' },
]

const SIN_RESPUESTA = { value: 'sin_respuesta', label: 'Sin responder' }

/** Opciones de cada dato opcional, en su orden, con "Prefiero no decirlo" y "Sin responder" al final. */
export const DATOS = SOBRE_TI.map(q => ({
  campo: q.campo,
  titulo: q.pregunta,
  opciones: [...q.opciones, NO_DICE, SIN_RESPUESTA],
}))
export const QUIET_VALUES = [NO_DICE.value, SIN_RESPUESTA.value]

export const decimal = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1, minimumFractionDigits: 1 })
export const integer = new Intl.NumberFormat('es-CO')
export const percent = (part, total) => (total ? Math.round((part / total) * 100) : 0)

/** "2026-10" → "oct 2026" */
export const monthLabel = (mes) =>
  new Date(`${mes}-01T00:00:00Z`).toLocaleDateString('es-CO', { month: 'short', year: 'numeric', timeZone: 'UTC' })
