export class TileView {
  #address;
  #row;
  #column;
  #tileType;
  #selected
  #self

  constructor(address, tileType) {
    this.#self = document.createElement('div');
    this.#self.classList.add('tile');
    this.address = address
    this.setAddress(address)
    this.tileType = tileType

    // console.log('this', this)
  }

  static create({ address, tileType }) {
    const t = new TileView(address, tileType)

    return t;
  }

  setAddress(newAddress = '') {
    if (!newAddress) return;
    this.address = newAddress === 'string' ? newAddress : newAddress.toString();
    this.setData('address', newAddress === 'string' ? newAddress : newAddress.toString())

    return this;
  }

  setData(k, v) {
    if (!k) return;

    Object.assign(this.dataset, {
      [k]: v
    });

    return this;
  }

  render() {
    return this.#self;
  }

  remove(callback) {
    if (callback) callback(this);

    this.setData('deleting', 'true')
   
    setTimeout(() => {
      this.#self.remove();
    }, 100)

    return this.address;
  }

  get address() { return this.dataset.address }

  get row() { return +this.address.split(',')[0] };

  get column() { return +this.address.split(',')[1] };

  get tileType() { return this.#tileType };

  get dataset() { return this.#self.dataset };

  get dom() { return this.#self };

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

  set address(v) {
    this.#address = v
    this.dataset.address = v;
  };
}
