import { sailwatch } from "./sailwatch";
import { Settings } from "./settings";


/** value to be replaced during deployment */
export let mainGitVersion = "currentGitVersion";
(async () => {
    window.addEventListener("beforeinstallprompt", Settings.setInstallPrompt);
  // prompt
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("background.js");
    console.log("background worker registered");
    navigator.serviceWorker.ready.then((reg: ServiceWorkerRegistration) => {
      console.log("background worker is ready");
      reg.active.postMessage({ gitVersion: mainGitVersion });
    });
  }
  sailwatch.addInfo(`running inside main thread gitVersion=${mainGitVersion}`);
})();
