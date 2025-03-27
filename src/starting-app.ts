window.installApp = function (ev: MouseEvent) {
  ev.stopPropagation();
  console.log("installing installing");
};

window.ask4Notifications = function(ev: MouseEvent){
    ev.stopPropagation();
    let ns=document.getElementById('notificationStatus');
    ns.innerText='requesting';
    if(!('Notification' in window)){
        ns.innerText='not available';
        return;
    }
    if(Notification.permission == 'granted'){
        ns.innerText='granted';
        if(ev.type != 'none'){
            new Notification('Notifications are working!');
        }
    }
}

window.ask4Notifications(new MouseEvent('none'));

let serviceWorkerURL='js/sw.js';

window.refreshSwStatus = async function(ev: MouseEvent){
    ev.stopPropagation();
    let reg=await navigator.serviceWorker.getRegistration(serviceWorkerURL);
    let srvElem = document.getElementById("serviceStatus");
    if (reg.installing) {
        srvElem.innerText = "installing";
    } else if (reg.waiting) {
        srvElem.innerText = "installed";
    } else if (reg.active) {
        srvElem.innerText = "active";
    }
}

window.updateServiceWorker = function(ev: MouseEvent){
    ev.stopPropagation();
    console.log('updating service worker');
}

async function registerServiceWorker() {
    let srvElem = document.getElementById("serviceStatus");
  if ("serviceWorker" in navigator) {
    try {
        const reg = await navigator.serviceWorker.register(serviceWorkerURL);
        window.refreshSwStatus(new MouseEvent('click'));       
    } catch (error) {
      srvElem.innerText = error;
    }
  }else{
    srvElem.innerText='service worker is not available';
  }
}

registerServiceWorker();
