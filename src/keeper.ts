import { TimeEvent } from "./timeline";

export class Keeper {

    private static _instance: Keeper = undefined;
    lifesign: Date;
    private constructor() {
    };

    static get instance(): Keeper {
        return Keeper._instance || (Keeper._instance = new Keeper());
    };

    initialize(gitVersion) {
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("background.js");
            console.log("background worker registered");
            navigator.serviceWorker.ready.then((reg: ServiceWorkerRegistration) => {
                console.log("background worker is ready");
                reg.active.postMessage({ gitVersion: gitVersion });
            });
            navigator.serviceWorker.addEventListener("message", this.onMessage.bind(this));
        }
    }
    onMessage(event: MessageEvent) {
        console.log('got message from backend', event.data);
        this.lifesign = new Date();
    };

    addEvent(event: CustomEvent) {
        if (event.detail.time.getTime() > Date.now()) {
            navigator.serviceWorker.ready.then((reg: ServiceWorkerRegistration) => {
                console.log('posting event', event);
                reg.active.postMessage(event.detail);
            });
        }
    };
}