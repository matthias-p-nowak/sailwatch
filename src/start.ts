import { WebComponent } from "./component";
import { SailWatch } from "./sailwatch";

export class Start extends WebComponent {
    starttime: HTMLSpanElement = undefined;
    fleets: HTMLSpanElement = undefined;
    duration: HTMLSpanElement = undefined;
    flagtime: HTMLSpanElement = undefined;
    nextflag: HTMLSpanElement = undefined;
    flagap: HTMLImageElement = undefined;
    flagx: HTMLImageElement = undefined;
    flagrecall: HTMLImageElement = undefined;

    initialize(startTimeStamp: Date, fleets: string[]) {
        SailWatch.sw.addErrors('initialize start');
        this.root.dataset.time = startTimeStamp.toISOString();
    }
}