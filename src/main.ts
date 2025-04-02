import { ServiceWorker } from './service-worker';
import {SailWatch} from './sailwatch';

console.log('running main.ts');
if('serviceWorker' in navigator){
    console.log('running inside main thread');
    navigator.serviceWorker.register('main.js');
    SailWatch.Start();

}else{
    console.log('running as a service worker');
    ServiceWorker.Start();
}