import api from '@/services/api'

export const teacherService = {
  getPublicGames: (params) => api.get('/search', { params }),
  getCategorias:  ()       => api.get('/search/categorias'),
  getEtiquetas:   ()       => api.get('/search/etiquetas'),
  getGameBySlug:  (slug)   => api.get(`/public/games/${slug}`),
  getFileUrl:     (key)    => api.get(`/public/files/url?key=${encodeURIComponent(key)}`),

  addComment: (projectId, data) =>
    api.post(`/projects/${projectId}/comments`, data),

  getComments: (projectId) =>
    api.get(`/projects/${projectId}/comments`),

  getMyEvaluations: () =>
    api.get('/teacher/evaluations'),
}