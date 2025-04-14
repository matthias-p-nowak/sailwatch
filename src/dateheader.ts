import {WebComponent} from './component';
import {dateFmt} from './datefmt';

export class DateHeader extends WebComponent {
    constructor(date: Date) {
        super();
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        this.root = document.createElement('article');
        this.root.dataset.time=date.toISOString();
        let h2=document.createElement('h3');
        this.root.appendChild(h2);
        h2.innerText = dateFmt("%y-%m-%d", date);
    }
}