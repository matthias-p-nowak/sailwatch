window.installApp = function (ev: MouseEvent) {
  ev.stopPropagation();
  console.log("installing installing");
};

async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    console.log("can do serviceworker");
    let srvElem = document.getElementById("serviceStatus");
    try {
      const reg = await navigator.serviceWorker.register("js/sw.js");
      if (reg.installing) {
        srvElem.innerText = "installing";
      } else if (reg.waiting) {
        srvElem.innerText = "installed";
      } else if (reg.active) {
        srvElem.innerText = "active";
      }
    } catch (error) {
      srvElem.innerText = error;
    }
  }
}

registerServiceWorker();
