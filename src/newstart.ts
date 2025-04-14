import { WebComponent } from "./component";
import { dateFmt } from "./datefmt";
import { SailWatch } from "./sailwatch";
import { Sounds } from "./sounds";

export class NewStart extends WebComponent {
  dialog: HTMLDialogElement = undefined;
  cancel: HTMLButtonElement = undefined;
  register: HTMLButtonElement = undefined;
  times: HTMLDivElement = undefined;
  othertime: HTMLInputElement = undefined;
  fleets: HTMLDivElement = undefined;
  newfleet: HTMLInputElement = undefined;
  signal: HTMLSpanElement = undefined;

  currentStart: Date = undefined;

  render() {
    this.dialog.showModal();
    this.times.replaceChildren();
    this.fleets.replaceChildren();
    let sw = SailWatch.sw;
    let dt = new Date();
    if (sw.latestStart != undefined && sw.latestStart > dt) {
      dt = sw.latestStart;
    }
    dt.setSeconds(dt.getSeconds() + 330);
    dt.setSeconds(dt.getSeconds() - (dt.getSeconds() % 15));
    dt.setMilliseconds(0);
    for (let i = 0; i < 12; ++i) {
      console.log(dt);
      let dateStr = dateFmt("%h:%i:%s", dt);
      let span = document.createElement("span");
      span.innerText = dateStr;
      span.dataset.timeStamp = dt.toISOString();
      this.times.appendChild(span);
      dt.setSeconds(dt.getSeconds() + 15);
    }
    let dateStr = dateFmt("%h:%i:%s", dt);
    this.othertime.value = dateStr;
    this.times.appendChild(this.othertime);
    sw.fleets.forEach((fleet) => {
      let span = document.createElement("span");
      span.innerText = fleet;
      this.fleets.appendChild(span);
    });
    this.fleets.appendChild(this.newfleet);
  }

  times_onclick(ev: MouseEvent) {
    console.log(ev);
    Array.from(this.times.children).forEach((ch) => {
      ch.classList.remove("selected");
    });
    let curr = ev.target as HTMLSpanElement;
    curr.classList.add("selected");
    this.currentStart = new Date(curr.dataset.timeStamp);
    this.checkValidStart();
  }

  othertime_onclick(ev: MouseEvent) {
    ev.stopPropagation();
    SailWatch.sw.addErrors("other time click");
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

  fleets_onclick(ev: MouseEvent) {
    let fleet = ev.target as HTMLSpanElement;
    fleet.classList.toggle("selected");
    this.checkValidStart();
  }

  newfleet_onblur(ev: MouseEvent) {
    let fleet = this.newfleet.value;
    this.newfleet.value = "";
    if (fleet.length < 1) return;
    if (SailWatch.sw.fleets.has(fleet)) return;
    SailWatch.sw.fleets.add(this.newfleet.value);
    let span = document.createElement("span");
    span.innerText = fleet;
    span.classList.add("selected");
    this.fleets.appendChild(span);
    this.fleets.appendChild(this.newfleet);
    this.checkValidStart();
  }
  cancel_onclick(ev: MouseEvent) {
    this.dialog.close();
  }

  register_onclick(ev: MouseEvent) {
    this.dialog.close();
    let startTimeStamp = this.currentStart;
    let fleets: string[] = [];
    Array.from(this.fleets.children).forEach((ch) => {
      if (ch.classList.contains("selected")) {
        let span = ch as HTMLSpanElement;
        let fleet = span.innerText;
        fleets.push(fleet);
      }
    });
    let start = SailWatch.sw.addStart(startTimeStamp, fleets);
    start.saveFresh();
    // Sounds.retrieveAllSounds();
    Sounds.sound.playSound("triple");
  }

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

  static Show(): NewStart {
    let cns = NewStart.fromElement(document.getElementById("confNewStart"));
    cns.render();
    return cns;
  }

  configure(starttimeStamp: Date, fleetsData: string[]) {
    this.currentStart = starttimeStamp;
    let dateStr = dateFmt("%h:%i:%s", this.currentStart);
    let span = document.createElement("span");
    span.classList.add("selected");
    span.innerText = dateStr;
    span.dataset.timeStamp = this.currentStart.toISOString();
    this.times.prepend(span);
    Array.from(this.fleets.children).forEach((ch) => {
      let span = ch as HTMLSpanElement;
      if (fleetsData.includes(span.innerText)) {
        span.classList.add("selected");
      }
    });
  }
}
