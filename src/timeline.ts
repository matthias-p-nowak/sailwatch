function deepEqual(obj1, obj2) {
  if (obj1 === obj2) return true;
  if (typeof obj1 !== "object" || obj1 === null || typeof obj2 !== "object" || obj2 === null) {
    return false;
  }
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) return false;
  for (let key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }
  return true;
}

export type EventBase = {
  time: Date;
};

export class TimeLine extends EventTarget {
  private events: Map<Date, Object> = new Map<Date, Object>();
  private static _instance: TimeLine = undefined;
  private constructor() {
    super();
  }
  static get instance(): TimeLine {
    return this._instance || (this._instance = new TimeLine());
  }

  submitEvent(obj: Object) {
    let event = obj as EventBase;
    let old = this.events.get(event.time);
    this.events.set(event.time, event);
    if (old == undefined) {
      console.log("added new");
      this.dispatchEvent(new CustomEvent("added", { detail: event }));
      return;
    }
    if (old === event || !deepEqual(old, event)) {
      console.log("updated...");
      if (Object.keys(event).length == 1) {
        this.dispatchEvent(new CustomEvent("removed", { detail: event }));
        setTimeout(() => {
          console.log("deleting something from timeline");
          this.events.delete(event.time);
        }, 30_000);
      } else {
        this.dispatchEvent(new CustomEvent("updated", { detail: event }));
      }
      return;
    }
  }
}
