import { select$ } from './select$.js';

const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of , fromEvent, merge, empty, delay, from } = rxjs;
const { flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;
const { fromFetch } = rxjs.fetch;

export function naiveObjectComparison(objOne, objTwo) {
  return JSON.stringify(objOne) === JSON.stringify(objTwo);
}

export function deepFreeze(inObj) {
  Object.freeze(inObj);

  Object.getOwnPropertyNames(inObj).forEach(function(prop) {
    if (inObj.hasOwnProperty(prop) &&
      inObj[prop] != null &&
      typeof inObj[prop] === 'object' &&
      !Object.isFrozen(inObj[prop])) {
      deepFreeze(inObj[prop]);
    }

  });
  
  return inObj;
}

const todos$ = this.select(state => state.todos)
  .pipe(
    shareReplay({ refCount: true, bufferSize: 1 })
  );

export class Store {
  #stateSubject$;

  userName$;
  age$;
  messages$;

  constructor(inititalState = {}) {
    this.#stateSubject$ = new Store(inititalState);

    this.mapDimensions$ = this.select(
      state => state.userName,
    );

    this.age$ = this.select(
      state => state.age,
    );

    this.messages$ = this.select(
      state => state.messages
    );
  }

  select(selectorFn = (state) => null) {
    return select$(
      this.#stateSubject$,
      selectorFn
    );
  }

  fetchstate() {
    this.http.gethttp()
      .subscribe(state => this.#state$.next(state));
  }
}