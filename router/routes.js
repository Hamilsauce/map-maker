import {
  HomeComponent,
  LibraryComponent,
  EntryComponent,
  JournalComponent,
} from '/note-app/views/index.js';
import router from './hamrouter.js'

export class Route {
  constructor({ id, url, path, params, component }, ) {
    this._id = id;
    this._path = path;
    this._params = params;
    this._url = url;
    this._component = component;
    this.routeComponentInstance = null;
    this._template = null;
  }

  asIterable() { return [this.id, this]; }

  component(router, params) {
    this.params = { ...this.params, ...params }
    const c = this._component(router, pars)
    return c
  }

  get id() { return this._id }
  set id(val) { this._id = val; }

  get component() {
    return this.routeComponentInstance === null ?
      new this._component(router, this.params) :
      this.routeComponentInstance
  }

  set component(val) { this._component = val; }

  get path() {
    let p = this._path;
    if (p.includes(':')) {
      p = p.split(':')
      p = p[0] + this.params[p[1]]
    }
    return p;
  }

  set path(val) { this._path = val; }
  get params() { return !!this._params ? this._params  : {} }
  set params(val) { this._params = val; }

  get url() { return this._url }
  set url(val) { this._url = val }

  get template() { return this._template }
  set template(val) { this._template = val }
}


export const routes = [
  // new Route({ component: LibraryComponent, path: '/library', id: 'library', url: '/note-app/views/library/library.html' }),
  new Route({ component: HomeComponent,params:{id:''}, path: '/', id: 'home', url: '/note-app/views/home/home.html' }),
  new Route({ component: EntryComponent, params: { id: '' }, path: '/entries', id: 'entries', url: '/note-app/views/entry/entry.html' }),
  new Route({ component: JournalComponent, params: { id: '' }, path: '/journal', id: 'journal', url: '/note-app/views/journal/journal.html' }),
]
