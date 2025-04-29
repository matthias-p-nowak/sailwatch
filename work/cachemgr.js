console.log('got background worker 2', new Date());

self.oninstall = function (event) {
    console.log("background worker is installed");
    self.skipWaiting().then(() => {
        console.log("background worker is skipping waiting");
        clients.forEach((client) => {
            client.postMessage({ bgs: 'started' });
        });
    });
};

self.onactivate = function (event) {
    console.log("background worker is activated");
    event.waitUntil(
        self.clients.claim().then(() => {
            console.log("background worker has claimed clients");
        })
    );
}

let bypass = false;

self.onmessage = function (event) {
    console.log("background worker is receiving message", event.data);
    if (event.data.bypass != undefined) {
        console.log('got bypass message', event.data.bypass);
        bypass = event.data.bypass;
    }
}

self.onfetch = function (event) {
    if (event.request.url.endsWith('version') || bypass) {
        console.log('got version request, bypassing cache');
        event.respondWith(fetch(event.request));
        return;
    }
    // console.log("background worker2 is fetching", event.request.url);
    event.respondWith(
        // Here you decide what to respond with
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                console.log("could serve from cache", event.request.url);
                return cachedResponse; // Serve from cache if available
            }
            return fetch(event.request)
                .then((networkResponse) => {
                    console.log("could serve from network", event.request.url);
                    return caches.open("tmp").then((cache) => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                })
                .catch(() => {
                    console.log("could not serve from cache or network", event.request.url);
                    return new Response("You are offline.", {
                        headers: { "Content-Type": "text/plain" },
                    });
                });
        })
    );
};
