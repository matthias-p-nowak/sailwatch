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

window.resizeTextArea = function (event: InputEvent) {
    console.log("resizing");
    let ta = event.target as HTMLElement;
    ta.style.height = "auto";
    ta.style.height = ta.scrollHeight + "px";
};

let sw=new SailWatch();
window.sw=sw;
