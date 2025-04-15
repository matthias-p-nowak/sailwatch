import { SailWatchDB } from "./sailwatchdb";
import { Note } from "./note";
import { SailWatch } from "./sailwatch";
import { Start } from "./start";
import { Finish } from "./finish";
import { DateHeader } from "./dateheader";

export class TimeLine {
  firstStamp: Date = new Date("9999-12-31");
  lastStamp: Date = new Date("1900-01-01");

  async refresh(dt: Date): Promise<boolean> {
    let events = await SailWatchDB.getEventsBefore(dt);
    let foundSome = false;
    let foundTime: Date = undefined;
    events.forEach((event) => {
      foundTime = event.time as Date;
      this.adjustTimeframe(event.time);
      if (event.note) {
        console.log("adding note");
        let note = Note.fromTemplate();
        note.timeStamp = event.time as Date;
        note.text.value = event.note;
        note.render();
        SailWatch.sw.insert(note);
        foundSome = true;
      } else if (event.started !== undefined) {
        console.log("adding start");
        SailWatch.sw.addStart(event.time, event.fleets);
        foundSome = true;
      } else if (event.sailnumber != undefined) {
        console.log("adding finish");
        foundSome = true;
      }
    });
    if (foundSome) {
      console.log("refreshed timeline to", foundTime);
      let dh=new DateHeader(foundTime);
      SailWatch.sw.insert(dh);
    }
    return foundSome;
  }

  private adjustTimeframe(timeStamp: Date) {
    if (timeStamp < this.firstStamp) {
      console.log("setting firstStamp");
      this.firstStamp = timeStamp;
    }
    if (timeStamp > this.lastStamp) {
      console.log("setting lastStamp");
      this.lastStamp = timeStamp;
    }
  }
}

export class TimeDivision {
  type: "start" | "note" | "finish" = undefined;
  first: Date = undefined;
  last: Date = undefined;
}
