import { EventDispatcher } from "./event_dispatcher.js";

export class DataStore {
  static _instance: DataStore;

  _data: Record<string, any>;
  constructor() {
    this._data = {};
  }

  setStore(key: string, value: any) {
    const keys: string[] = key.split(".");
    let current = this._data;
    for (let i = 0; i < keys.length - 1; i++) {
      const k: string = keys[i]!;
      if (current[k] === undefined) {
        current[k] = {};
      }
      current = current[k];
    }
    current[keys[keys.length - 1]!] = value;
    this.touch(key);
  }

  getStore(key: string): any {
    return this.deepGet(key);
  }

  touch(key: string): any {
    EventDispatcher.getInstance().dispatchEvent(
      key,
      "update",
      this.deepGet(key),
    );

    const listenerKeys = EventDispatcher.getInstance().listenerKeys();
    for (const listenerKey of listenerKeys) {
      if (listenerKey.startsWith(key + ".") && !listenerKey.includes(".!")) {
        this.touch(listenerKey);
      }
    }
  }

  deepGet(key: string): any {
    const keys = key.split(".");
    let current = this._data;
    for (const k of keys) {
      if (k.startsWith("!")) {
        const id = k.slice(1);
        current = current.filter((item: any) => item.id == id)[0];
      } else {
        if (current[k] === undefined) {
          return undefined;
        }
        current = current[k];
      }
    }
    return current;
  }

  static getInstance() {
    if (!this._instance) {
      this._instance = new DataStore();
    }
    return this._instance;
  }
}
