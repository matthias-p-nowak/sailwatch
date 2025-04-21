
type EventBase = { time: Date };

export class TimeLine extends EventTarget {
    private constructor() {
        super();
        console.log("timeline instantiated");
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
        let had = this.events.has(event.time);
        this.events.set(event.time, event);
        if (!had) {
            this.dispatchEvent(new CustomEvent('added', { detail: event }));
        }
    }

}