import { SailwatchDatabase } from "./database";
import { DomHook } from "./dom-hooks";
import { Settings } from "./settings";
import { TimeLine } from "./timeline";
import { Note } from "./note";


class SailWatch extends DomHook {

    infos: HTMLUListElement = undefined;
    errors: HTMLUListElement = undefined;
    summary: HTMLElement= undefined;
    footer: HTMLDivElement = undefined;
    registerFinish: HTMLDivElement = undefined;
    makeTable: HTMLDivElement = undefined;
    takeNote: HTMLDivElement = undefined;
    newStart: HTMLDivElement = undefined;
 

    constructor() {
        super();
        this.hook(document.body);
        this.addInfo('all hooked up');
        requestIdleCallback(() => this.initialize());
        console.log("SailWatch instantiated");
    }

    private async initialize() {
        TimeLine.getInstance().addEventListener('added', (ev: CustomEvent) => {
            SailwatchDatabase.getInstance().saveEvent(ev.detail);
        });
        // await db connection
        await SailwatchDatabase.getInstance().ready;
        this.footer.style.display='block';
        this.addInfo('sailwatch initialized');        
    }

    summary_onclick(ev: MouseEvent) {
        let _ = new Settings();
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

    takeNote_onclick(ev: MouseEvent) {
            let note=new Note();
            note.time=new Date();
            note.note='';
            TimeLine.getInstance().addEvent(note.time, note);
    }

}

/** the global SailWatch instance */
export let sailwatch: SailWatch = new SailWatch();
