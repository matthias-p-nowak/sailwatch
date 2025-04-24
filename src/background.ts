/// <reference lib="webworker" />
/** value to be replaced during deployment */
let gitVersion = 'currentGitVersion';
console.log(`running inside background thread gitVersion=${gitVersion}`);

let swgs = self as unknown as ServiceWorkerGlobalScope

swgs.oninstall = function (event) {
    console.log("background worker is installed");
    swgs.skipWaiting().then(() => {
        console.log("background worker is skipping waiting");
    });
};

swgs.onmessage = function (event) {
    // console.log("background worker is handling message", event.data);
    let d = event.data;
    if (d.gitVersion != undefined) {
        if (d.gitVersion != gitVersion) {
            console.log(`background worker is updating got ${d.gitVersion} have ${gitVersion}`);
            swgs.registration.update().then(() => {
                console.log("background worker update initiated");
            });
        }
    }
};

swgs.onfetch = function (event) {
    // console.log("background worker is fetching", event.request.url);
    event.respondWith(fetch(event.request));
};