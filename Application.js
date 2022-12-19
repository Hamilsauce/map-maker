import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
import { EventEmitter } from 'https://hamilsauce.github.io/event-emitter.js';
const { template } = ham;

export class Application extends EventEmitter {
  #self;
  
  constructor(name) {
    super();
    
    if (!name) throw new Error('No name passed to constructor for ', this.constructor.name);
   
    this.#self = template(name);
  }
  
  
  get self() { return this.#self };
};
