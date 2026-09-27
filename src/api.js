const browserApiUrl = import.meta.env.DEV
  ? '/api'
  : typeof window === 'undefined'
  ? 'http://localhost:4000/api'
  : `${window.location.protocol}//${window.location.hostname}:4000/api`
const API_URL = import.meta.env.VITE_API_URL || browserApiUrl
export const API_ORIGIN = API_URL.replace(/\/api\/?$/, '')

export function assetUrl(path) {
  if (!path) return ''
  return path.startsWith('http') ? path : `${API_ORIGIN}${path}`
}

async function request(path, options = {}) {
  const token = JSON.parse(localStorage.getItem('campusfix_currentUser') || 'null')?.token
  const headers = { ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), ...options.headers }
  if (token) headers.Authorization = `Bearer ${token}`

  try {
    const response = await fetch(`${API_URL}${path}`, { ...options, headers })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.error || 'The request could not be completed.')
    return data
  } catch (error) {
    if (error instanceof TypeError || error?.name === 'TypeError') {
      throw new Error('Unable to connect to the CampusFix server. Please start the backend and try again.')
    }
    throw error
  }
}

export const api = {
  signup: (body) => request('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  updateAdminCategory: (adminCategory) => request('/auth/admin-category', { method: 'PATCH', body: JSON.stringify({ adminCategory }) }),
  getIssues: (filter = 'All') => request(`/issues?filter=${encodeURIComponent(filter)}`),
  getReportAlerts: (since) => request(`/issues/alerts?since=${encodeURIComponent(since)}`),
  getPushConfig: () => request('/notifications/push-config'),
  subscribeToPush: (subscription) => request('/notifications/push-subscriptions', { method: 'POST', body: JSON.stringify(subscription) }),
  createIssue: (body) => request('/issues', { method: 'POST', body: JSON.stringify(body) }),
  uploadPhoto: (id, file) => {
    const body = new FormData()
    body.append('photo', file)
    return request(`/issues/${id}/photo`, { method: 'POST', body })
  },
  updateIssueStatus: (id, status) => request(`/issues/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  resolveIssue: (id) => request(`/issues/${id}/resolve`, { method: 'PATCH' }),
  getHelpline: () => request('/settings/helpline'),
  updateHelpline: (helpline) => request('/settings/helpline', { method: 'PUT', body: JSON.stringify({ helpline }) }),
  getDonationTotal: () => request('/donations/total'),
  createDonation: (body) => request('/donations', { method: 'POST', body: JSON.stringify(body) })
}
