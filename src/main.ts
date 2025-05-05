import { Keeper } from "./keeper";
import { sailwatch } from "./sailwatch";
import { Settings } from "./settings";

(async () => {
  console.log("starting main.ts");
  window.addEventListener("beforeinstallprompt", Settings.setInstallPrompt);
  Keeper.instance.initialize();
  sailwatch.start();
})();
