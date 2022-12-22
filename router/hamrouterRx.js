import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
import { routes } from './routes.js';
const { help, pipeline, date, array, utils, text } = ham;
const { iif, ReplaySubject, AsyncSubject, Subject, interval, of , fromEvent, merge, empty, delay, from } = rxjs;
const { throttleTime, mergeMap, switchMap, scan, take, takeWhile, map, tap, startWith, filter, mapTo } = rxjs.operators;
const { fromFetch } = rxjs.fetch;


class HamRouter {
  constructor(routes = []) {
    console.log('routes', routes)
    this.routes = new Map(routes.map(_ => _.asIterable()));
    this.outlet = document.querySelector('.routerOutlet');
    this.activeView;

    window.addEventListener("popstate", event => {
      let state = event.state !== null ? event.state : { id: null }
      let id = state.id !== null && state.id !== undefined ? state.id : null;
      if (![undefined, null].includes(id)) {
        this.loadRoute(id);
      }
    });

    this.routerlinkPipeline = pipeline(
      this.getRoute.bind(this),
      this.getView.bind(this),
      // this.getHTML.bind(this),
      this.setOutletHTML.bind(this),
      this.resetRouterLinks.bind(this),
      this.pushState.bind(this),
    );
  }

  async init() {
    await this.loadRoute('home');
    return this;
  }

  async loadRoute(id) { return await this.routerlinkPipeline(id) }

  addRoute(route) { return new Route(route) }

  getRoute(path) { return this.routes.get(path); }


  async getHTML(route) {
    if (route.template !== null) return route;
    const resp = await (await fetch(route.url)).text()
    const parsedHTML = new DOMParser().parseFromString(resp, 'text/html').documentElement
    route.template = parsedHTML.querySelector('template').content.firstElementChild.cloneNode(true);
    return await route
  }

  async getView(route) {
    // if (route.template !== null) return route;
    // const resp = await (await fetch(route.url)).text()
    // const parsedHTML = new DOMParser().parseFromString(resp, 'text/html').documentElement
    this.activeView = await route.component;
    route.template = this.activeView.template
    // console.log('route.template', route.template)
    return await route
    // return await this.activeView
  }

  async setOutletHTML(route) {
    const r = await route;
    this.outlet.innerHTML = '';
    this.outlet.appendChild(await r.template)
    return await r;
  }

  async resetRouterLinks(route) {
    const r = await route;
    this.routerLinks.forEach((link, i) => {
      link.addEventListener('click', this.handleRouterLinkClick.bind(this))
    });
    return r;
  }



  async handleRouterLinkClick(e) {
    const t = e.currentTarget;
    let data = {...t.dataset}
console.log('handleRouterLinkClick', data)
    // if (t.classList.contains('entry')) {
    //   data.head = t.querySelector('.listItemHeader').textContent
    //   data.body = t.querySelector('.listItemBody').textContent
    // }

    return await this.loadRoute.bind(this)(t.dataset.route, data);
  }

  async pushState(route) {
    const r = await route;
    let state = this.history.state ? this.history.state : { id: null };
    let id = this.history.state ? this.history.state.id : null;

    if (state.id != r.id) {
      let name = r.id;
      document.title = name;
      this.history.pushState({ id: name, }, ``, `${window.location.origin}/${r.path}`.replace('http://localhost:6700//', 'http://localhost:6700/note-app/'))
    }
    console.log('END OF ROUTER PIPE', this.activeView);
    return r;
  }

  get history() { return window.history }
  get routerLinks() {
    return [...document.querySelectorAll('.routerLink')];
  }
}

export default new HamRouter(routes)
