import { SailwatchDatabase } from "./database";
import { dateFmt } from "./datefmt";
import { DomHook } from "./domhook";
import { sailwatch } from "./sailwatch";
import { startSequence } from "./sequence";
import { Sounds } from "./sounds";
import { TimeEvent, TimeLine } from "./timeline";
import { WakeWaki } from "./wakelock";

export class NewStart extends DomHook {
  // #region html
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
    let latest = new Date(tl.getLatestEvent(Date.now()));
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
    console.log(sailwatch.fleets);
    let fleets = Array.from(sailwatch.fleets).sort();
    fleets.forEach((fleet) => {
      let span = document.createElement("span");
      span.innerText = fleet;
      this.fleets.appendChild(span);
    });
    this.fleets.appendChild(this.newfleet);
    this.cancel.focus();
  }

  show(te: TimeEvent | null) {
    this.initializeNewStart();
    if (te) {
      let startTimeStamp = new Date(te.time).toISOString();
      let found = false;
      Array.from(this.times.children).forEach((ch) => {
        if ((ch as HTMLElement).dataset.timeStamp == startTimeStamp) {
          ch.classList.add("selected");
          found = true;
        }
      });
      if (!found) {
        let span = document.createElement("span");
        span.innerText = dateFmt("%h:%i:%s", new Date(te.time));
        span.dataset.timeStamp = startTimeStamp;
        span.classList.add("selected");
        this.times.appendChild(span);
      }
      Array.from(this.fleets.children).forEach((ch) => {
        let st = (ch as HTMLElement).innerText;
        if (te.fleets.includes(st)) {
          ch.classList.add("selected");
        }
      })
    }
    this.dialog.showModal();
  }
  // #endregion

  // #region event handlers
  cancel_onclick(ev: MouseEvent) {
    this.dialog.close();
  }

  newfleet_onblur(ev: MouseEvent) {
    let fleet = this.newfleet.value.trim();
    this.newfleet.value = "";
    if (fleet.length < 1) return;
    sailwatch.fleets.add(fleet);
    SailwatchDatabase.instance.saveFleet({ name: fleet, lastUsed: Date.now() });
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
      .filter((ch) => (ch as HTMLSpanElement).innerText.trim().length > 0)
      .map((ch) => (ch as HTMLElement).innerText);
    this.dialog.close();
    let tl = TimeLine.instance;
    tl.submitEvent({ time: this.currentStart.getTime(), fleets: fleetNames, start: "planned" });
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
    this.root.addEventListener("update", this.update.bind(this));
    // adding the steps with the different actions, all of them
    if (data.time > Date.now() && data.start == "planned") {
      startSequence.forEach((step) => {
        let st = new Date(data.time);
        st.setSeconds(st.getSeconds() - step.time);
        console.log("step", step, dateFmt("%h:%i:%s", st));
        if (st.getTime() > Date.now()+1000) {
          // more than a second into the future
          setTimeout(this.startStep.bind(this, step, true), st.getTime() - Date.now());
        } else {
          // less than a second into the future, carrying them out in order
          setTimeout(this.startStep.bind(this, step, false), 1000 - step.time);
        }
      });
      // count down the seconds for the last 6 minutes
      for (let i = 0; i < 360; ++i) {
        let t = new Date(data.time);
        t.setSeconds(t.getSeconds() - i);
        if (t.getTime() < Date.now()+1000) break;
        // still in the future
        setTimeout(this.timeStep.bind(this, i), t.getTime() - Date.now());
      }
      // count down the minutes
      for (let m = 7; ; ++m) {
        let t = new Date(data.time);
        t.setMinutes(t.getMinutes() - m);
        if (t.getTime() < Date.now()) break;
        setTimeout(this.timeStep.bind(this, m * 60), t.getTime() - Date.now());
      }
    }
  }

  update(ce: CustomEvent) {
    console.log("start update by event", ce.detail);
    this.data = ce.detail as TimeEvent;
    if (this.data.start == "aborted") {
      this.root.remove();
      return;
    }
    this.render();
  }

  table_onclick(ev: MouseEvent) {
    if (this.data.time <= Date.now())
      return;
    NewStart.instance.show(this.data);
    let tl = TimeLine.instance;
    tl.submitEvent({ time: this.data.time });
    this.root.remove();
  }

  flagap_onclick(ev: MouseEvent) {
    let tl = TimeLine.instance;
    this.data.start = "aborted";
    this.data.source = 'edit';
    tl.submitEvent(this.data);
    let msg = 'aborted start: ' + dateFmt("%h:%i:%s", new Date(this.data.time)) + ', fleet ' + this.data.fleets.join(", ");
    tl.submitEvent({ time: Date.now(), note: 'flag "Answering Pennant" was raised. ' + msg });
    this.root.remove();
  }

  flagx_onclick(ev: MouseEvent) {
    let tl = TimeLine.instance;
    tl.submitEvent({ time: this.data.time });
    let msg = 'Start: ' + dateFmt("%h:%i:%s", new Date(this.data.time)) + ', fleet ' + this.data.fleets.join(", ");
    tl.submitEvent({ time: Date.now(), note: 'flag "X" was raised. ' + msg });
  }

  flagrecall_onclick(ev: MouseEvent) {
    let tl = TimeLine.instance;
    this.data.start = "aborted";
    this.data.source = 'edit';
    tl.submitEvent(this.data);
    let msg = 'recalled start: ' + dateFmt("%h:%i:%s", new Date(this.data.time)) + ', fleet ' + this.data.fleets.join(", ");
    tl.submitEvent({ time: Date.now(), note: 'flag "First Repeater" was raised. ' + msg });
    this.root.remove();
  }

  timeStep(before: number) {
    if (this.data.start == 'aborted') {
      console.log("no start", this.data);
      return;
    }
    // check if clock has gone right
    {
      let expected=Date.now()+before*1000;
      let diff=expected-this.data.time;
      if(diff>1000 || diff<-1000) {
        sailwatch.addError(`clock went wrong ${diff}`);
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
    }
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
      this.untilrow.hidden = false;
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
      if (
        StartView.currentStart != undefined &&
        StartView.currentStart.getTime() != this.data.time
      ) {
        if (StartView.currentStart.getTime() > Date.now()) {
          Array.from(this.root.getElementsByTagName("span")).forEach((ch) => {
            ch.style.color = "red";
          });
        }
      }
      StartView.currentStart = new Date(this.data.time);
    }
  }

  startStep(step: any, play: boolean) {
    if (this.data.start == 'aborted') {
      return;
    }
    // console.log("start step", step);
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
    if (step.sound != undefined && play) {
      // console.log("playing " + step.sound);
      Sounds.instance.play(step.sound);
    }
    if (step.lock != undefined) {
      WakeWaki.instance.run();
    }
    if (step.scroll != undefined) {
      this.root.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  render() {
    this.starttime.innerText = dateFmt("%h:%i:%s", new Date(this.data.time));
    if (this.data.fleets != undefined) {
      this.fleets.innerText = this.data.fleets.join(", ");
    }
    this.flagap.hidden = true;
    this.flagx.hidden = true;
    this.flagrecall.hidden = true;
    this.imgrow.hidden = true;
    this.untilrow.hidden = true;
    this.flagrow.hidden = true;
  }
}

export class StartTable extends DomHook {
  starts: HTMLDivElement = undefined;
  constructor() {
    super();
    let t = DomHook.fromTemplate('StartTable');
    this.hook(t);
  }
}
export class StartRow extends DomHook {
  starttime: HTMLSpanElement = undefined;
  fleets: HTMLSpanElement = undefined;
  constructor(ev: TimeEvent) {
    super();
    let t = DomHook.fromTemplate('StartRow');
    this.hook(t);
    this.starttime.innerText = dateFmt("%h:%i:%s", new Date(ev.time));
    this.fleets.innerText = ev.fleets.join(", ");
  }
} 