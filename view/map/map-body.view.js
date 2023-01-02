import { MapSection } from './map-section.view.js';
import {normalizeAddress} from '../../lib/tile-address.js';
export class MapBody extends MapSection {
  constructor(dimensions$, options) {
    super('body', dimensions$, options);
    setTimeout(() => {
      console.log(' ', );
    const div11 = document.querySelector('.tile[data-address="1_1"]');
    console.warn('div11', div11)
    }, 1000)
  };

  setTiles(tiles) {
    // console.warn('tiles in body', tiles);
    console.log('body tiles', { tiles: [...this.tiles] });
    [...this.tiles].forEach(([address, t], i) => {
          
        console.log({t});
          t.dom.remove()
        })
    tiles.forEach((t, i) => {
      t.address = normalizeAddress(t.address)
      const tile = this.tiles.get(t.address)
    console.warn('tile', tile)
      tile.dom.dataset.tileType = 'barrier'
      // const tile = document.querySelector (`.tile[data-x="${x}"][data-y="${y}"]`)
      // const tile = document.querySelector(`.tile[data-address="${t.address}"]`)
      console.log('`.tile[data-address="${t.address}"]`', `.tile[data-address="${t.address}"]`)
      tile.setType(t.tileType)
      tile.setData('fuck', 'me')
      // tile.dataset.tileType = 'barried
      // console.warn('found tile in body', tile.dom)

    });
  }
}