import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
import { EventEmitter } from 'https://hamilsauce.github.io/hamhelper/event-emitter.js';
import { View } from './view.js';
import { MapSection } from './map-section.view.js';
import { getStore } from '../../store/rx-store.js';

const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of, fromEvent, merge, empty, delay, from } = rxjs;
const { flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;
const { fromFetch } = rxjs.fetch;


/*
  MAP VIEW

  Mediator over Map Sections (Headers, Body, Corner);
*/

const MapViewOptions = {
  templateName: 'map',
  elementProperties: {
    id: 'map',
    classList: ['gradient'],
  },
  children: []
}

const MapSectionOptions = [
  {
    templateName: 'map-section',
        mapSection: 'body',
    elementProperties: {
      id: 'map-body',
      dataset: {
        mapSection: 'body',
        mapSectionType: 'body',
      },
    },
  },
  {
    templateName: 'map-section',
    mapSection: 'rows',
    elementProperties: {
      id: 'map-rows',
      dataset: {
        mapSection: 'rows',
        mapSectionType: 'header',
      },
    },
  },
  {
    templateName: 'map-section',
        mapSection: 'columns',
    elementProperties: {
      id: 'map-cols',
      dataset: {
        mapSection: 'columns',
        mapSectionType: 'header',
      },
    },
  },
  {
    templateName: 'map-section',
        mapSection: 'corner',
    elementProperties: {
      id: 'map-corn',
      dataset: {
        mapSection: 'corner',
        mapSectionType: 'corner',
      },
    }
  }
];

export class MapView extends View {
  #self;
  #dimensions$;
  #sections = new Map([
    ['corner', null],
    ['rows', null],
    ['columns', null],
    ['body', null],
  ]);

  store = getStore();

  constructor(dimensions$) {
    super('map', MapViewOptions);

    this.#dimensions$ = this.store.select(state => state.dimensions)

    // this.#dimensions$.pipe(
    //   map(x => x),
    //   tap(x => console.warn('this.#dimensions$ IN MAP VIEW', x))
    // ).subscribe();

    this.init(MapSectionOptions);
  }

  init(sectionOptions = []) {
    sectionOptions.forEach((opts, i) => {
      const mapSectionName = opts.mapSection

      if (!this.#sections.has(mapSectionName)) throw new Error('Invalid map section in Map Init. Value: ' + mapSectionName);

      this.#sections.set(
        mapSectionName,
        new MapSection(mapSectionName, this.#dimensions$, opts)
      );
    });

    this.self.append(...[...this.#sections.values()].map(_ => _.dom))
  }

  get body() { return this.#sections.get('body') }

  get rowHeader() { return this.#sections.get('rows') }

  get columnHeader() { return this.#sections.get('columns') }

  get corner() { return this.#sections.get('corner') }
};