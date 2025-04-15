import { WebComponent } from "./component";
import { dateFmt } from "./datefmt";
import { Start } from "./start";

export class SumStartRow extends WebComponent {
    starttime: HTMLSpanElement = undefined;
    fleets: HTMLSpanElement = undefined;

    render(start: Start) {
        this.starttime.innerText = dateFmt("%h:%i:%s", start.eventTime);
        this.fleets.innerText = start.fleetsData.join(", ");
    }
}