import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
import { EventEmitter } from 'https://hamilsauce.github.io/hamhelper/event-emitter.js';
import { AppFooter, AppHeader, ViewFrame } from './view/app-components/index.js';

const { template } = ham;

const AppComponents = new Map([
  ['app-header', AppHeader],
  ['view-frame', ViewFrame],
  ['app-footer', AppFooter],
]);

export class Application extends EventEmitter {
  #self;
  #components = new Map();

  constructor(name) {
    super();

    if (!name) throw new Error('No name passed to constructor for ', this.constructor.name);

    this.#self = template(name);

    const swap = document.querySelector('#app')
    swap.parentElement.insertBefore(this.#self, swap.remove())

    const placeholders = [...this.self.querySelectorAll('[data-component-placeholder]')];
    placeholders.forEach((el, i) => {
      const name = el.dataset.componentPlaceholder;
      const comp = new (AppComponents.get(name))()
      if (!comp) return;

      this.#components.set(comp.dom, comp)

      el.parentElement.insertBefore(comp.dom, el.remove())


    });

  }


  get self() { return this.#self };
};