import { SailWatch } from "./sailwatch";

declare global {
  interface Window {
    ask4Notifications: (ev: MouseEvent) => void;
    resizeTextArea: (event:InputEvent) => void;
    sw: SailWatch;
    refreshSwStatus: (ev: MouseEvent) => void;
    updateServiceWorker: (ev: MouseEvent) => void;
    gitVersion: string;
  }
}
