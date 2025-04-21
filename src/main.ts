import { sw } from "./sailwatch";

/** value to be replaced during deployment */
let gitVersion = 'currentGitVersion';

(async () => {
    console.log(`running inside main thread gitVersion=${gitVersion}`);
    sw.ping();
    if ('serviceWorker' in navigator) {
        // let service = await 
        navigator.serviceWorker.register('service-main.js');
        console.log('service worker registered');
        navigator.serviceWorker.ready.then((reg: ServiceWorkerRegistration) => {
            console.log("service worker is ready");
            reg.active.postMessage({ gitVersion: gitVersion });
        });
    }
})();