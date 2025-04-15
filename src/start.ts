import { WebComponent } from "./component";
import { dateFmt, untilNext } from "./datefmt";
import { NewStart } from "./newstart";
import { Note } from "./note";
import { SailWatch } from "./sailwatch";
import { SailWatchDB } from "./sailwatchdb";
import { Sounds } from "./sounds";

export class Start extends WebComponent {
  starttime: HTMLSpanElement = undefined;
  fleets: HTMLSpanElement = undefined;
  duration: HTMLSpanElement = undefined;
  nowStamp: HTMLSpanElement = undefined;
  flagtime: HTMLSpanElement = undefined;
  nextflag: HTMLSpanElement = undefined;
  flagap: HTMLImageElement = undefined;
  flagx: HTMLImageElement = undefined;
  flagrecall: HTMLImageElement = undefined;
  durationrow: HTMLDivElement = undefined;
  flagrow: HTMLDivElement = undefined;
  imgrow: HTMLDivElement = undefined;
  starttimeStamp: Date;
  oldDiff = 1;
  flagtimeStamp: Date;
  fleetsData: string[];

  initialize(startTimeStamp: Date, fleets: string[]) {
    console.log(`initialize start ${startTimeStamp} ${fleets}`);
    this.starttimeStamp = new Date(startTimeStamp);
    console.log(dateFmt("%h:%i:%s", startTimeStamp));
    this.root.dataset.time = startTimeStamp.toISOString();
    this.starttime.innerText = dateFmt("%h:%i:%s", this.starttimeStamp);
    this.fleetsData = fleets.filter((f) => f.length > 0);
    this.fleets.innerText = this.fleetsData.join(", ");
    this.setFlag();
    this.countDown();
  }
  saveFresh() {
    SailWatchDB.saveEvent({
      time: this.starttimeStamp,
      event: "start",
      started: false,
      fleets: this.fleetsData,
    });
  }

  setFlag() {
    let now = new Date();
    let diff = this.starttimeStamp.getTime() - now.getTime();
    let secondsLeft = Math.floor(diff / 1000);
    if (secondsLeft < 0) return;
    let flag;
    for (let i = start_flags.length - 1; i >= 0; i--) {
      if (start_flags[i].seconds <= secondsLeft) {
        flag = start_flags[i];
        break;
      }
    }
    if (flag == undefined) return;
    this.nextflag.innerText = flag.flag;
    this.flagtimeStamp = new Date(this.starttimeStamp);
    this.flagtimeStamp.setSeconds(this.flagtimeStamp.getSeconds() - flag.seconds);
  }

  countDown() {
    let now = new Date();
    now.setMilliseconds(0);
    let diff = this.starttimeStamp.getTime() - now.getTime();
    let secondsLeft = Math.floor(diff / 1000);
    if (start_signals[secondsLeft] != undefined) {
      let signal = start_signals[secondsLeft].signal;
      console.log(diff, secondsLeft, dateFmt("%h:%i:%s", now), signal);
      try {
        Sounds.sound.playSound(signal);
      } catch (e) {
        SailWatch.sw.addErrors(`failed to play sound: ${e}`);
      }
      this.setFlag();
    }
    if (diff * this.oldDiff <= 0) {
      console.log("started...");
      this.durationrow.style.display = "none";
      this.flagrow.style.display = "none";
      this.flagap.style.display = "none";
      this.flagx.style.display = "inline";
      this.flagrecall.style.display = "inline";
      SailWatchDB.saveEvent({
        time: this.starttimeStamp,
        event: "start",
        started: true,
        fleets: this.fleetsData,
      });
      this.fleetsData.forEach((f) => {
        SailWatchDB.saveFleet({ name: f, lastUsed: this.starttimeStamp });
      });
    }
    this.oldDiff = diff;
    if (diff >= 0) {
      let dt = new Date();
      dt.setHours(0);
      dt.setMinutes(0);
      dt.setSeconds(0);
      dt.setMilliseconds(diff);
      this.duration.innerText = dateFmt("%h:%i:%s", dt);
      this.nowStamp.innerText = dateFmt("%h:%i:%s", new Date());
      dt.setHours(0);
      dt.setMinutes(0);
      dt.setSeconds(0);
      let flagDiff = this.flagtimeStamp.getTime() - now.getTime();
      dt.setMilliseconds(flagDiff);
      this.flagtime.innerText = dateFmt("%h:%i:%s", dt);
    }
    if (diff >= -60_000) {
      setTimeout(() => this.countDown(), untilNext(now, 1));
    } else {
      this.imgrow.style.display = "none";
    }
    if (secondsLeft >= -45 && secondsLeft <= 330) {
      if (!this.root.classList.contains("active")) {
        console.log("activating start");
        this.flagap.style.display = "inline";
        this.flagrow.style.display = "table-row";
        this.root.classList.add("active");
      }
    } else {
      if (this.root.classList.contains("active")) {
        console.log("deactivating start");
        this.root.classList.remove("active");
      }
    }
  }

  flagap_onclick(ev: MouseEvent) {
    ev.stopPropagation();
    let note = Note.createNote(
      new Date(),
      "Flag AP raised for fleets: " + this.fleetsData.join(", ")
    );
    SailWatch.sw.insert(note);
    this.removeStart();
  }

  private removeStart() {
    SailWatchDB.deleteEvent(new Date(this.starttimeStamp));
    SailWatch.sw.remove(this.root);
    this.starttimeStamp = new Date();
    this.starttimeStamp.setFullYear(0);
  }

  flagx_onclick(ev: MouseEvent) {
    ev.stopPropagation();
    let note = Note.createNote(
      new Date(),
      "Flag X raised for fleets: " + this.fleetsData.join(", ")
    );
    SailWatch.sw.insert(note);
  }
  flagrecall_onclick(ev: MouseEvent) {
    ev.stopPropagation();
    let note = Note.createNote(
      new Date(),
      "Flag Recall raised for fleets: " + this.fleetsData.join(", ")
    );
    SailWatch.sw.insert(note);
    this.removeStart();
  }

  root_onclick(ev: MouseEvent) {
    let dt = new Date();
    dt.setMinutes(dt.getMinutes() + 5);
    if (this.starttimeStamp.getTime() < dt.getTime()) {
      return;
    }
    let newStart = NewStart.Show();
    newStart.configure(this.starttimeStamp, this.fleetsData);
    let msg = `Start removed at ${dateFmt("%h:%i:%s", this.starttimeStamp)}: ${this.fleetsData.join(", ")}`;
    let note = Note.createNote(new Date(), msg);
    SailWatch.sw.insert(note);
    this.removeStart();
    console.log(this.root);
  }
}

const start_signals = {
  0: { signal: "long" },
  1: { signal: "single" },
  2: { signal: "single" },
  3: { signal: "single" },
  4: { signal: "single" },
  5: { signal: "single" },
  6: { signal: "double" },
  7: { signal: "double" },
  8: { signal: "double" },
  9: { signal: "double" },
  10: { signal: "double" },
  11: { signal: "triple" },
  12: { signal: "triple" },
  13: { signal: "triple" },
  14: { signal: "triple" },
  15: { signal: "triple" },
  16: { signal: "prep" },
  60: { signal: "short" },
  61: { signal: "single" },
  62: { signal: "single" },
  63: { signal: "single" },
  64: { signal: "single" },
  65: { signal: "single" },
  66: { signal: "prep" },
  120: { signal: "single" },
  121: { signal: "prep" },
  180: { signal: "double" },
  181: { signal: "prep" },
  240: { signal: "short" },
  241: { signal: "single" },
  242: { signal: "single" },
  243: { signal: "single" },
  244: { signal: "single" },
  245: { signal: "single" },
  246: { signal: "prep" },
  300: { signal: "short" },
  301: { signal: "single" },
  302: { signal: "single" },
  303: { signal: "single" },
  304: { signal: "single" },
  305: { signal: "single" },
  306: { signal: "prep" },
};

const start_flags = [
  { seconds: 0, flag: "fleet down" },
  { seconds: 60, flag: "P down" },
  { seconds: 240, flag: "P up" },
  { seconds: 300, flag: "fleet up" },
];
