import { MapSection } from './map-section.view.js';
import { normalizeAddress } from '../../lib/tile-address.js';
import { getMapStore } from '../../store/map.store.js';

const { combineLatest, forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of, fromEvent, merge, empty, delay, from } = rxjs;
const { startWith, flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;

export class MapBody extends MapSection {
  store = getMapStore();
  #tiles$;
  constructor(dimensions$, options) {
    super('body', dimensions$, options);

    this.setTiles = this.#setTiles.bind(this)

    this.#tiles$ = this.store.select(state => state.tiles);

    this.updates$ = combineLatest(
        this.dimensions$,
        this.#tiles$,
        (dimensions, tiles) => ({ dimensions, tiles })
      )
      .pipe(
        startWith({ dimensions: { width: 0, height: 0, scale: 0 }, tiles: [] }),
        tap(({ dimensions }) => this.updateDimensions(dimensions)),
        filter(({ tiles }) => tiles),
        map(({ tiles }) => Object.values(tiles)),
        tap((tiles) => this.setTiles(tiles)),
      )
      .subscribe();

  };

  #setTiles(tiles = []) {
    console.log('tiles', tiles)
    tiles.forEach((t, i) => {
      t.address = normalizeAddress(t.address);

      const tile = this.tiles.get(t.address);

      tile.setType(t.tileType);
    });
  }
}