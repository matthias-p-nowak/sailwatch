/// <reference lib="webworker" />
/** value to be replaced during deployment */
let gitVersion = "currentGitVersion";
console.log(`running inside background thread gitVersion=${gitVersion}`);

let swgs = self as unknown as ServiceWorkerGlobalScope;

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

const cachedKeys = new Set<string>();

/**
 * The activate event is triggered when the service worker is activated, which
 * is the moment when all old versions of the service worker have finished up.
 * This is the best moment to take control of all the clients that are currently
 * open. This is done by calling the claim() method on the clients.
 */
swgs.onactivate = function (event) {
  event.waitUntil(
    swgs.clients.claim().then(() => {
      console.log("background worker has claimed clients");
      swgs.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ starts: starts.size });
        });
      });
    })
  );
  swgs.caches.open("sailwatch").then((c) => {
    c.keys().then((keys) => {
      keys.forEach((key) => {
        console.log("cache has url-key", key.url);
        cachedKeys.add(key.url);
      });
    });
  });
};

let pingTimes = [0, 1, 5, 16, 60, 66, 70, 240, 246, 250, 300, 306, 315, 336];
let starts: Set<Date> = new Set();
let pinging: Map<Date, number> = new Map();

/**
 * send a ping to all clients and show a notification if no clients are present
 * @param start the start time to check for
 */
function sendPing(start: Date) {
  if (!starts.has(start)) {
    return;
  }
  console.log("sending ping");
  swgs.clients.matchAll().then((clients) => {
    let numberOfClients = 0;
    clients.forEach((client) => {
      client.postMessage({ ping: start });
      numberOfClients++;
    });
    if (numberOfClients == 0) {
      console.log("no clients");
      swgs.registration.showNotification("Start imminent", {
        body: "need to open the app/page",
        icon: "img/sailwatch-64.png",
        badge: "img/sailwatch-192.png",
      });
    }
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
  console.log("notification clicked");
  event.notification.close();
  event.waitUntil(swgs.clients.openWindow("."));
};

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
    console.log("got start event");
    let start = d.time;
    starts.add(start);
    pingTimes.forEach((t) => {
      let pt = new Date(start);
      pt.setSeconds(pt.getSeconds() - t);
      if (pinging.has(pt)) {
        this.clearTimeout(pinging.get(pt));
      }
      let delay = pt.getTime() - Date.now();
      if (delay > 0) {
        // console.log(`will send ping in ${delay} ms`);
        pinging.set(pt, setTimeout(sendPing, delay, start));
      }
    });
    let st2rem = Array.from(starts).filter((st) => st.getTime() < Date.now());
    st2rem.forEach((st) => starts.delete(st));
    return;
  }
  if (d.gitVersion != undefined) {
    if (d.gitVersion != gitVersion) {
      console.log(`background worker is updating, got ${d.gitVersion} have ${gitVersion}`);
      swgs.caches.delete("sailwatch");
      swgs.registration.update().then(() => {
        console.log("background worker update initiated");
      });
    }
    event.source.postMessage({ ping: Date.now(), gitVersion: gitVersion });
    return;
  }
};

// /**
//  * Handles requests from the page to fetch resources.
//  * @param event - The event containing the request to be fetched.
//  */
// swgs.onfetch = function (event) {
//   //console.log("background worker is fetching", event.request.url);
//   if (cachedKeys.has(event.request.url)) {
//     console.log("could server from cache", event.request.url);
//     // event.respondWith(swgs.caches.match(event.request));
//     // return;
//   }
//   event.waitUntil(
//     fetch(event.request)
//       .then((r) => {
//         if (r.status == 200 && r.type == "basic" && !cachedKeys.has(event.request.url)) {
//           let clone = r.clone();
//           swgs.caches.open("sailwatch").then((c) => {
//             console.log("caching", event.request.url);
//             c.put(event.request, clone);
//             cachedKeys.add(event.request.url);
//           });
//         } else {
//           console.log("not caching from request", event.request.url);
//           swgs.caches.open("sailwatch").then((c) => {
//             c.add(event.request.url).then(() => {
//               console.log("caching separately", event.request.url);
//               cachedKeys.add(event.request.url);
//             });
//           });
//         }
//         return r;
//       })
//       .catch(() => {
//         return swgs.caches.match(event.request);
//       })
//       .catch((e) => {
//         console.log("failed to serve from cache", e);
//         throw e;
//       })
//   );
// };

swgs.addEventListener("fetch", (event: FetchEvent) => {
  event.respondWith(
    // Here you decide what to respond with
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse; // Serve from cache if available
      }
      return fetch(event.request)
        .then((networkResponse) => {
          // Optionally cache the new file
          return caches.open("sailwave").then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          // If offline or failed, you can serve a fallback response
          return new Response("You are offline.", {
            headers: { "Content-Type": "text/plain" },
          });
        });
    })
  );
});
