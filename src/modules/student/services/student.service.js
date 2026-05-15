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
        if (onProgress) onProgress(Math.round((e.loaded * 100) / e.total))
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

  getFileUrl: (key) =>
    api.get(`/public/files/url?key=${encodeURIComponent(key)}`),

  getPublicGame: (slug) =>
    api.get(`/public/games/${slug}`),
}