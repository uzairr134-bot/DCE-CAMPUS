self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {}
  const notification = self.registration.showNotification(data.title || 'CampusFix', {
    body: data.body || 'A new campus report needs attention.',
    tag: `campusfix-report-${data.id || Date.now()}`,
    renotify: true,
    silent: false,
    requireInteraction: true,
    vibrate: data.notifyBuzzer ? [400, 200, 400, 200, 800] : [200, 100, 200],
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: { url: '/admin' }
  })
  const pageMessage = self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
    clients.forEach((client) => client.postMessage({
      type: 'campusfix-report',
      id: data.id,
      notifyBuzzer: Boolean(data.notifyBuzzer)
    }))
  })
  event.waitUntil(Promise.all([notification, pageMessage]))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
    const existing = windows.find((window) => 'focus' in window)
    if (existing) return existing.focus()
    return clients.openWindow(event.notification.data.url)
  }))
})
