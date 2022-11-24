import { Store } from './store.js'
const { scan, map, filter, distinctUntilChanged, tap } = rxjs.operators;

const DEFAULT_SELECTION_STATE = {
  activeTile: null,
  selectedTiles: [],
}

export const tileSelection = new Store('tileSelection',{
  state: { ...DEFAULT_SELECTION_STATE },
  pipeline: (state$) => {
    return state$.pipe(
      filter(_ => _),
      distinctUntilChanged(),
    )
  }
});
