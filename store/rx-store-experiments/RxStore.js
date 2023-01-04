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

export class UserService {
  #userData$;

  userName$;
  age$;
  messages$;

  constructor(
    http
  ) {
    this.#userData$ = new Store(USER_DATA_INIT);

    this.userName$ = select$(
      this.#userData$,
      userData => userData.userName,
    );

    this.age$ = select$(
      this.#userData$,
      userData => userData.age,
    );

    this.messages$ = select$(
      this.#userData$,
      userData => userData.messages
    );
  }

  fetchUserData() {
    this.http.gethttp()
      .subscribe(userData => this.#userData$.next(userData));
  }
}