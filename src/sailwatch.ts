import { DomHook } from "./domhook";

export class SailWatch extends DomHook {
  infos: HTMLDivElement = undefined;

  constructor(body: HTMLElement) {
    super();
    this.hook(body);
    console.log("SailWatch instantiated");
  }

  infos_onclick(ev: MouseEvent) {
    let target = ev.target as HTMLElement;
    console.log('removing li');
  }
}
