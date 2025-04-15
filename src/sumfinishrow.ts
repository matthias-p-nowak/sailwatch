import { WebComponent } from "./component"; 
import { dateFmt } from "./datefmt";
import { Finish } from "./finish";

export class SumFinishRow extends WebComponent {
    finishTime: HTMLSpanElement = undefined;
    sailNumber: HTMLSpanElement = undefined;
    fleet: HTMLSpanElement = undefined;
    sailed: HTMLSpanElement = undefined;

    render(finish: Finish) {
        this.finishTime.innerText = dateFmt("%h:%i:%s.%f", finish.eventTime);
        this.sailNumber.innerText = finish.sailnumberData;
        this.fleet.innerText = finish.fleetData;
        this.sailed.innerText= finish.sailed.innerText;
      }
  
}