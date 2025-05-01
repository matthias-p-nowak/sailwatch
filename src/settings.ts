import { dateFmt } from "./datefmt";
import { DomHook } from "./domhook";
import { Keeper } from "./keeper";

export class Settings extends DomHook {
  static installPrompt: any;

  app: HTMLSpanElement = undefined;
  approw: HTMLDivElement = undefined;
  lifesign: HTMLSpanElement = undefined;
  details: HTMLDetailsElement = undefined;
  notifications: HTMLSpanElement = undefined;

  /**
   * constructor
   */
  private constructor() {
    super();
    console.log("settings constructor");
    this.details = document.getElementById("settings") as HTMLDetailsElement;
    this.hook(this.details);
  }

  private static _instance: Settings = undefined;
  static get instance(): Settings {
    return Settings._instance || (Settings._instance = new Settings());
  }

  static setInstallPrompt(event: any) {
    Settings.installPrompt = event;
  }

  settings_onclick(ev: MouseEvent) {
    let target = ev.target as HTMLElement;
    if (target == null) {
      this.details.open = false;
      return;
    }
    console.log("settings_onclick " + new Date().toLocaleString());
    let details = target.closest("details");
    if (details == null) {
      this.details.open = false;
      return;
    }
    this.details.open = false;
    const lifesign = Keeper.instance.lifesign;
    if (lifesign != undefined) {
      this.lifesign.innerText = dateFmt("%h:%i:%s", lifesign);
    }
  }

  app_onclick(ev: MouseEvent) {
    ev.stopPropagation();
    if (Settings.installPrompt == undefined) {
      this.app.innerText = 'cannot install';
      return;
    }
    Settings.installPrompt.prompt().then((result) => {
      this.app.innerText = result.outcome;
    });
  }

  static readonly NotificationFinals = ["granted", "denied"];

  notifications_onclick(ev: MouseEvent) {
    ev.stopPropagation();
    this.notifications.innerText = "checking";
    if (!("Notification" in window)) {
      this.notifications.innerText = "not available";
      return;
    }
    this.notifications.innerText = Notification.permission;
    if (Settings.NotificationFinals.includes(Notification.permission)) {
      return;
    }
    this.notifications.innerText = "requesting";
    Notification.requestPermission().then((permission) => {
      this.notifications.innerText = permission;
    });
  }

  refresh() {
    if (Settings.installPrompt) {
      this.approw.hidden = false;
      this.app.innerText = "can install";
    } else {
      this.approw.hidden = true;
    }
    if ("Notification" in window) {
      this.notifications.innerText = window.Notification.permission;
    } else {
      this.notifications.innerText = "not available";
      this.notifications.onclick = null;
    }
  }
}
