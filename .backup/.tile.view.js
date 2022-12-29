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
    this.setAddress(address)
    this.tileType = tileType

  }

  static create({ address, tileType }) {
    const t = new TileView(address, tileType)

    // if (row && column) {
    //   // t.setAddress([row, column])
    // };

    return t;
  }

  setAddress(newAddress = '') {
    if (!newAddress) return;

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


  get address() { return this.dataset.address }

  get row() { return +this.address.split(',')[0] || null };

  get column() { return +this.address.split(',')[1] || null };

  get tileType() { return this.#tileType };

  get dataset() { return this.#self.dataset };

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
    this.dataset.tileType = v
    this.#address = v
  };
}
