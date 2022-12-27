import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
import { EventEmitter } from 'https://hamilsauce.github.io/hamhelper/event-emitter.js';
const { template } = ham;
import { MapSection } from './map-section.view.js';

const DEFAULT_BODY_OPTIONS = {
  templateName: 'map-section',
  elementProperties: {
    id: 'map-body',
    dataset: {
      mapSection: 'body',
      mapSectionType: 'body',
    },
  },
}


export class MapBody extends MapSection {
  #self;
  #name;

  constructor(dimensions$, options = DEFAULT_BODY_OPTIONS) {
    super('body', dimensions$, options);

    if (!name) throw new Error('No name passed to constructor for ', this.constructor.name);

    this.#name = name;

    this.#self = View.#getTemplate(name);
  };

  get self() { return this.#self };

  get name() { return this.#name };

  static #getTemplate(name) {
    return template(name);
  }

  updateDimensions({ height, width, scale }) {
    const tiles = [];
    this.scale = scale;
    this.self.innerHTML = '';


    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        tiles.push(this.createTile(`${row}_${col}`))
      }
    }

    this.self.append(...tiles);
    this.self.style.gridTemplateRows = `repeat(${height}, ${scale}px)`;
    this.self.style.gridTemplateColumns = `repeat(${width}, ${scale}px)`;

    // else if (this.#sectionName.includes('body')) {
    //   this.self.innerHTML = '';

    //   const tiles = [];

    //   for (let row = 0; row < height; row++) {
    //     for (let col = 0; col < width; col++) {
    //       tiles.push(this.createTile(`${row}_${col}`))
    //     }
    //   }

    //   this.self.append(...tiles);
    //   this.self.style.gridTemplateRows = `repeat(${height}, ${scale}px)`;
    //   this.self.style.gridTemplateColumns = `repeat(${width}, ${scale}px)`;
    // }
  }

};