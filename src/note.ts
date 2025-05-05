import { dateFmt } from "./datefmt";
import { DomHook } from "./domhook";
import { TimeEvent, TimeLine } from "./timeline";

export class NoteView extends DomHook {
  data: TimeEvent = undefined;
  time: HTMLDivElement = undefined;
  text: HTMLTextAreaElement = undefined;
  delayId: number = 0;

  constructor(root: HTMLElement, data: TimeEvent) {
    super();
    this.hook(root);
    this.data = data as TimeEvent;
    this.render();
    root.addEventListener("update", this.update.bind(this));
    // just in case nothing was noted down, delete after 5 minutes
    this.delayId = setTimeout(this.doSave.bind(this), 300_000);
    setTimeout(() => {
      this.text.style.height = "auto";
      this.text.style.height = this.text.scrollHeight + 2 + "px";
      if (data.focus != undefined && data.focus) this.text.focus();
    }, 100);
  }

  update(ev: CustomEvent) {
    let note = ev.detail as TimeEvent;
    console.log("note update by event");
    this.data.time = note.time;
    if (note.note != undefined) {
      this.data.note = note.note;
      this.render();
    } else {
      console.log("removing note from display");
      this.root.remove();
    }
  }

  render() {
    this.time.innerText = dateFmt("%h:%i:%s", new Date(this.data.time));
    this.text.value = this.data.note;
    if (this.data.focus) {
      setTimeout(() => {
        this.text.focus();
      }, 100);
      this.data.focus = false;
    }
  }

  text_oninput(ev: Event) {
    console.log("text_oninput");
    this.text.style.height = "auto";
    this.text.style.height = this.text.scrollHeight + 2 + "px";
    this.text.classList.add("saving");
    clearTimeout(this.delayId);
    this.delayId = setTimeout(this.doSave.bind(this), 5000);
  }
  text_onblur(ev: Event) {
    this.doSave();
  }

  doSave() {
    clearTimeout(this.delayId);
    this.text.classList.remove("saving");
    let length = this.text.value.length;
    this.data.note = this.text.value;
    if (length > 0) {
      this.data.source = "edit";
      delete this.data.focus;
      console.log("saving updated note", this.data);
      TimeLine.instance.submitEvent(this.data);
    } else {
      console.log("removing note, leaving thombstone");
      TimeLine.instance.submitEvent({ time: this.data.time });
    }
  }
}
