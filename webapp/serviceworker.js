// Note: This is the service worker file that will be registered in the browser
console.log('Hello World from service worker');

async function swInit() {
    const dt= new Date();
    const hr=dt.getHours();
    const mn=dt.getMinutes();
    const sc=dt.getSeconds();
    console.log('start time:',hr+':'+mn+':'+sc);
    setTimeout(() => {
        console.log('Hello World from service worker again');
        self.registration.showNotification('Hello World', {
            body: 'Hello World from service worker',
        });      
    }, 5_000);

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
