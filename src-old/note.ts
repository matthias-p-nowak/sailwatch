import { dateFmt } from "./datefmt";
import { DomHook } from "./dom-hooks";
import { sailwatch } from "./sailwatch";
import { EventBase, TimeLine } from "./timeline";


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
    display.update(null);
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
    sailwatch.debugRegistry.register(this, "note deleted");
  }

  update(ev: CustomEvent) {
    console.log("note update");
    this.data.time= ev.detail.time;
    this.time.innerText= dateFmt('%h:%i:%s', this.data.time);
    this.text.value=this.data.note;
    if(this.text.value.length==0){
      this.delayId = setTimeout(this.doSave.bind(this), 30_000);
    }
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
      console.log("saving updated note");
      TimeLine.instance.addEvent(this.data.getData());
    } else {
      console.log('removing note, leaving thombstone');
      TimeLine.instance.addEvent({time: this.data.time});
    }
  }


}
