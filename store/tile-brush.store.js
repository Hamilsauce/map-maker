import { Store } from './store.js'
const { shareReplay, scan, startWith, map, filter, distinctUntilChanged, tap } = rxjs.operators;

const DEFAULT_BRUSH = 'barrier'

export const tileBrushStore = new Store('tilebrush', {
  state: {
    activeBrush: 'barrier'
  },
  getters: {},

  pipeline: (state$) => {
    setTimeout(() => {
      console.log('state$', state$);
    }, 1000)
    return state$.pipe(
      tap(x => console.log('tileBrushStore [/store/tile-brush.store.js]: ', x)),
      startWith(DEFAULT_BRUSH),
      filter(_ => _),
      distinctUntilChanged(),
      // scan((a, b) => {
      //   return [a||null, b]
      // }),
      // tap(x => console.warn('tileBrushStore [/store/tile-brush.store.js]: ', x)),
      filter(([a, b]) => (a && b) && a !== b),
      // map(([a, b]) => b),

      tap(x => console.warn('AFTER FILTER tileBrushStore [/store/tile-brush.store.js]: ', x)),
      shareReplay({ refCount: true, bufferSize: 1 })
    )
  }
});