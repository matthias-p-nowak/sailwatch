import { SailwatchDatabase } from "./database";
import { dateFmt } from "./datefmt";
import { DomHook } from "./dom-hooks";
import { sailwatch } from "./sailwatch";
import { EventBase } from "./timeline";


export class Note implements EventBase {
  
  time: Date;
  note: string;
  getData(): Object {
    return {time: this.time, note: this.note};
  }
  static fromData(data: Object) {
    let n=new Note();
    n.time=data['time'];
    n.note=data['note'];
    return n;
  }
  render(): HTMLElement{
    let display=new NoteDisplay(this);
    let result=display.fromTemplate();
    display.update();
    return result;
  }
}
export class NoteDisplay extends DomHook {

  data: Note;
  time: HTMLDivElement=undefined;
  text: HTMLTextAreaElement=undefined;
  delayId: number = 0;

  constructor(note:Note){
    super();
    this.data=note;
  }

  update() {
    this.time.innerText= dateFmt('%h:%i:%s', this.data.time);
    this.text.value=this.data.note;
  }

  text_oninput(ev: Event) {
    this.text.style.height = "auto";
    this.text.style.height = this.text.scrollHeight + 2 + "px";
    console.log("text_oninput");
    this.text.classList.add("saving");
    if (this.delayId > 0) clearInterval(this.delayId);
    this.delayId = setTimeout(this.doSave.bind(this), 5000);
  }

  doSave() {
    this.text.classList.remove("saving");
    let length = this.text.value.length;
    this.data.note = this.text.value;
    if (length > 0) {
      SailwatchDatabase.instance.saveEvent(this.data.getData());
    } else {
      SailwatchDatabase.instance.saveEvent({time: this.data.time});
    }
  }


}
