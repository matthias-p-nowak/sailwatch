import { WebComponent } from "./component";
import { dateFmt } from "./datefmt";
import { SailWatchDB } from "./sailwatchdb";

export class Note extends WebComponent {
  timeStamp: Date = new Date();
  text: HTMLTextAreaElement = undefined;
  time: HTMLDivElement = undefined;
  delayId: number = 0;
  text_oninput(ev: Event) {
    this.text.style.height = "auto";
    this.text.style.height = this.text.scrollHeight + "px";
    console.log("text_oninput");
    this.text.classList.add("saving");
    if (this.delayId > 0) clearInterval(this.delayId);
    this.delayId = setTimeout(this.doSave.bind(this), 5000);
  }
  render() {
    this.root = this.time.parentElement;
    this.root.dataset.time=this.timeStamp.toISOString();    
    this.time.innerText = dateFmt("%y-%m-%d %h:%i:%s", this.timeStamp);
    setTimeout(() => {
        this.text.style.height = "auto";
        this.text.style.height = this.text.scrollHeight + "px";        
    }, 100);
  }
  doSave() {
    this.text.classList.remove("saving");
    let length = this.text.value.length;
    if (length > 0) {
      SailWatchDB.saveEvent({ time: this.timeStamp, note: this.text.value });
    } else {
      SailWatchDB.deleteEvent(this.timeStamp);
      this.time.parentElement.remove();
    }
  }
}
