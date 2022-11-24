const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of , fromEvent, merge, empty, delay, from } = rxjs;
const { flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;
const { fromFetch } = rxjs.fetch;

const tileUpdates$ = new Subject();

export const push = (updates) => {
  tileUpdates$.next(updates);
};

export const getStream = () => {
 return tileUpdates$.asObservable();
};

