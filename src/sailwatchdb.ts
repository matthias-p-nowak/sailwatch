import { SailWatch } from "./sailwatch";

export class SailWatchDB {
  static db: IDBDatabase = undefined;
  static ready: Promise<any>;

  static saveEvent(data: Object) {
    console.log("saving event", data);
    let tx = SailWatchDB.db.transaction(["events"], "readwrite");
    tx.oncomplete = function (ev) {
      console.log("completed save");
    };
    tx.onerror = function (ev) {
      SailWatch.sw.addErrors(`indexed db error ${tx.error}`);
    };
    let store = tx.objectStore("events");
    store.put(data);
  }

  static deleteEvent(timeStamp: Date) {
    let tx = SailWatchDB.db.transaction(["events"], "readwrite");
    tx.oncomplete = function (ev) {
      console.log("completed delete");
    };
    tx.onerror = function (ev) {
      SailWatch.sw.addErrors(`indexed db error ${tx.error}`);
    };
    let store = tx.objectStore("events");
    store.delete(timeStamp);
  }

  static async getEventsBefore(timeStamp: Date) {
    return new Promise<any[]>((resolve, reject) => {      
      let events = [];
      let store = SailWatchDB.db.transaction(["events"], "readonly").objectStore("events");
      let range = IDBKeyRange.upperBound(timeStamp, true);
      let request =store.openCursor(range,'prev');
      let prevDate:Date = undefined;
      request.onsuccess = function (ev) {
        const cursor = request.result;
        if(cursor==null){
          resolve(events);
          return;
        }else{
          let value=cursor.value;
          let timeStamp=value.time as Date;
          if(prevDate==undefined){
            prevDate=timeStamp;
          }else if(prevDate.getDay()!= timeStamp.getDay() ||
          prevDate.getMonth()!= timeStamp.getMonth() || prevDate.getFullYear()!= timeStamp.getFullYear()){
            console.log('got another day');
            resolve(events);
            return;
          }
          events.push(value);
          cursor.continue();
        }
      };      
    });
  }
  static async getFleets(): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {      
      let store = SailWatchDB.db.transaction(["fleets"], "readonly").objectStore("fleets");
      let request= store.getAll();
      request.onsuccess= function(ev:Event){
        resolve(request.result.map((fleets) => fleets.name));
      };
      request.onerror= function(ev:Event){
        reject(request.error);
      };
    });
  }

  static saveFleet(fleet: { name: string; lastUsed: Date}) {
      let store = SailWatchDB.db.transaction(["fleets"], "readwrite").objectStore("fleets");
      store.put(fleet);
  }




  // ********************************************

  static dbSchema = {
    events: {
      options: {
        keyPath: "time",
      },
      indexes: [],
    },
    fleets: {
      options: {
        keyPath: "name",
      },
      indexes: [],
    },
   
  };

  static dbUpgrade(ev:IDBVersionChangeEvent,db: IDBDatabase, dbSchema: Object, addErrors: (msg: string) => void) {
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
        let updateTarget=ev.target as IDBRequest;
        store = updateTarget.transaction.objectStore(name);
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

  static StartDb() {
    SailWatchDB.ready = new Promise((resolve, reject) => {
      // ***** Name and version *****
      const openRequest = window.indexedDB.open("sailwatch-db", 7);
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
      openRequest.onupgradeneeded = function (ev:IDBVersionChangeEvent) {
        SailWatch.sw.addErrors(`indexed db upgrade needed`);
        let db = openRequest.result;
        SailWatchDB.dbUpgrade(ev, db, SailWatchDB.dbSchema, SailWatch.sw.addErrors);
      };
    });
  }
}
