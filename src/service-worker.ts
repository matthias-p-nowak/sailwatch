/// <reference lib="webworker" />


let gitVersion='currentGitVersion';
console.log(`running inside service worker gitVersion=${gitVersion}`);

let sw=self as unknown as ServiceWorkerGlobalScope;


sw.oninstall = function (event) {
    console.log("service worker is installed");
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
sw.ononline= function (event) {
    console.log("service worker is online");
    // event.waitUntil();
};

sw.onfetch = function (event) {
    console.log("service worker is fetching");
    event.respondWith(fetch(event.request));
};