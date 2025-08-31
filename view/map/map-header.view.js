import { MapSection } from './map-section.view.js';
import { getClicks$ } from '../../lib/get-click-events.js';
import { tileViewEvents } from '../tile-view-updates.stream.js';

const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of, fromEvent, merge, empty, delay, from } = rxjs;
const { flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;

export class MapHeader extends MapSection {
  constructor(headerType, dimensions$, options) {
    super(headerType, dimensions$, options);

    this.dimensions$.pipe(
      tap(this.updateDimensions.bind(this))
    ).subscribe();

    this.clickStreams$ = getClicks$(this.self);

    this.clicks$ = merge(
      this.clickStreams$.click$.pipe(
        map(([first, second]) => first),
        map(e => e.target.closest('.header')),
        filter(_ => _),
        // tap(x => console.log('aftwr filtwr', x)),
        map((target) => ({ sectionName: this.sectionName, address: target.dataset.address })),
      ),
      this.clickStreams$.dblClick$.pipe(
        filter(([first, second]) => first.target === second.target),
        map(([first, second]) => second),
        map(e => ({ x: e.clientX, y: e.clientY, targetBounds: e.target.closest('.tile').getBoundingClientRect(), target: e.target.closest('.tile') })),
      )
    ).subscribe()
  };
}