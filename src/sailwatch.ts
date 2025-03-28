import { EditStart } from "./editstart";
import {SailEvents} from "./events";
export class SailWatch{    

    removeExamples(){
        document.querySelectorAll('article.example').forEach(element => {
          element.remove();  
        });
    }

    async newStart(ev: MouseEvent){
        console.log('adding new start');
        this.removeExamples();
        const mc = document.getElementById('mainContent');
        let lc=mc.lastElementChild;
        if( lc?.classList.contains('start')){
          console.log('had start as last item')  
        }else{
            let exStart=document.getElementById('exStart') as HTMLTemplateElement;
            let ns=exStart.content.cloneNode(true);
            lc=mc.appendChild(ns) as HTMLElement;
        }
        let es=new EditStart();
        await es.showEditor();
       
        console.log('done editing');
    }

    newNote( ev: MouseEvent){
        console.log('adding new note');
        this.removeExamples();
    }
    newFinish(ev: MouseEvent){
        console.log('adding new finish');
        this.removeExamples();
    }
    editFleets(ev: MouseEvent){
        console.log(this,ev);
        ev.stopPropagation();
        let dia=document.getElementById('editFleets') as HTMLDialogElement;
        let ta=dia.querySelector('#fleetLines') as HTMLTextAreaElement;
        dia.showModal();
    }
    storeFleet(ev: MouseEvent){
        let dia=ev.target as HTMLDialogElement;
        dia.close();
    }
}

