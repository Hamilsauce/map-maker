import { tileBrushStore } from './store/tile-brush.store.js';
import { MapView } from './view/map.view.js';
import { MapModel } from './store/map.model.js';
import { getStream } from './view/tile-view-updates.stream.js';
import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
const {download, date, array, utils, text } = ham;
import {MapLoader} from '../lib/map-loader.js';

const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of , fromEvent, merge, empty, delay, from } = rxjs;
const { flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;
const { fromFetch } = rxjs.fetch;

const saveButton = document.querySelector('#save-map');
const loadButton = document.querySelector('#load-map');
const tileBrushes = document.querySelectorAll('#controls')


const tileBrushSelectionEvents$ = fromEvent(tileBrushes, 'click')
  .pipe(
    map(e => e.target.closest('.tile-selector')),
    filter(b => b),
    map(b => ({ activeBrush: b.dataset.tileType })),
  );

tileBrushSelectionEvents$.subscribe(selection => tileBrushStore.update(selection))

const tileUpdates$ = getStream();

const tileUpdatesSub = tileUpdates$.subscribe();


const mapModel = new MapModel();

const mapView = new MapView();

mapView.render();



saveButton.addEventListener('click', e => {
  const jsonMap = mapView.saveMap();
  download('map-maker-save-1.json', jsonMap)
});

loadButton.addEventListener('click', e => {
  const map = localStorage.getItem('map-maker-save-1')

  if (map) {
    const parsed = JSON.parse(map)

    mapView.loadMap(parsed)
  }
});
