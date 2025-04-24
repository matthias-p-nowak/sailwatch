import { sailwatch } from "./sailwatch";

export class SailwatchDatabase {
  static _instance: SailwatchDatabase;
  ready: Promise<any>;
  db: IDBDatabase = undefined;

  private constructor() {
    let thisOne = this;
    this.ready = new Promise((resolve, reject) => {
      // ***** Name and version *****
      const openRequest = window.indexedDB.open("sailwatch-db", 8);
      openRequest.onsuccess = function (ev) {
        thisOne.db = openRequest.result;
        resolve(openRequest.result);
      };
      openRequest.onerror = function (ev) {
        sailwatch.addError(`indexed db error ${openRequest.error}`);
        reject(openRequest.error);
      };
      openRequest.onblocked = function (ev) {
        sailwatch.addError(`indexed db blocked ${openRequest.error}`);
        reject(openRequest.error);
      };
      openRequest.onupgradeneeded = function (ev: IDBVersionChangeEvent) {
        sailwatch.addInfo('indexed db upgrade needed');
        let db = openRequest.result;
        thisOne.dbUpgrade(ev, db);
      };
    });
    sailwatch.addInfo("database instantiated");
  }



  static get instance(): SailwatchDatabase {
    return this._instance || (this._instance = new SailwatchDatabase());
  }
  
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
  
  dbUpgrade(ev:IDBVersionChangeEvent,db: IDBDatabase) {
    const stores = Object.keys(SailwatchDatabase.dbSchema);
    let existingStoreNames = Array.from(db.objectStoreNames);
    let removeStores = existingStoreNames.filter((name) => !stores.includes(name));
    removeStores.forEach((name) => db.deleteObjectStore(name));
    Object.entries(SailwatchDatabase.dbSchema).forEach(([name, value]) => {
      console.log(`store name = ${name}`);
      let store: IDBObjectStore;
      if (!existingStoreNames.includes(name)) {
        try {
          store = db.createObjectStore(name, value.options);
        } catch (e) {
          sailwatch.addError(e);
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
          sailwatch.addError(e);
        }
      });
    });
  }

  saveEvent(detail: any) {
    console.log("saving event", detail);
    let tx = this.db.transaction(["events"], "readwrite");
    tx.oncomplete = function (ev) {
      console.log("completed save");
    };
    tx.onerror = function (ev) {
      sailwatch.addError(`indexed db error ${tx.error}`);
    };
    let store = tx.objectStore("events");
    store.put(detail);
  }
}
