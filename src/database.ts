import { sailwatch } from "./sailwatch";
import { TimeEvent } from "./timeline";

/**
 * database for SailWatch
 */
export class SailwatchDatabase {
  private static _instance: SailwatchDatabase;
  ready: Promise<any>;
  db: IDBDatabase = undefined;

  private constructor() {
    let thisOne = this;
    this.ready = new Promise((resolve, reject) => {
      // ***** Name and version *****
      const openRequest = window.indexedDB.open("sailwatch.db", 2);
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
        sailwatch.addInfo("indexed db upgrade needed");
        let db = openRequest.result;
        thisOne.dbUpgrade(ev, db);
      };
    });
    // sailwatch.addInfo("database instantiated");
  }

  /**
   * @returns {SailwatchDatabase} singleton
   */
  static get instance(): SailwatchDatabase {
    return this._instance || (this._instance = new SailwatchDatabase());
  }

  /**
   * schema that describes the database, parameters as in https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
   */
  private static dbSchema = {
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
    boats: {
      options: {
        keyPath: "name",
      },
      indexes: [],
    },
  };

  /**
   * upgrade procedure, general functionality using the schema as a guide
   * @param ev
   * @param db
   */
  dbUpgrade(ev: IDBVersionChangeEvent, db: IDBDatabase) {
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
        let updateTarget = ev.target as IDBRequest;
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

  /**
   * TODO turn it into an event handler
   * @param detail
   */
  saveEvent(event: CustomEvent) {
    let detail = structuredClone(event.detail);
    if (detail.source != undefined && detail.source == "db") {
      return;
    }
    // console.log("saving event", detail);
    delete detail.source;
    let tx = this.db.transaction(["events"], "readwrite");
    tx.oncomplete = function (ev) {
      console.log("completed save");
    };
    tx.onerror = function (ev) {
      sailwatch.addError(`indexed db error ${tx.error}`);
    };
    let store = tx.objectStore("events");
    if (event.type == "removed") {
      console.log("deleting from database");
      store.delete(detail.time);
    } else {
      store.put(detail);
    }
  }

  async getEventsBefore(timeStamp: number) {
    return new Promise<any[]>((resolve, reject) => {
      let beforeDate = new Date(timeStamp);
      console.log("getting events before", beforeDate);
      let events: TimeEvent[] = [];
      let store = this.db.transaction(["events"], "readonly").objectStore("events");
      let range = IDBKeyRange.upperBound(timeStamp, true);
      let request = store.openCursor(range, "prev");
      let prevDate: Date = undefined;
      request.onsuccess = function (ev) {
        const cursor = request.result;
        if (cursor == null) {
          resolve(events);
          return;
        } else {
          let value = cursor.value;
          let timeStamp = new Date(value.time);
          if (prevDate == undefined) {
            prevDate = timeStamp;
          } else if (
            prevDate.getDay() != timeStamp.getDay() ||
            prevDate.getMonth() != timeStamp.getMonth() ||
            prevDate.getFullYear() != timeStamp.getFullYear()
          ) {
            // console.log("got another day");
            resolve(events);
            return;
          }
          if (value.time instanceof Date) {
            value.time = timeStamp.getTime();
          }
          let nv = new Object(value) as TimeEvent;
          nv.source = "db";
          events.push(nv);
          cursor.continue();
        }
      };
    });
  }

  async getAllFleets(): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
      let store = this.db.transaction(["fleets"], "readonly").objectStore("fleets");
      let request = store.getAllKeys();
      let fleets: string[] = [];
      request.onsuccess = (ev) => {
        request.result.forEach((element) => {
          fleets.push(element as string);
        });
        resolve(fleets);
      };
    });
  }

  saveFleet(data: { name: string; lastUsed: Date }) {
    let store = this.db.transaction(["fleets"], "readwrite").objectStore("fleets");
    store.put(data);
  }
}
