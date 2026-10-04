import api from '@/services/api'

export const surveyService = {
  /** Si toca invitar a quien tiene sesión, y por qué. Sin sesión, la respuesta es neutral. */
  getStatus: () => api.get('/encuesta/estado'),

  /** Respuesta anónima: la API no guarda usuario, correo ni IP. */
  submit: (answer) => api.post('/encuesta', answer),

  /** "Ahora no": oculta la invitación unos días (solo con sesión). */
  postpone: () => api.post('/encuesta/posponer'),
}
