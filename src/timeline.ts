import { sailwatch } from "./sailwatch";

export type EventBase = { time: Date, getData(): Object };

function deepEqual(obj1, obj2) {
    if (obj1 === obj2) return true;  
    if (typeof obj1 !== 'object' || obj1 === null ||
        typeof obj2 !== 'object' || obj2 === null) {
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
  

export class TimeLine extends EventTarget {
    private constructor() {
        super();
        setTimeout(() => {
            sailwatch.addInfo('timeline instantiated');
        }, 50);
    }

    private static instance: TimeLine = undefined;
    events: Map<Date, Object> = new Map<Date, Object>();

    /**
     * @returns the only instance of TimeLine
     */
    static getInstance(): TimeLine {
        return this.instance || (this.instance = new TimeLine());
    }

    /**
     * adds an event to the timeline
     * @param dt the date of the event
     * @param event the event to add
     * @fires added
     */
    addEvent<T extends EventBase>(dt: Date, event: T) {
        let old=this.events.get(event.time);
        this.events.set(event.time, event);
        if (!deepEqual(old, event)) {
            this.dispatchEvent(new CustomEvent('added', { detail: event }));
        }
    }

}