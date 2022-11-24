import { Model } from '../lib/model.js';
import { TileModel } from './tile.model.js';
import { tileTypeCodes } from './tile-type-codes.js';

/*
  REQUIREMENTS
  
  - Accepts 2D array/matrix of numbers representing tile type
    - Parse if serialized
    -
    
  - Create new Tile instance for each element in matrix
    - Generate address string from r,c indexes
    - 
*/

export class MapModel extends Model {
  constructor() {
    super('map');
  }

  createTile(data) {
    return TileModel.create(data);
  }

  insertTile(data) {
    const tile = TileModel.create(data);
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
