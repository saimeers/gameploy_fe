/**
 * Límites de longitud de los campos de texto del sistema.
 *
 * El backend todavía no impone máximos (las columnas de Prisma son `String`
 * sin longitud), así que por ahora este archivo es el único contrato de
 * longitud del cliente. Al añadir un campo nuevo, declarar aquí su límite en
 * lugar de escribir el número suelto en el componente.
 */
export const LIMITS = {
  // Cuenta de usuario
  nombreUsuario: 80,
  correo: 254, // RFC 5321
  password: 128,

  // Proyecto
  nombreProyecto: 80,
  descripcionProyecto: 500,
  instruccionesProyecto: 1000,

  // Versiones
  numeroVersion: 20,
  notasVersion: 300,

  // Controles del juego
  accionControl: 60,

  // Catálogo (categorías y etiquetas)
  nombreCatalogo: 40,
  descripcionCatalogo: 150,

  // Retroalimentación
  comentario: 1000,

  // Campos de búsqueda y confirmación
  busqueda: 80,
  confirmacion: 20,
}
