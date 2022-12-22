import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
import { routes, Route } from './routes.js';

const { help, pipeline, date, array, utils, text } = ham;
const { iif, BehaviorSubject, AsyncSubject, Subject, interval, of , fromEvent, merge, empty, delay, from } = rxjs;
const { distinctUntilChanged, throttleTime, mergeMap, switchMap, scan, take, takeWhile, map, tap, startWith, filter, mapTo } = rxjs.operators;

class ActiveRoute extends Route {
  constructor(route, state, params) {
    super(route);
    this.state;
    this.params;
  }
}


class HamRouter {
  constructor(routes = []) {
    this.routes = new Map(routes.map(_ => _.asIterable()));
    this.outlet = document.querySelector('.routerOutlet');
    this.activeView;
    this.location = window.location

    this._activeView;
    this.activeRoute$ = (new BehaviorSubject(this.activeRoute)).pipe(distinctUntilChanged())

    this.routerlinkPipeline = pipeline(
      this.getRoute.bind(this),
      this.getView.bind(this),
      this.setOutletHTML.bind(this),
      this.resetRouterLinks.bind(this),
      this.pushState.bind(this),
      this.log.bind(this),
    );

    window.addEventListener('popstate', this.handlePopstate.bind(this));
  }

  async handlePopstate(event) {
    console.log('handlePopstate', event)
    let state = event.state !== null ? event.state : { id: null }
    let id = state.id !== null && state.id !== undefined ? state.id : null;

    if (![undefined, null].includes(id)) {
      this.loadRoute.bind(this)({ routePath: id });
    }
  }

  async init() {
    await this.loadRoute({ routePath: 'home' });
    return this;
  }

  async log(data) {
    console.warn({ data: await data });
    return data
  }

  async loadRoute(data) {
    return await this.routerlinkPipeline(data)
  }

  getRoute(data) {
    let { id, params } = data
    params = !!params ? params : { id: null }
    let r = this.routes.get(data.routePath)
    if (params.id !== null) {

      r.params.id = params.id
      return r
    } else { params = { id: data.routePath } }
    r.params = params

    return r
  }

  back() {
    this.history.back();
    return this.location;
  }

  async getHTML(route) {
    if (route.template !== null) return route;
    const resp = await (await fetch(route.url)).text()
    const parsedHTML = new DOMParser().parseFromString(resp, 'text/html').documentElement
    route.template = parsedHTML.querySelector('template').content.firstElementChild.cloneNode(true);

    return await route
  }

  getView(route) {
    if (route.template !== null) return route;
    this.activeView = route.component //(this);
    route.template = this.activeView.template

    return route
  }

  async setOutletHTML(route) {
    const r = await route;
    this.outlet.innerHTML = '';
    this.outlet.appendChild(await r.template)
    return r;
  }

  async resetRouterLinks(route) {
    const r = await route;
    this.routerLinks.forEach((link, i) => {
      link.addEventListener('click', this.handleRouterLinkClick.bind(this))
    })

    return r;
  }

  async handleRouterLinkClick(e) {
    const t = e.currentTarget;
    let data = { ...t.dataset, params: { id: t.id || null } }

    return await this.loadRoute.bind(this)(data);
  }

  async pushState(route) {
    const r = await route;
    console.log('r', r)
    let state = this.history.state ? this.history.state : { id: null };
    let id = this.history.state ? this.history.state.id : null;

    if (state.id !== null, state.id != r.id) {
      let path = r.params.id ? r.params.id : r.id;
      document.title = path;
      this.history.pushState({ id: r.id, }, ``, `${window.location.origin+this.location.pathname}/${r.params.id}`.replace('http://localhost:6700//', 'http://localhost:6700/note-app/'))
      // this.history.pushState({ id: r.id, }, ``, `${window.location.origin}/${r.path}`.replace('http://localhost:6700//', 'http://localhost:6700/note-app/'))
    }
    this.activeRoute = r
    return r;
  }

  get history() { return window.history }

  get activeRoute() { return this._activeRoute || this.routes.get('home') }
  set activeRoute(r) {
    this._activeRoute = r;
    this.activeRoute$.next(r);
  }

  get routerLinks() {
    return [...document.querySelectorAll('.routerLink')];
  }
};


export default new HamRouter(routes)