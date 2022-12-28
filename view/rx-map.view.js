import { View } from './view2.js';
import { MapSection } from './map/map-section.view.js';
import { getStore } from '../store/rx-store.js';
import { tileBrushStore } from '../store/tile-brush.store.js';
import { getClicks$ } from '../lib/get-click-events.js';
import { push } from './tile-view-updates.stream.js';

import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';


const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of, fromEvent, merge, empty, delay, from } = rxjs;
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
    classList: ['gradient'],
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
  #sections = new Map([
    ['corner', null],
    ['rows', null],
    ['columns', null],
    ['body', null],
  ]);

  store = getStore();

  constructor(dimensions$) {
    super('map', MapViewOptions);

    this.#dimensions$ = this.store.select(state => state.dimensions)

    this.init(MapSectionOptions);

    this.clickStreams$ = getClicks$(this.self);

    merge(
        this.clickStreams$.click$.pipe(
          map(([first, second]) => first),
          filter(e => e.target.closest('.tile')),
        tap(x => console.warn('clickStreams$ CLICK4$', x)),
          map(e => ({ x: e.clientX, y: e.clientY, targetBounds: e.target.closest('.tile').getBoundingClientRect(), target: e.target.closest('.tile') })),
          // map(this.handleTileClick.bind(this)),
          tap(push),
        ),
        this.clickStreams$.dblClick$.pipe(
          filter(([first, second]) => first.target === second.target),
          map(([first, second]) => second),
          map(e => ({ x: e.clientX, y: e.clientY, targetBounds: e.target.closest('.tile').getBoundingClientRect(), target: e.target.closest('.tile') })),
          // tap(t => this.handleTileLongPress.bind(this)(t)),
        ))
      .pipe(
        // map(x => x),
        tap(x => console.warn('clickStreams$ IN RX MAP', x))
      )
      .subscribe()


    this.activeBrush$ = tileBrushStore.select({ key: 'activeBrush' }).pipe(
      tap((activeBrush) => this.activeBrush = activeBrush),
    ).subscribe();

    // console.log('this.self', { self: this.sel })

  }

  get body() { return this.#sections.get('body') }

  get rowHeader() { return this.#sections.get('rows') }

  get columnHeader() { return this.#sections.get('columns') }

  get corner() { return this.#sections.get('corner') }

  init(sectionOptions = []) {
    sectionOptions.forEach((opts, i) => {
      const mapSectionName = opts.mapSection

      if (!this.#sections.has(mapSectionName)) throw new Error('Invalid map section in Map Init. Value: ' + mapSectionName);

      this.#sections.set(
        mapSectionName,
        new MapSection(mapSectionName, this.#dimensions$, opts)
      );
    });

    this.self.append(...[...this.#sections.values()].map(_ => _.dom));

    return this.self
  }

  #loadMap(savedMap) {
    const { dims, tiles } = savedMap;
    this.createMap(dims, tiles);
    this.render();
  }

  createMap(dims, savedTiles) {
    this.tiles.clear();

    // dims = {
    //   width: (this.self.parentElement ? this.self.parentElement.getBoundingClientRect().width : window.innerWidth) / 32,
    //   height: (this.self.parentElement ? this.self.parentElement.getBoundingClientRect().height : window.innerHeight) / 32,
    // }

    this.setDimensions(dims);

    for (let column = 0; column < dims.width; column++) {
      const colLength = this.columnHeaderGroup.children.length;

      if (!(column < colLength)) this.insertHeader('column', column);

      else if (column > colLength) this.insertHeader('column', column + colLength);
    }

    for (let row = 0; row < dims.height; row++) {
      const rowLength = this.rowHeaderGroup.children.length;

      if (!(row < rowLength)) this.insertHeader('row', row);

      else if (row > rowLength) this.insertHeader('row', row + rowLength);
    }

    for (let row = 0; row < dims.height; row++) {
      for (let col = 0; col < dims.width; col++) {
        const st = savedTiles ? savedTiles.find(t => t.address == [row, col].toString()) : null;

        if (st) this.insertTile(row, col, tileTypeCodes.get(st.type));

        else this.insertTile(row, col, 'empty');
      }
    }

    setTimeout(() => {
      this.getTile('0,0').dom.scrollIntoView(false);
    }, 0)
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