import { WebComponent } from './component';
import {dateFmt} from './datefmt';
export class Note extends WebComponent {
    timeStamp: Date = new Date();
    text: HTMLTextAreaElement = undefined;
    time: HTMLDivElement = undefined;
    delayId: number=0;
    text_oninput(ev: Event) {
        this.text.style.height = "auto";
        this.text.style.height = this.text.scrollHeight + "px";
        console.log('text_oninput');
        this.text.classList.add('saving');
        if(this.delayId>0)
        clearInterval(this.delayId);
        this.delayId=setTimeout(this.doSave.bind(this),5000);
    }
    render(){
        this.time.innerText= dateFmt('%y-%m-%d %h:%i:%s',this.timeStamp);
    }
    doSave(){
        this.text.classList.remove('saving');
        console.log('saving from ',this);
    }

}