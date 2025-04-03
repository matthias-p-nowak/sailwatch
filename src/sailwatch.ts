import { WebComponent } from "./component";
import { Note } from "./note";
import { SailWatchDB } from "./sailwatchdb";
import { TimeLine } from "./timeline";

export class SailWatch extends WebComponent {

  errors: HTMLUListElement = undefined;
  main: HTMLDivElement = undefined;
  footer: HTMLDivElement = undefined;
  registerFinish: HTMLDivElement = undefined;
  takeNote: HTMLDivElement = undefined;
  newStart: HTMLDivElement = undefined;
  static sw: SailWatch = undefined;
  timeLine= new TimeLine();
  displayed: Map<HTMLElement, WebComponent> = new Map();

  errors_onclick (ev: MouseEvent) {
    let target = ev.target as HTMLElement;
    if (target.tagName == "LI") {
      target.remove();
    }
  };

  addErrors(msg: string) {
    let li = document.createElement("li");
    li.innerText = msg;
    this.errors.appendChild(li);
  }

  takeNote_onclick(ev: MouseEvent) {
    let note=Note.fromTemplate();
    note.render();
    this.insert(note);
    note.text.focus();
  }

  insert(obj: WebComponent){
    this.displayed.set(obj.root, obj);
    let appended=false;
    this.main.childNodes.forEach((child) => {
      let elem=child as HTMLElement;
      if( elem.dataset.time > obj.root.dataset.time){
        this.main.insertBefore(obj.root, elem);
        appended=true;
      }
    });
    if(!appended){
      this.main.appendChild(obj.root);
    }
  }
  
  async refreshTimeLine() {
    this.main.replaceChildren();      
    await this.timeLine.refresh();
  }

  static async Start(gitVersion: string) {
    this.sw = SailWatch.fromElement(document.body);
    this.sw.addErrors("hello from javascript");
    window.sw=this.sw;
    await SailWatchDB.ready;
    this.sw.addErrors(`started app with version ${gitVersion}`);
    this.sw.footer.style.display="block";
    this.sw.refreshTimeLine();
  }
}
