import { Store } from './store.js'
const { scan, startWith, map, filter, distinctUntilChanged, tap } = rxjs.operators;

const ToolGroupKeys = {
  tile: 'tile',
  actor: 'actor',
  layer: 'layer',
  color: 'color',
  other: 'other',
}


const DEFAULT_TOOL_GROUP = ToolGroupKeys.tile

export const toolGroupStore = new Store('toolgroup', {
  state: {
    activeGroup: DEFAULT_TOOL_GROUP,
  },
  getters: {},

  pipeline: (state$) => {
    return state$.pipe(
      startWith(DEFAULT_TOOL_GROUP),
      tap(x => console.log('toolgroup [/store/tool-group.store.js]: ', x)),
      filter(_ => _),
      distinctUntilChanged(),
      filter(([a, b]) => (a && b) && a !== b),
      tap(x => console.warn('AFTER FILTER toolgroup [/store/tool-group.store.js]: ', x)),
    )
  }
});