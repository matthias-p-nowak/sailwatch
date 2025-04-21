import { SailWatch } from "./sailwatch";

let gitVersion = 'currentGitVersion';
console.log(`running inside main thread gitVersion=${gitVersion}`);

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js');
}

window.sw = new SailWatch();
window.sw.testEvent();