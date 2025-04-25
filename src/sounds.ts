import { DomHook } from "./domhook";
import { sailwatch } from "./sailwatch";

export class Sounds extends DomHook {
    root: HTMLDivElement = undefined;
    sounds: Map<string, HTMLAudioElement> = new Map();

  // #region singleton
  private static _instance: Sounds;
  private constructor() {
    super();
    this.hook(document.getElementById("sounds"));
  }
  static get instance(): Sounds {
    return this._instance || (this._instance = new Sounds());
  }
  // #endregion

  play(sound: string) {
    let snd= this.sounds.get(sound);
    if (snd == undefined) {
        snd=document.getElementsByClassName(sound)[0] as HTMLAudioElement;
        if(snd == undefined){
            sailwatch.addError(`sound ${sound} not found`);
            return;
        }
        this.sounds.set(sound, snd);
    }
    snd.currentTime = 0;
    snd.play();
  }
}
