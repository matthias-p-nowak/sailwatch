console.log('Hello World from service worker');

async function srvMain() {
    const dt= new Date();
    const hr=dt.getHours();
    const mn=dt.getMinutes();
    const sc=dt.getSeconds();
    console.log('start time:',hr+':'+mn+':'+sc);
}

srvMain().catch(console.error);

