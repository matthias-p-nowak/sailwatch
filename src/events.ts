console.log('events loaded');

export class SailEvents{
    
}

window.onstorage= function(ev: StorageEvent){
    console.log('storage event',ev);
}