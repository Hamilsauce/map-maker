const { BehaviorSubject, Subject } = rxjs
const { shareReplay, distinctUntilChanged, tap, map, scan } = rxjs.operators;

const AUTH_KEY = '123';

class StoreRegistery extends Map {
  constructor() {
    super();
  }

  set(name, initialState) {
    if (!(name && initialState)) throw new Error('Invalid name or state passed to store');

    super.set(name, new BhsStore(name, initialState));
  }
}

const storeRegistery = new StoreRegistery()


class BhsStore extends BehaviorSubject {
  #updateSubject$ = new Subject();
  #reducePipe$ = null;
  #stateSubscription = null;
  #name = null;

  constructor(name, storeOptions) {
    if (!(name && storeOptions.state)) return;

    super(storeOptions.state);

    this.#name = name;

    this.#reducePipe$ = this.#updateSubject$.pipe(
      map(newValue => {
        const k = Object.keys(newValue)
        return { ...this.snapshot(), [k]: { ...this.snapshot()[k], ...newValue[k] } }
      }),
      map(state => {
        const cleanedTiles = Object.fromEntries(
          Object.entries(state.tiles).filter(([k, v]) => v.tileType !== 'empty')
        );

        return { ...state, tiles: cleanedTiles }
      }),
      tap(x => console.warn('[UPDATED STATE]', x)),
      tap(newValue => this.next(newValue, AUTH_KEY)),
    )

    this.#stateSubscription = this.#reducePipe$.subscribe()
  }

  get name() { return this.#name }

  snapshot(selectorFn) {
    return selectorFn ? selectorFn(this.getValue()) : this.getValue();
  }

  next(newValue, authKey) {
    if (authKey != AUTH_KEY || typeof newValue != 'object') throw new Error('ILLEGAL CALL TO STORE.NEXT OR INVALID VALUE PASSED TO STORE.UPDATE');

    super.next(newValue);
  }

  update = (newValue) => {
    if (typeof newValue != 'object') return;

    this.#updateSubject$.next(newValue);
  }

  select = (selectorFn = (state) => state) => {
    return this.asObservable().pipe(
      map(selectorFn),
      distinctUntilChanged(),
      shareReplay(1),
    );
  }

  selectConnect = (selectorFn = (state) => state) => {
    return this.asObservable().pipe(
      map(selectorFn),
      distinctUntilChanged(),
      shareReplay(1),
    );
  }

  selectSync(fn = (state) => {}) {
    return fn(this.getValue());
  }

  #assign(newValue) {
    if (typeof newValue != 'object') throw new Error('NEW VALUE PUSHED ISNT OBJECT. FAILED IN ASSIGNG, VALUE: ' + newValue);

    return { ...this.getValue(), ...newValue }
  }
}

export class StoreOptionsDef {
  name = '';
  state = {};
  state = {};

  constructor() {
    this.root;
  }
}

export const StoreOptions = {
  name: '',
  state: {},
}


export const defineStore = (name, storeOptions = StoreOptions) => {
  let store;

  if (!storeRegistery.has(name)) {
    storeRegistery.set(name, storeOptions)
  }

  return () => storeRegistery.get(name)
}