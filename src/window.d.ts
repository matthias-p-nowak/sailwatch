import { SailWatch } from "./sailwatch";


declare global {
  interface Window {
    sw: SailWatch;
  }
}
