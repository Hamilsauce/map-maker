import { tileBrushStore } from './store/tile-brush.store.js';
import { MapView } from './view/map.view.js';
import { MapModel } from './store/map.model.js';
import { getStream } from './view/tile-view-updates.stream.js';
// import { MapLoader } from '../lib/map-loader.js';
import { gridOptions } from './view/grid-options.view.js';
import { AppMenu } from './view/app-menu.view.js';
import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
import { DEFAULT_STATE } from './store/StateModel.js';
const { download, template, utils } = ham;
import { LOCALSTORAGE_KEY } from './lib/constants.js';
const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of , fromEvent, merge, empty, delay, from } = rxjs;
const { flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;
const { fromFetch } = rxjs.fetch;
import { Application } from './Application.js';

export class Vector {
  #x;
  #y;

  constructor(x, y) {
    this.#x = x;
    this.#y = y;
  }

  get x() { return this.#x };
  get y() { return this.#y };
  // set prop(v) { this.#prop = v };
}

const handleFileSelection = (e) => {
  console.warn('handleFileSelection', { e });
  ui.inputs.file.addEventListener('change', handleFileSelection)
};

const handleCancel = () => {
  ui.setActiveView(ui.viewHistory[ui.viewHistory.length - 1])
}

console.log(JSON.parse(localStorage.getItem('MAP_MAKER')))

const mapModel = new MapModel();
const mapView = new MapView();
const appMenu = new AppMenu();

const ui = {
  get activeView() { return this.views[this.viewHistory[this.viewHistory.length - 1]] },
  get mapList() { return this.views.load.querySelector('.saved-map-list') },
  viewHistory: [],
  app: document.querySelector('#app'),
  body: document.querySelector('#app-body'),
  header: document.querySelector('#app-header'),
  menu: document.querySelector('#app-menu'),
  views: {
    save: template('save-view'),
    load: template('load-view'),
    map: mapView.render(),
  },
  buttons: {
    menuOpen: document.querySelector('#menu-open'),
    save: document.querySelector('#save-map'),
    load: document.querySelector('#load-map'),
    tileBrushes: document.querySelectorAll('#controls'),
    cancelButtons: document.querySelectorAll('.cancel-button'),
  },
  inputs: {
    file: document.querySelector('#file-input'),
  },
  handleCancel: handleCancel.bind(this),

  setActiveView(name, options) {
    if (!name) return;
   
    const viewHistoryHead = this.viewHistory[this.viewHistory.length - 1];

    ui.buttons.cancelButtons.forEach((b) => {
      b.removeEventListener('click', handleCancel);
    });
    
    if (this.activeView && this.viewHistory.length > 0) {
      this.activeView.remove();
    }

    if (name === viewHistoryHead) {
      this.viewHistory.pop();
    }

    else this.viewHistory.push(name);

    const newViewHistoryHead = this.viewHistory[this.viewHistory.length - 1];

    if ([undefined, null].includes(this.activeView)) return;

    this.body.append(this.activeView);

    this.activeView.querySelectorAll('.cancel-button')
      .forEach((b) => {
        b.addEventListener('click', handleCancel);
      });

    if (newViewHistoryHead === 'save') {
      this.activeView.querySelector('#map-name-input').focus();
    }
  },
}

window.ui = ui

const tileBrushSelectionEvents$ = fromEvent(ui.buttons.tileBrushes, 'click')
  .pipe(
    tap(e => e.stopPropagation()),
    map(e => e.target.closest('.tile-selector')),
    filter(b => b),
    map(b => ({ activeBrush: b.dataset.tileType })),
  );

tileBrushSelectionEvents$.subscribe(selection => tileBrushStore.update(selection))

ui.header.querySelector('#map-options').innerHTML = '';
ui.header.querySelector('#map-options').append(gridOptions)

ui.app.append(appMenu.dom)

ui.app.addEventListener('option:change', ({ detail }) => {
  console.warn('option:change', detail)
  mapView.setDimensions({
    [detail.name]: detail.value
  })
});

ui.buttons.menuOpen.addEventListener('click', e => {
  appMenu.open();
});

appMenu.on('menu:save-map', e => {
  ui.setActiveView('save');
});

appMenu.on('menu:load-map', e => {
  ui.setActiveView('load');
  ui.mapList.innerHTML = '';

  const data = JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY)) || DEFAULT_STATE

  Object.values(data.savedMaps).forEach((m, i) => {
    const item = template('map-list-item');

    item.dataset.mapKey = m.key;
    item.textContent = m.mapName;
    ui.mapList.append(item);
  });
});

ui.mapList.addEventListener('click', e => {
  const item = e.target.closest('.map-list-item');

  if (item && item.dataset.mapKey) {
    const mapData = JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY)) //|| DEFAULT_STATE;
    const map2 = mapData.savedMaps[item.dataset.mapKey];

    ui.setActiveView('map');

    mapView.loadMap(map2);

    ui.header.querySelector('#header-center-bottom').firstElementChild.textContent = map2.mapName
  }
});

ui.views.save.querySelector('#map-name-submit').addEventListener('click', e => {
  const input = ui.views.save.querySelector('#map-name-input');

  if (!input.value) prompt('Enter Name');

  else {
    const data = JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY)) || DEFAULT_STATE

    if (data) {
      const map = mapView.getMapState();
      map['tile'] = map.tiles;
      map.mapName = input.value;
      map.key = map.key ? map.key : 'm' + utils.uuid();
      data.savedMaps[map.key] = map;

      ui.setActiveView('map');
    }

    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(data));
  }

  ui.inputs.file.click();
 
  ui.inputs.file.addEventListener('change', handleFileSelection);

  const map = localStorage.getItem('map-maker-save-1');

  if (map) {
    const parsed = JSON.parse(map);
    mapView.loadMap(parsed);
  }
});

ui.header.querySelector('#header-center-bottom')
  .addEventListener('click', e => {
    ui.header.querySelector('svg').dataset.expand = ui.header.querySelector('svg').dataset.expand === 'true' ? 'false' : 'true'
    gridOptions.dataset.show = gridOptions.dataset.show === 'true' ? 'false' : 'true';
  })

const closeMenu = document.querySelector('#app-menu-close')
closeMenu.addEventListener('click', e => {
  ui.menu.dataset.show = false;
})


ui.setActiveView('map', { message: 'called after render' })
// const app = new Application('app');
// const col0 = mapView.getColumn(0)