import { SailWatch } from "./sailwatch";

export class SailWatchDB {
  static db: IDBDatabase = undefined;
  static ready: Promise<any>;

  static saveEvent(data: Object) {
    console.log("saving event", data);
    let tx = SailWatchDB.db.transaction(["events"], "readwrite");
    tx.oncomplete= function(ev){
      console.log('completed save');
    };
    tx.onerror= function(ev){
      SailWatch.sw.addErrors(`indexed db error ${tx.error}`);
    }
    let store = tx.objectStore("events");
    store.put(data);
  }
  
  static deleteEvent(timeStamp: Date) {
    let tx = SailWatchDB.db.transaction(["events"], "readwrite");
    tx.oncomplete= function(ev){
      console.log('completed delete');
    };
    tx.onerror= function(ev){
      SailWatch.sw.addErrors(`indexed db error ${tx.error}`);
    }
    let store = tx.objectStore("events");
    store.delete(timeStamp);
  }
}

let dbSchema = {
  events: {
    options: {
      keyPath: "time",
    },
    indexes: [],
  },
};


function dbUpgrade(db: IDBDatabase, dbSchema: Object, addErrors: (msg: string) => void) {
  const stores = Object.keys(dbSchema);
  let existingStoreNames = Array.from(db.objectStoreNames);
  let removeStores = existingStoreNames.filter((name) => !stores.includes(name));
  removeStores.forEach((name) => db.deleteObjectStore(name));
  Object.entries(dbSchema).forEach(([name, value]) => {
    console.log(`store name = ${name}`);
    let store: IDBObjectStore;
    if (!existingStoreNames.includes(name)) {
      try {
        store = db.createObjectStore(name, value.options);
      } catch (e) {
        addErrors(e);
      }
    } else {
      store = db.transaction(name, "readwrite").objectStore(name);
    }
    let indexes = value.indexes;
    let indexNames = Array.from(store.indexNames);
    let removeIndexes = indexNames.filter((name) => !indexes.find((index) => index.name == name));
    removeIndexes.forEach((name) => store.deleteIndex(name));
    indexes.forEach((index) => {
      console.log(`index name = ${index.name}`);
      try {
        store.createIndex(index.name, index.keyPath, index.options);
      } catch (e) {
        addErrors(e);
      }
    });
  });
}

(() => {
  if (!navigator.serviceWorker) {
    // here are we in a service worker
    return;
  }
  SailWatchDB.ready= new Promise((resolve,reject)=>{
    
    // ***** Name and version *****
    const openRequest = window.indexedDB.open("sailwatch-db", 4);
    openRequest.onsuccess = function (ev) {
      SailWatchDB.db = openRequest.result;
      resolve(openRequest.result);
  };
  openRequest.onerror = function (ev) {
    SailWatch.sw.addErrors(`indexed db error ${openRequest.error}`);
    reject(openRequest.error);
  };
  openRequest.onblocked = function (ev) {
    SailWatch.sw.addErrors(`indexed db blocked ${openRequest.error}`);
    reject(openRequest.error);
  };
  openRequest.onupgradeneeded = function (ev) {
    SailWatch.sw.addErrors(`indexed db upgrade needed`);
    let db = openRequest.result;
    dbUpgrade(db, dbSchema, SailWatch.sw.addErrors);
  };
  });
})();
