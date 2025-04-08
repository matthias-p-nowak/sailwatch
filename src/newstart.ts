import { WebComponent } from "./component";
import { dateFmt } from "./datefmt";
import { SailWatch } from "./sailwatch";

export class NewStart extends WebComponent {
  dialog: HTMLDialogElement = undefined;
  sailwatch: SailWatch = undefined;
  cancel: HTMLButtonElement = undefined;
  register: HTMLButtonElement = undefined;
  times: HTMLDivElement=undefined;
  othertime: HTMLInputElement= undefined;

  show() {
    this.dialog.showModal();
    let sw = SailWatch.sw;
    let dt=new Date();
    if(sw.latestStart != undefined && sw.latestStart > dt) {	
      dt=sw.latestStart;
    }
    dt.setMinutes(dt.getMinutes() + 6);
    dt.setSeconds(0);
    dt.setMilliseconds(0);
    for(let i=0;i<12;++i){
      console.log(dt);
      let dateStr=dateFmt('%h:%i:%s',dt);
      let span=document.createElement('span');
      span.innerText=dateStr;
      span.dataset.timeStamp=dt.toISOString();
      this.times.appendChild(span);
      dt.setSeconds(dt.getSeconds() + 30);
    }
    let dateStr=dateFmt('%h:%i:%s',dt);
    this.othertime.value=dateStr;
    this.times.appendChild(this.othertime);
  }

  times_onclick(ev: MouseEvent) {
    SailWatch.sw.addErrors('normal time click');
  }

  othertime_onclick(ev: MouseEvent) {
    ev.stopPropagation();
    SailWatch.sw.addErrors('other time click');
  }

  cancel_onclick(ev: MouseEvent) {
    this.dialog.close();
  }
  register_onclick(ev: MouseEvent) {
    this.dialog.close();
    console.log("### more implementation needed");
  }
}
