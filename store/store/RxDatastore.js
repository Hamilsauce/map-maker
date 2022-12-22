import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
import localStore from './localStore.js'
const { date, array, utils, text } = ham;
const { iif, BehaviorSubject, ReplaySubject, AsyncSubject, Subject, interval, of , fromEvent, merge, empty, delay, from } = rxjs;
const { distinctUntilChanged, throttleTime, mergeMap, switchMap, scan, take, takeWhile, map, tap, startWith, filter, mapTo } = rxjs.operators;
// const { fromFetch } = rxjs.fetch;
let localStore1 = localStore

export class RxDatastore {
  constructor() {
    this.collections = new Map();
    this.connections = new Map();
    this.localStore = localStore1;
    this.lsData = JSON.parse(localStorage.getItem('NOTE_APP'))
    this.localStoreConnection = this.localStore.connect('NOTE_APP');
    console.log('this.lsData', this.lsData)

    this.localStoreConnection.get.pipe(
        tap(x => console.log('xxxx', x)),
        map(this.initialize.bind(this)),
      )
      .subscribe()

    setTimeout(() => {
      console.log('this.COLLECTIONS ', [...this.collections])
      console.log(' ', );
    }, 1000)
  }

  initialize(seed) {
    console.log('seed', { seed })
    this.collections = Object.entries(seed)
      .reduce((acc, curr, i) => {
        return acc.set(curr[0], { _source$: new BehaviorSubject(curr[1]), _data: curr[1] })
      }, new Map());
    return this;

  }

  update(collection, value) {
    value.id = value.id ? value.id : utils.uuid();
    const oldValue = collection._data[value.id]

    collection._source$.next({
      ...collection._data,
      [value.id]: { ...value }
    });
  }

  remove(collection, id) {
    collection._source$.next({
      [id]: undefined
    });
  }

  connect(collName) {
    console.log('if (this.connections.has(collName)', collName, this.connections.has(collName))
    if (this.connections.has(collName)) return this.connections.get(collName)
    const coll$ = this.collections.get(collName);
    const setLocalStore = this.localStore.connect(collName);
    const l = this.lsData[collName]
    const update = (coll$) => (updateObj) => this.update(coll$, updateObj)
    const remove = (coll$) => (id) => this.remove(coll$, id)
    console.log('coll$', coll$)

    return this.connections.set(collName, {
      get: coll$._source$.asObservable().pipe(
        scan((oldValue, newValue) => ({ ...oldValue, ...newValue })),
        distinctUntilChanged((prev, curr) => {
          return Array.isArray(prev) ?
            prev.reduce((isChangeDetected, [key, value], i) => {
              return ![curr[key], false].includes(value) ? true : false;
            }) :
            Object.entries(prev).reduce((isChangeDetected, [key, value], i) => {
              return [curr[key], false].includes(value) || isChangeDetected !== true ? false : true;
            });
        }),
        tap(setLocalStore.set.bind(this)),
      ),
      set: update(coll$),
      remove: remove(coll$),
    }).get(collName)
    
    return this.connections.get(collName)

  }
}


{ RxDatastore }