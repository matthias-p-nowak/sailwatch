/// <reference lib="webworker" />

import { dateFmt } from "./datefmt";

let swgs = self as unknown as ServiceWorkerGlobalScope;
let bypass = false;
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
};

let pingTimes = [0, 1, 5, 16, 60, 66, 70, 240, 246, 250, 300, 306, 315, 330];
let starts: Set<number> = new Set();
let pinging: Map<number, number> = new Map();
let waiting4pong=true;
/**
 * send a ping to all clients and show a notification if no clients are present
 * @param starttime the start time to check for
 */
function sendPing(starttime: number) {
  if (!starts.has(starttime)) {
    return;
  }
  console.log("sending ping");
  waiting4pong=true;
  setTimeout(() => {
    if(waiting4pong){
      swgs.registration.showNotification("Start imminent", {
        body: "need to open the app/page",
        icon: "img/sailwatch-64.png",
        badge: "img/sailwatch-192.png",
      });
    }
  },1000);
  swgs.clients.matchAll().then((clients) => {
    console.log("got clients", clients.length);
    clients.forEach((client) => {
      console.log("sending ping to client",client);
      client.postMessage({ ping: starttime });
    });
  }).catch((error) => {
    console.log("pinging error", error);
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
  waiting4pong=false;
  console.log("notification clicked");
  event.notification.close();
  event.waitUntil(swgs.clients.openWindow("."));
};

/**
 * Handles incoming messages sent to the service worker.
 *
 * - If the message contains a 'start' field, it schedules pings for the
 *   specified start time and cleans up old start times.
 * @param event - The message event containing data sent to the service worker.
 */

swgs.onmessage = function (event) {
  console.log("background worker is handling message", event.data);
  let d = event.data;
  if (d.start != undefined) {
    console.log("got start event");
    let start: number = d.time;
    starts.add(start);
    pingTimes.forEach((t) => {
      let pt = new Date(start);
      pt.setSeconds(pt.getSeconds() - t);
      const pingTime = pt.getTime();
      if (pinging.has(pingTime)) {
        this.clearTimeout(pinging.get(pingTime));
      }
      let delay = pt.getTime() - Date.now();
      if (delay > 0) {
        console.log(`will send ping in ${delay} ms at ${dateFmt("%h:%i:%s", pt)}`);
        pinging.set(pingTime, setTimeout(sendPing, delay, start));
      }
    });
    let st2rem = Array.from(starts).filter((st) => st < Date.now());
    st2rem.forEach((st) => starts.delete(st));
    return;
  }
  if (d.ping != undefined) {
    event.source.postMessage({ pong: d.ping });
  }
  if (d.bypass != undefined) {
    console.log("got bypass message", event.data.bypass);
    bypass = event.data.bypass;
  }
  if(d.pong != undefined){
    console.log("got pong");
    waiting4pong=false;
  }
};

swgs.onfetch = function (event) {
  if (event.request.url.endsWith("version") || bypass) {
    console.log("fetching ", event.request.url);
    event.respondWith(fetch(event.request));
    return;
  }
  event.respondWith(
     caches.open('sailwatch').then(async (cache) => {
    return cache.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        console.log("could serve from cache", event.request.url);
        return cachedResponse; // Serve from cache if available
      }
      return fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse.status == 200) {
            console.log("could serve from network, caching", event.request.url);
            return caches.open("sailwatch").then((cache) => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          } else {
            return this.caches.open("sailwatch").then((cache) => {
              console.log("adding to cache by request", event.request.url);
              cache.add(event.request.url);
              return networkResponse;
            });
          }
        })
        .catch(() => {
          console.log("could not serve from cache or network", event.request.url);
          return new Response("You are offline.", {
            headers: { "Content-Type": "text/plain" },
          });
        })
    })}));
};
