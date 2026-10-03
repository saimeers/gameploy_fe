import api from '@/services/api'

export const adminService = {

  getStats: () =>
    api.get('/admin/stats'),

  /** Origen de las visitas de toda la plataforma; `days` null es todo el histórico. */
  getVisitStats: (days) =>
    api.get('/admin/stats/visits', { params: { days: days ?? undefined } }),

  getProjectVisits: (projectId, days) =>
    api.get(`/projects/${projectId}/visits`, { params: { days: days ?? undefined } }),

  // Users
  getUsers: (params) =>
    api.get('/users', { params }),

  getUser: (userId) =>
    api.get(`/admin/users/${userId}`),

  updateRole: (userId, rol) =>
    api.patch(`/users/${userId}/role`, { rol }),

  toggleStatus: (userId, activo) =>
    api.patch(`/users/${userId}/status`, { activo }),

  approveUser: (userId) =>
    api.patch(`/admin/users/${userId}/approve`),

  // Projects
  getProjects: (params) =>
    api.get('/admin/projects', { params }),

  getProject: (projectId) =>
    api.get(`/admin/projects/${projectId}`),

  /** Enlace de 5 minutos para descargar el archivo original (el .zip del juego). */
  downloadFile: (fileId) =>
    api.get(`/admin/files/${fileId}/download`),

  deleteFile: (fileId) =>
    api.delete(`/admin/files/${fileId}`),

  /** Archivos dentro del .zip de un juego, con las comprobaciones de subida. */
  getBuildContents: (fileId) =>
    api.get(`/admin/files/${fileId}/contents`),

  toggleFeatured: (projectId, destacado) =>
    api.patch(`/admin/projects/${projectId}/featured`, { destacado }),

  deleteProject: (projectId) =>
    api.delete(`/admin/projects/${projectId}`),

  // Comments
  moderateComment: (commentId, activo) =>
    api.patch(`/admin/comments/${commentId}/moderate`, { activo }),

  deleteComment: (commentId) =>
    api.delete(`/admin/comments/${commentId}`),
}