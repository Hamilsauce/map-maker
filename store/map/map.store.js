import { defineStore } from '../rx-store.js';


const INITIAL_MAP_STATE = {
  id: null,
  name: 'untitled map',
  dimensions: {
    width: 10,
    height: 5,
    scale: 32
  },
  tiles: {
    '0_0': { tileType: 'barrier', address: '0_0' },
    '0_4': { tileType: 'barrier', address: '0_4' },
    '1_1': { tileType: 'barrier', address: '1_1' },
    '1_3': { tileType: 'barrier', address: '1_3' },
    '2_2': { tileType: 'barrier', address: '2_2' },
    '3_3': { tileType: 'barrier', address: '3_3' },
    '3_1': { tileType: 'barrier', address: '3_1' },
    '4_4': { tileType: 'barrier', address: '4_4' },
    '4_0': { tileType: 'barrier', address: '4_0' },
  },
};


const mapReducer = (state, action) => {
  switch (action.type) {
    case "CHANGE_DIMENSIONS": {
      const { dimensions } = action;

      if (!dimensions) return { ...state };

      return { ...state, dimensions: { ...state.dimensions, ...dimensions } };
    }

    case "UPDATE_TILES": {
      const { tiles } = action;

      if (!tiles) return { ...state };

      const cleanedTiles = Object.fromEntries(
        Object.entries({ ...state.tiles, ...tiles }).filter(([k, v]) => v.tileType !== 'empty')
      );

      return { ...state, tiles: cleanedTiles }
    }

    case "RESET_TILES": {
      const { tiles } = action;

      // const stateTiles = Object.entries(state.tiles)
      const stateTiles = Object.fromEntries(
        Object.entries({ ...state.tiles }).map(([k, v]) => ([k, { ...v, tileType: 'empty' }]))
      );

      // if (!tiles) return { ...state };

      const cleanedTiles = Object.fromEntries(
        Object.entries({ ...state.tiles, ...{...stateTiles, ...tiles} }).filter(([k, v]) => v.tileType !== 'empty')
      );

      return { ...state, tiles: {...cleanedTiles} }
    }

    default:
      return state;
  }
};


export const getMapStore = defineStore('map', {
  state: INITIAL_MAP_STATE,
  reducer: mapReducer
})