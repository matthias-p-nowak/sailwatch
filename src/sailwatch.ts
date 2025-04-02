import { WebComponent } from "./component";
import { Note } from "./note";

export class SailWatch extends WebComponent {

  errors: HTMLUListElement = undefined;
  main: HTMLDivElement = undefined;
  registerFinish: HTMLDivElement = undefined;
  takeNote: HTMLDivElement = undefined;
  newStart: HTMLDivElement = undefined;

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
    console.log('take note');
    this.addErrors("take a note");
    let note=Note.fromTemplate();
    note.render();
    this.main.appendChild(note.root);
    note.text.focus();
  }

  static Start() {
    const sw = SailWatch.fromElement(document.body);
    if (sw != null) {
      console.log(sw);
    }
    sw.addErrors("hello from javascript");
  }
}
