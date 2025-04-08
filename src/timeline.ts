import { SailWatchDB } from "./sailwatchdb";
import { Note } from "./note";
import { SailWatch } from "./sailwatch";

export class TimeLine {
  firstStamp: Date = new Date('9999-12-31');
  lastStamp: Date = new Date('1900-01-01');

  async refresh(dt: Date) {
    let events= await SailWatchDB.getEventsBefore(dt);
    events.forEach((event) => {
      if(event.note){
        let note=Note.fromTemplate();
        note.timeStamp=event.time as Date;
        this.adjustTimeframe(note.timeStamp);
        note.text.value=event.note;
        note.render();
        SailWatch.sw.insert(note);
      }
    });
    console.log(events);
  }

  private adjustTimeframe(timeStamp: Date) {
    if (timeStamp < this.firstStamp) {
      console.log('setting firstStamp');
      this.firstStamp = timeStamp;
    }
    if(timeStamp > this.lastStamp){
      console.log('setting lastStamp');
      this.lastStamp=timeStamp;
    }
  }
}

export class TimeDivision {
  type: "start" | "note" | "finish" = undefined;
  first: Date = undefined;
  last: Date = undefined;
}
