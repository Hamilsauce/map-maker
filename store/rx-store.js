const { BehaviorSubject, Subject } = rxjs
const { shareReplay, distinctUntilChanged, tap, map, scan } = rxjs.operators;

const INITIAL_STATE = {
  user: {
    username: 'hamilsauce'
  },
  metadata: {
    mapName: 'fuck map 1',
  },
  dimensions: {
    width: 50,
    height: 50,
    scale: 32
  }
  // dimensions: {
  //   width: +mapOptions.width.value,
  //   height: +mapOptions.width.value,
  //   scale: +mapOptions.width.value
  // }
}


class BhsStore extends BehaviorSubject {
  #updateSubject$ = new Subject();
  #reducePipe$ = null;
  #stateSubscription = null;

  constructor(initialState) {
    super(initialState);

    this.#reducePipe$ = this.#updateSubject$.pipe(
      map(newValue => ({ ...this.peek(), ...newValue })),
      tap(this),
    )

    this.#stateSubscription = this.#reducePipe$.subscribe()
  }

  peek() {
    return this.getValue();
  }

  dispatch(fn = (state) => {}) {
    this.#updateSubject$
    this.next(fn(this.getValue()));
  }
  
  next = (newValue) => {
    if (typeof newValue != 'object') return;
    super.next(newValue)
    // this.update(newValue)
  }
  
  update = (newValue) => {
    if (typeof newValue != 'object') return;

    this.#updateSubject$.next(newValue);
  }

  select = (selectorFn = (state) => {}) => {
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

const storeInstance = new BhsStore(INITIAL_STATE)

export const getStore = () => storeInstance ? storeInstance : new BhsStore(INITIAL_STATE)
window.store = storeInstance


// export interface State {
//   currentUser: User | null;
// }

// class UserStore extends BhsStore {
//   constructor() {
//     super({
//       currentUser: null
//     });
//   }

//   get currentUser$() {
//     return this.select(state => state.currentUser);
//   }
//   get currentUser() {
//     return this.selectSync(state => state.currentUser);
//   }

//   setCurrentUser(user) {
//     this.dispatch(state => ({
//       ...state,
//       currentUser: user
//     }));
//   }
// }