async function main() {
    let registration=await navigator.serviceWorker.register('serviceworker.js');
    console.log('Service worker registered with scope:', registration.scope);
    await navigator.serviceWorker.ready;
    if(registration.active){
        console.log('Service worker is active');
    }else{
        console.log('Service worker not active');
    }
}

console.log('Hello World from app');
main().catch(console.error);


window.addEventListener("beforeinstallprompt", (event) => {
    console.log('Before install prompt');
    let installPrompt = event;
    const installButton = document.querySelector("#install");
    installButton.classList.remove("hidden"); 
    installButton.addEventListener("click", async () => {
        const result = await installPrompt.prompt();
        console.log(`Install prompt was: ${result.outcome}`);
        installPrompt = null;
        installButton.classList.add("hidden");
        console.log('Install button clicked');
    });
    
});
document.getElementById('commit-hash').innerHTML=gitversion;
