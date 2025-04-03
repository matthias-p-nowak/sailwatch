import { SailWatchDB } from "./sailwatchdb";
import { Note } from "./note";
import { SailWatch } from "./sailwatch";

export class TimeLine {
  async refresh() {
    let store = SailWatchDB.db.transaction(["events"], "readonly").objectStore("events");
    let range = IDBKeyRange.lowerBound(Date.now(), false);
    let events = [];
    await new Promise((resolve, reject) => {      
      let request =store.openCursor(range,'prev');
      let prevDate:Date = undefined;
      request.onsuccess = function (ev) {
        const cursor = request.result;
        if(cursor==null){
          resolve(null);
          return;
        }else{
          let value=cursor.value;
          let timeStamp=value.time as Date;
          if(prevDate==undefined){
            prevDate=timeStamp;
          }else if(prevDate.getDay()!= timeStamp.getDay() ||
          prevDate.getMonth()!= timeStamp.getMonth() || prevDate.getFullYear()!= timeStamp.getFullYear()){
            resolve(null);
            return;
          }
          events.push(value);
          cursor.continue();
        }
      };      
    });
    events.forEach((event) => {
      if(event.note){
        let note=Note.fromTemplate();
        note.timeStamp=event.time as Date;
        note.text.value=event.note;
        note.render();
        SailWatch.sw.insert(note);
      }
    });
    console.log(events);
  }
}

export class TimeDivision {
  type: "start" | "note" | "finish" = undefined;
  first: Date = undefined;
  last: Date = undefined;
}
