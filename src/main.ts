import { sailwatch } from "./sailwatch";
import { Settings } from "./settings";

/** value to be replaced during deployment */
let gitVersion = 'currentGitVersion';

(async () => {
    window.addEventListener("beforeinstallprompt", Settings.setInstallPrompt);
    if ('serviceWorker' in navigator) {
        // let service = await 
        navigator.serviceWorker.register('service-main.js');
        console.log('service worker registered');
        navigator.serviceWorker.ready.then((reg: ServiceWorkerRegistration) => {
            console.log("service worker is ready");
            reg.active.postMessage({ gitVersion: gitVersion });
        });
    }
    sailwatch.addInfo(`running inside main thread gitVersion=${gitVersion}`);
})();