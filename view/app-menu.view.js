import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
import { EventEmitter } from 'https://hamilsauce.github.io/event-emitter.js';
import { View } from './view.js';

const { template } = ham;

export class Action {
  #type = String;
  #payload = Object;

  constructor(type, payload) {
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
      name: 'save-file',
      title: 'Save',
      path: null,
      action: new Action('save-file'),
    },
    {
      name: 'load-file',
      title: 'Load',
      path: null,
      action: new Action('load-file'),
    },
  ]
}

export class MenuItem {
  #name = String;
  #title = String;
  #path = String;
  #action = Action;

  constructor({ name, title, path, action }) {
    this.#name = name;
    this.#title = title;
    this.#path = path;
    this.#action = action;
  }


  get prop() { return this.#prop };
  set prop(v) { this.#prop = v };
}

export class AppMenu extends View {
  #items;

  constructor(options) {
    super('app-menu');

    if (options && options.items) {
      this.init(options.items);
    }
  }

  init(items) {

  }

};
