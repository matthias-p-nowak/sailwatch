import {SailWatch} from './sailwatch' ;
import './window.d.ts';
import './starting-app.ts';

// updating the version in html
window.gitVersion='currentGitVersion';
document.getElementById('sailwatchVersion').innerText=gitVersion;

document.querySelectorAll('details').forEach((det) => {
    det.onclick = (event: MouseEvent) => {
        let target= event!.target as HTMLObjectElement;
        let det=target.closest('details');
        console.log('closing details by action');
        det!.removeAttribute('open');
    }});


window.resizeTextArea = function(){
    document.querySelectorAll('textarea').forEach(function(textarea){
        textarea.oninput = function(){
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
        }
    });
};


let sw=new SailWatch();
window.sw=sw;
window.resizeTextArea();
document.getElementById('newStart')!.onclick=sw.newStart;
document.getElementById('newNote')!.onclick=sw.newNote;
document.getElementById('newFinish')!.onclick=sw.newFinish;
