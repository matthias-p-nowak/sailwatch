import { dateFmt } from "./datefmt";
import { DomHook } from "./dom-hooks";
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

  constructor(note:Note){
    super();
    this.data=note;
  }

  update() {
    this.time.innerText= dateFmt('%h:%i:%s', this.data.time);
    this.text.value=this.data.note;
  }
}
