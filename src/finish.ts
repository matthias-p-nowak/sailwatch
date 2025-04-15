import { WebComponent } from "./component";
import { dateFmt } from "./datefmt";
import { EditFinish } from "./editfinish";
import { SailWatch } from "./sailwatch";

export class Finish extends WebComponent {
    finishTime: HTMLSpanElement = undefined;
    sailNumber: HTMLSpanElement = undefined;
    fleet: HTMLSpanElement= undefined;
    finishTimeStamp: Date = undefined;
    sailnumberData: string='- sn -';
    fleetData: string='- fleet -';

    render() {
      this.finishTime.innerText=dateFmt("%h:%i:%s.%f", this.finishTimeStamp)+' t';
      this.sailNumber.innerText=this.sailnumberData;
      this.fleet.innerText=this.fleetData;
      setTimeout(() => {
          this.root.scrollIntoView({behavior:"smooth", block: "center"});        
      }, 50); 
    }

    root_onclick(ev:MouseEvent){
        EditFinish.edit(this);
    }
}
