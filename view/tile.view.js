import { View } from './view2.js';
export class TileView extends View {
  #address;
  #row;
  #column;
  #tileType;
  #selected

  constructor(address, tileType, options) {
    super('tile', options);

    if (tileType === 'header') this.textContent = address;
  }

  static create({ address, tileType }) {
    address = address.toString();
    address = address.includes(',') ? address.replace(',', '_') : address;
   
    const classList = tileType === 'header' ? ['tile', 'header'] : ['tile'];
   
   
    const options = {
      templateName: 'tile',
      elementProperties: {
        id: address,
        classList: [...classList],
        dataset: {
          address: address,//.includes(',') ? address.replace(',', '_') : v, //address.replace(',', '_'),
          address: address.includes(',') ? address.replace(',', '_') : address,
          selected: false,
          tileType
        },
      }
    };

    return new TileView(address, tileType, options);
  }

  setAddress(newAddress = '') {
    if (!newAddress && newAddress !== 0) return;

    newAddress = newAddress === 'string' || newAddress === 0 ? newAddress : newAddress.toString();

    this.setData('address', newAddress)

    this.textContent = this.isHeaderTile ? newAddress : '';

    return this;
  }

  setType(type = '') {
    if (!type) return;
    this.dataset.tileType = type
    console.log('this.dataset.tileType', this.dataset.tileType)

    // this.setData('tileType', type)

    return this;
  }

  setData(k, v) {
    if (!k) return;
    console.log('[k]: v', {
      [k]: v
    });
    Object.assign(
      this.dataset, {
      [k]: v.includes(',') ? v.replace(',', '_') : v,
      });

    return this;
  }

  render() {
    return this.self;
  }

  remove(callback) {
    if (callback) callback(this);

    this.setData('deleting', 'true')

    setTimeout(() => {
      this.self.remove();
    }, 100)

    return this.address;
  }

  get dom() { return this.self };

  get row() { return +this.address.split(',')[0] };

  get column() { return +this.address.split(',')[1] };

  get tileType() { return this.dataset.tileType };

  set tileType(v) {
    this.dataset.tileType = v
    this.#tileType = v;
  };

  set selected(v) {
    this.dataset.selected = v
    this.#selected = v;
  };

  get selected() {
    return this.dataset.selected === 'true' ? 'true' : false
  };

  get isHeaderTile() {
    return this.tileType === 'header';
  };

  get address() { return this.dataset.address }
}