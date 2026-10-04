/**
 * Cuestionario de usabilidad y experiencia de Gameploy (versión 1).
 *
 * La API valida las mismas respuestas y la misma versión
 * (gameploy_be: src/config/encuesta.js). Si cambia la redacción, sube la
 * versión en los dos lados para no mezclar respuestas a textos distintos.
 */
export const VERSION = 1

/** Escala de acuerdo: la persona ve las etiquetas, nunca los números. */
export const ESCALA = [
  { value: 1, label: 'Totalmente en desacuerdo' },
  { value: 2, label: 'En desacuerdo' },
  { value: 3, label: 'Ni de acuerdo ni en desacuerdo' },
  { value: 4, label: 'De acuerdo' },
  { value: 5, label: 'Totalmente de acuerdo' },
]

/** System Usability Scale (SUS), con "la plataforma" en lugar de "el sistema". */
export const USABILIDAD = [
  'Creo que usaría esta plataforma frecuentemente.',
  'Encontré la plataforma innecesariamente compleja.',
  'Pensé que la plataforma es fácil de usar.',
  'Creo que necesitaría ayuda técnica para usar esta plataforma.',
  'Consideré que las funciones de la plataforma estaban bien integradas.',
  'Creí que la plataforma tiene demasiadas inconsistencias.',
  'Creo que la mayoría de las personas aprenderían a usar esta plataforma rápidamente.',
  'Encontré la plataforma muy difícil de usar.',
  'Me sentí seguro/a usando la plataforma.',
  'Necesité aprender muchas cosas antes de poder usar la plataforma.',
]

/** Experiencia de uso; los ítems 4 y 8 son negativos y cuentan al revés. */
export const EXPERIENCIA = [
  'Me sentí cómodo/a y a gusto usando la plataforma.',
  'Me sentí capaz de lograr lo que quería hacer en la plataforma.',
  'La plataforma me exigió el esfuerzo justo, ni más ni menos.',
  'Me frustré usando la plataforma.',
  'Me sentí motivado/a a seguir usando la plataforma.',
  'Experimenté emociones positivas mientras usaba la plataforma.',
  'Sentí que la plataforma me aporta algo útil (aprender, mostrar o evaluar juegos serios).',
  'La plataforma me pareció aburrida.',
  'Pude concentrarme en lo que hacía sin distracciones.',
  'Me sentí en control de mis acciones dentro de la plataforma.',
]
export const EXPERIENCIA_INVERSOS = [4, 8]

/** Preguntas opcionales sobre quien responde. */
export const SOBRE_TI = [
  {
    campo: 'edad',
    pregunta: 'Edad',
    opciones: [
      { value: 'menos_18', label: 'Menos de 18' },
      { value: '18_24', label: '18 a 24' },
      { value: '25_34', label: '25 a 34' },
      { value: '35_44', label: '35 a 44' },
      { value: '45_mas', label: '45 o más' },
    ],
  },
  {
    campo: 'genero',
    pregunta: 'Género',
    opciones: [
      { value: 'femenino', label: 'Femenino' },
      { value: 'masculino', label: 'Masculino' },
      { value: 'no_binario', label: 'No binario' },
      { value: 'otro', label: 'Otro' },
    ],
  },
  {
    campo: 'experiencia_videojuegos',
    pregunta: 'Nivel de experiencia con videojuegos',
    opciones: [
      { value: 'ninguna', label: 'Ninguna' },
      { value: 'basica', label: 'Básica' },
      { value: 'intermedia', label: 'Intermedia' },
      { value: 'avanzada', label: 'Avanzada' },
    ],
  },
  {
    campo: 'frecuencia_juego',
    pregunta: '¿Con qué frecuencia juegas videojuegos?',
    opciones: [
      { value: 'nunca', label: 'Nunca' },
      { value: 'mensual', label: 'Algunas veces al mes' },
      { value: 'semanal', label: 'Algunas veces por semana' },
      { value: 'diaria', label: 'A diario' },
    ],
  },
  {
    campo: 'juegos_serios_previos',
    pregunta: '¿Habías usado antes juegos serios (para aprender o entrenar alguna habilidad)?',
    opciones: [
      { value: 'si', label: 'Sí' },
      { value: 'no', label: 'No' },
      { value: 'no_seguro', label: 'No estoy seguro/a' },
    ],
  },
]
/** Valor que se guarda cuando alguien elige no responder una pregunta opcional. */
export const NO_DICE = { value: 'no_dice', label: 'Prefiero no decirlo' }

/** Qué llevó a responder: la invitación que se mostró, o voluntaria. */
export const MOMENTOS = ['primer_proyecto', 'uso_prolongado', 'tras_jugar', 'voluntaria']

export const COMENTARIO_MAX = 1000
