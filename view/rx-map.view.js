import { View } from './view.js';
import { MapSection } from './map/map-section.view.js';
import { MapBody } from './map/map-body.view.js';
import { MapHeader } from './map/map-header.view.js';
// import { getMapStore } from '../store/map.store.js';
import { getMapStore } from '../store/map/map.store.js';
import { updateMapTiles, changeMapDimensions, resetMapTiles } from '../store/map/map.actions.js';
import { tileBrushStore } from '../store/tile-brush.store.js';
import { getClicks$ } from '../lib/get-click-events.js';
import { tileViewUpdates } from './tile-view-updates.stream.js';
import { normalizeAddress } from '../lib/tile-address.js';
import { tileTypeCodes } from '../store/tile-type-codes.js';
import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';


const { combineLatest, forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of, fromEvent, merge, empty, delay, from } = rxjs;
const { flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;
const { fromFetch } = rxjs.fetch;


/*
  MAP VIEW

  Mediator over Map Sections (Headers, Body, Corner);
*/

const MapViewOptions = {
  templateName: 'map',
  elementProperties: {
    id: 'map',
    classList: [''],
  },
  children: []
}

const MapSectionOptions = [
  {
    templateName: 'map-section',
    mapSection: 'body',
    elementProperties: {
      id: 'map-body',
      dataset: {
        mapSection: 'body',
        mapSectionType: 'body',
      },
    },
  },
  {
    templateName: 'map-section',
    mapSection: 'rows',
    elementProperties: {
      id: 'map-rows',
      dataset: {
        mapSection: 'rows',
        mapSectionType: 'header',
      },
    },
  },
  {
    templateName: 'map-section',
    mapSection: 'columns',
    elementProperties: {
      id: 'map-cols',
      dataset: {
        mapSection: 'columns',
        mapSectionType: 'header',
      },
    },
  },
  {
    templateName: 'map-section',
    mapSection: 'corner',
    elementProperties: {
      id: 'map-corn',
      dataset: {
        mapSection: 'corner',
        mapSectionType: 'corner',
      },
    }
  }
];

export class MapView extends View {
  #self;
  #dimensions$;
  #tiles$;
  #sections = new Map([
    ['corner', null],
    ['rows', null],
    ['columns', null],
    ['body', null],
  ]);

  store = getMapStore();

  constructor() {
    super('map', MapViewOptions);

    this.#dimensions$ = this.store.select(state => state.dimensions);

    // this.#tiles$ = this.store.select(state => state.tiles);

    this.init(MapSectionOptions);

    this.clickStreams$ = getClicks$(this.self);

    // merge(
    //     this.clickStreams$.click$.pipe(
    //       map(([first, second]) => first),
    //       filter(e => e.target.closest('.tile')),
    //       map(e => ({ x: e.clientX, y: e.clientY, targetBounds: e.target.closest('.tile').getBoundingClientRect(), target: e.target.closest('.tile') })),
    //       tap(tileViewUpdates.push),
    //     ),
    //     this.clickStreams$.dblClick$.pipe(
    //       filter(([first, second]) => first.target === second.target),
    //       map(([first, second]) => second),
    //       map(e => ({ x: e.clientX, y: e.clientY, targetBounds: e.target.closest('.tile').getBoundingClientRect(), target: e.target.closest('.tile') })),
    //     )
    // ).pipe(
    //   map(({ target }) => target.closest('.header')),
    //   filter(_ => _),
    //   // map(e => ({ x: e.clientX, y: e.clientY, targetBounds: e.target.closest('.tile').getBoundingClientRect(), target: e.target.closest('.tile') })),
    //   tap(x => console.log('HEADER CLICKS IN RX MAP', x))
    // ).subscribe();

    this.mapClicks$ = tileViewUpdates.getStream()
      .pipe(
        map(x => x),
        map(({ sectionName, address }) => {
          if (sectionName === 'rows') {
            return this.row(address)
          }
          if (sectionName === 'columns') {
            return this.column(address)
          }

          if (sectionName === 'corner') {
            return this.clear()
          }
        }),
        tap(tiles =>  this.store.dispatch(updateMapTiles({ tiles: tiles }))),
        tap(x => console.warn('mapClicks$', x)),
      ).subscribe();


    this.activeBrush$ = tileBrushStore.select({ key: 'activeBrush' }).pipe(
      tap((activeBrush) => this.activeBrush = activeBrush),
    ).subscribe();
    console.log('rx map', this);
  }

  get body() { return this.#sections.get('body') }

  get rowHeader() { return this.#sections.get('rows') }

  get columnHeader() { return this.#sections.get('columns') }

  get corner() { return this.#sections.get('corner') }

  init(sectionOptions = []) {
    sectionOptions.forEach((opts, i) => {
      if (!this.#sections.has(opts.mapSection)) throw new Error('Invalid map section in Map Init. Value: ' + opts.mapSection);

      if (opts.mapSection === 'body') {
        this.#sections.set(
          opts.mapSection,
          new MapBody(this.#dimensions$, opts)
        );
      }

      else if (opts.mapSection !== 'body') {
        this.#sections.set(
          opts.mapSection,
          new MapHeader(opts.mapSection, this.#dimensions$, opts)
        );
      }
    });

    this.self.append(...[...this.#sections.values()].map(_ => _.dom));

    return this.self;
  }

  loadMap(savedMap) {
    const { dims, tiles } = savedMap;

    this.store.dispatch(changeMapDimensions({ dimensions: { ...dims } }))

    this.store.dispatch(resetMapTiles({
      tiles: tiles.reduce((acc, curr) => ({
        ...acc,
        [normalizeAddress(curr.address)]: {
          ...curr,
          address: normalizeAddress(curr.address),
          tileType: tileTypeCodes.get(curr.type)
        }
      }), {})
    }));

    setTimeout(() => {
      console.log('this.store', this.store.snapshot());
    }, 1000)
  }

  handleTileClick({ x, y, targetBounds, target }) {
    const t = this.tiles.get(target.dataset.address);

    if (t && this.rangeFillStart && t !== this.rangeFillStart) {
      const [row1, col1] = this.rangeFillStart.address.split(',').map(_ => +_);
      const [row2, col2] = t.address.split(',').map(_ => +_);

      this.tiles.forEach((tile, i) => {
        const [r, c] = tile.address.split(',').map(_ => +_);

        if ((r >= row1 && r <= row2) && (c >= col1 && c <= col2)) {
          if (this.activeBrush === 'delete') this.removeTile(tile.address);

          else {
            tile.dataset.tileType = t.dataset.tileType === this.activeBrush ? 'empty' : this.activeBrush;
            tile.dataset.selected = true;
          }
        }
      });

      if (this.activeBrush !== 'delete') {
        setTimeout(() => {
          this.selectedTiles.forEach((tile, address, i) => {
            tile.dataset.selected = false;
          });
        }, 0);

        this.rangeFillStart.dataset.selected = false;

        this.rangeFillStart = null;
      }
    }

    else if (t) {
      if (this.activeBrush === 'delete') this.removeTile(t.address);

      else {
        t.dataset.tileType = t.dataset.tileType === this.activeBrush ? 'empty' : this.activeBrush;
      }
    }

    return t;
  }

  clear() {
    const nonEmpty = this.body.filter(t => t.dataset.tileType != 'empty')
      .map((target) => ({ address: target.dataset.address, tileType: target.dataset.tileType }))
      .reduce((acc, curr, i) => ({ ...acc, [curr.address]: { address: `${curr.address}`, tileType: 'empty' } }), {})
    // console.warn('nonEmpty', nonEmpty)
   
    return nonEmpty;
  }

  getTileType(tile) {
    return tile.dataset.tileType = tile.dataset.tileType === this.activeBrush ? 'empty' : this.activeBrush;
  }

  row(address) {
    const row = new Array(this.columnHeader.width)
      .fill(null)
      .reduce((acc, curr, i) => ({ ...acc, [`${address}_${i}`]: { address: `${address}_${i}`, tileType: this.getTileType(this.tile(`${address}_${i}`)) } }), {})

    return row;
  }

  column(address) {
    const column = new Array(this.rowHeader.height)
      .fill(null)
      .reduce((acc, curr, i) => ({ ...acc, [`${i}_${address}`]: { address: `${i}_${address}`, tileType: this.getTileType(this.tile(`${i}_${address}`)) } }), {})

    return column;
  }

  tile(address) {
    return this.body.select(address);
  }

  range({ x, y, targetBounds, target }) {
    const t = this.tiles.get(target.dataset.address);

    if (t) {
      this.selectedTiles.forEach((t, i) => {
        t.selected = false;
      });

      this.rangeFillStart = t;
      t.tileType = this.activeBrush || 'empty';
      t.selected = true;
    }

    return t;
  }

  handleTileLongPress({ x, y, targetBounds, target }) {
    const t = this.tiles.get(target.dataset.address);

    if (t) {
      this.selectedTiles.forEach((t, i) => {
        t.selected = false;
      });

      this.rangeFillStart = t;
      t.tileType = this.activeBrush || 'empty';
      t.selected = true;
    }

    return t;
  }
};