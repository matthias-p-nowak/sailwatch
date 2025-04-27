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
  // #endregion

  /** other */
  currentStart?: Date = undefined;

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

  othertime_onblur(ev: MouseEvent) {
    if (this.othertime.value.length < 5) {
      return;
    }
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
    tl.submitEvent({ time: this.currentStart, fleets: fleetNames, start: 'planned' });
    this.dialog.close();
    Sounds.instance.play('triple');
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

  starttime: HTMLSpanElement = undefined;
  fleets: HTMLSpanElement = undefined;
  nextflag: HTMLSpanElement = undefined;

  data: TimeEvent;


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
          setTimeout(this.startStep.bind(this, step), st.getTime() - Date.now());
        }

      });
    }
  }

  startStep(step: any) {
    console.log('start step', step);
    if (step.sound) {
      Sounds.instance.play(step.sound);
    }
    if (step.flag) {
      this.nextflag.innerText = step.flag;
    }
  }

  render() {
    this.starttime.innerText = dateFmt("%h:%i:%s", this.data.time);
    this.fleets.innerText = this.data.fleets.join(", ");
  }

}