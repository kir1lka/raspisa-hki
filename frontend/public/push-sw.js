// Обработчики push-уведомлений. Подключается в сгенерированный Service Worker
// через workbox.importScripts (см. vite.config.js).

// Пришёл пуш → показываем системное уведомление.
self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch (e) {
    data = { title: 'Расписание ШКИ', body: event.data ? event.data.text() : '' }
  }
  const title = data.title || 'Расписание ШКИ'
  const options = {
    body: data.body || '',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    data: { url: data.url || '/' },
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

// Клик по уведомлению → открыть/сфокусировать приложение на нужном адресе.
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data && event.notification.data.url) || '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ('focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url)
    }),
  )
})
