import { SailwatchDatabase } from "./database";
import { dateFmt } from "./datefmt";
import { DomHook } from "./domhook";
import { sailwatch } from "./sailwatch";
import { startSequence } from "./sequence";
import { Sounds } from "./sounds";
import { TimeEvent, TimeLine } from "./timeline";

export class NewStart extends DomHook {
  // #region html elements
  fleets: HTMLDivElement = undefined;
  newfleet: HTMLInputElement = undefined;
  othertime: HTMLInputElement = undefined;
  register: HTMLButtonElement = undefined;
  dialog: HTMLDialogElement = undefined;
  signal: HTMLSpanElement = undefined;
  times: HTMLDivElement = undefined;
  cancel: HTMLButtonElement = undefined;
  // #endregion

  /** other */
  currentStart?: Date = undefined;
  changingTime: boolean = false;

  // #region singleton
  private static _instance: NewStart = undefined;
  private constructor() {
    super();
    this.dialog = document.getElementById("NewStart") as HTMLDialogElement;
    this.hook(this.dialog);
    console.log("NewStart initialized", this);
  }
  static get instance(): NewStart {
    return this._instance || (this._instance = new NewStart());
  }
  // #endregion

  // #region initialization
  initializeNewStart() {
    this.times.replaceChildren();
    this.fleets.replaceChildren();
    let tl = TimeLine.instance;
    let latest = tl.getLatestEvent(new Date());
    latest.setSeconds(latest.getSeconds() + 330);
    latest.setSeconds(latest.getSeconds() - (latest.getSeconds() % 15));
    latest.setMilliseconds(0);
    for (let i = 0; i < 12; ++i) {
      let dateStr = dateFmt("%h:%i:%s", latest);
      let span = document.createElement("span");
      span.innerText = dateStr;
      span.dataset.timeStamp = latest.toISOString();
      this.times.appendChild(span);
      latest.setSeconds(latest.getSeconds() + 15);
    }
    let dateStr = dateFmt("%h:%i:%s", latest);
    this.othertime.value = dateStr;
    this.times.appendChild(this.othertime);
    let fleets = Array.from(sailwatch.fleets).sort();
    fleets.forEach((fleet) => {
      let span = document.createElement("span");
      span.innerText = fleet;
      this.fleets.appendChild(span);
    });
    this.fleets.appendChild(this.newfleet);
    this.cancel.focus();
  }

  show() {
    this.dialog.showModal();
  }
  // #endregion

  // #region event handlers
  cancel_onclick(ev: MouseEvent) {
    this.dialog.close();
  }

  newfleet_onblur(ev: MouseEvent) {
    let fleet = this.newfleet.value;
    this.newfleet.value = "";
    if (fleet.length < 1) return;
    if (sailwatch.fleets.has(fleet)) return;
    sailwatch.fleets.add(this.newfleet.value);
    SailwatchDatabase.instance.saveFleet({ name: fleet, lastUsed: new Date() });
    let span = document.createElement("span");
    span.innerText = fleet;
    span.classList.add("selected");
    this.fleets.appendChild(span);
    this.fleets.appendChild(this.newfleet);
    this.checkValidStart();
  }

  times_onclick(ev: MouseEvent) {
    Array.from(this.times.children).forEach((ch) => {
      ch.classList.remove("selected");
    });
    let curr = ev.target as HTMLSpanElement;
    curr.classList.add("selected");
    this.currentStart = new Date(curr.dataset.timeStamp);
    this.changingTime = false;
    this.checkValidStart();
  }

  fleets_onclick(ev: MouseEvent) {
    let fleet = ev.target as HTMLSpanElement;
    fleet.classList.toggle("selected");
    this.checkValidStart();
  }

  othertime_onclick(ev: MouseEvent) {
    ev.stopPropagation();
    sailwatch.addInfo("other time click");
    Array.from(this.times.children).forEach((ch) => {
      ch.classList.remove("selected");
    });
  }

  othertime_oninput(ev: InputEvent) {
    this.changingTime = true;
  }

  othertime_onblur(ev: MouseEvent) {
    if (this.othertime.value.length < 5) {
      return;
    }
    if (!this.changingTime) return;
    const [hours, minutes] = this.othertime.value.split(":");
    this.currentStart = new Date();
    this.currentStart.setHours(parseInt(hours));
    this.currentStart.setMinutes(parseInt(minutes));
    this.currentStart.setSeconds(0);
    this.currentStart.setMilliseconds(0);
    let dateStr = dateFmt("%h:%i:%s", this.currentStart);
    let span = document.createElement("span");
    span.classList.add("selected");
    span.innerText = dateStr;
    span.dataset.timeStamp = this.currentStart.toISOString();
    this.times.appendChild(span);
    this.times.appendChild(this.othertime);
    this.checkValidStart();
  }

  register_onclick(ev: MouseEvent) {
    let fleetNames = Array.from(this.fleets.children)
      .filter((ch) => ch.classList.contains("selected"))
      .map((ch) => (ch as HTMLElement).innerText);
    let tl = TimeLine.instance;
    tl.submitEvent({ time: this.currentStart, fleets: fleetNames, start: "planned" });
    this.dialog.close();
    Sounds.instance.play("triple");
  }

  // #endregion

  checkValidStart() {
    this.register.disabled = true;
    this.signal.innerText = " -- ";
    if (this.currentStart == undefined || isNaN(this.currentStart.getHours())) {
      console.log("missing start time");
      return;
    }
    this.currentStart.getFullYear;
    let possible = new Date();
    possible.setMinutes(possible.getMinutes() + 5);
    if (this.currentStart < possible) {
      console.log("start not possible");
      return;
    }
    let numFleets = 0;
    Array.from(this.fleets.children).forEach((ch) => {
      if (ch.classList.contains("selected")) {
        ++numFleets;
      }
    });
    if (numFleets == 0) {
      console.log("no fleets selected");
      return;
    }
    let timeString = dateFmt("%h:%i:%s", this.currentStart);
    this.signal.innerText = timeString;
    this.register.disabled = false;
  }
}

export class StartView extends DomHook {
  // #region elements
  starttime: HTMLSpanElement = undefined;
  fleets: HTMLSpanElement = undefined;
  duration: HTMLSpanElement = undefined;
  nowStamp: HTMLSpanElement = undefined;
  flagtime: HTMLSpanElement = undefined;
  nextflag: HTMLSpanElement = undefined;
  untilrow: HTMLDivElement = undefined;
  flagrow: HTMLDivElement = undefined;
  imgrow: HTMLDivElement = undefined;
  flagap: HTMLImageElement = undefined;
  flagx: HTMLImageElement = undefined;
  flagrecall: HTMLImageElement = undefined;
  // #endregion

  data: TimeEvent;
  static currentStart: Date = undefined;

  constructor(root: HTMLElement, data: TimeEvent) {
    super();
    this.data = data;
    this.hook(root);
    this.render();

    if (data.time.getTime() > Date.now()) {
      startSequence.forEach((step) => {
        let st = new Date(data.time);
        st.setSeconds(st.getSeconds() - step.time);
        if (st.getTime() > Date.now()) {
          setTimeout(this.startStep.bind(this, step, true), st.getTime() - Date.now());
        } else {
          setTimeout(this.startStep.bind(this, step, false), 1000 - step.time);
        }
      });
      for (let i = 0; i < 360; ++i) {
        let t = new Date(data.time);
        t.setSeconds(t.getSeconds() - i);
        if (t.getTime() < Date.now()) break;
        setTimeout(this.timeStep.bind(this, i), t.getTime() - Date.now());
      }
      for (let m = 7; ; ++m) {
        let t = new Date(data.time);
        t.setMinutes(t.getMinutes() - m);
        if (t.getTime() < Date.now()) break;
        setTimeout(this.timeStep.bind(this, m * 60), t.getTime() - Date.now());
      }
    }
  }

  timeStep(before: number) {
    if (before > 360) {
      console.log("only minutes");
      let m = Math.floor(before / 60);
      this.duration.innerText = m.toString() + " min";
      this.nowStamp.innerText = "";
      this.untilrow.hidden = false;
      return;
    }
    if (before > 0) {
      this.flagrow.hidden = false;
    }
    // console.log("with seconds");
    let dur = new Date();
    this.nowStamp.innerText = dateFmt("%h:%i:%s", dur);
    dur.setHours(0);
    dur.setMinutes(0);
    dur.setMilliseconds(0);
    dur.setSeconds(before);
    this.duration.innerText = dateFmt("%i:%s", dur);
    let nextSignal = before;
    if (nextSignal > 300) nextSignal -= 300;
    else if (nextSignal > 240) nextSignal -= 240;
    else if (nextSignal > 60) nextSignal -= 60;
    dur.setMinutes(0);
    dur.setSeconds(nextSignal);
    this.flagtime.innerText = dateFmt("%i:%s", dur);
    if (before < 315) {
      if (StartView.currentStart != undefined && StartView.currentStart != this.data.time) {
        if (StartView.currentStart.getTime() > Date.now()) {
          Array.from(this.root.getElementsByTagName("span")).forEach((ch) => {
            ch.style.color = "red";
          });
        }
      }
      StartView.currentStart = this.data.time;
    }
  }

  startStep(step: any, play: boolean) {
    console.log("start step", step);
    if (step.sound != undefined && play) {
      console.log("playing " + step.sound);
      Sounds.instance.play(step.sound);
    }
    if (step.flag != undefined) {
      this.nextflag.innerText = step.flag;
    }
    if (step.flagrow != undefined) this.flagrow.hidden = !step.flagrow;
    if (step.ap != undefined) this.flagap.hidden = !step.ap;
    if (step.xgt != undefined) this.flagx.hidden = this.flagrecall.hidden = !step.xgt;
    if (step.imgrow != undefined) this.imgrow.hidden = !step.imgrow;
    if (step.untilrow != undefined) this.untilrow.hidden = !step.untilrow;
    if (step.attention != undefined) {
      if (step.attention) {
        this.root.classList.add("attention");
      } else {
        this.root.classList.remove("attention");
      }
    }
  }

  render() {
    this.starttime.innerText = dateFmt("%h:%i:%s", this.data.time);
    this.fleets.innerText = this.data.fleets.join(", ");
    this.flagap.hidden = true;
    this.flagx.hidden = true;
    this.flagrecall.hidden = true;
    this.imgrow.hidden = true;
    this.untilrow.hidden = true;
    this.flagrow.hidden = true;
  }
}
