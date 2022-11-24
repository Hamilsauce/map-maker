import { Store } from './store.js'
const { scan, map, filter, distinctUntilChanged, tap } = rxjs.operators;


export const tileBrushStore = new Store('tilebrush', {
  state: {
    activeBrush: 'barrier'
  },
  getters: {},
  
  pipeline: (state$) => {
    return state$.pipe(
      filter(_ => _),
      distinctUntilChanged(),
    )
  }
});
