import { WebComponent } from "./component";
import { SailWatch } from "./sailwatch";
import { dateFmt } from "./datefmt";

export class Start extends WebComponent {
    starttime: HTMLSpanElement = undefined;
    fleets: HTMLSpanElement = undefined;
    duration: HTMLSpanElement = undefined;
    flagtime: HTMLSpanElement = undefined;
    nextflag: HTMLSpanElement = undefined;
    flagap: HTMLImageElement = undefined;
    flagx: HTMLImageElement = undefined;
    flagrecall: HTMLImageElement = undefined;
    durationrow: HTMLDivElement = undefined;
    flagrow: HTMLDivElement = undefined;

    initialize(startTimeStamp: Date, fleets: string[]) {
        SailWatch.sw.addErrors('initialize start');
        console.log(`initialize start ${startTimeStamp} ${fleets}`);
        console.log( dateFmt("%h:%i:%s", startTimeStamp));
        try{
            this.root.dataset.time = startTimeStamp.toISOString();
        }catch(e){
            console.log(`error ${e}`);
        }
    }
}