import { dateFmt } from "./datefmt";
import { DomHook } from "./domhook";
import { TimeLine } from "./timeline";

type Note = { time: Date; note: string; focus: boolean };

export class NoteView extends DomHook {
  data: Note;
  time: HTMLDivElement = undefined;
  text: HTMLTextAreaElement = undefined;
  delayId: number = 0;
  constructor(root: HTMLElement, data: Object) {
    super();
    this.hook(root);
    this.data = data as Note;
    this.render();
  }

  render() {
    this.time.innerText = dateFmt("%h:%i:%s", this.data.time);
    this.text.value = this.data.note;
    if (this.data.focus) {
      setTimeout(() => {
        this.text.focus();
      }, 100);
      this.data.focus = false;
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
      TimeLine.instance.submitEvent(this.data);
    } else {
      console.log("removing note, leaving thombstone");
      TimeLine.instance.submitEvent({ time: this.data.time });
    }
  }
}
