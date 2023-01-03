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
    '0_0': {tileType: 'barrier', address: '0_0'},
    '0_4': {tileType: 'barrier', address: '0_4'},
    '1_1': {tileType: 'barrier', address: '1_1'},
    '1_3': {tileType: 'barrier', address: '1_3'},
    '2_2': {tileType: 'barrier', address: '2_2'},
    '3_3': {tileType: 'barrier', address: '3_3'},
    '3_1': {tileType: 'barrier', address: '3_1'},
    '4_4': {tileType: 'barrier', address: '4_4'},
    '4_0': {tileType: 'barrier', address: '4_0'},
  },
};

export const getMapStore = defineStore('map', {
  state: INITIAL_MAP_STATE,
})