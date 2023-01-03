import { MapSection } from './map-section.view.js';

const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of , fromEvent, merge, empty, delay, from } = rxjs;
const { flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;

export class MapHeader extends MapSection {
  constructor(headerType, dimensions$, options) {
    super(headerType, dimensions$, options);

    this.dimensions$.pipe(
      tap(x => console.warn('MapHeader Dims', x)),
      tap(this.updateDimensions.bind(this))
    ).subscribe();
  };
}