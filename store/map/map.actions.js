import { createAction } from '../lib/create-action.js';

export const updateMapTiles = createAction(
  'UPDATE_TILES', {
    tiles:  Object
  }
)

export const changeMapDimensions = createAction(
  'CHANGE_DIMENSIONS', {
    dimensions:  Object
  }
)