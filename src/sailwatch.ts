import { Keeper } from "./keeper";
import { SailwatchDatabase } from "./database";
import { DomHook } from "./domhook";
import { NoteView } from "./note";
import { Settings } from "./settings";
import { NewStart, StartView } from "./start";
import { TimeEvent, TimeLine } from "./timeline";
import { Sounds } from "./sounds";
import { dateFmt } from "./datefmt";
import { FinishView } from "./finish";

/**
 * the global SailWatch instance
 */
export class SailWatch extends DomHook {
  /** the error and info lists */
  errors: HTMLUListElement = undefined;
  infos: HTMLUListElement = undefined;
  /** the summary at the top */
  main: HTMLDivElement = undefined;
  footer: HTMLDivElement = undefined;
  hello: HTMLDialogElement = undefined;

  mainDisplay: WeakMap<HTMLElement, number> = new WeakMap();
  fleets: Set<string> = new Set<string>();

  constructor() {
    super();
    this.hook(document.body);
    setTimeout(() => {
      this.initialize();
    }, 1);
    console.log("SailWatch instantiated");
  }

  private async initialize() {
    let tl = TimeLine.instance;
    tl.addEventListener("added", this.timelineEvent.bind(this));
    tl.addEventListener("updated", this.timelineEvent.bind(this));
    tl.addEventListener("removed", this.timelineEvent.bind(this));
    let db = SailwatchDatabase.instance;
    tl.addEventListener("added", db.saveEvent.bind(db));
    tl.addEventListener("updated", db.saveEvent.bind(db));
    tl.addEventListener("removed", db.saveEvent.bind(db));
    let cw = Keeper.instance;
    tl.addEventListener("added", cw.addEvent.bind(cw));

    await db.ready;
    setTimeout(() => {
      let tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      this.retrieveOldEntries(tomorrow.getTime());
      SailwatchDatabase.instance.getAllFleets().then((fleets) => {
        fleets.filter((f) => f.length > 0).forEach((f) => this.fleets.add(f));
      });
    }, 1);
    this.footer.style.display = "block";
  }

  retrieveOldEntries(before: number) {
    let tl = TimeLine.instance;
    let db = SailwatchDatabase.instance;
    db.getEventsBefore(before).then((events) => {
      console.log("retrieved", events.length, "events before", before);
      events.forEach((e) => tl.submitEvent(e));
    });
  }

  timelineEvent(ce: CustomEvent) {
    let event = ce.detail as TimeEvent;
    // console.log(event);
    let found = false;
    Array.from(this.main.children)
      .filter((e: HTMLElement) => this.mainDisplay.get(e) == event.time)
      .forEach((e: HTMLElement) => {
        console.log("updating a displayed main event");
        e.dispatchEvent(new CustomEvent("update", { detail: event }));
        found = true;
      });
    if (found) {
      return;
    }
    if (ce.detail.note != undefined) {
      let t = DomHook.fromTemplate("NoteView");
      let nd = new NoteView(t, ce.detail);
      this.insert(ce.detail.time, t);
    } else if (ce.detail.start != undefined) {
      let s = DomHook.fromTemplate("StartView");
      let sv = new StartView(s, ce.detail);
      this.insert(ce.detail.time, s);
    } else if (ce.detail.finish != undefined) {
      let f = DomHook.fromTemplate("FinishView");
      let fv = new FinishView(f, ce.detail);
      this.insert(ce.detail.time, f);
    } else {
      console.log("not a recognized event");
    }
  }

  _sortingId: number = 0;

  insert(time: number, elem: HTMLElement) {
    // console.log("inserting", elem, time);
    this.mainDisplay.set(elem, time);
    this.main.appendChild(elem);
    clearTimeout(this._sortingId);
    this._sortingId = setTimeout(this.sortMain.bind(this), 100);
  }

  sortMain() {
    const desiredOrder = Array.from(this.main.children).sort((a, b) => {
      const aTime = this.mainDisplay.get(a as HTMLElement);
      const bTime = this.mainDisplay.get(b as HTMLElement);
      return aTime - bTime;
    });
    for (let i = 0; i < desiredOrder.length; i++) {
      const current = this.main.children[i] as HTMLElement;
      const target = desiredOrder[i] as HTMLElement;
      target.dataset.sortedTime = dateFmt("%h:%i:%s", new Date(this.mainDisplay.get(target)));

      if (current !== target) {
        const tt = this.mainDisplay.get(target);
        const tc = this.mainDisplay.get(current);
        // console.log("sortMain, switching: ", tt, tc);
        this.main.insertBefore(target, current);
      }
    }
  }

  async start() {
    try {
      await Sounds.instance.play("prep");
    } catch (e) {
      this.hello.showModal();
    }
  }

  hello_onclick() {
    this.hello.close();
    Sounds.instance.play("ok");
  }

  infos_onclick(ev: MouseEvent) {
    let target = ev.target as HTMLElement;
    if (target.tagName == "LI") {
      target.remove();
    }
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

  summary_onclick(ev: MouseEvent) {
    ev.stopPropagation();
    Settings.instance.refresh();
  }

  takeNote_onclick(ev: MouseEvent) {
    sailwatch.addInfo("taking a note");
    TimeLine.instance.submitEvent({ time: Date.now(), note: "", focus: true });
  }

  newStart_onclick(ev: MouseEvent) {
    console.log("new start");
    let ns = NewStart.instance;
    ns.initializeNewStart();
    ns.show();
  }

  registerFinish_onclick(ev: MouseEvent) {
    console.log("register finish");
    TimeLine.instance.submitEvent({ time: Date.now(), finish: "timed" });
  }

  makeTable_onclick(ev: MouseEvent) {
    console.log("make table");
  }

  // #region notifications
  addInfo(msg: string) {
    let li = document.createElement("li");
    li.innerText = msg;
    this.infos.appendChild(li);
    li.style.height = li.scrollHeight + "px";
    li.onanimationend = () => {
      li.remove();
    };
  }

  addError(msg: string) {
    let li = document.createElement("li");
    li.innerText = msg;
    this.errors.appendChild(li);
  }
  // #endregion
}

export let sailwatch: SailWatch = new SailWatch();
