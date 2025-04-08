import { WebComponent } from "./component";
import { SailWatch } from "./sailwatch";

export class NewStart extends WebComponent {
    dialog: HTMLDialogElement=undefined;
    sailwatch: SailWatch=undefined;
    show() {
      this.dialog.showModal();
    }

}