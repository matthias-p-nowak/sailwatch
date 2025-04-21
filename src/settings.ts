import { DomHook } from "./dom-hooks";
import { sailwatch } from "./sailwatch";

export class Settings extends DomHook {
    static installPrompt: any;
    details: HTMLDetailsElement = undefined;

    constructor() {
        super();
        this.details = document.getElementById('settings') as HTMLDetailsElement;
        this.hook(this.details);
        sailwatch.addInfo('settings hooked up');
    }

    static setInstallPrompt(event: any) {
        Settings.installPrompt = event;
        sailwatch.addInfo('setInstallPrompt called');
    }

    details_onclick(ev: MouseEvent) {
        let target = ev.target as HTMLElement;
        if (target == null) {
            this.details.open = false;
            return;
        }
        if (target.onclick != undefined && target != this.details) {
            return;
        }
        this.details.open = false;
    }

}