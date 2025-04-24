import { DomHook } from "./domhook";

export class Settings extends DomHook {

    refresh() {
        console.log('refreshing settings');
    }
    static installPrompt: any;
    
    details: HTMLDetailsElement = undefined;
    private constructor() {
        super();
        console.log('settings constructor');
        this.details=document.getElementById('settings') as HTMLDetailsElement;
        this.hook(this.details);
    }

    private static _instance: Settings = undefined;
    static get instance(): Settings {
        return Settings._instance || (Settings._instance = new Settings());
    }

    settings_onclick(ev: MouseEvent) {
        let target = ev.target as HTMLElement;
        if (target == null) {
            this.details.open = false;
            return;
        }
        if (target.onclick != undefined && target != this.details) {
            return;
        }
        console.log('settings_onclick');
        this.details.open = false;    
    }
}
