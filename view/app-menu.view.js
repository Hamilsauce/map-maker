import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
// import { EventEmitter } from 'https://hamilsauce.github.io/event-emitter.js';
import { View } from './view.js';

const { template } = ham;

export class Action {
  #type = String;
  #payload = Object;

  constructor(type, payload = {}) {
    if (!type) throw new Error('No type passed to Action');

    this.#type = type;

    this.#payload = payload;
  }

  get type() { return this.#type };

  get payload() { return this.#payload || null };
}



const DEFAULT_MENU_OPTIONS = {
  items: [
    {
      name: 'save-map',
      title: 'Save',
      path: null,
      action: new Action('save-map'),
    },
    {
      name: 'load-map',
      title: 'Load',
      path: null,
      action: new Action('load-map'),
    },
  ]
}

export class MenuItem {
  #name = String;
  #title = String;
  #path = String;
  #action = Action;
  #self;
  constructor({ name, title, path, action }) {
    this.#self = document.createElement('div');
    this.#self.classList.add('app-menu-item')
    this.title = title;
    this.#name = name;
    this.#path = path;
    this.action = action;

    // this.#self.dataset.action = config.item.action.type;
    // this.#self.textContent = config.item.title;
  }


  get dom() { return this.#self };

  get name() { return this.#name };

  // set name(v) { this.#self.dataset = v };

  get title() { return this.#self.textContent };

  set title(v) { this.#self.textContent = v };

  // get path() { return this.#self };

  // set path(v) { this.#self.dataset = v };

  get action() { return this.#action };

  set action(v) {
    this.#action = v
    this.#self.dataset.action = v.type;
  };
}

export class AppMenu extends View {
  #items = new Map();

  constructor(options = DEFAULT_MENU_OPTIONS) {
    super('app-menu');

    if (options && options.items) {
      this.init(options.items);
    }

    this.closeButton.addEventListener('click', e => {
      this.close();
    });

    this.closeButton.addEventListener('menu:open', e => {
      this.open();
    });
  }

  get closeButton() { return this.selectDOM('#app-menu-close') };

  get items() { return this.selectDOM('#app-menu-items') };

  init(items) {
    this.items.innerHTML = ''
    this.close()
    this.items.append(...items.map(this.createItem.bind(this)))

    this.self.addEventListener('click', this.handleItemClick.bind(this));
  }

  createItem(config) {
    const itm = new MenuItem(config);
    this.#items.set(itm.dom, itm);
    return itm.dom;
  }

  handleItemClick(e) {
    const targ = e.target.closest('.app-menu-item');
    const item = this.#items.get(targ);

    if (item) {
      this.emit('menu:' + item.action.type, item.action)
      this.close();
    }

  }

  #handleCloseClick(items) {
    this.close()
  }

  open() {
    this.self.dataset.show = true;

  }

  close() {
    this.self.dataset.show = false;
  }

  toggle() {
    this.self.dataset.show = this.self.dataset.show === 'true' ? false : true;
  }


};