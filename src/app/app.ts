console.log('Hello World from app');
async function main() {
    let registration=await navigator.serviceWorker.register('sw.js');
    console.log('Service worker registered with scope:', registration.scope);
    await navigator.serviceWorker.ready;
    if(registration.active){
        console.log('Service worker is active');
    }else{
        console.log('Service worker not active');
    }
}

main().catch(console.error);