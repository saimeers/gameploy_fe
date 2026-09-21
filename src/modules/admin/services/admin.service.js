import api from '@/services/api'

export const adminService = {

  getStats: () =>
    api.get('/admin/stats'),

  // Users
  getUsers: (params) =>
    api.get('/users', { params }),

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

  getFileUrl: (key) =>
    api.get(`/public/files/url?key=${encodeURIComponent(key)}`),

  deleteFile: (fileId) =>
    api.delete(`/admin/files/${fileId}`),

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