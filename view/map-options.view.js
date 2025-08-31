import { getMapStore } from '../store/map/map.store.js';
import { changeMapDimensions } from '../store/map/map.actions.js';
import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';

const { template, utils, DOM, event } = ham;

const { combineLatest, forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of, fromEvent, merge, empty, delay, from } = rxjs;
const { shareReplay, distinctUntilChanged, startWith, flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;
const { fromFetch } = rxjs.fetch;

const store = getMapStore();

const initialDims = store.snapshot(({ dimensions }) => dimensions);

const dims$ = store.select(({ dimensions }) => dimensions)


const MAP_OPTIONS_CONFIG = [
  {
    name: 'width-input',
    label: 'Width',
    type: 'text',
    value: initialDims.width
  },
  {
    name: 'height-input',
    label: 'Height',
    type: 'text',
    value: initialDims.height
  },
  {
    name: 'scale-input',
    label: 'Scale',
    type: 'text',
    value: initialDims.scale
  },
]

const mapOptions = DOM.createElement({
    templateName: 'map-options',
    elementProperties: {
      onclick: (e) => {
        const opt = e.target.closest('.map-option')
        if (opt) opt.querySelector('input').select();
      },
    }
  },
  MAP_OPTIONS_CONFIG.map((opt) => {
    const o = template('map-option')
    const l = o.querySelector('label');
    const i = o.querySelector('input');

    o.dataset.optionName = opt.name;
    l.textContent = opt.label;
    l.setAttribute('for', opt.name);
    i.type = opt.type;
    i.value = opt.value;
    i.name = opt.name;
    i.id = opt.name;

    return o;
  })
);

const mapOptionInputs = {
  width: mapOptions.querySelector('#width-input'),
  height: mapOptions.querySelector('#height-input'),
  scale: mapOptions.querySelector('#scale-input'),
}


const mapOptionsValues$ = combineLatest(
  fromEvent(mapOptionInputs.width, 'change').pipe(
    startWith({ target: { value: initialDims.width } }),
    map(_ => +_.target.value)
  ),
  fromEvent(mapOptionInputs.height, 'change').pipe(
    startWith({ target: { value: initialDims.height } }),
    map(_ => +_.target.value)
  ),
  fromEvent(mapOptionInputs.scale, 'change').pipe(
    startWith({ target: { value: initialDims.scale } }),
    map(_ => +_.target.value)
  ),
  (width, height, scale) => ({ dimensions: { width, height, scale } })).pipe(
  tap((dimensions) => store.dispatch(changeMapDimensions(dimensions))),
  shareReplay(1)
);

dims$.pipe(
  map(x => x),
  tap(({ width, height, scale }) => {
    mapOptionInputs.width.value = width;
    mapOptionInputs.height.value = height;
    mapOptionInputs.scale.value = scale;
  }),
  // tap(x => console.warn('dims$', x))
).subscribe()


export const initMapOptions = (parent) => {
  parent.append(mapOptions)

  const subscription = mapOptionsValues$.subscribe()
  return subscription;
};