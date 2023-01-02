import { Model } from '../../lib/model.js';
import { TileModel } from './tile.model.js';
import { tileTypeCodes } from '../tile-type-codes.js';

/*
  REQUIREMENTS
  
    - Accepts 2D array/matrix of numbers representing tile type
      - Parse if serialized
      -
      
    - Create new Tile instance for each element in matrix
      - Generate address string from r,c indexes
  
  TILES: 
    Only Stores non-empty/non-default tiles 
    Stored in map/object 
    
    <Key: address, Value: Tile>
   
    View will use dims to create full grid
    then set tiles found in model
    
  Loading a Map
    Create
    
  
*/

export const MapInterface = {
  key: '',
  name: '',
  dimensions: {},
  tiles: new Map(),
}

export class MapModel extends Model {
  #id = '';
  #name = '';
  #tiles = new Map();
  #dimensions = {
    width: 0,
    height: 0,
    scale: 0,
  }

  constructor() {
    super('map');
  }

  toPoint(address) {
    if (!(typeof address === 'string') || !address.includes(',')) return;

    return address.split(',')
      .reduce((point, curr, i) => ({
        ...point,
        [i === 0 ? 'row' : 'column']: +curr
      }), { row: null, column: null });
  }

  toAddress(r, c) {
    if (+r && +c) return [r, c].toString();
  }

  createTile(address, tileOptions) {
    return TileModel.create(tileOptions);
  }

  insertTile(r, c, data) {
    const tile = this.createTile(data)
  }

  findNeighbors(tile) {
    return TileModel.create(data);
  }

  load(tile) {
    return TileModel.create(data);
  }

  import(tile) {
    return TileModel.create(data);
  }

  export (tile) {
    return TileModel.create(data);
  }

  // get prop() { return this._prop };
  // set prop(newValue) { this._prop = newValue };
}