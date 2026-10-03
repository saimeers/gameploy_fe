import api from '@/services/api'

export const studentService = {

  // Projects
  getMyProjects: (params) =>
    api.get('/projects/mine', { params }),

  getProjectBySlug: (slug) =>
    api.get(`/projects/${slug}`),

  createProject: (data) =>
    api.post('/projects', data),

  updateProject: (id, data) =>
    api.patch(`/projects/${id}`, data),

  publishProject: (id) =>
    api.patch(`/projects/${id}/publish`),

  // Visits: `days` null es todo el histórico
  getMyVisits: (days) =>
    api.get('/projects/mine/visits', { params: { days: days ?? undefined } }),

  getProjectVisits: (id, days) =>
    api.get(`/projects/${id}/visits`, { params: { days: days ?? undefined } }),

  // Slug
  checkSlug: (id, slug) =>
    api.get(`/projects/${id}/slug`, { params: { slug } }),

  changeSlug: (id, slug) =>
    api.patch(`/projects/${id}/slug`, { slug }),

  deleteProject: (id) =>
    api.delete(`/projects/${id}`),

  // Versions
  getVersions: (projectId) =>
    api.get(`/projects/${projectId}/versions`),

  createVersion: (projectId, data) =>
    api.post(`/projects/${projectId}/versions`, data),

  activateVersion: (projectId, versionId) =>
    api.patch(`/projects/${projectId}/versions/${versionId}/activate`),

  uploadFile: (projectId, versionId, formData, onProgress) =>
    api.post(`/projects/${projectId}/versions/${versionId}/files`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total))
      },
    }),

  // Controls
  getControls: (projectId) =>
    api.get(`/projects/${projectId}/controls`),

  createControl: (projectId, data) =>
    api.post(`/projects/${projectId}/controls`, data),

  updateControl: (projectId, controlId, data) =>
    api.patch(`/projects/${projectId}/controls/${controlId}`, data),

  deleteControl: (projectId, controlId) =>
    api.delete(`/projects/${projectId}/controls/${controlId}`),

  reorderControls: (projectId, order) =>
    api.patch(`/projects/${projectId}/controls/reorder`, { order }),

  // Catalog
  getCategorias: () =>
    api.get('/search/categorias'),

  getEtiquetas: () =>
    api.get('/search/etiquetas'),

  // Files
  deleteFile: (projectId, versionId, fileId) =>
    api.delete(`/projects/${projectId}/versions/${versionId}/files/${fileId}`),

  /** Enlace de 5 minutos para descargar el archivo original (el .zip del juego). */
  downloadFile: (projectId, versionId, fileId) =>
    api.get(`/projects/${projectId}/versions/${versionId}/files/${fileId}/download`),

  getPublicGame: (slug) =>
    api.get(`/public/games/${slug}`),
}