import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
import { View } from '../view.js';
import { TileView } from '../tile.view.js';

const { template } = ham;
const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of, fromEvent, merge, empty, delay, from } = rxjs;
const { flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;
const { fromFetch } = rxjs.fetch;

/*

REQS:

Init
 - Instantiate Sections: Corner, Headers, Body
 - Set initial dims: 
    Corner gets unit w and h
    row header gets unit height and map height
    col header gets unit width and map width
    body gets all
  
*/

export class MapSection extends View {
  #self;
  #tiles = new Map();
  #clickHandler;
  dimensions$;
  #scale;
  height = 0;
  width = 0;
  scale = 30;
  #sectionName = null;
  #sectionType = 'null';

  constructor(sectionName, dimensions$, options) {
    super('map-section', options);
    
    this.#sectionType = options.elementProperties.dataset.mapSectionType;
    this.#sectionName = sectionName;
    this.dimensions$ = dimensions$;
    this.updateDimensions = this.#updateDimensions.bind(this);


    this.#clickHandler = this.#handleClick.bind(this);

    this.self.addEventListener('click', this.#clickHandler);
    // console.warn('MAP SECTION THIS', this)
  }

  get sectionName() { return this.#sectionName }

  get sectionType() { return this.#sectionType }

  get tiles() { return this.#tiles } /// [...this.querySelectorAll('.tile')] }

  get gridTemplateRows() { return this.self.style.gridTemplateRows }

  set gridTemplateRows(v) { return this.self.style.gridTemplateRows }

  get gridTemplateColumns() { return this.self.style.gridTemplateColumns }

  get scale() { return this.#scale }

  set scale(v) {
    this.#scale = v;
  }

  set height(v) { return this.#sectionName }

  createTile(id, type = 'empty') {
    type = this.sectionType === 'header' ? 'header' : type;
    
    const t2 = TileView.create({ address: id, tileType: type });
    
    this.tiles.set(t2.address, t2);
    
    return t2;
  }

  loadTiles(tiles = []) {
    for (let row = 0; row < dims.height; row++) {
      for (let col = 0; col < dims.width; col++) {
        const st = savedTiles ? savedTiles.find(t => t.address == [row, col].toString()) : null;

        if (st) this.insertTile(row, col, tileTypeCodes.get(st.type));

        else this.insertTile(row, col, 'empty');
      }
    }

    setTimeout(() => {
      this.getTile('0,0').dom.scrollIntoView(false);
    }, 0)
  }

  #updateDimensions({ height, width, scale }) {
    this.scale = scale;

    if (this.#sectionName.includes('row')) {
      this.self.innerHTML = '';
      const diff = height - this.height;

      const tiles = new Array(height).fill(null).map((_, i) => this.createTile(i.toString()).dom);
    
      this.self.append(...tiles);

      this.height = height;

      this.self.style.gridTemplateRows = `repeat(${height}, ${scale}px)`;
    }

    else if (this.#sectionName.includes('column')) {
      this.self.innerHTML = '';
     
      const diff = width - this.width;

      const tiles = new Array(width).fill(null).map((_, i) => this.createTile(i).dom);
    
      this.self.append(...tiles);
    
      this.width = width;

      this.self.style.gridTemplateColumns = `repeat(${width}, ${scale}px)`;
    }

    else if (this.#sectionName.includes('body')) {
      this.self.innerHTML = '';

      const tiles = [];

      for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
          tiles.push(this.createTile([row, col].toString()).dom);
        }
      }
      this.self.append(...tiles);
      this.self.style.gridTemplateRows = `repeat(${height}, ${scale}px)`;
      this.self.style.gridTemplateColumns = `repeat(${width}, ${scale}px)`;
    }
  }

  #handleClick(e) {
    // console.log('handle click in ' + this.sectionName);
  }
};