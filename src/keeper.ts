import { sailwatch } from "./sailwatch";

export class Keeper {
  private static _instance: Keeper = undefined;
  lifesign: Date;
  private constructor() { }

  static get instance(): Keeper {
    return Keeper._instance || (Keeper._instance = new Keeper());
  }

  initialize() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("background.js");
      console.log("background worker registered");
      navigator.serviceWorker.addEventListener("message", this.onMessage.bind(this));
      fetch("version")
        .then((r) => r.text())
        .then((t) => {
          t = t.trim();
          let lastversion = window.localStorage.getItem("version");
          window.localStorage.setItem("version", t);
          if (t == "bypass") {
            window.caches.delete("sailwatch").then(() => {              
              navigator.serviceWorker.ready.then((reg) => {
                console.log("informing background worker to bypass");
                reg.active.postMessage({ bypass: true });
              });
            });
          } else if (lastversion != t) {
            console.log("new version", t);
            window.caches.delete("sailwatch").then(() => {    
              console.log("deleted cache");          
              navigator.serviceWorker.ready.then((reg: ServiceWorkerRegistration) => {
                console.log("informing background worker to reload and not bypass");
                reg.active.postMessage({ bypass: false });
              });
              window.location.reload();
            });
          }else{
            console.log("got same old version", t);            
          }
        });
      navigator.serviceWorker.ready.then((reg: ServiceWorkerRegistration) => {
        console.log("background worker is ready");
        reg.active.postMessage({ ping: true });
      });
    }
  }
  onMessage(event: MessageEvent) {
    console.log("got message from backend", event.data);
    this.lifesign = new Date();
    if (event.data.info != undefined) {
      sailwatch.addInfo(event.data.info);
    }
    if(event.data.ping !=undefined){
      // console.log("got ping, sending pong");
      navigator.serviceWorker.ready.then((reg: ServiceWorkerRegistration) => {
        reg.active.postMessage({ pong: true });
        // console.log("sent pong");
      });
    }
  }

  addEvent(event: CustomEvent) {
    if (event.detail.time > Date.now()) {
      navigator.serviceWorker.ready.then((reg: ServiceWorkerRegistration) => {
        console.log("posting event", event);
        reg.active.postMessage(event.detail);
      });
    }
  }
}
