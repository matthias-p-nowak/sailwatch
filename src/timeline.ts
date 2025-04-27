/**
 * checks if two objects are equal in the deep sense
 * @returns true is equal
 */
function areDeepEqual(obj1, obj2) {
  if (obj1 === obj2) return true;
  if (typeof obj1 !== "object" || obj1 === null || typeof obj2 !== "object" || obj2 === null) {
    return false;
  }
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) return false;
  for (let key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!areDeepEqual(obj1[key], obj2[key])) return false;
  }
  return true;
}

/** type of an object with a time field */
export type TimeEvent = {
  time: Date;
  source?: string;
  finish?: string;
  sailnumber?: string;
  fleet?: string;
  fleets?: string[];
  start?: string;
  note?: string;
  focus?: boolean;
};

/**
 * the global timeline, a restricted history object
 */
export class TimeLine extends EventTarget {

  /** the history */
  private history: Map<Date, TimeEvent> = new Map<Date, TimeEvent>();

  /** the singleton */
  private static _instance: TimeLine = undefined;
  private constructor() {
    super();
  }
  static get instance(): TimeLine {
    return this._instance || (this._instance = new TimeLine());
  }

  submitEvent(obj: TimeEvent) {
    let event = obj as TimeEvent;
    let old = this.history.get(event.time);
    this.history.set(event.time, event);
    console.log(`history has ${this.history.size} entries`);
    if (old == undefined) {
      console.log("added new");
      this.dispatchEvent(new CustomEvent("added", { detail: event }));
      return;
    }
    if (old === event || !areDeepEqual(old, event)) {
      console.log("updated...");
      delete event.source;
      if (Object.keys(event).length == 1) {
        console.log("fired removed");
        this.dispatchEvent(new CustomEvent("removed", { detail: event }));
        setTimeout(() => {
          console.log("deleting something from timeline");
          this.history.delete(event.time);
        }, 30_000);
      } else {
        console.log("fired updated");
        this.dispatchEvent(new CustomEvent("updated", { detail: event }));
      }
      return;
    }
  }
  getLatestEvent(dt: Date): Date {
    let keys = Array.from(this.history.keys());
    keys.push(dt);
    keys.sort((a, b) => b.getTime() - a.getTime());
    return keys[0];
  }
}
