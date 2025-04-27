import { Keeper } from "./keeper";
import { Settings } from "./settings";


/** value to be replaced during deployment */
export let mainGitVersion = "currentGitVersion";


(async () => {
  window.addEventListener("beforeinstallprompt", Settings.setInstallPrompt);
  Keeper.instance.initialize(mainGitVersion);
  import('./sailwatch');
})();
