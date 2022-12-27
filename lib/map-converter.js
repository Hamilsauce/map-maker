export const TILE_CONFIGS = new Map([
  ['*', { symbol: '*', tileTypeId: 7, tileType: 'empty', direction: null, hasCharacter: false, isPassable: false, }],
  ['#', { symbol: '#', tileTypeId: 0, tileType: 'barrier', direction: null, hasCharacter: false, isPassable: false, }],
  ['<', { symbol: '<', tileTypeId: 1, tileType: 'character', direction: 'left', hasCharacter: true, isPassable: false, }],
  ['>', { symbol: '>', tileTypeId: 1, tileType: 'character', direction: 'right', hasCharacter: true, isPassable: false, }],
  ['^', { symbol: '^', tileTypeId: 1, tileType: 'character', direction: 'up', hasCharacter: true, isPassable: false, }],
  ['v', { symbol: 'v', tileTypeId: 1, tileType: 'character', direction: 'down', hasCharacter: true, isPassable: false, }],
  [' ', { symbol: ' ', tileTypeId: 2, tileType: 'ground', direction: null, hasCharacter: false, isPassable: true, }],
  ['$', { symbol: '$', tileTypeId: 3, tileType: 'start', direction: null, hasCharacter: false, isPassable: true, isExit: false, isStart: true }],
  ['x', { symbol: 'x', tileTypeId: 4, tileType: 'exit', direction: null, hasCharacter: false, isPassable: true, isExit: true }],
  ['.', { symbol: '.', tileTypeId: 5, tileType: 'path', direction: null, hasCharacter: false, isPassable: true, isExit: false }],
  ['@', { symbol: '@', tileTypeId: 6, tileType: 'target', direction: null, hasCharacter: false, isPassable: true, isExit: true }],
]);

const tileCharLookup = new Map([
    [-1, '*'],
    [0, '#'],
    [1, '<'],
    [2, ' '],
    [3, '$'],
    [4, 'x'],
    [5, '.'],
    [6, '@'],
])


export class MapConverter {
  constructor() {}

  parseAddress(t) {
    return t.address.split(',').map((_, i) => +_)
  }
  
  stringRowsToMap(rows = []) {
    // Create TileMap Object of map row string array
    if (!(Array.isArray(rows) && typeof rows[0] == 'string')) throw new Error('Invalid map')

    const tileMapObject = {
      map: {
        dims: {
          height: rows.length,
          width: rows[0].trim().length,
          unitSize: 1,
          scale: 32,
        },
        tiles: rows.reduce((tiles, row, rowIndex) => {
          return [
            ...tiles,
            ...row.trim().split('').map((tile, columnIndex) => ({ address: [rowIndex, columnIndex].toString(), type: TILE_CONFIGS.get(tile).tileTypeId }))
          ]
        }, [])
      }
    }
    return tileMapObject;
  }


  mapToStringRows(map = {}) {
    // Create TileMap Object of map row string array
    if (!(Array.isArray(map.tiles))) throw new Error('Invalid map')

    const { tiles } = map;

    const sortedTiles = tiles.sort((a, b) => {
      const [aRow, aCol] = a.address.split(',').map((_, i) => +_)
      const [bRow, bCol] = b.address.split(',').map((_, i) => +_)

      return aRow === bRow ? aCol - bCol : aRow - bRow;
    });

    const tileMap = new Map(sortedTiles.map(({ address, type }) => [address, type]))

    const lastTile = sortedTiles[sortedTiles.length - 1];

    const rows = new Array(this.parseAddress(lastTile)[0] + 1).fill(null)
      .map((_, r) => {
        return new Array(this.parseAddress(lastTile)[1] + 1).fill(null)
          .map((_, c) => {
            const address = [r, c].toString();

            if (tileMap.has(address)) {
              const tile = tileMap.get(address);

              return tileCharLookup.get(tile);
            }

            return '*';
          }).join('');
      });

    return rows;
  }
}