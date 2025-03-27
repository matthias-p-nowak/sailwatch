import { SailWatch } from "./sailwatch";

declare global {
  interface Window {
    ask4Notifications: (ev: MouseEvent) => void;
    installApp: (ev: MouseEvent) => void;
    resizeTextArea: () => void;
    sw: SailWatch;
    refreshSwStatus: (ev: MouseEvent) => void;
    updateServiceWorker: (ev: MouseEvent) => void;
  }
}
