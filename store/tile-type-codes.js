import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
const { TwoWayMap, date, array, utils, text } = ham;

const MAP_SYMBOLS = new Map([
  ['#', ((options = {}) => ({ ...{ symbol: '#', cellTypeId: 0, tileType: 'barrier', direction: null, isCharacter: false, isPassable: false, }, ...options })).bind(this)],
  ['<', ((options = {}) => ({ ...{ symbol: '<', cellTypeId: 1, tileType: 'character', direction: 'left', hasCharacter: true, isPassable: false, }, ...options })).bind(this)],
  ['>', ((options = {}) => ({ ...{ symbol: '>', cellTypeId: 1, tileType: 'character', direction: 'right', hasCharacter: true, isPassable: false, }, ...options })).bind(this)],
  ['^', ((options = {}) => ({ ...{ symbol: '^', cellTypeId: 1, tileType: 'character', direction: 'up', hasCharacter: true, isPassable: false, }, ...options })).bind(this)],
  ['v', ((options = {}) => ({ ...{ symbol: 'v', cellTypeId: 1, tileType: 'character', direction: 'down', hasCharacter: true, isPassable: false, }, ...options })).bind(this)],
  [' ', ((options = {}) => ({ ...{ symbol: ' ', cellTypeId: 2, tileType: 'ground', direction: null, isCharacter: false, isPassable: true, }, ...options })).bind(this)],
  ['x', ((options = {}) => ({ ...{ symbol: 'x', cellTypeId: 3, tileType: 'exit', direction: null, isCharacter: false, isPassable: true, isExit: true }, ...options })).bind(this)],
  ['.', ((options = {}) => ({ ...{ symbol: '.', cellTypeId: 4, tileType: 'path', direction: null, isCharacter: false, isPassable: true, isExit: false }, ...options })).bind(this)],
]);


export const tileTypeCodes = new TwoWayMap([
  [-1, 'empty'],
  [0, 'barrier'],
  [1, 'character'],
  [2, 'ground'],
  [3, 'start'],
  [4, 'exit'],
  [5, 'path'],
])

export const tileCodeCharacterMap = new TwoWayMap([
  [' ', -1],
  ['#', 0],
  ['^', 1],
  ['>', 1],
  ['<', 1],
  ['v', 1],
  [' ', 2],
  ['$', 3],
  ['x', 4],
  [' ', 5],
])
