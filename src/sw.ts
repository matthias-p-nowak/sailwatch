
let gitVersion='currentGitVersion';

let sw=<ServiceWorkerGlobalScope><unknown>self;
let swStart=new Date();
console.log('hello from service worker@' +  
    swStart.getHours().toString().padStart(2,'0')+
    ':'+ swStart.getMinutes().toString().padStart(2,'0')+
    ':'+swStart.getSeconds().toString().padStart(2,'0')
    + ' ('+gitVersion+')');

