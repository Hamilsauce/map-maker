import { MapSection } from './map-section.view.js';
import { normalizeAddress } from '../../lib/tile-address.js';
import { getMapStore } from '../../store/map/map.store.js';
// import { getMapStore } from '../../store/map.store.js';
import { getClicks$ } from '../../lib/get-click-events.js';
import { push } from '../tile-view-updates.stream.js';
import { tileBrushStore } from '../../store/tile-brush.store.js';
import { updateMapTiles } from '../../store/map/map.actions.js';

const { combineLatest, forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of, fromEvent, merge, empty, delay, from } = rxjs;
const { startWith, flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;

export class MapBody extends MapSection {
  store = getMapStore();
  #tiles$;

  constructor(dimensions$, options) {
    super('body', dimensions$, options);

    this.setTiles = this.#setTiles.bind(this)

    this.#tiles$ = this.store.select(state => state.tiles);

    this.activeBrush$ = tileBrushStore.select({ key: 'activeBrush' }).pipe(
      tap((activeBrush) => this.activeBrush = activeBrush),
    );

    this.clickStreams$ = getClicks$(this.self);

    this.updates$ = combineLatest(
      this.dimensions$,
      this.#tiles$,
      (dimensions, tiles) => ({ dimensions, tiles })
    ).pipe(
      startWith({ dimensions: { width: 0, height: 0, scale: 0 }, tiles: [] }),
      tap(({ dimensions }) => this.updateDimensions(dimensions)),
      filter(({ tiles }) => tiles),
      map(({ tiles }) => Object.values(tiles)),
      tap((tiles) => this.setTiles(tiles)),
    );

    this.clicks$ = merge(
      this.clickStreams$.click$.pipe(
        map(([first, second]) => first),
        filter(e => e.target.closest('.tile')),
        map(e => ({ x: e.clientX, y: e.clientY, targetBounds: e.target.closest('.tile').getBoundingClientRect(), target: e.target.closest('.tile') })),
        map(this.handleTileClick.bind(this)),
        tap(push),
      ),
      this.clickStreams$.dblClick$.pipe(
        filter(([first, second]) => first.target === second.target),
        map(([first, second]) => second),
        map(e => ({ x: e.clientX, y: e.clientY, targetBounds: e.target.closest('.tile').getBoundingClientRect(), target: e.target.closest('.tile') })),
        tap(t => this.handleTileLongPress.bind(this)(t)),
      )
    ).pipe(
      tap(x => console.warn('clickStreams$ IN RX MAP', x))
    );

    merge(
      this.clicks$,
      this.activeBrush$,
      this.updates$,
    ).subscribe();
  }

  get selectedTiles() { return [...this.self.querySelectorAll('.tile[data-selected=true]')] }

  #setTiles(tiles = []) {
    tiles.forEach((t, i) => {
      const addr = normalizeAddress(t.address);
      const tile = this.tiles.get(addr);

      tile.setType(t.tileType);
    });
  }

  handleTileClick({ x, y, targetBounds, target }) {
    const t = this.tiles.get(target.dataset.address);

    const changedTiles = {};

    if (t && this.rangeFillStart && t !== this.rangeFillStart) {
      const [row1, col1] = this.rangeFillStart.address.split(',').map(_ => +_);
      const [row2, col2] = t.address.split('_').map(_ => +_);

      this.tiles.forEach((tile, i) => {
        if ((tile.row >= row1 && tile.row <= row2) && (tile.column >= col1 && tile.column <= col2)) {
          changedTiles[tile.address] = {
            address: tile.address,
            tileType: tile.dataset.tileType === this.activeBrush ? 'empty' : this.activeBrush,
          }
        }
      });
    }

    else if (t) {
      changedTiles[t.address] = {
        address: t.address,
        tileType: t.dataset.tileType === this.activeBrush ? 'empty' : this.activeBrush,
      }
    }

    this.store.dispatch(updateMapTiles({ tiles: changedTiles }));
    // this.store.update({ tiles: changedTiles });

    return t;
  }

  handleTileLongPress({ x, y, targetBounds, target }) {
    const t = this.tiles.get(target.dataset.address);

    if (t) {
      this.selectedTiles.forEach((t, i) => {
        t.selected = false;
      });

      this.rangeFillStart = t;

      t.selected = true;
    }

    return t;
  }
}