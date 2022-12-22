import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
// import { EventEmitter } from 'https://hamilsauce.github.io/event-emitter.js';
import { View } from '../view.js';

// const { template } = ham;


export class MapSection extends View {
  #items = new Map();
  #sectionName = null;

  constructor(sectionName, options) {
    super('map-section');
    
    this.#sectionName = sectionName;
    
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