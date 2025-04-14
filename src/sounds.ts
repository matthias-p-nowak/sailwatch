import { WebComponent } from "./component";

export class Sounds extends WebComponent {
    single: HTMLAudioElement = undefined;
    double: HTMLAudioElement = undefined;
    triple: HTMLAudioElement = undefined;
    short: HTMLAudioElement = undefined;
    long: HTMLAudioElement = undefined;
    prep: HTMLAudioElement = undefined;

    static sound: Sounds=undefined;

    playSound(type: string) {
        switch (type) {
            case "single":
                this.single.currentTime = 0;
                this.single.play();
                break;
            case "double":
                this.double.currentTime = 0;
                this.double.play();
                break;
            case "triple":
                this.triple.currentTime = 0;
                this.triple.play();
                break;
            case "short":
                this.short.currentTime = 0;
                this.short.play();
                break;
            case "long":
                this.long.currentTime = 0;
                this.long.play();                
                break;
                case "prep":
                this.prep.currentTime = 0;
                this.prep.play();                
                break;
            default:
                console.log("unknown sound: "+type);
                break;
        }
    }
    static retrieveAllSounds() {
        Sounds.sound=Sounds.fromElement(document.getElementById("sounds"));
    }
    
}