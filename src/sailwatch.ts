import { DomHook } from "./dom-hooks";
import { Settings } from "./settings";
import { TimeLine } from "./timeline";


class SailWatch extends DomHook {

    infos: HTMLUListElement = undefined;
    errors: HTMLUListElement = undefined;
    settings: Settings;

    constructor() {
        super();
        this.hook(document.body);
        this.addInfo('all hooked up');
        requestIdleCallback(() => this.initialize());
        console.log("SailWatch instantiated");
    }

    private async initialize() {
        console.log("initializing", this);
        this.addInfo('initializing');
        this.settings = new Settings();
    }
    ping() {
        this.addInfo('ping');
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

    infos_onclick(ev: MouseEvent) {
        let target = ev.target as HTMLElement;
        if (target.tagName == "LI") {
            target.remove();
        }
    }

    addError(msg: string) {
        let li = document.createElement("li");
        li.innerText = msg;
        this.errors.appendChild(li);
    }

    addInfo(msg: string) {
        let li = document.createElement("li");
        li.innerText = msg;
        this.infos.appendChild(li);
        li.style.height = li.scrollHeight + 'px';
        li.onanimationend=()=>{li.remove();};
    }


}

/** the global SailWatch instance */
export let sailwatch: SailWatch = new SailWatch();
