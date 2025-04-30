import { dateFmt } from "./datefmt";
import { DomHook } from "./domhook";
import { sailwatch } from "./sailwatch";
import { TimeEvent } from "./timeline";

export class FinishView extends DomHook {
  data: TimeEvent;

  // #region hooks
  table: HTMLElement = undefined;
  finishTime: HTMLSpanElement = undefined;
  sailNumber: HTMLSpanElement = undefined;
  fleet: HTMLSpanElement = undefined;
  sailed: HTMLSpanElement = undefined;
  // #endregion

  constructor(root: HTMLElement, public event: TimeEvent) {
    super();
    this.hook(root);
    this.data = event;
    this.render();
  }

  table_onclick(ev: MouseEvent) {
    sailwatch.addInfo("editing finish time");
  }

  render() {
    this.finishTime.innerText = dateFmt("%h:%i:%s", new Date(this.data.time));
    if (this.data.sailnumber == undefined) {
      this.sailNumber.innerText = "- sn -";
    } else {
      this.sailNumber.innerText = this.data.sailnumber;
    }
    if (this.data.fleet == undefined) {
      this.fleet.innerText = "- fleet -";
    } else {
      this.fleet.innerText = this.data.fleet;
    }
    if (this.data.fleets?.length > 0) {
      this.sailed.innerText = "to be calculated";
    } else {
      this.sailed.innerText = "sailed";
    }
  }
}
