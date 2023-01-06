import { View } from './view.js';

const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of, fromEvent, merge, empty, delay, from } = rxjs;
const { flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;
const { fromFetch } = rxjs.fetch;

const tileBrushSelectionEvents$ = fromEvent(ui.buttons.tileBrushes, 'click').pipe(
  tap(e => e.stopPropagation()),
  map(e => e.target.closest('.tile-selector')),
  filter(b => b),
  tap(b => {
    document.querySelectorAll('.tile-selector').forEach((el, i) => {
      if (b !== el) el.dataset.active = false;
      else el.dataset.active = true;
    });
  }),
  map(b => ({ activeBrush: b.dataset.tileType })),
  distinctUntilChanged(),
  shareReplay({ refCount: true, bufferSize: 1 }),
);

const toolGroupSelectionEvents$ = fromEvent(ui.buttons.toolLabels, 'click').pipe(
  tap(e => e.stopPropagation()),
  map(e => e.target.closest('.tool-label')),
  filter(b => b),
  // tap(x => console.log('toolGroupSelectionEvents$', x.dataset.toolGroup)),
  tap(b => {
    document.querySelectorAll('.tool-label').forEach((el, i) => {
      if (b !== el) {
        el.dataset.active = false;
      }

      else el.dataset.active = true;
    });
  }),
  map(b => ({ activeToolGroup: b.dataset.toolGroup })),
);

const activeToolGroup$ = toolGroupStore.select({ key: 'activeToolGroup' }).pipe(
  // tap(x => console.warn('[ACTIVE TOOL GROUP IN APP]', x)),
  shareReplay({ refCount: true, bufferSize: 1 }),
);

toolGroupSelectionEvents$.subscribe(selection => toolGroupStore.update(selection))
tileBrushSelectionEvents$.subscribe(selection => tileBrushStore.update(selection))
activeToolGroup$.subscribe();

const ToolGroups = {
  favorites: {
    position: 0,
    name: 'favorites',
    active: false,
    id: 'favorites-label'
  },
  tiles: {
    position: 0,
    name: 'tiles',
    active: true,
    id: 'tiles-label'
  },
  select: {
    position: 0,
    name: 'select',
    active: true,
    id: 'select-label'
  },
  actors: {
    position: 0,
    name: 'actors',
    active: true,
    id: 'actors-label'
  },
  layers: {
    position: 0,
    name: 'layers',
    active: true,
    id: 'layers-label'
  },
  colors: {
    position: 0,
    name: 'colors',
    active: true,
    id: 'colors-label'
  },
  other: {
    position: 0,
    name: 'other',
    active: true,
    id: 'other-label'
  },
}

export class ToolbarView extends View {
  #address;
  #row;
  #column;
  #tileType;
  #selected;

  constructor(options) {
    super('toolbar', options);

    if (tileType === 'header') this.textContent = address;
  }

  static create() {
    address = address.toString();
    address = address.includes(',') ? address.replace(',', '_') : address;

    // const classList = tileType === 'header' ? ['tile', 'header'] : ['tile'];

    const options = {
      templateName: 'toolbar',
      elementProperties: {
        id: 'toolbar',
        dataset: {
          address: address,
          address: address.includes(',') ? address.replace(',', '_') : address,
          selected: false,
          tileType
        },
      }
    };

    return new TileView(address, tileType, options);
  }

  setAddress(newAddress = '') {
    if (!newAddress && newAddress !== 0) return;

    newAddress = newAddress === 'string' || newAddress === 0 ? newAddress : newAddress.toString();

    this.setData('address', newAddress);

    this.textContent = this.isHeaderTile ? newAddress : '';

    return this;
  }

  setType(type = '') {
    if (!type) return;
    this.dataset.tileType = type;

    return this;
  }

  setData(k, v) {
    if (!k) return;

    Object.assign(this.dataset, {
      [k]: v.includes(',') ? v.replace(',', '_') : v,
    });

    return this;
  }

  render() {
    return this.self;
  }

  remove(callback) {
    if (callback) callback(this);

    this.setData('deleting', 'true')

    setTimeout(() => {
      this.self.remove();
    }, 100)

    return this.address;
  }

  get dom() { return this.self };

  get row() { return +this.address.split('_')[0] };

  get column() { return +this.address.split('_')[1] };

  get tileType() { return this.dataset.tileType };

  set tileType(v) {
    this.dataset.tileType = v
    this.#tileType = v;
  };

  set selected(v) {
    this.dataset.selected = v
    this.#selected = v;
  };

  get selected() {
    return this.dataset.selected === 'true' ? 'true' : false
  };

  get isHeaderTile() {
    return this.tileType === 'header';
  };

  get address() { return this.dataset.address }
}