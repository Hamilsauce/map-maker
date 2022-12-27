import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
import { EventEmitter } from 'https://hamilsauce.github.io/hamhelper/event-emitter.js';
const { template } = ham;

export class View extends EventEmitter {
  #self;
  #name;

  constructor(name) {
    super();

    if (!name) throw new Error('No name passed to constructor for ', this.constructor.name);

    this.#name = name;

    this.#self = View.#getTemplate(name);
  };

  get self() { return this.#self };

  get name() { return this.#name };

  static #getTemplate(name) {
    return template(name);
  }
};