import { WebComponent } from "./component";
import { dateFmt } from "./datefmt";
import { NewStart } from "./newstart";
import { Note } from "./note";
import { SailWatchDB } from "./sailwatchdb";
import { Start } from "./start";
import { TimeLine } from "./timeline";
import { Sounds } from "./sounds";
import { Finish } from "./finish";

export class SailWatch extends WebComponent {
  errors: HTMLUListElement = undefined;
  previously: HTMLDivElement = undefined;
  main: HTMLDivElement = undefined;
  footer: HTMLDivElement = undefined;
  registerFinish: HTMLDivElement = undefined;
  takeNote: HTMLDivElement = undefined;
  newStart: HTMLDivElement = undefined;
  dialogStart: HTMLDialogElement = undefined;

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
    let sortTime: Date;
    try {
      sortTime = node.eventTime;
    } catch (e) {
      console.log(`fallback to now ${e}`);
      sortTime = new Date();
    }
    let cl = this.main.childNodes.length;
    if (cl > 0) {
      let last = this.main.lastChild as HTMLElement;
      if (sortTime < this.displayed.get(last).eventTime) {
        this.main.childNodes.forEach((child) => {
          if (appended) return;
          let elem = child as HTMLElement;
          if (this.displayed.get(elem).eventTime > sortTime) {
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

  remove(elem: HTMLElement) {
    this.displayed.delete(elem);
    elem.remove();
  }

  newStart_onclick(ev: MouseEvent) {
    NewStart.Show();
  }

  registerFinish_onclick(ev: MouseEvent) {
    let finish=Finish.fromTemplate();
    finish.eventTime=new Date();
    finish.render();
    SailWatch.sw.insert(finish);
    SailWatchDB.saveEvent({time: finish.eventTime, sailnumber: ''});
  }

  async refreshTimeLine() {
    // clear out main
    this.main.replaceChildren();
    let dt = new Date();
    dt.setFullYear(dt.getFullYear() + 100);
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

  dialogStart_onclick(ev: MouseEvent) {
    this.dialogStart.close();
    Sounds.sound.playSound("prep");
  }

  static async Start(gitVersion: string) {
    this.sw = SailWatch.fromElement(document.body);
    window.sw = this.sw;
    await SailWatchDB.ready;
    this.sw.footer.style.display = "block";
    this.sw.refreshTimeLine();
    this.sw.fleets= new Set(await SailWatchDB.getFleets());
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
    Sounds.retrieveAllSounds();
    try{
      Sounds.sound.playSound("prep");
    }catch(e){      
      console.log('need interaction with user to play sound');
      this.sw.dialogStart.showModal();
    }
  }

 
}
