import { WebComponent } from "./component";
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
  fleets: string[] = [];

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
    if(!foundSome){
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
      sortTime = new Date().toISOString();
    }
    let cl = this.main.childNodes.length;
    if (cl > 0) {
      let last = this.main.lastChild as HTMLElement;
      if (sortTime < last.dataset.time) {
        this.main.childNodes.forEach((child) => {
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
    let cns = NewStart.fromElement(document.getElementById("confNewStart"));
    cns.sailwatch = this;
    cns.show();
  }

  registerFinish_onclick(ev: MouseEvent) {
    this.addErrors("registerFinish_onclick");
  }

  async refreshTimeLine() {
    // clear out main
    this.main.replaceChildren();
    await this.timeLine.refresh(new Date());
  }

  addStart(startTimeStamp: Date, fleets: string[]) {
    fleets = fleets.filter((f) => f.length > 0);
    let allFleets = new Set<string>(this.fleets);
    fleets.forEach((fleet) => allFleets.add(fleet));
    this.fleets = Array.from(allFleets).filter((f) => f.length > 0);
    window.localStorage.setItem("fleets", this.fleets.join("\n"));
    this.latestStart = startTimeStamp;
    window.localStorage.setItem("latestStart", this.latestStart.toISOString());
    let start = Start.fromTemplate();
    start.initialize(startTimeStamp, fleets);
    this.insert(start);
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
      fn(ev.newValue);
    }
  }

  on_latestStart(value: string) {
    console.log(`got latest start ${value}`);
    this.latestStart = new Date(value);
  }

  on_fleets(value: string) {
    console.log(`got fleets ${value}`);
    this.fleets = value.split("\n").filter((f) => f.length > 0);
  }

  static async Start(gitVersion: string) {
    this.sw = SailWatch.fromElement(document.body);
    window.sw = this.sw;
    await SailWatchDB.ready;
    this.sw.footer.style.display = "block";
    this.sw.refreshTimeLine();
    window.onstorage = this.sw.onstorage.bind(this.sw);
    let fleets = window.localStorage.getItem("fleets");
    if (fleets != null) {
      console.log(`got fleets ${fleets} from localStorage`);
      this.sw.on_fleets(fleets);
    }
  }
}
