import { dateFmt } from "./datefmt";
import { DomHook } from "./domhook";
import { sailwatch } from "./sailwatch";
import { TimeEvent, TimeLine } from "./timeline";

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
    root.addEventListener('update', this.update.bind(this));
  }

  table_onclick(ev: MouseEvent) {
    let efv = EditFinishView.instance.show(this.data);
  }

  update(ev: CustomEvent) {
    console.log("finish update by event", ev.detail);
    this.data = ev.detail as TimeEvent;
    this.render();
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

class EditFinishView extends DomHook {
  finished: HTMLLabelElement = undefined;
  fleet: HTMLDivElement = undefined;
  dialog: HTMLDialogElement = undefined;
  cancel: HTMLButtonElement = undefined;
  save: HTMLButtonElement = undefined;
  next: HTMLButtonElement = undefined;
  sailnumber: HTMLInputElement = undefined;

  data: TimeEvent;
  private constructor(data: TimeEvent) {
    super();
    this.dialog = document.getElementById("EditFinish") as HTMLDialogElement;
    this.hook(this.dialog);
  }
  private static _instance: EditFinishView;
  static get instance(): EditFinishView {
    return this._instance || (this._instance = new EditFinishView(null));
  }

  show(data: TimeEvent) {
    this.data = data;
    this.render();
    this.dialog.showModal();
  }

  cancel_onclick(ev: MouseEvent) {
    this.dialog.close();
  }
  save_onclick(ev: MouseEvent) {
    this.saveData();
    this.dialog.close();
  }
  next_onclick(ev: MouseEvent) {
    this.saveData();
    this.dialog.close();
    let nf = TimeLine.instance.getNextFinish(this.data);
    if (nf == undefined || nf == null) return;
    this.show(nf);
  }

  fleet_onclick(ev: MouseEvent) {
    let t = ev.target as HTMLSpanElement;
    if (t.tagName == "SPAN") {
      Array.from(this.fleet.children).forEach((ch) => {
        ch.classList.remove("selected");
      })
      t.classList.toggle("selected");
    }
  }

  render() {
    console.log('editing finish', this.data);
    this.finished.innerText = dateFmt("%h:%i:%s", new Date(this.data.time));
    if (this.data.sailnumber != undefined)
      this.sailnumber.value = this.data.sailnumber;
    else
      this.sailnumber.value = "";
    this.fleet.replaceChildren();
    sailwatch.fleets.forEach((fl) => {
      let flspan = document.createElement("span");
      flspan.innerText = fl;
      if (fl == this.data.fleet)
        flspan.classList.add("selected");
      this.fleet.appendChild(flspan);
    });
  }


  saveData() {
    console.log("saving finish data", this.data);
    this.data.source = "edit";
    let fleet = Array.from(this.fleet.children)
      .filter((ch) => ch.classList.contains("selected"))
      .map((ch) => (ch as HTMLElement).innerText);
    if (fleet.length > 0)
      this.data.fleet = fleet[0];
    this.data.sailnumber = this.sailnumber.value;
    TimeLine.instance.submitEvent(this.data);
  }
}
