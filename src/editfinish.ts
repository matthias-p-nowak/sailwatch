import { WebComponent } from "./component";
import { dateFmt } from "./datefmt";
import { Finish } from "./finish";
import { SailWatch } from "./sailwatch";

export class EditFinish extends WebComponent{
    finish: Finish;
    dialog: HTMLDialogElement = undefined;
    finished: HTMLLabelElement=undefined;
    sailnumber: HTMLInputElement = undefined;
    fleet: HTMLDivElement=undefined;
    cancel: HTMLButtonElement = undefined;
    save: HTMLButtonElement=undefined;
    next: HTMLButtonElement=undefined;
    boatFleet: string;

  static  edit(finish: Finish): EditFinish{
        let ef= EditFinish.fromElement(document.getElementById('dialogFinish'));        
        ef.dialog.show();
        ef.finish=finish;
        ef.finished.innerText=dateFmt('%h:%i:%s.%f', finish.finishTimeStamp);
        ef.sailnumber.value=finish.sailnumberData;
        ef.boatFleet=finish.fleetData;
        let fleets=Array.from(SailWatch.sw.fleets).sort();
        ef.fleet.replaceChildren();
        fleets.forEach((fl) => {
            let span=document.createElement('span');
            span.innerText=fl;
            if(fl == ef.boatFleet){
                span.classList.add('selected');
            }
            ef.fleet.appendChild(span);
        })
        return ef;
    }
    cancel_onclick(ev:MouseEvent){
        this.dialog.close();
    }

    fleet_onclick(ev:MouseEvent){   
        Array.from(this.fleet.children).forEach((ch) => {
            let sp=ch as HTMLSpanElement;
            sp.classList.remove('selected');
        });
        let span=ev.target as HTMLSpanElement;
        span.classList.add('selected');
        this.boatFleet=span.innerText;
    }

    save_onclick(ev:MouseEvent){
        this.dialog.close();
        this.finish.fleetData=this.boatFleet;
        this.finish.sailnumberData= this.sailnumber.value;
        this.finish.render();
    }

    next_onclick(ev:MouseEvent){
        let ns=this.finish.root.nextElementSibling as HTMLElement;
        this.save_onclick(ev);
        if(ns != null){
            let wc=SailWatch.sw.displayed.get(ns);
            if(wc instanceof Finish){
                EditFinish.edit(wc)
            }
            
        }
    }
}