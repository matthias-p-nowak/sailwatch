import { SailWatchDB } from "./sailwatchdb";
import { Note } from "./note";
import { SailWatch } from "./sailwatch";

export class TimeLine {
  
  events: Map<Date, Object> = new Map();
  hasMorePreviouslyEvents: boolean = true;
  
  async refresh(dt: Date) {
    let cursor= await SailWatchDB.getEventsBefore(this, dt);
    console.log('running cursor');
    cursor.forEach((event) => {
      this.events.set(event.time as Date, event);
      if(event.note){
        let note=Note.fromTemplate();
        note.timeStamp=event.time as Date;
        note.text.value=event.note;
        note.render();
        SailWatch.sw.insert(note);
      }
    });
    console.log('cursor done');
  }
  
  getFirstTimeStamp(): Date {
    let keys=Array.from(this.events.keys());
    if(keys.length==0) 
      return new Date();
    keys.sort();
    return keys[0];
  }

}
