import { Model } from '../../lib/model.js';

export const TileInterface = {
  tileType: String,
  address: String,
  column: Number,
  row: Number,
}


export class TileModel extends Model {
  #tileType;
  #address;
  #column;
  #row;

  constructor(data) {
    super('tile');
    this.assign(data);
  }

  static create(data) {
    return new TileModel(data || {});
  }

  update(data) {
    return new TileModel({ ...this, ...data });
  }


  get tileType() { return this.#tileType }

  set tileType(v) { this.#tileType = v }

  get address() { return this.#address }

  set address(v) { this.#address = v }

  get column() { return this.#column }

  set column(v) { this.#column = v }

  get row() { return this.#row }

  set row(v) { this.#row = v }
}