import { SailwatchDatabase } from "./database";
import { DomHook } from "./dom-hooks";
import { Settings } from "./settings";
import { EventBase, TimeLine } from "./timeline";
import { Note, NoteDisplay } from "./note";

class SailWatch extends DomHook {
  infos?: HTMLUListElement = undefined;
  errors?: HTMLUListElement = undefined;
  summary?: HTMLElement = undefined;
  footer?: HTMLDivElement = undefined;
  registerFinish?: HTMLDivElement = undefined;
  makeTable?: HTMLDivElement = undefined;
  takeNote?: HTMLDivElement = undefined;
  newStart?: HTMLDivElement = undefined;
  main?: HTMLDivElement = undefined;
  displayed: WeakMap<Element, EventBase> = new WeakMap();
  timeDisplay: WeakMap<Date, Element> = new WeakMap();

  debugRegistry = new FinalizationRegistry((heldvalue) => {
    console.log("garbage collected", heldvalue);
  });

  constructor() {
    super();
    this.hook(document.body);
    this.addInfo("all hooked up");
    requestIdleCallback(() => this.initialize());
    console.log("SailWatch instantiated");
  }

  private async initialize() {
    let tl = TimeLine.instance;
    tl.addEventListener("added", (ev: CustomEvent) => {
      SailwatchDatabase.instance.saveEvent(ev.detail);
    });
    tl.addEventListener("added", this.loadEvent.bind(this));
    // await db connection
    await SailwatchDatabase.instance.ready;
    this.footer.style.display = "block";
    this.addInfo("sailwatch initialized");
  }

  loadEvent(ev: CustomEvent) {
    let elem = this.timeDisplay.get(ev.detail.time);
    if(elem != undefined) {
      elem.dispatchEvent(new CustomEvent('update', { detail: ev.detail }));
      return;
    };
    if (ev.detail.note != undefined) {
      let note = Note.fromData(ev.detail);
        this.addInfo("note added");
        let nodeDisplay = note.render();
        this.insert(note, nodeDisplay);
        return;
    }
  }

  insert(event: EventBase, nodeDisplay: HTMLElement) {
    this.displayed.set(nodeDisplay, event);
    this.timeDisplay.set(event.time, nodeDisplay);
    this.main.appendChild(nodeDisplay);
    this.sortMain();
  }

  sortMain() {
    const desiredOrder = Array.from(this.main.children).sort((a, b) => {
      const aTime = this.displayed.get(a).time;
      const bTime = this.displayed.get(b).time;
      return bTime.getTime() - aTime.getTime();
    });
    for (let i = 0; i < desiredOrder.length; i++) {
      const current = this.main.children[i];
      const target = desiredOrder[i];

      if (current !== target) {
        this.main.insertBefore(target, current);
      }
    }
  }

  summary_onclick(ev: MouseEvent) {
    let settings = new Settings();
    this.debugRegistry.register(settings, "settings");
  }

  /**
   * allows the user to acknowledge an error and remove the entry
   * @param ev The MouseEvent that triggered the click
   */
  errors_onclick(ev: MouseEvent) {
    let target = ev.target as HTMLElement;
    if (target.tagName == "LI") {
      target.remove();
    }
  }

  infos_onclick(ev: MouseEvent) {
    let target = ev.target as HTMLElement;
    if (target.tagName == "LI") {
      target.remove();
    }
  }

  addError(msg: string) {
    let li = document.createElement("li");
    li.innerText = msg;
    this.errors.appendChild(li);
  }

  addInfo(msg: string) {
    let li = document.createElement("li");
    li.innerText = msg;
    this.infos.appendChild(li);
    li.style.height = li.scrollHeight + "px";
    li.onanimationend = () => {
      li.remove();
    };
    this.debugRegistry.register(li, "info " + msg);
  }

  takeNote_onclick(ev: MouseEvent) {
    let note = new Note();
    note.time = new Date();
    note.note = "";
    TimeLine.instance.addEvent(note.getData());
  }
}

/** the global SailWatch instance */
export let sailwatch: SailWatch = new SailWatch();
