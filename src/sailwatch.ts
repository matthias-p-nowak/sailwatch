import { WebComponent } from "./component";
import { dateFmt } from "./datefmt";
import { NewStart } from "./newstart";
import { Note } from "./note";
import { SailWatchDB } from "./sailwatchdb";
import { Start } from "./start";
import { TimeLine } from "./timeline";

export class SailWatch extends WebComponent {
  errors: HTMLUListElement = undefined;
  previously: HTMLDivElement = undefined;
  main: HTMLDivElement = undefined;
  footer: HTMLDivElement = undefined;
  registerFinish: HTMLDivElement = undefined;
  takeNote: HTMLDivElement = undefined;
  newStart: HTMLDivElement = undefined;
  static sw: SailWatch = undefined;
  timeLine = new TimeLine();
  displayed: Map<HTMLElement, WebComponent> = new Map();
  latestStart: Date;
  fleets: Set<string> = new Set<string>([]);

  errors_onclick(ev: MouseEvent) {
    let target = ev.target as HTMLElement;
    if (target.tagName == "LI") {
      target.remove();
    }
  }

  addErrors(msg: string) {
    let li = document.createElement("li");
    li.innerText = msg;
    this.errors.appendChild(li);
  }

  async previously_onclick(ev: MouseEvent) {
    let dt = this.timeLine.firstStamp;
    let foundSome = await this.timeLine.refresh(dt);
    if (!foundSome) {
      this.previously.style.display = "none";
    }
  }

  takeNote_onclick(ev: MouseEvent) {
    let note = Note.fromTemplate();
    note.render();
    this.insert(note);
    note.text.focus();
  }

  insert(node: WebComponent) {
    this.displayed.set(node.root, node);
    let appended = false;
    let sortTime: string;
    try {
      sortTime = node.root.dataset.time;
    } catch (e) {
      console.log(`fallback to now ${e}`);
      sortTime = new Date().toISOString();
    }
    let cl = this.main.childNodes.length;
    if (cl > 0) {
      let last = this.main.lastChild as HTMLElement;
      if (sortTime < last.dataset.time) {
        this.main.childNodes.forEach((child) => {
          if (appended) return;
          let elem = child as HTMLElement;
          if (elem.dataset.time > sortTime) {
            this.main.insertBefore(node.root, elem);
            appended = true;
          }
        });
      }
    }
    if (!appended) {
      this.main.appendChild(node.root);
    }
  }

  newStart_onclick(ev: MouseEvent) {
    NewStart.Show();
  }

  registerFinish_onclick(ev: MouseEvent) {
    this.addErrors("registerFinish_onclick");
  }

  async refreshTimeLine() {
    // clear out main
    this.main.replaceChildren();
    let dt=new Date();
    dt.setFullYear(dt.getFullYear()+100);
    await this.timeLine.refresh(dt);
  }

  addStart(startTimeStamp: Date, fleets: string[]): Start {
    fleets.filter((f) => f.length > 0).forEach((f) => this.fleets.add(f));
    this.latestStart = startTimeStamp;
    window.localStorage.setItem("latestStart", this.latestStart.toISOString());
    let start = Start.fromTemplate();
    start.initialize(startTimeStamp, fleets);
    this.insert(start);
    return start;
  }

  onstorage(ev: StorageEvent) {
    console.log(`got a storage event ${ev.url}(${ev.key})= ${ev.newValue}`);
    if (ev.key == null) {
      console.log("key is null");
      return;
    }
    let functionName = "on_" + ev.key;
    let fn = this[functionName];
    if (typeof fn == "function") {
      console.log(`invoking ${functionName}(${ev.newValue})`);
      fn.bind(this)(ev.newValue);
    }
  }

  on_latestStart(value: string) {
    console.log(`got latest start ${value}`);
    this.latestStart = new Date(value);
  }

  on_SailWatch(value: string) {
    this.addErrors(`got SailWatch ${value}`);
    console.log(`got SailWatch ${value}`);
    window.focus();
  }

  static async Start(gitVersion: string) {
    this.sw = SailWatch.fromElement(document.body);
    window.sw = this.sw;
    await SailWatchDB.ready;
    this.sw.footer.style.display = "block";
    this.sw.refreshTimeLine();
    window.onstorage = this.sw.onstorage.bind(this.sw);
    document.addEventListener("visibilitychange", () => {
      this.sw.addErrors(`visibilitychange ${document.visibilityState}`);
      if (!document.hidden) {
        window.localStorage.setItem(
          "SailWatch",
          "visible " + dateFmt("%y-%m-%d %h:%i:%s", new Date())
        );
      }
    });
  }
}
