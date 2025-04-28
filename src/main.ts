import { Keeper } from "./keeper";
import { sailwatch } from "./sailwatch";
import { Settings } from "./settings";


/** value to be replaced during deployment */
export let mainGitVersion = "currentGitVersion";


(async () => {
  window.addEventListener("beforeinstallprompt", Settings.setInstallPrompt);
  Keeper.instance.initialize(mainGitVersion);
  sailwatch.start();
})();
