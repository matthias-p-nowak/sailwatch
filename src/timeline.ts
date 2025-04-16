import { SailWatchDB } from "./sailwatchdb";
import { Note } from "./note";
import { SailWatch } from "./sailwatch";
import { Finish } from "./finish";
import { DateHeader } from "./dateheader";

export class TimeLine {
  firstStamp: Date = new Date("9999-12-31");
  lastStamp: Date = new Date("1900-01-01");
  starts: Map<string, Date[]> = new Map<string, Date[]>();

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
        this.addGoneStart(event.fleets, event.time);
        foundSome = true;
      } else if (event.sailnumber != undefined) {
        let finish = Finish.fromTemplate();
        finish.eventTime = event.time as Date;
        finish.sailnumberData = event.sailnumber || "";
        finish.fleetData = event.fleet || "";
        SailWatch.sw.insert(finish);
        finish.render();
        foundSome = true;
      }
    });
    if (foundSome) {
      console.log("refreshed timeline to", foundTime);
      let dh = new DateHeader(foundTime);
      SailWatch.sw.insert(dh);
    }
    return foundSome;
  }

  addGoneStart(fleets: string[], time: Date) {
    fleets.forEach((fleet) => {
      if (this.starts.has(fleet)) {
        this.starts.get(fleet).push(time as Date);
      } else {
        this.starts.set(fleet, [time as Date]);
      }
    });
  }

  getLastStart(fleet: string, before: Date): Date {
    let times = this.starts
      .get(fleet)
      .filter((t) => t < before)
      .sort();
    return times[times.length - 1];
  }

  private adjustTimeframe(timeStamp: Date) {
    if (timeStamp < this.firstStamp) {
      // console.log("setting firstStamp");
      this.firstStamp = timeStamp;
    }
    if (timeStamp > this.lastStamp) {
      // console.log("setting lastStamp");
      this.lastStamp = timeStamp;
    }
  }
}

// export class TimeDivision {
//   type: "start" | "note" | "finish" = undefined;
//   first: Date = undefined;
//   last: Date = undefined;
// }
