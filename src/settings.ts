import { DomHook } from "./dom-hooks";
import { sailwatch } from "./sailwatch";

export class Settings extends DomHook {
    static installPrompt: any;

    app: HTMLSpanElement= undefined;
    approw: HTMLDivElement= undefined;
    clockwork: HTMLSpanElement= undefined;
    details: HTMLDetailsElement = undefined;
    notifications: HTMLSpanElement= undefined;
    

    constructor() {
        super();
        this.details = document.getElementById('settings') as HTMLDetailsElement;
        this.hook(this.details);
        if(Settings.installPrompt){
            this.approw.hidden=false;
            this.app.innerText = 'can install';
        }else{
            this.approw.hidden=true;
        }
        if('Notification' in window){
            this.notifications.innerText= window.Notification.permission;
        }else{
            this.notifications.innerText='not available';
            this.notifications.onclick=null;
        }
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

    async app_onclick(ev:MouseEvent){
        const result = await Settings.installPrompt.prompt();
        this.app.innerText = result.outcome;
    }
    
    static readonly NotificationFinals = [ 'granted', 'denied'];

    notifications_onclick(ev: MouseEvent) {
        this.notifications.innerText='checking';
        if (!("Notification" in window)) {
            this.notifications.innerText='not available';
            return;
        }
        this.notifications.innerText=Notification.permission;
        if(Settings.NotificationFinals.includes(Notification.permission)){
            return;
        }
        this.notifications.innerText='requesting';
        Notification.requestPermission().then( (permission) =>{
            this.notifications.innerText= permission;
        });
    }

    clockwork_onclick(ev: MouseEvent) {
        sailwatch.addInfo('clockwork_onclick'); 
    }
}