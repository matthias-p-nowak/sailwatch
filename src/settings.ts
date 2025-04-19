import { WebComponent } from "./component";

export class Settings extends WebComponent {
    static installPrompt: any;
  gitVersion: string;

    /**
     * @param event BeforeInstallPromptEvent
     */
    static setInstallPrompt( event: any ) {
        console.log('setInstallPrompt called');
        Settings.installPrompt=event;
    }

    clockwork: HTMLSpanElement= undefined;
    summary: HTMLElement= undefined;
    app: HTMLSpanElement= undefined;
    appRow: HTMLDivElement = undefined;
    donationRow: HTMLDivElement = undefined;
    donation: HTMLAnchorElement = undefined;
    notifications: HTMLSpanElement= undefined;

    root_onclick(ev: MouseEvent) {
        let det=this.root as HTMLDetailsElement;
        let target=ev.target as HTMLElement;
        if(target == null){            
            det.open=false;
            return;
        }
        if(target.onclick != undefined && target != this.root){
            return;
        }
        det.open=false;
    }
 
    summary_onclick(ev: MouseEvent) {
        if(Settings.installPrompt ){
            this.appRow.hidden = false;
            this.app.innerText='can install';
        }else{
            this.appRow.hidden=true;
        }        
        if('Notification' in window){
            this.notifications.innerText= window.Notification.permission;
        }else{
            this.notifications.innerText='not available';
            this.notifications.onclick=null;
        }
        if(window.donation!=undefined){   
            console.log('got donation');
            this.donation.href=window.donation.href ;
            this.donation.text= window.donation.text;
        }else{
            console.log('no donation');
            this.donationRow.style.display='none';
        }
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
        console.log('clockwork_onclick');
    }


  
}