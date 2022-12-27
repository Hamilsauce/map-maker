import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
import { EventEmitter } from 'https://hamilsauce.github.io/hamhelper/event-emitter.js';
import { View } from './view.js';

const { template } = ham;
const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of , fromEvent, merge, empty, delay, from } = rxjs;
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
  #clickHandler;
  dimensions$;
  #scale;
  height = 0;
  width = 0;
  scale = 30;
  #sectionName = null;

  constructor(sectionName, dimensions$, options) {
    super('map-section', options);

    this.#sectionName = sectionName;
    this.dimensions$ = dimensions$;

    this.dimensions$
      .pipe(
        tap(this.updateDimensions.bind(this)),
      )
      .subscribe();


    this.#clickHandler = this.#handleClick.bind(this);

    this.self.addEventListener('click', this.#clickHandler);
  }

  get sectionName() { return this.#sectionName }

  get tiles() { return [...this.querySelectorAll('.tile')] }

  get gridTemplateRows() { return this.self.style.gridTemplateRows }

  set gridTemplateRows(v) { return this.self.style.gridTemplateRows }

  get gridTemplateColumns() { return this.self.style.gridTemplateColumns }

  get scale() { return this.#scale }

  set scale(v) {
    this.#scale = v;
  }

  set height(v) { return this.#sectionName }

  createTile(id) {
    const t = document.createElement('div');

    t.classList.add('tile');
    t.dataset.id = id;
    t.id = id;
    t.textContent = this.#sectionName.includes('body') ? '' : id;

    return t;
  }

  updateDimensions({ height, width, scale }) {
    this.scale = scale;

    if (this.#sectionName.includes('row')) {
      this.self.innerHTML = '';
      const diff = height - this.height;

      const tiles = new Array(height).fill(null).map((_, i) => this.createTile(i));
      this.self.append(...tiles);

      this.height = height;

      this.self.style.gridTemplateRows = `repeat(${height}, ${scale}px)`;
    }

    else if (this.#sectionName.includes('column')) {
      this.self.innerHTML = '';
      const diff = width - this.width;

      const tiles = new Array(width).fill(null).map((_, i) => this.createTile(i));
      this.self.append(...tiles);
      this.width = width;

      this.self.style.gridTemplateColumns = `repeat(${width}, ${scale}px)`;
    }

    else if (this.#sectionName.includes('body')) {
      this.self.innerHTML = '';

      const tiles = [];

      for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
          tiles.push(this.createTile(`${row}_${col}`))
        }
      }

      this.self.append(...tiles);
      this.self.style.gridTemplateRows = `repeat(${height}, ${scale}px)`;
      this.self.style.gridTemplateColumns = `repeat(${width}, ${scale}px)`;
    }
  }

  #handleClick(e) {
    console.log('handle click in ' + this.sectionName);
  }
};