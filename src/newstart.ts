import { WebComponent } from "./component";
import { dateFmt } from "./datefmt";
import { SailWatch } from "./sailwatch";

export class NewStart extends WebComponent {
  dialog: HTMLDialogElement = undefined;
  sailwatch: SailWatch = undefined;
  cancel: HTMLButtonElement = undefined;
  register: HTMLButtonElement = undefined;
  times: HTMLDivElement = undefined;
  othertime: HTMLInputElement = undefined;
  fleets: HTMLDivElement = undefined;
  newfleet: HTMLInputElement = undefined;

  currentStart: Date = undefined;

  show() {
    this.dialog.showModal();
    this.times.replaceChildren();
    this.fleets.replaceChildren();
    let sw = SailWatch.sw;
    let dt = new Date();
    if (sw.latestStart != undefined && sw.latestStart > dt) {
      dt = sw.latestStart;
    }
    dt.setMinutes(dt.getMinutes() + 6);
    dt.setSeconds(0);
    dt.setMilliseconds(0);
    for (let i = 0; i < 12; ++i) {
      console.log(dt);
      let dateStr = dateFmt("%h:%i:%s", dt);
      let span = document.createElement("span");
      span.innerText = dateStr;
      span.dataset.timeStamp = dt.toISOString();
      this.times.appendChild(span);
      dt.setSeconds(dt.getSeconds() + 30);
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
    SailWatch.sw.addErrors("normal time click");
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

  othertime_oninput(ev: MouseEvent) {
    SailWatch.sw.addErrors("other time input");
  }

  othertime_onblur(ev: MouseEvent) {
    SailWatch.sw.addErrors("other time blur");
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
    SailWatch.sw.addErrors("fleets click");
    let fleet = ev.target as HTMLSpanElement;
    fleet.classList.toggle("selected");
    this.checkValidStart();
  }

  newfleet_onblur(ev: MouseEvent) {
    SailWatch.sw.addErrors(`newfleet blur ${this.newfleet.value}`);
    let fleet = this.newfleet.value;
    this.newfleet.value = "";
    if (SailWatch.sw.fleets.includes(fleet)) return;
    SailWatch.sw.fleets.push(this.newfleet.value);
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
    SailWatch.sw.addStart(startTimeStamp, fleets);
  }

  checkValidStart() {
    this.register.disabled = true;
    if (this.currentStart == undefined) {
      console.log("missing start time");
      return;
    }
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
    this.register.disabled = false;
  }
}
