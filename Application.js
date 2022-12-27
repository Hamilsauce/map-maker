import { toolGroupStore } from './store/tool-group.store.js';
import { MapView } from './view/map.view.js';
import { MapModel } from './store/map.model.js';
import { getStream } from './view/tile-view-updates.stream.js';
import { gridOptions } from './view/grid-options.view.js';
import { AppMenu } from './view/app-menu.view.js';


import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
import { EventEmitter } from 'https://hamilsauce.github.io/hamhelper/event-emitter.js';
import { AppFooter, AppHeader, AppBody } from './view/app-components/index.js';

const { template } = ham;



const handleCancel = () => {
  this.setActiveView(this.viewHistory[this.viewHistory.length - 1])
}

const AppComponents = new Map([
  ['app-header', AppHeader],
  ['app-body', AppBody],
  ['app-footer', AppFooter],
]);



const mapModel = new MapModel();
const mapView = new MapView();
const appMenu = new AppMenu();


export class Application extends EventEmitter {
  #self;

  #components = new Map();

  constructor(name) {
    super();

    if (!name) throw new Error('No name passed to constructor for ', this.constructor.name);

    this.#self = template(name);
    this.handleCancel = handleCancel.bind(this)

    const swap = document.querySelector('#app')

    swap.parentElement.insertBefore(this.#self, swap.remove())

    const placeholders = [...this.self.querySelectorAll('[data-component-placeholder]')];

    this.appMenu = new AppMenu();

    placeholders.forEach((el, i) => {
      const name = el.dataset.componentPlaceholder;
      const comp = new(AppComponents.get(name))()

      if (!comp) return;

      this.#components.set(comp.dom, comp);

      el.parentElement.insertBefore(comp.dom, el.remove());
    });


    this.activeToolGroup$ = toolGroupStore.select({ key: 'activeToolGroup' }).pipe(
      tap((activeToolGroup) => this.activeToolGroup = activeToolGroup),
      tap(x => console.log('[ACTIVE TOOL GROUP IN APP]', x)),
    ).subscribe();

  }

  get self() { return this.#self }

  get activeView() { return this.views[this.viewHistory[this.viewHistory.length - 1]] }
  get mapList() { return this.views.load.querySelector('.saved-map-list') }
  get viewHistory() { return [] }
  get app() { return this.#self } //  document.querySelector('#app') }
  get map() { return this.mapView } //  document.querySelector('#app') }
  get body() { return document.querySelector('#app-body') }
  get header() { return document.querySelector('#app-header') }
  get menu() { return document.querySelector('#app-menu') }
  get views() {
    return {
      save: template('save-view'),
      load: template('load-view'),
      map: mapView.render(),
    }
  }
  get buttons() {
    return {
      menuOpen: document.querySelector('#menu-open'),
      save: document.querySelector('#save-map'),
      load: document.querySelector('#load-map'),
      tileBrushes: document.querySelectorAll('#controls'),
      cancelButtons: document.querySelectorAll('.cancel-button'),
    }
  }

  get inputs() {
    return {
      file: document.querySelector('#file-input')
    }
  }


  setActiveView(name, options) {
    if (!name) return;

    const viewHistoryHead = this.viewHistory[this.viewHistory.length - 1];

    ui.buttons.cancelButtons.forEach((b) => {
      b.removeEventListener('click', this.handleCancel);
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
        b.addEventListener('click', this.handleCancel);
      });

    if (newViewHistoryHead === 'save') {
      this.activeView.querySelector('#map-name-input').focus();
    }
  }
}