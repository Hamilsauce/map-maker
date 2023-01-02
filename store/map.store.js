import { defineStore } from './rx-store.js';

const INITIAL_MAP_STATE = {
  id: null,
  name: 'untitled map',
  dimensions: {
    width: 5,
    height: 5,
    scale: 32
  },
  tilesArray: [
    
  ],
  tiles: {
    '0,0': {tileType: 'barrier', address: '0,0'},
    '1,1': {tileType: 'barrier', address: '1,1'},
    '2,2': {tileType: 'barrier', address: '2,2'},
  },
};

export const getMapStore = defineStore('map', {
  state: INITIAL_MAP_STATE,
})