import { ServiceWorker } from './service-worker';
import {SailWatch} from './sailwatch';
let gitVersion='currentGitVersion';

console.log('running main.ts');
if('serviceWorker' in navigator && ! ('registration' in self)){
    console.log('running inside main thread');
    navigator.serviceWorker.register('main.js');
    SailWatch.Start(gitVersion);

}else{
    console.log('running as a service worker');
    ServiceWorker.Start(gitVersion);
}