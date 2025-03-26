
export class SailWatch{    
    newStart(this: GlobalEventHandlers, ev: MouseEvent){
        console.log('adding new start');
    }
    newNote(this: GlobalEventHandlers, ev: MouseEvent){
        console.log('adding new note');
    }
    newFinish(this: GlobalEventHandlers, ev: MouseEvent){
        console.log('adding new finish');
    }
    hello(this: GlobalEventHandlers, ev: MouseEvent){
        console.log('what hello?');
        ev.stopPropagation();
        console.log('second hello');
    }
}

