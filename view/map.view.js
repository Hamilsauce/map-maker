import { tileBrushStore } from '../store/tile-brush.store.js';
import { tileTypeCodes } from '../store/tile-type-codes.js';
import { Collection } from '../lib/collection.js';
import { TileView } from '../view/tile.view.js';
import { push } from './tile-view-updates.stream.js';

const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of , fromEvent, merge, empty, delay, from } = rxjs;
const { debounceTime, buffer, bufferCount, flatMap, takeUntil, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;
const { fromFetch } = rxjs.fetch;

import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
const { download, template, date, array, utils, text, event } = ham;

export const TileTypes = {
  barrier: 'barrier',
  ground: 'ground',
  empty: 'empty',
  exit: 'exit',
  start: 'start',
}

export const DEFAULT_MAP_DIMENSIONS = {
  width: 32,
  height: 32,
  unitSize: 1,
  scale: 32,
};



const appBody = document.querySelector('#app-body')
const mapBody = document.querySelector('#map-body')

const scale = 32;

const getMapSize = (mapEl) => {
  const scale = 32;

  const screen = {
    width: mapEl.getBoundingClientRect().width,
    height: mapEl.getBoundingClientRect().height,
  }

  const unit = {
    width: screen.width / scale,
    height: screen.height / scale,
  }

  return unit;

};
const getClicks$ = (target) => {
  const mouse$ = fromEvent(target, 'click')

  const buff$ = mouse$.pipe(debounceTime(200))

  const bufferedClicks$ = mouse$.pipe(
    buffer(buff$),
    map(list => list)
  );

  return {
    click$: bufferedClicks$.pipe(
      filter(x => x.length === 1),
    ),
    dblClick$: bufferedClicks$.pipe(
      filter(x => x.length === 2),
    ),
  }
}


export class MapView {
  #selector;
  #dimensions = {
    width: 0,
    height: 0,
    unitSize: 32,
    scale: 32,
  }

  constructor(selector, dims) {
    this.#selector = selector;
    this.self = template('map');
    this.rangeFillStart = null;
    this.saveMap = this.#saveMap.bind(this);
    this.loadMap = this.#loadMap.bind(this);

    this.tiles = new Map();
    // dims = { ...dims, ...getMapSize(this.body) }
    this.setDimensions(dims ? dims : DEFAULT_MAP_DIMENSIONS);

    const dragTargets = {
      start: null,
      over: null,
      end: null,
    };

    this.pointerStart = {
      x: null,
      y: null,
      target: null
    };

    const clickCount = 2;
    const clickWindow = 250;

    this.clickStreams$ = getClicks$(this.self);

    merge(
      this.clickStreams$.click$.pipe(
        map(([event]) => event),
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
        tap(x => console.warn('AFTER DELAY', x)),
        // tap(push),
      )).subscribe()

    this.scroll$ = fromEvent(appBody, 'scroll').pipe(
      map((x) => x),
      tap(x => console.warn('appbody scroll$', x))
    )

    // this.pointerDown$ = fromEvent(appBody, 'pointerdown').pipe(
    //   takeUntil(this.dblClick$),
    //   delay(clickWindow),
    //   map(e => ({ x: e.clientX, y: e.clientY, targetBounds: e.target.closest('.tile').getBoundingClientRect(), target: e.target.closest('.tile') })),
    //   tap(e => this.pointerStart = e),
    //   map(this.handleTileClick.bind(this)),
    // );

    // this.pointerMove$ = fromEvent(appBody, 'pointermove').pipe(
    //   tap(x => console.log('Pointer move on body', x)),
    //   filter(({ clientX, clientY }) => {
    //     return (clientX < this.pointerStart.targetBounds.left || clientX > this.pointerStart.targetBounds.right) ||
    //       (clientY < this.pointerStart.targetBounds.top || clientY > this.pointerStart.targetBounds.bottom)
    //   }),
    // );

    // this.pointerUp$ = fromEvent(appBody, 'pointerup').pipe(tap(() => this.pointerStart = null), );

    // this.longpress$ = this.pointerDown$.pipe(
    //   mergeMap((e) => of (e)
    //     .pipe(
    //       delay(450),
    //       takeUntil(this.scroll$),
    //       takeUntil(this.pointerMove$),
    //       takeUntil(this.pointerUp$),
    //       tap(() => this.handleTileLongPress.bind(this)(this.pointerStart)),
    //     ))
    // );

    // this.longpress$.subscribe()

    this.self.addEventListener('dragstart', e => {
      dragTargets.start = e.target.closest('.tile') //.dataset.address;
    });

    this.self.addEventListener('drag', e => {
      dragTargets.over = e.target.closest('.tile');
    });

    this.self.addEventListener('dragend', e => {
      const t = e.target.closest('.tile');
    });


    this.activeBrush$ = tileBrushStore.select({ key: 'activeBrush' }).pipe(
      tap((activeBrush) => this.activeBrush = activeBrush),
    ).subscribe();

    this.tileEventSubject$ = new Subject()

    // this.tileClicks$ = fromEvent(this.self, 'click').pipe(
    //   takeUntil(this.dblClick$),
    //   delay(clickWindow),

    //   map(this.handleTileClick.bind(this)),
    //   tap(this.tileEventSubject$),
    //   tap(push),
    // );

    // this.pointerDown$.subscribe()
    // this.tileClicks$.subscribe()

    this.createMap(this.dims, null);
  }

  get body() { return this.self.querySelector('#map-body') }

  get rowHeaderGroup() { return this.self.querySelector('#map-rows') }

  get columnHeaderGroup() { return this.self.querySelector('#map-cols') }

  get corner() { return this.self.querySelector('#map-corn') }

  set unitSize(v) {
    this.rowHeaderGroup.style.gridTemplateRows = `repeat(${ this.#dimensions.height || this.#dimensions.height }, ${this.unitSize}px)`;
    this.rowHeaderGroup.style.gridTemplateColumns = `${this.unitSize}px)`;
    this.columnHeaderGroup.style.gridTemplateRows = `${this.unitSize}px)`;
    this.columnHeaderGroup.style.gridTemplateColumns = `repeat(${ this.#dimensions.width || this.#dimensions.width }, ${this.unitSize}px)`;

    return this.dims.unitSize * this.dims.scale;
  }

  get unitSize() { return this.dims.unitSize * this.dims.scale }

  get dims() { return this.#dimensions }

  get selectedTiles() { return [...this.self.querySelectorAll('.tile[data-selected=true]')] }

  // set width(v) {
  //   console.warn('width', v)
  //   if (v < this.dims.width) {
  //     for (let i = 0; i < this.dims.width - v; i++) {
  //       // this.removeColumn(this.dims.width - i)
  //       this.dims.width = this.dims.width - i
  //     }
  //     this.#dimensions.width = v
  //     // this.setGridTemplateSize()
  //     this.self.style.gridTemplateColumns = `repeat(${ dims.width || this.#dimensions.width }, ${this.unitSize}px)`;
  //   }
  //   else if (v > this.dims.width) {
  //     const diff = v - this.dims.width;

  //     for (let i = 0; i < v - this.dims.width; i++) {
  //       // this.addColumn(this.dims.width + i)
  //       this.dims.width = this.dims.width + i
  //     }

  //     this.self.style.gridTemplateColumns = `repeat(${ this.dims.width || this.#dimensions.width }, ${this.unitSize}px)`;
  //   }
  //   this.#dimensions.width = v
  //   this.setGridTemplateSize()
  // }

  // set height(v) {
  //   if (v < this.dims.height) {
  //     for (let i = 0; i < this.dims.height - v; i++) {
  //       // this.removeRow(this.dims.height - i)
  //       this.dims.height = this.dims.height - i
  //     }
  //     this.#dimensions.height = v
  //     this.self.style.gridTemplateRows = `repeat(${ dims.height || this.#dimensions.height }, ${this.unitSize}px)`;
  //   }
  //   else if (v > this.dims.height) {
  //     const diff = v - this.dims.height;

  //     for (let i = 0; i < v - this.dims.height; i++) {
  //       // this.addRow(this.dims.height + i)
  //       this.dims.height = this.dims.height + i
  //     }

  //     this.#dimensions.height = v
  //     this.self.style.gridTemplateRows = `repeat(${ this.dims.height || this.#dimensions.height }, ${this.unitSize}px)`;
  //   }
  //   // this.setGridTemplateSize()
  // }


  insertHeader(type = 'column', value, before) {
    type = type.toLowerCase();

    const h = document.createElement('div');

    h.classList.add('header');

    const group = this[`${type}HeaderGroup`];

    h.dataset.headerType = type;
    h.dataset[type] = value;
    h.dataset.address = value;
    h.textContent = value;

    if (!before) { group.append(h) }

    else if (typeof before === 'number') { group.insertAdjacentElement(before, h); }

    else { group.insertBefore(h, before) }

    if (type === 'row') {
      group.style.gridTemplateRows = `repeat(${ group.children.length}, ${this.unitSize}px)`;
    }

    else if (type === 'column') {
      group.style.gridTemplateColumns = `repeat(${ group.children.length}, ${this.unitSize}px)`;
    }

    return h;
  }

  createTile(row, column, tileType) {
    const tile = TileView.create({ address: this.positionToAddress(row, column), tileType })

    return tile;
  }

  removeTile(addressOrPosition, tileType) {
    const tile = this.getTile(addressOrPosition)

    if (tile) tile.remove(({ address }) => this.tiles.delete(address))

    return tile;
  }

  insertTile(row, column, tileType) {
    const tile = this.createTile(row, column, tileType);
    
    return this.tiles.set(tile.address, tile).get(tile.address);
  }

  getColumn(column, callback) {
    const col = new Array(this.dims.height)
      .fill('')
      .map((v, row) => this.getTile([row, column].toString()));

    return {
      tiles: col,
      address: column,
      length: col.length
    };
  }

  getRow(row, callback) {
    const r = new Array(this.dims.width)
      .fill('')
      .map((v, col) => this.getTile([row, col].toString()));

    return {
      tiles: r,
      address: row,
      length: r.length
    };
  }

  addColumn(column) {
    const col = [];

    for (let row = 0; row < this.dims.height; row++) {
      col.push(this.insertTile(row, column, 'empty'));
    }

    return col;
  }

  addRow(row) {
    const r = [];

    for (let column = 0; column < this.dims.height; column++) {
      r.push(this.insertTile(row, column, 'empty'));
    }

    return r;
  }

  removeColumn(column) {
    const col = this.getColumn(column);

    col.tiles.forEach((tile, i) => {
      if (tile && tile.address) this.removeTile(tile.address);
    });

    this.setDimensions({ ...this.dims, width: this.dims.width - 1 });

    return col;
  }

  removeRow(row) {
    const r = this.getRow(row);

    r.tiles.forEach((tile, i) => {
      if (tile && tile.address) this.removeTile(tile.address);
    });

    this.setDimensions({ ...this.dims, height: this.dims.height - 1 });

    return r;
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

  getRange(start, end) {}

  setDimensions(dims = {}) {
    const dimNames = ['width', 'height', 'unitSize', 'scale']
    const cleaned = Object.fromEntries(Object.entries(dims).filter(([k, v]) => dimNames.includes(k) && !!(+v)))
    
    Object.assign(this.#dimensions, cleaned);
    
    this.setGridTemplateSize();
  }

  setGridTemplateSize(dims) {
    this.#dimensions = dims ? dims : this.dims;

    this.body.style.gridTemplateColumns = `repeat(${ this.#dimensions.width || this.#dimensions.width }, ${this.unitSize}px)`;
    this.body.style.gridTemplateRows = `repeat(${ this.#dimensions.height || this.#dimensions.height }, ${this.unitSize}px)`;
    this.body.style.top = `${this.unitSize}px)`;
    this.body.style.left = `${this.unitSize}px)`;

    this.rowHeaderGroup.style.top = `${this.unitSize}px)`;
    this.rowHeaderGroup.style.gridTemplateRows = `repeat(${ this.#dimensions.height || this.#dimensions.height }, ${this.unitSize}px)`;
    this.columnHeaderGroup.style.left = `${this.unitSize}px)`;
    this.columnHeaderGroup.style.gridTemplateColumns = `repeat(${ this.#dimensions.height || this.#dimensions.height }, ${this.unitSize}px)`;

    this.corner.style.width = `${this.unitSize}px)`;
    this.corner.style.height = `${this.unitSize}px)`;
  }

  eachTile(callback) {}

  getMapState() {
    const tiles = [...this.self.querySelectorAll('.tile')]

    return {
      dims: this.dims,
      tiles: tiles
        .filter((t, i) => t.dataset.tileType != 'empty')
        .map((t, i) => {
          return { address: t.dataset.address, type: tileTypeCodes.get(t.dataset.tileType) }
        }),
    }
  }

  #saveMap() {
    const data = { key: 'map-maker-save-1', mapName: 'test1', map: { dims: this.dims, tiles: [] } }
    const tiles = [...this.self.querySelectorAll('.tile')]

    data.map.tiles = tiles
      .filter((t, i) => t.dataset.tileType != 'empty')
      .map((t, i) => {
        return { address: t.dataset.address, type: tileTypeCodes.get(t.dataset.tileType) }
      });

    const serialized = JSON.stringify(data, null, 2);

    localStorage.setItem(data.key, serialized);

    return serialized;
  }

  #loadMap(savedMap) {
    const { dims, tiles } = savedMap;
    this.createMap(dims, tiles);
    this.render();
  }

  positionToAddress(rowOrPosition, col = 0) {
    const { row, column } = rowOrPosition;

    if (row && column) return [row, column].toString();

    else if (!isNaN(rowOrPosition) && !isNaN(col)) return [rowOrPosition, col].toString();

    return null;
  }

  parseTileAddress(tile) {
    if (!(!!tile)) return;

    return tile.dataset.address.split(',').map(_ => +_);
  }

  async append(...tiles) {
    if (!tiles) return;

    await this.self.append(...tiles);

    return this.self;
  }

  render() {
    console.time('RENDER');

    this.body.innerHTML = '';

    this.body.append(
      ...[...this.tiles.values()].map((t, i) => t.render())
    );

    console.timeEnd('RENDER');

    return this.self;
  }

  getTile(addressOrPosition) {
    if (typeof addressOrPosition === 'string') return this.tiles.get(addressOrPosition);

    else if (typeof addressOrPosition === 'object') {
      const { row, column } = addressOrPosition;

      return row && column ? this.tiles.get(this.positionToAddress(row, column)) : null;
    }

    return null;
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
}