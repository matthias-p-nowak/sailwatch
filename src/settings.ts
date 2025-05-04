import { SailwatchDatabase } from "./database";
import { dateFmt } from "./datefmt";
import { DomHook } from "./domhook";
import { Keeper } from "./keeper";
import { sailwatch } from "./sailwatch";
import { TimeLine } from "./timeline";

export class Settings extends DomHook {
  static installPrompt: any;

  app: HTMLSpanElement = undefined;
  approw: HTMLDivElement = undefined;
  lifesign: HTMLSpanElement = undefined;
  details: HTMLDetailsElement = undefined;
  notifications: HTMLSpanElement = undefined;
  version: HTMLSpanElement = undefined;
  deldate: HTMLInputElement = undefined;
  share: HTMLSpanElement = undefined;
  importFile: HTMLInputElement = undefined;
  origin: HTMLSpanElement = undefined;
  agent: HTMLSpanElement = undefined;

  /**
   * constructor
   */
  private constructor() {
    super();
    console.log("settings constructor");
    this.details = document.getElementById("settings") as HTMLDetailsElement;
    this.hook(this.details);
    this.refresh();
  }

  private static _instance: Settings = undefined;
  static get instance(): Settings {
    return Settings._instance || (Settings._instance = new Settings());
  }

  static setInstallPrompt(event: any) {
    Settings.installPrompt = event;
  }

  picture_onclick(ev: MouseEvent) {
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
  }

  app_onclick(ev: MouseEvent) {
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
    this.notifications.innerText = "checking";
    if (!("Notification" in window)) {
      this.notifications.innerText = "not available";
      return;
    }
    this.notifications.innerText = Notification.permission;
    if (Settings.NotificationFinals.includes(Notification.permission)) {
      sailwatch.addInfo('use settings to change notification permission');
      return;
    }
    this.notifications.innerText = "requesting";
    Notification.requestPermission().then((permission) => {
      this.notifications.innerText = permission;
    });
  }

  dodelete_onclick(ev: MouseEvent) {
    sailwatch.addInfo('deleting data older than ' + this.deldate.value);
    let d = new Date(this.deldate.value);
    SailwatchDatabase.instance.deleteEventsBefore(d.getTime()).then(() => {
      window.location.reload();
    });
  }

  share_onclick(ev: MouseEvent) {
    sailwatch.addInfo('sharing data');
    const tl = TimeLine.instance;
    const dataObj = {
      events: tl.getEvents(),
    };
    const data = {
      title: 'sailwatch data',
      text: JSON.stringify(dataObj),
    }
    if ('share' in navigator) {
      navigator.share(data).then(() => {
        sailwatch.addInfo('data shared');
      });
    } else {
      const blob = new Blob([data.text], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.title;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  importFile_onchange(ev: Event) {
    const tl = TimeLine.instance;
    for (const file of Array.from(this.importFile.files)) {
      console.log('importing file', file);
      file.text().then((text) => {
        const data = JSON.parse(text);
        if (data.events !== undefined) {
          data.events.forEach((event) => {
            event.source = 'import';
            tl.submitEvent(event);
          })
        }
      });
    }
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
    const lifesign = Keeper.instance.lifesign;
    if (lifesign != undefined) {
      this.lifesign.innerText = dateFmt("%h:%i:%s", lifesign);
    }
    let lastversion = window.localStorage.getItem("version");
    if (lastversion != undefined) {
      this.version.innerText = lastversion;
    }
    let d = new Date();
    d.setMonth(d.getMonth() - 1);
    this.deldate.value = dateFmt("%y-%m-%d", d);
    this.origin.innerText = window.location.origin;
    let agent = window.navigator.userAgent;
    agent=agent.replaceAll(/\(.*\)/g,'');
    this.agent.innerText = agent;
  }
}
