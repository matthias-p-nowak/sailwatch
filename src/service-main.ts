import { serviceworker } from './serviceworker';
/// <reference lib="webworker" />
/** value to be replaced during deployment */
let gitVersion = 'currentGitVersion';
console.log(`running inside service worker gitVersion=${gitVersion}`);

let sw = self as unknown as ServiceWorkerGlobalScope;
sw.oninstall = function (event) {
    console.log("service worker is installed");
    sw.skipWaiting().then(() => {
        console.log("service worker is skipping waiting");
    });
    // event.waitUntil();
};
sw.onactivate = function (event) {
    console.log("service worker is activated");
    // event.waitUntil();
};
sw.onoffline = function (event) {
    console.log("service worker is offline");
    // event.waitUntil();
};
sw.ononline = function (event) {
    console.log("service worker is online");
    // event.waitUntil();
};

sw.onfetch = function (event) {
    console.log("service worker is fetching", event.request.url);
    event.respondWith(fetch(event.request));
};

sw.onmessage = function (event) {
    console.log("service worker is handling message", event.data);
    let d = event.data;
    if (d.gitVersion != undefined) {
        if (d.gitVersion != gitVersion) {
            console.log(`service worker is updating got ${d.gitVersion} have ${gitVersion}`);
            sw.registration.update().then(() => {
                console.log("service worker update initiated");
            });
        }
    }
};