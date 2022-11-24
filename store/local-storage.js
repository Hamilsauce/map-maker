/*
  Local Store - Treats a localStorage Item
  as a data source targeting Item at Key provided;
  
  Exposes CRUD interface for 
  
*/
export class LocalStore {
  #self = window.localStorage;
  #datasource;
  #storeKey;

  constructor(storeKey) {
    if (!storeKey) throw new Error('No key passed to LocalStore');

    this.#storeKey = storeKey;
  };

  initialize(key, options) {
    this.#storeKey = key;
  }

  static parse(json) {
    return JSON.parse(json);
  }

  static stringify() {
    return JSON.stringify(json);
  }

  static storageHas(key) {
    return !!this.self.getItem(key);
  }
  
  get self() { return this.#self };

  
  loadFromStorage() {
    return LocalStore.parse(this.self.getItem(this.#storeKey));
  }
  
  saveToStorage() {
   LocalStore.stringify(this.self.getItem(this.#storeKey));
  }
};

export const LOCALSTORAGE_KEY = 'MAP_MAKER'

export class LocalMapStore extends LocalStore {
  constructor() {
    super(LOCALSTORAGE_KEY)

  };
  get prop() { return this.#prop };
  set prop(v) { this.#prop = v };
}