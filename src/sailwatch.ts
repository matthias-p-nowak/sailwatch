import { DomHook } from "./domhook";
import { NoteView } from "./note";
import { Settings } from "./settings";
import { TimeLine } from "./timeline";

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

  displayed: WeakMap<Date,DomHook> = new WeakMap();

  /** show all the garbage collected objects - for detection of memory leaks */
  debugRegistry = new FinalizationRegistry((heldvalue) => {
    console.log("garbage collected", heldvalue);
  });

  constructor() {
    super();
    this.hook(document.body);
    requestIdleCallback(() => this.initialize());
    console.log("SailWatch instantiated");
  }

  private async initialize() {
    let tl = TimeLine.instance;
    tl.addEventListener("added", this.timelineEvent.bind(this));
    this.footer.style.display = "block";
  }

  timelineEvent(event: CustomEvent) {
    console.log(event);
    if (event.detail.note != undefined) {
      let nd = this.displayed.get(event.detail.time);
      if (nd == undefined) {
        let t = DomHook.fromTemplate("NoteView");
        nd = new NoteView(t,event.detail);
        this.insert(event.detail.time, nd);
      } else {

      }
    }
  }
  
    insert(time: Date, elem: DomHook) {
        this.displayed.set(time,elem);
        this.main.appendChild(elem.root);
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
    TimeLine.instance.submitEvent({ time: new Date(), note: "", focus: true });
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

  addError(msg: string) {
    let li = document.createElement("li");
    li.innerText = msg;
    this.errors.appendChild(li);
  }
}

export let sailwatch: SailWatch = new SailWatch();
