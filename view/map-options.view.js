import { getMapStore } from '../store/map/map.store.js';
import { changeMapDimensions } from '../store/map/map.actions.js';
import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';

const { template, utils, DOM, event } = ham;

const { combineLatest, forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of, fromEvent, merge, empty, delay, from } = rxjs;
const { shareReplay, distinctUntilChanged, startWith, flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;
const { fromFetch } = rxjs.fetch;

const store = getMapStore();

const MAP_OPTIONS_CONFIG = [
  {
    name: 'width-input',
    label: 'Width',
    type: 'text',
    value: store.snapshot(({ dimensions }) => dimensions).width,
  },
  {
    name: 'height-input',
    label: 'Height',
    type: 'text',
    value: store.snapshot(({ dimensions }) => dimensions).height,
  },
  {
    name: 'scale-input',
    label: 'Scale',
    type: 'text',
    value: store.snapshot(({ dimensions }) => dimensions).scale,
  },
]

const mapOptions = DOM.createElement({
    templateName: 'map-options',
    elementProperties: {
      onclick: (e) => {
        const opt = e.target.closest('.map-option')

        if (!opt) return;

        opt.querySelector('input').focus();
      },
    }
  },
  MAP_OPTIONS_CONFIG.map((opt) => {
    const o = template('map-option')
    const l = o.querySelector('label');
    const i = o.querySelector('input');

    o.dataset.optionName = opt.name;
    l.textContent = opt.label;
    l.for = opt.name;
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


const mapOptionsValues2$ = combineLatest(
  fromEvent(mapOptionInputs.width, 'change').pipe(
    startWith({ target: { value: 5 } }),
    tap(x => console.warn('mapOptionsValues2$', x)),
    map(_ => +_.target.value)
  ),
  fromEvent(mapOptionInputs.height, 'change').pipe(
    startWith({ target: { value: 5 } }),
    map(_ => +_.target.value)
  ),
  fromEvent(mapOptionInputs.scale, 'change').pipe(
    startWith({ target: { value: 32 } }),
    map(_ => +_.target.value)
  ),
  (width, height, scale) => ({ dimensions: { width, height, scale } })).pipe(
  tap((dimensions) => store.dispatch(changeMapDimensions(dimensions))),
  shareReplay(1)
);




export const initMapOptions = (parent) => {
  parent.append(mapOptions)

  const subscription = mapOptionsValues2$.subscribe()
  return subscription
};