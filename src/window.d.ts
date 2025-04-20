import { SailWatch } from "./sailwatch";


declare global {
  interface Window {
    sw: SailWatch;
    donation: { href: string; text: string };
  }
}
