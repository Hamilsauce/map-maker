const { iif, BehaviorSubject, AsyncSubject, Subject, interval, of , fromEvent, merge, empty, delay, from } = rxjs;
const { distinctUntilChanged, throttleTime, mergeMap, switchMap, scan, take, takeWhile, map, tap, startWith, filter, mapTo } = rxjs.operators;
const { fromFetch } = rxjs.fetch;


class LocalStoreConnection {
  constructor(k, store$) {
    this.key = k;
    this.update = (value) => this.store$.set.bind(this)(key, value)
    this.input$ = store$
      .pipe(
        map(ls => ls.g),
        tap(x => console.log('START OF LOCALSTORE GET', x)),

        scan((oldValue, newValue) => ({ ...oldValue, ...newValue })),
        distinctUntilChanged((prev, curr) => {
          return Object.entries(prev)
            .reduce((changeDetected, [key, value], i) => {
              return (
                  [curr[key], false].includes(value) ||
                changeDetected !== true
              ) ? false : true;
            });
        }),
      );

    this.update = update;
  }
}

class LocalStore {
  constructor() {
    this.connections = new Map();
    this._cache = {};
    this._ls = window.localStorage;
    this._ls$ = new BehaviorSubject(this._ls);

   
  }

  setInitialData(k, v) { return this.setItem(k, v); }

  create({ key, value }) {
    if (this.has(k)) console.error('CANNOT CREATE localStorage Item: Item already stored location' + key)
    else this.set(key, value)
    return this;
  }

  read(k) { return this.get(k) }
  update() {}
  reset() {}
  delete(k) {
    this.setItem(k, null)
    return this.has(k)
  }

  getItem(k) { return this._ls.getItem(k) }

  get(k) {
    return this.has(k) ? this.toObj(this.getItem(k)) : null;
  }

  setItem(k, v) {
    this._ls.setItem(k, v);
    return { ...this.get(k) }
  }

  set(k, v) {
    return this.push(k,
      this.setItem(
        k,
        this.toString(v)
      ));
  }

  push(k, v) {
    console.log('push(k, v',k, v)
    if (this.connections.has(k)) {
      // console.log('this.connections.get(k)', this.connections.get(k))
      this.connections.get(k).get.pipe(
        tap(x => console.log('+++++this.connections.get(k)', x)),
        )//.next(v);
      return this;
    }
    return null;
  }

  has(k) { return !(this._ls.getItem(k) === null) }

  connect(key, initialData) {
    if (this.connections.has(key)) { return this.connections.get(key) }
    else {
      return this.connections.set(key, {
        set: (value) => { this.set.bind(this)(key, value) },
        get: this._ls$.asObservable().pipe(
          map(ls => this.get(key)),
          tap(x => console.log('START OF LOCALSTORE GET (new push)', x)),

          scan((oldValue, newValue) => ({ ...oldValue, ...newValue })),
          distinctUntilChanged((prev, curr) => {

            console.log('DISTINCTUNTILCHANGED -- oldValue, newValue', oldValue, newValue)
            return Object.entries(prev).reduce((changeDetected, [key, value], i) => {
              return ([curr[key], false].includes(value) || changeDetected !== true) ? false : true;
            });
          }))
      }).get(key)
    }
  }

  disconnect(k) {
    this._cache.set(k, this.connections.get(k))
    this.connections.delete(k);
    return !this.connections.has(k)
  }

  toString(value) { return JSON.stringify(value, null, 2) }
  toObj(k) { return JSON.parse(k) }
}




// class LocalStore_1 {
//   constructor() {
//     this.connection = null
//     this.connections = new Map([
//       [],
//     ]);
//     this._cache = {};
//     this._ls = window.localStorage;
//     this._ls$ = {

//       get: new BehaviorSubject(this._ls),
//       set: new BehaviorSubject(this._ls),
//     }
//   }

//   setInitialData(k, v) { return this.setItem(k, v); }

//   create({ key, value }) {
//     if (this.has(k)) console.error('CANNOT CREATE localStorage Item: Item already stored location' + key)
//     else this.set(key, value)

//     return this;
//   }

//   read(k) { return this.get(k) }
//   update() {}
//   reset() {}
//   delete(k) {
//     this.setItem(k, null)
//     return this.has(k)
//   }

//   getItem(k) { return this._ls.getItem(k) }
//   get(k) {
//     // if (this.has(k)) return this.toObj(this._ls.getItem(k))
//     return this.has(k) ? this.toObj(this.getItem(k)) : null;
//   }

//   setItem(k, v) {
//     this._ls.setItem(k, v);
//     return { ...this.get(k) }
//   }

//   set(k, v) {
//     return this.push(
//       k,
//       this.setItem(
//         k,
//         this.toString(v)
//       )
//     );
//     // const item = this.setItem(k, this.toString(v));
//     // return this.push(k, this.get(k));
//     // return this;
//   }

//   push(k, v) {
//     if (this.connections.has(k)) {
//       this.connections.get(k).data$.next(v);
//       return this;
//     }
//     return null;
//   }

//   has(k) { return !(this._ls.getItem(k) === null) }


//   connect(key, initialData) {
//     if (this.connections.has(key)) { return this.connections.get(key) }

//     else {
//       let bhs$ = this._ls$.get.asObservable()
//         .pipe(
//           map(ls => ls.g),
//           tap(x => console.log('START OF LOCALSTORE GET', x)),

//           scan((oldValue, newValue) => ({ ...oldValue, ...newValue })),
//           distinctUntilChanged((prev, curr) => {
//             return Object.entries(prev)
//               .reduce((changeDetected, [key, value], i) => {
//                 return (
//                   [curr[key], false].includes(value) ||
//                   changeDetected !== true
//                 ) ? false : true;
//               });
//           }),
//         );

//       const newCxn = {
//         data$: new BehaviorSubject(this.get(key)),
//         set: (value) => { this.set.bind(this)(key, value) },
//       }

//       const newConnection = new LocalStoreConnection(key, this._ls$.get.asObservable())

//       let cn = this.connections.set(key, newCxn).get(key)
//       this.push(key, this.get(key));
//       return cn
//     }
//   }

//   disconnect(k) {
//     this._cache.set(k, this.connections.get(k))
//     this.connections.delete(k);
//     return !this.connections.has(k)
//   }

//   toString(value) { return JSON.stringify(value, null, 2) }
//   toObj(k) { return JSON.parse(k) }
// }




const _ls = new LocalStore()
// let connect =  

const localStore = () => ({
  connect: (key, initialData) => _ls.connect(key, initialData),
  disconnect: _ls.disconnect,
  connection: (k) => _ls.connections.get(k),
})

// export default _ls.connect
export default localStore()

// setTimeout(() => {
//   console.log('LOVAL VLOSL', localStorage.getItem('users'));
// }, 7000)
