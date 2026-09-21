import api from '@/services/api'

export const profileService = {
  getProfile: () =>
    api.get('/users/me'),

  updateProfile: (data) =>
    api.patch('/users/me', data),

  getFileUrl: (key) =>
    api.get(`/public/files/url?key=${encodeURIComponent(key)}`),
}
