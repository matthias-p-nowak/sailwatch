// Note: This is the service worker file that will be registered in the browser
console.log('Hello World from service worker');

async function swInit() {
    const dt= new Date();
    const hr=dt.getHours();
    const mn=dt.getMinutes();
    const sc=dt.getSeconds();
    console.log('start time:',hr+':'+mn+':'+sc);
    
    setTimeout(() => { 
        console.log('Notification');
        self.registration.showNotification('Sailwatch', {
            body: 'goto window',
            icon: 'icon.png',
            badge: 'badge.png',
            vibrate: [100, 50, 100],
            requireInteraction: true,

        });      
    }, 10_000);

    self.addEventListener('notificationclick', async (event) => {
        console.log('Notification click:', event);
        event.notification.close();
       
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
            console.log('focusing');
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        console.log('opening window');
        return self.clients.openWindow('.');
      }
    })
  );
      });

    // self.addEventListener('fetch', (event) => {
    //     console.log('Fetch event:', event);
    // });
    // self.addEventListener('install', (event) => {
    //     console.log('Install event:', event);
    // });
    // self.addEventListener('activate', (event) => {
    //     console.log('Activate event:', event);
    // });
}

swInit().catch(console.error);
