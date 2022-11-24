const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of , fromEvent, merge, empty, delay, from } = rxjs;
const { distinctUntilChanged, flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;
const { fromFetch } = rxjs.fetch;

export const assign = () => {
  return scan((oldValue, newValue) => {
    return { ...oldValue, ...newValue }
  })
}

export class Store {
  #stateSubject$;
  #state = {};
  #state$ = {};
  #getters = {};
  #actions = {};
  #pipeline = {};
  #name;

  constructor(name, { state, pipeline, getters, actions }) {
    this.#name = name;

    this.#pipeline = pipeline;

    this.#stateSubject$ = new BehaviorSubject(state)
      .pipe(
        filter(_ => _),
        this.#assign(),
      );
  }

  get state() { return this.#state };

  select({ key, filter = {} }) {
    if (!key) return;

    let selection$ = this.#stateSubject$.asObservable()
      .pipe(
        map(x => key ? x[key] : x),
        distinctUntilChanged(),
        tap(x => console.log(`[ STORE<${this.#name}> ]: selection$`, x)),
      );

    return !!this.#pipeline ? this.#pipeline(selection$) : selection$
  }

  subscribe(stateSelection$) {
    if (!key) return;

    return this.#state$.pipe(
      map(x => key ? x[key] : x),
      distinctUntilChanged(),
    );
  }

  update(updates = {}) {
    if (!updates) return;

    this.#stateSubject$.next(updates)
  }

  #assign() {
    return scan((oldValue, newValue) => {
      return { ...oldValue, ...newValue }
    })
  }
}
