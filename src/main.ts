import { Keeper } from "./keeper";
import { sailwatch } from "./sailwatch";
import { Settings } from "./settings";

(async () => {
  window.addEventListener("beforeinstallprompt", Settings.setInstallPrompt);
  Keeper.instance.initialize();
  sailwatch.start();
})();
