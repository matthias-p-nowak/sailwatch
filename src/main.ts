import { sailwatch } from "./sailwatch";


/** value to be replaced during deployment */
export let mainGitVersion = "currentGitVersion";
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
  sailwatch.addInfo(`running inside main thread gitVersion=${mainGitVersion}`);
})();
