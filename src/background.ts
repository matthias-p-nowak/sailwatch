/// <reference lib="webworker" />
/** value to be replaced during deployment */
let gitVersion = 'currentGitVersion';
console.log(`running inside background thread gitVersion=${gitVersion}`);

let swgs = self as unknown as ServiceWorkerGlobalScope

/**
 * The install event is triggered when the service worker is installed, which
 * is the best moment to skip waiting for older versions of the service worker
 * to finish up. This will allow the new version of the service worker to
 * activate and start serving the web page.
 */
swgs.oninstall = function (event) {
    console.log("background worker is installed");
    swgs.skipWaiting().then(() => {
        console.log("background worker is skipping waiting");
    });
};

/**
 * The activate event is triggered when the service worker is activated, which
 * is the moment when all old versions of the service worker have finished up.
 * This is the best moment to take control of all the clients that are currently
 * open. This is done by calling the claim() method on the clients.
 */
swgs.onactivate = function (event) {
    event.waitUntil(swgs.clients.claim());
}

let pingTimes = [1, 16, 66, 246, 306, 336];
let starts: Set<Date> = new Set();

/**
 * send a ping to all clients and show a notification if no clients are present
 * @param start the start time to check for
 */
function sendPing(start: Date) {
    if (!starts.has(start)) {
        return;
    }
    console.log('sending ping');
    swgs.clients.matchAll().then((clients) => {
        let numberOfClients = 0;
        clients.forEach((client) => {
            client.postMessage({ ping: start });
            numberOfClients++;
        });
        if (numberOfClients == 0) {
            console.log('no clients');
            swgs.registration.showNotification('Start imminent', {
                body: 'need to open the app/page',
                icon: 'img/sailwatch-64.png',
                badge: 'img/sailwatch-192.png',
            });
        }
    });
    swgs.registration.showNotification('Background start', {
        body: 'got a start event from front',
        icon: 'img/sailwatch-64.png',
        badge: 'img/sailwatch-192.png',
    });
}

/**
 * Handles notification click events by closing the notification and opening
 * the application in a new window if not already open 
 * (the notification is shown when no window is shown).
 * 
 * @param event - The notification click event object.
 */

swgs.onnotificationclick = function (event) {
    console.log('notification clicked');
    event.notification.close();
    event.waitUntil(swgs.clients.openWindow('.'));
}

/**
 * Handles incoming messages sent to the service worker.
 * 
 * - If the message contains a 'start' field, it schedules pings for the
 *   specified start time and cleans up old start times.
 * 
 * - If the message contains a 'gitVersion' field that differs from the 
 *   current version, it initiates an update for the service worker.
 * 
 * @param event - The message event containing data sent to the service worker.
 */

swgs.onmessage = function (event) {
    // console.log("background worker is handling message", event.data);
    let d = event.data;
    if (d.start != undefined) {
        console.log('got start event');
        let start = d.time;
        starts.add(start);
        pingTimes.forEach((t) => {
            let pt = new Date(start);
            pt.setSeconds(pt.getSeconds() - t);
            let delay = pt.getTime() - Date.now();
            if (delay > 0) {
                console.log(`will send ping in ${delay} ms`);
                setTimeout(sendPing, delay, start);
            }
        });
        let st2rem = Array.from(starts).filter((st) => st.getTime() < Date.now());
        st2rem.forEach((st) => starts.delete(st));
        return;
    }
    if (d.gitVersion != undefined) {
        if (d.gitVersion != gitVersion) {
            console.log(`background worker is updating got ${d.gitVersion} have ${gitVersion}`);
            swgs.registration.update().then(() => {
                console.log("background worker update initiated");
            });
        }
        event.source.postMessage({ ping: Date.now(), gitVersion: gitVersion });
        return;
    }
};

/**
 * Handles requests from the page to fetch resources.
 * TODO: add caching
 * @param event - The event containing the request to be fetched.
 */
swgs.onfetch = function (event) {
    // console.log("background worker is fetching", event.request.url);
    event.respondWith(fetch(event.request));
};
