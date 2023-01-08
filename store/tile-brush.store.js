import { Store } from './store.js'
const { shareReplay, scan, startWith, map, filter, distinctUntilChanged, tap } = rxjs.operators;

const DEFAULT_BRUSH = 'barrier'

export const tileBrushStore = new Store('tilebrush', {
  state: {
    activeBrush: 'barrier'
  },
  getters: {},

 
  pipeline: (state$) => {
    return state$.pipe(
      tap(x => console.warn('[TILE BRUSH STORE PIPELINE]', x)),
      startWith(DEFAULT_BRUSH),
      filter(_ => _),
      distinctUntilChanged(),
      filter(([a, b]) => (a && b) && a !== b),
      shareReplay({ refCount: true, bufferSize: 1 })
    )
  }
});