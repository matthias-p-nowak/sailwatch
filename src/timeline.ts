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
  time: number;
  source?: string;
  finish?: string;
  sailnumber?: string;
  fleet?: string;
  fleets?: string[];
  start?: string;
  note?: string;
  focus?: boolean;
  showDate?: boolean;
};

/**
 * the global timeline, a restricted history object
 */
export class TimeLine extends EventTarget {


  /** the history */
  private history: Map<number, TimeEvent> = new Map();

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
    // console.log(`history has ${this.history.size} entries`);
    if (old == undefined) {
      // console.log("fire added");
      this.dispatchEvent(new CustomEvent("added", { detail: event }));
      return;
    }

    if (event.source == 'edit' || !areDeepEqual(old, event)) {
      delete event.source;
      console.log("updated...");
      delete event.source;
      if (Object.keys(event).length == 1) {
        console.log("fire removed");
        this.dispatchEvent(new CustomEvent("removed", { detail: event }));
        setTimeout(() => {
          console.log("deleting something from timeline");
          this.history.delete(event.time);
        }, 30_000);
      } else {
        console.log("fire updated");
        this.dispatchEvent(new CustomEvent("updated", { detail: event }));
      }
      return;
    }
  }
  getLatestEvent(dt: number): number {
    let keys = Array.from(this.history.keys());
    keys.push(dt);
    // keys.sort();
    keys.sort((a, b) => b - a);
    return keys[0];
  }

  getFirstEvent() {
    let keys = Array.from(this.history.keys());
    keys.push(Date.now());
    keys.sort((a, b) => a - b);
    return keys[0];
  }

  getStarts(): TimeEvent[] {
    return Array.from(this.history.keys())
      .filter((t) => t >= Date.now())
      .map((t) => this.history.get(t));
  }

  getNextFinish(got: TimeEvent): TimeEvent {
    let nf: TimeEvent = undefined;
    this.history.forEach((event) => {
      if (event.time <= got.time) return;
      if (event.finish == undefined) return;
      if (nf == undefined || nf.time > event.time) nf = event;
    });
    return nf;
  }

  getEvent(time: number) {
    return this.history.get(time);
  }

  getEvents() {
    return Array.from(this.history.values());
  }

  getRelatedStart(time: number, fleet: string): TimeEvent {
    let lastStart: TimeEvent = undefined;
    for (let ev of this.history.values()) {
      if (ev.fleets == undefined) continue;
      if (ev.start == 'aborted') continue;
      if (!ev.fleets.includes(fleet)) continue;
      if (ev.time > time) continue;
      if (lastStart == undefined || lastStart.time < ev.time) lastStart = ev;
    }
    return lastStart;
  }

}

export async function waitFor(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
} 
