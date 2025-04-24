import { SailWatch } from "./sailwatch";

/** value to be replaced during deployment */
let mainGitVersion = "currentGitVersion";
(async () => {
  console.log(`running inside main thread gitVersion=${mainGitVersion}`);
  // prompt
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("background.js");
    console.log("background worker registered");
    navigator.serviceWorker.ready.then((reg: ServiceWorkerRegistration) => {
      console.log("background worker is ready");
      reg.active.postMessage({ gitVersion: mainGitVersion });
    });
  }
  let sailwatch = new SailWatch(document.body);
})();
