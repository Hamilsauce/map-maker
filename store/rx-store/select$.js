// type MemoizationFunction = (previousResult: R, currentResult: R) => boolean;
// type MappingFunction = (mappable: T) => R;
import {naiveObjectComparison, deepFreeze} from './RxStore.js';

const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of , fromEvent, merge, empty, delay, from } = rxjs;
const { shareReplay, flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;
const { fromFetch } = rxjs.fetch;


function defaultMemoization(previousValue, currentValue) {
  if (typeof previousValue === 'object' && typeof currentValue === 'object') {
    return naiveObjectComparison(previousValue, currentValue);
  }
  
  return previousValue === currentValue;
}

export function select$(
  source$,
  mappingFunction,
  memoizationFunction,
) {
  return source$.pipe(
    map(mappingFunction),
    distinctUntilChanged(memoizationFunction || defaultMemoization),
    shareReplay(1)
  )
}