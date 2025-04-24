import { DomHook } from "./domhook";
import { Settings } from "./settings";


/**
 * the global SailWatch instance
*/
export class SailWatch extends DomHook {

    

    /** the error and info lists */
    errors: HTMLUListElement = undefined;
    infos: HTMLUListElement = undefined;
    /** the summary at the top */
    footer: HTMLDivElement = undefined;
    
    /** show all the garbage collected objects - for detection of memory leaks */
    debugRegistry = new FinalizationRegistry((heldvalue) => {
        console.log("garbage collected", heldvalue);
    });
    
    constructor() {
        super();
        this.hook(document.body);
        requestIdleCallback(() => this.initialize());
        console.log("SailWatch instantiated");
    }
    
    private async initialize() {
        this.footer.style.display = "block";
    }
    
    infos_onclick(ev: MouseEvent) {
        let target = ev.target as HTMLElement;
        if (target.tagName == "LI") {
            target.remove();
        }
    }
    
    /**
     * allows the user to acknowledge an error and remove the entry
     * @param ev The MouseEvent that triggered the click
    */
   errors_onclick(ev: MouseEvent) {
       let target = ev.target as HTMLElement;
       if (target.tagName == "LI") {
           target.remove();
        }
    }
    


    summary_onclick(ev: MouseEvent) {
        Settings.instance.refresh();
    }

    addInfo(msg: string) {
        let li = document.createElement("li");
        li.innerText = msg;
        this.infos.appendChild(li);
        li.style.height = li.scrollHeight + "px";
        li.onanimationend = () => {
          li.remove();
        };
        this.debugRegistry.register(li, "info " + msg);
      }

      addError(msg: string) {
        let li = document.createElement("li");
        li.innerText = msg;
        this.errors.appendChild(li);
      }

}

export let sailwatch: SailWatch = new SailWatch();