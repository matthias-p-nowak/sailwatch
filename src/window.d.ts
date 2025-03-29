import { SailWatch } from "./sailwatch";

declare global {
  interface Window {
    /** 
     * Asks the user for notification permission
    */
    ask4Notifications: (ev: MouseEvent) => void;
    /**
 * Formats a date according to a given format
 * @param fmt {string} Date format %y-%m-%d %h:%i:%s or similar
 * @param dt {Date} date to format
 * @returns {string} formatted date
 */
    dateFmt: (fmt: string, dt: Date) => string;
    /**
     * resizes a textarea to show all lines
     * @param event 
     */
    resizeTextArea: (event: InputEvent) => void;
    /**
     * The SailWatch instance
     */
    sw: SailWatch;
    /**
     * refreshes the status of the service worker
     */
    refreshSwStatus: (ev: MouseEvent) => void;
    /**
     * updates the service worker
     */
    updateServiceWorker: (ev: MouseEvent) => void;
    /**
     * The current git version
     */
    gitVersion: string;
  }
}
