import { ClockWork } from "./clockwork";
import { Settings } from "./settings";


/** value to be replaced during deployment */
export let mainGitVersion = "currentGitVersion";


(async () => {
  window.addEventListener("beforeinstallprompt", Settings.setInstallPrompt);
  ClockWork.instance.initialize(mainGitVersion);
  import('./sailwatch');
})();
