import { TimeLine } from "./timeline";

export class SailWatch {
    testEvent() {
        let tl = TimeLine.getInstance();
        tl.addEventListener('added', ev => console.log('added', ev));
        tl.addEvent(new Date(), { time: new Date(), note: 'submarine' })
    }

}