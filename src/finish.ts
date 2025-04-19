import { WebComponent } from "./component";
import { dateFmt } from "./datefmt";
import { EditFinish } from "./editfinish";
import { SailWatch } from "./sailwatch";

export class Finish extends WebComponent {
    finishTime: HTMLSpanElement = undefined;
    sailNumber: HTMLSpanElement = undefined;
    fleet: HTMLSpanElement= undefined;
    sailed: HTMLSpanElement= undefined;
    sailnumberData: string='';
    fleetData: string='';

    render() {
      this.finishTime.innerText=dateFmt("%h:%i:%s.%f", this.eventTime);
      this.sailNumber.innerText=this.sailnumberData;
      this.fleet.innerText=this.fleetData;
      setTimeout(() => {
          this.root.scrollIntoView({behavior:"smooth", block: "center"});  
          if(this.fleetData.length>0){
            try{

                let start=SailWatch.sw.timeLine.getLastStart(this.fleetData, this.eventTime);
                let duration=this.eventTime.getTime()-start.getTime();
                let ts=new Date();
                ts.setHours(0);
                ts.setMinutes(0);
                ts.setSeconds(0);
                ts.setMilliseconds(duration);
                this.sailed.innerText=dateFmt("%h:%i:%s", ts);
            }catch(e){
                console.log(e);
            }
          }
              
      }, 50); 
    }

    root_onclick(ev:MouseEvent){
        EditFinish.edit(this);
    }
}
