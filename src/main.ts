import { ServiceWorker } from './serviceworker';
import {SailWatch} from './sailwatch';
import { SailWatchDB } from './sailwatchdb';
let gitVersion='currentGitVersion';

console.log('running main.ts');

if('serviceWorker' in navigator && ! ('registration' in self)){
    console.log('running inside main thread');
    SailWatchDB.StartDb();
    navigator.serviceWorker.register('main.js');
    SailWatch.Start(gitVersion);
}else{
    console.log('running as a service worker');
    ServiceWorker.Start(gitVersion);
}