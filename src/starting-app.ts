

window.ask4Notifications = function (ev: MouseEvent) {
  ev.stopPropagation();
  let ns = document.getElementById("notificationStatus");
  ns.innerText = "checking";
  if (!("Notification" in window)) {
    ns.innerText = "not available";
    return;
  }
  if (Notification.permission == "granted") {
    ns.innerText = "granted";
    if (ev.type != "none") {
      new Notification("Notifications are working!");
    }
    return;
  }
  if (Notification.permission != "denied") {
    ns.innerText = "requesting";
    if(ev.type=='none'){
        ns.innerText='click here for notifications';
        return;
    }
    Notification.requestPermission().then((permission) => {
      if (permission == "granted") {
        new Notification("Got permission for notifications");
        ns.innerText='got permission';
      }else{
        alert('permission not granted');
        ns.innerText='not granted: '+permission;
      }
    });
  }
  ns.innerText=Notification.permission;
};

window.ask4Notifications(new MouseEvent("none"));

let serviceWorkerURL = "js/sw.js";

window.refreshSwStatus = async function (ev: MouseEvent) {
  ev.stopPropagation();
  let reg = await navigator.serviceWorker.getRegistration(serviceWorkerURL);
  let srvElem = document.getElementById("serviceStatus");
  if (reg.installing) {
    srvElem.innerText = "installing";
  } else if (reg.waiting) {
    srvElem.innerText = "installed";
  } else if (reg.active) {
    srvElem.innerText = "active";
  }
};

window.updateServiceWorker = async function (ev: MouseEvent) {
  ev.stopPropagation();
  console.log("updating service worker");
  let vs=document.getElementById('sailwatchVersion');
  vs.innerText=window.gitVersion;
  let reg= await navigator.serviceWorker.getRegistration(serviceWorkerURL);
  reg.unregister();
  reg = await navigator.serviceWorker.register(serviceWorkerURL);
  console.log('sw update finished');
};

function SwMessages(ev: MessageEvent){
console.dir(ev);
}

async function registerServiceWorker() {
  let srvElem = document.getElementById("serviceStatus");
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.register(serviceWorkerURL);
      reg.addEventListener('message',SwMessages);
      window.refreshSwStatus(new MouseEvent("click"));
    } catch (error) {
      srvElem.innerText = error;
    }
  } else {
    srvElem.innerText = "service worker is not available";
  }
}

registerServiceWorker().catch(console.error);

window.addEventListener('beforeinstallprompt', (event: any)=>{
    let installPrompt=event;    
    let isapp=document.getElementById('installAsApp');
    isapp.innerText='can install app on click';
    isapp.onclick = async () => {
        const result=await installPrompt.prompt();
        isapp.innerText = result.outcome;
    };
});