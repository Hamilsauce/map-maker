import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
// import { View } from '../view.js';
import { MapSection, MapSectionNames } from './map-section.js';
// const { template } = ham;


export class MapSection extends MapSection {
  #tiles = new Map();
  #sectionName = null;

  constructor(options) {
    super(MapSectionNames.rowHeader);

    this.#sectionName = sectionName;

    if (options && options.tiles) {
      this.init(options.tiles);
    }

    this.closeButton.addEventListener('click', e => {
      this.close();
    });

    this.closeButton.addEventListener('menu:open', e => {
      this.open();
    });
  }

  get closeButton() { return this.selectDOM('#app-menu-close') };

  get tiles() { return this.selectDOM('#app-menu-tiles') };

  init(tiles) {
    this.tiles.innerHTML = ''
    this.close()
    this.tiles.append(...tiles.map(this.createItem.bind(this)))

    this.self.addEventListener('click', this.handleItemClick.bind(this));
  }

  createItem(config) {
    const itm = new MenuItem(config);
    this.#tiles.set(itm.dom, itm);
    return itm.dom;
  }

  handleItemClick(e) {
    const targ = e.target.closest('.app-menu-item');
    const item = this.#tiles.get(targ);

    if (item) {
      this.emit('menu:' + item.action.type, item.action)
      this.close();
    }

  }

  #handleCloseClick(tiles) {
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